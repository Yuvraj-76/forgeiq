import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  ShieldCheck,
} from 'lucide-react';
import { SAMPLE_SUPPLIER_INPUTS } from '../services/mockData';

export const ProductInputForm = ({ onSubmit, isLoading, processingState }) => {
  const [brand, setBrand] = useState('Bosch');
  const [partNumber, setPartNumber] = useState('GSR 120-LI');
  const [shortDescription, setShortDescription] = useState('12v drill driver cordless');
  const [activeSampleId, setActiveSampleId] = useState('test-a');

  const handleSelectSample = (sample) => {
    setBrand(sample.brand);
    setPartNumber(sample.partNumber);
    setShortDescription(sample.shortDescription);
    setActiveSampleId(sample.id);
  };

  const handleClear = () => {
    setBrand('');
    setPartNumber('');
    setShortDescription('');
    setActiveSampleId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brand.trim() && !partNumber.trim() && !shortDescription.trim()) return;
    onSubmit({ brand, partNumber, shortDescription });
  };

  const testCases = SAMPLE_SUPPLIER_INPUTS.slice(0, 3);
  const otherSamples = SAMPLE_SUPPLIER_INPUTS.slice(3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Raw Supplier Input</h3>
            <p className="text-xs text-slate-500">
              Provide unformatted supplier data or click one of the UniHack evaluation test cases below.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero-Hallucination Active
        </span>
      </div>

      {/* Mandatory UniHack Benchmark Test Cases */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>Mandatory Evaluation Test Cases (1-Click)</span>
          </span>
          <span className="text-[11px] text-slate-400">Evaluates ground truth vs hallucinations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {testCases.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            const isTestA = sample.id === 'test-a';
            const isTestB = sample.id === 'test-b';
            const isTestC = sample.id === 'test-c';

            return (
              <button
                key={sample.id}
                type="button"
                id={`sample-preset-btn-${sample.id}`}
                onClick={() => handleSelectSample(sample)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isTestC
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20'
                      : isTestB
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20'
                      : 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isTestA
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isTestB
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {sample.badge}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold">
                    {sample.partNumber}
                  </span>
                </div>

                <div className="mt-1.5 font-bold text-slate-900 text-xs">
                  {sample.brand} <span className="font-mono text-indigo-700">{sample.partNumber}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                  "{sample.shortDescription}"
                </p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic leading-tight">
                  {sample.scenario}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Other Real-World Benchmark Samples */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Other Catalog Benchmarks (Drills, Multimeters, Safety, Appliances)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {otherSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              id={`sample-preset-btn-${sample.id}`}
              onClick={() => handleSelectSample(sample)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                activeSampleId === sample.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {sample.brand} {sample.partNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brand <span className="text-rose-500">*</span>
            </label>
            <input
              id="brand-input"
              type="text"
              required
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setActiveSampleId(null);
              }}
              placeholder="e.g. Bosch, Makita, DeWalt, Unknown"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="part-number-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Part Number / MPN / SKU <span className="text-rose-500">*</span>
            </label>
            <input
              id="part-number-input"
              type="text"
              required
              value={partNumber}
              onChange={(e) => {
                setPartNumber(e.target.value);
                setActiveSampleId(null);
              }}
              placeholder="e.g. GSR 120-LI, ABC-123, DHP482"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label htmlFor="short-description-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Raw Supplier Short Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="short-description-input"
            required
            rows={3}
            value={shortDescription}
            onChange={(e) => {
              setShortDescription(e.target.value);
              setActiveSampleId(null);
            }}
            placeholder="e.g. 12v drill driver cordless, industrial tool, 18v cordless hammer drill"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 inline text-slate-400 shrink-0" />
            The engine tokenizes voltage, battery chemistry, speeds, and dimensions. Unverifiable specs will be recorded as "Not Found".
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            id="generate-product-data-btn"
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center cursor-pointer ${
              isLoading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-500/25 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Running Zero-Hallucination Pipeline...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>⚡ Run AI Enrichment & Verification</span>
              </div>
            )}
          </button>

          <button
            id="clear-input-btn"
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Clear</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductInputForm;
