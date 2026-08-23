import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
  Edit3,
  ExternalLink,
  BookOpen,
  Database,
  FileSpreadsheet,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { getProduct, updateProductAttribute } from '../services/api';
import { ConfidenceScore } from '../components/ConfidenceScore';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { AttributeTable } from '../components/AttributeTable';
import { FeatureList } from '../components/FeatureList';
import { TraceabilityPanel } from '../components/TraceabilityPanel';
import { ReviewPanel } from '../components/ReviewPanel';
import { LoadingState } from '../components/EmptyState';
import {
  exportEnrichedProductsToCSV,
  exportEnrichedProductsToJSON,
  exportEnrichedProductsToEnterpriseCSV,
  mapProductToEnterpriseRow,
  ENTERPRISE_CATALOG_HEADERS,
} from '../utils/csvParser';
import { formatDate } from '../utils/formatters';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'enterprise', 'specs', 'features', 'traceability', 'raw'
  const [selectedAttributeForReview, setSelectedAttributeForReview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const prod = await getProduct(id);
        setProduct(prod);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleReviewSave = async (attributeId, updatedData) => {
    if (!product) return;
    try {
      const updated = await updateProductAttribute(product.id, attributeId, updatedData);
      if (updated) {
        setProduct(updated);
        setSelectedAttributeForReview(null);
      }
    } catch (err) {
      console.error('Failed to update attribute:', err);
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(product, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingState message="Loading enriched product specifications..." />;
  if (!product) return <div className="p-8 text-center text-slate-500">Product not found.</div>;

  const categoryArray = Array.isArray(product.category)
    ? product.category
    : (product.categoryPath || '').split('>').map((c) => c.trim()).filter(Boolean);

  const enterpriseRow = mapProductToEnterpriseRow(product);
  const enterpriseEntries = Object.entries(enterpriseRow);
  const populatedCount = enterpriseEntries.filter(([k, v]) => v !== '' && v !== null && v !== undefined).length;

  const filteredEnterpriseEntries = enterpriseEntries.filter(([k, v]) => {
    if (!headerSearch) return true;
    const q = headerSearch.toLowerCase();
    return k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button & Breadcrumb header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          id="back-to-catalog-btn"
          onClick={() => navigate('/catalog')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJSON}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            id="export-single-enterprise-csv-btn"
            onClick={() => exportEnrichedProductsToEnterpriseCSV([product], `${product.brand}_${product.partNumber}_enterprise_252_headers.csv`)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 252-Header CSV</span>
          </button>
        </div>
      </div>

      {/* Main Product Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Category Breadcrumbs */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-slate-400 font-semibold">Catalog</span>
              {categoryArray.map((cat, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className={idx === categoryArray.length - 1 ? 'text-indigo-700 font-bold' : 'text-slate-600'}>
                    {cat}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* SKU and Brand badging */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                {product.brand}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                MPN: {product.partNumber}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                252 Headers Ready
              </span>
              <span className="text-xs text-slate-400">Enriched: {formatDate(product.processedAt)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.productTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {product.description || `High-performance ${product.productTitle} structured with verified attributes.`}
            </p>
          </div>

          <div className="shrink-0 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <ConfidenceScore score={product.confidence || 95} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'enterprise', name: `Enterprise Spec (252 Headers: ${populatedCount} Populated)` },
            { id: 'specs', name: `Specifications (${(product.attributes || []).length})` },
            { id: 'features', name: `Features (${(product.features || []).length})` },
            { id: 'traceability', name: 'Traceability & Audit' },
            { id: 'raw', name: 'Raw Input' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Key Specifications
                </h3>
                <AttributeTable
                  attributes={product.attributes}
                  onReviewAttribute={(attr) => setSelectedAttributeForReview(attr)}
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Product Value Highlights
                </h3>
                <FeatureList features={product.features} />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Enterprise Schema Compliance
                </h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700">Taxonomy Classpath:</span>
                    <p className="font-mono text-[11px] text-indigo-900">{enterpriseRow['Classpath'] || product.categoryPath}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700">Short Description (Retail/Web):</span>
                    <p className="text-slate-800">{enterpriseRow['SHORT_DESC']}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700">Invoice Description (ERP/POS):</span>
                    <p className="font-mono text-slate-900 font-bold">{enterpriseRow['INVOICE_DESC']}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      All 252 Headers Mapped
                    </span>
                    <p className="text-emerald-700">
                      Fully formatted with all Unilog/MDM attribute triplets, descriptions, and digital media records.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('enterprise')}
                  className="w-full py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Inspect All 252 Columns →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 252-Column Enterprise Master Grid */}
        {activeTab === 'enterprise' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  Enterprise 252-Column Master Specification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete Unilog/MDM export row structure with all 252 defined column headers.
                </p>
              </div>

              {/* Search headers */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Filter 252 headers & values..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Grid Table of all 252 columns */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3 font-bold text-slate-500 w-12 text-center">#</th>
                      <th className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Column Header</th>
                      <th className="py-2.5 px-4 font-bold text-slate-700">Enriched Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnterpriseEntries.map(([colName, colVal], idx) => {
                      const isFilled = colVal !== '' && colVal !== null && colVal !== undefined;
                      return (
                        <tr
                          key={colName}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isFilled ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-4 font-mono font-bold text-indigo-950 text-xs">
                            {colName}
                          </td>
                          <td className="py-2 px-4 text-slate-800 text-xs">
                            {isFilled ? (
                              <span className="font-medium text-slate-900 select-all">{String(colVal)}</span>
                            ) : (
                              <span className="text-slate-300 italic font-mono text-[11px]">-- empty --</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Complete Structured Specifications
            </h3>
            <AttributeTable
              attributes={product.attributes}
              onReviewAttribute={(attr) => setSelectedAttributeForReview(attr)}
            />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AI Generated Features
            </h3>
            <FeatureList features={product.features} />
          </div>
        )}

        {activeTab === 'traceability' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <TraceabilityPanel product={product} />
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Raw Supplier Feed Data
            </h3>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {JSON.stringify(
                {
                  brand: product.brand,
                  partNumber: product.partNumber,
                  inputDescription: product.inputDescription,
                  timestamp: product.processedAt,
                  extraMetadata: product.extraMetadata,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedAttributeForReview && (
        <ReviewPanel
          attribute={selectedAttributeForReview}
          onClose={() => setSelectedAttributeForReview(null)}
          onSave={handleReviewSave}
        />
      )}
    </div>
  );
};

export default ProductDetails;
