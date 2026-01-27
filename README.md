# 🚀 CronoSmart

CronoSmart is a decentralized e-commerce marketplace built on the **Cronos Network** that brings trustless, smart-contract–based security to online shopping.  
It works like a traditional e-commerce platform, but instead of trusting a centralized authority, buyer funds are locked safely in **escrow smart contracts** and released only after delivery is confirmed.

---

## 🧠 Problem Statement

Traditional e-commerce platforms rely heavily on centralized trust:
- Buyers must trust the platform to handle payments fairly
- Sellers face delayed payouts and chargebacks
- Disputes are handled manually and often unfairly
- Cross-border payments are slow and expensive

These issues create friction, especially in high-value and international transactions.

---

## 💡 Solution: CronoSmart

CronoSmart solves these problems using **blockchain escrow + vault-based payments**:
- Buyer funds are protected by smart contracts
- Sellers receive guaranteed payment after delivery
- No centralized custody of funds
- Fully transparent and verifiable on-chain transactions

Trust is enforced by **code**, not intermediaries.

---

## 🔥 Key Features

- 🏦 **Vault-Based Deposits**  
  Users deposit CRO or supported tokens into a Vault before shopping.

- 🔐 **Escrow-Protected Payments**  
  Funds are locked in escrow and released only after delivery confirmation.

- 🛒 **Marketplace Experience**  
  Familiar product browsing, checkout, and order tracking.

- ⚖️ **Dispute Protection**  
  Funds remain safe during disputes until resolution.

- 🤖 **AI Rails (Optional)**  
  AI tools assist with product recommendations, seller trust scoring, and dispute summaries.

- 💸 **x402 Pay-Per-Use AI Tools**  
  Premium AI services can be unlocked using micro-payments.

---

## 🏗️ System Architecture

### 🔗 Smart Contracts (Cronos Testnet)

- **Vault Contract**  
  Handles user deposits and balances.

- **Escrow Contract**  
  Locks payments and releases them based on order lifecycle events.

### 🧠 Backend

- Node.js + Express  
- MongoDB for off-chain data:
  - Products
  - Orders
  - Users
  - Disputes
- REST APIs for marketplace operations and AI services.

### 🎨 Frontend

- React + Vite + TypeScript  
- Tailwind CSS for UI styling  
- Wagmi + Viem for Web3 integration  
- MetaMask wallet connection.

---

## 🔁 Order Lifecycle

1. Buyer deposits CRO into the Vault  
2. Buyer places an order  
3. Payment moves from Vault → Escrow  
4. Seller ships the product  
5. Buyer confirms delivery  
6. Escrow releases payment to seller  

Order status progression:

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

## 🧑‍💻 How to Run CronoSmart Locally

### 📦 Prerequisites

- Node.js v18 or higher  
- npm or yarn  
- MetaMask browser extension  
- Cronos Testnet added to MetaMask  

---

## 🧠 Backend Setup

```bash
cd backend
npm install
npm run dev


