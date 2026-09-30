/**
 * Métricas de riesgo calculadas sobre la serie de precios real.
 *
 * Antes estos valores salían de `Math.random()`. Mostrar un Sharpe Ratio
 * inventado en una herramienta que la gente usa para entender inversiones es
 * peor que no mostrarlo: parece análisis y no lo es. Con las series reales ya
 * no hace falta.
 */

/** Sesiones bursátiles por año. Para cripto el año tiene 365, ver `periodsPerYear`. */
const TRADING_DAYS = 252;
const CALENDAR_DAYS = 365;

/**
 * Caída máxima desde un pico previo, en porcentaje positivo.
 * Un 62 significa que quien compró en el peor momento llegó a ver su posición
 * valer un 62% menos antes de recuperarse.
 *
 * @param {Array<{price: number}>} points
 * @returns {number|null}
 */
export function maxDrawdown(points) {
  if (!Array.isArray(points) || points.length < 2) return null;

  let peak = -Infinity;
  let worst = 0;

  for (const { price } of points) {
    if (!Number.isFinite(price) || price <= 0) continue;
    if (price > peak) peak = price;
    if (peak > 0) {
      const drop = (peak - price) / peak;
      if (drop > worst) worst = drop;
    }
  }
  return worst * 100;
}

/**
 * Sharpe ratio anualizado sobre retornos diarios.
 *
 * Simplificación deliberada: se asume tasa libre de riesgo 0 salvo que se pase
 * otra. Es la convención habitual en herramientas divulgativas, y el número
 * sirve para comparar activos entre sí, que es para lo que Uchrono lo usa.
 *
 * @param {Array<{price: number}>} points
 * @param {{riskFreeRate?: number, periodsPerYear?: number}} [options]
 * @returns {number|null} null si no hay datos suficientes o la volatilidad es 0
 */
export function sharpeRatio(points, { riskFreeRate = 0, periodsPerYear = TRADING_DAYS } = {}) {
  if (!Array.isArray(points) || points.length < 3) return null;

  const returns = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].price;
    const curr = points[i].price;
    if (!Number.isFinite(prev) || !Number.isFinite(curr) || prev <= 0) continue;
    returns.push(curr / prev - 1);
  }
  if (returns.length < 2) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  // Varianza muestral (n-1): la serie es una muestra, no la población entera.
  const variance = returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return null;

  const dailyRiskFree = riskFreeRate / periodsPerYear;
  return ((mean - dailyRiskFree) / stdDev) * Math.sqrt(periodsPerYear);
}

/** Volatilidad anualizada en porcentaje. */
export function annualizedVolatility(points, { periodsPerYear = TRADING_DAYS } = {}) {
  if (!Array.isArray(points) || points.length < 3) return null;

  const returns = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].price;
    const curr = points[i].price;
    if (!Number.isFinite(prev) || !Number.isFinite(curr) || prev <= 0) continue;
    returns.push(curr / prev - 1);
  }
  if (returns.length < 2) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(periodsPerYear) * 100;
}

/**
 * Las cripto cotizan los 365 días; las acciones, 252 sesiones al año. Usar el
 * número equivocado desvía la anualización casi un 20%.
 */
export function periodsPerYearFor(category) {
  return category === "crypto" ? CALENDAR_DAYS : TRADING_DAYS;
}

/** Las tres métricas de una, con la convención correcta según el activo. */
export function riskMetrics(points, category) {
  const periodsPerYear = periodsPerYearFor(category);
  return {
    maxDrawdown: maxDrawdown(points),
    sharpeRatio: sharpeRatio(points, { periodsPerYear }),
    volatility: annualizedVolatility(points, { periodsPerYear }),
  };
}
