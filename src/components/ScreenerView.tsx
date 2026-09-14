import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { StockQuote } from '../types';
import { STOCKS_UNIVERSE } from '../services/marketDataStore';

interface ScreenerViewProps {
  onSelectStock: (symbol: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  onSelectStock,
  onSelectTab,
}) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [sector, setSector] = useState('');
  const [marketCapMin, setMarketCapMin] = useState<number | ''>('');
  const [peMax, setPeMax] = useState<number | ''>('');
  const [roeMin, setRoeMin] = useState<number | ''>('');
  const [roceMin, setRoceMin] = useState<number | ''>('');
  const [rsiMax, setRsiMax] = useState<number | ''>('');
  const [rsiMin, setRsiMin] = useState<number | ''>('');
  const [minAiScore, setMinAiScore] = useState<number | ''>('');

  // Natural Language AI Screener
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Local filtering engine
  const filterLocally = () => {
    return Object.values(STOCKS_UNIVERSE)
      .filter(item => {
        const { quote, fundamentals, technicals } = item;
        if (sector && quote.sector.toLowerCase() !== sector.toLowerCase()) return false;
        if (peMax !== '' && fundamentals.peRatio > Number(peMax)) return false;
        if (roeMin !== '' && fundamentals.roe < Number(roeMin)) return false;
        if (roceMin !== '' && fundamentals.roce < Number(roceMin)) return false;
        if (rsiMax !== '' && technicals.rsi14 > Number(rsiMax)) return false;
        if (rsiMin !== '' && technicals.rsi14 < Number(rsiMin)) return false;
        if (minAiScore !== '' && fundamentals.fundamentalScore < Number(minAiScore)) return false;
        return true;
      })
      .map(s => ({
        symbol: s.quote.symbol,
        name: s.quote.name,
        exchange: s.quote.exchange,
        sector: s.quote.sector,
        price: s.quote.price,
        changePercent: s.quote.changePercent,
        peRatio: s.fundamentals.peRatio,
        roe: s.fundamentals.roe,
        roce: s.fundamentals.roce,
        rsi14: s.technicals.rsi14,
        aiScore: s.fundamentals.fundamentalScore,
        marketCap: s.quote.marketCap,
      }));
  };

  // Fetch results based on active filters
  const applyFilters = async () => {
    setLoading(true);
    // Instant local evaluation
    const localMatches = filterLocally();
    setResults(localMatches);

    try {
      const params = new URLSearchParams();
      if (sector) params.append('sector', sector);
      if (marketCapMin) params.append('marketCapMin', marketCapMin.toString());
      if (peMax) params.append('peMax', peMax.toString());
      if (roeMin) params.append('roeMin', roeMin.toString());
      if (roceMin) params.append('roceMin', roceMin.toString());
      if (rsiMax) params.append('rsiMax', rsiMax.toString());
      if (rsiMin) params.append('rsiMin', rsiMin.toString());
      if (minAiScore) params.append('minAiScore', minAiScore.toString());

      const res = await fetch(`/api/screener?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results);
        }
      }
    } catch {
      // Local evaluation is preserved
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [sector, marketCapMin, peMax, roeMin, roceMin, rsiMax, rsiMin, minAiScore]);

  // Apply Preset Screens
  const applyPreset = (presetName: string) => {
    resetFilters();
    setAiExplanation(null);
    if (presetName === 'VALUE') {
      setPeMax(28);
      setRoeMin(18);
      setMinAiScore(75);
    } else if (presetName === 'GROWTH') {
      setRoeMin(20);
      setRoceMin(20);
      setMinAiScore(80);
    } else if (presetName === 'OVERSOLD') {
      setRsiMax(48);
      setMinAiScore(70);
    } else if (presetName === 'LARGECAP_QUALITY') {
      setMarketCapMin(150000);
      setRoeMin(16);
      setMinAiScore(80);
    }
  };

  const resetFilters = () => {
    setSector('');
    setMarketCapMin('');
    setPeMax('');
    setRoeMin('');
    setRoceMin('');
    setRsiMax('');
    setRsiMin('');
    setMinAiScore('');
    setAiExplanation(null);
  };

  // AI Screener submit
  const handleAiScreen = async () => {
    if (!aiPrompt.trim()) return;
    setAiParsing(true);
    const q = aiPrompt.toLowerCase();

    // Client-side instant semantic parser
    if (q.includes('value') || q.includes('cheap')) {
      setPeMax(25);
      setRoeMin(18);
      setAiExplanation('Screening for high ROE (>18%) companies trading at conservative valuation (P/E < 25x).');
    } else if (q.includes('growth') || q.includes('compounder')) {
      setRoeMin(22);
      setRoceMin(22);
      setMinAiScore(85);
      setAiExplanation('Screening for compounding champions with both ROE and ROCE exceeding 22%.');
    } else if (q.includes('oversold') || q.includes('reversal')) {
      setRsiMax(45);
      setAiExplanation('Filtering for technically oversold stocks with RSI(14) < 45 indicating reversal potential.');
    } else if (q.includes('bank') || q.includes('finance')) {
      setSector('Banking & Finance');
      setRoeMin(15);
      setAiExplanation('Screening quality Indian private & PSU banking majors with ROE > 15%.');
    } else if (q.includes('tech') || q.includes('it')) {
      setSector('Information Technology');
      setRoeMin(20);
      setAiExplanation('Screening premier IT export leaders with strong return on equity.');
    } else {
      setMinAiScore(80);
      setAiExplanation(`Applying institutional multi-factor screen for query: "${aiPrompt}".`);
    }

    try {
      const res = await fetch('/api/screener/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.explanation) setAiExplanation(data.explanation);
        if (data.filters) {
          if (data.filters.roeMin) setRoeMin(data.filters.roeMin);
          if (data.filters.peMax) setPeMax(data.filters.peMax);
          if (data.filters.rsiMax) setRsiMax(data.filters.rsiMax);
          if (data.filters.rsiMin) setRsiMin(data.filters.rsiMin);
          if (data.filters.marketCapMin) setMarketCapMin(data.filters.marketCapMin);
          if (data.filters.sector) setSector(data.filters.sector);
        }
      }
    } catch {
      // Local filter already set
    } finally {
      setAiParsing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">AI & Multi-Factor Stock Screener</h1>
        <p className="text-xs text-slate-400">Filter the market universe using institutional financial ratios and natural language queries</p>
      </div>

      {/* Natural Language AI Screener Bar (PRD Section 28) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Natural Language AI Screener</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Type queries like: <em>"Find large-cap Indian stocks with ROE over 15% and RSI below 60"</em> or <em>"Show undervalued high quality companies"</em>
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Find large-cap stocks with ROE > 15% and RSI < 60..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiScreen()}
            className="flex-1 rounded-xl border border-slate-800 bg-[#0f141c] px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleAiScreen}
            disabled={aiParsing}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {aiParsing ? 'Parsing...' : 'AI Screen'}
          </button>
        </div>

        {aiExplanation && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{aiExplanation}</span>
          </div>
        )}
      </div>

      {/* Preset Screeners Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
        <button
          onClick={() => applyPreset('GROWTH')}
          className="rounded-lg border border-slate-800 bg-[#121824] px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          High Growth (ROE &gt; 20%)
        </button>
        <button
          onClick={() => applyPreset('VALUE')}
          className="rounded-lg border border-slate-800 bg-[#121824] px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          Value Bargains (P/E &lt; 28, High ROE)
        </button>
        <button
          onClick={() => applyPreset('OVERSOLD')}
          className="rounded-lg border border-slate-800 bg-[#121824] px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          Oversold Quality (RSI &lt; 48)
        </button>
        <button
          onClick={() => applyPreset('LARGECAP_QUALITY')}
          className="rounded-lg border border-slate-800 bg-[#121824] px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          Bluechip Quality Giants
        </button>
        <button
          onClick={resetFilters}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Manual Filter Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 p-4 rounded-xl border border-slate-800 bg-[#121824] text-xs">
        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Sector</label>
          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">All Sectors</option>
            <option value="Information Technology">IT</option>
            <option value="Banking & Financial Services">Banking</option>
            <option value="Energy & Petrochemicals">Energy</option>
            <option value="Automobile">Automobile</option>
            <option value="Pharmaceuticals">Pharma</option>
            <option value="Semiconductors & AI Hardware">AI / Tech</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Max P/E</label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={peMax}
            onChange={e => setPeMax(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Min ROE (%)</label>
          <input
            type="number"
            placeholder="e.g. 15"
            value={roeMin}
            onChange={e => setRoeMin(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Min ROCE (%)</label>
          <input
            type="number"
            placeholder="e.g. 18"
            value={roceMin}
            onChange={e => setRoceMin(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Min RSI</label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={rsiMin}
            onChange={e => setRsiMin(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Max RSI</label>
          <input
            type="number"
            placeholder="e.g. 70"
            value={rsiMax}
            onChange={e => setRsiMax(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Min Fund. Score</label>
          <input
            type="number"
            placeholder="e.g. 75"
            value={minAiScore}
            onChange={e => setMinAiScore(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-[11px] block mb-1">Min MCap (Cr)</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={marketCapMin}
            onChange={e => setMarketCapMin(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-1.5 text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Filtered Results Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="text-xs font-semibold text-slate-200">
            Matching Companies: <span className="text-emerald-400 font-mono">{results.length}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Ranked by Model Confidence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 font-medium">Symbol & Name</th>
                <th className="py-2.5 font-medium">Sector</th>
                <th className="py-2.5 font-medium">Price</th>
                <th className="py-2.5 font-medium">P/E</th>
                <th className="py-2.5 font-medium">ROE</th>
                <th className="py-2.5 font-medium">ROCE</th>
                <th className="py-2.5 font-medium">RSI(14)</th>
                <th className="py-2.5 font-medium">Fund. Score</th>
                <th className="py-2.5 font-medium">ML 7D Up</th>
                <th className="py-2.5 font-medium text-right">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map(stock => (
                <tr key={stock.symbol} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-white">{stock.symbol}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{stock.name}</div>
                  </td>
                  <td className="py-3 text-slate-400 font-sans text-xs">{stock.sector}</td>
                  <td className="py-3 font-semibold text-white">
                    ₹{stock.price ? stock.price.toLocaleString('en-IN') : '-'}
                  </td>
                  <td className="py-3 text-slate-300">{stock.peRatio ?? '-'}x</td>
                  <td className="py-3 text-emerald-400 font-semibold">{stock.roe ?? '-'}%</td>
                  <td className="py-3 text-teal-400">{stock.roce ?? '-'}%</td>
                  <td className="py-3 text-slate-300">{stock.rsi14 ?? '-'}</td>
                  <td className="py-3">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-semibold border border-emerald-500/20">
                      {stock.fundamentalScore ?? '-'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-400 font-bold">
                      {Math.round((stock.probabilityUp ?? 0) * 100)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        onSelectStock(stock.symbol);
                        onSelectTab?.('terminal');
                      }}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 font-sans text-xs font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
