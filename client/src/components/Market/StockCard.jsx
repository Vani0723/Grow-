import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext';

const StockCard = ({ stock }) => {
  const navigate = useNavigate();
  const { add, watchlist } = useWatchlist();
  const [added, setAdded] = useState(false);

  const { symbol, name, price, change } = stock;
  const priceClass = change >= 0 ? 'text-[#00d09c] font-black' : 'text-red-500 font-black';
  const isSignificant = Math.abs(change) >= 5;
  const isInWatchlist = watchlist?.some((s) => s.symbol.toUpperCase() === symbol.toUpperCase());

  const handleCardClick = () => {
    navigate(`/stock/${symbol}`);
  };

  const handleAddWatchlist = (e) => {
    e.stopPropagation();
    add(stock);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="groww-card p-6 cursor-pointer flex flex-col justify-between group"
      onClick={handleCardClick}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-extrabold text-lg text-slate-900 flex items-center gap-2 group-hover:text-[#00d09c] transition-colors">
              {symbol}
              {isSignificant && <span className="badge-high">🔥 5%+</span>}
            </div>
            <div className="text-xs text-slate-500 font-semibold">{name}</div>
          </div>
        </div>

        <div className="text-2xl font-black text-slate-900 my-3">
          ${price.toFixed(2)}
          <span className={`text-xs ml-2 ${priceClass}`}>
            ({change >= 0 ? '+' : ''}{change.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-500 font-bold group-hover:text-[#00d09c] transition-colors">
          View details &rarr;
        </span>
        <button
          onClick={handleAddWatchlist}
          disabled={isInWatchlist}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            isInWatchlist
              ? 'bg-slate-100 text-slate-400 cursor-default border border-slate-200'
              : added
              ? 'bg-[#00d09c] text-white'
              : 'bg-[#00d09c] hover:bg-[#00b887] text-white shadow-sm'
          }`}
        >
          {isInWatchlist ? '✓ In Watchlist' : added ? '✓ Added!' : '+ Watchlist'}
        </button>
      </div>
    </div>
  );
};

export default StockCard;
