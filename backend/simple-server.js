const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cronomart')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// Simple Product Schema
const ProductSchema = new mongoose.Schema({
  sellerAddress: String,
  name: String,
  category: String,
  description: String,
  images: [String],
  price: Number,
  tokenAddress: { type: String, default: "0x0000000000000000000000000000000000000000" },
  stock: { type: Number, default: 1 },
  rating: { type: Number, default: 4.0 },
  deliveryDays: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { status: 'OK' } });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: { products, pagination: { page: 1, limit: 10, total: products.length, pages: 1 } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
});

// Basic order routes
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/orders', (req, res) => {
  res.json({ success: true, message: 'Order created', data: req.body });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, data: { token: 'dummy-token' } });
});

// AI routes
app.post('/api/ai/chat', (req, res) => {
  res.json({ success: true, data: { response: 'AI response' } });
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({ success: true, data: { walletAddress: '0x123' } });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ CronoSmart Backend running on http://localhost:${PORT}`);
});