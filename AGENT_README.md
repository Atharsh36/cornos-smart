# CronoSmart Guardian Agent

User-facing AI Agent for trust, safety, and escrow clarity on CronoSmart marketplace.

## Features

### 1. Transaction Safety Check
- Validates network (Cronos testnet 338)
- Verifies escrow contract address
- Checks transaction amounts and balances
- Returns safety level: SAFE/RISKY/BLOCK

### 2. Seller Trust Score
- Computes trust scores based on seller history
- Shows completion rates and dispute counts
- Provides trust badges: Trusted Seller/Verified/High Risk

### 3. Escrow Explanation
- Explains current escrow stage
- Shows what each stage means
- Provides next steps and estimated times

## API Endpoints

```
POST /api/agent/sellerTrust/:productId
POST /api/agent/txSafetyCheck
POST /api/agent/escrowExplain/:orderId
```

## Installation

1. **Install dependencies:**
   ```bash
   ./install-agent.sh
   ```

2. **Configure environment:**
   ```bash
   cp .env.template backend/.env
   # Edit backend/.env with your settings
   ```

3. **Start services:**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend  
   cd frontend && npm run dev
   ```

## Usage

### Frontend Integration

The AgentPanel component automatically appears on:
- **Product pages**: Shows seller trust score
- **Checkout**: Shows transaction safety check (required before purchase)
- **Orders**: Shows escrow explanation on demand

### Safety Check Workflow

1. User clicks "Check Safety & Buy"
2. Agent validates transaction details
3. Safety result displayed in floating panel
4. User can proceed only if not BLOCKED

### Trust Score Display

- Automatically loads when viewing products
- Shows score 0-100 with color-coded badges
- Lists reasons for trust level

### Escrow Explanation

- Click "Explain Escrow" on order page
- Shows current stage and next steps
- Provides estimated completion time

## Testing

```bash
# Test all agent endpoints
node test-agent.js
```

## Configuration

Key environment variables:
- `CRONOS_RPC`: Cronos testnet RPC URL
- `ESCROW_ADDRESS`: Deployed escrow contract
- `VAULT_ADDRESS`: Deployed vault contract
- `CRONOS_AGENT_SDK_KEY`: Agent SDK key (optional)

## Architecture

```
Backend:
├── src/agent/
│   ├── index.js      # Core agent class
│   └── routes.js     # API endpoints

Frontend:
├── components/
│   └── AgentPanel.tsx # Floating widget UI
```

The agent runs as a backend service and exposes REST endpoints. The frontend displays agent outputs in a modern floating panel UI with Tailwind styling.