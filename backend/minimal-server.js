const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('✅ Server starting...');

// Mock data
const mockProducts = [
  {
    _id: '1',
    name: 'Gaming Laptop',
    category: 'Electronics',
    description: 'High-performance gaming laptop',
    price: 1200,
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
    price: 200,
    images: ['headphones1.jpg'],
    stock: 10,
    rating: 4.2,
    deliveryDays: 2,
    isActive: true
  }
];

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { status: 'OK' } });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'Products retrieved successfully',
    data: { 
      products: mockProducts, 
      pagination: { page: 1, limit: 10, total: mockProducts.length, pages: 1 } 
    }
  });
});

app.post('/api/products', (req, res) => {
  const newProduct = { ...req.body, _id: Date.now().toString() };
  mockProducts.push(newProduct);
  res.status(201).json({ success: true, message: 'Product created', data: newProduct });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/orders', (req, res) => {
  res.json({ success: true, message: 'Order created', data: { ...req.body, _id: Date.now() } });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, data: { token: 'dummy-token' } });
});

app.post('/api/ai/chat', (req, res) => {
  res.json({ success: true, data: { response: 'AI response' } });
});

app.get('/api/users/profile', (req, res) => {
  res.json({ success: true, data: { walletAddress: '0x123' } });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ CronoSmart Backend running on http://localhost:${PORT}`);
});