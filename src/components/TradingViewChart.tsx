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
  candles,
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

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart instance if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
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

    // Build series
    let mainSeries: ISeriesApi<any>;
    if (chartType === 'candlestick') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      const candleData: CandlestickData[] = candles.map(c => ({
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
      const lineData: LineData[] = candles.map(c => ({
        time: c.time as any,
        value: c.close,
      }));
      mainSeries.setData(lineData);
    } else {
      mainSeries = chart.addSeries(LineSeries, {
        color: '#38bdf8',
        lineWidth: 2,
      });
      const lineData: LineData[] = candles.map(c => ({
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
        priceScaleId: '', // Overlay over main
      });
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });
      const volData = candles.map(c => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
      }));
      volumeSeries.setData(volData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Moving Averages
    if (candles.length > 20 && showSMA20) {
      const sma20 = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 1,
        title: 'SMA 20',
      });
      const sma20Data: LineData[] = [];
      for (let i = 19; i < candles.length; i++) {
        const slice = candles.slice(i - 19, i + 1);
        const avg = slice.reduce((sum, item) => sum + item.close, 0) / 20;
        sma20Data.push({ time: candles[i].time as any, value: Number(avg.toFixed(2)) });
      }
      sma20.setData(sma20Data);
      sma20SeriesRef.current = sma20;
    }

    if (candles.length > 50 && showSMA50) {
      const sma50 = chart.addSeries(LineSeries, {
        color: '#818cf8',
        lineWidth: 1,
        title: 'SMA 50',
      });
      const sma50Data: LineData[] = [];
      for (let i = 49; i < candles.length; i++) {
        const slice = candles.slice(i - 49, i + 1);
        const avg = slice.reduce((sum, item) => sum + item.close, 0) / 50;
        sma50Data.push({ time: candles[i].time as any, value: Number(avg.toFixed(2)) });
      }
      sma50.setData(sma50Data);
      sma50SeriesRef.current = sma50;
    }

    // Fit content
    chart.timeScale().fitContent();

    // ResizeObserver for responsive resize
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, chartType, showVolume, showSMA20, showSMA50, height]);

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
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
};
