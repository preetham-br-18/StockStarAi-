import React, { useState } from 'react';
import { X, DollarSign, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { StockQuote } from '../types';
import { paperTradingService } from '../services/paperTradingService';

interface OrderModalProps {
  stock: StockQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
  availableCash: number;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  stock,
  isOpen,
  onClose,
  onOrderSuccess,
  availableCash,
}) => {
  if (!isOpen || !stock) return null;

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(stock.price ?? 0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(Number(((stock.price ?? 0) * 0.95).toFixed(2)));
  const [targetPrice, setTargetPrice] = useState<number>(Number(((stock.price ?? 0) * 1.10).toFixed(2)));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const priceToUse = orderType === 'MARKET' ? stock.price : limitPrice;
  const totalAmount = quantity * priceToUse;
  const hasEnoughCash = side === 'SELL' || totalAmount <= availableCash;

  const handleSubmitOrder = async () => {
    setErrorMsg(null);
    if (!quantity || quantity <= 0) {
      setErrorMsg('Please specify a positive share quantity.');
      return;
    }
    if (side === 'BUY' && totalAmount > availableCash) {
      setErrorMsg(`Insufficient virtual cash. Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${availableCash.toLocaleString('en-IN')}`);
      return;
    }

    setLoading(true);
    try {
      // Execute via client-side paper trading engine
      const executionResult = await paperTradingService.placeOrder({
        symbol: stock.symbol,
        side,
        orderType,
        quantity,
        price: priceToUse,
        targetPrice,
        stopLossPrice,
      });

      if (!executionResult.success) {
        throw new Error('Failed to place order');
      }

      // Optional async sync to backend if present
      fetch('/api/paper/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          side,
          orderType,
          quantity,
          price: priceToUse,
          targetPrice,
          stopLossPrice,
        }),
      }).catch(() => {});

      onOrderSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121824] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white">{stock.symbol}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                {stock.exchange}
              </span>
            </div>
            <span className="text-xs text-slate-400">{stock.name}</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Buy / Sell Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setSide('BUY')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              side === 'BUY'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BUY / LONG
          </button>
          <button
            onClick={() => setSide('SELL')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              side === 'SELL'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SELL / EXIT
          </button>
        </div>

        {/* Order Type */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium">Order Execution Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['MARKET', 'LIMIT', 'STOP_LOSS'] as const).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
                  orderType === type
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Price Inputs */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Quantity (Shares)</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2.5 font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">
              {orderType === 'MARKET' ? 'Market Price (LTP)' : 'Limit Price (₹)'}
            </label>
            <input
              type="number"
              disabled={orderType === 'MARKET'}
              value={priceToUse}
              onChange={e => setLimitPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2.5 font-mono text-white disabled:opacity-60 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Risk Controls (Target & Stop Loss) */}
        <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800/80 pt-3">
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Stop-Loss (₹)</label>
            <input
              type="number"
              value={stopLossPrice}
              onChange={e => setStopLossPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 font-mono text-rose-300 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Target (₹)</label>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-[#0f141c] p-2 font-mono text-emerald-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Summary Calculation */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs font-mono space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Order Value:</span>
            <span className="text-white font-semibold">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Virtual Cash Available:</span>
            <span className={hasEnoughCash ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
              ₹{availableCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={loading || (!hasEnoughCash && side === 'BUY')}
          className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer ${
            side === 'BUY'
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20 disabled:opacity-50'
              : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20 disabled:opacity-50'
          }`}
        >
          {loading ? 'Executing on Paper Engine...' : `Place ${side} Order`}
        </button>
      </div>
    </div>
  );
};
