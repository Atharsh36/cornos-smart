const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const axios = require('axios');

// Payment verification helper
const verifyPayment = async (txHash) => {
  try {
    const response = await axios.post(process.env.CRONOS_RPC, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [txHash],
      id: 1
    });
    return response.data.result !== null;
  } catch (error) {
    return false;
  }
};

// Free AI endpoints
router.post('/recommend', async (req, res) => {
  try {
    console.log('AI Recommend request:', req.body);
    const { query, products } = req.body;
    
    if (!query || !products) {
      return res.status(400).json({ success: false, error: 'Query and products required' });
    }
    
    const recommendations = await aiService.recommend(query, products);
    console.log('AI Recommendations result:', recommendations);
    
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('AI Recommend error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/summary', async (req, res) => {
  try {
    console.log('AI Summary request:', req.body);
    const { product } = req.body;
    
    if (!product) {
      return res.status(400).json({ success: false, error: 'Product data required' });
    }
    
    const summary = await aiService.summarizeProduct(product);
    console.log('AI Summary result:', summary);
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('AI Summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Paid AI endpoints with x402
router.post('/trust-check', async (req, res) => {
  const paymentTx = req.headers['x-payment-tx'];
  
  if (!paymentTx) {
    return res.status(402).json({
      message: 'Payment Required',
      price: '0.02',
      token: 'USDC',
      receiver: process.env.PLATFORM_RECEIVER_WALLET,
      paymentId: `trust-${Date.now()}`
    });
  }

  const isValidPayment = await verifyPayment(paymentTx);
  if (!isValidPayment) {
    return res.status(400).json({ success: false, error: 'Invalid payment' });
  }

  try {
    const { sellerId, orders } = req.body;
    const trustReport = await aiService.trustCheck(sellerId, orders);
    res.json({ success: true, data: trustReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/dispute-summary', async (req, res) => {
  const paymentTx = req.headers['x-payment-tx'];
  
  if (!paymentTx) {
    return res.status(402).json({
      message: 'Payment Required',
      price: '0.01',
      token: 'USDC',
      receiver: process.env.PLATFORM_RECEIVER_WALLET,
      paymentId: `dispute-${Date.now()}`
    });
  }

  const isValidPayment = await verifyPayment(paymentTx);
  if (!isValidPayment) {
    return res.status(400).json({ success: false, error: 'Invalid payment' });
  }

  try {
    const { order } = req.body;
    const summary = await aiService.disputeSummary(order);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;