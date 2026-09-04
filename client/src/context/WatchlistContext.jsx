import React, { createContext, useContext, useEffect, useState } from 'react';
import { getWatchlist, addStock, removeStock, reorderWatchlist } from '../api';

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

const DEFAULT_GUEST_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 1406.20, change: -5.42 },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1522.30, change: 3.20 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 3241.20, change: 1.77 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1612.10, change: 1.05 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.50, change: 1.25 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 720.40, change: 4.80 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, change: 5.40 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 402.10, change: -0.85 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 198.40, change: -5.60 }
];

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const getFallbackStocks = () => {
    try {
      const saved = localStorage.getItem('guest_watchlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing guest watchlist:', e);
    }
    return DEFAULT_GUEST_STOCKS;
  };

  // Load watchlist on mount
  const loadWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWatchlist();
      if (Array.isArray(data) && data.length > 0) {
        setWatchlist(data);
        setIsGuest(false);
      } else {
        const fallback = getFallbackStocks();
        setWatchlist(fallback);
        setIsGuest(true);
      }
    } catch (e) {
      const fallback = getFallbackStocks();
      setWatchlist(fallback);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const add = async (stock) => {
    if (!isGuest) {
      try {
        const data = await addStock(stock);
        if (Array.isArray(data) && data.length > 0) {
          setWatchlist(data);
          return;
        }
      } catch (e) {
        // fallback to local update if server fails
      }
    }
    const updated = [...watchlist.filter(s => s.symbol !== stock.symbol), {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price || 150.00,
      change: stock.change || 0.0
    }];
    setWatchlist(updated);
    localStorage.setItem('guest_watchlist', JSON.stringify(updated));
  };

  const remove = async (symbol) => {
    if (!isGuest) {
      try {
        const data = await removeStock(symbol);
        if (Array.isArray(data) && data.length > 0) {
          setWatchlist(data);
          return;
        }
      } catch (e) {
        // fallback to local update
      }
    }
    const updated = watchlist.filter(s => s.symbol !== symbol);
    const finalWatchlist = updated.length > 0 ? updated : DEFAULT_GUEST_STOCKS;
    setWatchlist(finalWatchlist);
    localStorage.setItem('guest_watchlist', JSON.stringify(finalWatchlist));
  };

  const reorder = async (orderedSymbols) => {
    if (!isGuest) {
      try {
        const data = await reorderWatchlist(orderedSymbols);
        if (Array.isArray(data) && data.length > 0) {
          setWatchlist(data);
          return;
        }
      } catch (e) {
        // fallback
      }
    }
    const symbolMap = new Map(watchlist.map(s => [s.symbol, s]));
    const updated = orderedSymbols.map(sym => symbolMap.get(sym)).filter(Boolean);
    const finalWatchlist = updated.length > 0 ? updated : watchlist;
    setWatchlist(finalWatchlist);
    localStorage.setItem('guest_watchlist', JSON.stringify(finalWatchlist));
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, loading, error, isGuest, add, remove, reorder, refreshWatchlist: loadWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};
