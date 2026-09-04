import React from 'react';
import MarketList from '../components/Market/MarketList';

const Market = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
      <MarketList />
    </div>
  );
};

export default Market;
