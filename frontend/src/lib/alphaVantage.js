// Servicio para consultar precios históricos de acciones con Alpha Vantage
// Free tier: 5 requests/minuto, 500/día

import { getStockBackupHistory } from './stockBackup';
import { getCommodityHistory } from './commodityBackup';

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
  
  // Intentar usar respaldo local primero
  const startYear = parseInt(startDate.slice(0, 4));
  const endYear = parseInt(endDate.slice(0, 4));
  console.log('📅 Años solicitados:', startYear, '-', endYear);
  
  // Para commodities (GOLD, SPY) usar datos mensuales
  if (symbol === 'GOLD' || symbol === 'SPY') {
    console.log('📊 Buscando datos de commodity:', symbol);
    const commodityData = await getCommodityHistory(symbol, startDate, endDate);
    console.log('📊 Datos de commodity encontrados:', commodityData.length, 'registros');
    if (commodityData && commodityData.length > 0) {
      console.log('✅ Usando datos de commodity local');
      return commodityData;
    }
  }
  
  // Para acciones usar datos anuales
  const backupData = await getStockBackupHistory(symbol, startYear, endYear);
  console.log('📊 Datos de respaldo encontrados:', backupData.length, 'registros');
  
  if (backupData && backupData.length > 0) {
    // Usar respaldo si hay datos para todos los años del rango
    const allYears = Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);
    const backupYears = backupData.map(d => parseInt(d.date.slice(0, 4)));
    console.log('📅 Años requeridos:', allYears);
    console.log('📅 Años disponibles:', backupYears);
    
    if (allYears.every(y => backupYears.includes(y))) {
      console.log('✅ Usando datos de respaldo local');
      // Buscar el precio más cercano a la fecha de inicio y fin
      const closestToStart = backupData.reduce((prev, curr) => {
        return Math.abs(new Date(curr.date) - new Date(startDate)) < Math.abs(new Date(prev.date) - new Date(startDate)) ? curr : prev;
      });
      const closestToEnd = backupData.reduce((prev, curr) => {
        return Math.abs(new Date(curr.date) - new Date(endDate)) < Math.abs(new Date(prev.date) - new Date(endDate)) ? curr : prev;
      });
      // Si solo hay un año, devolver ambos como el mismo
      if (startYear === endYear) {
        return [closestToStart, closestToEnd];
      }
      // Si hay varios años, devolver todos los años intermedios + los extremos
      const result = [closestToStart];
      for (let y = startYear + 1; y < endYear; y++) {
        const mid = backupData.find(d => parseInt(d.date.slice(0, 4)) === y);
        if (mid) result.push(mid);
      }
      result.push(closestToEnd);
      return result;
    }
  }

  // --- TEMPORALMENTE DESACTIVADO PARA TROUBLESHOOTING ---
  // Comentado para asegurar que solo use datos locales
  /*
  const cacheKey = `alphaVantage_${symbol}_${startDate}_${endDate}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }

  // Límite virtual de 5 llamadas por usuario
  const apiLimitKey = 'alphaVantage_api_calls';
  let apiCalls = parseInt(localStorage.getItem(apiLimitKey) || '0', 10);
  if (apiCalls >= 5) {
    throw new Error(`Límite de 5 llamadas a la API alcanzado. Por favor, espera o vuelve a intentarlo mañana. (Protección temporal)`);
  }

  // Incrementar el contador y guardar
  apiCalls++;
  localStorage.setItem(apiLimitKey, apiCalls.toString());

  // Mensaje de advertencia si quedan pocas llamadas
  if (apiCalls >= 3 && apiCalls < 5) {
    setTimeout(() => {
      const warning = `Advertencia: solo te quedan ${5 - apiCalls} llamadas a la API de Alpha Vantage en este navegador.`;
      if (window && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('alphaVantageWarning', { detail: warning }));
      }
    }, 100);
  }

  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al consultar Alpha Vantage');
  const data = await response.json();
  if (!data["Time Series (Daily)"]) throw new Error(data["Note"] || data["Error Message"] || 'Datos no disponibles para este símbolo');

  // Filtrar y mapear al formato esperado
  const prices = Object.entries(data["Time Series (Daily)"])
    .filter(([date]) => date >= startDate && date <= endDate)
    .map(([date, values]) => ({
      date,
      price: parseFloat(values["4. close"]),
      volume: parseInt(values["5. volume"])
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Guardar en caché
  localStorage.setItem(cacheKey, JSON.stringify(prices));

  return prices;
  */

  // Si no hay datos en respaldo, lanzar error
  throw new Error(`No hay datos de respaldo disponibles para ${symbol} en el rango ${startDate} - ${endDate}. API temporalmente desactivada.`);
}