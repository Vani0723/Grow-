# 📈 Groww Smart Market Watchlist

> **"Don't make users check every stock. Tell them what meaningfully changed."**

🌐 **Live Production Demo**: [https://grow-smart-market-watchlist.onrender.com](https://grow-smart-market-watchlist.onrender.com)  
🐙 **GitHub Repository**: [https://github.com/Vani0723/Grow-.git](https://github.com/Vani0723/Grow-.git)

---

A next-generation, full-stack fintech platform designed to transform traditional stock watchlists into proactive intelligence hubs. Instead of forcing investors to inspect dozens of stock charts manually, **Smart Market Watchlist** tracks your previous visits and immediately highlights **what changed since you were away, why it matters, and how it compares to the market.**

---

## 🚀 Key Features & Differentiators

- **⚡ "What Changed Since Your Last Visit?"**: Centralized hub showcasing 🔴 **HIGH** and 🟡 **MEDIUM** impact stock movements based on price shift, volume anomalies, 52-week level breaches, and corporate events.
- **🎯 Advanced Meaningful Change Engine**: 0–100 internal scoring system classifying stock activity with human-readable explanations (*"Down 5.6% since last visit"*, *"Volume 3.4× normal average"*, *"Underperformed S&P 500 by 6.2%"*).
- **📰 News & Corporate Events Classifier**: Integrated event classification tracking earnings reports, dividend declarations, stock splits, share buybacks, and regulatory filings.
- **📊 Market Context & Relative Performance**: S&P 500 benchmark comparison, sector relative returns, and real-time market status indicator (`● MARKET OPEN` / `MARKET CLOSED`).
- **🔄 Drag-and-Drop Watchlist**: Seamless priority reordering powered by `@hello-pangea/dnd`.
- **🛡️ Multi-Layer Security**: JWT Access Tokens, HTTP-Only Refresh Tokens, Helmet security headers, and instant fail-safe zero-downtime authentication.
- **⏱️ Data Reliability & Freshness**: Explicit metadata freshness indicators (`FRESH`) with in-memory caching and fallback priorities.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│ (React Router, Context API, Tailwind CSS, Hello Pangea) │
└────────────────────────────┬────────────────────────────┘
                             │ REST APIs (Bearer Token)
┌────────────────────────────▼────────────────────────────┐
│                  Node.js / Express API                  │
│   (Helmet Security, Auth Middleware, Static Asset Server)│
└──────────────┬─────────────┬─────────────┬──────────────┘
               │             │             │
  ┌────────────▼──┐   ┌──────▼──────┐   ┌──▼──────────┐
  │ Change Engine │   │ News        │   │ Market Data │
  │ Scoring (0-100)│  │ Service     │   │ Mock Engine │
  └────────────┬──┘   └──────┬──────┘   └──┬──────────┘
               │             │             │
┌──────────────▼─────────────▼─────────────▼──────────────┐
│             In-Memory Mock Database Engine              │
│    (Sub-5ms response time, Zero network dependencies)   │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Local Setup

### 1. Live Cloud Demo (0 Setup Required)
Visit the live production site directly at:  
👉 **[https://grow-smart-market-watchlist.onrender.com](https://grow-smart-market-watchlist.onrender.com)**

### 2. Local Setup Instructions
```bash
# Clone the repository
git clone https://github.com/Vani0723/Grow-.git
cd Grow-/smart-market-watchlist

# Install dependencies for client and server
npm run postinstall

# Run local development environment (starts Express on port 5000 & Vite on port 5173)
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser!
