import React, { useState, useEffect } from 'react';
import {
  Bell,
  Star,
  Trash2,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StockQuote, PriceAlert } from '../types';

interface WatchlistViewProps {
  allQuotes: StockQuote[];
  onSelectStock: (symbol: string) => void;
  onSelectTab: (tab: string) => void;
  onOpenOrderModal: (stock: StockQuote) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  allQuotes = [],
  onSelectStock,
  onSelectTab,
  onOpenOrderModal,
}) => {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([
    'RELIANCE',
    'TCS',
    'HDFCBANK',
    'INFY',
    'TATAMOTORS',
    'AAPL',
    'NVDA',
  ]);

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // New alert form state
  const [alertSymbol, setAlertSymbol] = useState('RELIANCE');
  const [alertType, setAlertType] = useState<PriceAlert['type']>('PRICE_ABOVE');
  const [alertThreshold, setAlertThreshold] = useState(3000);
  const [alertNote, setAlertNote] = useState('');

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : (data.alerts || []));
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: alertSymbol,
          type: alertType,
          threshold: alertThreshold,
          note: alertNote || `${alertType} trigger for ${alertSymbol}`,
        }),
      });
      const data = await res.json();
      if (data.alert) {
        setAlerts([data.alert, ...(alerts || [])]);
        setAlertNote('');
      }
    } catch (e) {
      console.error('Error creating alert:', e);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      setAlerts((alerts || []).filter(a => a.id !== id));
    } catch (e) {
      console.error('Error deleting alert:', e);
    }
  };

  const toggleWatchlist = (sym: string) => {
    if (watchlistSymbols.includes(sym)) {
      setWatchlistSymbols(watchlistSymbols.filter(s => s !== sym));
    } else {
      setWatchlistSymbols([...watchlistSymbols, sym]);
    }
  };

  const safeQuotes = Array.isArray(allQuotes) ? allQuotes : [];
  const safeSymbols = Array.isArray(watchlistSymbols) ? watchlistSymbols : [];
  const watchlistQuotes = safeQuotes.filter(q => safeSymbols.includes(q.symbol));

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Watchlists & Real-Time Price Alerts</h1>
        <p className="text-xs text-slate-400">Track key assets and configure mathematical threshold notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h2 className="text-base font-bold text-white">Primary Watchlist ({watchlistQuotes.length})</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-sans font-medium">Stock</th>
                    <th className="py-2.5 font-medium">LTP</th>
                    <th className="py-2.5 font-medium">Change</th>
                    <th className="py-2.5 font-medium">52W Range</th>
                    <th className="py-2.5 font-medium">P/E</th>
                    <th className="py-2.5 font-medium text-right font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {watchlistQuotes.map(stock => {
                    const isUp = stock.change >= 0;
                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleWatchlist(stock.symbol)}
                              className="text-amber-400 hover:text-slate-500"
                            >
                              <Star className="h-3.5 w-3.5 fill-amber-400" />
                            </button>
                            <div>
                              <div className="font-bold text-white">{stock.symbol}</div>
                              <div className="text-[10px] text-slate-400 font-sans">{stock.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-white">
                          {stock.currency === 'INR' ? '₹' : '$'}{stock.price ? stock.price.toLocaleString('en-IN') : '-'}
                        </td>
                        <td className={`py-3 font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                        </td>
                        <td className="py-3 text-slate-300 text-[11px]">
                          {(stock as any).week52Low ?? stock.fiftyTwoWeekLow ?? '-'} - {(stock as any).week52High ?? stock.fiftyTwoWeekHigh ?? '-'}
                        </td>
                        <td className="py-3 text-slate-300">{stock.peRatio}x</td>
                        <td className="py-3 text-right space-x-1 font-sans">
                          <button
                            onClick={() => {
                              onSelectStock(stock.symbol);
                              onSelectTab('terminal');
                            }}
                            className="rounded bg-slate-800 px-2.5 py-1 text-slate-200 hover:text-emerald-400 text-[11px]"
                          >
                            Terminal
                          </button>
                          <button
                            onClick={() => onOpenOrderModal(stock)}
                            className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium hover:bg-emerald-500/30 cursor-pointer"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts Manager */}
        <div className="space-y-4">
          {/* Create Alert Form */}
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Set Quantitative Alert</h3>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Asset</label>
                <select
                  value={alertSymbol}
                  onChange={e => setAlertSymbol(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white font-mono"
                >
                  {allQuotes.map(q => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol} ({q.currency === 'INR' ? '₹' : '$'}{q.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Condition</label>
                <select
                  value={alertType}
                  onChange={e => setAlertType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white font-mono"
                >
                  <option value="PRICE_ABOVE">Price Above Threshold</option>
                  <option value="PRICE_BELOW">Price Below Threshold</option>
                  <option value="RSI_THRESHOLD">RSI(14) Boundary Breach</option>
                  <option value="PERCENT_CHANGE_DAILY">Daily % Change Breakout</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Threshold Value</label>
                <input
                  type="number"
                  step="any"
                  value={alertThreshold}
                  onChange={e => setAlertThreshold(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Resistance breakout trigger"
                  value={alertNote}
                  onChange={e => setAlertNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg cursor-pointer"
              >
                Create Alert
              </button>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Alerts ({alerts.length})
            </h4>

            <div className="space-y-2">
              {alerts.map(a => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#0f141c] text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{a.symbol}</span>
                      <span className="text-[10px] text-emerald-400">{a.type}</span>
                      <span className="text-white font-semibold">₹{a.threshold}</span>
                    </div>
                    {a.note && <div className="text-[10px] text-slate-400 font-sans mt-0.5">{a.note}</div>}
                  </div>

                  <button
                    onClick={() => handleDeleteAlert(a.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
