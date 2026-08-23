import React from 'react';
import { getConfidenceLevel } from '../utils/confidence';

export const ConfidenceScore = ({ score = 95, size = 110, strokeWidth = 9 }) => {
  const conf = getConfidenceLevel(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="flex items-center gap-4" id="confidence-score-container">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={conf.colorHex}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
            {score}
            <span className="text-sm font-semibold text-slate-500">%</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mt-0.5">
            {conf.level}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${conf.bgClass}`} />
          <h4 className="text-base font-bold text-slate-900">{conf.label}</h4>
        </div>
        <p className="text-xs text-slate-600 mt-1 max-w-[200px] leading-relaxed">
          {score >= 90
            ? 'All attributes verified via high-confidence supplier data and verified context.'
            : score >= 70
            ? 'Moderately high certainty. Taxonomy and major specs matched.'
            : 'Contains inferred fields requiring catalog specialist review.'}
        </p>
      </div>
    </div>
  );
};

export default ConfidenceScore;
