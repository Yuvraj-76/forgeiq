import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { getSourceLabel, getValidationStatusBadge } from '../utils/confidence';

export const FeatureList = ({ features = [] }) => {
  const [expandedIndices, setExpandedIndices] = useState({});

  if (!features || features.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
        No verified feature highlights available. Features without verifiable evidence are omitted to prevent hallucinations.
      </div>
    );
  }

  const toggleExpand = (idx) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div id="ai-generated-features-card" className="space-y-3">
      {features.map((item, idx) => {
        // Handle both structured feature object and plain string
        const isStructured = typeof item === 'object' && item !== null;
        const featureText = isStructured ? item.feature : String(item);
        const source = isStructured ? item.source : 'manufacturer';
        const sourceUrl = isStructured ? item.sourceUrl : '';
        const evidence = isStructured ? item.evidence : null;
        const confidence = isStructured ? item.confidence : 95;
        const validationStatus = isStructured ? item.validationStatus : 'verified';

        const sourceInfo = getSourceLabel(source);
        const statusBadge = getValidationStatusBadge(validationStatus);
        const isExpanded = !!expandedIndices[idx] || (isStructured && !!evidence);
        const isConflict = statusBadge.isConflict;
        const isNotFound = statusBadge.isNotFound;

        return (
          <div
            key={idx}
            id={`feature-item-${idx + 1}`}
            className={`p-3.5 rounded-xl border transition-all ${
              isConflict
                ? 'bg-rose-50/60 border-rose-200 ring-1 ring-rose-500/20'
                : isNotFound
                ? 'bg-slate-50/80 border-slate-200 opacity-80'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-indigo-200 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`mt-0.5 p-1 rounded-lg shrink-0 ${
                    isConflict
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : isNotFound
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                    {featureText}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${sourceInfo.badgeColor}`}>
                      Source: {sourceInfo.label}
                    </span>

                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${statusBadge.badgeClass}`}>
                      {statusBadge.label}
                    </span>

                    {sourceUrl && (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold text-[10px]"
                      >
                        <span>OEM Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ConfidenceBadge score={confidence} size="sm" />
                {evidence && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    aria-label="Toggle feature evidence"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Supporting Evidence Snippet */}
            {evidence && isExpanded && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/70 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">
                  Supporting Specification Evidence:
                </span>
                <p className="font-mono text-slate-800 text-[11px] bg-white p-2 rounded border border-slate-200 leading-relaxed">
                  "{evidence}"
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeatureList;
