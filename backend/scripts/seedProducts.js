import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_PRODUCTS = [
  {
    sellerAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    name: 'Wireless Gaming Headset',
    category: 'Electronics',
    description: 'High-quality wireless gaming headset with 7.1 surround sound and RGB lighting. Perfect for gaming sessions.',
    images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=400'],
    price: 89.99,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    stock: 15,
    rating: 4.5,
    deliveryDays: 3
  },
  {
    sellerAddress: '0x8ba1f109551bD432803012645Hac136c22C177ec',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    description: 'RGB mechanical keyboard with Cherry MX switches, perfect for gaming and typing.',
    images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'],
    price: 129.99,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    stock: 8,
    rating: 4.8,
    deliveryDays: 2
  },
  {
    sellerAddress: '0x1234567890123456789012345678901234567890',
    name: 'Smart Watch Pro',
    category: 'Wearables',
    description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    price: 299.99,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    stock: 12,
    rating: 4.7,
    deliveryDays: 5
  },
  {
    sellerAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    name: 'Bluetooth Speaker',
    category: 'Audio',
    description: 'Portable waterproof Bluetooth speaker with 360° sound and 20-hour battery.',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
    price: 79.99,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    stock: 25,
    rating: 4.3,
    deliveryDays: 3
  }
];

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cronomart';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing products`);

    // Insert demo products
    const products = await Product.insertMany(DEMO_PRODUCTS);
    console.log(`✅ Inserted ${products.length} demo products`);

    // List products to verify
    const allProducts = await Product.find({});
    console.log('📦 Products in database:');
    allProducts.forEach(p => console.log(`  - ${p.name} (${p.price} CRO)`));

    console.log('🎉 Demo products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();