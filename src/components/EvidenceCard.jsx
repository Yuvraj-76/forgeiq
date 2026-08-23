import React, { useState } from 'react';
import {
  FileText,
  Database,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  ExternalLink,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { getSourceLabel, getValidationStatusBadge } from '../utils/confidence';

export const EvidenceCard = ({
  number = 1,
  attributeName,
  attributeValue,
  sourceType = 'manufacturer',
  sourceUrl = '',
  evidenceText,
  reasonText,
  confidence = 95,
  validationStatus = 'verified',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const sourceInfo = getSourceLabel(sourceType);
  const statusBadge = getValidationStatusBadge(validationStatus);
  const isNotFound = attributeValue === null || attributeValue === undefined || statusBadge.isNotFound;
  const isConflict = statusBadge.isConflict;

  return (
    <div
      id={`evidence-item-${number}`}
      className={`rounded-xl border bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all ${
        isConflict
          ? 'border-rose-300 ring-1 ring-rose-500/20'
          : isNotFound
          ? 'border-slate-200 opacity-90'
          : 'border-slate-200'
      }`}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              isConflict
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : isNotFound
                ? 'bg-slate-200 text-slate-600'
                : 'bg-indigo-100/70 border border-indigo-200 text-indigo-700'
            }`}
          >
            #{number}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {attributeName}
              </span>
              <span className="text-slate-400 font-mono text-xs">:</span>
              {isNotFound ? (
                <span className="text-slate-400 italic font-normal text-xs">— (Not Found)</span>
              ) : isConflict ? (
                <span className="text-rose-700 font-bold font-mono text-xs bg-rose-100 px-1.5 py-0.2 rounded">
                  {String(attributeValue)}
                </span>
              ) : (
                <span className="text-slate-800 font-bold font-mono text-xs">
                  {String(attributeValue)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${sourceInfo.badgeColor}`}>
                Source: {sourceInfo.label}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${statusBadge.badgeClass}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConfidenceBadge score={confidence} size="sm" />
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            aria-label="Toggle evidence details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 text-xs bg-white">
          {/* Ground Truth Snippet */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Ground Truth Reference Snippet
              </span>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>OEM Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="font-mono text-slate-800 font-medium bg-white p-2 rounded border border-slate-200 text-[11px] leading-relaxed">
              "{evidenceText || 'No verbatim source snippet available.'}"
            </p>
          </div>

          {/* AI Decision Rationale */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              AI Decision & Reasoning Rationale
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {reasonText || 'Derived through rule-based validation against manufacturer specifications.'}
            </p>
          </div>

          {/* Footer Validation Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {isConflict ? (
              <span className="flex items-center gap-1 text-rose-700 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Conflict Detected (Disagreement between sources)
              </span>
            ) : isNotFound ? (
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <HelpCircle className="w-3.5 h-3.5" /> Zero-Hallucination: Value unverified & marked Not Found
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Rule Validation: Verified against primary ground truth
              </span>
            )}
            <span className="text-slate-400 font-mono text-[10px]">Confidence: {confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceCard;
