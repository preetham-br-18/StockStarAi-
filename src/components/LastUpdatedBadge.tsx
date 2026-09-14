import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

interface LastUpdatedBadgeProps {
  onRefresh?: () => void;
  className?: string;
  showSeconds?: boolean;
}

export const LastUpdatedBadge: React.FC<LastUpdatedBadgeProps> = ({
  onRefresh,
  className = '',
  showSeconds = true,
}) => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setSecondsAgo(0);
    onRefresh?.();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: true,
    });
  };

  return (
    <div
      id="live-data-last-updated-badge"
      className={`inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0f1420]/80 px-2.5 py-1 text-xs text-slate-300 backdrop-blur-sm shadow-sm ${className}`}
      title="Real-time market feed timestamp"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <span className="text-emerald-400 font-semibold tracking-wide">LIVE</span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="text-slate-400 hidden sm:inline">Updated:</span>
        <span className="text-slate-200 font-medium">{formatTime(lastUpdated)}</span>
        <span className="text-slate-500 text-[10px] hidden md:inline">
          ({secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`})
        </span>
      </div>

      <button
        id="manual-refresh-data-btn"
        onClick={handleManualRefresh}
        className="rounded-full p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        title="Refresh market data feed"
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
      </button>
    </div>
  );
};
