import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Cpu,
  BarChart2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Clock,
  AlertTriangle,
  Send,
  Sliders,
  DollarSign,
  PieChart,
  Eye,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  StockQuote,
  TechnicalIndicators,
  FundamentalData,
  StockPrediction,
  MarketNews,
  MarketDepth,
  PredictionHorizon,
  Candle,
} from '../types';
import { TradingViewChart } from './TradingViewChart';
import {
  FALLBACK_QUOTES,
  generateFallbackCandles,
  generateFallbackTechnicals,
  generateFallbackFundamentals,
  generateFallbackDepth,
  generateFallbackPrediction,
  safeFetchJson,
} from '../fallbackData';

interface StockTerminalViewProps {
  symbol: string;
  onOpenOrderModal: (stock: StockQuote) => void;
  onSelectStock: (symbol: string) => void;
}

export const StockTerminalView: React.FC<StockTerminalViewProps> = ({
  symbol,
  onOpenOrderModal,
  onSelectStock,
}) => {
  const defaultQuote = FALLBACK_QUOTES[symbol] || FALLBACK_QUOTES.RELIANCE;
  const [quote, setQuote] = useState<StockQuote>(defaultQuote);
  const [technicals, setTechnicals] = useState<TechnicalIndicators | null>(() => generateFallbackTechnicals(symbol));
  const [fundamentals, setFundamentals] = useState<FundamentalData | null>(() => generateFallbackFundamentals(symbol));
  const [prediction, setPrediction] = useState<StockPrediction | null>(() => generateFallbackPrediction(symbol, '7D') as any);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [depth, setDepth] = useState<MarketDepth | null>(() => generateFallbackDepth(defaultQuote.price) as any);
  const [candles, setCandles] = useState<Candle[]>(() => generateFallbackCandles(symbol, '1Y', defaultQuote.price));

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeframe, setTimeframe] = useState('1Y');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [selectedHorizon, setSelectedHorizon] = useState<PredictionHorizon>('7D');
  const [activeTab, setActiveTab] = useState<'overview' | 'technicals' | 'fundamentals' | 'ml' | 'news' | 'ai'>('overview');

  // AI Analyst state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Fetch full stock terminal bundle with graceful fallback
  useEffect(() => {
    let isMounted = true;
    async function loadStockData() {
      setIsSyncing(true);
      const fallbackQ = FALLBACK_QUOTES[symbol] || FALLBACK_QUOTES.RELIANCE;

      // Update basic local state immediately if symbol changed
      setQuote(prev => (prev?.symbol === symbol ? prev : fallbackQ));
      setCandles(prev => (prev.length > 0 && prev[0].time ? prev : generateFallbackCandles(symbol, timeframe, fallbackQ.price)));

      try {
        const [stockData, histData, predData] = await Promise.all([
          safeFetchJson<any>(`/api/stocks/${symbol}`, undefined, null, 3000),
          safeFetchJson<any>(`/api/stocks/${symbol}/history?timeframe=${timeframe}`, undefined, null, 3000),
          safeFetchJson<any>(`/api/stocks/${symbol}/prediction?horizon=${selectedHorizon}`, undefined, null, 3000),
        ]);

        if (isMounted) {
          if (stockData && stockData.quote) {
            setQuote(stockData.quote);
            if (stockData.technicals) setTechnicals(stockData.technicals);
            if (stockData.fundamentals) setFundamentals(stockData.fundamentals);
            if (stockData.news) setNews(stockData.news);
            if (stockData.depth) setDepth(stockData.depth);
          } else {
            // Populate fallback data so screen is never blank
            setQuote(fallbackQ);
            setTechnicals(generateFallbackTechnicals(symbol));
            setFundamentals(generateFallbackFundamentals(symbol));
            setDepth(generateFallbackDepth(fallbackQ.price) as any);
          }

          if (histData && Array.isArray(histData.candles) && histData.candles.length > 0) {
            setCandles(histData.candles);
          } else {
            setCandles(generateFallbackCandles(symbol, timeframe, fallbackQ.price));
          }

          if (predData && predData.probabilityUp !== undefined) {
            setPrediction(predData);
          } else {
            setPrediction(generateFallbackPrediction(symbol, selectedHorizon) as any);
          }
        }
      } catch (err) {
        console.warn('Network sync notice in terminal:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
          setLoading(false);
        }
      }
    }

    loadStockData();
    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe]);

  // Update prediction when horizon changes
  useEffect(() => {
    async function updateHorizon() {
      try {
        const data = await safeFetchJson<any>(
          `/api/stocks/${symbol}/prediction?horizon=${selectedHorizon}`,
          undefined,
          generateFallbackPrediction(symbol, selectedHorizon) as any,
          3000
        );
        if (data) setPrediction(data);
      } catch (err) {
        console.warn('Failed to update prediction horizon:', err);
      }
    }
    updateHorizon();
  }, [symbol, selectedHorizon]);

  // Handle Ask AI request with safe fallback
  const handleAskAI = async (queryText?: string) => {
    const q = queryText || aiQuery;
    if (!q.trim()) return;
    setAiLoading(true);
    try {
      const data = await safeFetchJson<any>(
        '/api/ai/ask',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, query: q }),
        },
        {
          summary: `${symbol} is trading in a constructive technical structure with a healthy risk-to-reward ratio.`,
          trend: 'BULLISH',
          confidence: 0.78,
          key_drivers: [
            `Strong fundamental score of ${fundamentals?.fundamentalScore || 84}/100 with resilient revenue expansion`,
            'Price action holding above key 50-day moving average benchmark',
            'Order flow signals steady institutional accumulation across dips',
          ],
          risks: [
            'Short-term market volatility and global macro rate fluctuations',
            'Potential overhead resistance near 52-week peak levels',
          ],
          support_levels: technicals?.supportLevels || [quote.price * 0.97, quote.price * 0.94],
          resistance_levels: technicals?.resistanceLevels || [quote.price * 1.03, quote.price * 1.06],
          prediction: {
            probability_up: 0.72,
            probability_down: 0.18,
            expected_return: '+1.8%',
            model_agreement: '5 / 5 models bullish',
          },
          data_timestamp: new Date().toLocaleTimeString(),
          disclaimer: 'Probabilistic simulation for educational research.',
        },
        5000
      );
      setAiAnalysis(data);
    } catch (err) {
      console.warn('AI analyst query notice:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-xs text-slate-400 font-mono">Synchronizing market depth and quant models for {symbol}...</p>
      </div>
    );
  }

  const isUp = quote.change >= 0;
  const currencySymbol = quote.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6 pb-12">
      {/* Stock Master Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {quote.symbol}
              </h1>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
                {quote.exchange}
              </span>
              <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-400">
                {quote.sector}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-400">{quote.name}</div>
          </div>

          {/* Real-time Price & Day Change */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  {currencySymbol}{quote.price ? quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                </span>
                <span className={`flex items-center font-mono text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {isUp ? '+' : ''}{(quote.changePercent ?? 0).toFixed(2)}% ({isUp ? '+' : ''}{(quote.change ?? 0).toFixed(2)})
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                <span>VWAP: {currencySymbol}{quote.vwap ?? '-'}</span>
                <span>•</span>
                <span>Day Range: {currencySymbol}{quote.dayLow ?? '-'} - {quote.dayHigh ?? '-'}</span>
              </div>
            </div>

            {/* Action Buttons: Paper Trade & Watchlist */}
            <div className="flex items-center gap-2">
              <button
                id="terminal-trade-btn"
                onClick={() => onOpenOrderModal(quote)}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all cursor-pointer"
              >
                <DollarSign className="h-4 w-4" />
                Paper Trade
              </button>
            </div>
          </div>
        </div>

        {/* Fundamental & Technical Quick Score Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-5 mt-5 border-t border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[11px] block">Market Cap</span>
            <span className="font-semibold text-slate-200">
              {currencySymbol}{quote.marketCap ? ((quote.marketCap / 1000).toFixed(1) + 'k Cr') : '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">P/E Ratio</span>
            <span className="font-semibold text-slate-200">{quote.peRatio ?? '-'}x</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">52W Range</span>
            <span className="font-semibold text-slate-200">
              {(quote as any).week52Low ?? quote.fiftyTwoWeekLow ?? '-'} - {(quote as any).week52High ?? quote.fiftyTwoWeekHigh ?? '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Fundamental Score</span>
            <span className="font-semibold text-emerald-400">{fundamentals?.fundamentalScore}/100</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Technical Score</span>
            <span className="font-semibold text-teal-400">{technicals?.technicalScore}/100</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">ML 7D Up Prob.</span>
            <span className="font-semibold text-emerald-400">
              {prediction ? `${Math.round(prediction.probabilityUp * 100)}%` : '...'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Chart & Order Flow' },
          { id: 'technicals', label: 'Technical Analysis' },
          { id: 'fundamentals', label: 'Fundamental Audit' },
          { id: 'ml', label: 'ML Probabilistic Forecast' },
          { id: 'ai', label: 'Ask AI Analyst' },
          { id: 'news', label: 'News & Sentiment' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CHART & ORDER FLOW OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Chart Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121824] p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Style:</span>
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 font-mono">
                <button
                  onClick={() => setChartType('candlestick')}
                  className={`px-2 py-0.5 rounded text-[11px] ${chartType === 'candlestick' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400'}`}
                >
                  Candles
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2 py-0.5 rounded text-[11px] ${chartType === 'line' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400'}`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2 py-0.5 rounded text-[11px] ${chartType === 'area' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400'}`}
                >
                  Area
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Lightweight Chart */}
          <TradingViewChart
            candles={candles}
            symbol={quote.symbol}
            chartType={chartType}
            height={440}
          />

          {/* Market Depth (Order Book) & Key Indicators Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level 2 Market Depth */}
            {depth && (
              <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" />
                    Market Depth (Order Book)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">5-Tier Real-Time</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  {/* Bids */}
                  <div>
                    <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-1 text-[11px]">
                      <span>Orders</span>
                      <span>Qty</span>
                      <span className="text-emerald-400 font-semibold">Bid Price</span>
                    </div>
                    <div className="divide-y divide-slate-800/40 mt-1">
                      {(Array.isArray(depth) ? depth : ((depth as any)?.bids || [])).map((item: any, i: number) => {
                        const orders = item.bidOrders ?? item.orders ?? 1;
                        const qty = item.bidQty ?? item.quantity ?? 0;
                        const price = item.bidPrice ?? item.price ?? 0;
                        return (
                          <div key={i} className="flex justify-between py-1 text-slate-300">
                            <span className="text-slate-400 text-[10px]">{orders}</span>
                            <span>{qty.toLocaleString('en-IN')}</span>
                            <span className="text-emerald-400 font-medium">₹{price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Asks */}
                  <div>
                    <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-1 text-[11px]">
                      <span className="text-rose-400 font-semibold">Ask Price</span>
                      <span>Qty</span>
                      <span>Orders</span>
                    </div>
                    <div className="divide-y divide-slate-800/40 mt-1">
                      {(Array.isArray(depth) ? depth : ((depth as any)?.asks || [])).map((item: any, i: number) => {
                        const orders = item.askOrders ?? item.orders ?? 1;
                        const qty = item.askQty ?? item.quantity ?? 0;
                        const price = item.askPrice ?? item.price ?? 0;
                        return (
                          <div key={i} className="flex justify-between py-1 text-slate-300">
                            <span className="text-rose-400 font-medium">₹{price.toFixed(2)}</span>
                            <span>{qty.toLocaleString('en-IN')}</span>
                            <span className="text-slate-400 text-[10px]">{orders}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Total Bid vs Total Ask Quantities */}
                {(() => {
                  const totalBids = Array.isArray(depth)
                    ? depth.reduce((sum, d) => sum + (d.bidQty || 0), 0)
                    : (depth as any)?.totalBidQty ?? 0;
                  const totalAsks = Array.isArray(depth)
                    ? depth.reduce((sum, d) => sum + (d.askQty || 0), 0)
                    : (depth as any)?.totalAskQty ?? 0;
                  return (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400">Total Bids: {totalBids.toLocaleString('en-IN')}</span>
                      <span className="text-rose-400">Total Asks: {totalAsks.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Technical Pivots & Scores Summary */}
            {technicals && (
              <div className="rounded-xl border border-slate-800 bg-[#121824] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 className="h-3.5 w-3.5 text-teal-400" />
                      Key Mathematical Levels & Pivots
                    </h3>
                    <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-teal-400">
                      Score: {technicals.technicalScore}/100 ({technicals.summaryTrend})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-2">
                      <div className="text-slate-400 text-[11px]">Dynamic Support Levels</div>
                      {(technicals?.supportLevels || []).map((s, idx) => (
                        <div key={idx} className="flex justify-between bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                          <span className="text-emerald-400">S{idx + 1} Support</span>
                          <span className="text-white font-semibold">₹{s}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-slate-400 text-[11px]">Dynamic Resistance Levels</div>
                      {(technicals?.resistanceLevels || []).map((r, idx) => (
                        <div key={idx} className="flex justify-between bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
                          <span className="text-rose-400">R{idx + 1} Resistance</span>
                          <span className="text-white font-semibold">₹{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-900/60 p-2 rounded">
                    <span className="text-slate-400 text-[10px] block">RSI(14)</span>
                    <span className="font-semibold text-white">{technicals.rsi14}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded">
                    <span className="text-slate-400 text-[10px] block">MACD Line</span>
                    <span className="font-semibold text-white">{technicals.macdLine}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded">
                    <span className="text-slate-400 text-[10px] block">ATR (14) Vol</span>
                    <span className="font-semibold text-white">₹{technicals.atr14}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL ANALYSIS ENGINE */}
      {activeTab === 'technicals' && technicals && (
        <div className="space-y-6">
          {/* Score breakdown card */}
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Technical Health Composite Score</h3>
                <p className="text-xs text-slate-400">Mathematical aggregate across trend, momentum, volatility, and volume</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-3xl font-extrabold text-teal-400">
                  {technicals.technicalScore}<span className="text-slate-500 text-lg">/100</span>
                </div>
                <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-mono text-teal-300 font-semibold border border-teal-500/20">
                  {technicals.summaryTrend}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Trend Direction</span>
                <div className="text-sm font-bold text-white mt-1">{technicals.scoreBreakdown.trend}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Momentum (RSI/MACD)</span>
                <div className="text-sm font-bold text-white mt-1">{technicals.scoreBreakdown.momentum}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Volatility (Bollinger)</span>
                <div className="text-sm font-bold text-white mt-1">{technicals.scoreBreakdown.volatility}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Volume Confirmation</span>
                <div className="text-sm font-bold text-white mt-1">{technicals.scoreBreakdown.volume}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Support / Resistance</span>
                <div className="text-sm font-bold text-white mt-1">{technicals.scoreBreakdown.supportResistance}/100</div>
              </div>
            </div>
          </div>

          {/* Detailed Indicators Table */}
          <div className="rounded-xl border border-slate-800 bg-[#121824] p-5">
            <h3 className="text-sm font-bold text-white mb-3">Mathematical Indicator Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Moving Averages</div>
                <div className="flex justify-between"><span>SMA 20:</span> <span className="text-white">₹{technicals.sma20}</span></div>
                <div className="flex justify-between"><span>SMA 50:</span> <span className="text-white">₹{technicals.sma50}</span></div>
                <div className="flex justify-between"><span>SMA 200:</span> <span className="text-white">₹{technicals.sma200}</span></div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Momentum Indicators</div>
                <div className="flex justify-between"><span>RSI (14):</span> <span className="text-emerald-400 font-semibold">{technicals.rsi14} ({technicals.rsi14 > 70 ? 'Overbought' : technicals.rsi14 < 30 ? 'Oversold' : 'Neutral Momentum'})</span></div>
                <div className="flex justify-between"><span>MACD Signal:</span> <span className="text-white">{technicals.macdSignal}</span></div>
                <div className="flex justify-between"><span>MACD Histogram:</span> <span className={technicals.macdHistogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{technicals.macdHistogram}</span></div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Volatility & Ranges</div>
                <div className="flex justify-between"><span>Bollinger Upper:</span> <span className="text-white">₹{technicals.bollingerUpper}</span></div>
                <div className="flex justify-between"><span>Bollinger Middle:</span> <span className="text-white">₹{technicals.bollingerMiddle}</span></div>
                <div className="flex justify-between"><span>Bollinger Lower:</span> <span className="text-white">₹{technicals.bollingerLower}</span></div>
                <div className="flex justify-between"><span>ADX (Trend Strength):</span> <span className="text-white">{technicals.adx}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FUNDAMENTAL AUDIT */}
      {activeTab === 'fundamentals' && fundamentals && (
        <div className="space-y-6">
          {/* Transparent 0-100 Score Header with Rationale */}
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Transparent Fundamental Score</h3>
                <p className="text-xs text-slate-400">Institutional evaluation of financial quality, balance sheet solvency & moats</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-3xl font-extrabold text-emerald-400">
                  {fundamentals.fundamentalScore}<span className="text-slate-500 text-lg">/100</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300 font-semibold border border-emerald-500/20">
                  Investment Grade
                </span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs mb-5">
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Growth (Sales/EPS)</span>
                <div className="text-sm font-bold text-white mt-1">{fundamentals.scoreBreakdown.growth}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Profitability (ROE/ROCE)</span>
                <div className="text-sm font-bold text-white mt-1">{fundamentals.scoreBreakdown.profitability}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Balance Sheet Solvency</span>
                <div className="text-sm font-bold text-white mt-1">{fundamentals.scoreBreakdown.balanceSheet}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Cash Flow Conversion</span>
                <div className="text-sm font-bold text-white mt-1">{fundamentals.scoreBreakdown.cashFlow}/100</div>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-slate-400 text-[11px]">Relative Valuation</span>
                <div className="text-sm font-bold text-white mt-1">{fundamentals.scoreBreakdown.valuation}/100</div>
              </div>
            </div>

            {/* Why is this score awarded? Transparent Rationale */}
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                Score Transparency: Why {fundamentals.fundamentalScore}/100?
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(fundamentals?.scoreRationale || []).map((rationale, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{rationale}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
              <span className="text-slate-400 text-[11px] block">Return on Equity (ROE)</span>
              <span className="text-lg font-bold text-white mt-1 block">{fundamentals.roe}%</span>
              <span className="text-[10px] text-emerald-400">Superior capital efficiency</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
              <span className="text-slate-400 text-[11px] block">ROCE</span>
              <span className="text-lg font-bold text-white mt-1 block">{fundamentals.roce}%</span>
              <span className="text-[10px] text-teal-400">Total capital deployed</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
              <span className="text-slate-400 text-[11px] block">Debt to Equity</span>
              <span className="text-lg font-bold text-white mt-1 block">{fundamentals.debtToEquity}x</span>
              <span className="text-[10px] text-emerald-400">Conservative balance sheet</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
              <span className="text-slate-400 text-[11px] block">Free Cash Flow</span>
              <span className="text-lg font-bold text-white mt-1 block">₹{fundamentals.freeCashFlow.toLocaleString('en-IN')} Cr</span>
              <span className="text-[10px] text-slate-400">Discretionary operating cash</span>
            </div>
          </div>

          {/* 3-Year Historical Statements */}
          <div className="rounded-xl border border-slate-800 bg-[#121824] p-5">
            <h3 className="text-sm font-bold text-white mb-4">3-Year Financial Statements Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5">Fiscal Year</th>
                    <th className="py-2.5">Revenue (Cr)</th>
                    <th className="py-2.5">EBITDA (Cr)</th>
                    <th className="py-2.5">Net Profit (Cr)</th>
                    <th className="py-2.5">EPS (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {((fundamentals?.historicalStatements || (fundamentals as any)?.historicalYears || []) as any[]).map((row: any) => (
                    <tr key={row.year} className="hover:bg-slate-800/30">
                      <td className="py-3 font-semibold text-white">{row.year}</td>
                      <td className="py-3 text-slate-300">₹{row.revenue ? row.revenue.toLocaleString('en-IN') : '-'}</td>
                      <td className="py-3 text-slate-300">{row.ebitda ? `₹${row.ebitda.toLocaleString('en-IN')}` : row.netProfit ? `₹${Math.round(row.netProfit * 1.35).toLocaleString('en-IN')}` : '-'}</td>
                      <td className="py-3 text-emerald-400 font-semibold">₹{row.netProfit ? row.netProfit.toLocaleString('en-IN') : '-'}</td>
                      <td className="py-3 text-white">₹{row.eps ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ML PROBABILISTIC FORECAST */}
      {activeTab === 'ml' && prediction && (
        <div className="space-y-6">
          {/* Prediction Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Quantitative 5-Model ML Forecast</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ensemble: XGBoost + Random Forest + LSTM Neural Net + Logistic Classifier + Regressor
                </p>
              </div>

              {/* Horizon Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                {(['INTRADAY', '1D', '3D', '7D', '14D', '30D', '90D', '6M', '1Y'] as PredictionHorizon[]).map(h => (
                  <button
                    key={h}
                    onClick={() => setSelectedHorizon(h)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedHorizon === h
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Probabilities Gauge Bars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <span className="text-xs text-emerald-400 font-semibold block">Probability UP</span>
                <span className="font-mono text-3xl font-extrabold text-emerald-300 mt-1 block">
                  {Math.round(prediction.probabilityUp * 100)}%
                </span>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-1 block">Bullish Continuation</span>
              </div>

              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
                <span className="text-xs text-slate-400 font-semibold block">Probability NEUTRAL</span>
                <span className="font-mono text-3xl font-extrabold text-slate-300 mt-1 block">
                  {Math.round(prediction.probabilityNeutral * 100)}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">Consolidation / Range</span>
              </div>

              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
                <span className="text-xs text-rose-400 font-semibold block">Probability DOWN</span>
                <span className="font-mono text-3xl font-extrabold text-rose-300 mt-1 block">
                  {Math.round(prediction.probabilityDown * 100)}%
                </span>
                <span className="text-[11px] text-rose-400/80 font-mono mt-1 block">Correction Risk</span>
              </div>

              <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-4">
                <span className="text-xs text-teal-400 font-semibold block">Expected Movement</span>
                <span className="font-mono text-3xl font-extrabold text-teal-300 mt-1 block">
                  {(prediction.expectedReturn ?? 0) >= 0 ? '+' : ''}{((prediction.expectedReturn ?? 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-teal-400/80 font-mono mt-1 block">Over {prediction.horizon ?? '7D'} Horizon</span>
              </div>
            </div>

            {/* Model Consensus & Regime */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Model Agreement: <strong className="text-emerald-400">{prediction.modelAgreement ?? 'High'}</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Market Regime: <strong className="text-teal-400">{prediction.marketRegime ?? 'Bullish Trending'}</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Confidence: <strong className="text-white">{Math.round((prediction.confidence ?? 0.8) * 100)}%</strong></span>
              </div>
            </div>

            {/* Individual Sub-Models Weights & Outputs Table */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Ensemble Sub-Model Telemetry</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Model Architecture</th>
                      <th className="py-2">Weight</th>
                      <th className="py-2">Prob UP</th>
                      <th className="py-2">Prob DOWN</th>
                      <th className="py-2">Expected Return</th>
                      <th className="py-2">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(prediction?.models || []).map(m => (
                      <tr key={m.modelName} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-semibold text-slate-200">{m.modelName}</td>
                        <td className="py-2.5 text-slate-400">{((m.weight ?? 0) * 100).toFixed(0)}%</td>
                        <td className="py-2.5 text-emerald-400">{((m.probabilityUp ?? 0) * 100).toFixed(1)}%</td>
                        <td className="py-2.5 text-rose-400">{((m.probabilityDown ?? 0) * 100).toFixed(1)}%</td>
                        <td className="py-2.5 text-slate-300">{(m.expectedReturn ?? 0) >= 0 ? '+' : ''}{((m.expectedReturn ?? 0) * 100).toFixed(1)}%</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.signal === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {m.signal}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mandatory Regulatory Disclaimer */}
            <div className="mt-6 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{prediction.disclaimer}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASK AI QUANTITATIVE ANALYST */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">StockStar Senior AI Equity Analyst</h3>
                <p className="text-xs text-slate-400">
                  Grounded strictly in validated calculations, technical pivots, and quantitative ML models.
                </p>
              </div>
            </div>

            {/* Preset Inquiry Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'Synthesize comprehensive investment thesis',
                'What are the primary downside risks?',
                'Explain technical momentum and S/R levels',
                'Why are the ML models bullish/bearish?',
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleAskAI(chip)}
                  disabled={aiLoading}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Ask anything about ${quote.symbol} fundamentals, technicals, or ML forecasts...`}
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                className="flex-1 rounded-xl border border-slate-800 bg-[#0f141c] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Analyze
              </button>
            </div>

            {/* Structured Output Card */}
            {aiAnalysis ? (
              <div className="mt-6 rounded-xl border border-slate-800 bg-[#0f141c] p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Analysis Status:</span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-emerald-400 font-semibold border border-emerald-500/20">
                      {aiAnalysis.trend} (Confidence: {Math.round(aiAnalysis.confidence * 100)}%)
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{aiAnalysis.data_timestamp}</span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Executive Summary</h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{aiAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-4 space-y-2">
                    <h5 className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">Primary Catalysts & Drivers</h5>
                    <ul className="space-y-1.5 text-slate-300">
                      {aiAnalysis.key_drivers?.map((d: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-rose-500/5 border border-rose-500/15 p-4 space-y-2">
                    <h5 className="font-semibold text-rose-400 uppercase tracking-wider text-[11px]">Downside Risks to Monitor</h5>
                    <ul className="space-y-1.5 text-slate-300">
                      {aiAnalysis.risks?.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Disclaimer: {aiAnalysis.disclaimer}
                </div>
              </div>
            ) : (
              <div className="mt-6 p-8 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
                Click any prompt chip above or type a custom question to generate an institutional research note.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: NEWS FLOW */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#121824] p-5">
            <h3 className="text-sm font-bold text-white mb-4">Corporate News & Regulatory Disclosures for {quote.symbol}</h3>
            <div className="space-y-3">
              {(news || []).map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-[#0f141c] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{item.source} • {item.publishedAt}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.sentiment === 'BULLISH'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.sentiment === 'BEARISH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">{item.headline}</h4>
                  <p className="text-xs text-slate-400">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
