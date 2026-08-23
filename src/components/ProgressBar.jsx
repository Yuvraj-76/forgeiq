import React from 'react';

export const ProgressBar = ({ progress = 0, color = 'indigo', showLabel = true, height = 'h-2.5' }) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const colorClasses = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Progress</span>
          <span className="text-slate-900 font-bold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${colorClasses[color] || colorClasses.indigo} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
