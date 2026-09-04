# 📈 Smart Market Watchlist

> **"Don't make users check every stock. Tell them what meaningfully changed."**

A next-generation, full-stack fintech platform designed to transform traditional stock watchlists into proactive intelligence hubs. Instead of forcing investors to inspect dozens of stock charts manually, **Smart Market Watchlist** tracks your previous visits and immediately highlights **what changed since you were away, why it matters, and how it compares to the market.**

---

## 🚀 Key Features & Differentiators

- **⚡ "What Changed Since Your Last Visit?"**: Centralized hub showcasing 🔴 **HIGH** and 🟡 **MEDIUM** impact stock movements based on price shift, volume anomalies, 52-week level breaches, and corporate events.
- **🎯 Advanced Meaningful Change Engine**: 0–100 internal scoring system classifying stock activity with human-readable explanations (*"Down 5.6% since last visit"*, *"Volume 3.4× normal average"*, *"Underperformed S&P 500 by 6.2%"*).
- **📰 News & Corporate Events Classifier**: Integrated event classification tracking earnings reports, dividend declarations, stock splits, share buybacks, and regulatory filings.
- **📊 Market Context & Relative Performance**: S&P 500 benchmark comparison, sector relative returns, and real-time market status indicator (`● MARKET OPEN` / `MARKET CLOSED`).
- **🔄 Drag-and-Drop Watchlist**: Seamless priority reordering powered by `@hello-pangea/dnd`.
- **🛡️ Multi-Layer Security**: JWT Access Tokens, HTTP-Only Refresh Tokens, 4-Digit Security PIN with lockout protection, Helmet security headers, and Express rate limiting.
- **⏱️ Data Reliability & Freshness**: Explicit metadata freshness indicators (`FRESH`, `STALE`, `UNAVAILABLE`) with 30-second TTL in-memory caching and fallback priorities.
- **🎬 Hackathon Demo Mode**: Controlled environment flag (`DEMO_MODE=true`) for deterministic mock demonstrations during judging.

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
│   (Rate Limiter, Helmet Security, Auth Middleware)      │
└──────────────┬─────────────┬─────────────┬──────────────┘
               │             │             │
  ┌────────────▼──┐   ┌──────▼──────┐   ┌──▼──────────┐
  │ Change Engine │   │ News        │   │ Market Data │
  │ Scoring (0-100)│  │ Service     │   │ & Freshness │
  └────────────┬──┘   └──────┬──────┘   └──┬──────────┘
               │             │             │
┌──────────────▼─────────────▼─────────────▼──────────────┐
│                    MongoDB Database                     │
│    (Users, Watchlists, NewsEvents, Snapshots, Indexes)  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017`

### 2. Environment Setup
Copy the `.env.example` in `server/` to `server/.env`:
```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/smart_market_watchlist
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=smart_market_watchlist_access_secret_2026
JWT_REFRESH_SECRET=smart_market_watchlist_refresh_secret_2026
DEMO_MODE=true
```

### 3. Run Backend Server
```bash
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5002`.*

### 4. Run Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Testing & Demo Guide

1. Open **[http://localhost:5173/watchlist](http://localhost:5173/watchlist)**.
2. Observe the **"WHAT CHANGED SINCE YOUR LAST VISIT"** hub at the top:
   - Notice high impact indicators (**NVDA**, **TSLA**, **GOOGL**).
   - Read the human-understandable **"WHY THIS MATTERS"** bullet points.
3. Try searching for stocks in the Search Bar (`AAPL`, `NVDA`, `TSLA`, `MSFT`) and click **`+ Add`**.
4. Drag and drop stock items in **MY WATCHLIST** to reorder list priority.
5. Click on any stock card to open the **Stock Detail View** for 52-week range bars, benchmark relative return comparisons, and recent corporate news timelines.
