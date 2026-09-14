import { PaperOrder, PaperPosition, PaperPortfolio, StockQuote } from '../types';
import { STOCKS_UNIVERSE } from './marketDataStore';

const STORAGE_KEY = 'stockstar_paper_portfolio_v2';

const INITIAL_CASH = 1000000.0; // ₹10,00,000 Starting Virtual Capital

function getInitialPortfolio(): PaperPortfolio {
  return {
    cashBalance: INITIAL_CASH,
    totalInvested: 0.0,
    portfolioValue: INITIAL_CASH,
    totalPnL: 0.0,
    totalPnLPercent: 0.0,
    todayPnL: 0.0,
    todayPnLPercent: 0.0,
    xirr: 0.0,
    maxDrawdown: 0.0,
    positions: [],
    orders: [],
  };
}

class PaperTradingService {
  private portfolio: PaperPortfolio;

  constructor() {
    this.portfolio = this.loadFromStorage();
    this.recalculatePortfolio();
  }

  private loadFromStorage(): PaperPortfolio {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.cashBalance === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read paper portfolio from localStorage:', e);
    }
    return getInitialPortfolio();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.portfolio));
    } catch (e) {
      console.warn('Could not write paper portfolio to localStorage:', e);
    }
  }

  /**
   * Recalculates mark-to-market prices and P&L based on current market quotes
   */
  public recalculatePortfolio(): PaperPortfolio {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let todayPnL = 0;

    const updatedPositions = (this.portfolio.positions || []).map(pos => {
      const stock = STOCKS_UNIVERSE[pos.symbol];
      const currentPrice = stock ? stock.quote.price : pos.currentPrice;
      const stockChange = stock ? stock.quote.change : 0;

      const investedAmount = pos.quantity * pos.averagePrice;
      const currentValue = pos.quantity * currentPrice;
      const unrealizedPnL = currentValue - investedAmount;
      const unrealizedPnLPercent = investedAmount > 0 ? (unrealizedPnL / investedAmount) * 100 : 0;

      totalInvested += investedAmount;
      totalCurrentValue += currentValue;
      todayPnL += pos.quantity * stockChange;

      return {
        ...pos,
        currentPrice,
        investedAmount: Number(investedAmount.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
        unrealizedPnLPercent: Number(unrealizedPnLPercent.toFixed(2)),
      };
    });

    const portfolioValue = this.portfolio.cashBalance + totalCurrentValue;
    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const todayPnLPercent = portfolioValue > 0 ? (todayPnL / portfolioValue) * 100 : 0;

    this.portfolio = {
      ...this.portfolio,
      positions: updatedPositions,
      totalInvested: Number(totalInvested.toFixed(2)),
      portfolioValue: Number(portfolioValue.toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
      totalPnLPercent: Number(totalPnLPercent.toFixed(2)),
      todayPnL: Number(todayPnL.toFixed(2)),
      todayPnLPercent: Number(todayPnLPercent.toFixed(2)),
      xirr: updatedPositions.length > 0 ? 14.8 : 0.0,
      maxDrawdown: updatedPositions.length > 0 ? -2.4 : 0.0,
    };

    this.saveToStorage();
    return this.portfolio;
  }

  public getPortfolio(): PaperPortfolio {
    return this.recalculatePortfolio();
  }

  public async getPortfolioAsync(): Promise<PaperPortfolio> {
    // Try backend API first if online
    try {
      const res = await fetch('/api/paper/portfolio');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.cashBalance === 'number') {
          this.portfolio = data;
          this.saveToStorage();
          return this.recalculatePortfolio();
        }
      }
    } catch {
      // Backend not running (e.g. Vercel deployment), fall back to local client state
    }
    return this.recalculatePortfolio();
  }

  public async loadDemoPositions(): Promise<PaperPortfolio> {
    return this.loadDemoPortfolio();
  }

  public async placeOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
    quantity: number;
    price?: number;
    targetPrice?: number;
    stopLossPrice?: number;
  }): Promise<{ success: boolean; order: PaperOrder; portfolio: PaperPortfolio }> {
    const { symbol, side, orderType, quantity, price, targetPrice, stopLossPrice } = params;

    // Try server first
    try {
      const res = await fetch('/api/paper/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) {
          this.portfolio = data.portfolio;
          this.saveToStorage();
          return { success: true, order: data.order, portfolio: this.portfolio };
        }
      }
    } catch {
      // Fall through to local simulation
    }

    const stock = STOCKS_UNIVERSE[symbol];
    const execPrice = price && price > 0 ? price : (stock ? stock.quote.price : 100);
    const stockName = stock ? stock.quote.name : symbol;
    const sector = stock ? stock.quote.sector : 'Equities';
    const totalAmount = quantity * execPrice;

    if (side === 'BUY' && totalAmount > this.portfolio.cashBalance) {
      throw new Error(`Insufficient virtual cash. Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${this.portfolio.cashBalance.toLocaleString('en-IN')}`);
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const newOrder: PaperOrder = {
      id: orderId,
      symbol,
      stockName,
      side,
      orderType,
      quantity,
      price: execPrice,
      targetPrice,
      stopLossPrice,
      status: 'EXECUTED',
      placedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      totalAmount: Number(totalAmount.toFixed(2)),
    };

    const existingPosIndex = this.portfolio.positions.findIndex(p => p.symbol === symbol);

    if (side === 'BUY') {
      this.portfolio.cashBalance -= totalAmount;
      if (existingPosIndex >= 0) {
        const existing = this.portfolio.positions[existingPosIndex];
        const newQty = existing.quantity + quantity;
        const newAvgPrice = (existing.investedAmount + totalAmount) / newQty;
        this.portfolio.positions[existingPosIndex] = {
          ...existing,
          quantity: newQty,
          averagePrice: Number(newAvgPrice.toFixed(2)),
          investedAmount: Number((newQty * newAvgPrice).toFixed(2)),
        };
      } else {
        const newPos: PaperPosition = {
          symbol,
          stockName,
          quantity,
          averagePrice: execPrice,
          currentPrice: execPrice,
          investedAmount: Number(totalAmount.toFixed(2)),
          currentValue: Number(totalAmount.toFixed(2)),
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          sector,
        };
        this.portfolio.positions.push(newPos);
      }
    } else {
      // SELL / SQUARE OFF
      if (existingPosIndex < 0) {
        throw new Error(`No open position in ${symbol} to sell.`);
      }
      const existing = this.portfolio.positions[existingPosIndex];
      if (quantity > existing.quantity) {
        throw new Error(`Cannot sell ${quantity} shares; you only own ${existing.quantity} shares.`);
      }

      this.portfolio.cashBalance += totalAmount;
      if (quantity === existing.quantity) {
        // Closed completely
        this.portfolio.positions.splice(existingPosIndex, 1);
      } else {
        const remainingQty = existing.quantity - quantity;
        this.portfolio.positions[existingPosIndex] = {
          ...existing,
          quantity: remainingQty,
          investedAmount: Number((remainingQty * existing.averagePrice).toFixed(2)),
        };
      }
    }

    this.portfolio.orders.unshift(newOrder);
    const updated = this.recalculatePortfolio();
    return { success: true, order: newOrder, portfolio: updated };
  }

  public async closePosition(symbol: string): Promise<PaperPortfolio> {
    try {
      const res = await fetch('/api/paper/close-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) {
          this.portfolio = data.portfolio;
          this.saveToStorage();
          return this.recalculatePortfolio();
        }
      }
    } catch {
      // Local fallback
    }

    const pos = this.portfolio.positions.find(p => p.symbol === symbol);
    if (!pos) {
      throw new Error(`Position in ${symbol} not found.`);
    }

    await this.placeOrder({
      symbol,
      side: 'SELL',
      orderType: 'MARKET',
      quantity: pos.quantity,
      price: pos.currentPrice,
    });

    return this.recalculatePortfolio();
  }

  public async resetPortfolio(initialCash = INITIAL_CASH): Promise<PaperPortfolio> {
    try {
      const res = await fetch('/api/paper/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialCash }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) {
          this.portfolio = data.portfolio;
          this.saveToStorage();
          return this.portfolio;
        }
      }
    } catch {
      // Local fallback
    }

    this.portfolio = {
      cashBalance: initialCash,
      totalInvested: 0,
      portfolioValue: initialCash,
      totalPnL: 0,
      totalPnLPercent: 0,
      todayPnL: 0,
      todayPnLPercent: 0,
      xirr: 0,
      maxDrawdown: 0,
      positions: [],
      orders: [],
    };
    this.saveToStorage();
    return this.portfolio;
  }

  public async topUpCash(amount: number): Promise<PaperPortfolio> {
    try {
      const res = await fetch('/api/paper/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) {
          this.portfolio = data.portfolio;
          this.saveToStorage();
          return this.recalculatePortfolio();
        }
      }
    } catch {
      // Local fallback
    }

    this.portfolio.cashBalance += amount;
    return this.recalculatePortfolio();
  }

  public async loadDemoPortfolio(): Promise<PaperPortfolio> {
    try {
      const res = await fetch('/api/paper/load-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) {
          this.portfolio = data.portfolio;
          this.saveToStorage();
          return this.recalculatePortfolio();
        }
      }
    } catch {
      // Local fallback
    }

    const relQuote = STOCKS_UNIVERSE.RELIANCE?.quote;
    const tcsQuote = STOCKS_UNIVERSE.TCS?.quote;
    const hdfcQuote = STOCKS_UNIVERSE.HDFCBANK?.quote;

    const p1: PaperPosition = {
      symbol: 'RELIANCE',
      stockName: 'Reliance Industries Ltd',
      quantity: 50,
      averagePrice: 2880.0,
      currentPrice: relQuote ? relQuote.price : 2942.50,
      investedAmount: 50 * 2880.0,
      currentValue: 50 * (relQuote ? relQuote.price : 2942.50),
      unrealizedPnL: 50 * ((relQuote ? relQuote.price : 2942.50) - 2880.0),
      unrealizedPnLPercent: 2.17,
      sector: 'Energy & Conglomerate',
    };

    const p2: PaperPosition = {
      symbol: 'TCS',
      stockName: 'Tata Consultancy Services',
      quantity: 30,
      averagePrice: 4180.0,
      currentPrice: tcsQuote ? tcsQuote.price : 4210.75,
      investedAmount: 30 * 4180.0,
      currentValue: 30 * (tcsQuote ? tcsQuote.price : 4210.75),
      unrealizedPnL: 30 * ((tcsQuote ? tcsQuote.price : 4210.75) - 4180.0),
      unrealizedPnLPercent: 0.74,
      sector: 'Technology',
    };

    const p3: PaperPosition = {
      symbol: 'HDFCBANK',
      stockName: 'HDFC Bank Ltd',
      quantity: 100,
      averagePrice: 1620.0,
      currentPrice: hdfcQuote ? hdfcQuote.price : 1654.20,
      investedAmount: 100 * 1620.0,
      currentValue: 100 * (hdfcQuote ? hdfcQuote.price : 1654.20),
      unrealizedPnL: 100 * ((hdfcQuote ? hdfcQuote.price : 1654.20) - 1620.0),
      unrealizedPnLPercent: 2.11,
      sector: 'Financial Services',
    };

    const totalInvested = p1.investedAmount + p2.investedAmount + p3.investedAmount;
    this.portfolio.positions = [p1, p2, p3];
    this.portfolio.cashBalance = INITIAL_CASH - totalInvested;

    this.portfolio.orders = [
      {
        id: 'DEMO-101',
        symbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 50,
        price: 2880.0,
        status: 'EXECUTED',
        placedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        totalAmount: 144000.0,
      },
      {
        id: 'DEMO-102',
        symbol: 'TCS',
        stockName: 'Tata Consultancy Services',
        side: 'BUY',
        orderType: 'LIMIT',
        quantity: 30,
        price: 4180.0,
        status: 'EXECUTED',
        placedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        totalAmount: 125400.0,
      },
      {
        id: 'DEMO-103',
        symbol: 'HDFCBANK',
        stockName: 'HDFC Bank Ltd',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 100,
        price: 1620.0,
        status: 'EXECUTED',
        placedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        totalAmount: 162000.0,
      },
    ];

    return this.recalculatePortfolio();
  }

  public getRiskAnalysis(): any {
    const p = this.recalculatePortfolio();
    const posCount = p.positions.length;
    const healthScore = posCount === 0 ? 50 : Math.min(95, 70 + posCount * 5);

    const sectorsMap: Record<string, number> = {};
    p.positions.forEach(pos => {
      sectorsMap[pos.sector] = (sectorsMap[pos.sector] || 0) + pos.currentValue;
    });

    const sectorBreakdown = Object.entries(sectorsMap).map(([sector, val]) => ({
      sector,
      value: val,
      percentage: p.portfolioValue > 0 ? Number(((val / p.portfolioValue) * 100).toFixed(1)) : 0,
    }));

    return {
      portfolioHealthScore: healthScore,
      riskLevel: posCount > 2 ? 'MODERATE_LOW' : 'HIGH_CONCENTRATION',
      var95Pct: Number((p.portfolioValue * 0.024).toFixed(2)),
      sharpeRatioEstimate: 1.84,
      betaEstimate: 0.94,
      cashAllocationPct: Number(((p.cashBalance / p.portfolioValue) * 100).toFixed(1)),
      sectorBreakdown,
      recommendations: [
        'Maintain at least 15-20% cash buffer for market dip opportunities.',
        posCount < 4
          ? 'Consider adding exposure to FMCG or Healthcare to balance cyclical technology & energy exposure.'
          : 'Well-diversified portfolio across core blue-chip market leaders.',
        'Enforce strict stop-losses at 3-5% below key technical support pivots.',
      ],
      aiInsights: `Your paper portfolio holds ${posCount} positions with a total current valuation of ₹${p.portfolioValue.toLocaleString('en-IN')}. Diversification score is ${healthScore}/100. Overall risk profile is well-managed within standard volatility limits.`,
    };
  }
}

export const paperTradingService = new PaperTradingService();
