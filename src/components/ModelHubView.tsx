import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';
import { ModelPerformanceMetric } from '../types';

interface ModelHubViewProps {
  onSelectStock: (symbol: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const ModelHubView: React.FC<ModelHubViewProps> = ({
  onSelectStock,
  onSelectTab,
}) => {
  const [metrics, setMetrics] = useState<ModelPerformanceMetric[]>([]);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Simulation params
  const [symbol, setSymbol] = useState('RELIANCE');
  const [strategy, setStrategy] = useState<'MOMENTUM_ML' | 'VALUE_ENSEMBLE' | 'MEAN_REVERSION'>('MOMENTUM_ML');
  const [lookbackDays, setLookbackDays] = useState(365);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/ml/performance');
        const data = await res.json();
        setMetrics(data.metrics || []);
        setBacktestResult(data.sampleBacktest || null);
      } catch (err) {
        console.error('Error fetching ML performance:', err);
      }
    }
    loadData();
  }, []);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ml/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, strategy, lookbackDays }),
      });
      const data = await res.json();
      setBacktestResult(data);
    } catch (err) {
      console.error('Backtest error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Quantitative ML Models & Validation Engine</h1>
        <p className="text-xs text-slate-400">
          Walk-forward validation, multi-model ensemble weights, and cross-regime statistical audit
        </p>
      </div>

      {/* Model Architecture Transparency (PRD Section 17) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">5-Model Quantitative Architecture</h2>
        </div>
        <p className="text-xs text-slate-300 mb-5">
          Gemini provides contextual explanations of verified calculations. The underlying raw predictive engine is a pure quantitative ensemble evaluated via walk-forward validation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">Model A (30%)</span>
            <span className="text-white font-semibold block">Gradient Boosting</span>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">XGBoost & LightGBM on tabular technical/fundamental features</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-teal-400 font-bold block mb-1">Model B (20%)</span>
            <span className="text-white font-semibold block">Random Forest</span>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">Multi-tree bagging ensemble to prevent single-feature bias</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">Model C (25%)</span>
            <span className="text-white font-semibold block">Temporal LSTM</span>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">Sequential neural network capturing time-series autocorrelation</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">Model D (15%)</span>
            <span className="text-white font-semibold block">Logistic Classifier</span>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">Platt-calibrated directional probability estimator</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">Model E (10%)</span>
            <span className="text-white font-semibold block">Ridge Regressor</span>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">L2-regularized expected return magnitude regressor</span>
          </div>
        </div>
      </div>

      {/* Cross-Regime Validation Metrics Table (PRD Section 20) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">System-Wide Performance & Calibration</h3>
            <p className="text-xs text-slate-400">Audited across Bull, Bear, and Sideways market regimes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 font-sans font-medium">Evaluation Metric</th>
                <th className="py-2.5 font-medium">Overall Score</th>
                <th className="py-2.5 font-medium text-emerald-400">Bull Market</th>
                <th className="py-2.5 font-medium text-rose-400">Bear Market</th>
                <th className="py-2.5 font-medium text-amber-400">Sideways Regime</th>
                <th className="py-2.5 font-sans font-medium">Mathematical Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.map(m => (
                <tr key={m.metric} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-white font-sans">{m.metric}</td>
                  <td className="py-3 font-bold text-emerald-400 text-sm">{m.value}</td>
                  <td className="py-3 text-emerald-300">{m.bullRegime}</td>
                  <td className="py-3 text-rose-300">{m.bearRegime}</td>
                  <td className="py-3 text-amber-300">{m.sidewaysRegime}</td>
                  <td className="py-3 text-slate-400 font-sans text-[11px]">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Walk-Forward Backtesting Simulator (PRD Section 22) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-emerald-400" />
              Walk-Forward Backtesting Sandbox
            </h3>
            <p className="text-xs text-slate-400">Sequential Train-Validate-Test folding to eliminate look-ahead and overfitting bias</p>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 text-[11px] block mb-1 font-sans">Ticker Symbol</label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white font-mono"
            >
              <option value="RELIANCE">RELIANCE (NSE)</option>
              <option value="TCS">TCS (NSE)</option>
              <option value="HDFCBANK">HDFCBANK (NSE)</option>
              <option value="INFY">INFY (NSE)</option>
              <option value="TATAMOTORS">TATAMOTORS (NSE)</option>
              <option value="AAPL">AAPL (NASDAQ)</option>
              <option value="NVDA">NVDA (NASDAQ)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-[11px] block mb-1 font-sans">ML Strategy Model</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white font-mono"
            >
              <option value="MOMENTUM_ML">Momentum ML Walk-Forward</option>
              <option value="VALUE_ENSEMBLE">Value + Multi-Factor Ensemble</option>
              <option value="MEAN_REVERSION">Mean Reversion + Volatility</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-[11px] block mb-1 font-sans">Lookback History</label>
            <select
              value={lookbackDays}
              onChange={e => setLookbackDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 text-white font-mono"
            >
              <option value={180}>180 Days (6 Months)</option>
              <option value={365}>365 Days (1 Year)</option>
              <option value={730}>730 Days (2 Years)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2 font-sans font-bold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-4 w-4" />
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Simulation Output */}
        {backtestResult && (
          <div className="space-y-4">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-slate-400 text-[11px] block">Strategy Return</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">{backtestResult.totalStrategyReturn}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Benchmark Return</span>
                <span className="text-xl font-bold text-slate-300 mt-1 block">{backtestResult.totalBenchmarkReturn}</span>
              </div>
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <span className="text-slate-400 text-[11px] block">Outperformance Alpha</span>
                <span className="text-xl font-bold text-teal-400 mt-1 block">{backtestResult.outperformanceAlpha}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Annualized Sharpe</span>
                <span className="text-xl font-bold text-white mt-1 block">{backtestResult.overallSharpe}</span>
              </div>
            </div>

            {/* Fold Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">Walk-Forward Fold</th>
                    <th className="py-2">Test Period</th>
                    <th className="py-2">Trades</th>
                    <th className="py-2">Win Rate</th>
                    <th className="py-2">Strategy Ret.</th>
                    <th className="py-2">Benchmark Ret.</th>
                    <th className="py-2">Max Drawdown</th>
                    <th className="py-2 text-emerald-400">Alpha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {backtestResult.folds?.map((f: any) => (
                    <tr key={f.fold} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-white">{f.fold}</td>
                      <td className="py-2.5 text-slate-400">{f.testPeriod}</td>
                      <td className="py-2.5 text-slate-300">{f.trades}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold">{f.winRate}</td>
                      <td className="py-2.5 text-emerald-300 font-bold">{f.strategyReturn}</td>
                      <td className="py-2.5 text-slate-400">{f.benchmarkReturn}</td>
                      <td className="py-2.5 text-rose-400">{f.maxDrawdown}</td>
                      <td className="py-2.5 text-teal-400 font-bold">{f.alpha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{backtestResult.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
