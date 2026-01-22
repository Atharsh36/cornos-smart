#!/bin/bash

BASE_URL="http://localhost:8080"
ADMIN_KEY="audit-admin-secret-2024"

echo "🧪 Testing CronoSmart Audit Agent..."

echo ""
echo "1. Testing audit health check..."
curl -X GET "$BASE_URL/api/audit/health" \
  -H "Content-Type: application/json" | jq

echo ""
echo "2. Starting audit agent..."
curl -X POST "$BASE_URL/api/audit/start" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" | jq

echo ""
echo "3. Running manual audit..."
curl -X POST "$BASE_URL/api/audit/run" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" | jq

echo ""
echo "4. Getting audit logs..."
curl -X GET "$BASE_URL/api/audit/logs?limit=5" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" | jq

echo ""
echo "5. Getting audit alerts..."
curl -X GET "$BASE_URL/api/audit/alerts" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" | jq

echo ""
echo "6. Getting latest audit report..."
curl -X GET "$BASE_URL/api/audit/report/latest" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" | jq

echo ""
echo "7. Testing deep scan (should return 402 Payment Required)..."
curl -X POST "$BASE_URL/api/audit/deepScan/test-order-id" \
  -H "Content-Type: application/json" | jq

echo ""
echo "8. Getting risk scores..."
curl -X GET "$BASE_URL/api/audit/risk-scores?flagged=true" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" | jq

echo ""
echo "✅ Audit Agent testing completed!"