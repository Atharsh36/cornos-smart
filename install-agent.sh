#!/bin/bash

echo "🚀 Installing CronoSmart Guardian Agent..."

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ CronoSmart Guardian Agent installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "🤖 Agent endpoints available at:"
echo "- POST /api/agent/sellerTrust/:productId"
echo "- POST /api/agent/txSafetyCheck"
echo "- POST /api/agent/escrowExplain/:orderId"