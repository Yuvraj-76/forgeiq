import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Sparkles,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  FileSpreadsheet,
  FileCode,
  FileText,
} from 'lucide-react';
import { ProductTable } from '../components/ProductTable';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import {
  exportEnrichedProductsToCSV,
  exportEnrichedProductsToJSON,
  exportEnrichedProductsToEnterpriseCSV,
  exportEnrichedProductsToXLSX,
  downloadCSVFile,
  downloadEnterpriseTemplateXLSX,
  generateEnterpriseSampleCSVString,
} from '../utils/csvParser';

export const Catalog = () => {
  const navigate = useNavigate();
  const { products, loading, filters, updateFilter, resetFilters } = useProducts();
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid'
  const [showExportMenu, setShowExportMenu] = useState(false);

  const brandOptions = ['All', 'Bosch', 'Makita', 'DeWalt', 'Stanley', '3M', 'Milwaukee', 'Fluke', 'Frigidaire', 'Whirlpool'];
  const confidenceOptions = ['All', 'High', 'Medium', 'Low'];
  const statusOptions = ['All', 'Completed', 'Needs Review'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Standardized Product Catalog
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, inspect, and export your entire repository of AI-enriched product specifications matching all 252 enterprise headers.
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              id="catalog-export-menu-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export Catalog</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <div
                id="export-dropdown-panel"
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Export Options
                </div>

                <button
                  type="button"
                  id="export-enterprise-xlsx-btn"
                  onClick={() => {
                    exportEnrichedProductsToXLSX(products, `catalogai_enterprise_252_catalog_${Date.now()}.xlsx`, true);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50/70 text-xs text-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Enterprise Master Excel (.xlsx)</div>
                    <div className="text-[10px] text-slate-500">All 252 headers in Microsoft Excel format</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="export-enterprise-csv-btn"
                  onClick={() => {
                    exportEnrichedProductsToEnterpriseCSV(products);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50/70 text-xs text-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Enterprise Master CSV</div>
                    <div className="text-[10px] text-slate-500">All 252 headers (Unilog / MDM CSV)</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="export-standard-csv-btn"
                  onClick={() => {
                    exportEnrichedProductsToCSV(products, false);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs text-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Standard CSV</div>
                    <div className="text-[10px] text-slate-500">Compact flattened specifications</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="export-json-btn"
                  onClick={() => {
                    exportEnrichedProductsToJSON(products);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs text-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">JSON Format</div>
                    <div className="text-[10px] text-slate-500">Nested developer data model</div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  id="download-template-xlsx-btn"
                  onClick={() => {
                    downloadEnterpriseTemplateXLSX('catalogai_252_headers_sample_template.xlsx');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50/70 text-xs text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-900">Download Excel (.xlsx) Template</div>
                    <div className="text-[10px] text-emerald-600">252-Column pre-formatted Excel workbook</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="download-template-csv-btn"
                  onClick={() => {
                    const templateContent = generateEnterpriseSampleCSVString();
                    downloadCSVFile(templateContent, 'catalogai_252_headers_sample_template.csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50/70 text-xs text-indigo-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-bold text-indigo-900">Download CSV Template</div>
                    <div className="text-[10px] text-indigo-600">252-Column CSV format</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            id="catalog-enrich-cta-btn"
            onClick={() => navigate('/enrich')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enrich SKU</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="catalog-search-input"
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by product name, part number or brand..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-2">
            {/* Brand filter */}
            <select
              id="brand-filter-select"
              value={filters.brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              {brandOptions.map((b) => (
                <option key={b} value={b}>
                  Brand: {b}
                </option>
              ))}
            </select>

            {/* Confidence filter */}
            <select
              id="confidence-filter-select"
              value={filters.confidence}
              onChange={(e) => updateFilter('confidence', e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              {confidenceOptions.map((c) => (
                <option key={c} value={c}>
                  Confidence: {c}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              id="status-filter-select"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            {/* Reset filters */}
            {(filters.search || filters.brand !== 'All' || filters.confidence !== 'All' || filters.status !== 'All') && (
              <button
                type="button"
                id="reset-filters-btn"
                onClick={resetFilters}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle (Table / Grid) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end md:self-auto">
            <button
              type="button"
              id="view-mode-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="view-mode-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Display Area */}
      {viewMode === 'table' ? (
        <ProductTable
          products={products}
          isLoading={loading}
          onSelectProduct={(p) => navigate(`/product/${p.id}`)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
