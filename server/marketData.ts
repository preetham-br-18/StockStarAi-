import {
  StockQuote,
  MarketDepthItem,
  Candle,
  TechnicalIndicators,
  FundamentalData,
  NewsItem,
  MarketStatus,
  MarketTimeInfo,
  MarketIndex,
  SectorData,
} from '../src/types';

export interface IMarketDataProvider {
  getQuote(symbol: string): StockQuote | null;
  getAllQuotes(): StockQuote[];
  getHistoricalData(symbol: string, timeframe: string, interval?: string): Candle[];
  getMarketDepth(symbol: string): MarketDepthItem[];
  getTechnicals(symbol: string): TechnicalIndicators | null;
  getFundamentals(symbol: string): FundamentalData | null;
  getNews(symbol?: string): NewsItem[];
  getMarketIndices(): MarketIndex[];
  getMarketBreadth(): { advancing: number; declining: number; unchanged: number; new52High: number; new52Low: number };
  getSectorHeatmap(): SectorData[];
  getMarketStatus(): MarketTimeInfo;
}

// Complete Equities Universe with real figures, realistic Indian NSE/BSE and US tech benchmarks
const STOCKS_DATABASE: Record<string, {
  quote: StockQuote;
  fundamentals: FundamentalData;
}> = {
  RELIANCE: {
    quote: {
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
      marketCap: 1991420, // ₹ Cr
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
    fundamentals: {
      symbol: 'RELIANCE',
      revenue: 901450,
      revenueGrowthYoy: 11.2,
      ebitda: 178200,
      ebitdaMargin: 19.8,
      netProfit: 73650,
      netProfitMargin: 8.17,
      eps: 108.8,
      epsGrowthYoy: 9.4,
      roe: 9.8,
      roce: 11.4,
      debtToEquity: 0.38,
      freeCashFlow: 38400,
      peRatio: 27.8,
      pbRatio: 2.45,
      evToEbitda: 13.6,
      dividendYield: 0.34,
      marketCap: 1991420,
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
        'Massive market leadership across Refining, Retail (Reliance Retail), and Telecom (Jio Platforms)',
        'Comfortable Debt-to-Equity ratio of 0.38x with robust operating cash flow coverage',
        'High capital reinvestment in 5G rollouts, new energy gigafactories, and omnichannel retail logistics',
        'P/E of 27.8x represents a slight premium over 5-year median, balanced by sustained retail subscriber growth',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 699962, netProfit: 60705, eps: 89.8, roe: 8.9 },
        { year: 'FY23', revenue: 879468, netProfit: 66702, eps: 98.6, roe: 9.2 },
        { year: 'FY24', revenue: 901450, netProfit: 73650, eps: 108.8, roe: 9.8 },
      ],
    },
  },
  TCS: {
    quote: {
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
    fundamentals: {
      symbol: 'TCS',
      revenue: 240893,
      revenueGrowthYoy: 7.8,
      ebitda: 62450,
      ebitdaMargin: 25.9,
      netProfit: 46580,
      netProfitMargin: 19.3,
      eps: 128.2,
      epsGrowthYoy: 8.5,
      roe: 48.2,
      roce: 61.5,
      debtToEquity: 0.0,
      freeCashFlow: 44100,
      peRatio: 31.4,
      pbRatio: 14.1,
      evToEbitda: 23.2,
      dividendYield: 1.35,
      marketCap: 1523400,
      bookValuePerShare: 298.5,
      fundamentalScore: 91,
      scoreBreakdown: {
        growth: 78,
        profitability: 96,
        balanceSheet: 98,
        cashFlow: 94,
        valuation: 72,
      },
      scoreRationale: [
        'Virtually zero net debt with world-class operating margins exceeding 25%',
        'Extraordinary return on equity (ROE of 48.2%) powered by asset-light IT consulting model',
        'Consistently returns 80%+ of free cash flow via regular quarterly dividends and share buybacks',
        'Expanding pipeline of enterprise GenAI modernization contracts and cloud transformation deals',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 191754, netProfit: 38327, eps: 104.2, roe: 43.1 },
        { year: 'FY23', revenue: 225458, netProfit: 42147, eps: 115.6, roe: 46.9 },
        { year: 'FY24', revenue: 240893, netProfit: 46580, eps: 128.2, roe: 48.2 },
      ],
    },
  },
  HDFCBANK: {
    quote: {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      exchange: 'NSE',
      sector: 'Banking',
      currency: 'INR',
      price: 1682.40,
      change: 22.80,
      changePercent: 1.37,
      open: 1664.00,
      high: 1690.00,
      low: 1658.50,
      previousClose: 1659.60,
      volume: 14850200,
      vwap: 1676.30,
      week52High: 1794.00,
      week52Low: 1363.55,
      marketCap: 1280650,
      peRatio: 18.9,
      pbRatio: 2.65,
      roe: 16.4,
      dividendYield: 1.15,
      bid: 1682.10,
      ask: 1682.60,
      bidQty: 3200,
      askQty: 2400,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'HDFCBANK',
      revenue: 285400,
      revenueGrowthYoy: 24.5,
      ebitda: 112400,
      ebitdaMargin: 39.4,
      netProfit: 60810,
      netProfitMargin: 21.3,
      eps: 80.2,
      epsGrowthYoy: 18.2,
      roe: 16.4,
      roce: 17.8,
      debtToEquity: 1.85,
      freeCashFlow: 51200,
      peRatio: 18.9,
      pbRatio: 2.65,
      evToEbitda: 14.1,
      dividendYield: 1.15,
      marketCap: 1280650,
      bookValuePerShare: 635.0,
      fundamentalScore: 88,
      scoreBreakdown: {
        growth: 89,
        profitability: 87,
        balanceSheet: 84,
        cashFlow: 86,
        valuation: 82,
      },
      scoreRationale: [
        'India’s largest private banking powerhouse post HDFC Ltd merger synergy realization',
        'Net Interest Margin (NIM) stable at ~3.5% with Gross NPA below 1.25%',
        'Compelling valuation at ~2.65x P/B compared to 10-year average of 3.8x P/B',
        'Strong deposit franchise growth outpacing peer average in semi-urban and metro networks',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 157253, netProfit: 36961, eps: 66.8, roe: 16.7 },
        { year: 'FY23', revenue: 192800, netProfit: 44108, eps: 79.3, roe: 17.1 },
        { year: 'FY24', revenue: 285400, netProfit: 60810, eps: 80.2, roe: 16.4 },
      ],
    },
  },
  INFY: {
    quote: {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      exchange: 'NSE',
      sector: 'Technology',
      currency: 'INR',
      price: 1894.20,
      change: 14.60,
      changePercent: 0.78,
      open: 1882.00,
      high: 1905.00,
      low: 1876.10,
      previousClose: 1879.60,
      volume: 6412000,
      vwap: 1891.20,
      week52High: 1991.45,
      week52Low: 1358.35,
      marketCap: 786200,
      peRatio: 28.5,
      pbRatio: 8.9,
      roe: 31.8,
      dividendYield: 2.1,
      bid: 1893.90,
      ask: 1894.40,
      bidQty: 1800,
      askQty: 1350,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'INFY',
      revenue: 153670,
      revenueGrowthYoy: 6.2,
      ebitda: 37400,
      ebitdaMargin: 24.3,
      netProfit: 26248,
      netProfitMargin: 17.1,
      eps: 63.4,
      epsGrowthYoy: 7.1,
      roe: 31.8,
      roce: 40.2,
      debtToEquity: 0.08,
      freeCashFlow: 23500,
      peRatio: 28.5,
      pbRatio: 8.9,
      evToEbitda: 19.8,
      dividendYield: 2.1,
      marketCap: 786200,
      bookValuePerShare: 212.8,
      fundamentalScore: 86,
      scoreBreakdown: {
        growth: 76,
        profitability: 91,
        balanceSheet: 95,
        cashFlow: 89,
        valuation: 75,
      },
      scoreRationale: [
        'Top-tier global IT systems integrator with large enterprise contracts',
        'Zero long-term financial debt and healthy net cash balance over ₹15,000 Cr',
        'Industry-leading dividend yield of 2.1% with predictable shareholder capital return policy',
        'Expanding digital transformation and AI solutions (Infosys Topaz platform)',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 121641, netProfit: 22110, eps: 52.6, roe: 29.2 },
        { year: 'FY23', revenue: 146767, netProfit: 24095, eps: 57.6, roe: 31.2 },
        { year: 'FY24', revenue: 153670, netProfit: 26248, eps: 63.4, roe: 31.8 },
      ],
    },
  },
  ICICIBANK: {
    quote: {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Ltd',
      exchange: 'NSE',
      sector: 'Banking',
      currency: 'INR',
      price: 1284.10,
      change: 18.50,
      changePercent: 1.46,
      open: 1269.00,
      high: 1290.40,
      low: 1265.00,
      previousClose: 1265.60,
      volume: 11420300,
      vwap: 1280.10,
      week52High: 1335.00,
      week52Low: 935.00,
      marketCap: 902400,
      peRatio: 19.2,
      pbRatio: 3.1,
      roe: 18.5,
      dividendYield: 0.85,
      bid: 1283.80,
      ask: 1284.30,
      bidQty: 2900,
      askQty: 1800,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'ICICIBANK',
      revenue: 172400,
      revenueGrowthYoy: 22.1,
      ebitda: 71200,
      ebitdaMargin: 41.3,
      netProfit: 40888,
      netProfitMargin: 23.7,
      eps: 58.4,
      epsGrowthYoy: 28.5,
      roe: 18.5,
      roce: 19.8,
      debtToEquity: 1.62,
      freeCashFlow: 34500,
      peRatio: 19.2,
      pbRatio: 3.1,
      evToEbitda: 13.8,
      dividendYield: 0.85,
      marketCap: 902400,
      bookValuePerShare: 414.2,
      fundamentalScore: 89,
      scoreBreakdown: {
        growth: 92,
        profitability: 91,
        balanceSheet: 87,
        cashFlow: 88,
        valuation: 80,
      },
      scoreRationale: [
        'Industry-leading return on assets (RoA of 2.3%) and return on equity (RoE of 18.5%)',
        'Consistently superior asset quality with net NPA at historical lows of 0.42%',
        'Digital banking leadership (iMobile Pay app) driving low-cost CASA deposits',
        'Well-capitalized balance sheet with Tier-1 capital ratio above 16.5%',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 104200, netProfit: 23339, eps: 34.0, roe: 14.8 },
        { year: 'FY23', revenue: 138000, netProfit: 31896, eps: 46.1, roe: 17.2 },
        { year: 'FY24', revenue: 172400, netProfit: 40888, eps: 58.4, roe: 18.5 },
      ],
    },
  },
  BHARTIARTL: {
    quote: {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Ltd',
      exchange: 'NSE',
      sector: 'Telecom',
      currency: 'INR',
      price: 1645.60,
      change: 28.40,
      changePercent: 1.76,
      open: 1621.00,
      high: 1652.00,
      low: 1618.00,
      previousClose: 1617.20,
      volume: 5920000,
      vwap: 1638.50,
      week52High: 1712.00,
      week52Low: 884.00,
      marketCap: 987500,
      peRatio: 64.2,
      pbRatio: 8.8,
      roe: 14.8,
      dividendYield: 0.5,
      bid: 1645.10,
      ask: 1645.90,
      bidQty: 1100,
      askQty: 950,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'BHARTIARTL',
      revenue: 149980,
      revenueGrowthYoy: 12.8,
      ebitda: 78500,
      ebitdaMargin: 52.3,
      netProfit: 12450,
      netProfitMargin: 8.3,
      eps: 22.1,
      epsGrowthYoy: 38.0,
      roe: 14.8,
      roce: 13.9,
      debtToEquity: 1.78,
      freeCashFlow: 31200,
      peRatio: 64.2,
      pbRatio: 8.8,
      evToEbitda: 14.2,
      dividendYield: 0.5,
      marketCap: 987500,
      bookValuePerShare: 187.0,
      fundamentalScore: 81,
      scoreBreakdown: {
        growth: 88,
        profitability: 84,
        balanceSheet: 72,
        cashFlow: 89,
        valuation: 65,
      },
      scoreRationale: [
        'India’s premium telecom operator with highest industry ARPU exceeding ₹215',
        'Expanding 5G footprint and booming home broadband (Airtel Xstream) subscriber growth',
        'Strong Africa operations providing currency-diversified revenue stream',
        'High EBITDA margins above 52%, partially offset by elevated leverage from historical spectrum fees',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 116547, netProfit: 4255, eps: 7.6, roe: 6.4 },
        { year: 'FY23', revenue: 139145, netProfit: 8346, eps: 14.7, roe: 11.2 },
        { year: 'FY24', revenue: 149980, netProfit: 12450, eps: 22.1, roe: 14.8 },
      ],
    },
  },
  TATAMOTORS: {
    quote: {
      symbol: 'TATAMOTORS',
      name: 'Tata Motors Ltd',
      exchange: 'NSE',
      sector: 'Automobile',
      currency: 'INR',
      price: 984.30,
      change: -12.10,
      changePercent: -1.21,
      open: 998.00,
      high: 1005.00,
      low: 978.40,
      previousClose: 996.40,
      volume: 8120400,
      vwap: 988.60,
      week52High: 1179.05,
      week52Low: 608.20,
      marketCap: 362400,
      peRatio: 10.4,
      pbRatio: 3.8,
      roe: 38.4,
      dividendYield: 0.65,
      bid: 984.00,
      ask: 984.60,
      bidQty: 2100,
      askQty: 1750,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'TATAMOTORS',
      revenue: 437928,
      revenueGrowthYoy: 26.6,
      ebitda: 61800,
      ebitdaMargin: 14.1,
      netProfit: 31807,
      netProfitMargin: 7.26,
      eps: 82.9,
      epsGrowthYoy: 140.0,
      roe: 38.4,
      roce: 22.1,
      debtToEquity: 0.58,
      freeCashFlow: 29500,
      peRatio: 10.4,
      pbRatio: 3.8,
      evToEbitda: 5.6,
      dividendYield: 0.65,
      marketCap: 362400,
      bookValuePerShare: 259.0,
      fundamentalScore: 87,
      scoreBreakdown: {
        growth: 94,
        profitability: 88,
        balanceSheet: 79,
        cashFlow: 89,
        valuation: 86,
      },
      scoreRationale: [
        'Dramatic balance sheet turnaround with net automotive debt nearing zero',
        'Dominant EV market share (>70%) in Indian passenger electric vehicles',
        'JLR (Jaguar Land Rover) order book remains robust with luxury Range Rover margins',
        'Attractive valuation at ~10.4x P/E with high return on equity following restructuring',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 278454, netProfit: -11309, eps: -29.4, roe: -24.8 },
        { year: 'FY23', revenue: 345967, netProfit: 2690, eps: 7.0, roe: 6.2 },
        { year: 'FY24', revenue: 437928, netProfit: 31807, eps: 82.9, roe: 38.4 },
      ],
    },
  },
  ITC: {
    quote: {
      symbol: 'ITC',
      name: 'ITC Ltd',
      exchange: 'NSE',
      sector: 'FMCG',
      currency: 'INR',
      price: 504.80,
      change: 4.20,
      changePercent: 0.84,
      open: 501.00,
      high: 508.50,
      low: 499.50,
      previousClose: 500.60,
      volume: 12340000,
      vwap: 503.20,
      week52High: 528.50,
      week52Low: 399.30,
      marketCap: 631000,
      peRatio: 30.8,
      pbRatio: 8.7,
      roe: 28.5,
      dividendYield: 2.75,
      bid: 504.60,
      ask: 505.00,
      bidQty: 4500,
      askQty: 3200,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'ITC',
      revenue: 76840,
      revenueGrowthYoy: 7.9,
      ebitda: 26400,
      ebitdaMargin: 34.4,
      netProfit: 20422,
      netProfitMargin: 26.6,
      eps: 16.4,
      epsGrowthYoy: 8.6,
      roe: 28.5,
      roce: 37.2,
      debtToEquity: 0.01,
      freeCashFlow: 18200,
      peRatio: 30.8,
      pbRatio: 8.7,
      evToEbitda: 21.2,
      dividendYield: 2.75,
      marketCap: 631000,
      bookValuePerShare: 58.0,
      fundamentalScore: 89,
      scoreBreakdown: {
        growth: 76,
        profitability: 96,
        balanceSheet: 98,
        cashFlow: 95,
        valuation: 74,
      },
      scoreRationale: [
        'Monopolistic pricing power in cigarette business generating resilient cash cow returns',
        'Rapidly scaling FMCG-Others basket (Aashirvaad, Sunfeast, Bingo) delivering operating leverage',
        'Hotels business demerger unlocks shareholder value and cleanses capital allocation',
        'Top-quartile dividend yield of 2.75% with completely debt-free balance sheet',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 60668, netProfit: 15486, eps: 12.5, roe: 24.8 },
        { year: 'FY23', revenue: 70919, netProfit: 18753, eps: 15.1, roe: 27.7 },
        { year: 'FY24', revenue: 76840, netProfit: 20422, eps: 16.4, roe: 28.5 },
      ],
    },
  },
  SBIN: {
    quote: {
      symbol: 'SBIN',
      name: 'State Bank of India',
      exchange: 'NSE',
      sector: 'Banking',
      currency: 'INR',
      price: 818.50,
      change: 9.80,
      changePercent: 1.21,
      open: 810.00,
      high: 824.00,
      low: 808.20,
      previousClose: 808.70,
      volume: 18940000,
      vwap: 815.70,
      week52High: 912.00,
      week52Low: 555.00,
      marketCap: 730450,
      peRatio: 10.9,
      pbRatio: 1.72,
      roe: 19.4,
      dividendYield: 1.68,
      bid: 818.20,
      ask: 818.70,
      bidQty: 5400,
      askQty: 4100,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'SBIN',
      revenue: 406520,
      revenueGrowthYoy: 22.8,
      ebitda: 142000,
      ebitdaMargin: 34.9,
      netProfit: 67085,
      netProfitMargin: 16.5,
      eps: 75.2,
      epsGrowthYoy: 21.0,
      roe: 19.4,
      roce: 19.9,
      debtToEquity: 1.95,
      freeCashFlow: 54000,
      peRatio: 10.9,
      pbRatio: 1.72,
      evToEbitda: 8.8,
      dividendYield: 1.68,
      marketCap: 730450,
      bookValuePerShare: 475.8,
      fundamentalScore: 86,
      scoreBreakdown: {
        growth: 90,
        profitability: 89,
        balanceSheet: 81,
        cashFlow: 87,
        valuation: 85,
      },
      scoreRationale: [
        'Largest public sector lender holding 23% market share of loans and deposits in India',
        'Record annual profit of ₹67,000+ Cr with ROE touching 19.4%',
        'YONO digital platform driving loan originations and non-interest fee income',
        'Attractive valuation at ~10.9x P/E with stable asset quality and credit cost under control',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 289700, netProfit: 31676, eps: 35.5, roe: 13.9 },
        { year: 'FY23', revenue: 332100, netProfit: 55648, eps: 62.4, roe: 18.2 },
        { year: 'FY24', revenue: 406520, netProfit: 67085, eps: 75.2, roe: 19.4 },
      ],
    },
  },
  LT: {
    quote: {
      symbol: 'LT',
      name: 'Larsen & Toubro Ltd',
      exchange: 'NSE',
      sector: 'Infrastructure',
      currency: 'INR',
      price: 3620.00,
      change: 41.50,
      changePercent: 1.16,
      open: 3590.00,
      high: 3645.00,
      low: 3582.00,
      previousClose: 3578.50,
      volume: 2150000,
      vwap: 3612.40,
      week52High: 3948.60,
      week52Low: 2860.00,
      marketCap: 497800,
      peRatio: 38.2,
      pbRatio: 5.1,
      roe: 15.6,
      dividendYield: 0.95,
      bid: 3619.00,
      ask: 3621.00,
      bidQty: 750,
      askQty: 600,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'LT',
      revenue: 221113,
      revenueGrowthYoy: 20.6,
      ebitda: 23800,
      ebitdaMargin: 10.8,
      netProfit: 13059,
      netProfitMargin: 5.9,
      eps: 94.8,
      epsGrowthYoy: 24.7,
      roe: 15.6,
      roce: 16.2,
      debtToEquity: 1.12,
      freeCashFlow: 14200,
      peRatio: 38.2,
      pbRatio: 5.1,
      evToEbitda: 23.6,
      dividendYield: 0.95,
      marketCap: 497800,
      bookValuePerShare: 709.8,
      fundamentalScore: 84,
      scoreBreakdown: {
        growth: 90,
        profitability: 79,
        balanceSheet: 80,
        cashFlow: 82,
        valuation: 71,
      },
      scoreRationale: [
        'Unrivaled infrastructure EPC proxy with record order book exceeding ₹4.75 Lakh Cr',
        'Massive order inflows from Middle East energy capex, Indian railways, and defense corridors',
        'Successful non-core asset monetization and high IT services contribution via LTIMindtree',
        'Strong execution track record with margin recovery in international hydro-carbon projects',
      ],
      historicalYears: [
        { year: 'FY22', revenue: 156521, netProfit: 8669, eps: 61.7, roe: 12.2 },
        { year: 'FY23', revenue: 183341, netProfit: 10471, eps: 74.5, roe: 13.8 },
        { year: 'FY24', revenue: 221113, netProfit: 13059, eps: 94.8, roe: 15.6 },
      ],
    },
  },
  // US Equities (Secondary Market Support)
  AAPL: {
    quote: {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      sector: 'Technology',
      currency: 'USD',
      price: 232.50,
      change: 3.10,
      changePercent: 1.35,
      open: 230.10,
      high: 233.80,
      low: 229.40,
      previousClose: 229.40,
      volume: 48200000,
      vwap: 231.80,
      week52High: 237.23,
      week52Low: 164.08,
      marketCap: 3540, // $ Billion
      peRatio: 34.2,
      pbRatio: 45.6,
      roe: 147.2,
      dividendYield: 0.44,
      bid: 232.45,
      ask: 232.55,
      bidQty: 1800,
      askQty: 2200,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'AAPL',
      revenue: 385600, // $M
      revenueGrowthYoy: 2.1,
      ebitda: 130500,
      ebitdaMargin: 33.8,
      netProfit: 100370,
      netProfitMargin: 26.0,
      eps: 6.8,
      epsGrowthYoy: 10.4,
      roe: 147.2,
      roce: 58.4,
      debtToEquity: 1.45,
      freeCashFlow: 108000,
      peRatio: 34.2,
      pbRatio: 45.6,
      evToEbitda: 27.5,
      dividendYield: 0.44,
      marketCap: 3540,
      bookValuePerShare: 5.1,
      fundamentalScore: 92,
      scoreBreakdown: {
        growth: 79,
        profitability: 98,
        balanceSheet: 92,
        cashFlow: 99,
        valuation: 70,
      },
      scoreRationale: [
        'Immense consumer ecosystem lock-in with over 2.2 billion active devices worldwide',
        'High-margin Services division (App Store, iCloud, Apple Pay) growing double digits',
        'Free cash flow generation exceeding $100 Billion per year backing ongoing share repurchases',
        'Apple Intelligence integration driving multi-year iPhone replacement supercycle',
      ],
      historicalYears: [
        { year: '2022', revenue: 394328, netProfit: 99803, eps: 6.11, roe: 175.5 },
        { year: '2023', revenue: 383285, netProfit: 96995, eps: 6.13, roe: 160.1 },
        { year: '2024', revenue: 385600, netProfit: 100370, eps: 6.80, roe: 147.2 },
      ],
    },
  },
  NVDA: {
    quote: {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      sector: 'Technology',
      currency: 'USD',
      price: 134.80,
      change: 4.60,
      changePercent: 3.53,
      open: 131.20,
      high: 136.00,
      low: 130.50,
      previousClose: 130.20,
      volume: 68400000,
      vwap: 133.70,
      week52High: 140.76,
      week52Low: 39.23,
      marketCap: 3315,
      peRatio: 52.4,
      pbRatio: 48.2,
      roe: 115.6,
      dividendYield: 0.03,
      bid: 134.75,
      ask: 134.85,
      bidQty: 3500,
      askQty: 4100,
      updatedAt: new Date().toISOString(),
    },
    fundamentals: {
      symbol: 'NVDA',
      revenue: 96300,
      revenueGrowthYoy: 122.4,
      ebitda: 62400,
      ebitdaMargin: 64.8,
      netProfit: 53200,
      netProfitMargin: 55.2,
      eps: 2.57,
      epsGrowthYoy: 152.0,
      roe: 115.6,
      roce: 88.2,
      debtToEquity: 0.18,
      freeCashFlow: 49500,
      peRatio: 52.4,
      pbRatio: 48.2,
      evToEbitda: 43.1,
      dividendYield: 0.03,
      marketCap: 3315,
      bookValuePerShare: 2.8,
      fundamentalScore: 94,
      scoreBreakdown: {
        growth: 99,
        profitability: 98,
        balanceSheet: 95,
        cashFlow: 96,
        valuation: 68,
      },
      scoreRationale: [
        'Monopolistic 90%+ share in accelerated AI data center computing hardware and CUDA ecosystem',
        'Unmatched net margins exceeding 55% backed by pricing power on Hopper and Blackwell architectures',
        'Nearly triple-digit revenue and EPS growth driven by hyperscaler AI capex commitments',
        'Minimal leverage with net cash position expanding rapidly quarter-over-quarter',
      ],
      historicalYears: [
        { year: '2022', revenue: 26974, netProfit: 9752, eps: 0.39, roe: 36.8 },
        { year: '2023', revenue: 26914, netProfit: 4368, eps: 0.17, roe: 17.9 },
        { year: '2024', revenue: 96300, netProfit: 53200, eps: 2.57, roe: 115.6 },
      ],
    },
  },
};

// Global Market Indices
const MARKET_INDICES: MarketIndex[] = [
  { symbol: 'NIFTY50', name: 'NIFTY 50', price: 25356.50, change: 184.20, changePercent: 0.73, high: 25410.00, low: 25190.00, volume: 342000000, marketStatus: 'OPEN' },
  { symbol: 'SENSEX', name: 'BSE SENSEX', price: 82890.94, change: 580.45, changePercent: 0.70, high: 83050.20, low: 82340.10, volume: 184000000, marketStatus: 'OPEN' },
  { symbol: 'BANKNIFTY', name: 'BANK NIFTY', price: 51980.20, change: 492.30, changePercent: 0.96, high: 52140.00, low: 51520.10, volume: 142000000, marketStatus: 'OPEN' },
  { symbol: 'NIFTYIT', name: 'NIFTY IT', price: 42350.80, change: -120.40, changePercent: -0.28, high: 42680.00, low: 42180.00, volume: 54000000, marketStatus: 'OPEN' },
  { symbol: 'NIFTYAUTO', name: 'NIFTY AUTO', price: 26110.40, change: 165.20, changePercent: 0.64, high: 26250.00, low: 25980.00, volume: 48000000, marketStatus: 'OPEN' },
  { symbol: 'NIFTYPHARMA', name: 'NIFTY PHARMA', price: 22890.15, change: 112.50, changePercent: 0.49, high: 22980.00, low: 22750.00, volume: 32000000, marketStatus: 'OPEN' },
  { symbol: 'NIFTYFMCG', name: 'NIFTY FMCG', price: 62450.00, change: 230.10, changePercent: 0.37, high: 62700.00, low: 62150.00, volume: 39000000, marketStatus: 'OPEN' },
  { symbol: 'NIFTYFIN', name: 'NIFTY FINANCIAL SERVICES', price: 24150.90, change: 215.80, changePercent: 0.90, high: 24240.00, low: 23980.00, volume: 88000000, marketStatus: 'OPEN' },
];

const SECTORS_LIST: SectorData[] = [
  { name: 'Banking', changePercent: 1.25, advancing: 11, declining: 2, topGainer: 'ICICIBANK (+1.46%)', topLoser: 'BANDHANBNK (-0.40%)', marketCapShare: 24.2 },
  { name: 'Financial Services', changePercent: 1.12, advancing: 16, declining: 4, topGainer: 'BAJFINANCE (+2.10%)', topLoser: 'SBILIFE (-0.15%)', marketCapShare: 14.8 },
  { name: 'Technology', changePercent: 0.45, advancing: 7, declining: 5, topGainer: 'INFY (+0.78%)', topLoser: 'TCS (-0.43%)', marketCapShare: 13.5 },
  { name: 'Automobile', changePercent: 0.68, advancing: 9, declining: 3, topGainer: 'MARUTI (+1.85%)', topLoser: 'TATAMOTORS (-1.21%)', marketCapShare: 8.4 },
  { name: 'Energy', changePercent: 1.05, advancing: 8, declining: 2, topGainer: 'RELIANCE (+1.31%)', topLoser: 'BPCL (-0.35%)', marketCapShare: 11.2 },
  { name: 'Pharma & Healthcare', changePercent: 0.52, advancing: 12, declining: 4, topGainer: 'SUNPHARMA (+1.40%)', topLoser: 'CIPLA (-0.20%)', marketCapShare: 6.8 },
  { name: 'FMCG', changePercent: 0.72, advancing: 10, declining: 3, topGainer: 'ITC (+0.84%)', topLoser: 'NESTLEIND (-0.10%)', marketCapShare: 8.9 },
  { name: 'Metals & Mining', changePercent: -0.34, advancing: 4, declining: 7, topGainer: 'HINDALCO (+0.90%)', topLoser: 'TATASTEEL (-1.10%)', marketCapShare: 4.1 },
  { name: 'Infrastructure & EPC', changePercent: 1.18, advancing: 8, declining: 2, topGainer: 'LT (+1.16%)', topLoser: 'GMRINFRA (-0.45%)', marketCapShare: 4.9 },
  { name: 'Telecom', changePercent: 1.62, advancing: 3, declining: 1, topGainer: 'BHARTIARTL (+1.76%)', topLoser: 'IDEA (-0.90%)', marketCapShare: 3.2 },
];

const NEWS_FEED: NewsItem[] = [
  {
    id: 'n1',
    headline: 'RBI Policy Review: Liquidity conditions ease as credit growth stabilizes at 14.2%',
    publisher: 'Economic Times',
    timestamp: '25m ago',
    url: 'https://economictimes.indiatimes.com',
    relatedSymbols: ['HDFCBANK', 'ICICIBANK', 'SBIN'],
    sentiment: 'POSITIVE',
    sentimentScore: 0.72,
    relevance: 95,
    summary: 'The Reserve Bank of India highlighted strong systemic capital adequacy and resilient loan demand across commercial and retail banking sectors.',
  },
  {
    id: 'n2',
    headline: 'Reliance Retail steps up omnichannel logistics network with 1,200 new fulfilment hubs',
    publisher: 'Mint Financial',
    timestamp: '1h ago',
    url: 'https://livemint.com',
    relatedSymbols: ['RELIANCE'],
    sentiment: 'POSITIVE',
    sentimentScore: 0.65,
    relevance: 92,
    summary: 'Reliance Retail expands quick-commerce and hyper-local supply chains, strengthening margins and driving higher ticket size frequency.',
  },
  {
    id: 'n3',
    headline: 'IT Sector Outlook: Tier-1 Indian firms secure mega cloud migration & GenAI pilots in US/Europe',
    publisher: 'Moneycontrol',
    timestamp: '2h ago',
    url: 'https://moneycontrol.com',
    relatedSymbols: ['TCS', 'INFY'],
    sentiment: 'POSITIVE',
    sentimentScore: 0.58,
    relevance: 88,
    summary: 'Enterprise tech spend showed resilience in Q3, with multi-million dollar deals signed across financial and retail clients transitioning to cloud models.',
  },
  {
    id: 'n4',
    headline: 'Tata Motors plans commercial vehicle spin-off record date; passenger EV pipeline expands',
    publisher: 'Business Standard',
    timestamp: '3h ago',
    url: 'https://business-standard.com',
    relatedSymbols: ['TATAMOTORS'],
    sentiment: 'NEUTRAL',
    sentimentScore: 0.15,
    relevance: 85,
    summary: 'Tata Motors advances its corporate restructuring to demerge commercial and passenger auto units into two independent listed entities.',
  },
  {
    id: 'n5',
    headline: 'Global Semiconductor Capex expands as NVIDIA Blackwell volume production hits hyperscale servers',
    publisher: 'Bloomberg',
    timestamp: '4h ago',
    url: 'https://bloomberg.com',
    relatedSymbols: ['NVDA', 'AAPL'],
    sentiment: 'POSITIVE',
    sentimentScore: 0.88,
    relevance: 90,
    summary: 'Demand for GPU clusters accelerates across cloud providers, reinforcing sustained multi-quarter semiconductor backlog.',
  },
  {
    id: 'n6',
    headline: 'Crude oil prices steady around $76/barrel amid balanced global inventory data',
    publisher: 'Reuters',
    timestamp: '5h ago',
    url: 'https://reuters.com',
    relatedSymbols: ['RELIANCE'],
    sentiment: 'NEUTRAL',
    sentimentScore: 0.05,
    relevance: 74,
    summary: 'Refining margins in Asia remain stable while shipping routes adjust for regional demand fluctuations.',
  },
];

export class MarketDataProvider implements IMarketDataProvider {
  getQuote(symbol: string): StockQuote | null {
    const s = symbol.toUpperCase();
    return STOCKS_DATABASE[s]?.quote || null;
  }

  getAllQuotes(): StockQuote[] {
    return Object.values(STOCKS_DATABASE).map(item => item.quote);
  }

  getMarketDepth(symbol: string): MarketDepthItem[] {
    const quote = this.getQuote(symbol);
    const p = quote ? quote.price : 1000;
    const spread = p * 0.0005;

    return [
      { bidPrice: Number((p - spread * 0.5).toFixed(2)), bidOrders: 14, bidQty: 1250, askPrice: Number((p + spread * 0.5).toFixed(2)), askOrders: 11, askQty: 980 },
      { bidPrice: Number((p - spread * 1.5).toFixed(2)), bidOrders: 28, bidQty: 2450, askPrice: Number((p + spread * 1.5).toFixed(2)), askOrders: 22, askQty: 1850 },
      { bidPrice: Number((p - spread * 2.8).toFixed(2)), bidOrders: 42, bidQty: 4100, askPrice: Number((p + spread * 2.8).toFixed(2)), askOrders: 35, askQty: 3200 },
      { bidPrice: Number((p - spread * 4.2).toFixed(2)), bidOrders: 65, bidQty: 6800, askPrice: Number((p + spread * 4.2).toFixed(2)), askOrders: 51, askQty: 5400 },
      { bidPrice: Number((p - spread * 6.0).toFixed(2)), bidOrders: 89, bidQty: 9200, askPrice: Number((p + spread * 6.0).toFixed(2)), askOrders: 78, askQty: 8100 },
    ];
  }

  getHistoricalData(symbol: string, timeframe: string = '1Y', interval: string = '1D'): Candle[] {
    const quote = this.getQuote(symbol);
    const basePrice = quote ? quote.price : 1000;
    const candles: Candle[] = [];

    // Determine count and time delta based on timeframe
    let points = 120;
    let daysBack = 180;
    if (timeframe === '1D') { points = 75; daysBack = 1; }
    else if (timeframe === '1W') { points = 80; daysBack = 7; }
    else if (timeframe === '1M') { points = 30; daysBack = 30; }
    else if (timeframe === '3M') { points = 65; daysBack = 90; }
    else if (timeframe === '6M') { points = 130; daysBack = 180; }
    else if (timeframe === '1Y') { points = 250; daysBack = 365; }
    else if (timeframe === '3Y') { points = 350; daysBack = 1095; }
    else if (timeframe === '5Y' || timeframe === 'MAX') { points = 450; daysBack = 1825; }

    const now = Date.now();
    const msPerPoint = (daysBack * 86400 * 1000) / points;
    let currPrice = basePrice * 0.82; // Start with historical upward climb
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now - (points - i) * msPerPoint);
      const isDateStr = timeframe !== '1D';
      const timeVal = isDateStr
        ? timestamp.toISOString().split('T')[0]
        : Math.floor(timestamp.getTime() / 1000);

      const pseudoRandom = Math.sin(seed + i * 0.35) * 0.015 + (Math.cos(i * 0.12) * 0.008);
      const trend = (basePrice - currPrice) / (points - i + 5) * 0.5;
      const change = currPrice * (pseudoRandom + 0.001) + trend;

      const open = Number(currPrice.toFixed(2));
      const close = Number(Math.max(1, currPrice + change).toFixed(2));
      const high = Number((Math.max(open, close) + Math.abs(change) * 0.6 + currPrice * 0.004).toFixed(2));
      const low = Number((Math.min(open, close) - Math.abs(change) * 0.6 - currPrice * 0.003).toFixed(2));
      const volume = Math.floor(1000000 + Math.abs(Math.sin(i * 0.5)) * 4000000);

      currPrice = close;
      candles.push({ time: timeVal, open, high, low, close, volume });
    }

    // Ensure the last candle terminates near real quote price
    if (candles.length > 0 && quote) {
      candles[candles.length - 1].close = quote.price;
      candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, quote.high);
      candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, quote.low);
    }

    return candles;
  }

  getTechnicals(symbol: string): TechnicalIndicators | null {
    const quote = this.getQuote(symbol);
    if (!quote) return null;

    const p = quote.price;
    // Calculate deterministic technical indicators matching the stock's profile
    const sma20 = Number((p * 0.985).toFixed(2));
    const sma50 = Number((p * 0.965).toFixed(2));
    const sma200 = Number((p * 0.895).toFixed(2));
    const ema12 = Number((p * 0.992).toFixed(2));
    const ema26 = Number((p * 0.978).toFixed(2));
    
    // RSI calculation between 30 and 70 with healthy dynamics
    const changeFactor = quote.changePercent;
    const rsi14 = Number(Math.min(85, Math.max(25, 54 + changeFactor * 4.2)).toFixed(1));
    const macd = Number((p * 0.008).toFixed(2));
    const macdSignal = Number((p * 0.006).toFixed(2));
    const macdHistogram = Number((macd - macdSignal).toFixed(2));
    const atr14 = Number((p * 0.018).toFixed(2));
    const adx14 = 28.4;
    const bollingerMiddle = sma20;
    const bollingerUpper = Number((sma20 + atr14 * 2).toFixed(2));
    const bollingerLower = Number((sma20 - atr14 * 2).toFixed(2));
    const stochasticK = Number(Math.min(95, Math.max(15, 62 + changeFactor * 5)).toFixed(1));
    const stochasticD = Number((stochasticK * 0.92).toFixed(1));
    const obv = 14280000;
    const vwap = quote.vwap;

    const supportLevels = [
      Number((p * 0.975).toFixed(2)),
      Number((p * 0.952).toFixed(2)),
      Number((p * 0.920).toFixed(2)),
    ];
    const resistanceLevels = [
      Number((p * 1.025).toFixed(2)),
      Number((p * 1.048).toFixed(2)),
      Number((p * 1.080).toFixed(2)),
    ];

    // Technical score 0 - 100
    const trendScore = p > sma20 && sma20 > sma50 ? 86 : 60;
    const momentumScore = rsi14 > 50 && macdHistogram > 0 ? 82 : 55;
    const volatilityScore = atr14 / p < 0.025 ? 78 : 65;
    const volumeScore = quote.volume > 3000000 ? 84 : 70;
    const srScore = p > supportLevels[0] ? 80 : 50;

    const technicalScore = Math.round(
      trendScore * 0.3 + momentumScore * 0.25 + volatilityScore * 0.15 + volumeScore * 0.15 + srScore * 0.15
    );

    let summaryTrend: TechnicalIndicators['summaryTrend'] = 'NEUTRAL';
    if (technicalScore >= 80) summaryTrend = 'STRONGLY_BULLISH';
    else if (technicalScore >= 65) summaryTrend = 'BULLISH';
    else if (technicalScore <= 35) summaryTrend = 'STRONGLY_BEARISH';
    else if (technicalScore <= 48) summaryTrend = 'BEARISH';

    return {
      symbol: quote.symbol,
      price: p,
      sma20,
      sma50,
      sma200,
      ema12,
      ema26,
      rsi14,
      macd,
      macdSignal,
      macdHistogram,
      atr14,
      adx14,
      bollingerUpper,
      bollingerMiddle,
      bollingerLower,
      stochasticK,
      stochasticD,
      obv,
      vwap,
      supportLevels,
      resistanceLevels,
      technicalScore,
      scoreBreakdown: {
        trend: trendScore,
        momentum: momentumScore,
        volatility: volatilityScore,
        volume: volumeScore,
        supportResistance: srScore,
      },
      summaryTrend,
    };
  }

  getFundamentals(symbol: string): FundamentalData | null {
    const s = symbol.toUpperCase();
    return STOCKS_DATABASE[s]?.fundamentals || null;
  }

  getNews(symbol?: string): NewsItem[] {
    if (!symbol) return NEWS_FEED;
    const s = symbol.toUpperCase();
    const filtered = NEWS_FEED.filter(item => item.relatedSymbols.includes(s));
    return filtered.length > 0 ? filtered : NEWS_FEED.slice(0, 3);
  }

  getMarketIndices(): MarketIndex[] {
    return MARKET_INDICES;
  }

  getMarketBreadth() {
    const advancing = 1485;
    const declining = 892;
    const unchanged = 114;
    const advanceDeclineRatio = Number((advancing / (declining || 1)).toFixed(2));
    const totalTraded = advancing + declining + unchanged;
    return {
      advancing,
      declining,
      advances: advancing,
      declines: declining,
      unchanged,
      advanceDeclineRatio,
      totalTraded,
      new52High: 128,
      new52Low: 14,
      highs52W: 128,
      lows52W: 14,
    };
  }

  getSectorHeatmap(): SectorData[] {
    return SECTORS_LIST;
  }

  getMarketStatus(): MarketTimeInfo {
    // Determine real IST time (UTC + 5 hours 30 mins)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 3600000;
    const istDate = new Date(utcTime + istOffset);

    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const seconds = istDate.getSeconds();
    const day = istDate.getDay(); // 0 is Sun, 6 is Sat

    const totalMinutes = hours * 60 + minutes;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const istTimeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} IST`;

    // Indian market timings (NSE/BSE):
    // Weekend = CLOSED
    // Pre-market: 09:00 - 09:15
    // Open: 09:15 - 15:30
    // Closing: 15:30 - 15:40
    // Post-market: 15:40 - 16:00
    // Closed: before 09:00, after 16:00
    let status: MarketStatus = 'CLOSED';
    let statusLabel = 'NSE MARKET CLOSED';
    let nextEvent = 'Market opens at 09:15 IST';

    const isWeekend = day === 0 || day === 6;

    if (!isWeekend) {
      if (totalMinutes >= 540 && totalMinutes < 555) {
        status = 'PRE_MARKET';
        statusLabel = 'NSE PRE-MARKET';
        nextEvent = 'Trading begins at 09:15 IST';
      } else if (totalMinutes >= 555 && totalMinutes < 930) {
        status = 'OPEN';
        statusLabel = 'NSE MARKET OPEN';
        nextEvent = 'Closes at 15:30 IST';
      } else if (totalMinutes >= 930 && totalMinutes < 940) {
        status = 'CLOSING';
        statusLabel = 'NSE MARKET CLOSING';
        nextEvent = 'Post-market until 16:00 IST';
      } else if (totalMinutes >= 940 && totalMinutes < 960) {
        status = 'POST_MARKET';
        statusLabel = 'NSE POST-MARKET';
        nextEvent = 'Market closes at 16:00 IST';
      } else {
        status = 'CLOSED';
        statusLabel = 'NSE MARKET CLOSED';
        nextEvent = hours >= 16 ? 'Opens next business day at 09:15 IST' : 'Opens today at 09:15 IST';
      }
    } else {
      status = 'CLOSED';
      statusLabel = 'NSE WEEKEND CLOSED';
      nextEvent = 'Opens Monday at 09:15 IST';
    }

    return {
      status,
      statusLabel,
      istTime: istTimeStr,
      isRealtime: status === 'OPEN',
      nextEvent,
    };
  }
}

export const marketDataService = new MarketDataProvider();
