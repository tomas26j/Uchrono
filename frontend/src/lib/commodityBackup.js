// Parser para datos de commodities (Oro y S&P 500)
// Formato: YYYY-MM-DD, precio

const GOLD_CSV_PATH = '/GOLD-DATA.csv';
const SP500_CSV_PATH = '/S&P500-DATA.csv';

let goldData = null;
let sp500Data = null;

async function loadGoldData() {
  if (goldData) return goldData;
  console.log('🔍 Cargando datos de Oro...');
  const res = await fetch(GOLD_CSV_PATH);
  const text = await res.text();
  goldData = parseCommodityCSV(text);
  console.log('📊 Datos de Oro cargados:', goldData.length, 'registros');
  return goldData;
}

async function loadSP500Data() {
  if (sp500Data) return sp500Data;
  console.log('🔍 Cargando datos de S&P 500...');
  const res = await fetch(SP500_CSV_PATH);
  const text = await res.text();
  sp500Data = parseCommodityCSV(text);
  console.log('📊 Datos de S&P 500 cargados:', sp500Data.length, 'registros');
  return sp500Data;
}

function parseCommodityCSV(text) {
  const lines = text.split(/\r?\n/);
  const data = [];
  
  for (let line of lines) {
    if (line.startsWith('#') || line.startsWith('Year') || !line.trim()) continue;
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
 * Obtiene datos de commodities (Oro o S&P 500) para un rango de fechas
 * @param {string} symbol - 'GOLD' o 'SPY'
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<Array<{date: string, price: number, volume: null}>>}
 */
export async function getCommodityHistory(symbol, startDate, endDate) {
  let data;
  if (symbol === 'GOLD') {
    data = await loadGoldData();
  } else if (symbol === 'SPY') {
    data = await loadSP500Data();
  } else {
    return [];
  }
  
  return data.filter(item => item.date >= startDate && item.date <= endDate);
} 