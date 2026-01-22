# CronoSmart - Decentralized E-commerce MVP

A complete decentralized marketplace built on Cronos testnet with smart contract escrow, Web3 authentication, and modern UI.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally
- MetaMask wallet with Cronos testnet configured

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed    # Add demo products to database
npm run dev     # Start backend server on port 8080
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Start frontend on port 5173
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 🎯 MVP Features Implemented

### ✅ Smart Contracts (Deployed on Cronos Testnet)
- **Escrow Contract**: `0x12a09612eFc1538406f23B78E89a1dB094dc4Ac6`
- **Vault Contract**: `0xaF194729b6ad0Fe1A7238416fe9db3Ce6764B410`
- Secure payment escrow with dispute resolution
- Multi-token support (CRO + ERC20)

### ✅ Backend API (Complete)
- **Products**: CRUD with search, pagination, filtering
- **Orders**: Full lifecycle management (CREATED → COMPLETED)
- **Authentication**: Web3 wallet signature + JWT
- **Database**: MongoDB with proper models
- **Blockchain Integration**: Contract reading service

### ✅ Frontend (Fully Functional)
- **Wallet Connection**: MetaMask integration with Wagmi
- **Product Marketplace**: Browse, search, filter products
- **Product Details**: Complete product pages with buy functionality
- **Smart Contract Integration**: Direct escrow funding from UI
- **Order Tracking**: Real-time order status with progress indicators
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛒 How to Use (Complete Flow)

### 1. Connect Wallet
- Click "Connect Wallet" in navbar
- Approve MetaMask connection
- Switch to Cronos testnet if needed

### 2. Browse Products
- Visit marketplace page
- Use search and filters
- View product details

### 3. Buy Products (Escrow Flow)
- Click product → "Buy Now"
- Enter shipping address
- Confirm transaction in MetaMask
- Funds locked in escrow contract
- Order created in database

### 4. Track Orders
- Visit "My Orders" page
- See order progress: CREATED → FUNDED → SHIPPED → DELIVERED → COMPLETED
- View transaction hashes on Cronos explorer

## 🔧 Technical Architecture

### Smart Contracts
```
Buyer → Escrow Contract → Seller
         ↓
    Funds locked until delivery confirmed
```

### Backend Stack
- **Node.js + TypeScript + Express**
- **MongoDB** for product/order data
- **JWT** for authentication
- **Ethers.js** for blockchain integration

### Frontend Stack
- **React 19 + TypeScript + Vite**
- **Wagmi + Viem** for Web3 integration
- **TanStack Query** for state management
- **Tailwind CSS** for styling

## 📊 Database Collections

### Products
```javascript
{
  sellerAddress: "0x...",
  name: "Product Name",
  price: 99.99,
  stock: 10,
  category: "Electronics",
  // ... more fields
}
```

### Orders
```javascript
{
  orderId: "0x...",
  buyerAddress: "0x...",
  sellerAddress: "0x...",
  status: "FUNDED",
  txHash: "0x...",
  // ... more fields
}
```

## 🌐 Environment Variables

### Backend (.env)
```
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/cronomart
JWT_SECRET=your-secret-key
CRONOS_RPC=https://evm-t3.cronos.org
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
VITE_ESCROW_CONTRACT_ADDRESS=0x12a09612eFc1538406f23B78E89a1dB094dc4Ac6
```

## 🎮 Demo Data
The seed script adds 4 demo products:
- Wireless Gaming Headset (89.99 CRO)
- Mechanical Keyboard (129.99 CRO)
- Smart Watch Pro (299.99 CRO)
- Bluetooth Speaker (79.99 CRO)

## 🔍 Testing the Escrow

1. **Buy a product** → Funds locked in escrow
2. **Check Cronos explorer** → Verify transaction
3. **View order status** → Track progress
4. **Seller ships** → Status updates to SHIPPED
5. **Buyer confirms** → Funds released to seller

## 🚨 Troubleshooting

### Backend Issues
- Ensure MongoDB is running
- Check if port 8080 is available
- Verify environment variables

### Frontend Issues
- Ensure backend is running on port 8080
- Check MetaMask is connected to Cronos testnet
- Clear browser cache if needed

### Smart Contract Issues
- Ensure you have CRO for gas fees
- Check contract addresses are correct
- Verify network is Cronos testnet (Chain ID: 338)

## 🎯 What's Working Now

✅ **Complete product marketplace**
✅ **Wallet-based authentication**
✅ **Smart contract escrow payments**
✅ **Order tracking and management**
✅ **Responsive modern UI**
✅ **Real-time transaction status**

This is a **fully functional MVP** ready for testing and demonstration!