import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { marketDataService } from './server/marketData';
import { mlEngineService } from './server/mlEngine';
import { geminiService } from './server/geminiService';
import { TRADING_COURSE_LEVELS, INVESTING_COURSE_MODULES, FINANCIAL_GLOSSARY } from './server/learningData';
import { PaperOrder, PaperPosition, PaperPortfolio, PriceAlert, PredictionHorizon } from './src/types';

// In-memory persistent session state for Paper Trading & Alerts (₹10,00,000 capital)
let paperPortfolio: PaperPortfolio = {
  cashBalance: 1000000.0, // Clean starting ₹10,00,000 (10 Lakhs)
  totalInvested: 0.0,
  portfolioValue: 1000000.0,
  totalPnL: 0.0,
  totalPnLPercent: 0.0,
  todayPnL: 0.0,
  todayPnLPercent: 0.0,
  xirr: 0.0,
  maxDrawdown: 0.0,
  positions: [],
  orders: [],
};

// Seed demo starter positions when requested by the user
function seedDemoPortfolio() {
  const relQuote = marketDataService.getQuote('RELIANCE');
  const tcsQuote = marketDataService.getQuote('TCS');
  const hdfcQuote = marketDataService.getQuote('HDFCBANK');

  if (relQuote && tcsQuote && hdfcQuote) {
    const p1: PaperPosition = {
      symbol: 'RELIANCE',
      stockName: 'Reliance Industries Ltd',
      quantity: 50,
      averagePrice: 2880.0,
      currentPrice: relQuote.price,
      investedAmount: 50 * 2880.0,
      currentValue: 50 * relQuote.price,
      unrealizedPnL: 50 * (relQuote.price - 2880.0),
      unrealizedPnLPercent: Number((((relQuote.price - 2880.0) / 2880.0) * 100).toFixed(2)),
      sector: relQuote.sector,
    };
    const p2: PaperPosition = {
      symbol: 'TCS',
      stockName: 'Tata Consultancy Services',
      quantity: 30,
      averagePrice: 4180.0,
      currentPrice: tcsQuote.price,
      investedAmount: 30 * 4180.0,
      currentValue: 30 * tcsQuote.price,
      unrealizedPnL: 30 * (tcsQuote.price - 4180.0),
      unrealizedPnLPercent: Number((((tcsQuote.price - 4180.0) / 4180.0) * 100).toFixed(2)),
      sector: tcsQuote.sector,
    };
    const p3: PaperPosition = {
      symbol: 'HDFCBANK',
      stockName: 'HDFC Bank Ltd',
      quantity: 100,
      averagePrice: 1640.0,
      currentPrice: hdfcQuote.price,
      investedAmount: 100 * 1640.0,
      currentValue: 100 * hdfcQuote.price,
      unrealizedPnL: 100 * (hdfcQuote.price - 1640.0),
      unrealizedPnLPercent: Number((((hdfcQuote.price - 1640.0) / 1640.0) * 100).toFixed(2)),
      sector: hdfcQuote.sector,
    };

    paperPortfolio.positions = [p1, p2, p3];
    paperPortfolio.totalInvested = p1.investedAmount + p2.investedAmount + p3.investedAmount;
    paperPortfolio.cashBalance = 1000000.0 - paperPortfolio.totalInvested;
    const currentVal = p1.currentValue + p2.currentValue + p3.currentValue;
    paperPortfolio.portfolioValue = paperPortfolio.cashBalance + currentVal;
    paperPortfolio.totalPnL = currentVal - paperPortfolio.totalInvested;
    paperPortfolio.totalPnLPercent = Number(((paperPortfolio.totalPnL / paperPortfolio.totalInvested) * 100).toFixed(2));
    paperPortfolio.todayPnL = Number((relQuote.change * 50 + tcsQuote.change * 30 + hdfcQuote.change * 100).toFixed(2));
    paperPortfolio.todayPnLPercent = Number(((paperPortfolio.todayPnL / paperPortfolio.portfolioValue) * 100).toFixed(2));
    paperPortfolio.xirr = 14.8;
    paperPortfolio.maxDrawdown = -2.4;

    paperPortfolio.orders = [
      {
        id: 'ord-101',
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
        id: 'ord-102',
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
    ];
  }
}

let activeAlerts: PriceAlert[] = [
  { id: 'alt-1', symbol: 'RELIANCE', type: 'PRICE_ABOVE', threshold: 3000.0, createdAt: new Date().toISOString(), triggered: false, note: 'Take partial profits at resistance' },
  { id: 'alt-2', symbol: 'HDFCBANK', type: 'RSI_THRESHOLD', threshold: 60.0, createdAt: new Date().toISOString(), triggered: false, note: 'Momentum breakout confirmation' },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'StockStar AI Intelligence Platform' });
  });

  // Market Status (Real IST Calculation)
  app.get(['/api/market/status', '/api/markets/status'], (req, res) => {
    res.json(marketDataService.getMarketStatus());
  });

  // Market Overview (supports both /api/market/overview and /api/markets/overview)
  app.get(['/api/market/overview', '/api/markets/overview'], (req, res) => {
    const quotes = marketDataService.getAllQuotes();
    const sortedByGain = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
    const sortedByLoss = [...quotes].sort((a, b) => a.changePercent - b.changePercent);
    const sortedByVolume = [...quotes].sort((a, b) => b.volume - a.volume);

    // AI Opportunities: High Fundamental Score + Bullish ML Ensemble
    const aiOpportunities = quotes
      .map(q => {
        const f = marketDataService.getFundamentals(q.symbol);
        const t = marketDataService.getTechnicals(q.symbol);
        const p = mlEngineService.generatePrediction(q.symbol, '7D');
        return {
          symbol: q.symbol,
          name: q.name,
          price: q.price,
          changePercent: q.changePercent,
          fundamentalScore: f?.fundamentalScore || 70,
          technicalScore: t?.technicalScore || 65,
          probabilityUp: p.probabilityUp,
          expectedReturn: p.expectedReturn,
          signal: p.models[0].signal,
        };
      })
      .filter(item => item.probabilityUp >= 0.58)
      .sort((a, b) => b.probabilityUp - a.probabilityUp);

    res.json({
      status: marketDataService.getMarketStatus(),
      indices: marketDataService.getMarketIndices(),
      topGainers: sortedByGain.slice(0, 5),
      topLosers: sortedByLoss.slice(0, 5),
      mostActive: sortedByVolume.slice(0, 5),
      aiOpportunities: aiOpportunities.slice(0, 5),
      sectors: marketDataService.getSectorHeatmap(),
      breadth: marketDataService.getMarketBreadth(),
      news: marketDataService.getNews(),
    });
  });

  // All Stocks List
  app.get('/api/stocks', (req, res) => {
    const quotes = marketDataService.getAllQuotes();
    res.json({ stocks: quotes, total: quotes.length });
  });

  // Search Stocks (Fuzzy matching)
  app.get('/api/stocks/search', (req, res) => {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const quotes = marketDataService.getAllQuotes();
    if (!q) {
      return res.json(quotes.slice(0, 10));
    }
    const filtered = quotes.filter(
      stock =>
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q) ||
        stock.exchange.toLowerCase().includes(q)
    );
    res.json(filtered);
  });

  // Single Stock Full Terminal Bundle
  app.get('/api/stocks/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const quote = marketDataService.getQuote(symbol);
    if (!quote) {
      return res.status(404).json({ error: `Stock ${symbol} not found in universe` });
    }

    const technicals = marketDataService.getTechnicals(symbol);
    const fundamentals = marketDataService.getFundamentals(symbol);
    const prediction = mlEngineService.generatePrediction(symbol, '7D');
    const news = marketDataService.getNews(symbol);
    const depth = marketDataService.getMarketDepth(symbol);

    res.json({
      quote,
      technicals,
      fundamentals,
      prediction,
      news,
      depth,
      status: marketDataService.getMarketStatus(),
    });
  });

  // Quote & Depth
  app.get('/api/stocks/:symbol/quote', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const quote = marketDataService.getQuote(symbol);
    if (!quote) return res.status(404).json({ error: 'Stock not found' });
    res.json({ quote, depth: marketDataService.getMarketDepth(symbol) });
  });

  // Historical Candles
  app.get('/api/stocks/:symbol/history', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const timeframe = (req.query.timeframe as string) || '1Y';
    const interval = (req.query.interval as string) || '1D';
    const candles = marketDataService.getHistoricalData(symbol, timeframe, interval);
    res.json({ symbol, timeframe, interval, candles });
  });

  // Technical Indicators
  app.get('/api/stocks/:symbol/technicals', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const technicals = marketDataService.getTechnicals(symbol);
    if (!technicals) return res.status(404).json({ error: 'Technicals not found' });
    res.json(technicals);
  });

  // Fundamentals
  app.get('/api/stocks/:symbol/fundamentals', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const fundamentals = marketDataService.getFundamentals(symbol);
    if (!fundamentals) return res.status(404).json({ error: 'Fundamentals not found' });
    res.json(fundamentals);
  });

  // ML Prediction across horizons
  app.get('/api/stocks/:symbol/prediction', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const horizon = (req.query.horizon as PredictionHorizon) || '7D';
    const prediction = mlEngineService.generatePrediction(symbol, horizon);
    res.json(prediction);
  });

  // Stock Comparison (Up to 5 stocks)
  app.post('/api/stocks/compare', (req, res) => {
    const symbols: string[] = req.body.symbols || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
    const validSymbols = symbols.slice(0, 5).map(s => s.toUpperCase());

    const results = validSymbols.map(sym => {
      const quote = marketDataService.getQuote(sym);
      const technicals = marketDataService.getTechnicals(sym);
      const fundamentals = marketDataService.getFundamentals(sym);
      const prediction = mlEngineService.generatePrediction(sym, '7D');
      return {
        symbol: sym,
        quote,
        technicals,
        fundamentals,
        prediction,
      };
    }).filter(r => r.quote !== null);

    res.json({ comparison: results });
  });

  // Screener Endpoint
  app.get('/api/screener', (req, res) => {
    const quotes = marketDataService.getAllQuotes();
    const {
      sector,
      marketCapMin,
      peMax,
      roeMin,
      roceMin,
      rsiMax,
      rsiMin,
      minAiScore,
    } = req.query;

    const filtered = quotes.filter(q => {
      const f = marketDataService.getFundamentals(q.symbol);
      const t = marketDataService.getTechnicals(q.symbol);

      if (sector && q.sector.toLowerCase() !== (sector as string).toLowerCase()) return false;
      if (marketCapMin && q.marketCap < Number(marketCapMin)) return false;
      if (peMax && q.peRatio > Number(peMax)) return false;
      if (roeMin && (f?.roe || 0) < Number(roeMin)) return false;
      if (roceMin && (f?.roce || 0) < Number(roceMin)) return false;
      if (rsiMax && (t?.rsi14 || 50) > Number(rsiMax)) return false;
      if (rsiMin && (t?.rsi14 || 50) < Number(rsiMin)) return false;
      if (minAiScore && (f?.fundamentalScore || 0) < Number(minAiScore)) return false;
      return true;
    }).map(q => {
      const f = marketDataService.getFundamentals(q.symbol);
      const t = marketDataService.getTechnicals(q.symbol);
      const p = mlEngineService.generatePrediction(q.symbol, '7D');
      return {
        symbol: q.symbol,
        name: q.name,
        exchange: q.exchange,
        sector: q.sector,
        price: q.price,
        changePercent: q.changePercent,
        marketCap: q.marketCap,
        peRatio: q.peRatio,
        roe: f?.roe || 0,
        roce: f?.roce || 0,
        rsi14: t?.rsi14 || 50,
        fundamentalScore: f?.fundamentalScore || 70,
        technicalScore: t?.technicalScore || 65,
        probabilityUp: p.probabilityUp,
        signal: p.models[0].signal,
      };
    });

    res.json({ total: filtered.length, results: filtered });
  });

  // AI Screener: Natural Language Filter Parser
  app.post('/api/screener/ai', async (req, res) => {
    try {
      const query = req.body.query || '';
      const parsed = await geminiService.parseNaturalLanguageScreener(query);
      res.json(parsed);
    } catch (err: any) {
      console.warn('[API /api/screener/ai] Handled error:', err?.message || err);
      res.json({
        explanation: 'Screened according to default institutional criteria.',
        filters: { roeMin: 15, peMax: 35 },
      });
    }
  });

  // StockStar Copilot: Full institutional AI assistant
  app.post('/api/ai/copilot', async (req, res) => {
    try {
      const { query, question, symbol, currentSymbol } = req.body;
      const effectiveQuery = query || question || 'Provide comprehensive market intelligence and trade setups';
      const effectiveSymbol = symbol || currentSymbol || undefined;

      const portfolioSnapshot = {
        positions: paperPortfolio.positions,
        cashBalance: paperPortfolio.cashBalance,
        portfolioValue: paperPortfolio.portfolioValue,
        totalPnL: paperPortfolio.totalPnL,
        totalPnLPercent: paperPortfolio.totalPnLPercent,
      };

      const result = await geminiService.askCopilot(effectiveQuery, effectiveSymbol, portfolioSnapshot);
      res.json(result);
    } catch (err: any) {
      console.warn('[API /api/ai/copilot] Handled error:', err?.message || err);
      res.status(500).json({ error: 'Failed to generate copilot intelligence' });
    }
  });

  // AI Stock Analyst: Structured research response & legacy ask endpoint
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { symbol, query, question, currentSymbol } = req.body;
      const effectiveQuery = query || question || '';
      const effectiveSymbol = symbol || currentSymbol;

      if (effectiveSymbol && marketDataService.getQuote(effectiveSymbol)) {
        const analysis = await geminiService.analyzeStock(effectiveSymbol, effectiveQuery);
        res.json(analysis);
      } else {
        const portfolioSnapshot = {
          positions: paperPortfolio.positions,
          cashBalance: paperPortfolio.cashBalance,
          portfolioValue: paperPortfolio.portfolioValue,
        };
        const result = await geminiService.askCopilot(effectiveQuery || 'Macro market overview', effectiveSymbol, portfolioSnapshot);
        res.json(result);
      }
    } catch (err: any) {
      console.warn('[API /api/ai/ask] Handled error:', err?.message || err);
      res.status(500).json({ error: 'Failed to process AI equity analysis' });
    }
  });

  // AI News Analyzer
  app.post('/api/ai/news-analysis', async (req, res) => {
    try {
      const { headline, symbol } = req.body;
      const analysis = await geminiService.analyzeNews(headline || '', symbol || 'NIFTY');
      res.json(analysis);
    } catch (err: any) {
      console.warn('[API /api/ai/news-analysis] Handled error:', err?.message || err);
      res.status(500).json({ error: 'Failed to process news analysis' });
    }
  });

  // AI Tutor & Quiz Generator
  app.post('/api/ai/tutor', async (req, res) => {
    try {
      const { question, contextTopic } = req.body;
      const result = await geminiService.askTutor(question || 'Explain P/E ratio', contextTopic);
      res.json(result);
    } catch (err: any) {
      console.warn('[API /api/ai/tutor] Handled error:', err?.message || err);
      res.json({
        explanation: 'The Price-to-Earnings (P/E) ratio measures the valuation multiple of a company by dividing share price by earnings per share.',
        analogy: 'Like valuing a local business based on how many years of its current profit equal the asking price.',
        keyTakeaways: [
          'High P/E signifies high growth expectations or low perceived risk.',
          'Always benchmark against peers in the same industry.',
        ],
        quizQuestion: {
          question: 'If a stock trades at ₹1,000 and has an EPS of ₹50, what is its P/E ratio?',
          options: ['10x', '20x', '30x', '50x'],
          correctIndex: 1,
          explanation: 'P/E = 1,000 / 50 = 20x.',
        },
      });
    }
  });

  // AI Portfolio Risk Report
  app.post('/api/ai/portfolio-analysis', async (req, res) => {
    try {
      const report = await geminiService.analyzePortfolio(
        paperPortfolio.positions,
        paperPortfolio.cashBalance,
        paperPortfolio.portfolioValue
      );
      res.json(report);
    } catch (err: any) {
      console.warn('[API /api/ai/portfolio-analysis] Handled error:', err?.message || err);
      res.json({
        diversification_score: 75,
        concentration_risk: 'Balanced across tracked sector allocations.',
        sector_exposure_analysis: 'Sufficient liquidity retained in cash reserves.',
        tactical_suggestions: ['Maintain balanced position sizing and disciplined stop-loss rules.'],
        disclaimer: 'Probabilistic simulation for educational purposes.',
      });
    }
  });

  // ML Performance & Walk-Forward Validation
  app.get('/api/ml/performance', (req, res) => {
    res.json({
      metrics: mlEngineService.getModelPerformanceMetrics(),
      sampleBacktest: mlEngineService.runWalkForwardBacktest('RELIANCE', 'MOMENTUM_ML'),
    });
  });

  // Interactive Backtest Execution
  app.post('/api/ml/backtest', (req, res) => {
    const { symbol, strategy, lookbackDays } = req.body;
    const result = mlEngineService.runWalkForwardBacktest(
      symbol || 'RELIANCE',
      strategy || 'MOMENTUM_ML',
      lookbackDays || 365
    );
    res.json(result);
  });

  // Learning Courses
  app.get('/api/learning/trading-course', (req, res) => {
    res.json({ levels: TRADING_COURSE_LEVELS });
  });

  app.get('/api/learning/investing-course', (req, res) => {
    res.json({ modules: INVESTING_COURSE_MODULES });
  });

  app.get('/api/learning/glossary', (req, res) => {
    res.json({ glossary: FINANCIAL_GLOSSARY });
  });

  // Paper Trading Endpoints
  app.get('/api/paper/portfolio', (req, res) => {
    // Refresh current prices and unrealized P&L
    let totalInvested = 0;
    let currentVal = 0;
    let todayPnL = 0;

    paperPortfolio.positions = paperPortfolio.positions.map(pos => {
      const quote = marketDataService.getQuote(pos.symbol);
      const currPrice = quote ? quote.price : pos.currentPrice;
      const posVal = pos.quantity * currPrice;
      const unPnL = posVal - pos.investedAmount;
      const unPnLPct = Number(((unPnL / pos.investedAmount) * 100).toFixed(2));
      totalInvested += pos.investedAmount;
      currentVal += posVal;
      if (quote) todayPnL += quote.change * pos.quantity;

      return {
        ...pos,
        currentPrice: currPrice,
        currentValue: posVal,
        unrealizedPnL: unPnL,
        unrealizedPnLPercent: unPnLPct,
      };
    });

    paperPortfolio.totalInvested = totalInvested;
    paperPortfolio.portfolioValue = Number((paperPortfolio.cashBalance + currentVal).toFixed(2));
    paperPortfolio.totalPnL = Number((currentVal - totalInvested).toFixed(2));
    paperPortfolio.totalPnLPercent = totalInvested > 0 ? Number(((paperPortfolio.totalPnL / totalInvested) * 100).toFixed(2)) : 0;
    paperPortfolio.todayPnL = Number(todayPnL.toFixed(2));
    paperPortfolio.todayPnLPercent = Number(((todayPnL / paperPortfolio.portfolioValue) * 100).toFixed(2));

    res.json(paperPortfolio);
  });

  // Place Paper Order
  app.post('/api/paper/order', (req, res) => {
    const { symbol, side, orderType, quantity, price, targetPrice, stopLossPrice } = req.body;
    const s = (symbol || '').toUpperCase();
    const quote = marketDataService.getQuote(s);

    if (!quote) return res.status(404).json({ error: 'Stock not found' });
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) return res.status(400).json({ error: 'Invalid quantity' });

    const executionPrice = orderType === 'MARKET' ? quote.price : (Number(price) || quote.price);
    const totalCost = qty * executionPrice;

    if (side === 'BUY') {
      if (paperPortfolio.cashBalance < totalCost) {
        return res.status(400).json({ error: `Insufficient virtual cash balance. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${paperPortfolio.cashBalance.toLocaleString('en-IN')}` });
      }

      paperPortfolio.cashBalance -= totalCost;
      const existingPos = paperPortfolio.positions.find(p => p.symbol === s);
      if (existingPos) {
        const newTotalQty = existingPos.quantity + qty;
        const newInvested = existingPos.investedAmount + totalCost;
        existingPos.quantity = newTotalQty;
        existingPos.investedAmount = newInvested;
        existingPos.averagePrice = Number((newInvested / newTotalQty).toFixed(2));
        existingPos.currentPrice = quote.price;
        existingPos.currentValue = newTotalQty * quote.price;
        existingPos.unrealizedPnL = existingPos.currentValue - newInvested;
        existingPos.unrealizedPnLPercent = Number(((existingPos.unrealizedPnL / newInvested) * 100).toFixed(2));
      } else {
        paperPortfolio.positions.push({
          symbol: s,
          stockName: quote.name,
          quantity: qty,
          averagePrice: executionPrice,
          currentPrice: quote.price,
          investedAmount: totalCost,
          currentValue: totalCost,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          sector: quote.sector,
        });
      }
    } else if (side === 'SELL') {
      const existingPosIndex = paperPortfolio.positions.findIndex(p => p.symbol === s);
      if (existingPosIndex === -1 || paperPortfolio.positions[existingPosIndex].quantity < qty) {
        return res.status(400).json({ error: `Insufficient share position to sell. You hold ${existingPosIndex !== -1 ? paperPortfolio.positions[existingPosIndex].quantity : 0} shares.` });
      }

      const existingPos = paperPortfolio.positions[existingPosIndex];
      paperPortfolio.cashBalance += totalCost;
      if (existingPos.quantity === qty) {
        paperPortfolio.positions.splice(existingPosIndex, 1);
      } else {
        const remainingQty = existingPos.quantity - qty;
        const remainingInvested = (existingPos.investedAmount / existingPos.quantity) * remainingQty;
        existingPos.quantity = remainingQty;
        existingPos.investedAmount = remainingInvested;
        existingPos.currentValue = remainingQty * quote.price;
        existingPos.unrealizedPnL = existingPos.currentValue - remainingInvested;
        existingPos.unrealizedPnLPercent = Number(((existingPos.unrealizedPnL / remainingInvested) * 100).toFixed(2));
      }
    }

    const order: PaperOrder = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      symbol: s,
      stockName: quote.name,
      side,
      orderType,
      quantity: qty,
      price: executionPrice,
      targetPrice,
      stopLossPrice,
      status: 'EXECUTED',
      placedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      totalAmount: totalCost,
    };

    paperPortfolio.orders.unshift(order);
    res.json({ success: true, order, portfolio: paperPortfolio });
  });

  // Reset Paper Trading Portfolio
  app.post('/api/paper/reset', (req, res) => {
    const initialCash = Number(req.body.initialCash) || 1000000.0;
    paperPortfolio = {
      cashBalance: initialCash,
      totalInvested: 0.0,
      portfolioValue: initialCash,
      totalPnL: 0.0,
      totalPnLPercent: 0.0,
      todayPnL: 0.0,
      todayPnLPercent: 0.0,
      xirr: 0.0,
      maxDrawdown: 0.0,
      positions: [],
      orders: [],
    };
    res.json({ success: true, portfolio: paperPortfolio, message: `Portfolio reset to ₹${initialCash.toLocaleString('en-IN')}` });
  });

  // Add Virtual Cash / Top Up
  app.post('/api/paper/topup', (req, res) => {
    const amount = Number(req.body.amount) || 100000.0;
    paperPortfolio.cashBalance += amount;
    paperPortfolio.portfolioValue += amount;
    res.json({ success: true, portfolio: paperPortfolio, message: `Added ₹${amount.toLocaleString('en-IN')} virtual cash` });
  });

  // Load Demo Practice Positions
  app.post('/api/paper/load-demo', (req, res) => {
    seedDemoPortfolio();
    res.json({ success: true, portfolio: paperPortfolio, message: 'Loaded demo positions' });
  });

  // Close / Square Off Position
  app.post('/api/paper/close-position', (req, res) => {
    const { symbol } = req.body;
    const s = (symbol || '').toUpperCase();
    const existingPosIndex = paperPortfolio.positions.findIndex(p => p.symbol === s);
    if (existingPosIndex === -1) {
      return res.status(404).json({ error: `No open position found for ${s}` });
    }

    const pos = paperPortfolio.positions[existingPosIndex];
    const quote = marketDataService.getQuote(s);
    const currentPrice = quote ? quote.price : pos.currentPrice;
    const totalReceived = pos.quantity * currentPrice;

    paperPortfolio.cashBalance += totalReceived;
    paperPortfolio.positions.splice(existingPosIndex, 1);

    const order: PaperOrder = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      symbol: s,
      stockName: pos.stockName,
      side: 'SELL',
      orderType: 'MARKET',
      quantity: pos.quantity,
      price: currentPrice,
      status: 'EXECUTED',
      placedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      totalAmount: totalReceived,
    };

    paperPortfolio.orders.unshift(order);
    res.json({ success: true, order, portfolio: paperPortfolio });
  });

  // Price Alerts
  app.get('/api/alerts', (req, res) => {
    res.json(activeAlerts);
  });

  app.post('/api/alerts', (req, res) => {
    const { symbol, type, threshold, note } = req.body;
    const newAlert: PriceAlert = {
      id: `alt-${Date.now().toString().slice(-6)}`,
      symbol: (symbol || 'RELIANCE').toUpperCase(),
      type: type || 'PRICE_ABOVE',
      threshold: Number(threshold) || 1000,
      createdAt: new Date().toISOString(),
      triggered: false,
      note,
    };
    activeAlerts.unshift(newAlert);
    res.json({ success: true, alert: newAlert });
  });

  app.delete('/api/alerts/:id', (req, res) => {
    activeAlerts = activeAlerts.filter(a => a.id !== req.params.id);
    res.json({ success: true });
  });

  // Catch-all for API routes to always return JSON and never HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StockStar AI Terminal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
