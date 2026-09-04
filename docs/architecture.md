# 📐 System Architecture & Design Specification

## Overview

The **Smart Market Watchlist** platform is engineered using a clean, modular N-tier architecture designed around high responsiveness, security, and data reliability.

---

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Express Router                        │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
┌───────────────▼──────────────┐  ┌───────────▼───────────────┐
│ Watchlist Controller         │  │ News Controller           │
└───────────────┬──────────────┘  └───────────┬───────────────┘
                │                             │
┌───────────────▼─────────────────────────────▼───────────────┐
│                 Change Engine Service                       │
│    Scoring algorithm evaluating price, volume, & events     │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
┌───────▼─────────────┐  ┌─────▼──────────────┐  ┌────▼──────────────┐
│ Market Data Service │  │ Market Context Svc │  │ News Service      │
│ Freshness & Cache   │  │ Benchmark Return   │  │ Corporate Events  │
└─────────────────────┘  └────────────────────┘  └───────────────────┘
```

---

## Core Components

### 1. Meaningful Change Scoring Engine (`changeEngine.service.js`)
Calculates an aggregate 0–100 score per stock:
- **Price Movement (0–30 pts)**: Evaluates absolute % shift since last visit.
- **Volume Anomaly (0–20 pts)**: Detects volume spikes exceeding 2.0x–3.0x average trading volume.
- **Benchmark Relative Return (0–20 pts)**: Calculates return variance against S&P 500 / NIFTY.
- **52-Week Range Proximity (0–15 pts)**: Identifies 52-week high or low breaches.
- **News & Corporate Events (0–15 pts)**: Factors in earnings releases, stock splits, and dividends.

Classifications:
- `75–100`: 🔴 **HIGH IMPACT**
- `50–74`: 🟡 **MEDIUM IMPACT**
- `25–49`: 🟢 **LOW IMPACT**
- `0–24`: **NOT MEANINGFUL**

### 2. Market Data Freshness Strategy (`marketData.service.js`)
Tracks data age and tags responses:
- `FRESH`: Data updated within 30 seconds.
- `STALE`: Data timestamp > 60 seconds old.
- `UNAVAILABLE`: Fallback to last known stored DB value.

### 3. Security Architecture (`auth.routes.js`, `authMiddleware.js`)
- Passwords & 4-digit PINs hashed with `bcryptjs`.
- JWT access tokens (15m expiry) sent via Authorization header.
- HTTP-only refresh tokens stored in cookies.
- Helmet security headers & Express rate limiting enabled.
