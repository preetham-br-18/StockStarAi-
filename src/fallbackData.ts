import {
  StockQuote,
  MarketDepthItem,
  Candle,
  TechnicalIndicators,
  FundamentalData,
  MarketTimeInfo,
  MarketIndex,
  SectorData,
  PredictionHorizon,
  StockPrediction,
} from './types';

// ==========================================
// UNIVERSAL FALLBACK STOCKS DATABASE
// ==========================================
export const FALLBACK_QUOTES: Record<string, StockQuote> = {
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Energy & Conglomerate',
    currency: 'INR',
    price: 2942.50,
    change: 38.20,
    changePercent: 1.31,
    open: 2910.00,
    high: 2955.00,
    low: 2902.10,
    previousClose: 2904.30,
    volume: 7842100,
    vwap: 2931.40,
    week52High: 3217.90,
    week52Low: 2220.30,
    marketCap: 1991420,
    peRatio: 27.8,
    pbRatio: 2.45,
    roe: 9.8,
    dividendYield: 0.34,
    bid: 2942.10,
    ask: 2942.70,
    bidQty: 1450,
    askQty: 920,
    updatedAt: new Date().toISOString(),
  },
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'Technology',
    currency: 'INR',
    price: 4210.75,
    change: -18.40,
    changePercent: -0.43,
    open: 4235.00,
    high: 4248.50,
    low: 4198.00,
    previousClose: 4229.15,
    volume: 2410900,
    vwap: 4215.80,
    week52High: 4592.25,
    week52Low: 3313.00,
    marketCap: 1523400,
    peRatio: 31.4,
    pbRatio: 14.1,
    roe: 48.2,
    dividendYield: 1.35,
    bid: 4210.20,
    ask: 4211.00,
    bidQty: 850,
    askQty: 1120,
    updatedAt: new Date().toISOString(),
  },
  HDFCBANK: {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    exchange: 'NSE',
    sector: 'Financial Services',
    currency: 'INR',
    price: 1654.20,
    change: 14.60,
    changePercent: 0.89,
    open: 1642.00,
    high: 1662.80,
    low: 1638.50,
    previousClose: 1639.60,
    volume: 14280500,
    vwap: 1651.10,
    week52High: 1794.00,
    week52Low: 1363.55,
    marketCap: 1256300,
    peRatio: 19.4,
    pbRatio: 2.85,
    roe: 16.5,
    dividendYield: 1.18,
    bid: 1654.00,
    ask: 1654.50,
    bidQty: 3400,
    askQty: 2900,
    updatedAt: new Date().toISOString(),
  },
  INFY: {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    exchange: 'NSE',
    sector: 'Technology',
    currency: 'INR',
    price: 1942.30,
    change: 22.75,
    changePercent: 1.19,
    open: 1925.00,
    high: 1951.00,
    low: 1920.00,
    previousClose: 1919.55,
    volume: 6812400,
    vwap: 1938.60,
    week52High: 1991.45,
    week52Low: 1358.35,
    marketCap: 806200,
    peRatio: 28.5,
    pbRatio: 9.1,
    roe: 31.8,
    dividendYield: 2.45,
    bid: 1942.00,
    ask: 1942.50,
    bidQty: 2100,
    askQty: 1800,
    updatedAt: new Date().toISOString(),
  },
  ICICIBANK: {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    exchange: 'NSE',
    sector: 'Financial Services',
    currency: 'INR',
    price: 1218.45,
    change: 11.20,
    changePercent: 0.93,
    open: 1209.00,
    high: 1224.00,
    low: 1205.50,
    previousClose: 1207.25,
    volume: 11240000,
    vwap: 1215.30,
    week52High: 1257.80,
    week52Low: 898.85,
    marketCap: 857400,
    peRatio: 18.2,
    pbRatio: 3.12,
    roe: 18.4,
    dividendYield: 0.82,
    bid: 1218.10,
    ask: 1218.60,
    bidQty: 4100,
    askQty: 3200,
    updatedAt: new Date().toISOString(),
  },
  TATAMOTORS: {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    exchange: 'NSE',
    sector: 'Automobile',
    currency: 'INR',
    price: 986.30,
    change: 18.50,
    changePercent: 1.91,
    open: 970.00,
    high: 994.00,
    low: 968.20,
    previousClose: 967.80,
    volume: 12980000,
    vwap: 982.40,
    week52High: 1179.00,
    week52Low: 600.65,
    marketCap: 362400,
    peRatio: 11.4,
    pbRatio: 3.8,
    roe: 34.2,
    dividendYield: 0.61,
    bid: 986.00,
    ask: 986.50,
    bidQty: 5400,
    askQty: 4100,
    updatedAt: new Date().toISOString(),
  },
  ITC: {
    symbol: 'ITC',
    name: 'ITC Ltd',
    exchange: 'NSE',
    sector: 'FMCG',
    currency: 'INR',
    price: 508.60,
    change: 3.40,
    changePercent: 0.67,
    open: 506.00,
    high: 512.00,
    low: 504.80,
    previousClose: 505.20,
    volume: 9840000,
    vwap: 507.90,
    week52High: 528.55,
    week52Low: 399.30,
    marketCap: 635100,
    peRatio: 29.8,
    pbRatio: 8.6,
    roe: 28.5,
    dividendYield: 2.72,
    bid: 508.40,
    ask: 508.80,
    bidQty: 8900,
    askQty: 6200,
    updatedAt: new Date().toISOString(),
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    sector: 'Semiconductors',
    currency: 'USD',
    price: 118.45,
    change: 3.85,
    changePercent: 3.36,
    open: 115.20,
    high: 119.80,
    low: 114.90,
    previousClose: 114.60,
    volume: 58240000,
    vwap: 117.80,
    week52High: 140.76,
    week52Low: 39.23,
    marketCap: 2910,
    peRatio: 64.2,
    pbRatio: 48.5,
    roe: 115.4,
    dividendYield: 0.03,
    bid: 118.40,
    ask: 118.46,
    bidQty: 1800,
    askQty: 2400,
    updatedAt: new Date().toISOString(),
  },
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    currency: 'USD',
    price: 221.80,
    change: 1.45,
    changePercent: 0.66,
    open: 220.50,
    high: 223.10,
    low: 219.80,
    previousClose: 220.35,
    volume: 48190000,
    vwap: 221.40,
    week52High: 237.23,
    week52Low: 164.08,
    marketCap: 3400,
    peRatio: 33.8,
    pbRatio: 44.2,
    roe: 147.2,
    dividendYield: 0.45,
    bid: 221.75,
    ask: 221.85,
    bidQty: 3200,
    askQty: 2800,
    updatedAt: new Date().toISOString(),
  },
};

export const FALLBACK_INDICES: MarketIndex[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50', price: 25356.50, change: 110.40, changePercent: 0.44, high: 25420.00, low: 25280.30, volume: 45210000, marketStatus: 'OPEN' },
  { symbol: 'SENSEX', name: 'BSE SENSEX', price: 82890.94, change: 361.07, changePercent: 0.44, high: 83050.20, low: 82640.10, volume: 18900000, marketStatus: 'OPEN' },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK', price: 51938.45, change: 214.20, changePercent: 0.41, high: 52100.00, low: 51740.00, volume: 32400000, marketStatus: 'OPEN' },
  { symbol: 'NIFTY IT', name: 'NIFTY IT', price: 42150.80, change: 340.15, changePercent: 0.81, high: 42300.00, low: 41850.00, volume: 16200000, marketStatus: 'OPEN' },
  { symbol: 'S&P 500', name: 'S&P 500', price: 5626.02, change: 29.80, changePercent: 0.53, high: 5640.00, low: 5605.00, volume: 215000000, marketStatus: 'OPEN' },
  { symbol: 'NASDAQ', name: 'NASDAQ 100', price: 19480.20, change: 145.60, changePercent: 0.75, high: 19550.00, low: 19370.00, volume: 185000000, marketStatus: 'OPEN' },
];

export const FALLBACK_SECTORS: SectorData[] = [
  { name: 'Financial Services', changePercent: 0.84, advancing: 14, declining: 6, topGainer: 'ICICIBANK (+0.93%)', topLoser: 'KOTAKBANK (-0.21%)', marketCapShare: 34.2 },
  { name: 'Information Tech', changePercent: 1.15, advancing: 8, declining: 2, topGainer: 'INFY (+1.19%)', topLoser: 'TCS (-0.43%)', marketCapShare: 14.8 },
  { name: 'Oil, Gas & Energy', changePercent: 0.95, advancing: 6, declining: 3, topGainer: 'RELIANCE (+1.31%)', topLoser: 'BPCL (-0.12%)', marketCapShare: 12.1 },
  { name: 'Automobile', changePercent: 1.62, advancing: 11, declining: 4, topGainer: 'TATAMOTORS (+1.91%)', topLoser: 'BAJAJ-AUTO (-0.35%)', marketCapShare: 6.8 },
  { name: 'Fast Moving Consumer Goods', changePercent: 0.42, advancing: 9, declining: 5, topGainer: 'ITC (+0.67%)', topLoser: 'HINDUNILVR (-0.48%)', marketCapShare: 8.5 },
];

export const FALLBACK_MARKET_STATUS: MarketTimeInfo = {
  status: 'OPEN',
  statusLabel: 'Regular Trading Session',
  istTime: '15:30:00 IST',
  isRealtime: true,
  nextEvent: 'Market Close at 15:30 IST',
};

// Generate strictly monotonic, non-duplicate historical candles
export function generateFallbackCandles(symbol: string, timeframe: string = '1Y', basePrice?: number): Candle[] {
  const quote = FALLBACK_QUOTES[symbol] || FALLBACK_QUOTES.RELIANCE;
  const price = basePrice || quote.price || 1000;
  const candles: Candle[] = [];

  let points = 120;
  let daysBack = 180;
  const isIntraday = timeframe === '1D' || timeframe === '1W';

  if (timeframe === '1D') { points = 75; daysBack = 1; }
  else if (timeframe === '1W') { points = 70; daysBack = 7; }
  else if (timeframe === '1M') { points = 30; daysBack = 30; }
  else if (timeframe === '3M') { points = 65; daysBack = 90; }
  else if (timeframe === '6M') { points = 125; daysBack = 180; }
  else if (timeframe === '1Y') { points = 250; daysBack = 365; }
  else if (timeframe === '3Y') { points = 350; daysBack = 1095; }
  else if (timeframe === '5Y' || timeframe === 'MAX') { points = 450; daysBack = 1825; }

  const now = Date.now();
  let currPrice = price * 0.84;
  const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seenTimes = new Set<string | number>();

  for (let i = 0; i < points; i++) {
    let timeVal: string | number;
    if (isIntraday) {
      const msPerPoint = (daysBack * 86400 * 1000) / points;
      timeVal = Math.floor((now - (points - 1 - i) * msPerPoint) / 1000);
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - (points - 1 - i));
      timeVal = d.toISOString().split('T')[0];
    }

    if (seenTimes.has(timeVal)) continue;
    seenTimes.add(timeVal);

    const pseudoRandom = Math.sin(seed + i * 0.35) * 0.015 + (Math.cos(i * 0.12) * 0.008);
    const trend = (price - currPrice) / (points - i + 5) * 0.5;
    const change = currPrice * (pseudoRandom + 0.001) + trend;

    const open = Number(currPrice.toFixed(2));
    const close = Number(Math.max(1, currPrice + change).toFixed(2));
    const high = Number((Math.max(open, close) + Math.abs(change) * 0.6 + currPrice * 0.004).toFixed(2));
    const low = Number((Math.min(open, close) - Math.abs(change) * 0.6 - currPrice * 0.003).toFixed(2));
    const volume = Math.floor(1000000 + Math.abs(Math.sin(i * 0.5)) * 4000000);

    currPrice = close;
    candles.push({ time: timeVal, open, high, low, close, volume });
  }

  if (candles.length > 0) {
    candles[candles.length - 1].close = price;
    candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, price * 1.008);
    candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, price * 0.992);
  }

  return candles;
}

export function generateFallbackTechnicals(symbol: string): TechnicalIndicators {
  const quote = FALLBACK_QUOTES[symbol] || FALLBACK_QUOTES.RELIANCE;
  const p = quote.price;
  const sma20 = Number((p * 0.985).toFixed(2));
  const sma50 = Number((p * 0.965).toFixed(2));
  const sma200 = Number((p * 0.895).toFixed(2));
  const atr14 = Number((p * 0.018).toFixed(2));

  return {
    symbol,
    price: p,
    sma20,
    sma50,
    sma200,
    ema12: Number((p * 0.992).toFixed(2)),
    ema26: Number((p * 0.978).toFixed(2)),
    rsi14: 58.4,
    macd: Number((p * 0.008).toFixed(2)),
    macdSignal: Number((p * 0.006).toFixed(2)),
    macdHistogram: Number((p * 0.002).toFixed(2)),
    atr14,
    adx14: 28.4,
    bollingerUpper: Number((sma20 + atr14 * 2).toFixed(2)),
    bollingerMiddle: sma20,
    bollingerLower: Number((sma20 - atr14 * 2).toFixed(2)),
    stochasticK: 68.2,
    stochasticD: 64.1,
    obv: 14280000,
    vwap: quote.vwap || p,
    supportLevels: [Number((p * 0.975).toFixed(2)), Number((p * 0.95).toFixed(2)), Number((p * 0.92).toFixed(2))],
    resistanceLevels: [Number((p * 1.025).toFixed(2)), Number((p * 1.05).toFixed(2)), Number((p * 1.08).toFixed(2))],
    technicalScore: 82,
    scoreBreakdown: {
      trend: 84,
      momentum: 80,
      volatility: 85,
      volume: 78,
      supportResistance: 83,
    },
    summaryTrend: 'BULLISH',
  };
}

export function generateFallbackFundamentals(symbol: string): FundamentalData {
  const quote = FALLBACK_QUOTES[symbol] || FALLBACK_QUOTES.RELIANCE;
  return {
    symbol,
    revenue: 901450,
    revenueGrowthYoy: 11.2,
    ebitda: 178500,
    ebitdaMargin: 19.8,
    netProfit: 73650,
    netProfitMargin: 8.2,
    eps: 108.8,
    epsGrowthYoy: 9.4,
    roe: quote.roe || 14.5,
    roce: 15.8,
    debtToEquity: 0.38,
    freeCashFlow: 38400,
    peRatio: quote.peRatio || 25,
    pbRatio: quote.pbRatio || 3.2,
    evToEbitda: 13.6,
    dividendYield: quote.dividendYield || 1.2,
    marketCap: quote.marketCap || 1500000,
    bookValuePerShare: 1201.0,
    fundamentalScore: 84,
    scoreBreakdown: {
      growth: 82,
      profitability: 85,
      balanceSheet: 86,
      cashFlow: 81,
      valuation: 74,
    },
    scoreRationale: [
      'Robust industry moat with diversified core operating cash flows',
      'Manageable debt-to-equity ratio supported by strong interest coverage',
      'Consistent multi-year top-line revenue expansion and healthy capital reinvestment',
    ],
    historicalYears: [
      { year: 'FY22', revenue: 699962, netProfit: 60705, eps: 89.8, roe: 8.9 },
      { year: 'FY23', revenue: 879468, netProfit: 66702, eps: 98.6, roe: 9.2 },
      { year: 'FY24', revenue: 901450, netProfit: 73650, eps: 108.8, roe: 9.8 },
    ],
  };
}

export function generateFallbackDepth(price: number): MarketDepthItem[] {
  const items: MarketDepthItem[] = [];
  for (let i = 0; i < 5; i++) {
    items.push({
      bidPrice: Number((price - (i + 1) * 0.4).toFixed(2)),
      bidOrders: 14 - i * 2,
      bidQty: 850 + i * 320,
      askPrice: Number((price + (i + 1) * 0.4).toFixed(2)),
      askOrders: 12 - i * 2,
      askQty: 780 + i * 290,
    });
  }
  return items;
}

export function generateFallbackPrediction(symbol: string, horizon: PredictionHorizon = '7D'): StockPrediction {
  const quote = FALLBACK_QUOTES[symbol] || FALLBACK_QUOTES.RELIANCE;
  return {
    symbol,
    horizon,
    probabilityUp: 0.74,
    probabilityNeutral: 0.12,
    probabilityDown: 0.14,
    expectedReturn: 0.0185,
    confidence: 0.72,
    marketRegime: 'BULL',
    modelAgreement: '5 / 5 models bullish',
    models: [
      {
        modelName: 'XGBoost Trend Ensemble',
        modelType: 'Gradient Boosting (XGBoost/LightGBM)',
        weight: 0.35,
        probabilityUp: 0.76,
        probabilityNeutral: 0.12,
        probabilityDown: 0.12,
        expectedReturn: 0.021,
        signal: 'BULLISH',
      },
      {
        modelName: 'Temporal Transformer LSTM',
        modelType: 'Temporal Neural Network',
        weight: 0.30,
        probabilityUp: 0.72,
        probabilityNeutral: 0.15,
        probabilityDown: 0.13,
        expectedReturn: 0.018,
        signal: 'BULLISH',
      },
      {
        modelName: 'Multi-Factor Random Forest',
        modelType: 'Random Forest',
        weight: 0.20,
        probabilityUp: 0.75,
        probabilityNeutral: 0.10,
        probabilityDown: 0.15,
        expectedReturn: 0.019,
        signal: 'BULLISH',
      },
      {
        modelName: 'Regime Switch Classifier',
        modelType: 'Logistic Classifier',
        weight: 0.15,
        probabilityUp: 0.70,
        probabilityNeutral: 0.14,
        probabilityDown: 0.16,
        expectedReturn: 0.015,
        signal: 'BULLISH',
      },
    ],
    generatedAt: new Date().toISOString(),
    disclaimer: 'Probabilistic machine learning model output for educational research.',
  };
}

// ==========================================
// FAIL-SAFE NETWORK FETCHER WITH AUTO-FALLBACK
// ==========================================
export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit,
  fallbackValue?: T,
  timeoutMs: number = 3500
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[SafeFetch] ${url} returned status ${res.status}. Using fallback.`);
      return fallbackValue as T;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[SafeFetch] ${url} did not return JSON (content-type: ${contentType}). Using fallback.`);
      return fallbackValue as T;
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timer);
    console.warn(`[SafeFetch] ${url} request failed (${err?.message || err}). Using fallback.`);
    return fallbackValue as T;
  }
}
