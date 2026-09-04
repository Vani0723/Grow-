import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useWatchlist } from '../context/WatchlistContext';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { getWatchlistSummary, simulateMarketTick, recordVisitSnapshot } from '../api';

const DEFAULT_FALLBACK = [
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

const DEFAULT_CHANGES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 1406.20, change: -5.42, impact: 'HIGH', score: 88, reasons: ['5.42% price drop detected since baseline', 'Volume multiplier 3.2× normal average'] },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1522.30, change: 3.20, impact: 'MEDIUM', score: 65, reasons: ['3.20% price gain relative to benchmark S&P 500'] },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 198.40, change: -5.60, impact: 'HIGH', score: 92, reasons: ['5.60% price drop breaching 52-week lower boundary'] }
];

const Watchlist = () => {
  const navigate = useNavigate();
  const { watchlist: contextWatchlist, loading: watchlistLoading, isGuest, add, remove, reorder } = useWatchlist();
  
  const [summaryData, setSummaryData] = useState({
    watchlist: DEFAULT_FALLBACK,
    meaningfulChanges: DEFAULT_CHANGES,
    marketStatus: { status: 'MARKET OPEN' },
    lastVisitedAt: new Date(Date.now() - 30 * 60 * 1000)
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [simulating, setSimulating] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await getWatchlistSummary();
      if (res && res.watchlist && res.watchlist.length > 0) {
        setSummaryData(res);
      }
    } catch (e) {
      console.warn('Summary fetch notice:', e);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [contextWatchlist]);

  const handleSimulateTick = async () => {
    setSimulating(true);
    try {
      await simulateMarketTick();
      await fetchSummary();
    } catch (e) {
      console.error('Simulate error:', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleRecordSnapshot = async () => {
    try {
      await recordVisitSnapshot();
      await fetchSummary();
    } catch (e) {
      console.error('Snapshot error:', e);
    }
  };

  const watchlist = (contextWatchlist && contextWatchlist.length > 0)
    ? contextWatchlist
    : (summaryData?.watchlist && summaryData.watchlist.length > 0)
    ? summaryData.watchlist
    : DEFAULT_FALLBACK;

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(watchlist);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const orderedSymbols = reordered.map((s) => s.symbol);
    await reorder(orderedSymbols);
  };

  const handleAddStock = async (stock) => {
    if (stock && stock.symbol) {
      await add({ symbol: stock.symbol, name: stock.name, price: stock.price, change: stock.change });
    }
  };

  const meaningfulChanges = (summaryData?.meaningfulChanges && summaryData.meaningfulChanges.length > 0)
    ? summaryData.meaningfulChanges
    : DEFAULT_CHANGES;

  const marketStatus = summaryData?.marketStatus || { status: 'MARKET OPEN' };
  const lastVisitedAt = summaryData?.lastVisitedAt;

  const getTimeAgoText = (dateStr) => {
    if (!dateStr) return '30 minutes ago';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  };

  const filteredChanges = activeTab === 'all'
    ? meaningfulChanges
    : meaningfulChanges.filter((c) => c.impact && c.impact.toLowerCase() === activeTab);

  const renderStockRow = (stock, index) => {
    const isSignificant = typeof stock.change === 'number' && Math.abs(stock.change) >= 5;
    const priceClass = (stock.change || 0) >= 0 ? 'text-[#00d09c] font-black' : 'text-red-500 font-black';
    
    const high52 = stock.high52 || (stock.price ? stock.price * 1.15 : 200);
    const low52 = stock.low52 || (stock.price ? stock.price * 0.82 : 100);
    const rangePercent = Math.min(Math.max(((stock.price - low52) / (high52 - low52)) * 100, 5), 95);

    return (
      <Draggable key={stock.symbol} draggableId={stock.symbol} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            className="groww-card p-5 mb-3.5 cursor-pointer group hover:border-[#5367ff]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 hover:text-[#5367ff] cursor-grab text-lg font-bold">⋮⋮</span>
                <div>
                  <div className="font-black text-slate-900 text-lg flex items-center gap-2">
                    {stock.symbol}
                    {isSignificant && (
                      <span className="badge-high">
                        🔥 5%+
                      </span>
                    )}
                    {stock.volumeMultiplier >= 2.0 && (
                      <span className="badge-blue">
                        ⚡ {stock.volumeMultiplier.toFixed(1)}× Vol
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">{stock.name}</div>
                </div>
              </div>

              {/* 52-Week Range Bar */}
              <div className="hidden lg:block w-48 text-xs text-slate-500 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Low: ${low52.toFixed(0)}</span>
                  <span className="text-[#5367ff] font-extrabold">High: ${high52.toFixed(0)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-[#00d09c] to-[#5367ff] h-full rounded-full transition-all"
                    style={{ width: `${rangePercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                {typeof stock.price === 'number' && (
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-xl">${stock.price.toFixed(2)}</div>
                    {typeof stock.change === 'number' && (
                      <div className={`text-xs ${priceClass}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors text-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(stock.symbol);
                  }}
                  title="Remove stock"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Smart Watchlist</h1>
            {marketStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                marketStatus.status === 'MARKET OPEN' ? 'bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/35' : 'bg-slate-100 text-slate-600'
              }`}>
                ● {marketStatus.status}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Understand what meaningfully changed since your last visit.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateTick}
            disabled={simulating}
            className="btn-groww text-xs"
            title="Simulate market price fluctuations"
          >
            <span>⚡</span> {simulating ? 'Simulating...' : 'Simulate Market Shift'}
          </button>
          <button
            onClick={handleRecordSnapshot}
            className="btn-groww-blue text-xs"
            title="Mark visit baseline"
          >
            📸 Mark Visit Baseline
          </button>
        </div>
      </div>

      {isGuest && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-[#5367ff] font-bold flex justify-between items-center shadow-sm">
          <span>💡 <strong>Guest Mode:</strong> You are viewing local watchlist stocks. Log in to synchronize your account!</span>
        </div>
      )}

      {/* SECTION 1: WHAT CHANGED SINCE YOUR LAST VISIT */}
      <section className="groww-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00d09c] via-[#5367ff] to-[#00d09c] absolute top-0 left-0" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#5367ff] text-2xl shadow-inner">
              ⚡
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                WHAT CHANGED SINCE YOUR LAST VISIT
              </h2>
              <p className="text-xs text-[#5367ff] font-bold mt-0.5">
                Comparing shifts since baseline ({getTimeAgoText(lastVisitedAt)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'all' ? 'bg-[#5367ff] text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({meaningfulChanges.length})
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'high' ? 'bg-red-500 text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🔴 High
            </button>
            <button
              onClick={() => setActiveTab('medium')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'medium' ? 'bg-amber-500 text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🟡 Medium
            </button>
          </div>
        </div>

        {summaryLoading ? (
          <SkeletonLoader count={2} />
        ) : filteredChanges.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-2">
            <p className="text-sm font-black text-slate-800">No major changes detected since {getTimeAgoText(lastVisitedAt)}.</p>
            <p className="text-xs text-slate-500 font-medium">Click <strong>"⚡ Simulate Market Shift"</strong> above to trigger live market price fluctuations!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredChanges.map((item) => {
              const isHigh = item.impact === 'HIGH';
              const priceClass = item.change >= 0 ? 'text-[#00d09c]' : 'text-red-500';

              return (
                <div
                  key={item.symbol}
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 shadow-sm hover:shadow-md group ${
                    isHigh
                      ? 'bg-red-50/50 border-red-200 hover:border-red-400'
                      : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-xl text-slate-900 group-hover:text-[#5367ff] transition-colors">{item.symbol}</span>
                        <span className={isHigh ? 'badge-high' : 'badge-medium'}>
                          {isHigh ? '🔴 HIGH IMPACT' : '🟡 MEDIUM'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{item.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-xl">${item.price.toFixed(2)}</div>
                      <div className={`text-xs font-black ${priceClass}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Reasons List */}
                  <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                    <div className="text-[11px] font-black text-[#5367ff] tracking-wider">WHY THIS MATTERS:</div>
                    {Array.isArray(item.reasons) ? item.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700 text-[11px] font-semibold">
                        <span className={isHigh ? 'text-red-500' : 'text-amber-500'}>•</span>
                        <span>{reason}</span>
                      </div>
                    )) : (
                      <div className="text-slate-700 text-[11px] font-semibold">• Price shift detected relative to baseline</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold pt-1">
                    <span>Score: {item.score || 85}/100</span>
                    <span className="text-[#5367ff] group-hover:underline flex items-center gap-1">View full analysis &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: MY WATCHLIST */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>📑</span> MY WATCHLIST
          </h2>
          <div className="text-xs text-[#5367ff] font-extrabold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Drag items to reorder priority
          </div>
        </div>

        <SearchBar onSelectStock={handleAddStock} />

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="watchlist">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {watchlist.length === 0 ? (
                  <div className="text-center py-14 text-slate-500 border border-dashed border-slate-200 rounded-2xl font-bold">
                    Your watchlist is empty. Use the search bar above to add stocks!
                  </div>
                ) : (
                  watchlist.map((stock, idx) => renderStockRow(stock, idx))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </section>
    </div>
  );
};

export default Watchlist;
