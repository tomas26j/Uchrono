#!/usr/bin/env node
/**
 * Descarga las series históricas de los activos de Uchrono y las deja como
 * JSON estáticos en public/data/.
 *
 * Diseño:
 * - Corre en build / CI, NUNCA en el navegador. No hay API keys en el cliente.
 * - Cada activo declara una cadena de fuentes. Se usa la primera que responda
 *   con datos; si todas fallan, el JSON que ya estaba queda intacto.
 * - Los datos nuevos se MERGEAN sobre los viejos (upsert por fecha), así un
 *   punto que una fuente dejó de servir no se pierde nunca.
 * - Todos los precios son nominales en USD. No se mezclan series ajustadas por
 *   inflación con nominales: eso producía cálculos incoherentes.
 *
 * Uso:
 *   node scripts/fetch-market-data.mjs
 *   node scripts/fetch-market-data.mjs --only bitcoin,tesla
 *   node scripts/fetch-market-data.mjs --dry-run
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "public", "data");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Uchrono/1.0";
/**
 * Fecha más antigua que pedimos. Va bien atrás a propósito: algunos escenarios
 * curados arrancan en 1997 (Amazon) y 2010 (Bitcoin). Cada fuente devuelve lo
 * que tenga; pedir de más no cuesta nada.
 */
const HISTORY_START = "1990-01-01";
/** Pausa entre llamadas, para no castigar a fuentes que nos dan datos gratis. */
const THROTTLE_MS = 1200;

// ---------------------------------------------------------------- fuentes

/** Yahoo Finance chart. Sin key. Cubre acciones, cripto, futuros e índices. */
async function fromYahoo(symbol, { adjusted = false } = {}) {
  const p1 = Math.floor(new Date(HISTORY_START).getTime() / 1000);
  const p2 = Math.floor(Date.now() / 1000);
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?period1=${p1}&period2=${p2}&interval=1d`;

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
  const json = await res.json();

  const result = json?.chart?.result?.[0];
  if (!result?.timestamp) throw new Error("Yahoo: respuesta sin timestamps");

  // adjclose corrige splits y dividendos: obligatorio para acciones, si no un
  // split de Tesla o NVIDIA falsea por completo el retorno calculado.
  const series =
    (adjusted && result.indicators?.adjclose?.[0]?.adjclose) ||
    result.indicators?.quote?.[0]?.close;
  if (!series) throw new Error("Yahoo: respuesta sin precios");

  const out = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const price = series[i];
    if (price === null || price === undefined || !Number.isFinite(price)) continue;
    out.push([toISODate(result.timestamp[i] * 1000), round(price)]);
  }
  return out;
}

/** Binance klines. Sin key. Solo cripto, y su historia arranca en 2017. */
async function fromBinance(symbol) {
  const out = [];
  let startTime = new Date(HISTORY_START).getTime();
  const now = Date.now();

  // La API devuelve como mucho 1000 velas por llamada: paginamos.
  for (let guard = 0; guard < 20; guard++) {
    const url =
      `https://api.binance.com/api/v3/klines?symbol=${symbol}` +
      `&interval=1d&startTime=${startTime}&limit=1000`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const r of rows) out.push([toISODate(r[0]), round(parseFloat(r[4]))]);

    const last = rows[rows.length - 1][0];
    if (rows.length < 1000 || last >= now) break;
    startTime = last + 86_400_000;
    await sleep(300);
  }
  if (out.length === 0) throw new Error("Binance: sin datos");
  return out;
}

/**
 * Blockchain.com. Sin key. Solo Bitcoin, pero es la única fuente gratuita que
 * llega a 2010: se usa para extender hacia atrás el tramo que Yahoo no cubre
 * (Yahoo arranca en 2014-09-17).
 *
 * Los primeros meses vienen con precio 0 porque todavía no había mercado; se
 * descartan, porque un 0 en el precio de compra rompe el cálculo entero.
 */
async function fromBlockchainInfo() {
  const url = "https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=false";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Blockchain.info HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.values)) throw new Error("Blockchain.info: respuesta inesperada");

  const out = [];
  for (const { x, y } of json.values) {
    if (!Number.isFinite(y) || y <= 0) continue;
    out.push([toISODate(x * 1000), round(y)]);
  }
  if (out.length === 0) throw new Error("Blockchain.info: sin datos");
  return out;
}

/** FRED, descarga CSV sin key. Series macro del St. Louis Fed. */
async function fromFred(seriesId) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);
  const text = await res.text();
  if (text.trimStart().startsWith("<")) throw new Error("FRED: devolvió HTML, no CSV");

  const out = [];
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const [date, raw] = line.split(",");
    const price = parseFloat(raw);
    // FRED marca los feriados con "." — no son ceros, son ausencias.
    if (!Number.isFinite(price)) continue;
    out.push([date.trim(), round(price)]);
  }
  if (out.length === 0) throw new Error("FRED: sin datos");
  return out;
}

// ---------------------------------------------------------------- catálogo

/**
 * Los `id` coinciden con ASSETS de src/data/mockData.js.
 * `sources` está en orden de preferencia: la primera que responda, gana.
 */
const CATALOG = [
  // Cripto: Yahoo llega a 2014, Binance solo a 2017, pero sirve de respaldo.
  // Bitcoin además se extiende hacia atrás hasta 2010 con Blockchain.com.
  { id: "bitcoin",  symbol: "BTC",  name: "Bitcoin",  category: "crypto",
    sources: [["yahoo", "BTC-USD"], ["binance", "BTCUSDT"]],
    extend: [["blockchain", "BTC"]] },
  { id: "ethereum", symbol: "ETH",  name: "Ethereum", category: "crypto",
    sources: [["yahoo", "ETH-USD"], ["binance", "ETHUSDT"]] },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", category: "crypto",
    sources: [["yahoo", "DOGE-USD"], ["binance", "DOGEUSDT"]] },

  // Acciones: adjclose obligatorio. Sin segunda fuente gratuita sin key, así
  // que el respaldo real es el JSON ya versionado en el repo.
  { id: "tesla",     symbol: "TSLA",  name: "Tesla",     category: "stock", adjusted: true, sources: [["yahoo", "TSLA"]] },
  { id: "nvidia",    symbol: "NVDA",  name: "NVIDIA",    category: "stock", adjusted: true, sources: [["yahoo", "NVDA"]] },
  { id: "apple",     symbol: "AAPL",  name: "Apple",     category: "stock", adjusted: true, sources: [["yahoo", "AAPL"]] },
  { id: "amazon",    symbol: "AMZN",  name: "Amazon",    category: "stock", adjusted: true, sources: [["yahoo", "AMZN"]] },
  { id: "google",    symbol: "GOOGL", name: "Google",    category: "stock", adjusted: true, sources: [["yahoo", "GOOGL"]] },
  { id: "microsoft", symbol: "MSFT",  name: "Microsoft", category: "stock", adjusted: true, sources: [["yahoo", "MSFT"]] },
  { id: "netflix",   symbol: "NFLX",  name: "Netflix",   category: "stock", adjusted: true, sources: [["yahoo", "NFLX"]] },

  // Oro: futuro COMEX. Precio nominal, no ajustado por inflación.
  { id: "gold", symbol: "GOLD", name: "Gold", category: "commodity",
    sources: [["yahoo", "GC=F"]] },

  // S&P 500: el índice. FRED de respaldo, aunque solo guarda 10 años.
  { id: "sp500", symbol: "SPY", name: "S&P 500", category: "index",
    sources: [["yahoo", "^GSPC"], ["fred", "SP500"]] },
];

const FETCHERS = {
  yahoo: (sym, asset) => fromYahoo(sym, { adjusted: asset.adjusted }),
  binance: (sym) => fromBinance(sym),
  fred: (sym) => fromFred(sym),
  blockchain: () => fromBlockchainInfo(),
};

/**
 * Permite desactivar fuentes para probar la cadena de respaldo sin esperar a
 * que una se caiga de verdad:  UCHRONO_SKIP_SOURCES=yahoo node scripts/...
 */
const SKIPPED = new Set(
  (process.env.UCHRONO_SKIP_SOURCES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

// ---------------------------------------------------------------- utilidades

const toISODate = (ms) => new Date(ms).toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Seis cifras significativas: suficiente para DOGE a 0.0021 y para BTC a 83622. */
function round(n) {
  if (!Number.isFinite(n)) return n;
  return parseFloat(n.toPrecision(6));
}

/** Upsert por fecha: lo nuevo pisa a lo viejo, lo viejo que no vino se conserva. */
function mergePrices(previous, incoming) {
  const map = new Map(previous);
  for (const [date, price] of incoming) map.set(date, price);
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

/**
 * Merge "por debajo": solo agrega fechas que no estaban. Sirve para extender la
 * serie hacia atrás con una fuente secundaria sin degradar el tramo que ya
 * cubre la fuente principal, que es la de mejor calidad.
 */
function mergeUnder(base, extension) {
  const map = new Map(extension);
  for (const [date, price] of base) map.set(date, price);
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

async function readExisting(id) {
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- main

async function updateAsset(asset, { dryRun }) {
  const existing = await readExisting(asset.id);
  const previous = existing?.prices ?? [];

  let incoming = null;
  let usedSource = null;
  const failures = [];

  for (const [kind, symbol] of asset.sources) {
    if (SKIPPED.has(kind)) {
      failures.push(`${kind}: desactivada por UCHRONO_SKIP_SOURCES`);
      continue;
    }
    try {
      const rows = await FETCHERS[kind](symbol, asset);
      if (rows.length > 0) {
        incoming = rows;
        usedSource = `${kind}:${symbol}`;
        break;
      }
      failures.push(`${kind}: vacío`);
    } catch (err) {
      failures.push(`${kind}: ${err.message}`);
    }
  }

  if (!incoming) {
    // Ninguna fuente respondió. El JSON anterior queda como está: es
    // exactamente para esto que lo versionamos.
    console.log(
      `  ${asset.id.padEnd(10)} SIN DATOS  (${failures.join(" | ")})` +
        (previous.length ? `  → conservo ${previous.length} puntos previos` : "  → sin respaldo")
    );
    return { id: asset.id, ok: false, failures, points: previous.length };
  }

  // Fuentes de extensión: rellenan el tramo antiguo que la principal no cubre.
  const extendedFrom = [];
  for (const [kind, symbol] of asset.extend ?? []) {
    if (SKIPPED.has(kind)) continue;
    try {
      const rows = await FETCHERS[kind](symbol, asset);
      const before = incoming.length;
      incoming = mergeUnder(incoming, rows);
      if (incoming.length > before) extendedFrom.push(`${kind}:+${incoming.length - before}`);
      await sleep(400);
    } catch (err) {
      failures.push(`${kind} (extensión): ${err.message}`);
    }
  }

  const merged = mergePrices(previous, incoming);
  const added = merged.length - previous.length;

  const payload = {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    category: asset.category,
    currency: "USD",
    adjusted: Boolean(asset.adjusted),
    source: usedSource,
    extendedFrom,
    fallbacksTried: failures,
    updatedAt: new Date().toISOString(),
    firstDate: merged[0][0],
    lastDate: merged[merged.length - 1][0],
    points: merged.length,
    prices: merged,
  };

  if (!dryRun) {
    await writeFile(
      path.join(DATA_DIR, `${asset.id}.json`),
      JSON.stringify(payload),
      "utf8"
    );
  }

  console.log(
    `  ${asset.id.padEnd(10)} ${usedSource.padEnd(18)} ` +
      `${String(merged.length).padStart(5)} pts  ` +
      `${merged[0][0]} → ${merged[merged.length - 1][0]}  ` +
      (added > 0 ? `(+${added})` : "(sin nuevos)") +
      (extendedFrom.length ? `  [${extendedFrom.join(", ")}]` : "")
  );

  return { id: asset.id, ok: true, source: usedSource, ...payload };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyArg = args.find((a) => a.startsWith("--only"));
  const only = onlyArg
    ? (onlyArg.includes("=") ? onlyArg.split("=")[1] : args[args.indexOf(onlyArg) + 1] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const targets = only ? CATALOG.filter((a) => only.includes(a.id)) : CATALOG;
  if (targets.length === 0) {
    console.error("Ningún activo coincide con --only. Ids válidos:", CATALOG.map((a) => a.id).join(", "));
    process.exit(1);
  }

  await mkdir(DATA_DIR, { recursive: true });
  console.log(`Actualizando ${targets.length} activo(s)${dryRun ? " (dry-run)" : ""}:\n`);

  const results = [];
  for (const asset of targets) {
    results.push(await updateAsset(asset, { dryRun }));
    await sleep(THROTTLE_MS);
  }

  const ok = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  // El manifest es lo que lee el cliente para saber qué hay y de cuándo es.
  if (!dryRun && !only) {
    const manifest = {
      updatedAt: new Date().toISOString(),
      assets: ok.map((r) => ({
        id: r.id,
        symbol: r.symbol,
        name: r.name,
        category: r.category,
        source: r.source,
        adjusted: r.adjusted,
        firstDate: r.firstDate,
        lastDate: r.lastDate,
        points: r.points,
      })),
      failed: failed.map((r) => ({ id: r.id, failures: r.failures })),
    };
    await writeFile(path.join(DATA_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  }

  console.log(`\n${ok.length} actualizado(s), ${failed.length} sin datos.`);

  // Que falle una fuente no debe romper el build: los JSON previos siguen
  // sirviendo. Solo salimos con error si no se pudo actualizar NADA.
  if (ok.length === 0) {
    console.error("Ninguna fuente respondió. Revisar conectividad o endpoints.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
