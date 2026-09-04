import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth } from '../api';

const Home = () => {
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    getHealth()
      .then((data) => {
        setStatus({ loading: false, success: data.success, message: data.message });
      })
      .catch(() => {
        setStatus({ loading: false, success: false, message: 'Unable to reach backend' });
      });
  }, []);

  return (
    <div className="w-full space-y-12 py-8">
      {/* Hero Banner */}
      <div className="text-center space-y-6 py-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#5367ff] text-xs font-black uppercase tracking-wider shadow-sm">
          <span>⚡</span> GROWW FINTECH INTELLIGENCE ENGINE
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Stop checking every stock. <br />
          <span className="bg-gradient-to-r from-[#00d09c] via-teal-500 to-[#5367ff] bg-clip-text text-transparent">
            Know what meaningfully changed.
          </span>
        </h1>
        
        <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto font-semibold leading-relaxed">
          Instantly discover price shifts, volume anomalies, 52-week breaches, and corporate events relative to your last visit baseline.
        </p>

        <div className="pt-2">
          {status.loading ? (
            <span className="inline-block px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-500 animate-pulse font-bold">
              Checking backend connectivity…
            </span>
          ) : (
            <span className={`inline-block px-4.5 py-1.5 rounded-full text-xs font-black ${
              status.success ? 'bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/35' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              Backend Status: {status.success ? 'Connected ✓' : 'Error ✗'} – {status.message}
            </span>
          )}
        </div>

        <div className="pt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/watchlist"
            className="btn-groww text-sm px-8 py-4"
          >
            Open Smart Watchlist &rarr;
          </Link>
          <Link
            to="/market"
            className="btn-groww-blue text-sm px-8 py-4"
          >
            Explore Live Market
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid with Lively Blue Accents */}
      <div className="grid md:grid-cols-2 gap-6 text-left">
        <Link to="/watchlist" className="groww-card p-8 block group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#00d09c] to-emerald-400 absolute top-0 left-0" />
          <div className="w-14 h-14 rounded-2xl bg-[#00d09c]/15 border border-[#00d09c]/30 flex items-center justify-center text-[#00d09c] text-3xl mb-5 shadow-inner">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-slate-900 group-hover:text-[#00d09c] transition-colors">
            "What Changed Since Your Last Visit?"
          </h2>
          <p className="text-slate-600 text-sm mt-3 font-semibold leading-relaxed">
            Dynamic impact scoring engine classifying price surges/drops, volume spikes, and news events into high and medium urgency cards.
          </p>
          <div className="mt-6 text-[#00d09c] text-xs font-black flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            Open Watchlist &rarr;
          </div>
        </Link>

        <Link to="/market" className="groww-card p-8 block group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#5367ff] to-blue-400 absolute top-0 left-0" />
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#5367ff] text-3xl mb-5 shadow-inner">
            📊
          </div>
          <h2 className="text-2xl font-black text-slate-900 group-hover:text-[#5367ff] transition-colors">
            Live Market Overview & Search
          </h2>
          <p className="text-slate-600 text-sm mt-3 font-semibold leading-relaxed">
            Search symbols, inspect 52-week price ranges, benchmark against S&P 500 returns, and drag-and-drop stocks in your watchlist.
          </p>
          <div className="mt-6 text-[#5367ff] text-xs font-black flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            Explore Market Data &rarr;
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
