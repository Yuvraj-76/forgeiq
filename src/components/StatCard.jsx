import React from 'react';
import * as Icons from 'lucide-react';

export const StatCard = ({
  id,
  title,
  value,
  subtitle,
  change,
  changeType = 'positive', // 'positive', 'negative', 'neutral'
  icon = 'Layers',
  color = 'indigo',
  onClick,
}) => {
  const IconComponent = Icons[icon] || Icons.Layers;

  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</span>
            {change && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  changeType === 'positive'
                    ? 'text-emerald-600'
                    : changeType === 'negative'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {change}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-lg border ${colorStyles[color] || colorStyles.indigo}`}>
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
