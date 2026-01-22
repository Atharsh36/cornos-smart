#!/bin/bash

echo "🚀 Installing CronoSmart Audit Agent Dependencies..."

# Core dependencies
npm install --save \
  viem \
  axios \
  node-cron \
  @types/node-cron

# Development dependencies  
npm install --save-dev \
  @types/axios

echo "✅ Dependencies installed successfully!"

echo "📝 Next steps:"
echo "1. Update your .env file with audit configuration"
echo "2. Start the backend server: npm run dev"
echo "3. Test audit endpoints with the provided curl commands"
echo ""
echo "🔧 Audit Agent Endpoints:"
echo "POST /api/audit/start - Start audit agent"
echo "POST /api/audit/run - Run manual audit"
echo "GET /api/audit/logs - Get audit logs"
echo "GET /api/audit/alerts - Get alerts"
echo "GET /api/audit/report/latest - Get latest report"
echo "POST /api/audit/deepScan/:orderId - Deep scan (x402 paywall)"