import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  X,
  TrendingUp,
  Cpu,
  BarChart2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { STOCKS_UNIVERSE } from '../services/marketDataStore';

interface ComparisonViewProps {
  onSelectStock: (symbol: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  onSelectStock,
  onSelectTab,
}) => {
  const [symbols, setSymbols] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSymbolInput, setNewSymbolInput] = useState('');

  const getLocalComparison = (symList: string[]) => {
    return symList
      .map(sym => {
        const item = STOCKS_UNIVERSE[sym];
        if (!item) return null;
        return {
          symbol: item.quote.symbol,
          name: item.quote.name,
          exchange: item.quote.exchange,
          price: item.quote.price,
          changePercent: item.quote.changePercent,
          sector: item.quote.sector,
          marketCap: item.quote.marketCap,
          peRatio: item.fundamentals.peRatio,
          pbRatio: item.fundamentals.pbRatio,
          roe: item.fundamentals.roe,
          roce: item.fundamentals.roce,
          debtToEquity: item.fundamentals.debtToEquity,
          operatingMargin: item.fundamentals.ebitdaMargin,
          dividendYield: item.fundamentals.dividendYield,
          rsi14: item.technicals.rsi14,
          sma20: item.technicals.sma20,
          sma50: item.technicals.sma50,
          sma200: item.technicals.sma200,
          fundamentalScore: item.fundamentals.fundamentalScore,
          technicalScore: item.technicals.technicalScore,
        };
      })
      .filter(Boolean);
  };

  const fetchComparison = async (symList: string[]) => {
    setLoading(true);
    // Instant local evaluation
    const localData = getLocalComparison(symList);
    setData(localData);

    try {
      const res = await fetch('/api/stocks/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: symList }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.comparison) && json.comparison.length > 0) {
          setData(json.comparison);
        }
      }
    } catch {
      // Local comparison is preserved
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(symbols);
  }, [symbols]);

  const addSymbol = () => {
    const s = newSymbolInput.trim().toUpperCase();
    if (s && !symbols.includes(s) && symbols.length < 5) {
      const updated = [...symbols, s];
      setSymbols(updated);
      setNewSymbolInput('');
    }
  };

  const removeSymbol = (sym: string) => {
    if (symbols.length <= 1) return;
    setSymbols(symbols.filter(s => s !== sym));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Stock Comparison Matrix</h1>
        <p className="text-xs text-slate-400">Evaluate up to 5 equities side-by-side across valuation, profitability, health & ML forecasts</p>
      </div>

      {/* Symbol selection bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#121824]">
        <span className="text-xs font-semibold text-slate-300">Selected Tickers ({symbols.length}/5):</span>
        <div className="flex flex-wrap gap-2">
          {symbols.map(s => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-mono font-semibold text-emerald-400"
            >
              {s}
              {symbols.length > 1 && (
                <button
                  onClick={() => removeSymbol(s)}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {symbols.length < 5 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              type="text"
              placeholder="Add symbol (e.g. TATAMOTORS)"
              value={newSymbolInput}
              onChange={e => setNewSymbolInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSymbol()}
              className="rounded-lg border border-slate-800 bg-[#0f141c] px-3 py-1 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={addSymbol}
              className="rounded-lg bg-emerald-500 p-1.5 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Comparison Grid Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Fetching comparative metrics across universe...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 font-semibold text-slate-300 font-sans w-48">Metric / Dimension</th>
                  {data.map(item => (
                    <th key={item.symbol} className="py-3 font-bold text-white text-base">
                      {item.symbol}
                      <span className="block text-[10px] font-normal text-slate-400 font-sans truncate">
                        {item.quote?.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Price & Valuation */}
                <tr className="bg-slate-900/30">
                  <td colSpan={data.length + 1} className="py-2 text-[11px] font-sans font-semibold text-emerald-400 uppercase tracking-wider">
                    Price & Valuation Ratios
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Current Price</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 font-bold text-white">
                      {i.quote?.price ? `₹${i.quote.price.toLocaleString('en-IN')}` : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Day Change</td>
                  {data.map(i => {
                    const changePct = i.quote?.changePercent ?? 0;
                    return (
                      <td key={i.symbol} className={`py-2.5 font-semibold ${changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">P/E Ratio</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-slate-200">
                      {i.quote?.peRatio}x
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">P/B Ratio</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-slate-200">
                      {i.quote?.pbRatio}x
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Dividend Yield</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-slate-200">
                      {i.quote?.dividendYield}%
                    </td>
                  ))}
                </tr>

                {/* Profitability & Health */}
                <tr className="bg-slate-900/30">
                  <td colSpan={data.length + 1} className="py-2 text-[11px] font-sans font-semibold text-emerald-400 uppercase tracking-wider">
                    Financial Quality & Capital Efficiency
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Return on Equity (ROE)</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-emerald-400 font-bold">
                      {i.fundamentals?.roe}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">ROCE</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-teal-400 font-semibold">
                      {i.fundamentals?.roce}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Debt to Equity</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-slate-200">
                      {i.fundamentals?.debtToEquity}x
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Net Profit Margin</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 text-slate-200">
                      {i.fundamentals?.netProfitMargin}%
                    </td>
                  ))}
                </tr>

                {/* Intelligence Scores & ML Forecast */}
                <tr className="bg-slate-900/30">
                  <td colSpan={data.length + 1} className="py-2 text-[11px] font-sans font-semibold text-emerald-400 uppercase tracking-wider">
                    AI Scores & 7-Day ML Probability Forecast
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Fundamental Score</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold border border-emerald-500/20">
                        {i.fundamentals?.fundamentalScore}/100
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Technical Score</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5">
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-teal-400 font-bold border border-teal-500/20">
                        {i.technicals?.technicalScore}/100
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">7-Day Prob. UP</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 font-bold text-emerald-400">
                      {Math.round((i.prediction?.probabilityUp || 0) * 100)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Expected Return</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5 font-semibold text-teal-300">
                      {((i.prediction?.expectedReturn || 0) * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-sans">Action</td>
                  {data.map(i => (
                    <td key={i.symbol} className="py-2.5">
                      <button
                        onClick={() => {
                          onSelectStock(i.symbol);
                          onSelectTab?.('terminal');
                        }}
                        className="rounded bg-slate-800 px-3 py-1 font-sans text-[11px] font-medium text-slate-200 hover:text-emerald-400 transition-colors"
                      >
                        Terminal &rarr;
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
