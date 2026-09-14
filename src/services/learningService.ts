import { CourseLevel, CourseLesson, GlossaryTerm } from '../types';

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
    title: 'Position Sizing & Capital Preservation',
    description: 'The 1% risk rule, expectancy formula, risk-to-reward ratio, and drawdown avoidance mathematics.',
    duration: '35 mins',
    lessons: [
      {
        id: 'l5-1',
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
];

export interface InvestingModule {
  id: string;
  title: string;
  duration: string;
  description: string;
  category: string;
  lesson: CourseLesson;
}

export const INVESTING_COURSE_MODULES: InvestingModule[] = [
  {
    id: 'inv-1',
    title: 'What is Investing? Capital vs Speculation',
    duration: '15 mins',
    description: 'Understand how owning equity makes you a fractional business owner sharing in economic profits.',
    category: 'Foundations',
    lesson: {
      id: 'inv-1',
      title: 'What is Investing? Capital Allocation vs Speculation',
      summary: 'Investing is the allocation of capital into productive assets that generate real economic cash flows over time.',
      content: [
        'When you buy a share of stock on the National Stock Exchange (NSE), you are not merely purchasing a flashing ticker symbol on a screen. You become a fractional proportional owner of a real commercial business.',
        'Benjamin Graham famously wrote: "In the short run, the market is a voting machine, but in the long run, it is a weighing machine." Short-term prices swing on sentiment, headlines, and liquidity; long-term value is anchored to corporate earnings and free cash flow.',
        'Speculation is placing money on the hope that someone else will pay more for an asset tomorrow (the Greater Fool Theory). True investing is providing capital to an enterprise that compounds retained earnings into higher future income.',
      ],
      keyTakeaways: [
        'Stocks represent fractional legal ownership in tangible business operations.',
        'Prices fluctuate wildly around intrinsic business value.',
        'The primary return drivers over 5+ years are earnings growth, dividend yield, and return on invested capital (ROIC).',
      ],
      exercise: {
        prompt: 'According to fundamental investing principles, what fundamentally anchors a company’s stock price over a multi-year horizon?',
        options: [
          'Social media hype and retail trading volume',
          'The underlying growth of corporate revenues, net profits, and free cash flows',
          'Daily market gossip and astrological cycles',
          'Arbitrary decisions made by the stock exchange',
        ],
        correctIndex: 1,
        explanation: 'Over long periods, stock prices track the underlying economic reality of corporate earnings power and free cash generation.',
      },
    },
  },
  {
    id: 'inv-2',
    title: 'Stocks vs Mutual Funds vs Index ETFs',
    duration: '20 mins',
    description: 'Pros, cons, expense ratios, active alpha generation vs low-cost passive index compounding.',
    category: 'Instruments',
    lesson: {
      id: 'inv-2',
      title: 'Vehicle Selection: Direct Equities, Mutual Funds, and Index ETFs',
      summary: 'Choosing the right vehicle based on time commitment, expense drag, and risk tolerance.',
      content: [
        'Direct Stock Ownership offers maximum control and uncapped upside, but requires rigorous continuous research, financial statement analysis, and discipline.',
        'Active Mutual Funds pool investor capital under professional portfolio managers who attempt to outperform market benchmarks in exchange for an annual Total Expense Ratio (TER) of 0.5% to 2.0%.',
        'Passive Index ETFs (like Nifty 50 or Nifty Next 50 ETFs) simply replicate market indices at rock-bottom costs (often 0.04% to 0.15% TER), capturing long-term economic expansion with minimal management drag.',
      ],
      keyTakeaways: [
        'An expense ratio difference of 1.5% compounded over 25 years can consume up to 30% of your total terminal wealth.',
        'Direct stocks allow tailored tax harvesting and concentrated alpha.',
        'Index funds guarantee matching market returns without manager selection risk.',
      ],
      exercise: {
        prompt: 'Why do low Total Expense Ratios (TER) in Index ETFs make a dramatic difference over long compounding horizons?',
        options: [
          'High fees do not affect returns over time',
          'Fees are deducted annually from assets, creating an exponential compounding drag on wealth accumulation',
          'ETFs are legally required to guarantee 20% annual returns',
          'Brokers provide free loans to ETF holders',
        ],
        correctIndex: 1,
        explanation: 'Every basis point saved in annual fund management fees stays invested, compounding exponentially in your favor over decades.',
      },
    },
  },
  {
    id: 'inv-3',
    title: 'The Miracle of Compounding & Long Horizons',
    duration: '15 mins',
    description: 'Rule of 72, compounding dividends, and why time in the market beats timing the market.',
    category: 'Foundations',
    lesson: {
      id: 'inv-3',
      title: 'Exponential Compounding & The Power of Time',
      summary: 'Albert Einstein reportedly termed compound interest the eighth wonder of the world.',
      content: [
        'Linear growth adds a fixed amount each period. Exponential growth multiplies previous gains, causing the hockey-stick curve where 80% of wealth is created in the final decade.',
        'The Rule of 72 provides a quick mental calculation: Divide 72 by the annual return rate to discover how many years it takes for your capital to double. At a 12% CAGR, money doubles every 6 years (72 / 12 = 6).',
        'Timing the market is historically destructive: missing just the 10 best trading days across a 20-year period typically cuts an investor’s total compounded returns in half.',
      ],
      keyTakeaways: [
        'Time in the market consistently outperforms attempts to time market bottoms.',
        'Reinvesting dividends accelerates the doubling frequency of compounding.',
        'Patience is the greatest behavioral competitive advantage an individual investor possesses.',
      ],
      exercise: {
        prompt: 'Using the Rule of 72, if your equity portfolio achieves an average annual return of 14.4%, approximately how long will it take for ₹10,00,000 to double to ₹20,00,000?',
        options: ['10 years', '7.2 years', '5 years', '2 years'],
        correctIndex: 2,
        explanation: '72 / 14.4 = 5.0 years. At 14.4% CAGR, capital doubles every 5 years.',
      },
    },
  },
  {
    id: 'inv-4',
    title: 'Reading Financial Statements: Balance Sheet & P&L',
    duration: '35 mins',
    description: 'The three interconnected financial statements and how money flows through an enterprise.',
    category: 'Analysis',
    lesson: {
      id: 'inv-4',
      title: 'Deconstructing the Balance Sheet, P&L, and Cash Flow',
      summary: 'Mastering the language of business across assets, liabilities, operating leverage, and cash conversion.',
      content: [
        'The Profit & Loss (P&L) statement records revenues, operating expenses, depreciation, taxes, and net profit over a quarterly or annual reporting period.',
        'The Balance Sheet provides a frozen snapshot of solvency at a specific date: Assets = Liabilities + Shareholders’ Equity. Check for debt-to-equity and working capital health.',
        'The Cash Flow Statement bridges the gap between accrual accounting profits and actual bank balances through Operating, Investing, and Financing activities.',
      ],
      keyTakeaways: [
        'Revenue is vanity, profit is sanity, but cash flow is reality.',
        'Always check whether Operating Cash Flow matches or exceeds Accounting Net Profit over a 3-5 year trend.',
        'High debt with fluctuating operating margins creates extreme financial risk during industry downturns.',
      ],
      exercise: {
        prompt: 'If a company reports ₹500 Cr in Net Profit on its P&L but shows negative ₹100 Cr in Operating Cash Flow due to surging uncollected receivables, what should an analyst suspect?',
        options: [
          'The company is extraordinarily liquid and safe',
          'Poor cash collection quality and potential aggressive revenue recognition',
          'The exchange has deposited secret bonus funds',
          'Depreciation was too low',
        ],
        correctIndex: 1,
        explanation: 'When net profit is positive but cash from operations is negative due to ballooning accounts receivable, reported profits are trapped on paper rather than flowing into the bank.',
      },
    },
  },
  {
    id: 'inv-5',
    title: 'Valuation Multiples: P/E, P/B, EV/EBITDA',
    duration: '30 mins',
    description: 'When to use Price-to-Earnings, Price-to-Book, and Enterprise Value multiples.',
    category: 'Valuation',
    lesson: {
      id: 'inv-5',
      title: 'Practical Valuation: Multiples & Intrinsic Value',
      summary: 'Valuation is the art and science of determining whether the current price offers an adequate margin of safety.',
      content: [
        'Price-to-Earnings (P/E) reflects the price paid per unit of current earnings. A high P/E implies investors expect massive earnings acceleration.',
        'Enterprise Value to EBITDA (EV/EBITDA) accounts for debt obligations and cash holdings, making it the superior multiple for comparing companies with differing capital structures.',
        'Price-to-Book (P/B) is primarily relevant for financial institutions (banks, NBFCs) where assets are liquid loans and securities marked near fair value.',
      ],
      keyTakeaways: [
        'Never look at P/E in isolation; compare it against the company’s earnings growth rate (PEG ratio).',
        'Cyclical companies (steel, commodities) look "cheap" at the peak of their cycle when earnings are abnormally high.',
        'Margin of Safety is the discount between prevailing market price and estimated conservative intrinsic value.',
      ],
      exercise: {
        prompt: 'Why is EV/EBITDA often considered superior to P/E when evaluating two manufacturing companies with identical revenues but different debt levels?',
        options: [
          'EV/EBITDA completely ignores all taxes forever',
          'EV accounts for both equity market cap and total net debt, neutralizing capital structure bias',
          'EV is always a lower number than P/E',
          'EBITDA is calculated by stock brokers',
        ],
        correctIndex: 1,
        explanation: 'Enterprise Value (Market Cap + Total Debt - Cash) captures the total acquisition cost of the enterprise regardless of whether it is financed by debt or equity.',
      },
    },
  },
  {
    id: 'inv-6',
    title: 'Capital Efficiency: ROE, ROCE & ROIC',
    duration: '25 mins',
    description: 'Why Return on Capital Employed is the single greatest predictor of 10-year wealth creation.',
    category: 'Quality',
    lesson: {
      id: 'inv-6',
      title: 'Capital Efficiency: ROE, ROCE & Long-Term Compounding',
      summary: 'Charlie Munger noted that over the long term, a stock return rarely exceeds the rate of return earned on its invested capital.',
      content: [
        'Return on Equity (ROE) = Net Income / Shareholders’ Equity. However, a company can artificially juice its ROE by taking on dangerous amounts of financial leverage (debt).',
        'Return on Capital Employed (ROCE) = EBIT / (Total Assets - Current Liabilities). It measures the operating return generated across all invested capital (both equity and debt).',
        'Companies with ROCE consistently above 20% possessing reinvestment runways act as "compounders" that create generational shareholder wealth.',
      ],
      keyTakeaways: [
        'High ROCE companies generate excess cash that can be redeployed at superior rates of return.',
        'Always decompose ROE via DuPont Analysis into Net Margin, Asset Turnover, and Financial Leverage.',
        'Debt-free businesses generating 30%+ ROCE rarely experience insolvency crises.',
      ],
      exercise: {
        prompt: 'Company A has a 40% ROE with 4.5x Debt-to-Equity. Company B has a 32% ROE with zero debt. Which business possesses a more durable capital efficiency profile?',
        options: [
          'Company A because 40% is higher than 32%',
          'Company B because its return is generated organically without the existential solvency risk of high financial leverage',
          'Both are identical in risk',
          'Neither company is investable',
        ],
        correctIndex: 1,
        explanation: 'Company A’s ROE is inflated by risky borrowed money. Company B achieves phenomenal returns using pure operational excellence with zero leverage risk.',
      },
    },
  },
  {
    id: 'inv-7',
    title: 'Economic Moats & Competitive Advantages',
    duration: '30 mins',
    description: 'Brand equity, switching costs, network effects, cost advantages, and regulatory licenses.',
    category: 'Quality',
    lesson: {
      id: 'inv-7',
      title: 'Economic Moats: Defending Corporate Profitability',
      summary: 'In a capitalist system, high returns on capital attract ruthless competition unless protected by a wide economic moat.',
      content: [
        'Network Effects occur when each additional user increases the value of the platform for all other participants (e.g. payment rails, social platforms, stock exchanges).',
        'High Switching Costs make it economically painful or operationally risky for customers to migrate to competitors (e.g. enterprise ERP software, core banking databases).',
        'Intangible Assets include valuable brand power (enabling pricing power without losing volume), proprietary patents, and government licenses.',
      ],
      keyTakeaways: [
        'Pricing Power is the ultimate litmus test of an economic moat: can the company raise prices by 10% without losing customer volume?',
        'Low-cost scale advantages allow dominant players to survive industry price wars while smaller peers bleed.',
        'Moat direction (widening vs narrowing) is more important than static moat width.',
      ],
      exercise: {
        prompt: 'What is the clearest real-world indicator that a business possesses a wide economic moat?',
        options: [
          'It constantly lowers prices and operates on 2% margins',
          'It possesses demonstrated pricing power and sustains high return on capital over a decade without market share loss',
          'It spends 90% of revenues on promotional marketing discounts',
          'It has the largest number of physical offices',
        ],
        correctIndex: 1,
        explanation: 'A wide moat permits a company to increase prices without ceding market share to rivals, protecting high returns on capital from competitive degradation.',
      },
    },
  },
  {
    id: 'inv-8',
    title: 'Portfolio Construction & Risk Allocation',
    duration: '30 mins',
    description: 'Core-and-satellite portfolio strategies, correlation matrices, and rebalancing rules.',
    category: 'Portfolio',
    lesson: {
      id: 'inv-8',
      title: 'Portfolio Construction, Asset Allocation & Rebalancing',
      summary: 'Asset allocation accounts for over 90% of the variance in total portfolio returns over time.',
      content: [
        'The Core-and-Satellite framework anchors 60-70% of capital in resilient low-cost broad index funds or large-cap compounders, while allocating 30-40% to high-conviction thematic satellite opportunities.',
        'Diversification is the only free lunch in finance: holding uncorrelated assets dampens overall portfolio volatility without sacrificing long-term expected returns.',
        'Systematic rebalancing (annually or when an asset drifts by >5% from target weight) forces you to sell winners that are overextended and buy depressed assets at attractive valuations.',
      ],
      keyTakeaways: [
        'Avoid diworsification: holding 60 individual stocks creates an index with high turnover and tracking errors.',
        'Position limits: avoid placing more than 10-15% of your total net worth into any single company.',
        'Cash is an active asset class that grants optionality during deep panic liquidity selloffs.',
      ],
      exercise: {
        prompt: 'What mathematical benefit does periodic portfolio rebalancing provide to a disciplined investor?',
        options: [
          'It guarantees you will never experience a red month',
          'It systematically forces you to take profits from outperforming assets and accumulate undervalued lagging assets',
          'It eliminates the need to pay taxes forever',
          'It automatically predicts interest rate changes',
        ],
        correctIndex: 1,
        explanation: 'Rebalancing automatically enforces the core maxim of investing: selling high (trimming asset classes that have expanded above target weight) and buying low.',
      },
    },
  },
];

export const FINANCIAL_GLOSSARY: GlossaryTerm[] = [
  { term: 'Alpha', category: 'Portfolio', definition: 'The excess return of an investment relative to the return of a benchmark index.', formula: 'Alpha = Actual Return - [Risk-Free Rate + Beta * (Benchmark Return - Risk-Free Rate)]', example: 'A fund generating 18% return when Nifty delivers 14% exhibits positive Alpha of +4%.', significance: 'Measures active managerial and predictive skill beyond generic market beta.' },
  { term: 'Beta', category: 'Risk', definition: 'A measure of the volatility or systematic risk of a security in comparison to the market as a whole.', formula: 'Beta = Covariance(Stock, Market) / Variance(Market)', example: 'A beta of 1.3 means if Nifty rises 1%, the stock tends to rise 1.3%; if Nifty falls 1%, it tends to fall 1.3%.', significance: 'High beta stocks offer higher returns in bull markets but deeper drawdowns during corrections.' },
  { term: 'EPS (Earnings Per Share)', category: 'Fundamentals', definition: 'The portion of a company’s net profit allocated to each outstanding share of common stock.', formula: 'EPS = (Net Income - Preferred Dividends) / Weighted Average Shares Outstanding', example: 'Tata Consultancy Services generating ₹46,099 Cr profit on 363 Cr shares results in an EPS of ₹126.8.', significance: 'The primary metric driving stock valuations and earnings multiples.' },
  { term: 'P/E (Price to Earnings)', category: 'Valuation', definition: 'The ratio of a company’s share price to its per-share earnings.', formula: 'P/E Ratio = Market Price per Share / Earnings Per Share (EPS)', example: 'Trading at ₹2,942 with an EPS of ₹108.8 gives Reliance a P/E of 27.8x.', significance: 'Indicates how many rupees/dollars investors pay for ₹1/$1 of annual corporate earnings.' },
  { term: 'ROE (Return on Equity)', category: 'Profitability', definition: 'A measure of financial performance calculated by dividing net income by shareholders’ equity.', formula: 'ROE = Net Income / Shareholders’ Equity', example: 'TCS generated ₹46,099 Cr net income on ₹96,500 Cr equity, delivering an extraordinary ROE of 48.2%.', significance: 'Measures how efficiently management generates profits from shareholder capital.' },
  { term: 'ROCE (Return on Capital Employed)', category: 'Profitability', definition: 'Measures a company’s profitability and the efficiency with which its total capital (debt + equity) is deployed.', formula: 'ROCE = EBIT / Total Capital Employed', example: 'A debt-free FMCG firm with ROCE above 35% compounds capital far faster than a capital-heavy utility with ROCE of 9%.', significance: 'Superior to ROE for capital-intensive or debt-financed companies.' },
  { term: 'RSI (Relative Strength Index)', category: 'Technicals', definition: 'A momentum oscillator that measures the speed and change of price movements on a scale of 0 to 100.', formula: 'RSI = 100 - [100 / (1 + RS)], where RS = Average Gain / Average Loss over 14 periods', example: 'An RSI reading of 63 indicates healthy bullish momentum without being overextended.', significance: 'Identifies overbought (>70), oversold (<30), and momentum divergence opportunities.' },
  { term: 'MACD (Moving Average Convergence Divergence)', category: 'Technicals', definition: 'A trend-following momentum indicator showing the relationship between two exponential moving averages.', formula: 'MACD Line = 12-day EMA - 26-day EMA; Signal Line = 9-day EMA of MACD Line', example: 'When MACD crosses above the signal line with an expanding histogram, a bullish momentum shift is signaled.', significance: 'Widely used for trend confirmation and momentum entry timing.' },
  { term: 'VWAP (Volume Weighted Average Price)', category: 'Technicals', definition: 'The benchmark price ratio of total value traded to total volume traded throughout a single trading day.', formula: 'VWAP = Σ (Price * Volume) / Σ Volume', example: 'If Reliance trades at ₹2,945 while VWAP is ₹2,931, the stock is showing intraday buyer dominance.', significance: 'Institutional execution benchmark and key intraday support/resistance pivot.' },
  { term: 'Max Drawdown', category: 'Risk', definition: 'The maximum observed loss from a peak to a trough of a portfolio before a new peak is attained.', formula: 'Drawdown = (Trough Value - Peak Value) / Peak Value', example: 'A strategy dropping from ₹10,00,000 to ₹9,15,800 suffered a maximum drawdown of -8.42%.', significance: 'The ultimate risk test for psychological survival and risk-adjusted Sharpe performance.' },
  { term: 'Free Cash Flow (FCF)', category: 'Fundamentals', definition: 'The cash a company generates after accounting for cash outflows that support operations and maintain its capital assets.', formula: 'FCF = Operating Cash Flow - Capital Expenditures (CapEx)', example: 'Infosys generated ₹26,248 Cr profit with ₹23,100 Cr FCF, demonstrating supreme cash conversion.', significance: 'The real money available to pay dividends, buy back shares, or fund organic expansion.' },
  { term: 'Market Depth', category: 'Trading', definition: 'The list of open buy and sell limit orders waiting to be executed at various price levels (Order Book).', formula: 'Calculated as cumulative bid quantity vs cumulative ask quantity across 5 tiers', example: 'Level 2 market depth shows 5 tiers of bids and asks to assess instantaneous liquidity.', significance: 'Helps traders gauge institutional support and avoid slippage.' },
];

export async function askAiTutor(question: string): Promise<any> {
  // Try server first
  try {
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.explanation) {
        return data;
      }
    }
  } catch {
    // Fall back to client-side pedagogical engine
  }

  const q = question.toLowerCase();

  // Intelligent fallback responses for core finance & trading topics
  if (q.includes('rsi') || q.includes('relative strength')) {
    return {
      conceptName: 'Relative Strength Index (RSI)',
      difficultyLevel: 'Intermediate',
      explanation: 'The Relative Strength Index (RSI) is a bounded momentum oscillator running between 0 and 100 developed by J. Welles Wilder. It compares the magnitude of recent gains to recent losses over a standard 14-period lookback. Rather than acting as a simple buy/sell signal, RSI reveals internal price velocity and hidden momentum divergence.',
      keyTakeaways: [
        'RSI > 70 indicates strong positive momentum (overbought territory), while RSI < 30 indicates deep selling pressure (oversold territory).',
        'In sustained secular bull trends, RSI typically fluctuates between 40 and 80 without touching 30.',
        'Bullish Divergence (Price makes lower low while RSI makes higher low) is one of the highest probability reversal setups in quantitative technical analysis.',
      ],
      realWorldExample: 'During a market correction, Nifty drops to 24,800 making a new low, but its 14-day RSI registers at 38 (higher than the 28 recorded at the previous bottom). This divergence indicates seller exhaustion, preceding a 600-point relief rally.',
      quickQuiz: {
        question: 'What does a Bullish Divergence between stock price and RSI indicate?',
        options: [
          'Selling volume is increasing exponentially',
          'Downside momentum is waning even though price printed a lower low, hinting at a potential reversal',
          'The stock must be shorted immediately',
          'RSI calculation is broken due to split events',
        ],
        correctIndex: 1,
        explanation: 'Bullish divergence occurs when downward price moves lack the velocity of earlier drops, indicating that sellers are running out of steam.',
      },
    };
  }

  if (q.includes('vwap') || q.includes('volume weighted')) {
    return {
      conceptName: 'Volume Weighted Average Price (VWAP)',
      difficultyLevel: 'Intermediate',
      explanation: 'VWAP represents the true average price a stock has traded at throughout the day, weighted by volume at each price level. It provides the institutional benchmark for executing multi-crore block orders without creating adverse market impact.',
      keyTakeaways: [
        'Price trading consistently above VWAP indicates intraday buyers are in control and paying a premium for liquidity.',
        'Institutions are judged on whether their executions beat or underperform VWAP for the day.',
        'The VWAP pullback setup occurs when a trending stock tests VWAP from above with declining sell volume, offering a low-risk entry.',
      ],
      realWorldExample: 'Reliance opens strong and climbs to ₹2,950 with VWAP at ₹2,935. At 11:30 AM, price pulls back to test ₹2,936, finds buying support on low volume, and resumes its rally toward ₹2,960.',
      quickQuiz: {
        question: 'Why do institutional fund managers care deeply about VWAP?',
        options: [
          'It is required by SEBI tax forms',
          'It determines whether their trade execution performed better or worse than the broader market average for the session',
          'It replaces daily stop losses automatically',
          'It predicts corporate quarterly earnings',
        ],
        correctIndex: 1,
        explanation: 'Institutional desks aim to buy below VWAP and sell above VWAP to prove execution efficiency to their client mandates.',
      },
    };
  }

  if (q.includes('stop loss') || q.includes('risk management') || q.includes('position size')) {
    return {
      conceptName: 'Position Sizing & Capital Preservation',
      difficultyLevel: 'Foundational',
      explanation: 'Position sizing is the mathematical formula that determines exactly how many shares to purchase such that if your trade reaches its invalidation stop loss, you lose no more than a predetermined small percentage (typically 1% to 2%) of your total account equity.',
      keyTakeaways: [
        'Formula: Number of Shares = (Portfolio Value * Risk %) / (Entry Price - Stop Loss Price).',
        'Losing 50% of your account requires a 100% gain just to return to breakeven.',
        'Never determine position size based on how much you hope to make; always size based on how much you can afford to lose.',
      ],
      realWorldExample: 'With a ₹10,00,000 account and 1% risk (₹10,000 max loss), buying a stock at ₹1,000 with a stop loss at ₹950 (₹50 risk per share) means buying exactly 200 shares (₹10,000 / ₹50 = 200).',
      quickQuiz: {
        question: 'If you lose 20% of your trading capital, what percentage return is required to break even?',
        options: ['20%', '25%', '30%', '50%'],
        correctIndex: 1,
        explanation: 'Starting with ₹1,00,000, a 20% loss leaves ₹80,000. To get back to ₹1,00,000, you must gain ₹20,000 on ₹80,000, which is exactly 25%.',
      },
    };
  }

  // Generic financial tutor response
  return {
    conceptName: question.trim().length > 30 ? 'Market Analysis & Core Concept' : question.trim(),
    difficultyLevel: 'Core Principles',
    explanation: `Understanding "${question}" is essential for developing a durable trading and investing edge. In modern financial markets, price movements reflect the continuous interplay between fundamental corporate earnings, institutional order flow, quantitative algorithmic liquidity, and market psychology. Always cross-validate any trading hypothesis across both higher-timeframe trends and risk-adjusted position sizing.`,
    keyTakeaways: [
      'Focus on process and disciplined execution rather than individual trade outcomes.',
      'Align technical chart confluence with fundamental business drivers and market regimes.',
      'Protect capital first: the primary rule of long-term wealth compounding is avoiding catastrophic drawdowns.',
    ],
    realWorldExample: 'Top institutional hedge funds achieve consistent annual alpha not by predicting every move, but by maintaining a positive mathematical expectancy with strict 1:2.5 risk-to-reward ratios.',
    quickQuiz: {
      question: 'Which factor is most critical for long-term trading longevity?',
      options: [
        'Having a 100% win rate',
        'Strict risk management and capital preservation discipline',
        'Predicting every macroeconomic news release',
        'Using the maximum allowable leverage',
      ],
      correctIndex: 1,
      explanation: 'Even strategies with a 40% win rate can compound wealth significantly when losses are kept small and winners are allowed to run with 1:2+ risk-to-reward ratios.',
    },
  };
}
