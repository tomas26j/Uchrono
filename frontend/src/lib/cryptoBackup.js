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