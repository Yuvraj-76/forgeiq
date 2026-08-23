import React, { useState } from 'react';
import { Check, Edit3, X, AlertTriangle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

export const ReviewPanel = ({ attribute, onClose, onSave }) => {
  const [editedValue, setEditedValue] = useState(attribute?.value || '');
  const [reviewerNote, setReviewerNote] = useState('');
  const [mode, setMode] = useState('review'); // 'review', 'edit'

  if (!attribute) return null;

  const handleAccept = () => {
    onSave(attribute.id, {
      value: editedValue,
      action: 'accept',
      reason: reviewerNote || `Accepted by human catalog reviewer. Verified against reference standards.`,
    });
  };

  const handleReject = () => {
    onSave(attribute.id, {
      value: 'N/A (Rejected)',
      action: 'reject',
      reason: reviewerNote || `Rejected by catalog reviewer due to low confidence and lack of supplier verification.`,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editedValue.trim()) return;
    onSave(attribute.id, {
      value: editedValue.trim(),
      action: 'edit',
      reason: reviewerNote || `Manually overridden and corrected by catalog specialist.`,
    });
  };

  return (
    <div
      id="human-review-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Human Review System</h3>
              <p className="text-xs text-slate-400">Review & override AI generated product attributes</p>
            </div>
          </div>
          <button
            id="close-review-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attribute</span>
              <ConfidenceBadge score={attribute.confidence} size="md" />
            </div>
            <div className="text-base font-bold text-slate-900">{attribute.name}</div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">AI Generated Proposal:</span>
              <div className="px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900">
                {attribute.value}
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-slate-700">Source:</span> {attribute.source}
              </div>
              <div>
                <span className="font-semibold text-slate-700">AI Rationale:</span> {attribute.reason}
              </div>
            </div>
          </div>

          {/* Manual edit form */}
          <div className="space-y-3">
            <label htmlFor="review-edited-value" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Override or Confirm Value
            </label>
            <input
              id="review-edited-value"
              type="text"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              placeholder="Enter verified attribute value"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <div>
              <label htmlFor="review-note" className="block text-xs font-semibold text-slate-600 mb-1">
                Audit Note / Verification Reason (Optional)
              </label>
              <input
                id="review-note"
                type="text"
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="e.g. Verified from OEM datasheet table 3"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            id="reject-attribute-btn"
            type="button"
            onClick={handleReject}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>✕ Reject</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="cancel-review-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="accept-override-btn"
              type="button"
              onClick={handleAccept}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>✓ Accept & Verify (100%)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;
