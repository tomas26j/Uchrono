// Parser simple para DATA-CRUDA-STOCKS_clean.csv
// Permite consultar precios anuales por símbolo y año

const RAW_CSV_PATH = '/DATA-CRUDA-STOCKS_clean.csv';

// Mapeo de nombres amigables a símbolos
const SYMBOL_MAP = {
  'Apple': 'AAPL',
  'Amazon': 'AMZN',
  'Microsoft': 'MSFT',
  'Alphabet': 'GOOGL',
  'Meta Platforms': 'META',
  'Netflix': 'NFLX',
  'JPMorgan Chase': 'JPM',
  'Berkshire Hathaway': 'BRK.A',
  'Oracle': 'ORCL',
};

let stockData = null;

async function loadStockBackup() {
  if (stockData) return stockData;
  console.log('🔍 Cargando archivo CSV de respaldo...');
  const res = await fetch(RAW_CSV_PATH);
  const text = await res.text();
  console.log('📄 Archivo CSV cargado, longitud:', text.length);
  stockData = parseCSV(text);
  console.log('📊 Datos parseados:', Object.keys(stockData));
  return stockData;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  let currentSymbol = null;
  const data = {};
  console.log('🔍 Parseando', lines.length, 'líneas...');
  console.log('🔍 Primeras 5 líneas:', lines.slice(0, 5));
  
  for (let line of lines) {
    if (line.startsWith('#')) {
      // Ejemplo: # Apple Historical Annual Stock Price Data
      console.log('🔍 Línea con #:', line);
      const match = line.match(/# (.+) Historical/);
      console.log('🔍 Match result:', match);
      if (match) {
        currentSymbol = SYMBOL_MAP[match[1].trim()];
        console.log('📈 Encontrado símbolo:', match[1].trim(), '->', currentSymbol);
        if (currentSymbol) data[currentSymbol] = [];
      }
      continue;
    }
    if (!currentSymbol || line.startsWith('Year') || !line.trim()) continue;
    const [year, avg, open, high, low, close, change] = line.split(',');
    data[currentSymbol].push({
      year: parseInt(year),
      average: parseFloat(avg),
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      change: change
    });
  }
  console.log('✅ Datos finales:', data);
  return data;
}

/**
 * Consulta precios anuales de respaldo para un símbolo y rango de años
 * @param {string} symbol - Ej: 'AAPL'
 * @param {number} startYear
 * @param {number} endYear
 * @returns {Promise<Array<{date: string, price: number, volume: null}>>}
 */
export async function getStockBackupHistory(symbol, startYear, endYear) {
  const data = await loadStockBackup();
  if (!data[symbol]) return [];
  return data[symbol]
    .filter(row => row.year >= startYear && row.year <= endYear)
    .map(row => ({
      date: `${row.year}-12-31`,
      price: row.close,
      volume: null
    }));
} 