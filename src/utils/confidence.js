/**
 * Confidence calculation, validation status, and source formatting utilities
 * Strictly aligns with UniHack / Unilog Zero-Hallucination rules:
 * - Allowed sources: supplier_data, manufacturer, trusted_reference, knowledge_base, ai_inference, manual_review
 * - Validation statuses: verified, inferred, Not Found, conflicting, Needs Review
 */

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 90,
  MEDIUM: 70,
  LOW: 0,
};

export const getConfidenceLevel = (score) => {
  if (typeof score !== 'number') return { level: 'Unknown', variant: 'neutral', label: 'Unknown' };
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) {
    return {
      level: 'High',
      variant: 'success',
      label: 'High Confidence',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
      dotClass: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      bgClass: 'bg-emerald-500',
      colorHex: '#10b981',
      needsReview: false,
    };
  }
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return {
      level: 'Medium',
      variant: 'warning',
      label: 'Medium Confidence',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      bgClass: 'bg-amber-500',
      colorHex: '#f59e0b',
      needsReview: false,
    };
  }
  return {
    level: 'Low',
    variant: 'danger',
    label: 'Needs Review',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-700',
    bgClass: 'bg-rose-500',
    colorHex: '#f43f5e',
    needsReview: true,
  };
};

/**
 * Normalizes and formats attribute sources according to UniHack rules
 */
export const getSourceLabel = (sourceKey) => {
  const key = String(sourceKey || '').toLowerCase();

  switch (key) {
    case 'manufacturer':
      return {
        label: 'Manufacturer',
        icon: 'BookOpen',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'trusted_reference':
    case 'product_reference':
      return {
        label: 'Trusted Reference',
        icon: 'BookOpen',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    case 'supplier_data':
    case 'supplier_description':
      return {
        label: 'Supplier Data',
        icon: 'Database',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'knowledge_base':
      return {
        label: 'Knowledge Base',
        icon: 'Layers',
        badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      };
    case 'ai_inference':
      return {
        label: 'AI Inference',
        icon: 'Sparkles',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'manual_review':
      return {
        label: 'Human Verified',
        icon: 'UserCheck',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    default:
      return {
        label: sourceKey || 'AI Inference',
        icon: 'Sparkles',
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

/**
 * Returns badge and styling for validation statuses:
 * - verified
 * - inferred
 * - Not Found
 * - conflicting
 * - Needs Review
 */
export const getValidationStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();

  if (s === 'verified' || s === 'validated') {
    return {
      label: 'Verified',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      icon: 'CheckCircle2',
      isVerified: true,
    };
  }

  if (s === 'inferred') {
    return {
      label: 'Inferred',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      dotClass: 'bg-purple-500',
      icon: 'Sparkles',
      isInferred: true,
    };
  }

  if (s === 'not found' || s === 'not_found' || s === 'missing') {
    return {
      label: 'Not Found',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      dotClass: 'bg-slate-400',
      icon: 'HelpCircle',
      isNotFound: true,
    };
  }

  if (s === 'conflicting' || s === 'conflict') {
    return {
      label: 'Conflicting',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-500/20 font-bold',
      dotClass: 'bg-rose-500 animate-pulse',
      icon: 'AlertTriangle',
      isConflict: true,
    };
  }

  if (s === 'needs review' || s === 'needs_review' || s === 'warning') {
    return {
      label: 'Needs Review',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: 'AlertCircle',
      isWarning: true,
    };
  }

  return {
    label: status || 'Unverified',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
    icon: 'HelpCircle',
  };
};

/**
 * Calculates attribute confidence based strictly on evidence quality model:
 * - Official manufacturer source: 95–100
 * - Multiple trusted sources agree: 90–99
 * - One trusted reference source: 80–94
 * - Supplier-provided explicit value: 75–90
 * - AI inference without direct evidence: 40–69
 * - Unsupported/unknown: 0
 */
export const calculateAttributeConfidence = (sourceType, hasMultipleSources = false, isConflicting = false) => {
  if (isConflicting) return 45;

  const src = String(sourceType || '').toLowerCase();

  switch (src) {
    case 'manufacturer':
      return 98;
    case 'trusted_reference':
      return hasMultipleSources ? 95 : 88;
    case 'supplier_data':
    case 'supplier_description':
      return 85;
    case 'knowledge_base':
      return 92;
    case 'manual_review':
      return 100;
    case 'ai_inference':
      return 55;
    default:
      return 0;
  }
};
