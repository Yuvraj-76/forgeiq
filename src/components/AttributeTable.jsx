import React, { useState } from 'react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { getSourceLabel, getValidationStatusBadge } from '../utils/confidence';
import {
  Edit3,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
} from 'lucide-react';

export const AttributeTable = ({ attributes = [], onReviewAttribute }) => {
  const [expandedAttrId, setExpandedAttrId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'inferred', 'not_found', 'conflicting'
  const [searchQuery, setSearchQuery] = useState('');

  if (!attributes || attributes.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
        No attributes extracted yet. Run the AI Enrichment Pipeline to generate verified specifications.
      </div>
    );
  }

  const filteredAttributes = attributes.filter((attr) => {
    const status = String(attr.validationStatus || '').toLowerCase();
    if (filter === 'verified' && status !== 'verified' && status !== 'validated') return false;
    if (filter === 'inferred' && status !== 'inferred') return false;
    if (filter === 'not_found' && status !== 'not found' && status !== 'not_found') return false;
    if (filter === 'conflicting' && status !== 'conflicting' && status !== 'conflict') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (attr.name || '').toLowerCase().includes(q);
      const matchVal = String(attr.value || '').toLowerCase().includes(q);
      const matchReason = (attr.reason || '').toLowerCase().includes(q);
      return matchName || matchVal || matchReason;
    }
    return true;
  });

  const counts = {
    all: attributes.length,
    verified: attributes.filter((a) => ['verified', 'validated'].includes(String(a.validationStatus || '').toLowerCase())).length,
    inferred: attributes.filter((a) => String(a.validationStatus || '').toLowerCase() === 'inferred').length,
    not_found: attributes.filter((a) => ['not found', 'not_found'].includes(String(a.validationStatus || '').toLowerCase())).length,
    conflicting: attributes.filter((a) => ['conflicting', 'conflict'].includes(String(a.validationStatus || '').toLowerCase())).length,
  };

  return (
    <div id="structured-attributes-table-container" className="space-y-4">
      {/* Filter Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="filter-all-attrs-btn"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            id="filter-verified-attrs-btn"
            onClick={() => setFilter('verified')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'verified'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Verified ({counts.verified})
          </button>
          {counts.inferred > 0 && (
            <button
              type="button"
              id="filter-inferred-attrs-btn"
              onClick={() => setFilter('inferred')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'inferred'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Inferred ({counts.inferred})
            </button>
          )}
          {counts.conflicting > 0 && (
            <button
              type="button"
              id="filter-conflicting-attrs-btn"
              onClick={() => setFilter('conflicting')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'conflicting'
                  ? 'bg-rose-600 text-white shadow-2xs animate-pulse'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              ⚠️ Conflicting ({counts.conflicting})
            </button>
          )}
          {counts.not_found > 0 && (
            <button
              type="button"
              id="filter-notfound-attrs-btn"
              onClick={() => setFilter('not_found')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'not_found'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Not Found ({counts.not_found})
            </button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attributes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Main Spec Verification Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-1/4">Attribute</th>
              <th className="py-3 px-4 w-1/4">Value</th>
              <th className="py-3 px-4 w-1/6">Source</th>
              <th className="py-3 px-3 w-28 text-center">Confidence</th>
              <th className="py-3 px-4 w-1/6">Status</th>
              <th className="py-3 px-3 w-12 text-center">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAttributes.map((attr) => {
              const sourceInfo = getSourceLabel(attr.source);
              const statusBadge = getValidationStatusBadge(attr.validationStatus);
              const isExpanded = expandedAttrId === (attr.id || attr.name);
              const isNotFound = attr.value === null || attr.value === undefined || statusBadge.isNotFound;
              const isConflict = statusBadge.isConflict;

              return (
                <React.Fragment key={attr.id || attr.name}>
                  <tr
                    id={`attr-row-${(attr.name || '').toLowerCase().replace(/\s+/g, '-')}`}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isConflict ? 'bg-rose-50/40' : isNotFound ? 'bg-slate-50/30' : ''
                    }`}
                  >
                    {/* Attribute Name */}
                    <td className="py-3 px-4 font-bold text-slate-800 align-top">
                      <div className="flex items-center gap-1.5">
                        <span>{attr.name}</span>
                        {isConflict && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4 font-mono align-top font-semibold">
                      {isNotFound ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 italic text-[11px] font-normal">
                          <HelpCircle className="w-3.5 h-3.5" /> — (Not Found)
                        </span>
                      ) : isConflict ? (
                        <span className="text-rose-700 font-bold bg-rose-100/70 px-2 py-0.5 rounded border border-rose-200 inline-block">
                          {String(attr.value)}
                        </span>
                      ) : (
                        <span className="text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                          {String(attr.value)}
                        </span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 align-top">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${sourceInfo.badgeColor}`}>
                        {sourceInfo.label}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3 text-center align-top">
                      <ConfidenceBadge score={attr.confidence} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 align-top">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${statusBadge.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Toggle Audit / Details */}
                    <td className="py-3 px-3 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          id={`toggle-audit-btn-${(attr.name || '').toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => setExpandedAttrId(isExpanded ? null : (attr.id || attr.name))}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Inspect Evidence & Rationale"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Traceability Sub-Row */}
                  {isExpanded && (
                    <tr className="bg-indigo-50/40 border-y border-indigo-100">
                      <td colSpan={6} className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Evidence Snippet */}
                          <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Ground Truth Evidence
                              </span>
                              {attr.sourceUrl && (
                                <a
                                  href={attr.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  <span>OEM Reference</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px] leading-relaxed">
                              {attr.evidence ? `"${attr.evidence}"` : 'No explicit raw snippet provided.'}
                            </p>
                          </div>

                          {/* AI Decision Rationale */}
                          <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                              Decision & Reasoning Logic
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                              {attr.reason || 'Synthesized according to catalog taxonomy and verified manufacturer constraints.'}
                            </p>

                            {onReviewAttribute && (
                              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => onReviewAttribute(attr)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Manual Override / Edit</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttributeTable;
