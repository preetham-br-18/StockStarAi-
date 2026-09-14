import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  History,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Calculator,
  Plus,
  Zap,
  X,
  ChevronRight,
  Info,
  Layers,
  Target,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { PaperPortfolio, StockQuote } from '../types';
import { paperTradingService } from '../services/paperTradingService';
import { STOCKS_LIST } from '../services/marketDataStore';
import { askCopilot } from '../services/copilotService';

interface PaperTradingViewProps {
  onOpenOrderModal: (stock: StockQuote) => void;
  onSelectStock: (symbol: string) => void;
  onSelectTab?: (tab: string) => void;
  onCashUpdate?: (cash: number) => void;
  allQuotes?: StockQuote[];
}

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  onOpenOrderModal,
  onSelectStock,
  onSelectTab,
  onCashUpdate,
  allQuotes = [],
}) => {
  const [portfolio, setPortfolio] = useState<PaperPortfolio>(() => paperTradingService.getPortfolio());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'aiRisk' | 'guide'>('positions');

  // Modals & User Actions
  const [showResetModal, setShowResetModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [squareOffStock, setSquareOffStock] = useState<string | null>(null);
  const [customResetCash, setCustomResetCash] = useState<number>(1000000);
  const [topUpAmount, setTopUpAmount] = useState<number>(100000);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AI Portfolio Risk State
  const [aiReport, setAiReport] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Position Sizing Calculator State (for Guide section)
  const [calcCapital, setCalcCapital] = useState<number>(1000000);
  const [calcRiskPct, setCalcRiskPct] = useState<number>(1.0);
  const [calcEntryPrice, setCalcEntryPrice] = useState<number>(2850);
  const [calcStopLoss, setCalcStopLoss] = useState<number>(2765);

  // Top popular stocks for quick trade strip
  const [popularQuotes, setPopularQuotes] = useState<StockQuote[]>(() =>
    allQuotes.length > 0 ? allQuotes.slice(0, 8) : STOCKS_LIST.slice(0, 8)
  );

  const fetchPortfolio = async () => {
    // Recalculate based on current market quotes
    const current = paperTradingService.recalculatePortfolio();
    setPortfolio(current);
    if (typeof current.cashBalance === 'number') {
      onCashUpdate?.(current.cashBalance);
    }

    // Optional background sync if server is live
    try {
      const res = await fetch('/api/paper/portfolio');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.cashBalance === 'number') {
          setPortfolio(data);
          onCashUpdate?.(data.cashBalance);
        }
      }
    } catch {
      // Local copy is the resilient source of truth
    }
  };

  useEffect(() => {
    fetchPortfolio();

    if (allQuotes.length > 0) {
      setPopularQuotes(allQuotes.slice(0, 8));
    } else {
      setPopularQuotes(STOCKS_LIST.slice(0, 8));
    }
  }, [allQuotes]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Reset portfolio to ₹10,00,000 or custom
  const handleResetPortfolio = async (cashAmount = 1000000) => {
    setActionLoading(true);
    try {
      const newP = await paperTradingService.resetPortfolio(cashAmount);
      setPortfolio(newP);
      onCashUpdate?.(newP.cashBalance);
      showNotification(`Portfolio successfully reset to ₹${cashAmount.toLocaleString('en-IN')} virtual cash`);
      setShowResetModal(false);

      // Async sync
      fetch('/api/paper/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialCash: cashAmount }),
      }).catch(() => {});
    } catch (err: any) {
      showNotification(err.message || 'Error resetting portfolio', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Top up cash
  const handleTopUpCash = async (amount: number) => {
    setActionLoading(true);
    try {
      const newP = await paperTradingService.topUpCash(amount);
      setPortfolio(newP);
      onCashUpdate?.(newP.cashBalance);
      showNotification(`Added ₹${amount.toLocaleString('en-IN')} virtual cash. New balance: ₹${newP.cashBalance.toLocaleString('en-IN')}`);
      setShowTopUpModal(false);

      // Async sync
      fetch('/api/paper/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      }).catch(() => {});
    } catch (err: any) {
      showNotification(err.message || 'Error topping up funds', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Load demo starter positions
  const handleLoadDemo = async () => {
    setActionLoading(true);
    try {
      const newP = await paperTradingService.loadDemoPositions();
      setPortfolio(newP);
      onCashUpdate?.(newP.cashBalance);
      showNotification('Loaded 3 demo positions (Reliance, TCS, HDFC Bank) for simulation practice');

      // Async sync
      fetch('/api/paper/load-demo', { method: 'POST' }).catch(() => {});
    } catch (err: any) {
      showNotification('Error loading demo portfolio', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Square off single position
  const handleSquareOff = async (symbol: string) => {
    setActionLoading(true);
    try {
      const newP = await paperTradingService.closePosition(symbol);
      setPortfolio(newP);
      onCashUpdate?.(newP.cashBalance);
      showNotification(`Position in ${symbol} squared off at current market price! Funds credited.`);
      setSquareOffStock(null);

      // Async sync
      fetch('/api/paper/close-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      }).catch(() => {});
    } catch (err: any) {
      showNotification(err.message || 'Error squaring off', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateAiRiskReport = async () => {
    setAiLoading(true);
    try {
      // Try server first
      const res = await fetch('/api/ai/portfolio-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
        setActiveTab('aiRisk');
        return;
      }
    } catch {
      // Fall back to Copilot analytical audit
    }

    try {
      const copilotData = await askCopilot('Audit my paper trading portfolio risk, allocation, and maximum drawdown');
      const fallbackReport = {
        portfolioHealthScore: copilotData.confidenceScore || 85,
        riskRating: copilotData.sentiment === 'BULLISH' ? 'BALANCED_MODERATE' : 'ELEVATED',
        executiveSummary: copilotData.summary,
        strengths: copilotData.keyDrivers,
        vulnerabilities: copilotData.keyRisks,
        diversificationAnalysis: {
          sectorConcentration: portfolio.positions.length > 2 ? 'HEALTHY' : 'CONCENTRATED',
          largestHoldingPercent: portfolio.positions.length > 0 ? 35 : 0,
          hedgingStatus: 'CASH_BUFFER_ACTIVE',
        },
        actionableRecommendations: copilotData.recommendations,
      };
      setAiReport(fallbackReport);
      setActiveTab('aiRisk');
    } catch (err) {
      console.error('AI portfolio audit notice:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-xs font-mono text-slate-400">Loading virtual paper trading portfolio...</p>
      </div>
    );
  }

  const isTotalProfit = (portfolio.totalPnL ?? 0) >= 0;
  const isTodayProfit = (portfolio.todayPnL ?? 0) >= 0;
  const cashBalance = portfolio.cashBalance ?? 1000000;
  const portfolioValue = portfolio.portfolioValue ?? 1000000;
  const totalInvested = portfolio.totalInvested ?? 0;
  const cashPercent = portfolioValue > 0 ? Math.min(100, Math.max(0, (cashBalance / portfolioValue) * 100)) : 100;
  const investedPercent = portfolioValue > 0 ? Math.min(100, Math.max(0, (totalInvested / portfolioValue) * 100)) : 0;

  // Position Sizing calculations
  const riskPerShare = Math.max(0.05, calcEntryPrice - calcStopLoss);
  const maxRiskBudget = (calcCapital * (calcRiskPct / 100));
  const recommendedShares = riskPerShare > 0 ? Math.floor(maxRiskBudget / riskPerShare) : 0;
  const totalTradeCapital = recommendedShares * calcEntryPrice;
  const target1to2 = calcEntryPrice + (riskPerShare * 2);
  const potentialProfit = recommendedShares * (riskPerShare * 2);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl border transition-all animate-in fade-in slide-in-from-top-4 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Paper Trading Terminal</h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Simulated Execution
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-risk Indian market sandbox with standard <strong className="text-emerald-400 font-mono">₹10,00,000</strong> virtual starting cash
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Read how to use paper trading, order types, and risk management"
          >
            <BookOpen className="h-3.5 w-3.5 text-teal-400" />
            <span>Trader's Guide</span>
            <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[9px] text-teal-300 uppercase tracking-wider font-bold">
              How To
            </span>
          </button>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            title="Add virtual margin to practice with larger capital"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add Funds</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-rose-300 hover:border-rose-900/60 transition-all cursor-pointer"
            title="Reset portfolio back to ₹10,00,000"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400 hover:text-rose-400" />
            <span>Reset to ₹10L</span>
          </button>

          <button
            onClick={handleGenerateAiRiskReport}
            disabled={aiLoading}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {aiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Portfolio Audit
          </button>
        </div>
      </div>

      {/* Primary Virtual Cash Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#121824] via-[#0f172a] to-[#062c24] p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Wallet className="h-4 w-4" />
                Available Virtual Cash (Liquid)
              </span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-semibold">
                100% Risk-Free
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                ₹{cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                of ₹{portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Net Worth
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Virtual paper money for real-time practice. All buy orders instantly lock funds from this cash balance; all sell orders credit back proceeds immediately at live market quotes.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            {portfolio.positions.length === 0 && (
              <button
                onClick={handleLoadDemo}
                disabled={actionLoading}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 text-xs hover:bg-emerald-400 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                Load Demo Stocks (Reliance, TCS, HDFC)
              </button>
            )}
            <button
              onClick={() => handleResetPortfolio(1000000)}
              disabled={actionLoading}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3 text-slate-400" />
              Reset Balance to Exactly ₹10,00,000
            </button>
          </div>
        </div>

        {/* Capital Allocation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />
              Cash: <strong>₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> ({cashPercent.toFixed(1)}%)
            </span>
            <span className="text-slate-300 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-teal-400 inline-block" />
              Invested Capital: <strong>₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> ({investedPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800 flex">
            <div
              style={{ width: `${cashPercent}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Cash: ${cashPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${investedPercent}%` }}
              className="h-full bg-teal-400 transition-all duration-500"
              title={`Invested: ${investedPercent.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Financial Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <span className="text-slate-400 text-[11px] block font-sans">Total Portfolio Value</span>
          <span className="text-lg sm:text-xl font-bold text-white mt-1 block">
            ₹{portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Cash + Stock Holdings</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <span className="text-slate-400 text-[11px] block font-sans">Available Cash</span>
          <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 block">
            ₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-500/80 font-sans">Ready to Deploy</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <span className="text-slate-400 text-[11px] block font-sans">Total Invested</span>
          <span className="text-lg sm:text-xl font-bold text-slate-300 mt-1 block">
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 font-sans">{portfolio.positions.length} Open Positions</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <span className="text-slate-400 text-[11px] block font-sans">Unrealized P&L</span>
          <span className={`text-lg sm:text-xl font-bold mt-1 block ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTotalProfit ? '+' : ''}₹{(portfolio.totalPnL ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[10px] font-bold ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({isTotalProfit ? '+' : ''}{(portfolio.totalPnLPercent ?? 0).toFixed(2)}%)
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <span className="text-slate-400 text-[11px] block font-sans">Today's P&L</span>
          <span className={`text-lg sm:text-xl font-bold mt-1 block ${isTodayProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTodayProfit ? '+' : ''}₹{(portfolio.todayPnL ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[10px] font-bold ${isTodayProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({isTodayProfit ? '+' : ''}{(portfolio.todayPnLPercent ?? 0).toFixed(2)}%)
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121824] p-4">
          <span className="text-slate-400 text-[11px] block font-sans">Simulated XIRR</span>
          <span className="text-lg sm:text-xl font-bold text-teal-400 mt-1 block">
            +{portfolio.xirr ?? 0}%
          </span>
          <span className="text-[10px] text-slate-400">Max DD: {portfolio.maxDrawdown ?? 0}%</span>
        </div>
      </div>

      {/* Quick Trade Strip (Top Indian Stocks) */}
      <div className="rounded-xl border border-slate-800 bg-[#121824] p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Trade Popular NSE Stocks</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Click any stock to open instant order modal</span>
          </div>
          <button
            onClick={() => onSelectTab?.('screener')}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            Explore AI Screener <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {popularQuotes.map(stock => {
            const isUp = (stock.change ?? 0) >= 0;
            return (
              <button
                key={stock.symbol}
                onClick={() => onOpenOrderModal(stock)}
                className="group shrink-0 flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div className="flex flex-col text-left">
                  <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{stock.name}</span>
                </div>
                <div className="flex flex-col text-right font-mono">
                  <span className="text-white font-semibold">₹{(stock.price ?? 0).toLocaleString('en-IN')}</span>
                  <span className={`text-[10px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Open Positions ({portfolio.positions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Order History ({portfolio.orders.length})</span>
          </button>
          <button
            onClick={() => {
              if (!aiReport) handleGenerateAiRiskReport();
              setActiveTab('aiRisk');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'aiRisk'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Risk Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-teal-400" />
            <span>Complete User Guide</span>
            <span className="rounded-full bg-teal-400/20 px-1.5 py-0.2 text-[9px] text-teal-300 font-bold">
              New
            </span>
          </button>
        </div>

        <button
          onClick={fetchPortfolio}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Refresh portfolio state"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* POSITIONS TAB */}
      {activeTab === 'positions' && (
        <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
          {portfolio.positions.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your ₹10,00,000 is Ready to Deploy</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You currently have no open stock positions. Select any stock from the quick trade bar above or the Screener to execute your first risk-free paper trade.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleLoadDemo}
                  disabled={actionLoading}
                  className="w-full sm:w-auto rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 text-xs hover:bg-emerald-400 transition-all cursor-pointer"
                >
                  Load 3 Demo Stocks (Reliance, TCS, HDFC)
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="w-full sm:w-auto rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  Read How-To Guide
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-sans font-medium">Stock / Sector</th>
                    <th className="py-2.5 font-medium">Quantity</th>
                    <th className="py-2.5 font-medium">Avg Buy Price</th>
                    <th className="py-2.5 font-medium">LTP</th>
                    <th className="py-2.5 font-medium">Invested</th>
                    <th className="py-2.5 font-medium">Current Value</th>
                    <th className="py-2.5 font-medium">P&L (₹)</th>
                    <th className="py-2.5 font-medium">P&L (%)</th>
                    <th className="py-2.5 font-medium text-right font-sans">Trade Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(portfolio?.positions || []).map(pos => {
                    const isPosProfit = (pos.unrealizedPnL ?? 0) >= 0;
                    const stockQuote = popularQuotes.find(q => q.symbol === pos.symbol) || {
                      symbol: pos.symbol,
                      name: pos.stockName,
                      price: pos.currentPrice,
                      change: 0,
                      changePercent: 0,
                      high: pos.currentPrice * 1.02,
                      low: pos.currentPrice * 0.98,
                      volume: 100000,
                      marketCap: 500000000000,
                      pe: 25,
                      sector: pos.sector,
                      marketStatus: 'REGULAR_OPEN',
                    } as unknown as StockQuote;

                    return (
                      <tr key={pos.symbol} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3">
                          <button
                            onClick={() => {
                              onSelectStock(pos.symbol);
                              onSelectTab?.('terminal');
                            }}
                            className="font-bold text-white hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                          >
                            <span>{pos.symbol}</span>
                            <ArrowUpRight className="h-3 w-3 text-slate-500" />
                          </button>
                          <div className="text-[11px] text-slate-400 font-sans">{pos.stockName} • <span className="text-slate-500">{pos.sector}</span></div>
                        </td>
                        <td className="py-3 font-semibold text-white">{pos.quantity}</td>
                        <td className="py-3 text-slate-300">₹{(pos.averagePrice ?? 0).toFixed(2)}</td>
                        <td className="py-3 font-bold text-white">₹{(pos.currentPrice ?? 0).toFixed(2)}</td>
                        <td className="py-3 text-slate-300">₹{(pos.investedAmount ?? 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 font-bold text-white">₹{(pos.currentValue ?? 0).toLocaleString('en-IN')}</td>
                        <td className={`py-3 font-bold ${isPosProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPosProfit ? '+' : ''}₹{(pos.unrealizedPnL ?? 0).toFixed(2)}
                        </td>
                        <td className={`py-3 font-bold ${isPosProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPosProfit ? '+' : ''}{(pos.unrealizedPnLPercent ?? 0).toFixed(2)}%
                        </td>
                        <td className="py-3 text-right space-x-1.5 font-sans">
                          <button
                            onClick={() => onOpenOrderModal(stockQuote)}
                            className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                            title="Buy more shares of this stock"
                          >
                            Buy More
                          </button>
                          <button
                            onClick={() => setSquareOffStock(pos.symbol)}
                            className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                            title="Exit / Sell all shares immediately at current market price"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
          {portfolio.orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No orders executed yet in this session. Orders executed in paper trading will appear here in chronological sequence.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-sans font-medium">Order ID</th>
                    <th className="py-2.5 font-sans font-medium">Stock</th>
                    <th className="py-2.5 font-medium">Side</th>
                    <th className="py-2.5 font-medium">Type</th>
                    <th className="py-2.5 font-medium">Quantity</th>
                    <th className="py-2.5 font-medium">Executed Price</th>
                    <th className="py-2.5 font-medium">Total Value</th>
                    <th className="py-2.5 font-medium">Status</th>
                    <th className="py-2.5 font-medium">Execution Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {portfolio.orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 text-slate-400">{o.id}</td>
                      <td className="py-2.5 font-bold text-white">
                        {o.symbol}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">{o.stockName}</span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                            o.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {o.side}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">{o.orderType}</td>
                      <td className="py-2.5 text-white font-semibold">{o.quantity}</td>
                      <td className="py-2.5 text-slate-200">₹{(o.price ?? 0).toFixed(2)}</td>
                      <td className="py-2.5 text-slate-200">₹{(o.totalAmount ?? 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5">
                        <span className="rounded bg-teal-500/10 px-2 py-0.5 text-teal-400 font-semibold text-[10px]">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{new Date(o.executedAt || o.placedAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AI RISK & DIVERSIFICATION AUDIT TAB */}
      {activeTab === 'aiRisk' && (
        <div className="rounded-2xl border border-slate-800 bg-[#121824] p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Portfolio Risk & Concentration Audit</h3>
              <p className="text-xs text-slate-400">Quantitative evaluation of sector bias, asset concentration, and drawdown defense</p>
            </div>
          </div>

          {aiReport ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Diversification Health Score</span>
                    <p className="text-xs text-slate-400 mt-1">Cross-sector correlation index</p>
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-emerald-400">
                    {aiReport.diversification_score}<span className="text-slate-500 text-lg">/100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Concentration Risk Assessment</span>
                  <p className="text-xs text-slate-200">{aiReport.concentration_risk}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sector Allocation Exposure</h4>
                <p className="text-xs text-slate-300">{aiReport.sector_exposure_analysis}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tactical Portfolio Suggestions</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {aiReport.tactical_suggestions?.map((sug: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 font-mono">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{aiReport.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Generating institutional portfolio risk evaluation...
            </div>
          )}
        </div>
      )}

      {/* COMPREHENSIVE GUIDE & HOW-TO SECTION (USER REQUESTED) */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Guide Header */}
          <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-[#121824] via-[#0b1320] to-[#04201c] p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Paper Trading Master Guide & Playbook</h2>
                <p className="text-xs text-teal-300/80">
                  Complete blueprint for practicing Indian equity trading with ₹10,00,000 virtual capital
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Paper trading gives you an authentic, zero-risk simulation of the National Stock Exchange (NSE). Test quantitative AI predictions, chart breakouts, and swing strategies with real quotes—without risking any hard-earned savings.
            </p>
          </div>

          {/* Interactive Modules Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Module 1: The Virtual Cash System */}
            <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Wallet className="h-4 w-4" />
                <span>1. How Your ₹10,00,000 Virtual Capital Works</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you start, your account is credited with exactly <strong className="text-emerald-400 font-mono">₹10,00,000 (Ten Lakh Indian Rupees)</strong> in virtual margin:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Margin Deduction:</strong> Buying shares (e.g. 50 shares of Reliance at ₹2,880 = ₹1,44,000) instantly reduces your Available Cash.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Immediate Sale Crediting:</strong> Selling positions immediately returns the entire liquidation value (Principal + Profit/Loss) to your cash balance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Reset Anytime:</strong> If an experimental strategy experiences heavy drawdowns, click <em>Reset to ₹10L</em> to restart with a clean slate.</span>
                </li>
              </ul>
            </div>

            {/* Module 2: Order Types Explained */}
            <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Target className="h-4 w-4" />
                <span>2. Order Types (Market vs Limit vs Stop-Loss)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                StockStar AI supports three institutional order types to simulate professional execution:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-white font-mono">MARKET ORDER:</strong>
                  <p className="text-slate-400 mt-0.5">Executes immediately at the Current Market Price (LTP). Best when you want immediate fills on momentum breakouts.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-white font-mono">LIMIT ORDER:</strong>
                  <p className="text-slate-400 mt-0.5">Executes only if the price reaches your specified target or better. Prevents slippage when buying on dips.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-white font-mono">STOP-LOSS (SL):</strong>
                  <p className="text-slate-400 mt-0.5">Protects your capital by defining an automatic exit floor before placing a trade. Essential for discipline.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Module 3: Interactive Position Sizing Calculator (The 1% Rule) */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#121824] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Interactive Position Sizing Calculator (The 1% Rule)</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono">Professional Risk Sizing</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Professional hedge funds never risk more than <strong>1% to 2%</strong> of their total capital on any single trade. On a <strong>₹10,00,000</strong> portfolio, your maximum loss per trade should never exceed <strong>₹10,000 (1%)</strong>. Test the formula live below:
            </p>

            {/* Live Calculator Inputs & Output */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono">
              <div>
                <label className="text-[11px] text-slate-400 block font-sans mb-1">Account Capital (₹)</label>
                <input
                  type="number"
                  value={calcCapital}
                  onChange={e => setCalcCapital(Math.max(1000, Number(e.target.value)))}
                  className="w-full rounded-lg bg-[#121824] border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-sans mb-1">Max Risk Per Trade (%)</label>
                <select
                  value={calcRiskPct}
                  onChange={e => setCalcRiskPct(Number(e.target.value))}
                  className="w-full rounded-lg bg-[#121824] border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value={0.5}>0.5% (Conservative: ₹5,000)</option>
                  <option value={1.0}>1.0% (Standard: ₹10,000)</option>
                  <option value={2.0}>2.0% (Aggressive: ₹20,000)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-sans mb-1">Entry Buy Price (₹)</label>
                <input
                  type="number"
                  value={calcEntryPrice}
                  onChange={e => setCalcEntryPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg bg-[#121824] border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-sans mb-1">Stop-Loss Floor (₹)</label>
                <input
                  type="number"
                  value={calcStopLoss}
                  onChange={e => setCalcStopLoss(Math.min(calcEntryPrice - 0.5, Number(e.target.value)))}
                  className="w-full rounded-lg bg-[#121824] border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculator Output Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans block">Risk Per Share</span>
                <span className="text-base font-bold text-rose-400 mt-1 block">
                  ₹{riskPerShare.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">Entry - Stop Loss</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans block">Max Shares to Buy</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  {recommendedShares} Shares
                </span>
                <span className="text-[10px] text-slate-500">Limits loss to ₹{maxRiskBudget.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans block">Capital Required</span>
                <span className="text-base font-bold text-white mt-1 block">
                  ₹{totalTradeCapital.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">{((totalTradeCapital / calcCapital) * 100).toFixed(1)}% of ₹10L cash</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans block">Target (1:2 R:R)</span>
                <span className="text-base font-bold text-teal-300 mt-1 block">
                  ₹{target1to2.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400">+₹{potentialProfit.toLocaleString('en-IN')} upside</span>
              </div>
            </div>
          </div>

          {/* Module 4: Step-by-Step Tutorial & Best Practices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-2.5">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold text-[11px]">
                Step 1
              </span>
              <h4 className="text-sm font-bold text-white">Select Stock with High AI Confluence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visit the <strong>Home</strong> view or <strong>Screener</strong>. Look for stocks with high Model Agreement (e.g. 4/5 models Bullish) and Fundamental Scores above 75.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-2.5">
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-teal-400 font-bold text-[11px]">
                Step 2
              </span>
              <h4 className="text-sm font-bold text-white">Execute Buy & Set Target Brackets</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click <strong>Buy</strong> in the Order Modal. Enter calculated quantity from the 1% risk rule. Fill your Target Price (+10%) and Stop-Loss floor (-5%).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-2.5">
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-indigo-400 font-bold text-[11px]">
                Step 3
              </span>
              <h4 className="text-sm font-bold text-white">Monitor P&L & Square Off on Target</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track unrealized P&L in <strong>Open Positions</strong>. When your profit target is reached, click <strong>Square Off</strong> to lock in profits back to cash.
              </p>
            </div>
          </div>

          {/* Module 5: Frequently Asked Questions (FAQ) */}
          <div className="rounded-2xl border border-slate-800 bg-[#121824] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-white block">Can I lose real money in Paper Trading?</strong>
                <p className="text-slate-400">
                  Absolutely not. All transactions use simulated virtual margin credits (₹10,00,000 default balance). There is zero financial liability or bank connection.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-white block">Are prices real and accurate?</strong>
                <p className="text-slate-400">
                  Yes, prices reflect real-time/latest price telemetry from the National Stock Exchange (NSE), including 52-week extremes, day changes, and sector benchmarks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-white block">How do I start over with a clean ₹10,00,000?</strong>
                <p className="text-slate-400">
                  Click the <strong>Reset to ₹10L</strong> button in the top action bar anytime. This closes all open positions and resets your cash balance to ₹10,00,000 instantly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-white block">Can I add more virtual cash to practice large portfolios?</strong>
                <p className="text-slate-400">
                  Yes! Click <strong>Add Funds</strong> in the header to top up +₹1,00,000, +₹5,00,000, or any custom amount to practice managing institutional-sized books.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET PORTFOLIO CONFIRMATION */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121824] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <RotateCcw className="h-5 w-5" />
                <span>Reset Paper Portfolio</span>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear all open positions and order history, resetting your available virtual cash to fresh institutional capital.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block font-sans">Starting Cash Balance (₹)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomResetCash(500000)}
                  className={`py-2 text-xs font-mono rounded-lg border text-center transition-all cursor-pointer ${
                    customResetCash === 500000
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  ₹5,00,000
                </button>
                <button
                  type="button"
                  onClick={() => setCustomResetCash(1000000)}
                  className={`py-2 text-xs font-mono rounded-lg border text-center transition-all cursor-pointer ${
                    customResetCash === 1000000
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  ₹10,00,000 (Std)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomResetCash(2500000)}
                  className={`py-2 text-xs font-mono rounded-lg border text-center transition-all cursor-pointer ${
                    customResetCash === 2500000
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  ₹25,00,000
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPortfolio(customResetCash)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Resetting...' : `Confirm Reset to ₹${customResetCash.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOP UP VIRTUAL FUNDS */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121824] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Plus className="h-5 w-5" />
                <span>Add Virtual Cash Funds</span>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly top up your virtual trading cash balance without affecting existing open positions.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block font-sans">Quick Amount Selection</label>
              <div className="grid grid-cols-3 gap-2">
                {[100000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 text-xs font-mono rounded-lg border text-center transition-all cursor-pointer ${
                      topUpAmount === amt
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTopUpCash(topUpAmount)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Crediting...' : `Add ₹${topUpAmount.toLocaleString('en-IN')} Cash`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SQUARE OFF CONFIRMATION */}
      {squareOffStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#121824] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Confirm Square Off</span>
              </div>
              <button onClick={() => setSquareOffStock(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to exit and sell all shares of <strong className="text-white">{squareOffStock}</strong> at Current Market Price? All proceeds will be returned to your virtual cash balance immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSquareOffStock(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSquareOff(squareOffStock)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Closing...' : 'Yes, Square Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
