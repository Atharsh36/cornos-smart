# 🚀 CronoSmart

CronoSmart is a decentralized e-commerce marketplace built on the **Cronos Network** that brings smart-contract security to everyday online shopping.  
Instead of trusting a centralized platform, payments are locked in **escrow contracts** and released only after delivery is confirmed.

---

## ✨ What Makes CronoSmart Different?

- Buyers deposit CRO/tokens into a **Vault**
- Purchases move funds from **Vault → Escrow**
- Sellers receive payment **only after delivery**
- Disputes can be handled transparently on-chain
- Optional AI tools enhance trust and decision-making

---

## 🔁 How It Works

1. Buyer connects MetaMask (Cronos Testnet)
2. Buyer deposits funds into the Vault
3. Buyer places an order
4. Escrow locks payment securely
5. Seller ships the product
6. Buyer confirms delivery
7. Escrow releases funds to seller

---

## 🏗️ Tech Stack

**Smart Contracts**
- Vault Contract – manages deposits
- Escrow Contract – locks and releases payments

**Backend**
- Node.js, Express, MongoDB
- REST APIs for products, orders, and disputes

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS
- Wagmi + Viem for Web3 integration

---

## 🧑‍💻 Run Locally

### Backend
```bash
cd backend
npm install
npm run 

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
