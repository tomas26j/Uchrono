/**
 * Capa de datos de mercado de Uchrono.
 *
 * Los precios salen de JSON estáticos en /data/, generados por
 * scripts/fetch-market-data.mjs y versionados en el repo. El navegador NO
 * llama a ninguna API externa: no hay keys que exponer, no hay rate limits que
 * agotar, y la primera carga es un solo fetch a un archivo que Netlify sirve
 * comprimido desde su CDN.
 *
 * Los datos se refrescan una vez por día en CI. Para una calculadora
 * contrafáctica el cierre del día anterior alcanza de sobra; el punto del día
 * en curso existe pero es intradía y se corrige solo en la próxima corrida.
 */

const DATA_BASE = "/data";

/** Cache por sesión de pestaña: evita re-parsear el JSON al cambiar de activo. */
const memoryCache = new Map();
let manifestPromise = null;

/** Error con causa identificable, para que la UI pueda decir qué pasó. */
export class MarketDataError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "MarketDataError";
    this.code = code;
  }
}

/** Índice de lo disponible: qué activos hay, de qué fuente y hasta qué fecha. */
export function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(`${DATA_BASE}/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new MarketDataError("MANIFEST_UNAVAILABLE", "No se pudo leer el índice de datos.");
        return res.json();
      })
      .catch((err) => {
        manifestPromise = null; // que un fallo de red no quede cacheado
        throw err;
      });
  }
  return manifestPromise;
}

/**
 * Acepta el id ('bitcoin') o el símbolo ('BTC'), porque los componentes usan
 * `asset.symbol || asset.id` indistintamente.
 */
async function resolveAssetId(idOrSymbol) {
  if (!idOrSymbol) throw new MarketDataError("NO_ASSET", "No se indicó un activo.");
  const key = String(idOrSymbol);

  const manifest = await loadManifest();
  const hit =
    manifest.assets.find((a) => a.id === key) ||
    manifest.assets.find((a) => a.symbol.toUpperCase() === key.toUpperCase());

  if (!hit) {
    throw new MarketDataError("UNKNOWN_ASSET", `No hay datos para "${key}".`);
  }
  return hit.id;
}

/**
 * Serie completa de un activo. `prices` viene como pares [fecha, precio]
 * ordenados, que es la forma más compacta de guardar 4000 puntos.
 */
export async function loadAssetSeries(idOrSymbol) {
  const id = await resolveAssetId(idOrSymbol);
  if (memoryCache.has(id)) return memoryCache.get(id);

  const promise = fetch(`${DATA_BASE}/${id}.json`)
    .then((res) => {
      if (!res.ok) throw new MarketDataError("SERIES_UNAVAILABLE", `No se pudo cargar la serie de ${id}.`);
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data.prices) || data.prices.length === 0) {
        throw new MarketDataError("EMPTY_SERIES", `La serie de ${id} está vacía.`);
      }
      return data;
    })
    .catch((err) => {
      memoryCache.delete(id);
      throw err;
    });

  memoryCache.set(id, promise);
  return promise;
}

/**
 * Último precio conocido en la fecha pedida o antes.
 *
 * Los mercados cierran fines de semana y feriados, y las cripto tienen huecos
 * ocasionales. Pedir "el 2020-03-21" (sábado) tiene que devolver el cierre del
 * viernes, no fallar ni saltar al primer dato de la serie — que es justamente
 * el bug que tenía la versión anterior.
 */
export function priceOnOrBefore(prices, targetDate) {
  let lo = 0;
  let hi = prices.length - 1;
  let found = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (prices[mid][0] <= targetDate) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (found === -1) return null;
  return { date: prices[found][0], price: prices[found][1], exact: prices[found][0] === targetDate };
}

/**
 * Precio de un activo en una fecha.
 * @returns {Promise<{date: string, price: number, exact: boolean}>}
 */
export async function getPriceAt(idOrSymbol, date) {
  const series = await loadAssetSeries(idOrSymbol);
  const hit = priceOnOrBefore(series.prices, date);

  if (!hit) {
    throw new MarketDataError(
      "BEFORE_HISTORY",
      `No hay datos de ${series.name} anteriores al ${series.firstDate}.`
    );
  }
  return hit;
}

/**
 * Serie de un activo acotada a un rango, en la forma que consumen los
 * componentes y los gráficos: [{ date, price, volume }].
 *
 * Siempre incluye un punto para la fecha inicial y otro para la final, usando
 * el último cierre conocido cuando esas fechas caen en día no hábil.
 */
export async function fetchPriceHistory(idOrSymbol, startDate, endDate) {
  const series = await loadAssetSeries(idOrSymbol);

  const start = priceOnOrBefore(series.prices, startDate);
  const end = priceOnOrBefore(series.prices, endDate);

  if (!start) {
    throw new MarketDataError(
      "BEFORE_HISTORY",
      `${series.name} no tiene datos anteriores al ${series.firstDate}. Probá con una fecha posterior.`
    );
  }
  if (!end) {
    throw new MarketDataError("NO_END_PRICE", `No hay precio de ${series.name} para el ${endDate}.`);
  }

  const within = series.prices
    .filter(([d]) => d >= start.date && d <= end.date)
    .map(([date, price]) => ({ date, price, volume: null }));

  return {
    points: within,
    buy: start,
    sell: end,
    meta: {
      id: series.id,
      symbol: series.symbol,
      name: series.name,
      source: series.source,
      adjusted: series.adjusted,
      updatedAt: series.updatedAt,
      firstDate: series.firstDate,
      lastDate: series.lastDate,
    },
  };
}

/** Días transcurridos desde la última actualización de los datos. */
export function stalenessInDays(updatedAt) {
  if (!updatedAt) return null;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return Math.floor(diff / 86_400_000);
}
