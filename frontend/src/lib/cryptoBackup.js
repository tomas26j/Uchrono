// Parser para datos de criptomonedas desde CSV
// Formato: Date,Price

const CRYPTO_CSV_PATHS = {
  BTC: '/Bitcoin-Data.csv',
  ETH: '/Ethereum-Data.csv',
  DOGE: '/Dogecoin-Data.csv',
};

const cache = {};

async function loadCryptoData(symbol) {
  if (cache[symbol]) return cache[symbol];
  const path = CRYPTO_CSV_PATHS[symbol];
  if (!path) return [];
  const res = await fetch(path);
  const text = await res.text();
  const data = parseCryptoCSV(text);
  cache[symbol] = data;
  return data;
}

function parseCryptoCSV(text) {
  const lines = text.split(/\r?\n/);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const [date, price] = line.split(',');
    if (date && price) {
      data.push({
        date: date.trim(),
        price: parseFloat(price.trim()),
        volume: null
      });
    }
  }
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Obtiene datos históricos de una criptomoneda desde CSV
 * @param {string} symbol - 'BTC', 'ETH', 'DOGE'
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<Array<{date: string, price: number, volume: null}>>}
 */
export async function getCryptoHistory(symbol, startDate, endDate) {
  const data = await loadCryptoData(symbol);
  return data.filter(item => item.date >= startDate && item.date <= endDate);
}

/**
 * Obtiene datos históricos de una criptomoneda desde CoinGecko
 * @param {string} symbol - 'BTC', 'ETH', 'DOGE'
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<Array<{date: string, price: number, volume: null}>>}
 */
export async function getCryptoHistoryCoinGecko(symbol, startDate, endDate) {
  // Mapeo de símbolos a IDs de CoinGecko
  const idMap = { BTC: 'bitcoin', ETH: 'ethereum', DOGE: 'dogecoin' };
  const id = idMap[symbol];
  if (!id) return [];
  // CoinGecko solo permite rangos de fechas en timestamp (segundos)
  const from = Math.floor(new Date(startDate).getTime() / 1000);
  const to = Math.floor(new Date(endDate).getTime() / 1000);
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.prices) return [];
    // CoinGecko devuelve precios como [timestamp, price]
    // Agrupar por día y tomar el último precio de cada día
    const dayMap = {};
    data.prices.forEach(([ts, price]) => {
      const date = new Date(ts).toISOString().split('T')[0];
      dayMap[date] = price;
    });
    return Object.entries(dayMap)
      .filter(([date]) => date >= startDate && date <= endDate)
      .map(([date, price]) => ({ date, price: parseFloat(price), volume: null }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.warn('CoinGecko API error:', e);
    return [];
  }
} 