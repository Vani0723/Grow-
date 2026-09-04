import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'detail') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-slate-200 rounded-xl" />
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-48 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-slate-100 border border-slate-200 rounded-xl animate-pulse flex justify-between items-center"
        >
          <div className="space-y-2 w-1/2">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200/80 rounded w-2/3" />
          </div>
          <div className="space-y-2 w-1/4 text-right">
            <div className="h-5 bg-slate-200 rounded w-full ml-auto" />
            <div className="h-3 bg-slate-200/80 rounded w-1/2 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
