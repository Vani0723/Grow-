import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Market from './pages/Market';
import StockDetail from './pages/StockDetail';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#00d09c33] selection:text-[#00d09c]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-start">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Groww White Footer */}
      <footer className="w-full border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00d09c] text-white flex items-center justify-center font-black text-xs">
              🌱
            </div>
            <span className="font-extrabold text-[#00d09c]">Groww Smart Watchlist</span>
            <span className="text-slate-400">— Intelligence Engine</span>
          </div>
          <span className="text-slate-500 font-medium">Understand what meaningfully changed since your last visit.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
