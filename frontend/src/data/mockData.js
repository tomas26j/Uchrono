// Mock data for Contrafactum - structured for future API integration

export const ASSETS = [
  // Cryptocurrencies
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    icon: '₿',
    color: '#F7931A',
    description: 'The original cryptocurrency'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    icon: 'Ξ',
    color: '#627EEA',
    description: 'Smart contract platform'
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    category: 'crypto',
    icon: 'Ð',
    color: '#C2A633',
    description: 'The meme cryptocurrency'
  },
  
  // Stocks
  {
    id: 'tesla',
    symbol: 'TSLA',
    name: 'Tesla',
    category: 'stock',
    icon: 'T',
    color: '#CC0000',
    description: 'Electric vehicle pioneer'
  },
  {
    id: 'nvidia',
    symbol: 'NVDA',
    name: 'NVIDIA',
    category: 'stock',
    icon: 'N',
    color: '#76B900',
    description: 'AI and graphics processing'
  },
  {
    id: 'apple',
    symbol: 'AAPL',
    name: 'Apple',
    category: 'stock',
    icon: '',
    color: '#000000',
    description: 'Consumer technology giant'
  },
  {
    id: 'amazon',
    symbol: 'AMZN',
    name: 'Amazon',
    category: 'stock',
    icon: 'A',
    color: '#FF9900',
    description: 'E-commerce and cloud computing'
  },
  {
    id: 'google',
    symbol: 'GOOGL',
    name: 'Google',
    category: 'stock',
    icon: 'G',
    color: '#4285F4',
    description: 'Search and technology'
  },
  {
    id: 'microsoft',
    symbol: 'MSFT',
    name: 'Microsoft',
    category: 'stock',
    icon: 'M',
    color: '#00A4EF',
    description: 'Software and cloud services'
  },
  {
    id: 'netflix',
    symbol: 'NFLX',
    name: 'Netflix',
    category: 'stock',
    icon: 'N',
    color: '#E50914',
    description: 'Streaming entertainment'
  },
  
  // Traditional Assets
  {
    id: 'gold',
    symbol: 'GOLD',
    name: 'Gold',
    category: 'commodity',
    icon: 'Au',
    color: '#FFD700',
    description: 'Precious metal store of value'
  },
  {
    id: 'sp500',
    symbol: 'SPY',
    name: 'S&P 500',
    category: 'index',
    icon: 'S',
    color: '#1f77b4',
    description: 'US stock market index'
  }
];

// Generate mock historical price data
export const generateMockPriceData = (assetId, startDate, endDate) => {
  const prices = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Base prices and volatility by asset
  const assetConfig = {
    bitcoin: { basePrice: 0.1, volatility: 0.08, trend: 0.002 },
    ethereum: { basePrice: 0.5, volatility: 0.07, trend: 0.0018 },
    dogecoin: { basePrice: 0.0001, volatility: 0.12, trend: 0.0015 },
    tesla: { basePrice: 5, volatility: 0.06, trend: 0.0012 },
    nvidia: { basePrice: 2, volatility: 0.05, trend: 0.0014 },
    apple: { basePrice: 1, volatility: 0.04, trend: 0.0008 },
    amazon: { basePrice: 5, volatility: 0.05, trend: 0.0009 },
    google: { basePrice: 25, volatility: 0.04, trend: 0.0007 },
    microsoft: { basePrice: 2, volatility: 0.04, trend: 0.0008 },
    netflix: { basePrice: 1, volatility: 0.06, trend: 0.0011 },
    gold: { basePrice: 300, volatility: 0.02, trend: 0.0003 },
    sp500: { basePrice: 800, volatility: 0.03, trend: 0.0005 }
  };
  
  const config = assetConfig[assetId] || assetConfig.bitcoin;
  let currentPrice = config.basePrice;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Add trend and random walk
    const randomChange = (Math.random() - 0.5) * 2 * config.volatility;
    const trendChange = config.trend;
    
    currentPrice *= (1 + trendChange + randomChange);
    
    prices.push({
      date: new Date(d).toISOString().split('T')[0],
      price: Math.max(0.0001, currentPrice),
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return prices;
};

// Curated scenarios with compelling stories
export const CURATED_SCENARIOS = [
  {
    id: 'bitcoin-2011',
    title: '$100 in Bitcoin (2011)',
    description: 'When Bitcoin was just $1 and most people called it "magic internet money"',
    asset: 'bitcoin',
    amount: 100,
    buyDate: '2011-02-01',
    sellDate: '2021-11-01',
    story: 'In February 2011, Bitcoin reached parity with the US dollar for the first time. A $100 investment would have bought you 100 BTC. At its peak in November 2021, that would have been worth over $6.7 million.',
    tags: ['legendary', 'crypto', 'early-adopter']
  },
  {
    id: 'tesla-ipo',
    title: '$1,000 in Tesla at IPO',
    description: 'Betting on Elon Musk when Tesla was just a startup dream',
    asset: 'tesla',
    amount: 1000,
    buyDate: '2010-06-29',
    sellDate: '2024-01-01',
    story: 'Tesla went public at $17 per share in June 2010. Many doubted electric vehicles would ever go mainstream. A $1,000 investment would have bought about 59 shares, worth over $14,000 today after multiple stock splits.',
    tags: ['ipo', 'electric', 'visionary']
  },
  {
    id: 'nvidia-ai-boom',
    title: '$500 in NVIDIA (Pre-AI)',
    description: 'Graphics cards to AI goldmine transformation',
    asset: 'nvidia',
    amount: 500,
    buyDate: '2019-01-01',
    sellDate: '2024-01-01',
    story: 'Before the AI boom, NVIDIA was known for gaming graphics cards. The AI revolution transformed the company into one of the most valuable in the world. A $500 investment in early 2019 would be worth over $3,000 today.',
    tags: ['ai-revolution', 'technology', 'transformation']
  },
  {
    id: 'amazon-dot-com',
    title: '$1,000 in Amazon (1997)',
    description: 'When it was just an online bookstore',
    asset: 'amazon',
    amount: 1000,
    buyDate: '1997-05-15',
    sellDate: '2024-01-01',
    story: 'Amazon IPO\'d in 1997 at $18 per share as an online bookstore. Jeff Bezos had a vision of "everything store." A $1,000 investment would have bought about 55 shares, worth over $180,000 today after stock splits.',
    tags: ['dot-com', 'e-commerce', 'visionary']
  },
  {
    id: 'bitcoin-pizza',
    title: '$22 Pizza Bitcoin Purchase',
    description: 'The most expensive pizza in history',
    asset: 'bitcoin',
    amount: 22,
    buyDate: '2010-05-22',
    sellDate: '2021-11-01',
    story: 'On May 22, 2010, Laszlo Hanyecz paid 10,000 BTC for two pizzas worth $22. If he had held those bitcoins instead, they would have been worth over $670 million at Bitcoin\'s peak.',
    tags: ['pizza-day', 'crypto', 'legendary']
  },
  {
    id: 'dogecoin-meme',
    title: '$100 in Dogecoin (2013)',
    description: 'The joke that became a fortune',
    asset: 'dogecoin',
    amount: 100,
    buyDate: '2013-12-01',
    sellDate: '2021-05-01',
    story: 'Dogecoin started as a meme in 2013, trading for fractions of a cent. A $100 investment would have bought millions of coins. During the 2021 meme stock craze, it peaked at over $0.70, turning $100 into tens of thousands.',
    tags: ['meme', 'crypto', 'viral']
  }
];

// Leaderboard data for different time periods
export const LEADERBOARD_DATA = {
  '1year': [
    { asset: 'nvidia', symbol: 'NVDA', return: 245.6, amount: 1000, value: 3456 },
    { asset: 'bitcoin', symbol: 'BTC', return: 156.8, amount: 1000, value: 2568 },
    { asset: 'tesla', symbol: 'TSLA', return: 98.4, amount: 1000, value: 1984 },
    { asset: 'ethereum', symbol: 'ETH', return: 87.2, amount: 1000, value: 1872 },
    { asset: 'amazon', symbol: 'AMZN', return: 34.5, amount: 1000, value: 1345 }
  ],
  '5years': [
    { asset: 'bitcoin', symbol: 'BTC', return: 892.3, amount: 1000, value: 9923 },
    { asset: 'nvidia', symbol: 'NVDA', return: 678.9, amount: 1000, value: 7789 },
    { asset: 'tesla', symbol: 'TSLA', return: 456.7, amount: 1000, value: 5567 },
    { asset: 'ethereum', symbol: 'ETH', return: 345.2, amount: 1000, value: 4452 },
    { asset: 'netflix', symbol: 'NFLX', return: 234.1, amount: 1000, value: 3341 }
  ],
  '10years': [
    { asset: 'bitcoin', symbol: 'BTC', return: 15678.9, amount: 1000, value: 167789 },
    { asset: 'nvidia', symbol: 'NVDA', return: 2345.6, amount: 1000, value: 34456 },
    { asset: 'tesla', symbol: 'TSLA', return: 1234.5, amount: 1000, value: 23345 },
    { asset: 'netflix', symbol: 'NFLX', return: 567.8, amount: 1000, value: 6678 },
    { asset: 'apple', symbol: 'AAPL', return: 345.2, amount: 1000, value: 4452 }
  ]
};

// Educational stories about iconic investments
export const INVESTMENT_STORIES = [
  {
    id: 'warren-buffett-coca-cola',
    title: 'Warren Buffett\'s Coca-Cola Investment',
    content: 'In 1988, Warren Buffett invested $1.3 billion in Coca-Cola stock. Many criticized him for buying a "simple" beverage company. Today, that investment is worth over $25 billion and generates $704 million in annual dividends.',
    category: 'legendary',
    asset: 'stocks',
    lesson: 'Sometimes the best investments are in simple businesses you understand.'
  },
  {
    id: 'bitcoin-forgotten-wallet',
    title: 'The $300 Million Lost Password',
    content: 'Stefan Thomas, a German programmer, has 7,002 bitcoins locked in a hard drive. He forgot his password and has only 2 attempts left before the drive encrypts forever. At Bitcoin\'s peak, this was worth over $300 million.',
    category: 'cautionary',
    asset: 'crypto',
    lesson: 'Always secure your investments properly and have backup plans.'
  },
  {
    id: 'google-rejection',
    title: 'The $1.6 Trillion Rejection',
    content: 'In 2002, Google founders tried to sell their company to Yahoo for $1 billion. Yahoo declined, thinking it was too expensive. Google is now worth over $1.6 trillion.',
    category: 'missed-opportunity',
    asset: 'stocks',
    lesson: 'Innovation often seems overpriced until it becomes indispensable.'
  }
];

// Daily financial tips
export const DAILY_TIPS = [
  {
    id: 'compound-interest',
    title: 'The Magic of Compound Interest',
    content: 'Albert Einstein allegedly called compound interest "the eighth wonder of the world." A $1,000 investment growing at 7% annually becomes $76,000 in 60 years without adding a penny.',
    category: 'education'
  },
  {
    id: 'dollar-cost-averaging',
    title: 'Dollar-Cost Averaging',
    content: 'Instead of trying to time the market, invest the same amount regularly. This strategy reduces the impact of volatility and can lead to better long-term returns.',
    category: 'strategy'
  },
  {
    id: 'diversification',
    title: 'Don\'t Put All Eggs in One Basket',
    content: 'Diversification is the only free lunch in investing. Spreading investments across different assets reduces risk without necessarily reducing returns.',
    category: 'risk-management'
  },
  {
    id: 'inflation-reality',
    title: 'The Silent Wealth Killer',
    content: 'Inflation averages 3% annually. This means $100 today will only buy $97 worth of goods next year. Investing is essential to preserve purchasing power.',
    category: 'education'
  }
];

// Mock API responses structure for future integration
export const MOCK_API_RESPONSES = {
  // Alpha Vantage structure
  alphaVantage: {
    'Time Series (Daily)': {},
    'Meta Data': {
      'Information': 'Daily Prices (open, high, low, close) and Volumes',
      'Symbol': 'AAPL',
      'Last Refreshed': '2024-01-01',
      'Time Zone': 'US/Eastern'
    }
  },
  // CoinGecko structure
  coinGecko: {
    prices: [], // [timestamp, price] arrays
    market_caps: [],
    total_volumes: []
  }
};

export default {
  ASSETS,
  generateMockPriceData,
  CURATED_SCENARIOS,
  LEADERBOARD_DATA,
  INVESTMENT_STORIES,
  DAILY_TIPS,
  MOCK_API_RESPONSES
};