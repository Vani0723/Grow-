import React, { useState, useEffect, useRef } from 'react';
import { getStocks } from '../api';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const SearchBar = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await getStocks(debouncedQuery);
        setResults(data || []);
        setIsOpen(true);
      } catch (e) {
        console.error('Search error:', e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (stock) => {
    if (onSelectStock) {
      onSelectStock(stock);
    }
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search stocks by symbol or name (e.g. AAPL, NVDA, Tesla)..."
          className="w-full p-4 pl-12 rounded-2xl bg-white border border-slate-200 focus:border-[#00d09c] text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all font-medium text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
        />
        <span className="absolute left-4 top-4 text-slate-400">🔍</span>
        {loading && (
          <span className="absolute right-4 top-4 text-xs text-[#00d09c] font-black animate-pulse">
            Searching…
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto z-40">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-semibold">
              No matching stocks found. Try searching symbols like <strong className="text-slate-900">AAPL</strong> or <strong className="text-slate-900">NVDA</strong>.
            </div>
          ) : (
            results.map((stock) => {
              const isSignificant = typeof stock.change === 'number' && Math.abs(stock.change) >= 5;
              const priceClass = (stock.change || 0) >= 0 ? 'text-[#00d09c]' : 'text-red-500';

              return (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      {stock.symbol}
                      {isSignificant && <span className="badge-high">🔥 5%+</span>}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{stock.name}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {typeof stock.price === 'number' && (
                      <div className="text-right text-xs">
                        <div className="font-black text-slate-900">${stock.price.toFixed(2)}</div>
                        <div className={`font-bold ${priceClass}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleAdd(stock)}
                      className="px-4 py-1.5 bg-[#00d09c] hover:bg-[#00b887] text-white font-black text-xs rounded-xl transition-all shadow-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
