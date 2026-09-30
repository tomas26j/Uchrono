#!/usr/bin/env node
/**
 * Control de calidad de las series antes de commitearlas.
 *
 * La idea es que un dato roto nunca llegue a producción sin que alguien se
 * entere. Falla el proceso ante problemas estructurales (serie vacía, precios
 * no positivos, fechas desordenadas o duplicadas, datos viejos) y solo avisa
 * ante cosas que pueden ser legítimas, como un salto diario grande: en cripto
 * un -40% pasa, en una acción suele significar un split mal ajustado.
 *
 * Uso: node scripts/verify-market-data.mjs
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "data");

/** Días sin actualizar tolerados. El job corre a diario; 7 da margen de sobra. */
const MAX_STALE_DAYS = 7;
/** Salto diario a partir del cual conviene mirar. Cripto es legítimamente más volátil. */
const JUMP_ALERT = { crypto: 0.5, default: 0.35 };

const errors = [];
const warnings = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

async function verifyAsset(file) {
  const raw = await readFile(path.join(DATA_DIR, file), "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    errors.push(`${file}: JSON inválido (${err.message})`);
    return null;
  }

  const id = data.id ?? file;
  const prices = data.prices;

  check(Array.isArray(prices) && prices.length > 0, `${id}: serie vacía`);
  if (!Array.isArray(prices) || prices.length === 0) return null;

  check(typeof data.symbol === "string" && data.symbol.length > 0, `${id}: falta symbol`);
  check(typeof data.source === "string" && data.source.length > 0, `${id}: falta source`);

  let prevDate = "";
  let prevPrice = null;
  let duplicates = 0;
  let disordered = 0;
  let nonPositive = 0;
  const jumps = [];
  const threshold = JUMP_ALERT[data.category] ?? JUMP_ALERT.default;

  for (const [date, price] of prices) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`${id}: fecha con formato inválido "${date}"`);
      break;
    }
    if (date === prevDate) duplicates++;
    else if (date < prevDate) disordered++;

    if (!Number.isFinite(price) || price <= 0) {
      nonPositive++;
    } else if (prevPrice !== null && prevPrice > 0) {
      const change = Math.abs(price / prevPrice - 1);
      if (change > threshold) jumps.push({ date, change, from: prevPrice, to: price });
    }

    prevDate = date;
    if (Number.isFinite(price) && price > 0) prevPrice = price;
  }

  check(duplicates === 0, `${id}: ${duplicates} fecha(s) duplicada(s)`);
  check(disordered === 0, `${id}: ${disordered} fecha(s) fuera de orden`);
  check(nonPositive === 0, `${id}: ${nonPositive} precio(s) no positivo(s) o inválido(s)`);

  // Coherencia entre los metadatos y la serie real.
  check(data.firstDate === prices[0][0], `${id}: firstDate no coincide con el primer punto`);
  check(
    data.lastDate === prices[prices.length - 1][0],
    `${id}: lastDate no coincide con el último punto`
  );
  check(data.points === prices.length, `${id}: points dice ${data.points}, hay ${prices.length}`);

  const staleDays = Math.floor((Date.now() - new Date(data.lastDate).getTime()) / 86_400_000);
  if (staleDays > MAX_STALE_DAYS) {
    errors.push(`${id}: último dato del ${data.lastDate}, hace ${staleDays} días`);
  }

  if (jumps.length > 0) {
    const worst = jumps.sort((a, b) => b.change - a.change).slice(0, 3);
    warnings.push(
      `${id}: ${jumps.length} salto(s) diario(s) sobre ${(threshold * 100).toFixed(0)}% — ` +
        worst
          .map((j) => `${j.date} ${(j.change * 100).toFixed(0)}% (${j.from} → ${j.to})`)
          .join(", ")
    );
  }

  return { id, points: prices.length, lastDate: data.lastDate, staleDays };
}

async function main() {
  const files = (await readdir(DATA_DIR)).filter(
    (f) => f.endsWith(".json") && f !== "manifest.json"
  );

  if (files.length === 0) {
    console.error("No hay series en public/data. ¿Corriste fetch-market-data.mjs?");
    process.exit(1);
  }

  console.log(`Verificando ${files.length} serie(s):\n`);
  const summaries = [];
  for (const file of files) {
    const summary = await verifyAsset(file);
    if (summary) summaries.push(summary);
  }

  // El manifest tiene que describir exactamente lo que hay en disco.
  try {
    const manifest = JSON.parse(await readFile(path.join(DATA_DIR, "manifest.json"), "utf8"));
    const listed = new Set(manifest.assets.map((a) => a.id));
    const onDisk = new Set(summaries.map((s) => s.id));
    for (const id of onDisk) {
      if (!listed.has(id)) warnings.push(`manifest: falta "${id}", que sí está en disco`);
    }
    for (const id of listed) {
      if (!onDisk.has(id)) errors.push(`manifest: lista "${id}", pero no hay archivo`);
    }
  } catch {
    errors.push("manifest.json ausente o ilegible");
  }

  for (const s of summaries) {
    console.log(
      `  ${s.id.padEnd(10)} ${String(s.points).padStart(5)} pts  hasta ${s.lastDate}` +
        (s.staleDays > 1 ? `  (${s.staleDays}d)` : "")
    );
  }

  if (warnings.length) {
    console.log("\nAdvertencias:");
    for (const w of warnings) console.log(`  · ${w}`);
  }

  if (errors.length) {
    console.log("\nErrores:");
    for (const e of errors) console.log(`  ✗ ${e}`);
    console.error(`\n${errors.length} problema(s). No se commitean datos rotos.`);
    process.exit(1);
  }

  console.log(`\nTodo en orden${warnings.length ? ` (${warnings.length} advertencia/s)` : ""}.`);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
