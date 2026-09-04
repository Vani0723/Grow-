# 📡 REST API Documentation

## Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account.
- **Request Body**: `{ "name": "John Doe", "email": "john@example.com", "password": "Password123" }`
- **Response**: `{ "success": true, "accessToken": "..." }`

### `POST /api/auth/login`
Authenticates a user and issues access/refresh tokens.
- **Request Body**: `{ "email": "john@example.com", "password": "Password123" }`
- **Response**: `{ "success": true, "accessToken": "..." }`

### `GET /api/auth/me`
Fetches authenticated user profile.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `{ "success": true, "data": { "id": "...", "name": "John Doe", "email": "john@example.com" } }`

---

## Watchlist & Change Engine Endpoints (`/api/watchlist`)

### `GET /api/watchlist/summary`
Returns aggregated watchlist data, market benchmark status, data freshness, and Meaningful Change analyses with reasons list.
- **Headers**: `Authorization: Bearer <accessToken>` (Optional for guest fallback)
- **Response**:
```json
{
  "success": true,
  "data": {
    "watchlist": [...],
    "meaningfulChanges": [
      {
        "symbol": "NVDA",
        "impact": "HIGH",
        "score": 84,
        "reasons": [
          "Significant price move: +6.8%",
          "Trading volume is 3.4× normal average",
          "Outperformed S&P 500 by +6.2%"
        ]
      }
    ],
    "marketStatus": { "status": "MARKET OPEN" }
  }
}
```

### `GET /api/watchlist`
Retrieves user watchlist items enriched with real-time market metrics.

### `POST /api/watchlist/add`
Adds a stock symbol to the user's watchlist.
- **Request Body**: `{ "symbol": "NVDA", "name": "NVIDIA Corp." }`

### `DELETE /api/watchlist/remove/:symbol`
Removes a stock from the watchlist.

### `PUT /api/watchlist/reorder`
Updates watchlist item priority ordering.
- **Request Body**: `{ "orderedSymbols": ["NVDA", "AAPL", "MSFT"] }`

---

## News & Corporate Events Endpoints (`/api/news`)

### `GET /api/news`
Fetches recent news & corporate events for watchlist symbols.
- **Query Params**: `?symbols=NVDA,TSLA`

### `GET /api/news/:symbol`
Fetches news for a specific stock symbol.
