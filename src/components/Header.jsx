import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sparkles, UploadCloud, Search, HelpCircle, Bell } from 'lucide-react';

export const Header = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageContext = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return {
          title: 'Product Data Intelligence',
          subtitle: 'Transform supplier data into marketplace-ready product information.',
        };
      case '/enrich':
        return {
          title: 'Single SKU Enrichment Studio',
          subtitle: 'Generate enriched titles, standardized taxonomies, attributes & feature bullets.',
        };
      case '/bulk-upload':
        return {
          title: 'Bulk Product Enrichment',
          subtitle: 'Process entire supplier catalogs via CSV with real-time parsing & validation.',
        };
      case '/catalog':
        return {
          title: 'Standardized Product Catalog',
          subtitle: 'Filter, inspect, and export verified enriched products.',
        };
      case '/traceability':
        return {
          title: 'AI Decision Traceability & Audit Pipeline',
          subtitle: 'Transparent evidence chains, source attribution, and rule validations.',
        };
      case '/analytics':
        return {
          title: 'Catalog Data Quality Analytics',
          subtitle: 'Real-time metrics on confidence distributions, throughput, and error rates.',
        };
      case '/settings':
        return {
          title: 'System & Model Configurations',
          subtitle: 'Fine-tune AI model thresholds, retrieval knowledge bases, and API connections.',
        };
      default:
        if (location.pathname.startsWith('/product/')) {
          return {
            title: 'Product Catalog Details',
            subtitle: 'Detailed view of specifications, features, and traceability evidence.',
          };
        }
        return {
          title: 'CatalogAI Platform',
          subtitle: 'AI-Powered E-Commerce Data Enrichment',
        };
    }
  };

  const context = getPageContext();

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {context.title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{context.subtitle}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="header-bulk-cta-btn"
          onClick={() => navigate('/bulk-upload')}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
          Bulk Upload
        </button>

        <button
          id="header-enrich-cta-btn"
          onClick={() => navigate('/enrich')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Enrich Product</span>
        </button>

        {/* Demo Mode Pill */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          DEMO MODE
        </div>
      </div>
    </header>
  );
};

export default Header;
