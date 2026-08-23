import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../components/FileUploader';
import { ProgressBar } from '../components/ProgressBar';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { uploadProducts } from '../services/api';
import {
  exportEnrichedProductsToCSV,
  exportEnrichedProductsToJSON,
  exportEnrichedProductsToXLSX,
} from '../utils/csvParser';
import { SAMPLE_SUPPLIER_INPUTS } from '../services/mockData';

export const BulkUpload = () => {
  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState(null);
  const [results, setResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleStartEnrichment = async () => {
    if (!parsedData || !parsedData.products || parsedData.products.length === 0) return;

    setIsProcessing(true);
    setResults(null);
    setProgressState({
      processedCount: 0,
      totalCount: parsedData.products.length,
      percentage: 0,
      currentStage: 'Parsing & Tokenizing',
    });

    try {
      const enrichedProducts = await uploadProducts(parsedData.products, (progress) => {
        let stage = 'Parsing';
        if (progress.percentage > 75) stage = 'Validating';
        else if (progress.percentage > 40) stage = 'Enriching';
        else if (progress.percentage > 15) stage = 'Identifying';

        setProgressState({
          ...progress,
          currentStage: stage,
        });
      });

      setResults(enrichedProducts);

      // Trigger celebratory confetti on completion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err) {
      console.error('Bulk enrichment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadDemoCSV = () => {
    const demoItems = [
      ...SAMPLE_SUPPLIER_INPUTS,
      { brand: 'Bosch', partNumber: 'GWS 750-100', shortDescription: '750w 4 inch angle grinder corded', badge: 'Power Tool' },
      { brand: 'Makita', partNumber: 'GA4530', shortDescription: '4.5 in small angle grinder 6.0A', badge: 'Grinder' },
      { brand: 'DeWalt', partNumber: 'DWE402', shortDescription: '4-1/2 inch 11-Amp paddle switch grinder', badge: 'Industrial' },
      { brand: 'Generic', partNumber: 'TMP-009', shortDescription: 'mini drill press benchtop 110v variable speed', badge: 'Review Item' },
    ].map((item, index) => ({
      id: `demo-${index + 1}`,
      rowNumber: index + 2,
      brand: item.brand,
      partNumber: item.partNumber,
      shortDescription: item.shortDescription,
      status: 'Pending',
    }));

    setParsedData({
      products: demoItems,
      totalRows: demoItems.length,
      validCount: demoItems.length,
      errorCount: 0,
      name: 'supplier_manifest_aug2026.csv',
      size: '2.4 KB',
    });
  };

  // Result metrics
  const processedCount = results ? results.length : 0;
  const successfullyEnriched = results ? results.filter((p) => p.confidence >= 70).length : 0;
  const needReviewCount = results ? results.filter((p) => p.confidence < 70).length : 0;
  const avgConfidence = results
    ? Math.round(results.reduce((acc, p) => acc + (p.confidence || 90), 0) / (results.length || 1))
    : 0;

  // Filtered results
  const filteredResults = (results || []).filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.productTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryPath?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Completed' && p.confidence >= 70) ||
      (statusFilter === 'Needs Review' && p.confidence < 70);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Bulk Product Enrichment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingest supplier spreadsheets to process dozens or thousands of products with automated taxonomy mapping and spec extraction.
          </p>
        </div>

        <button
          type="button"
          id="load-demo-csv-btn"
          onClick={handleLoadDemoCSV}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Load 11-Item Sample Catalog</span>
        </button>
      </div>

      {/* Upload and Configuration Phase */}
      {!results && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <FileUploader
              onFileParsed={(data) => setParsedData(data)}
              isProcessing={isProcessing}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Batch Execution Configuration
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Pipeline Model:</span>
                  <span className="font-bold text-slate-900">Gemini 2.5 Flash</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Taxonomy Standard:</span>
                  <span className="font-bold text-slate-900">UNSPSC / GS1 E-Comm</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Auto-Approval Threshold:</span>
                  <span className="font-bold text-emerald-600">≥ 70% Confidence</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Concurrency:</span>
                  <span className="font-bold text-slate-900">Adaptive Multi-Threaded</span>
                </div>
              </div>

              <button
                type="button"
                id="start-bulk-enrichment-btn"
                onClick={handleStartEnrichment}
                disabled={!parsedData || parsedData.products.length === 0 || isProcessing}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  !parsedData || parsedData.products.length === 0 || isProcessing
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-indigo-600/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Enrichment ({parsedData ? parsedData.validCount : 0} Products)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Processing State */}
      {isProcessing && progressState && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-md shadow-indigo-500/5 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                <h3 className="text-base font-bold text-slate-900">
                  Processing {progressState.processedCount} / {progressState.totalCount} Products
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Pipeline Stage: <span className="font-bold text-indigo-600">{progressState.currentStage}</span>
              </p>
            </div>
            <span className="text-sm font-extrabold text-indigo-600 font-mono">
              {progressState.percentage}%
            </span>
          </div>

          <ProgressBar progress={progressState.percentage} showLabel={false} color="indigo" height="h-3" />

          {/* Pipeline stages badges */}
          <div className="grid grid-cols-5 gap-2 pt-2 text-center text-xs">
            {['Parsing', 'Identifying', 'Enriching', 'Validating', 'Completed'].map((stage, idx) => (
              <div
                key={stage}
                className={`p-2 rounded-lg border font-semibold ${
                  stage === progressState.currentStage
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Results Summary & Table */}
      {results && !isProcessing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header completion card */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">Enrichment Complete</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Success
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Processed {processedCount} supplier products into normalized, marketplace-ready catalog items.
                  </p>
                </div>
              </div>

              {/* Action Download Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  id="bulk-download-enterprise-xlsx-btn"
                  onClick={() => exportEnrichedProductsToXLSX(results, `catalogai_enterprise_252_export_${Date.now()}.xlsx`, true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  id="bulk-download-enterprise-csv-btn"
                  onClick={() => exportEnrichedProductsToCSV(results, true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Enterprise CSV (252 Headers)</span>
                </button>

                <button
                  type="button"
                  id="bulk-download-standard-csv-btn"
                  onClick={() => exportEnrichedProductsToCSV(results, false)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Standard CSV</span>
                </button>

                <button
                  type="button"
                  id="bulk-download-json-btn"
                  onClick={() => exportEnrichedProductsToJSON(results)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  id="bulk-reset-upload-btn"
                  onClick={() => {
                    setResults(null);
                    setParsedData(null);
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-all cursor-pointer"
                >
                  New Upload
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Products Processed</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{processedCount}</div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Successfully Enriched</span>
                <div className="text-xl font-extrabold text-emerald-800 mt-1">{successfullyEnriched}</div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Need Review</span>
                <div className="text-xl font-extrabold text-amber-800 mt-1">{needReviewCount}</div>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Avg Confidence</span>
                <div className="text-xl font-extrabold text-indigo-800 mt-1">{avgConfidence}%</div>
              </div>
            </div>
          </div>

          {/* Search, Filter & Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by part number, brand, title..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                {['All', 'Completed', 'Needs Review'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Brand & Part Number</th>
                      <th className="py-3 px-4">Enriched Product Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredResults.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <div>{p.brand}</div>
                          <span className="text-[11px] text-slate-500 font-normal">{p.partNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-bold text-slate-900 line-clamp-1">{p.productTitle}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {p.attributes?.slice(0, 3).map((a) => `${a.name}: ${a.value}`).join(' • ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                          {Array.isArray(p.category) ? p.category.slice(-2).join(' › ') : p.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <ConfidenceBadge score={p.confidence || 92} size="sm" />
                        </td>
                        <td className="py-3.5 px-4">
                          {p.confidence >= 70 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> Needs Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${p.id}`);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
