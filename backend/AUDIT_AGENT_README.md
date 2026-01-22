# CronoSmart AI Audit & Monitoring Agent

A comprehensive AI-powered audit and monitoring system for the CronoSmart decentralized marketplace on Cronos Testnet.

## Features

### 🔍 Continuous Monitoring
- **Backend Health Checks**: Monitors API endpoints every 30 seconds
- **Smart Contract Monitoring**: Tracks Escrow and Vault contract events
- **Performance Metrics**: Latency, uptime, error rates
- **Automated Alerting**: Real-time alerts for critical issues

### 🤖 AI-Powered Analysis
- **Fraud Detection**: Identifies suspicious patterns and behaviors
- **Risk Scoring**: Calculates risk scores for buyers and sellers
- **Order Mismatch Detection**: Compares backend vs blockchain state
- **Behavioral Analysis**: Detects anomalous user patterns

### 💰 x402 Micropayments
- **Deep Scan Feature**: Premium audit analysis (0.05 USDC)
- **Payment Verification**: Cronos blockchain payment validation
- **Secure Paywall**: HTTP 402 Payment Required implementation

### 📊 Reporting & Analytics
- **Daily/Weekly Reports**: Comprehensive system health reports
- **Admin Dashboard**: Real-time monitoring interface
- **Alert Management**: Categorized alerts with resolution tracking
- **Risk Scoreboard**: Top risky wallets and users

## Installation

### 1. Install Dependencies
```bash
cd backend
chmod +x install-audit-agent.sh
./install-audit-agent.sh
```

### 2. Environment Configuration
Update your `.env` file with audit agent settings:

```env
# Audit Agent Configuration
AUDIT_AGENT_ENABLED=true
AUDIT_INTERVAL_SECONDS=30
CRONOS_AGENT_SDK_KEY=your_cronos_sdk_key
X402_FACILITATOR_URL=https://facilitator.cronos.org
DEEP_SCAN_PRICE=0.05
DEEP_SCAN_TOKEN=USDC
AUDIT_ADMIN_KEY=audit-admin-secret-2024
```

### 3. Start the System
```bash
npm run dev
```

## API Endpoints

### Admin Endpoints (Require x-admin-key header)

#### Start/Stop Agent
```bash
POST /api/audit/start
POST /api/audit/stop
```

#### Manual Operations
```bash
POST /api/audit/run              # Run full audit cycle
GET /api/audit/logs              # Get audit logs
GET /api/audit/alerts            # Get active alerts
GET /api/audit/report/latest     # Get latest report
GET /api/audit/risk-scores       # Get risk scores
```

#### Alert Management
```bash
PATCH /api/audit/alerts/:alertId # Resolve alert
```

### Public Endpoints

#### Health Check
```bash
GET /api/audit/health
```

#### Deep Scan (x402 Paywall)
```bash
POST /api/audit/deepScan/:orderId
```

## Testing

### Run Test Suite
```bash
chmod +x test-audit-agent.sh
./test-audit-agent.sh
```

### Manual Testing with curl

#### 1. Start Audit Agent
```bash
curl -X POST "http://localhost:8080/api/audit/start" \
  -H "x-admin-key: audit-admin-secret-2024"
```

#### 2. Get Audit Logs
```bash
curl -X GET "http://localhost:8080/api/audit/logs?limit=10" \
  -H "x-admin-key: audit-admin-secret-2024"
```

#### 3. Test Deep Scan (x402)
```bash
# First call - should return 402 Payment Required
curl -X POST "http://localhost:8080/api/audit/deepScan/test-order" \
  -H "Content-Type: application/json"

# Second call with payment proof
curl -X POST "http://localhost:8080/api/audit/deepScan/test-order" \
  -H "Content-Type: application/json" \
  -H "x-payment-tx: 0x1234567890abcdef..."
```

## Architecture

### Core Services

#### AuditAgentService
- Main orchestrator with Cronos SDK integration
- Scheduled monitoring loops
- Tool definitions for AI agent actions

#### ContractMonitorService
- Cronos blockchain event scanning
- Smart contract state monitoring
- Event comparison and validation

#### HealthMonitorService
- API endpoint health checks
- Performance metrics collection
- Uptime monitoring

#### FraudDetectionService
- AI-powered fraud pattern detection
- Risk scoring algorithms
- Behavioral analysis

#### X402PaymentService
- Payment request generation
- Transaction verification
- Deep scan premium features

### Data Models

#### AuditLog
- Timestamp-indexed audit events
- Performance metrics
- Error tracking
- Auto-expiring (30 days TTL)

#### AuditAlert
- Categorized system alerts
- Severity levels (low/medium/high/critical)
- Resolution tracking
- Recommended actions

#### RiskScore
- User risk assessments
- Behavioral factors
- Flagging system
- Historical tracking

## Monitoring Capabilities

### 1. Backend Health Monitoring
- API endpoint availability
- Response time tracking
- Error rate monitoring
- Database connectivity

### 2. Smart Contract Monitoring
- Escrow event tracking
- Order lifecycle validation
- Fund movement monitoring
- Dispute detection

### 3. Fraud Detection
- Repeated dispute patterns
- Rapid refund detection
- Suspicious shipping timing
- Value anomaly detection
- Account velocity monitoring

### 4. Performance Analytics
- System uptime calculation
- Average response times
- Error rate analysis
- Success rate metrics

## x402 Payment Flow

### 1. Payment Request
```json
{
  "message": "Payment Required",
  "amount": "0.05",
  "token": "USDC",
  "receiver": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "memo": "CronoSmart-deepScan-1234567890",
  "paymentId": "payment-deepScan-1234567890"
}
```

### 2. Payment Verification
- Transaction hash validation
- Receiver address verification
- Amount verification
- Cronos blockchain confirmation

### 3. Feature Unlock
- Deep scan analysis
- Detailed risk assessment
- Comprehensive reporting
- Premium insights

## Security Features

- **Admin Authentication**: Secure admin key validation
- **Payment Verification**: Blockchain-based payment proof
- **Rate Limiting**: Built-in request throttling
- **Data Encryption**: Sensitive data protection
- **Audit Trails**: Complete action logging

## Troubleshooting

### Common Issues

#### Agent Won't Start
- Check MongoDB connection
- Verify Cronos RPC endpoint
- Ensure admin key is set

#### No Contract Events
- Verify contract addresses
- Check Cronos Testnet connectivity
- Confirm block range parameters

#### Payment Verification Fails
- Check transaction hash format
- Verify receiver wallet address
- Confirm minimum payment amount

### Debug Mode
Set `NODE_ENV=development` for detailed logging.

## Production Deployment

### 1. Environment Setup
- Set production MongoDB URI
- Configure secure admin keys
- Set up monitoring alerts
- Enable SSL/TLS

### 2. Scaling Considerations
- Database indexing optimization
- Log rotation policies
- Alert notification systems
- Performance monitoring

### 3. Security Hardening
- API rate limiting
- Input validation
- Error handling
- Access control

## Contributing

1. Fork the repository
2. Create feature branch
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

## License

MIT License - see LICENSE file for details.

---

**CronoSmart Audit Agent v1.0.0**  
Built for Cronos Testnet (Chain ID: 338)  
Smart Contract Addresses:
- Escrow: `0x12a09612eFc1538406f23B78E89a1dB094dc4Ac6`
- Vault: `0xaF194729b6ad0Fe1A7238416fe9db3Ce6764B410`