# 🚀 CronoSmart

CronoSmart is a decentralized e-commerce marketplace built on the Cronos Network.  
It combines a familiar online shopping experience with smart-contract escrow security, ensuring that buyer funds are protected and released to sellers only after delivery confirmation.

Unlike traditional marketplaces, CronoSmart removes centralized trust and replaces it with transparent, on-chain logic enforced by smart contracts.

---

## 🧠 Problem

Traditional e-commerce platforms rely on centralized trust:
- Buyers trust the platform to handle payments
- Sellers wait for payouts and face chargebacks
- Disputes are slow and manually handled
- Cross-border payments are expensive and delayed

---

## 💡 Solution

CronoSmart solves these problems using Vault and Escrow smart contracts:
- Buyers deposit funds into a Vault
- Payments are locked in Escrow during purchase
- Sellers receive funds only after delivery confirmation
- All transactions are verifiable on-chain

Trust is enforced by code, not intermediaries.

---

## 🌟 Key Features

- Vault-based deposits using CRO or supported tokens
- Escrow-protected checkout flow
- Transparent order lifecycle tracking
- Buyer and seller protection
- Dispute-safe payment handling
- Optional AI-powered trust and recommendation tools
- x402 pay-per-action support for premium AI services

---

## 🏗️ Architecture Overview

Smart Contracts:
- Vault Contract: manages user deposits and balances
- Escrow Contract: locks and releases payments based on order status

Backend:
- Node.js with Express
- MongoDB for off-chain data storage
- REST APIs for products, orders, disputes, and AI services

Frontend:
- React with Vite and TypeScript
- Tailwind CSS for UI styling
- Wagmi and Viem for Web3 interactions
- MetaMask wallet integration

---

## 🔁 Order Lifecycle

1. Buyer deposits CRO into the Vault
2. Buyer places an order
3. Funds move from Vault to Escrow
4. Seller ships the product
5. Buyer confirms delivery
6. Escrow releases funds to the seller

Order status progression:
CREATED → FUNDED → SHIPPED → DELIVERED → COMPLETED

---

## ▶️ How to Run CronoSmart Locally

Clone the repository:
git clone https://github.com/<your-username>/cronosmart.git
cd cronosmart

Run backend:
cd backend
npm install
npm run dev

Backend runs at:
http://localhost:8080

Run frontend (open a new terminal):
cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:5173

Build frontend for production (optional):
cd frontend
npm run build

Production build output:
dist/

---

## 🧭 How to Use CronoSmart

Buyer Flow:
- Connect MetaMask wallet (Cronos Testnet)
- Deposit CRO into the Vault
- Browse products in the marketplace
- Purchase a product (payment locked in escrow)
- Track order status
- Confirm delivery to release payment

Seller Flow:
- Connect wallet
- List products with price and details
- Receive orders
- Ship products
- Receive payment after buyer confirmation

---

## 🤖 AI Rails (Optional)

AI Rails enhance the marketplace experience by:
- Recommending suitable products
- Generating quick product summaries
- Evaluating seller trust scores
- Assisting during dispute resolution

Some AI features are unlocked using x402 pay-per-action payments.

---

## 🔐 Security Considerations

- No centralized custody of user funds
- All payments handled by smart contracts
- Backend stores metadata only (never private keys or funds)
- Fully transparent and verifiable transaction flow

---

## 🔗 Smart Contracts (Cronos Testnet)

Escrow Contract:
0x12a09612eFc1538406f23B78E89a1dB094dc4Ac6

Vault Contract:
0xaF194729b6ad0Fe1A7238416fe9db3Ce6764B410

Network: Cronos Testnet  
Chain ID: 338  
RPC: https://evm-t3.cronos.org/

---

