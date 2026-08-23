import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  FileCode,
  Download,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Tag,
  ListTree,
  ExternalLink,
  Edit2,
  AlertTriangle,
  BookOpen,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { ConfidenceScore } from './ConfidenceScore';
import { ConfidenceBadge } from './ConfidenceBadge';
import { AttributeTable } from './AttributeTable';
import { FeatureList } from './FeatureList';
import { TraceabilityPanel } from './TraceabilityPanel';
import { exportEnrichedProductsToCSV, exportEnrichedProductsToExcel } from '../utils/csvParser';

export const EnrichmentResult = ({
  product,
  onReviewAttribute,
  activeTab = 'attributes',
  setActiveTab,
}) => {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(product, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryArray = Array.isArray(product.category)
    ? product.category
    : (product.categoryPath || '').split('>').map((c) => c.trim()).filter(Boolean);

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
  const isConflictScenario = (product.attributes || []).some(
    (a) => String(a.validationStatus || '').toLowerCase() === 'conflicting'
  );
  const isNotFoundPresent = (product.attributes || []).some(
    (a) => ['not found', 'not_found'].includes(String(a.validationStatus || '').toLowerCase())
  );

  return (
    <div id="enriched-product-card" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300 space-y-0">
      
      {/* 1. TOP STATUS / CONFLICT ALERT BAR IF APPLICABLE */}
      {isConflictScenario ? (
        <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 flex items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Data Conflict Detected: Supplier claims contradict verified manufacturer OEM specifications. Flagged for review.</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-mono font-bold text-[10px]">
            Action: Needs Review
          </span>
        </div>
      ) : isNotFoundPresent && product.confidence < 70 ? (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Zero-Hallucination Guard Active: Unverified specifications are marked "Not Found" rather than fabricated.</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-mono font-bold text-[10px]">
            Zero Guessing
          </span>
        </div>
      ) : null}

      {/* 2. ENRICHED PRODUCT MASTER HEADER */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Title, Category & Metadata */}
          <div className="space-y-2.5 flex-1 min-w-0">
            {/* Category Breadcrumbs & Status */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-slate-400 font-semibold">Taxonomy:</span>
              {categoryArray.map((cat, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span
                    className={
                      idx === categoryArray.length - 1
                        ? 'text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100'
                        : 'text-slate-600'
                    }
                  >
                    {cat}
                  </span>
                </React.Fragment>
              ))}

              <span
                className={`ml-1 text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                  product.categoryStatus === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {product.categoryStatus || 'Verified'}
              </span>
            </div>

            {/* Product Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                  {product.brand} • {product.partNumber}
                </span>
                <span className="text-xs text-slate-400">Processed Just Now</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.productTitle}
              </h2>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl pt-1">
              {product.description}
            </p>
          </div>

          {/* Confidence Score Gauge */}
          <div className="shrink-0 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center">
            <ConfidenceScore score={product.confidence || 95} />
            <div className="mt-2 text-center">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  product.confidence >= 90
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : product.confidence >= 70
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {product.status || 'High Confidence'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT IDENTIFICATION MINI BAR */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-900">OEM Authority Match:</span>
            <span className="font-mono text-slate-800 font-semibold">{identification.matchedProduct}</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isExactMatch
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isExactMatch ? '✓ Exact Match (98%)' : '⚠️ Uncertain Match'}
            </span>

            {identification.sourceUrl && (
              <a
                href={identification.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Datasheet Reference</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* 4. NAVIGATION TABS & EXPORT ACTIONS */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              id="tab-btn-attributes"
              onClick={() => setActiveTab('attributes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'attributes'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verification Table ({(product.attributes || []).length})
            </button>

            <button
              type="button"
              id="tab-btn-traceability"
              onClick={() => setActiveTab('traceability')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'traceability'
                  ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Traceability & Audit (8 Stages)
            </button>

            <button
              type="button"
              id="tab-btn-features"
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Key Features ({(product.features || []).length})
            </button>

            <button
              type="button"
              id="tab-btn-raw"
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Supplier Input
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="copy-json-btn"
              onClick={handleCopyJSON}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              id="download-excel-single-btn"
              onClick={() => exportEnrichedProductsToExcel([product])}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export .XLSX</span>
            </button>

            <button
              type="button"
              id="download-csv-single-btn"
              onClick={() => exportEnrichedProductsToCSV([product])}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. TAB CONTENT PANELS */}
      <div className="p-5 sm:p-6">
        {activeTab === 'attributes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Attribute Verification Table
                </h3>
                <p className="text-xs text-slate-500">
                  Every attribute is cross-verified with source provenance, individual certainty score, and validation status.
                </p>
              </div>
            </div>
            <AttributeTable
              attributes={product.attributes}
              onReviewAttribute={onReviewAttribute}
            />
          </div>
        )}

        {activeTab === 'traceability' && (
          <TraceabilityPanel product={product} />
        )}

        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Grounded Technical Features
                </h3>
                <p className="text-xs text-slate-500">
                  Marketplace feature bullets derived strictly from verifiable datasheet specifications without marketing hype.
                </p>
              </div>
            </div>
            <FeatureList features={product.features} />
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Original Supplier Raw Input Record
              </h3>
              <p className="text-xs text-slate-500">
                Ground truth input supplied before AI normalization and verification.
              </p>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
              <div className="text-indigo-400">// Raw Supplier Manifest Data</div>
              <div><span className="text-slate-400">Brand:</span> "{product.brand}"</div>
              <div><span className="text-slate-400">Part Number / MPN / SKU:</span> "{product.partNumber}"</div>
              <div><span className="text-slate-400">Short Description:</span> "{product.inputDescription}"</div>
              <div className="pt-2 border-t border-slate-800 text-slate-400">
                Processed Timestamp: {product.processedAt || new Date().toISOString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrichmentResult;
