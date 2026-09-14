import { CourseLevel, GlossaryTerm } from '../src/types';

export const TRADING_COURSE_LEVELS: CourseLevel[] = [
  {
    id: 'lvl-1',
    levelNumber: 1,
    title: 'Stock Market Basics & Exchange Mechanics',
    description: 'Understand how stock exchanges (NSE/BSE), order books, matching engines, and clearing corporations operate.',
    duration: '25 mins',
    lessons: [
      {
        id: 'l1-1',
        title: 'How Stock Exchanges Match Buyers and Sellers',
        summary: 'Exchanges operate continuous double-auction electronic limit order books (CLOB).',
        content: [
          'In modern exchanges like the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), trading occurs via electronic matching engines with zero manual floor intervention.',
          'Orders follow Price-Time Priority: Orders with better prices get matched first. When two orders have the exact same price, the order placed earlier in time takes priority.',
          'Market participants include Retail Investors, Domestic Institutional Investors (DIIs like mutual funds and insurance companies), and Foreign Institutional Investors (FIIs).',
        ],
        keyTakeaways: [
          'Every trade requires a willing buyer and seller agreeing on price.',
          'Bids represent what buyers are willing to pay; Asks (Offers) represent what sellers want.',
          'The spread is the difference between the best Bid and best Ask.',
        ],
        exercise: {
          prompt: 'If Buyer A bids ₹1,500 at 09:16:01 and Buyer B bids ₹1,500 at 09:16:05, who gets matched first when a market sell order arrives?',
          options: ['Buyer A (earlier timestamp)', 'Buyer B (later timestamp)', 'Both orders split 50/50', 'Random selection by matching engine'],
          correctIndex: 0,
          explanation: 'Exchanges enforce Price-Time priority. Since both bids had the same price of ₹1,500, Buyer A takes precedence due to the earlier timestamp.',
        },
      },
      {
        id: 'l1-2',
        title: 'Bid, Ask, Market Depth & Slippage',
        summary: 'How liquidity determines execution quality and why large orders move prices.',
        content: [
          'The Order Book (Market Depth) displays the top 5 (Level 2) or top 20 (Level 3) bid and ask orders awaiting execution.',
          'When executing a Market Order, you cross the spread and buy from the lowest Ask or sell to the highest Bid.',
          'If your order size exceeds the quantity available at the best price, your order consumes multiple levels of the book. This causes slippage.',
        ],
        keyTakeaways: [
          'Liquid stocks (like Nifty 50 constituents) have tight spreads (0.05% or less) and deep order books.',
          'Illiquid stocks carry high impact costs and erratic bid-ask spreads.',
        ],
        exercise: {
          prompt: 'What happens if you execute a market BUY order of 5,000 shares when the best ask has only 2,000 shares available?',
          options: [
            'The remaining 3,000 shares are automatically cancelled',
            'Your order fills 2,000 at the best ask and the remaining 3,000 at higher ask levels, resulting in slippage',
            'The exchange forces sellers to match your requested price',
            'Your order waits indefinitely until new sellers arrive at that price',
          ],
          correctIndex: 1,
          explanation: 'Market orders fill immediately by sweeping available orders up the book until the desired volume is satisfied, resulting in execution slippage.',
        },
      },
    ],
  },
  {
    id: 'lvl-2',
    levelNumber: 2,
    title: 'Candlestick Anatomy & Price Discovery',
    description: 'Master Japanese candlesticks, bullish/bearish engulfing patterns, hammers, dojis, and multi-candle confirmations.',
    duration: '35 mins',
    lessons: [
      {
        id: 'l2-1',
        title: 'The Four Pillars: Open, High, Low, Close (OHLC)',
        summary: 'Deconstructing what the candle body and upper/lower shadows reveal about buyer vs seller dominance.',
        content: [
          'Every Japanese candlestick encapsulates trading activity over a defined timeframe (e.g. 5-minute, 1-hour, or 1-day).',
          'The real body represents the range between Open and Close. Green indicates buyers pushed the price above the open; Red indicates sellers pushed it below.',
          'The wicks (shadows) represent extreme price rejection. A long lower shadow indicates bears attempted to drop the price, but aggressive buyers stepped in.',
        ],
        keyTakeaways: [
          'Long bodies show strong directional conviction.',
          'Dojis (negligible body) reflect equilibrium or indecision between bulls and bears.',
          'Wick length indicates rejection of higher or lower prices.',
        ],
        exercise: {
          prompt: 'What does a candlestick with a very small body and a long lower shadow (Hammer) typically signify near a major support level?',
          options: [
            'Immediate continuation of strong downward selling',
            'Bullish price rejection where buyers defended support and absorbed supply',
            'The exchange halted trading due to circuit limits',
            'Total lack of market liquidity',
          ],
          correctIndex: 1,
          explanation: 'A Hammer shows that sellers drove price down during the session, but buyers stepped in aggressively to close near the top of the range, signaling potential trend reversal.',
        },
      },
    ],
  },
  {
    id: 'lvl-3',
    levelNumber: 3,
    title: 'Support, Resistance & Supply-Demand Zones',
    description: 'Learn horizontal pivot levels, trendlines, moving average dynamic support, and order block accumulation zones.',
    duration: '30 mins',
    lessons: [
      {
        id: 'l3-1',
        title: 'Identifying Institutional Accumulation & Distribution',
        summary: 'Support is where buying interest is strong enough to overcome selling pressure.',
        content: [
          'Support and Resistance are price zones, not razor-thin lines. Institutions accumulate inventory in zones to avoid spiking market impact.',
          'Role Reversal (Polarity): Once a broken resistance level is decisively breached by high volume, it frequently transitions into future support on pullbacks.',
          'Consolidation near resistance with increasing volume is a classic pre-breakout signal.',
        ],
        keyTakeaways: [
          'The more frequently a support level is tested without breaking, the more eyes are watching it; however, repeated tests eventually deplete resting buy liquidity.',
          'Look for confluence: horizontal levels aligning with 200-day SMA or Fibonacci retracements.',
        ],
        exercise: {
          prompt: 'When a stock breaks above an established 6-month resistance level of ₹2,500 on 3x normal volume, what is the most probable subsequent behavior?',
          options: [
            'The stock immediately collapses back to ₹1,000',
            'The ₹2,500 level often acts as new support on subsequent pullbacks (Support-Resistance Flip)',
            'Trading in the stock is permanently barred',
            'Volume permanently drops to zero',
          ],
          correctIndex: 1,
          explanation: 'The principle of polarity dictates that broken resistance becomes support because breakout traders defend their entry and previous short-sellers look to cover at breakeven.',
        },
      },
    ],
  },
  {
    id: 'lvl-4',
    levelNumber: 4,
    title: 'Quantitative Indicators: Momentum, Trend & Volatility',
    description: 'Deep dive into mathematical formulation of RSI, MACD, Bollinger Bands, ATR, ADX, and VWAP.',
    duration: '40 mins',
    lessons: [
      {
        id: 'l4-1',
        title: 'RSI & Divergence: Measuring Relative Velocity',
        summary: 'Understand J. Welles Wilder’s Relative Strength Index and why overbought does not mean sell.',
        content: [
          'RSI measures the speed and magnitude of recent price changes over 14 periods on an oscillator scale from 0 to 100.',
          'In strong bull trends, RSI routinely oscillates between 40 and 80, rarely dipping below 30. Calling "overbought" too early cuts profitable winners short.',
          'Bullish Divergence occurs when price prints a Lower Low while the RSI prints a Higher Low, revealing that downward selling velocity is evaporating.',
        ],
        keyTakeaways: [
          'RSI > 70 indicates strong momentum, not an automatic short signal.',
          'Divergences provide early warning of exhaustion before price confirms the turn.',
        ],
        exercise: {
          prompt: 'If a stock hits a 52-week low at ₹800, but its 14-period RSI is significantly higher than at the previous swing low, what signal is formed?',
          options: ['Bearish breakout confirmation', 'Bullish divergence (momentum waning to downside)', 'Market circuit violation', 'Random noise'],
          correctIndex: 1,
          explanation: 'When price makes a lower low but the oscillator makes a higher low, it is a classic Regular Bullish Divergence indicating exhaustion of selling momentum.',
        },
      },
    ],
  },
  {
    id: 'lvl-5',
    levelNumber: 5,
    title: 'Price Action & Multi-Timeframe Confluence',
    description: 'Aligning weekly market structure with daily trends and intraday execution triggers.',
    duration: '30 mins',
    lessons: [
      {
        id: 'l5-1',
        title: 'Top-Down Analysis: Higher Timeframe Rules',
        summary: 'Trading in the direction of the dominant higher-timeframe trend significantly boosts win rate and Sharpe ratio.',
        content: [
          'The Weekly chart sets the Macro Trend and major liquidity pools.',
          'The Daily chart sets the intermediate swing structure (Higher Highs / Higher Lows).',
          'Intraday charts (15m / 1h) provide optimal risk-to-reward entry triggers with tight invalidation points.',
        ],
        keyTakeaways: [
          'Never fight the Weekly trend on an intraday counter-trend trade without exceptional confluence.',
          'Multi-timeframe alignment turns 50/50 guesses into statistically positive expectancy setups.',
        ],
      },
    ],
  },
  {
    id: 'lvl-6',
    levelNumber: 6,
    title: 'Position Sizing, Capital Preservation & Risk Management',
    description: 'The 1% risk rule, expectancy formula, risk-to-reward ratio, and drawdown avoidance mathematics.',
    duration: '35 mins',
    lessons: [
      {
        id: 'l6-1',
        title: 'The Mathematics of Position Sizing and Gambler’s Ruin',
        summary: 'Why losing 50% requires a 100% gain just to break even, and how to size positions safely.',
        content: [
          'Position Size = (Total Account Equity * Risk Percentage) / (Entry Price - Stop Loss Price).',
          'The 1% Rule dictates that if your stop loss is hit, you lose no more than 1% of your total account equity.',
          'With a 1:2.5 Risk-to-Reward ratio, a trader can be wrong 60% of the time and still remain consistently profitable.',
        ],
        keyTakeaways: [
          'Risk management is what separates professional market operators from gamblers.',
          'Never move a stop-loss further away once entered.',
        ],
        exercise: {
          prompt: 'With a ₹10,00,000 portfolio, risking 1% per trade (₹10,000 risk). If you buy a stock at ₹500 with a stop-loss at ₹480, how many shares should you buy?',
          options: ['20 shares', '500 shares', '1,000 shares', '2,000 shares'],
          correctIndex: 1,
          explanation: 'Risk per share = ₹500 - ₹480 = ₹20. Maximum allowable risk = ₹10,000. Position size = ₹10,000 / ₹20 = 500 shares.',
        },
      },
    ],
  },
  {
    id: 'lvl-7',
    levelNumber: 7,
    title: 'Systematic Trading Strategies',
    description: 'Breakout pullback systems, mean reversion around Bollinger Bands, and trend continuation using VWAP.',
    duration: '40 mins',
    lessons: [
      {
        id: 'l7-1',
        title: 'The VWAP Pullback Strategy for Liquid Equities',
        summary: 'How institutions benchmark execution against Volume Weighted Average Price.',
        content: [
          'VWAP is calculated by accumulating the sum of Price multiplied by Volume divided by total Volume throughout the session.',
          'When an uptrending stock pulls back to test rising VWAP from above with declining selling volume, it offers an institutional value entry.',
        ],
        keyTakeaways: [
          'VWAP is strictly an intraday indicator that resets every morning at market open.',
          'Institutions are penalized if their trade execution averages worse than the day’s VWAP.',
        ],
      },
    ],
  },
  {
    id: 'lvl-8',
    levelNumber: 8,
    title: 'Quantitative Backtesting & Walk-Forward Validation',
    description: 'Preventing look-ahead bias, curve fitting, survivorship bias, and assessing true out-of-sample edge.',
    duration: '45 mins',
    lessons: [
      {
        id: 'l8-1',
        title: 'The Dangers of Overfitting and Look-Ahead Bias',
        summary: 'Why backtests that look too good in simulation almost always blow up in live execution.',
        content: [
          'Overfitting happens when a model learns the historical noise rather than the underlying financial signal.',
          'Walk-Forward testing sequentially rolls training and out-of-sample test windows across changing market regimes (Bull, Bear, Sideways) to simulate realistic live adaptation.',
        ],
        keyTakeaways: [
          'Always factor in exchange transaction charges, STT, brokerage, and bid-ask slippage.',
          'A strategy with a 55% win rate and 1:2 risk-reward is vastly superior to an overfitted 95% win-rate system.',
        ],
      },
    ],
  },
  {
    id: 'lvl-9',
    levelNumber: 9,
    title: 'Trading Psychology & Discipline Execution',
    description: 'Overcoming FOMO, revenge trading, loss aversion bias, cognitive fatigue, and maintaining trade journals.',
    duration: '30 mins',
    lessons: [
      {
        id: 'l9-1',
        title: 'Mastering Loss Aversion and Emotional Detachment',
        summary: 'Daniel Kahneman’s Prospectus Theory: Losses hurt twice as much as equivalent gains feel good.',
        content: [
          'Traders hold onto losing positions hoping for a rebound, but cut winners quickly out of fear of losing small gains.',
          'Treat trading as a game of statistics, probability, and business operations, completely separated from your ego.',
        ],
        keyTakeaways: [
          'Accepting a small predefined loss is a normal operating expense of a trading business.',
          'Never trade when angry, exhausted, or attempting to avenge a recent loss.',
        ],
      },
    ],
  },
];

export const INVESTING_COURSE_MODULES = [
  { id: 'inv-1', title: 'What is Investing? Capital vs Speculation', duration: '15 mins', description: 'Understand how owning equity makes you a fractional business owner sharing in economic profits.' },
  { id: 'inv-2', title: 'Stocks vs Mutual Funds vs Index ETFs', duration: '20 mins', description: 'Pros, cons, expense ratios, active alpha generation vs low-cost passive index compounding.' },
  { id: 'inv-3', title: 'The Miracle of Compounding & Long Time Horizons', duration: '15 mins', description: 'Rule of 72, compounding dividends, and why time in the market beats timing the market.' },
  { id: 'inv-4', title: 'Introduction to Fundamental Analysis', duration: '25 mins', description: 'Top-down macro analysis, industry economics, and micro business competitiveness.' },
  { id: 'inv-5', title: 'Reading Financial Statements: Balance Sheet, P&L, Cash Flow', duration: '35 mins', description: 'The three interconnected financial statements and how money flows through an enterprise.' },
  { id: 'inv-6', title: 'Valuation Multiples: P/E, P/B, EV/EBITDA', duration: '30 mins', description: 'When to use Price-to-Earnings, Price-to-Book, and Enterprise Value multiples.' },
  { id: 'inv-7', title: 'Capital Efficiency: ROE, ROCE & ROIC', duration: '25 mins', description: 'Why Return on Capital Employed is the single greatest predictor of 10-year wealth creation.' },
  { id: 'inv-8', title: 'Debt, Solvency & Leverage Ratios', duration: '20 mins', description: 'Debt-to-Equity, Interest Coverage Ratio, and identifying debt-trap balance sheets.' },
  { id: 'inv-9', title: 'Free Cash Flow (FCF) vs Accounting Net Profit', duration: '25 mins', description: 'Cash is king: why net income can be manipulated by accruals but free cash flow cannot.' },
  { id: 'inv-10', title: 'Economic Moats & Competitive Advantages', duration: '30 mins', description: 'Brand equity, switching costs, network effects, cost advantages, and regulatory licenses.' },
  { id: 'inv-11', title: 'Corporate Governance & Management Integrity', duration: '25 mins', description: 'Related-party transactions, promoter pledges, auditor resignations, and capital allocation track record.' },
  { id: 'inv-12', title: 'Discounted Cash Flow (DCF) Valuation Principles', duration: '40 mins', description: 'Cost of capital (WACC), terminal value calculation, and calculating intrinsic margin of safety.' },
  { id: 'inv-13', title: 'Portfolio Construction & Asset Allocation', duration: '30 mins', description: 'Core-and-satellite portfolio strategies, correlation matrices, and rebalancing rules.' },
  { id: 'inv-14', title: 'Diversification: Eliminating Idiosyncratic Risk', duration: '20 mins', description: 'The mathematical benefits of holding 15-25 diversified companies across uncorrelated sectors.' },
  { id: 'inv-15', title: 'Managing Market Cycles, Crashes & Bear Markets', duration: '25 mins', description: 'Historical crashes in Indian and Global markets, dollar-cost averaging (SIPs), and contrarian buying.' },
  { id: 'inv-16', title: 'Tax Efficiency & Wealth Compounding (STCG / LTCG)', duration: '20 mins', description: 'Long-term vs short-term capital gains tax implications in India and portfolio turnover impact.' },
  { id: 'inv-17', title: 'Lifelong Investing Temperament & Warren Buffett Rules', duration: '20 mins', description: 'Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.' },
];

export const FINANCIAL_GLOSSARY: GlossaryTerm[] = [
  { term: 'Alpha', category: 'Portfolio', definition: 'The excess return of an investment relative to the return of a benchmark index.', formula: 'Alpha = Actual Return - [Risk-Free Rate + Beta * (Benchmark Return - Risk-Free Rate)]', example: 'A fund generating 18% return when Nifty delivers 14% exhibits positive Alpha of +4%.', significance: 'Measures active managerial and predictive skill beyond generic market beta.' },
  { term: 'Beta', category: 'Risk', definition: 'A measure of the volatility or systematic risk of a security in comparison to the market as a whole.', formula: 'Beta = Covariance(Stock, Market) / Variance(Market)', example: 'A beta of 1.3 means if Nifty rises 1%, the stock tends to rise 1.3%; if Nifty falls 1%, it tends to fall 1.3%.', significance: 'High beta stocks offer higher returns in bull markets but deeper drawdowns during corrections.' },
  { term: 'EPS (Earnings Per Share)', category: 'Fundamentals', definition: 'The portion of a company’s net profit allocated to each outstanding share of common stock.', formula: 'EPS = (Net Income - Preferred Dividends) / Weighted Average Shares Outstanding', example: 'Tata Consultancy Services generating ₹46,580 Cr profit on 363 Cr shares results in an EPS of ₹128.2.', significance: 'The primary metric driving stock valuations and earnings multiples.' },
  { term: 'P/E (Price to Earnings)', category: 'Valuation', definition: 'The ratio of a company’s share price to its per-share earnings.', formula: 'P/E Ratio = Market Price per Share / Earnings Per Share (EPS)', example: 'Trading at ₹2,942 with an EPS of ₹108.8 gives Reliance a P/E of 27.8x.', significance: 'Indicates how many rupees/dollars investors pay for ₹1/$1 of annual corporate earnings.' },
  { term: 'ROE (Return on Equity)', category: 'Profitability', definition: 'A measure of financial performance calculated by dividing net income by shareholders’ equity.', formula: 'ROE = Net Income / Shareholders’ Equity', example: 'TCS generated ₹46,580 Cr net income on ₹96,500 Cr equity, delivering an extraordinary ROE of 48.2%.', significance: 'Measures how efficiently management generates profits from shareholder capital.' },
  { term: 'ROCE (Return on Capital Employed)', category: 'Profitability', definition: 'Measures a company’s profitability and the efficiency with which its total capital (debt + equity) is deployed.', formula: 'ROCE = EBIT / Total Capital Employed (Total Assets - Current Liabilities)', example: 'A debt-free FMCG firm with ROCE above 35% compounds capital far faster than a capital-heavy utility with ROCE of 9%.', significance: 'Superior to ROE for capital-intensive or debt-financed companies.' },
  { term: 'RSI (Relative Strength Index)', category: 'Technicals', definition: 'A momentum oscillator that measures the speed and change of price movements on a scale of 0 to 100.', formula: 'RSI = 100 - [100 / (1 + RS)], where RS = Average Gain / Average Loss over 14 periods', example: 'An RSI reading of 63 indicates healthy bullish momentum without being overextended.', significance: 'Identifies overbought (>70), oversold (<30), and momentum divergence opportunities.' },
  { term: 'MACD (Moving Average Convergence Divergence)', category: 'Technicals', definition: 'A trend-following momentum indicator showing the relationship between two exponential moving averages.', formula: 'MACD Line = 12-day EMA - 26-day EMA; Signal Line = 9-day EMA of MACD Line', example: 'When MACD crosses above the signal line with an expanding histogram, a bullish momentum shift is signaled.', significance: 'Widely used for trend confirmation and momentum entry timing.' },
  { term: 'VWAP (Volume Weighted Average Price)', category: 'Technicals', definition: 'The benchmark price ratio of total value traded to total volume traded throughout a single trading day.', formula: 'VWAP = Σ (Price * Volume) / Σ Volume', example: 'If Reliance trades at ₹2,945 while VWAP is ₹2,931, the stock is showing intraday buyer dominance.', significance: 'Institutional execution benchmark and key intraday support/resistance pivot.' },
  { term: 'Max Drawdown', category: 'Risk', definition: 'The maximum observed loss from a peak to a trough of a portfolio before a new peak is attained.', formula: 'Drawdown = (Trough Value - Peak Value) / Peak Value', example: 'A strategy dropping from ₹10,00,000 to ₹9,15,800 suffered a maximum drawdown of -8.42%.', significance: 'The ultimate risk test for psychological survival and risk-adjusted Sharpe performance.' },
  { term: 'Free Cash Flow (FCF)', category: 'Fundamentals', definition: 'The cash a company generates after accounting for cash outflows that support operations and maintain its capital assets.', formula: 'FCF = Operating Cash Flow - Capital Expenditures (CapEx)', example: 'Infosys generated ₹28,000 Cr operating cash flow with ₹4,500 Cr capex, resulting in ₹23,500 Cr FCF.', significance: 'The real money available to pay dividends, buy back shares, or acquire competitors.' },
  { term: 'Market Depth', category: 'Trading', definition: 'The list of open buy and sell limit orders waiting to be executed at various price levels (Order Book).', formula: 'Calculated as cumulative bid quantity vs cumulative ask quantity across price levels', example: 'Level 2 market depth shows 5 tiers of bids and asks to assess instantaneous liquidity.', significance: 'Helps traders gauge institutional support and avoid slippage.' },
];
