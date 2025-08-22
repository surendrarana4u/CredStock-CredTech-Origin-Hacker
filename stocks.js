const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock stock data - in a real app, this would come from a third-party API
const stockData = {
  'AAPL': { name: 'Apple Inc.', price: 175.43, change: 2.1 },
  'GOOGL': { name: 'Alphabet Inc.', price: 2843.21, change: 1.3 },
  'TSLA': { name: 'Tesla, Inc.', price: 248.87, change: -0.8 },
  'MSFT': { name: 'Microsoft Corporation', price: 378.91, change: 1.7 },
  'AMZN': { name: 'Amazon.com, Inc.', price: 3421.56, change: 0.9 },
  'NVDA': { name: 'NVIDIA Corporation', price: 456.78, change: 3.2 },
  'META': { name: 'Meta Platforms, Inc.', price: 312.45, change: 1.8 },
  'NFLX': { name: 'Netflix, Inc.', price: 445.32, change: -0.5 }
};

// @route   GET /api/stocks
// @desc    Get all stocks
// @access  Public
router.get('/', (req, res) => {
  try {
    const stocks = Object.keys(stockData).map(symbol => ({
      symbol,
      name: stockData[symbol].name,
      price: stockData[symbol].price,
      change: stockData[symbol].change
    }));
    
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stocks/:symbol
// @desc    Get stock by symbol
// @access  Public
router.get('/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!stockData[symbol]) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    res.json({
      symbol,
      name: stockData[symbol].name,
      price: stockData[symbol].price,
      change: stockData[symbol].change
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stocks/search/:query
// @desc    Search stocks by name or symbol
// @access  Public
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchQuery = query.toUpperCase();
    
    const results = Object.keys(stockData)
      .filter(symbol => 
        symbol.includes(searchQuery) || 
        stockData[symbol].name.toUpperCase().includes(searchQuery)
      )
      .map(symbol => ({
        symbol,
        name: stockData[symbol].name,
        price: stockData[symbol].price,
        change: stockData[symbol].change
      }));
    
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;