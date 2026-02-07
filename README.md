# 🚀 StellarBridge Pay

StellarBridge Pay is a crypto-to-UPI payment bridge powered by the Stellar blockchain that enables users to pay anywhere using XLM, even when merchants only accept UPI.

---

## 📌 Project Overview

StellarBridge Pay is a Web3 FinTech payments infrastructure project that bridges blockchain payments (Stellar / XLM) with real-world payment rails (UPI).

Pay with crypto where crypto isn’t accepted.

---

## ❗ Problem Statement

Despite growing crypto adoption, real-world usage remains limited.

- Local merchants do not accept crypto
- UPI dominates everyday payments in India
- Users must convert → withdraw → transfer → pay
- This process is slow, costly, and inconvenient

Crypto is not usable for daily payments.

---

## 💡 Solution

StellarBridge Pay introduces a merchant-proxy payment model:

- Users pay in XLM
- Merchants pay in UPI
- A smart-contract escrow ensures trustless settlement

This makes crypto usable anywhere UPI exists.

---

## 🔁 How It Works

1. User signs up and a real Stellar wallet is automatically created
2. User scans a UPI QR code and enters the payment amount
3. Payment request is sent to a merchant
4. XLM is locked in a Soroban escrow smart contract
5. Merchant pays the amount via UPI
6. Merchant confirms payment
7. Smart contract releases XLM to the merchant

Secure. Trustless. Blockchain-backed.

---

## 👥 User Roles

User:
- Holds XLM
- Wants to pay in the real world
- Sends payment requests

Merchant:
- Has UPI access
- Pays real-world bills
- Receives XLM as settlement

Merchants act as crypto-to-fiat bridges.

---

## 🔐 Smart Contract (Soroban Escrow)

The Soroban escrow contract:
- Locks XLM from the user
- Releases XLM only after merchant confirmation
- Prevents fraud on both sides
- Supports refunds if payment fails

---

## ⭐ Why Stellar?

Stellar is optimized for payments.

We use Stellar because it provides:
- Fast settlement
- Extremely low transaction fees
- Easy wallet creation
- Soroban smart contracts for escrow

---

## 🛠️ Tech Stack

Frontend:
- Next.js
- Tailwind CSS
- QR Scanner

Backend:
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Stellar SDK

Blockchain:
- Stellar Testnet
- Soroban Smart Contracts (Rust)

---

## 🗄️ Database Structure

Users Table:
- email
- role (USER / MERCHANT)
- stellar_public_key
- stellar_secret_key_encrypted
- created_at

Payment Requests Table:
- user_id
- merchant_id
- upi_id
- amount_in_inr
- amount_in_xlm
- status
- stellar_tx_hash
- created_at

---

## ⚙️ Installation

git clone https://github.com/your-username/stellarbridge-pay.git
cd stellarbridge-pay

Backend setup:
cd backend
npm install

Frontend setup:
cd frontend
npm install

---

## 🔐 Environment Variables

DATABASE_URL=
ENCRYPTION_SECRET=
STELLAR_NETWORK=testnet

---

## ▶️ Running the Project

Start backend:
npm run dev

Start frontend:
npm run dev

---

## 🧪 Demo Notes

- Uses Stellar Testnet
- Wallets are funded via Friendbot
- UPI confirmation is manual for MVP scope
- Focus is on real blockchain interaction

---

## 🏷️ Project Category

- Crypto-to-Fiat Payment Bridge
- Web3 Payments Infrastructure
- Smart-Contract Escrow System
- Financial Inclusion Tool

---

## 📜 License

MIT License
