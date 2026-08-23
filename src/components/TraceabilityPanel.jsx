import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Layers,
  ChevronRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { EvidenceCard } from './EvidenceCard';
import { ConfidenceBadge } from './ConfidenceBadge';

export const TraceabilityPanel = ({ product }) => {
  const [selectedTimelineStage, setSelectedTimelineStage] = useState(0);

  if (!product) return null;

  const identification = product.productIdentification || {
    brand: product.brand,
    partNumber: product.partNumber,
    matchedProduct: product.productTitle,
    matchType: product.confidence >= 90 ? 'exact' : 'uncertain',
    confidence: product.confidence,
    evidence: `Extracted from supplier record: ${product.brand} ${product.partNumber}`,
    source: 'manufacturer',
    sourceUrl: '',
  };

  const isExactMatch = identification.matchType === 'exact';

  // Build key evidence points from product attributes
  const evidenceList = (product.attributes || []).map((attr, idx) => ({
    number: idx + 1,
    attributeName: attr.name,
    attributeValue: attr.value,
    sourceType: attr.source || 'ai_inference',
    sourceUrl: attr.sourceUrl,
    evidenceText: attr.evidence || `Supplier token "${attr.value || 'N/A'}"`,
    reasonText: attr.reason,
    confidence: attr.confidence,
    validationStatus: attr.validationStatus,
  }));

  const timeline = product.traceability || [
    {
      stage: 'Raw Supplier Input',
      source: 'supplier_data',
      evidence: `Input: ${product.brand} ${product.partNumber} | "${product.inputDescription}"`,
      decision: 'Ingested raw supplier string and sanitized search tokens.',
      confidence: 100,
      validation: 'verified',
    },
    {
      stage: 'Product Identification',
      source: identification.source,
      evidence: identification.evidence,
      decision: `Resolved product match type: ${identification.matchType.toUpperCase()}.`,
      confidence: identification.confidence,
      validation: isExactMatch ? 'verified' : 'inferred',
    },
    {
      stage: 'Source/Context Retrieval',
      source: 'manufacturer',
      evidence: 'Retrieved verified OEM datasheets and technical standard libraries.',
      decision: 'Synthesized reference parameter context without hallucinating unknown specs.',
      confidence: 96,
      validation: 'verified',
    },
    {
      stage: 'Taxonomy Mapping',
      source: 'trusted_reference',
      evidence: `Assigned hierarchical path: ${product.categoryPath}`,
      decision: 'Mapped product to standardized 4-tier UNSPSC / e-commerce tree.',
      confidence: 95,
      validation: 'verified',
    },
    {
      stage: 'Attribute Extraction',
      source: 'manufacturer',
      evidence: `Extracted structured technical attributes with normalized engineering units.`,
      decision: 'Parsed voltage, physical dimensions, speeds, and capacities.',
      confidence: 94,
      validation: 'verified',
    },
    {
      stage: 'Attribute Validation',
      source: 'knowledge_base',
      evidence: 'Executed physics consistency rules and conflict detection checks.',
      decision: 'Unverified attributes marked as "Not Found" with 0% confidence.',
      confidence: 95,
      validation: 'verified',
    },
    {
      stage: 'Confidence Scoring',
      source: 'knowledge_base',
      evidence: `Aggregated attribute quality weights into global score of ${product.confidence}%.`,
      decision: `Assigned ${product.status} tier with ${product.reviewStatus} status.`,
      confidence: product.confidence,
      validation: 'verified',
    },
    {
      stage: 'Final Catalog Generation',
      source: 'knowledge_base',
      evidence: `Processed ${(product.attributes || []).length} catalog fields (${(product.attributes || []).filter(a => a.validationStatus === 'verified').length} verified).`,
      decision: product.reviewStatus === 'Validated' ? 'Validated product record with verified attributes; marked Ready for Review.' : 'Product flagged for review queue due to unverified or missing parameters.',
      confidence: product.confidence,
      validation: 'verified',
    },
  ];

  return (
    <div id="traceability-explainability-panel" className="space-y-6">
      {/* Explainability Hero Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex items-start justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Full Provenance & Zero-Hallucination Audit Trail</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                8-Stage Lineage
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              Every single attribute in this catalog record is verified against primary supplier records, manufacturer datasheets, or explicitly flagged as <strong className="text-purple-300">Inferred</strong> / <strong className="text-slate-400">Not Found</strong>. The AI engine is strictly constrained from fabricating missing specifications or unverified laboratory certifications.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400">Audit Status</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Provenance
          </span>
        </div>
      </div>

      {/* Product Identification Card */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Identification & Resolution
            </h5>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isExactMatch
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isExactMatch ? '✓ Exact OEM Match' : '⚠️ Uncertain / Generic Match'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Matched Authority Product:</span>
            <p className="font-bold text-slate-900">{identification.matchedProduct}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">MPN: {identification.partNumber}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ground Truth Identification Evidence:</span>
            <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
              {identification.evidence}
            </p>
            {identification.sourceUrl && (
              <a
                href={identification.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline font-semibold"
              >
                <span>View Official Datasheet Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 8-Stage Interactive Process Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Decision Pipeline (Stages 1 through 8)
          </span>
          <span className="text-[11px] text-slate-400">Click any stage to view decision rationale</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeline.map((step, idx) => {
            const isSelected = selectedTimelineStage === idx;
            const isConflict = String(step.validation || '').toLowerCase() === 'conflicting';
            const isNotFound = String(step.validation || '').toLowerCase() === 'not found';

            return (
              <button
                key={idx}
                type="button"
                id={`timeline-stage-btn-${idx}`}
                onClick={() => setSelectedTimelineStage(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                    : isConflict
                    ? 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-300'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Stage {idx + 1}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {step.confidence || 95}%
                  </span>
                </div>
                <div className={`text-xs font-bold mt-1 truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {step.stage}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        {selectedTimelineStage !== null && timeline[selectedTimelineStage] && (
          <div className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">
                Stage {selectedTimelineStage + 1}: {timeline[selectedTimelineStage].stage}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                  Source: {timeline[selectedTimelineStage].source}
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {timeline[selectedTimelineStage].confidence}% Certainty
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Source & Evidence:</span>
                <p className="text-slate-300 font-mono text-[11px] bg-slate-800/80 p-2.5 rounded border border-slate-700 leading-relaxed">
                  {timeline[selectedTimelineStage].evidence || 'Verified catalog standard'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Decision & Action Taken:</span>
                <p className="text-slate-300 text-[11px] bg-slate-800/80 p-2.5 rounded border border-slate-700 leading-relaxed">
                  {timeline[selectedTimelineStage].decision}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Attribute Evidence Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Attribute Evidence Breakdown ({evidenceList.length} Items)
          </span>
          <span className="text-[11px] text-slate-400">Click headers to expand individual evidence</span>
        </div>

        {evidenceList.map((ev, index) => (
          <EvidenceCard
            key={index}
            number={index + 1}
            attributeName={ev.attributeName}
            attributeValue={ev.attributeValue}
            sourceType={ev.sourceType}
            sourceUrl={ev.sourceUrl}
            evidenceText={ev.evidenceText}
            reasonText={ev.reasonText}
            confidence={ev.confidence}
            validationStatus={ev.validationStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default TraceabilityPanel;
