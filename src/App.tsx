import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MarketsView } from './components/MarketsView';
import { StockTerminalView } from './components/StockTerminalView';
import { ScreenerView } from './components/ScreenerView';
import { ComparisonView } from './components/ComparisonView';
import { ModelHubView } from './components/ModelHubView';
import { PaperTradingView } from './components/PaperTradingView';
import { LearnView } from './components/LearnView';
import { WatchlistView } from './components/WatchlistView';
import { OrderModal } from './components/OrderModal';
import {
  MarketIndex,
  StockQuote,
  MarketNews,
  MarketBreadth,
  MarketStatus,
  SectorPerformance,
} from './types';
import { ShieldAlert, Info, Sparkles, TrendingUp } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [loading, setLoading] = useState<boolean>(true);

  // Market Data States
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<StockQuote[]>([]);
  const [topLosers, setTopLosers] = useState<StockQuote[]>([]);
  const [mostActive, setMostActive] = useState<StockQuote[]>([]);
  const [aiOpportunities, setAiOpportunities] = useState<any[]>([]);
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [breadth, setBreadth] = useState<MarketBreadth | null>(null);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [allQuotes, setAllQuotes] = useState<StockQuote[]>([]);

  // Paper Portfolio Cash
  const [paperCash, setPaperCash] = useState<number>(1000000);

  // Order Execution Modal State
  const [orderModalStock, setOrderModalStock] = useState<StockQuote | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Initial Data Load
  const fetchMarketData = async () => {
    try {
      const [overviewRes, stocksRes, portfolioRes] = await Promise.all([
        fetch('/api/markets/overview'),
        fetch('/api/stocks'),
        fetch('/api/paper/portfolio'),
      ]);

      if (!overviewRes.ok || !stocksRes.ok || !portfolioRes.ok) {
        throw new Error(
          `API fetch error: overview=${overviewRes.status}, stocks=${stocksRes.status}, portfolio=${portfolioRes.status}`
        );
      }

      const overviewData = await overviewRes.json();
      const stocksData = await stocksRes.json();
      const portfolioData = await portfolioRes.json();

      setIndices(Array.isArray(overviewData.indices) ? overviewData.indices : []);
      setTopGainers(Array.isArray(overviewData.topGainers) ? overviewData.topGainers : []);
      setTopLosers(Array.isArray(overviewData.topLosers) ? overviewData.topLosers : []);
      setMostActive(Array.isArray(overviewData.mostActive) ? overviewData.mostActive : []);
      setAiOpportunities(Array.isArray(overviewData.aiOpportunities) ? overviewData.aiOpportunities : []);
      setSectors(Array.isArray(overviewData.sectors) ? overviewData.sectors : []);
      setBreadth(overviewData.breadth || null);
      setNews(Array.isArray(overviewData.news) ? overviewData.news : []);
      setMarketStatus(overviewData.status || null);

      setAllQuotes(Array.isArray(stocksData.stocks) ? stocksData.stocks : []);
      setPaperCash(portfolioData.cashBalance || 1000000);
    } catch (err) {
      console.error('Error fetching global market state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    // Periodic poll for market quotes every 10 seconds
    const interval = setInterval(() => {
      fetch('/api/markets/overview')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (!data) return;
          if (Array.isArray(data.indices)) setIndices(data.indices);
          if (data.status) setMarketStatus(data.status);
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleOpenOrderModal = (stock: StockQuote) => {
    setOrderModalStock(stock);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = async () => {
    try {
      const res = await fetch('/api/paper/portfolio');
      const data = await res.json();
      setPaperCash(data.cashBalance || 1000000);
    } catch (e) {
      console.error('Error refreshing cash balance:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e2e8f0] flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sticky Global Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        marketStatus={marketStatus}
        paperCash={paperCash}
        onSelectStock={sym => {
          setSelectedSymbol(sym);
          setCurrentTab('terminal');
        }}
        onOpenOrderModal={() => {
          const s = allQuotes.find(q => q.symbol === selectedSymbol) || allQuotes[0];
          if (s) handleOpenOrderModal(s);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-xs font-mono text-slate-400 animate-pulse">
              Initializing exchange streams & statistical quantitative engine...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeView
                indices={indices}
                topGainers={topGainers}
                topLosers={topLosers}
                mostActive={mostActive}
                aiOpportunities={aiOpportunities}
                sectors={sectors}
                breadth={breadth}
                news={news}
                marketStatus={marketStatus}
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'markets' && (
              <MarketsView
                indices={indices}
                sectors={sectors}
                breadth={breadth}
                status={marketStatus}
                allQuotes={allQuotes}
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'terminal' && (
              <StockTerminalView
                symbol={selectedSymbol}
                onOpenOrderModal={handleOpenOrderModal}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === 'screener' && (
              <ScreenerView
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'compare' && (
              <ComparisonView
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'ml' && (
              <ModelHubView
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'paper' && (
              <PaperTradingView
                onOpenOrderModal={handleOpenOrderModal}
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
                onCashUpdate={cash => setPaperCash(cash)}
                allQuotes={allQuotes}
              />
            )}

            {currentTab === 'learn' && <LearnView />}

            {currentTab === 'watchlist' && (
              <WatchlistView
                allQuotes={allQuotes}
                onSelectStock={sym => {
                  setSelectedSymbol(sym);
                  setCurrentTab('terminal');
                }}
                onSelectTab={setCurrentTab}
                onOpenOrderModal={handleOpenOrderModal}
              />
            )}
          </>
        )}
      </main>

      {/* Mandatory Statutory Disclaimer & Footer (PRD Section 41) */}
      <footer className="mt-16 border-t border-slate-800 bg-[#090c10] py-8 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-bold text-white tracking-wide">STOCKSTAR AI INTELLIGENCE SYSTEM</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Quantitative Machine Learning Ensemble • NSE/BSE & US Markets • SEBI/SEC Compliant Architecture
            </span>
          </div>

          <div className="rounded-xl bg-[#121824]/60 border border-slate-800/80 p-4 space-y-2 text-[11px] leading-relaxed text-slate-400">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Statutory Compliance & Regulatory Disclaimer</span>
            </div>
            <p>
              StockStar AI is an educational, analytical research, and simulated paper-trading platform. Machine learning forecasts (Gradient Boosting, Random Forest, Temporal LSTM, Logistic Classifier, Ridge Regressor) and Google Gemini contextual analyses produce probabilistic mathematical outputs based on historical patterns and publicly available financial reports.
            </p>
            <p>
              These outputs <strong className="text-slate-300">do not constitute investment advice, financial recommendations, or SEBI/SEC registered research reports</strong>. Securities markets involve substantial risk of capital loss. All trades executed in the paper trading simulator utilize virtual non-monetary credits (₹10,00,000 virtual balance) for simulation purposes only.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 pt-2">
            <span>© {new Date().getFullYear()} StockStar AI. Engineered for quantitative market intelligence.</span>
            <span>All financial quotes and depth are synchronized for high-precision simulation.</span>
          </div>
        </div>
      </footer>

      {/* Interactive Order Execution Modal */}
      <OrderModal
        stock={orderModalStock}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        availableCash={paperCash}
      />
    </div>
  );
}
