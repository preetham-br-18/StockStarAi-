import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Search,
  Activity,
  Layers,
  Cpu,
  GraduationCap,
  Wallet,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Bell,
  Scale,
  X,
} from 'lucide-react';
import { MarketStatus, StockQuote } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  marketStatus: MarketStatus | null;
  paperCash: number;
  onSelectStock: (symbol: string) => void;
  onOpenOrderModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  marketStatus,
  paperCash,
  onSelectStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navItems = [
    { id: 'home', label: 'Home', icon: TrendingUp },
    { id: 'markets', label: 'Markets', icon: Activity },
    { id: 'terminal', label: 'Terminal', icon: Layers },
    { id: 'screener', label: 'Screener', icon: SlidersHorizontal },
    { id: 'compare', label: 'Compare', icon: Scale },
    { id: 'ml', label: 'ML & Backtest', icon: Cpu },
    { id: 'paper', label: 'Paper Trading', icon: Wallet },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'watchlist', label: 'Watchlist & Alerts', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0b0e14]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand Logo & Market Status Badge */}
          <div className="flex items-center gap-4">
            <button
              id="brand-logo-btn"
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-lg tracking-tight text-white">StockStar</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400 border border-emerald-500/20">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">NSE / BSE & US Equities</span>
              </div>
            </button>

            {/* Dynamic Market Status Indicator */}
            {marketStatus && (
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs">
                <span className={`inline-block h-2 w-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
                <span className={`font-mono text-[11px] font-medium ${marketStatus.isOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {marketStatus.statusText}
                </span>
                <span className="text-slate-600">|</span>
                <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {marketStatus.istTime} IST
                </span>
              </div>
            )}
          </div>

          {/* Global Fuzzy Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="global-stock-search-input"
                type="text"
                placeholder="Search stocks (e.g. RELIANCE, TCS, AAPL)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                className="w-full rounded-lg border border-slate-800 bg-[#121824] py-1.5 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-[#121824] shadow-2xl z-50 divide-y divide-slate-800/60">
                {searchResults.length > 0 ? (
                  searchResults.map(stock => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        onSelectStock(stock.symbol);
                        onSelectTab('terminal');
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                            {stock.exchange}
                          </span>
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            {stock.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{stock.sector}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-semibold text-white">
                          {stock.currency === 'INR' ? '₹' : '$'}{stock.price ? stock.price.toLocaleString('en-IN') : '-'}
                        </span>
                        <span className={`font-mono text-[11px] ${(stock.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {isSearching ? 'Searching market universe...' : 'No matching stocks found'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action: Virtual Capital Badge */}
          <div className="flex items-center gap-2">
            <button
              id="paper-trading-header-badge"
              onClick={() => onSelectTab('paper')}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
              title="Click to manage paper portfolio"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400/80 font-medium">Virtual Cash</span>
                <span className="font-mono font-bold text-white text-[11px] sm:text-xs">
                  ₹{paperCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-800/60">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
