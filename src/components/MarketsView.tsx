import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  BarChart2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from 'lucide-react';
import { MarketIndex, StockQuote, SectorPerformance, MarketBreadth, MarketStatus } from '../types';

interface MarketsViewProps {
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  breadth: MarketBreadth | null;
  status: MarketStatus | null;
  allQuotes: StockQuote[];
  onSelectStock: (symbol: string) => void;
  onSelectTab: (tab: string) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  indices = [],
  sectors = [],
  breadth,
  status,
  allQuotes = [],
  onSelectStock,
  onSelectTab,
}) => {
  const [filterExchange, setFilterExchange] = useState<'ALL' | 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE'>('ALL');

  const safeQuotes = Array.isArray(allQuotes) ? allQuotes : [];
  const filteredQuotes = safeQuotes.filter(q => {
    if (filterExchange === 'ALL') return true;
    return q.exchange === filterExchange;
  });

  const sortedGainers = [...filteredQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
  const sortedLosers = [...filteredQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
  const sortedVolume = [...filteredQuotes].sort((a, b) => b.volume - a.volume).slice(0, 6);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Market Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Overview & Structure</h1>
          <p className="text-xs text-slate-400">Institutional market breadth, sector rotation, and global benchmarks</p>
        </div>

        {status && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#121824] px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
              <div className="flex flex-col">
                <span className="font-semibold text-white">{status.statusText}</span>
                <span className="text-[10px] text-slate-400">{status.sessionPhase}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="font-mono text-slate-300">
              {status.istTime} IST
            </div>
          </div>
        )}
      </div>

      {/* Global & Domestic Benchmark Indices Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(indices || []).map(idx => {
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="rounded-xl border border-slate-800 bg-[#121824] p-3.5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">{idx.name}</span>
                <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] font-mono text-slate-400">
                  {idx.exchange}
                </span>
              </div>
              <div className="font-mono text-base font-bold text-white tracking-tight">
                {idx.currency === 'INR' ? '₹' : '$'}{idx.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-mono">
                {isUp ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span className={isUp ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                  {isUp ? '+' : ''}{(idx.changePercent ?? 0).toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Breadth & 52-Week Statistics */}
      {breadth && (() => {
        const advances = breadth.advances ?? breadth.advancing ?? 0;
        const declines = breadth.declines ?? breadth.declining ?? 0;
        const unchanged = breadth.unchanged ?? 0;
        const total = advances + declines + unchanged || 1;
        const ratio = breadth.advanceDeclineRatio ?? (advances / (declines || 1));
        const safeRatio = typeof ratio === 'number' && !isNaN(ratio) ? ratio : 1;
        const highs52W = breadth.highs52W ?? breadth.new52High ?? 0;
        const lows52W = breadth.lows52W ?? breadth.new52Low ?? 0;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#121824] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">NSE Market Breadth (Advance / Decline)</h3>
                  <p className="text-xs text-slate-400">Overall market participation and institutional accumulation</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 font-mono text-xs text-emerald-400 font-semibold border border-slate-700">
                  ADR: {safeRatio.toFixed(2)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${(advances / total) * 100}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{ width: `${(declines / total) * 100}%` }}
                  />
                  <div
                    className="bg-slate-600 h-full transition-all"
                    style={{ width: `${(unchanged / total) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                    <div className="text-[11px] text-emerald-400 font-medium">Advancing</div>
                    <div className="font-mono text-lg font-bold text-emerald-300">{advances}</div>
                  </div>
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5">
                    <div className="text-[11px] text-rose-400 font-medium">Declining</div>
                    <div className="font-mono text-lg font-bold text-rose-300">{declines}</div>
                  </div>
                  <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-2.5">
                    <div className="text-[11px] text-slate-400 font-medium">Unchanged</div>
                    <div className="font-mono text-lg font-bold text-slate-300">{unchanged}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#121824] p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">52-Week Extreme Levels</h3>
                <p className="text-xs text-slate-400 mb-4">Stocks hitting yearly boundaries</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-xs text-emerald-300">New 52-Week Highs</div>
                    <div className="font-mono text-lg font-bold text-emerald-400">+{highs52W}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <div className="text-xs text-rose-300">New 52-Week Lows</div>
                    <div className="font-mono text-lg font-bold text-rose-400">-{lows52W}</div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                Broad market participation is positive with new highs dominating new lows by {highs52W}:{lows52W}.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sector Performance Heatmap */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Sector Performance & Capital Rotation</h3>
            <p className="text-xs text-slate-400">Relative strength analysis across primary market sectors</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(sectors || []).map(sec => {
            const changePct = sec.changePercent ?? 0;
            const isPositive = changePct >= 0;
            return (
              <div
                key={sec.name}
                className={`rounded-xl p-4 border transition-all ${
                  isPositive
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200 truncate">{sec.name}</span>
                  <span className={`font-mono text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Top: <span className="font-mono text-slate-300">{sec.topGainer}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Weight: {sec.marketCapShare ?? (sec as any).marketShare ?? '-'}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Movers: Gainers, Losers, Most Active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Gainers */}
        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Gainers</h4>
            </div>
          </div>
          <div className="space-y-2">
            {sortedGainers.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock.symbol);
                  onSelectTab('terminal');
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-mono font-semibold text-xs text-white">{stock.symbol}</div>
                  <div className="text-[10px] text-slate-400">{stock.name}</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-white">₹{stock.price ? stock.price.toLocaleString('en-IN') : '-'}</div>
                  <div className="text-emerald-400 font-semibold">+{(stock.changePercent ?? 0).toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Losers</h4>
            </div>
          </div>
          <div className="space-y-2">
            {sortedLosers.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock.symbol);
                  onSelectTab('terminal');
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-mono font-semibold text-xs text-white">{stock.symbol}</div>
                  <div className="text-[10px] text-slate-400">{stock.name}</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-white">₹{stock.price ? stock.price.toLocaleString('en-IN') : '-'}</div>
                  <div className="text-rose-400 font-semibold">{(stock.changePercent ?? 0).toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Volume */}
        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Most Active by Volume</h4>
            </div>
          </div>
          <div className="space-y-2">
            {sortedVolume.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock.symbol);
                  onSelectTab('terminal');
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-mono font-semibold text-xs text-white">{stock.symbol}</div>
                  <div className="text-[10px] text-slate-400">Vol: {((stock.volume ?? 0) / 100000).toFixed(2)}L shares</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-white">₹{stock.price ? stock.price.toLocaleString('en-IN') : '-'}</div>
                  <div className={(stock.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
