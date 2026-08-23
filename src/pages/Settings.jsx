import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Sliders,
  Database,
  Globe,
  CheckCircle2,
  Save,
  Server,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { getApiConfig, setApiConfig } from '../services/api';

export const Settings = () => {
  const currentConfig = getApiConfig();
  const [model, setModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.2);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [enableExternalSearch, setEnableExternalSearch] = useState(true);
  const [enableKnowledgeBase, setEnableKnowledgeBase] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState('JSON');
  const [apiUrl, setApiUrl] = useState(currentConfig.baseUrl);
  const [isDemoMode, setIsDemoMode] = useState(currentConfig.isDemoMode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setApiConfig({
      baseUrl: apiUrl,
      isDemoMode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setModel('gemini-2.5-flash');
    setTemperature(0.2);
    setConfidenceThreshold(70);
    setEnableExternalSearch(true);
    setEnableKnowledgeBase(true);
    setDefaultFormat('JSON');
    setApiUrl('http://localhost:8000/api/v1');
    setIsDemoMode(true);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          System & Engine Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure AI enrichment parameters, taxonomy matching thresholds, knowledge bases, and backend connectivity.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully! Parameters applied to catalog engine.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Engine Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Model Configuration</h3>
              <p className="text-xs text-slate-500">Fine-tune Google Gemini inference behavior</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="model-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Foundation Model
              </label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Fast & Accurate)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Technical Reasoning)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="temp-range" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Temperature ({temperature})
                </label>
                <span className="text-[11px] text-slate-400">Strict & Deterministic</span>
              </div>
              <input
                id="temp-range"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.0 (Zero hallucination)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="confidence-threshold-range" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Human Review Trigger Threshold ({confidenceThreshold}%)
                </label>
                <span className="text-[11px] font-bold text-amber-600">
                  Attributes &lt; {confidenceThreshold}% require approval
                </span>
              </div>
              <input
                id="confidence-threshold-range"
                type="range"
                min="50"
                max="90"
                step="1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Catalog fields generated with certainty below this threshold are automatically routed to the Human Review Queue.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Retrieval & Context Augmentation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Retrieval Augmented Context (RAG)</h3>
              <p className="text-xs text-slate-500">Connect verified external databases & datasheets</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <div className="text-sm font-bold text-slate-900">Enable Product Knowledge Base</div>
                <div className="text-xs text-slate-500">Cross-reference GTIN/SKU with verified OEM catalog datasheet index</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableKnowledgeBase}
                  onChange={(e) => setEnableKnowledgeBase(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <div className="text-sm font-bold text-slate-900">Enable External Context Retrieval</div>
                <div className="text-xs text-slate-500">Fetch live public datasheet references for unindexed vendor SKUs</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableExternalSearch}
                  onChange={(e) => setEnableExternalSearch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: API & Connectivity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend API Connectivity</h3>
              <p className="text-xs text-slate-500">Connect to Python / FastAPI backend or run in Client-Side Demo Mode</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Engine Operational Mode</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDemoMode
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isDemoMode ? 'DEMO MODE (Client AI Mock)' : 'LIVE FASTAPI BACKEND'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Demo Mode enables full interactive hackathon evaluation with instant enrichment responses.
                </p>
              </div>

              <button
                type="button"
                id="toggle-demo-mode-btn"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
              >
                {isDemoMode ? 'Switch to Live API' : 'Switch to Demo Mode'}
              </button>
            </div>

            <div>
              <label htmlFor="backend-url-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                FastAPI Backend Endpoint URL
              </label>
              <input
                id="backend-url-input"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If the backend server is offline or unreachable, the frontend seamlessly fails over to the client mock engine.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Export Format */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Default Catalog Export Format
          </h3>
          <div className="flex items-center gap-3">
            {['JSON', 'CSV'].map((format) => (
              <label
                key={format}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  defaultFormat === format
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="defaultFormat"
                  value={format}
                  checked={defaultFormat === format}
                  onChange={(e) => setDefaultFormat(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>{format} (Standard)</span>
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Values</span>
          </button>

          <button
            type="submit"
            id="save-settings-btn"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
