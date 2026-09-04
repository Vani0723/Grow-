import React, { useEffect, useState } from 'react';
import { getStocks } from '../../api';
import StockCard from './StockCard';

const MarketList = ({ stocks: propStocks }) => {
  const [stocks, setStocks] = useState(propStocks || []);
  const [loading, setLoading] = useState(!propStocks);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propStocks) return; // use provided data
    const fetchStocks = async () => {
      try {
        const data = await getStocks();
        setStocks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, [propStocks]);

  if (loading) {
    return <div className="loader" />;
  }
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {stocks.map((stock) => (
        <StockCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
};

export default MarketList;
