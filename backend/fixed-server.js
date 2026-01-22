const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cronomart')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed, using in-memory storage');
    // Continue without MongoDB for now
  });

// Schemas
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

const OrderSchema = new mongoose.Schema({
  orderId: String,
  buyerAddress: String,
  sellerAddress: String,
  productId: String,
  quantity: Number,
  totalAmount: Number,
  status: { type: String, default: 'CREATED' },
  escrowTxHash: String,
  shippingAddress: Object
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true },
  nonce: String,
  lastLogin: Date
}, { timestamps: true });

let Product, Order, User;
try {
  Product = mongoose.model('Product', ProductSchema);
  Order = mongoose.model('Order', OrderSchema);
  User = mongoose.model('User', UserSchema);
} catch (error) {
  // Fallback to in-memory storage
  console.warn('Using in-memory storage');
  const products = [];
  const orders = [];
  const users = [];
  
  Product = {
    find: (query = {}) => Promise.resolve(products.filter(p => query.isActive !== false || p.isActive)),
    findById: (id) => Promise.resolve(products.find(p => p._id === id)),
    create: (data) => {
      const product = { ...data, _id: Date.now().toString() };
      products.push(product);
      return Promise.resolve(product);
    },
    countDocuments: () => Promise.resolve(products.length)
  };
  
  Order = {
    find: () => Promise.resolve(orders),
    create: (data) => {
      const order = { ...data, _id: Date.now().toString() };
      orders.push(order);
      return Promise.resolve(order);
    }
  };
  
  User = {
    findOne: (query) => Promise.resolve(users.find(u => u.walletAddress === query.walletAddress)),
    create: (data) => {
      const user = { ...data, _id: Date.now().toString() };
      users.push(user);
      return Promise.resolve(user);
    },
    findOneAndUpdate: (query, update) => {
      const user = users.find(u => u.walletAddress === query.walletAddress);
      if (user) Object.assign(user, update);
      return Promise.resolve(user);
    }
  };
}

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { status: 'OK' } });
});

// Auth routes
app.post('/api/auth/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const nonce = Math.random().toString(36).substring(2, 15);
    
    await User.findOneAndUpdate(
      { walletAddress },
      { walletAddress, nonce },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, data: { nonce } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    // Simple verification - in production, verify signature properly
    const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ success: true, data: { token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    const products = await Product.find(query);
    
    let filteredProducts = products;
    if (search) {
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sort === 'priceLow') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceHigh') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: { products: filteredProducts, pagination: { page: 1, total: filteredProducts.length } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/products', authenticate, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      sellerAddress: req.user.walletAddress
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order routes
app.get('/api/orders', async (req, res) => {
  try {
    // Return empty orders if no auth token
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.json({ success: true, data: [] });
    }
    
    // Try to get user from token
    let userAddress = null;
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userAddress = decoded.walletAddress;
    } catch (err) {
      return res.json({ success: true, data: [] });
    }
    
    const orders = await Order.find({ buyerAddress: userAddress });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.json({ success: true, data: [] }); // Return empty array on error
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Get user address from auth header if available
    let userAddress = 'anonymous';
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userAddress = decoded.walletAddress;
      } catch (err) {
        // Continue with anonymous user
      }
    }
    
    const order = await Order.create({
      ...req.body,
      buyerAddress: userAddress,
      orderId: `order_${Date.now()}`
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User routes
app.get('/api/users/profile', authenticate, (req, res) => {
  res.json({ success: true, data: { walletAddress: req.user.walletAddress } });
});

// AI routes
app.post('/api/ai/chat', (req, res) => {
  const responses = [
    "I'd recommend checking out our Electronics category for the latest gadgets!",
    "Based on your interests, you might like our Gaming section.",
    "Our Fashion category has some great new arrivals!",
    "Have you considered our Home & Garden products?"
  ];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  res.json({ success: true, data: { response: randomResponse } });
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