const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

// @route   GET /api/portfolio
// @desc    Get user's portfolio
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      // Create empty portfolio if none exists
      portfolio = new Portfolio({
        user: req.user._id,
        stocks: [],
        totalInvestment: 0
      });
      await portfolio.save();
    }
    
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/portfolio/stock
// @desc    Add stock to portfolio
// @access  Private
router.post('/stock', auth, async (req, res) => {
  try {
    const { symbol, name, quantity, purchasePrice } = req.body;
    
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      // Create new portfolio if none exists
      portfolio = new Portfolio({
        user: req.user._id,
        stocks: [],
        totalInvestment: 0
      });
    }
    
    // Check if stock already exists in portfolio
    const stockIndex = portfolio.stocks.findIndex(stock => stock.symbol === symbol);
    
    if (stockIndex > -1) {
      // Update existing stock
      portfolio.stocks[stockIndex].quantity += Number(quantity);
      portfolio.stocks[stockIndex].purchasePrice = 
        (portfolio.stocks[stockIndex].purchasePrice * (portfolio.stocks[stockIndex].quantity - Number(quantity)) + 
         Number(purchasePrice) * Number(quantity)) / portfolio.stocks[stockIndex].quantity;
    } else {
      // Add new stock
      portfolio.stocks.push({
        symbol,
        name,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice)
      });
    }
    
    // Update total investment
    portfolio.totalInvestment += Number(purchasePrice) * Number(quantity);
    portfolio.updatedAt = Date.now();
    
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/portfolio/stock/:symbol
// @desc    Update stock in portfolio
// @access  Private
router.put('/stock/:symbol', auth, async (req, res) => {
  try {
    const { quantity, purchasePrice } = req.body;
    const { symbol } = req.params;
    
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    
    // Find stock in portfolio
    const stockIndex = portfolio.stocks.findIndex(stock => stock.symbol === symbol);
    
    if (stockIndex === -1) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }
    
    // Calculate investment change
    const oldInvestment = portfolio.stocks[stockIndex].quantity * portfolio.stocks[stockIndex].purchasePrice;
    const newInvestment = Number(quantity) * Number(purchasePrice);
    
    // Update stock
    portfolio.stocks[stockIndex].quantity = Number(quantity);
    portfolio.stocks[stockIndex].purchasePrice = Number(purchasePrice);
    
    // Update total investment
    portfolio.totalInvestment = portfolio.totalInvestment - oldInvestment + newInvestment;
    portfolio.updatedAt = Date.now();
    
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/portfolio/stock/:symbol
// @desc    Remove stock from portfolio
// @access  Private
router.delete('/stock/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    
    // Find stock in portfolio
    const stockIndex = portfolio.stocks.findIndex(stock => stock.symbol === symbol);
    
    if (stockIndex === -1) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }
    
    // Calculate investment to remove
    const investmentToRemove = portfolio.stocks[stockIndex].quantity * portfolio.stocks[stockIndex].purchasePrice;
    
    // Remove stock
    portfolio.stocks.splice(stockIndex, 1);
    
    // Update total investment
    portfolio.totalInvestment -= investmentToRemove;
    portfolio.updatedAt = Date.now();
    
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;