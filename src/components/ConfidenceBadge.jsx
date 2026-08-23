import React from 'react';
import { getConfidenceLevel } from '../utils/confidence';

export const ConfidenceBadge = ({ score, showLabel = true, size = 'md' }) => {
  const conf = getConfidenceLevel(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      id={`confidence-badge-${score}`}
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-all ${conf.badgeClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass} animate-pulse`} />
      <span>{score}%</span>
      {showLabel && <span className="opacity-90">{conf.level}</span>}
    </span>
  );
};

export default ConfidenceBadge;
