// Servicio para consultar precios históricos de acciones con Alpha Vantage
// Free tier: 5 requests/minuto, 500/día

import { getStockBackupHistory } from './stockBackup';
import { getCommodityHistory } from './commodityBackup';
import { getCryptoHistory, getCryptoHistoryCoinGecko } from './cryptoBackup';

const API_KEY = "HPWVZOIVS9XUBU6Y";
const BASE_URL = "https://www.alphavantage.co/query";

/**
 * Obtiene precios históricos diarios para una acción (por ejemplo, TSLA)
 * @param {string} symbol - El símbolo de la acción (ej: 'TSLA')
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<Array<{date: string, price: number, volume: number}>>}
 */
export async function fetchStockHistory(symbol, startDate, endDate) {
  console.log('🔍 Buscando datos para:', symbol, startDate, '-', endDate);
  const startYear = parseInt(startDate.slice(0, 4));
  const endYear = parseInt(endDate.slice(0, 4));

  // 1. Intentar datos de commodity (GOLD, SPY)
  if (symbol === 'GOLD' || symbol === 'SPY') {
    const commodityData = await getCommodityHistory(symbol, startDate, endDate);
    if (commodityData && commodityData.length > 0) {
      return commodityData;
    }
  }

  // 2. Intentar datos de respaldo de acciones (CSV)
  const backupData = await getStockBackupHistory(symbol, startYear, endYear);
  if (backupData && backupData.length > 0) {
    const allYears = Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);
    const backupYears = backupData.map(d => parseInt(d.date.slice(0, 4)));
    if (allYears.every(y => backupYears.includes(y))) {
      const closestToStart = backupData.reduce((prev, curr) => {
        return Math.abs(new Date(curr.date) - new Date(startDate)) < Math.abs(new Date(prev.date) - new Date(startDate)) ? curr : prev;
      });
      const closestToEnd = backupData.reduce((prev, curr) => {
        return Math.abs(new Date(curr.date) - new Date(endDate)) < Math.abs(new Date(prev.date) - new Date(endDate)) ? curr : prev;
      });
      if (startYear === endYear) {
        return [closestToStart, closestToEnd];
      }
      const result = [closestToStart];
      for (let y = startYear + 1; y < endYear; y++) {
        const mid = backupData.find(d => parseInt(d.date.slice(0, 4)) === y);
        if (mid) result.push(mid);
      }
      result.push(closestToEnd);
      return result;
    }
  }

  // 3. Intentar datos de criptomonedas desde CSV o CoinGecko
  if (["BTC", "ETH", "DOGE"].includes(symbol)) {
    let cryptoData = await getCryptoHistory(symbol, startDate, endDate);
    if (cryptoData && cryptoData.length > 0) {
      return cryptoData;
    }
    // Fallback: CoinGecko
    cryptoData = await getCryptoHistoryCoinGecko(symbol, startDate, endDate);
    if (cryptoData && cryptoData.length > 0) {
      return cryptoData;
    }
  }

  // 4. Intentar API Alpha Vantage (solo para acciones y commodities)
  try {
    if (symbol && symbol.length > 1 && symbol !== 'GOLD' && symbol !== 'SPY') {
      const url = `${BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}&outputsize=full`;
      const res = await fetch(url);
      const data = await res.json();
      if (data['Time Series (Daily)']) {
        const all = Object.entries(data['Time Series (Daily)'])
          .map(([date, values]) => ({
            date,
            price: parseFloat(values['5. adjusted close']),
            volume: parseInt(values['6. volume'])
          }))
          .filter(item => item.date >= startDate && item.date <= endDate)
          .sort((a, b) => a.date.localeCompare(b.date));
        if (all.length > 0) return all;
      }
    }
  } catch (e) {
    console.warn('Alpha Vantage API error:', e);
  }

  // 5. Si no hay datos, devolver null (el componente usará mock y mostrará advertencia)
  return null;
}