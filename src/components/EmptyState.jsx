import React from 'react';
import { Sparkles, Layers, RefreshCw, FolderSearch } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records matching your current criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export const LoadingState = ({ message = 'Loading catalog intelligence...' }) => {
  return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-lg mx-auto my-8 space-y-4">
      <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm font-semibold text-slate-700">{message}</p>
    </div>
  );
};
