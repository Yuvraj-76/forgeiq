import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { ENRICHMENT_PROCESSING_STEPS } from '../services/mockAI';

export const ProcessingSteps = ({ processingState }) => {
  const currentStepNum = processingState?.currentStep || 1;
  const currentStepDetail = processingState?.stepDetail || 'Processing supplier data...';

  return (
    <div
      id="processing-pipeline-card"
      className="bg-white rounded-2xl border border-indigo-200/80 p-6 shadow-md shadow-indigo-500/5 animate-in fade-in duration-300"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">AI Catalog Processing Engine</h4>
            <p className="text-xs text-indigo-600 font-medium">{currentStepDetail}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
          Step {currentStepNum} of {ENRICHMENT_PROCESSING_STEPS.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {ENRICHMENT_PROCESSING_STEPS.map((step) => {
          const isDone = step.id < currentStepNum;
          const isCurrent = step.id === currentStepNum;
          const isPending = step.id > currentStepNum;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                  : isDone
                  ? 'bg-emerald-50/30 border-emerald-200/60 text-slate-700'
                  : 'bg-slate-50/30 border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {step.id}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-indigo-900' : isDone ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.id}. {step.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-semibold text-emerald-600">Verified ✓</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingSteps;
