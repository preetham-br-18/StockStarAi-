import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  Award,
  ArrowRight,
  BarChart3,
  Search,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { MarketIndex, StockQuote, MarketNews, MarketBreadth, MarketStatus } from '../types';

interface HomeViewProps {
  indices: MarketIndex[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  mostActive: StockQuote[];
  aiOpportunities: any[];
  sectors: any[];
  breadth: MarketBreadth | null;
  news: MarketNews[];
  marketStatus: MarketStatus | null;
  onSelectStock: (symbol: string) => void;
  onSelectTab: (tab: string) => void;
  onAnalyzeNews?: (news: MarketNews) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  indices = [],
  topGainers = [],
  topLosers = [],
  mostActive = [],
  aiOpportunities = [],
  news = [],
  breadth,
  onSelectStock,
  onSelectTab,
}) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active' | 'ai'>('ai');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#121824] via-[#0f141c] to-[#0b0e14] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Exchange-Grade Intelligence & Quantitative ML Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Understand the Market <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Before You Trade It.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            StockStar AI combines validated Indian and Global market data, multi-factor fundamental audits, quantitative 5-model ML probability forecasting, and zero-risk paper trading.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-explore-terminal-btn"
              onClick={() => {
                onSelectStock('RELIANCE');
                onSelectTab('terminal');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all cursor-pointer"
            >
              Open Stock Terminal
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="hero-start-paper-trading-btn"
              onClick={() => onSelectTab('paper')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 text-emerald-400" />
              Practice Paper Trading (₹10L)
            </button>
            <button
              id="hero-start-screener-btn"
              onClick={() => onSelectTab('screener')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              AI Stock Screener
            </button>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-8 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Zero Hallucinations</p>
              <p className="text-slate-400 text-[11px]">Strict data validation layer</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">5-Model ML Ensemble</p>
              <p className="text-slate-400 text-[11px]">Probabilistic walk-forward edge</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Multi-Factor Scores</p>
              <p className="text-slate-400 text-[11px]">Transparent 0-100 logic</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Interactive Courses</p>
              <p className="text-slate-400 text-[11px]">Trading & Investing academies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Market Indices Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Key Market Indices</h2>
          <button
            onClick={() => onSelectTab('markets')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
          >
            Full Market Overview <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(indices || []).map(idx => {
            const isUp = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="rounded-xl border border-slate-800 bg-[#121824] p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">{idx.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{idx.exchange}</span>
                </div>
                <div className="font-mono text-base font-bold text-white tracking-tight">
                  {idx.currency === 'INR' ? '₹' : '$'}{idx.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-mono">
                  {isUp ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-rose-400" />
                  )}
                  <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                    {isUp ? '+' : ''}{(idx.changePercent ?? 0).toFixed(2)}%
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    ({isUp ? '+' : ''}{(idx.change ?? 0).toFixed(1)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Market Breadth Quick Bar */}
      {breadth && (() => {
        const advances = breadth.advances ?? breadth.advancing ?? 0;
        const declines = breadth.declines ?? breadth.declining ?? 0;
        const unchanged = breadth.unchanged ?? 0;
        const total = advances + declines + unchanged || 1;
        const ratio = breadth.advanceDeclineRatio ?? (advances / (declines || 1));
        const safeRatio = typeof ratio === 'number' && !isNaN(ratio) ? ratio : 1;

        return (
          <section className="rounded-xl border border-slate-800 bg-[#121824] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">NSE Market Breadth</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Ratio: {safeRatio.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Advances: <span className="font-bold">{advances}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Declines: <span className="font-bold">{declines}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Unchanged: <span className="font-bold">{unchanged}</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(advances / total) * 100}%` }}
                title={`Advances: ${advances}`}
              />
              <div
                className="bg-rose-500 h-full transition-all"
                style={{ width: `${(declines / total) * 100}%` }}
                title={`Declines: ${declines}`}
              />
              <div
                className="bg-slate-600 h-full transition-all"
                style={{ width: `${(unchanged / total) * 100}%` }}
                title={`Unchanged: ${unchanged}`}
              />
            </div>
          </section>
        );
      })()}

      {/* Market Movers & AI Opportunities Tabbed Section */}
      <section className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Market Radar & Opportunities</h2>
            <p className="text-xs text-slate-400">Real-time order flow and algorithmic stock rankings</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-slate-900/80 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('ai')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeTab === 'ai' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI High Conviction
            </button>
            <button
              onClick={() => setActiveTab('gainers')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeTab === 'gainers' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setActiveTab('losers')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeTab === 'losers' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Losers
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeTab === 'active' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Most Active
            </button>
          </div>
        </div>

        {/* Tab Content Tables */}
        <div className="mt-4 overflow-x-auto">
          {activeTab === 'ai' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 font-medium">Stock</th>
                  <th className="py-2.5 font-medium">LTP</th>
                  <th className="py-2.5 font-medium">Change</th>
                  <th className="py-2.5 font-medium">Fund. Score</th>
                  <th className="py-2.5 font-medium">Tech. Score</th>
                  <th className="py-2.5 font-medium">ML 7D Prob UP</th>
                  <th className="py-2.5 font-medium">Expected Movement</th>
                  <th className="py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(aiOpportunities || []).map(stock => (
                  <tr key={stock.symbol} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3">
                      <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-[11px] text-slate-400">{stock.name}</div>
                    </td>
                    <td className="py-3 font-mono font-medium text-white">
                      ₹{stock.price ? stock.price.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className={`py-3 font-mono font-medium ${(stock.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-3">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
                        {stock.fundamentalScore ?? 75}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-teal-400 border border-teal-500/20">
                        {stock.technicalScore ?? 70}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full"
                            style={{ width: `${(stock.probabilityUp ?? 0.5) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {((stock.probabilityUp ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-emerald-400">
                      +{((stock.expectedReturn ?? 0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          onSelectStock(stock.symbol);
                          onSelectTab('terminal');
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeTab === 'gainers' || activeTab === 'losers' || activeTab === 'active') && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 font-medium">Stock</th>
                  <th className="py-2.5 font-medium">Sector</th>
                  <th className="py-2.5 font-medium">LTP</th>
                  <th className="py-2.5 font-medium">Change</th>
                  <th className="py-2.5 font-medium">Volume</th>
                  <th className="py-2.5 font-medium">P/E</th>
                  <th className="py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {((activeTab === 'gainers' ? topGainers : activeTab === 'losers' ? topLosers : mostActive) || []).map(stock => (
                  <tr key={stock.symbol} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3">
                      <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-[11px] text-slate-400">{stock.name}</div>
                    </td>
                    <td className="py-3 text-slate-400">{stock.sector}</td>
                    <td className="py-3 font-mono font-medium text-white">
                      {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3 font-mono font-medium ${(stock.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-3 font-mono text-slate-400">
                      {((stock.volume ?? 0) / 100000).toFixed(2)}L
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {stock.peRatio}x
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          onSelectStock(stock.symbol);
                          onSelectTab('terminal');
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        Terminal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Live Financial News & Institutional Analysis */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Market Intelligence & News Flow</h2>
            <p className="text-xs text-slate-400">Real-time corporate announcements, macro developments & sentiment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(news || []).slice(0, 3).map(item => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-[#121824] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-emerald-400">{item.symbol}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    item.sentiment === 'BULLISH'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.sentiment === 'BEARISH'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.sentiment}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                  {item.headline}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.source} • {item.publishedAt}</span>
                <button
                  onClick={() => {
                    onSelectStock(item.symbol);
                    onSelectTab('terminal');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
                >
                  Analyze Stock <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
