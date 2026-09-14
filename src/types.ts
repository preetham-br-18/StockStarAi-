export type MarketStatus = 'PRE_MARKET' | 'OPEN' | 'CLOSING' | 'POST_MARKET' | 'CLOSED';

export interface MarketTimeInfo {
  status: MarketStatus;
  statusLabel: string;
  istTime: string;
  isRealtime: boolean;
  nextEvent: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
  sector: string;
  currency: 'INR' | 'USD';
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  vwap: number;
  week52High: number;
  week52Low: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap: number; // In Crores for INR, Billions for USD
  peRatio: number;
  pbRatio: number;
  roe: number;
  dividendYield: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  updatedAt: string;
  isDelayed?: boolean;
}

export interface MarketDepthItem {
  bidPrice: number;
  bidOrders: number;
  bidQty: number;
  askPrice: number;
  askOrders: number;
  askQty: number;
}

export interface Candle {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  symbol: string;
  price: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  atr14: number;
  adx14: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  stochasticK: number;
  stochasticD: number;
  obv: number;
  vwap: number;
  supportLevels: number[];
  resistanceLevels: number[];
  technicalScore: number; // 0 - 100
  scoreBreakdown: {
    trend: number; // 0 - 100
    momentum: number;
    volatility: number;
    volume: number;
    supportResistance: number;
  };
  summaryTrend: 'STRONGLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONGLY_BEARISH';
}

export interface FundamentalData {
  symbol: string;
  revenue: number; // In Crores or Billions
  revenueGrowthYoy: number;
  ebitda: number;
  ebitdaMargin: number;
  netProfit: number;
  netProfitMargin: number;
  eps: number;
  epsGrowthYoy: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  freeCashFlow: number;
  peRatio: number;
  pbRatio: number;
  evToEbitda: number;
  dividendYield: number;
  marketCap: number;
  bookValuePerShare: number;
  fundamentalScore: number; // 0 - 100
  scoreBreakdown: {
    growth: number;
    profitability: number;
    balanceSheet: number;
    cashFlow: number;
    valuation: number;
  };
  scoreRationale: string[];
  historicalYears: {
    year: string;
    revenue: number;
    netProfit: number;
    eps: number;
    roe: number;
  }[];
}

export interface NewsItem {
  id: string;
  headline: string;
  publisher: string;
  timestamp: string;
  url: string;
  relatedSymbols: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore: number; // -1.0 to 1.0
  relevance: number; // 0 - 100
  summary?: string;
}

export type PredictionHorizon = 'INTRADAY' | '1D' | '3D' | '7D' | '14D' | '30D' | '90D' | '6M' | '1Y';

export interface MLModelPrediction {
  modelName: string;
  modelType: 'Gradient Boosting (XGBoost/LightGBM)' | 'Random Forest' | 'Temporal Neural Network' | 'Logistic Classifier' | 'Expected Return Regression';
  weight: number;
  probabilityUp: number;
  probabilityNeutral: number;
  probabilityDown: number;
  expectedReturn: number;
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
}

export interface StockPrediction {
  symbol: string;
  horizon: PredictionHorizon;
  probabilityUp: number;
  probabilityNeutral: number;
  probabilityDown: number;
  expectedReturn: number; // e.g. 0.027 = +2.7%
  confidence: number; // 0 - 1
  marketRegime: 'BULL' | 'BEAR' | 'SIDEWAYS' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY';
  modelAgreement: string; // e.g. "4 / 5 models bullish"
  models: MLModelPrediction[];
  generatedAt: string;
  disclaimer: string;
}

export interface ModelPerformanceMetric {
  metric: string;
  value: string | number;
  description: string;
  bullRegime: string | number;
  bearRegime: string | number;
  sidewaysRegime: string | number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketStatus: MarketStatus;
}

export interface SectorData {
  name: string;
  changePercent: number;
  advancing: number;
  declining: number;
  topGainer: string;
  topLoser: string;
  marketCapShare: number;
}

export interface ScreenerFilter {
  marketCapMin?: number;
  marketCapMax?: number;
  sector?: string;
  peMin?: number;
  peMax?: number;
  roeMin?: number;
  roceMin?: number;
  revenueGrowthMin?: number;
  debtToEquityMax?: number;
  rsiMin?: number;
  rsiMax?: number;
  minAiScore?: number;
  trend?: string;
}

export interface PaperOrder {
  id: string;
  symbol: string;
  stockName: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  price: number;
  targetPrice?: number;
  stopLossPrice?: number;
  status: 'EXECUTED' | 'PENDING' | 'CANCELLED';
  placedAt: string;
  executedAt?: string;
  totalAmount: number;
}

export interface PaperPosition {
  symbol: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  sector: string;
}

export interface PaperPortfolio {
  cashBalance: number;
  totalInvested: number;
  portfolioValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  todayPnL: number;
  todayPnLPercent: number;
  xirr: number;
  maxDrawdown: number;
  positions: PaperPosition[];
  orders: PaperOrder[];
}

export interface CourseLesson {
  id: string;
  title: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  exercise?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CourseLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  duration: string;
  lessons: CourseLesson[];
}

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  formula?: string;
  example: string;
  significance: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_MOVE' | 'VOLUME_SPIKE' | 'RSI_THRESHOLD' | 'MACD_CROSSOVER';
  threshold: number;
  createdAt: string;
  triggered: boolean;
  note?: string;
}

export type MarketNews = NewsItem;
export type MarketDepth = MarketDepthItem[];
export type SectorPerformance = SectorData;

export interface MarketBreadth {
  advancing: number;
  declining: number;
  unchanged: number;
  advanceDeclineRatio?: number;
  totalTraded?: number;
  advances?: number;
  declines?: number;
  new52High?: number;
  new52Low?: number;
  highs52W?: number;
  lows52W?: number;
}

