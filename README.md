# 🚀 CronoSmart

CronoSmart is a decentralized e-commerce marketplace built on the **Cronos Network** that combines a familiar shopping experience with **smart contract–based escrow security**.  
It works like a normal online marketplace, but buyer funds are locked safely on-chain and released only after delivery is confirmed.

---

## 🧠 Why CronoSmart?

Traditional e-commerce platforms rely on centralized trust:
- Buyers trust the platform
- Sellers wait for payouts
- Disputes are handled manually

CronoSmart removes this dependency by using **Vault + Escrow smart contracts**, ensuring:
- Buyer funds are protected
- Sellers are paid only after delivery
- Transactions are transparent and verifiable on-chain

---

## 🔥 Use Cases

### 🛍️ Secure Online Shopping
Buy products safely with escrow-protected payments.

### 🌍 Cross-Border Commerce
Crypto payments remove geographical and banking barriers.

### 💼 High-Value Transactions
Ideal for electronics, luxury items, or B2B commerce.

### ⚖️ Dispute-Prone Marketplaces
Escrow ensures neither buyer nor seller can be cheated.

### 🤖 AI-Enhanced Commerce (Optional)
AI Rails assist with product discovery, seller trust scoring, and dispute analysis.  
Premium AI tools can be unlocked using **x402 pay-per-use payments**.

---

## 🏗️ Architecture Overview

### 🔐 Smart Contracts (Cronos Testnet)
- **Vault Contract** – Manages user deposits (CRO / tokens)
- **Escrow Contract** – Locks and releases payments based on order lifecycle

### 🧠 Backend
- Node.js + Express
- MongoDB for off-chain data (products, orders, users)
- REST APIs for marketplace operations

### 🎨 Frontend
- React + Vite + TypeScript
- Tailwind CSS
- Wagmi + Viem for Web3 interactions
- MetaMask wallet integration

---

## 🔁 Order Flow

1. Buyer deposits CRO into Vault  
2. Buyer places an order  
3. Funds move from Vault → Escrow  
4. Seller ships product  
5. Buyer confirms delivery  
6. Escrow releases funds to seller  

---

## 🔗 Smart Contract Details (Cronos Testnet)

- **Escrow Contract**  
  `0x12a09612eFc1538406f23B78E89a1dB094dc4Ac6`

- **Vault Contract**  
  `0xaF194729b6ad0Fe1A7238416fe9db3Ce6764B410`

- **Network**: Cronos Testnet  
- **Chain ID**: 338  
- **RPC**: https://evm-t3.cronos.org/

---

## 🧑‍💻 How to Run the Project Locally

### 📦 Prerequisites
- Node.js v18+
- npm or yarn
- MetaMask browser extension
- Cronos Testnet added to MetaMask

---

### 🔹 Backend Setup

```bash
cd backend
npm install
npm run dev

Backend runs on:

http://localhost:8080


Make sure MongoDB is running and .env is configured.

### Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs on:

http://localhost:5173

🔹 Build for Production
npm run build


Production build output:

dist/

👤 How to Use CronoSmart
🛒 Buyer Flow

Connect MetaMask (Cronos Testnet)

Deposit CRO into Vault

Browse the marketplace

Buy a product (escrow-protected)

Confirm delivery to release payment

🧑‍💼 Seller Flow

Connect wallet

List products

Ship orders

Receive payment after delivery confirmation

🧠 AI Rails (Optional)

AI Rails enhance the platform by:

Recommending products

Generating product summaries

Evaluating seller trust

Assisting in dispute resolution

Some AI features are protected using x402 pay-per-action payments.

 Security Notes

Funds are never held by a centralized party

All payments are managed by smart contracts

Backend stores metadata only, not user funds
