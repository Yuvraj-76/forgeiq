import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  UploadCloud,
  Layers,
  GitFork,
  BarChart3,
  Settings,
  ShieldCheck,
  Zap,
  ChevronRight,
  Database,
  X,
} from 'lucide-react';
import { getApiConfig, setApiConfig } from '../services/api';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const apiConfig = getApiConfig();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { name: 'Product Enrichment', path: '/enrich', icon: Sparkles, highlight: true },
    { name: 'Bulk Upload', path: '/bulk-upload', icon: UploadCloud },
    { name: 'Catalog', path: '/catalog', icon: Layers },
    { name: 'Traceability', path: '/traceability', icon: GitFork, badge: 'AI Audit' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const toggleDemoMode = () => {
    setApiConfig({ isDemoMode: !apiConfig.isDemoMode });
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">CatalogAI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                Enrichment Engine
              </p>
            </div>
          </div>

          <button
            id="close-mobile-sidebar-btn"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Workflows
          </div>

          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer / Indicators */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          {/* Demo Mode Toggle Banner */}
          <div
            id="sidebar-demo-mode-indicator"
            onClick={toggleDemoMode}
            className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-all flex items-center justify-between"
            title="Click to toggle Demo Mode vs Live Backend"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  DEMO MODE ACTIVE
                </div>
                <div className="text-[10px] text-slate-400">Client-Side AI Engine</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/40">
              Ready
            </span>
          </div>

          {/* API Status */}
          <div className="px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Engine Pipeline:
            </span>
            <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 inline" /> 100% Operational
            </span>
          </div>

          {/* User Profile */}
          <div className="pt-1 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              SS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Satish Sahu</p>
              <p className="text-[10px] text-slate-400 truncate">Catalog Operations Lead</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
