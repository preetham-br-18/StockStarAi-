import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  ColorType,
} from 'lightweight-charts';
import { Candle } from '../types';
import { generateFallbackCandles } from '../fallbackData';

interface TradingViewChartProps {
  candles: Candle[];
  symbol: string;
  chartType?: 'candlestick' | 'line' | 'area';
  showVolume?: boolean;
  showSMA20?: boolean;
  showSMA50?: boolean;
  height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles: rawCandles,
  symbol,
  chartType = 'candlestick',
  showVolume = true,
  showSMA20 = true,
  showSMA50 = true,
  height = 420,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const sma20SeriesRef = useRef<ISeriesApi<any> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<any> | null>(null);
  const [chartError, setChartError] = useState<boolean>(false);

  // Fallback to synthetic candles if none provided
  const effectiveCandles =
    rawCandles && rawCandles.length > 0
      ? rawCandles
      : generateFallbackCandles(symbol, '1Y');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart instance if any
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.warn('Error removing previous chart:', e);
      }
      chartRef.current = null;
    }

    try {
      const container = chartContainerRef.current;
      const initialWidth = Math.max(container.clientWidth || container.parentElement?.clientWidth || 320, 280);

      const chart = createChart(container, {
        width: initialWidth,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: '#0f141c' },
          textColor: '#94a3b8',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
        },
        crosshair: {
          vertLine: { color: '#64748b', width: 1, style: 1 },
          horzLine: { color: '#64748b', width: 1, style: 1 },
        },
        timeScale: {
          borderColor: '#1e293b',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#1e293b',
          autoScale: true,
        },
      });

      chartRef.current = chart;

      // 1. Sanitize candles: parse valid numeric values
      const validCandles = effectiveCandles
        .filter(c => c && c.time !== undefined && c.time !== null && !isNaN(Number(c.close)))
        .map(c => ({
          time: c.time,
          open: Number(c.open ?? c.close),
          high: Number(c.high ?? Math.max(c.open ?? c.close, c.close)),
          low: Number(c.low ?? Math.min(c.open ?? c.close, c.close)),
          close: Number(c.close),
          volume: Number(c.volume ?? 0),
        }));

      // 2. Sort chronologically
      validCandles.sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : Number(a.time);
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : Number(b.time);
        return timeA - timeB;
      });

      // 3. Deduplicate strictly by time (lightweight-charts requires unique, ascending timestamps)
      const sanitizedCandles: typeof validCandles = [];
      const seenTimes = new Set<string | number>();
      for (const c of validCandles) {
        if (!seenTimes.has(c.time)) {
          seenTimes.add(c.time);
          sanitizedCandles.push(c);
        }
      }

      if (sanitizedCandles.length === 0) {
        setChartError(true);
        return;
      }

      // Build main series
      let mainSeries: ISeriesApi<any>;
      if (chartType === 'candlestick') {
        mainSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#f43f5e',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#f43f5e',
        });
        const candleData: CandlestickData[] = sanitizedCandles.map(c => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        mainSeries.setData(candleData);
      } else if (chartType === 'area') {
        mainSeries = chart.addSeries(AreaSeries, {
          topColor: 'rgba(16, 185, 129, 0.35)',
          bottomColor: 'rgba(16, 185, 129, 0.02)',
          lineColor: '#10b981',
          lineWidth: 2,
        });
        const lineData: LineData[] = sanitizedCandles.map(c => ({
          time: c.time as any,
          value: c.close,
        }));
        mainSeries.setData(lineData);
      } else {
        mainSeries = chart.addSeries(LineSeries, {
          color: '#38bdf8',
          lineWidth: 2,
        });
        const lineData: LineData[] = sanitizedCandles.map(c => ({
          time: c.time as any,
          value: c.close,
        }));
        mainSeries.setData(lineData);
      }
      mainSeriesRef.current = mainSeries;

      // Volume Series
      if (showVolume) {
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: '#334155',
          priceFormat: { type: 'volume' },
          priceScaleId: '',
        });
        chart.priceScale('').applyOptions({
          scaleMargins: {
            top: 0.82,
            bottom: 0,
          },
        });
        const volData = sanitizedCandles.map(c => ({
          time: c.time as any,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
        }));
        volumeSeries.setData(volData);
        volumeSeriesRef.current = volumeSeries;
      }

      // Moving Averages
      if (sanitizedCandles.length > 20 && showSMA20) {
        const sma20 = chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 1,
          title: 'SMA 20',
        });
        const sma20Data: LineData[] = [];
        for (let i = 19; i < sanitizedCandles.length; i++) {
          const slice = sanitizedCandles.slice(i - 19, i + 1);
          const avg = slice.reduce((sum, item) => sum + item.close, 0) / 20;
          sma20Data.push({ time: sanitizedCandles[i].time as any, value: Number(avg.toFixed(2)) });
        }
        sma20.setData(sma20Data);
        sma20SeriesRef.current = sma20;
      }

      if (sanitizedCandles.length > 50 && showSMA50) {
        const sma50 = chart.addSeries(LineSeries, {
          color: '#818cf8',
          lineWidth: 1,
          title: 'SMA 50',
        });
        const sma50Data: LineData[] = [];
        for (let i = 49; i < sanitizedCandles.length; i++) {
          const slice = sanitizedCandles.slice(i - 49, i + 1);
          const avg = slice.reduce((sum, item) => sum + item.close, 0) / 50;
          sma50Data.push({ time: sanitizedCandles[i].time as any, value: Number(avg.toFixed(2)) });
        }
        sma50.setData(sma50Data);
        sma50SeriesRef.current = sma50;
      }

      // Fit content
      try {
        chart.timeScale().fitContent();
      } catch (e) {
        // Safe ignore
      }

      // ResizeObserver for responsive resize
      const resizeObserver = new ResizeObserver(entries => {
        if (entries.length === 0 || !entries[0].contentRect) return;
        const { width } = entries[0].contentRect;
        if (width > 0 && chartRef.current) {
          chartRef.current.applyOptions({ width });
        }
      });

      resizeObserver.observe(container);
      setChartError(false);

      return () => {
        resizeObserver.disconnect();
        if (chartRef.current) {
          try {
            chartRef.current.remove();
          } catch (e) {
            // Safe cleanup
          }
          chartRef.current = null;
        }
      };
    } catch (err) {
      console.warn('TradingView chart initialization warning:', err);
      setChartError(true);
    }
  }, [effectiveCandles, chartType, showVolume, showSMA20, showSMA50, height, symbol]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-[#0f141c]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-[#121824] text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-slate-200">{symbol}</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            SMA(20)
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
            SMA(50)
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Vol
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Interactive Crosshair & Zoom
        </div>
      </div>

      {chartError ? (
        // SVG Resilient Chart Fallback
        <div className="w-full p-4 flex flex-col justify-center items-center" style={{ height: `${height}px` }}>
          <div className="text-center mb-2">
            <span className="text-xs font-mono text-emerald-400">Direct Vector Chart Mode</span>
          </div>
          <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Area path */}
            {effectiveCandles.length > 1 && (
              <>
                <path
                  d={`M 0,240 ${effectiveCandles.map((c, i) => {
                    const x = (i / (effectiveCandles.length - 1)) * 600;
                    const minPrice = Math.min(...effectiveCandles.map(x => x.close));
                    const maxPrice = Math.max(...effectiveCandles.map(x => x.close)) || minPrice + 1;
                    const y = 220 - ((c.close - minPrice) / (maxPrice - minPrice)) * 180;
                    return `L ${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')} L 600,240 Z`}
                  fill="url(#chartGrad)"
                />
                <path
                  d={`M ${effectiveCandles.map((c, i) => {
                    const x = (i / (effectiveCandles.length - 1)) * 600;
                    const minPrice = Math.min(...effectiveCandles.map(x => x.close));
                    const maxPrice = Math.max(...effectiveCandles.map(x => x.close)) || minPrice + 1;
                    const y = 220 - ((c.close - minPrice) / (maxPrice - minPrice)) * 180;
                    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              </>
            )}
          </svg>
        </div>
      ) : (
        <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
      )}
    </div>
  );
};
