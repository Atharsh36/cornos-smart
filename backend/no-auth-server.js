const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (optional)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cronomart')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed, using in-memory storage');
  });

// In-memory storage for demo
const products = [];
const orders = [];
const users = [];

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { status: 'OK' } });
});

// Auth routes
app.post('/api/auth/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const nonce = Math.random().toString(36).substring(2, 15);
    res.json({ success: true, data: { nonce } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ success: true, data: { token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const mockProducts = [
      {
        _id: '1',
        name: 'Gaming Laptop',
        category: 'Electronics',
        description: 'High-performance gaming laptop',
        price: 0.5,
        images: ['laptop1.jpg'],
        stock: 5,
        rating: 4.5,
        deliveryDays: 3,
        isActive: true
      },
      {
        _id: '2',
        name: 'Wireless Headphones',
        category: 'Electronics',
        description: 'Premium wireless headphones',
        price: 0.1,
        images: ['headphones1.jpg'],
        stock: 10,
        rating: 4.2,
        deliveryDays: 2,
        isActive: true
      },
      {
        _id: '3',
        name: 'Smart Watch',
        category: 'Electronics',
        description: 'Fitness tracking smartwatch',
        price: 0.2,
        images: ['watch1.jpg'],
        stock: 8,
        rating: 4.3,
        deliveryDays: 2,
        isActive: true
      },
      {
        _id: '4',
        name: 'Bluetooth Speaker',
        category: 'Electronics',
        description: 'Portable wireless speaker',
        price: 0.05,
        images: ['speaker1.jpg'],
        stock: 15,
        rating: 4.1,
        deliveryDays: 1,
        isActive: true
      }
    ];
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: { products: mockProducts, pagination: { page: 1, total: mockProducts.length } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const mockProduct = {
      _id: req.params.id,
      id: req.params.id,
      name: 'Sample Product',
      category: 'Electronics',
      description: 'Sample product description',
      price: 0.1,
      currency: 'CRO',
      image: 'https://images.unsplash.com/photo-1550029402-226115b7c579?w=400',
      images: ['https://images.unsplash.com/photo-1550029402-226115b7c579?w=400'],
      seller: '0x1234567890123456789012345678901234567890',
      stock: 5,
      rating: 4.0,
      deliveryDays: 3,
      isActive: true
    };
    res.json({ success: true, data: mockProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = { ...req.body, _id: Date.now().toString() };
    products.push(product);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order routes - NO AUTHENTICATION REQUIRED
app.get('/api/orders', async (req, res) => {
  try {
    // Always return success with empty orders for now
    res.json({ success: true, data: [] });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      ...req.body,
      _id: Date.now().toString(),
      orderId: `order_${Date.now()}`,
      buyerAddress: 'anonymous',
      status: 'CREATED',
      createdAt: new Date()
    };
    orders.push(order);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({ success: true, data: { walletAddress: '0x123' } });
});

// Agent routes - inline implementation
const agentRoutes = require('./src/agent/routes');
app.use('/api/agent', agentRoutes);

// AI routes
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  const lowerMsg = message?.toLowerCase() || '';
  
  let response = "I'm your CronoSmart Guardian! I can help with marketplace questions.";
  
  if (lowerMsg.includes('trust') || lowerMsg.includes('seller')) {
    response = "I analyze seller trust scores based on completion rates and dispute history. Look for the trust widget on product pages!";
  } else if (lowerMsg.includes('safe') || lowerMsg.includes('security')) {
    response = "I check transaction safety before you sign. I'll validate the network, escrow address, and amounts to keep you safe!";
  } else if (lowerMsg.includes('escrow') || lowerMsg.includes('payment')) {
    response = "Our escrow system holds your CRO safely until delivery is confirmed. I can explain each stage of the process!";
  } else if (lowerMsg.includes('buy') || lowerMsg.includes('purchase')) {
    response = "When buying, I'll run safety checks first. Look for my floating panels during checkout for real-time guidance!";
  } else if (lowerMsg.includes('product') || lowerMsg.includes('shop')) {
    response = "Browse our Electronics section! I show trust scores for each seller and validate transactions before you buy.";
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    response = "Hello! I'm your AI guardian for safe shopping on CronoSmart. Ask me about seller trust, transaction safety, or escrow!";
  }
  
  res.json({ success: true, data: { response } });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ CronoSmart Backend running on http://localhost:${PORT}`);
});