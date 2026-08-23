/**
 * Formatting helpers for currency, dates, numbers, categories
 */

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercent = (val) => {
  if (val === null || val === undefined) return '0%';
  return `${Number(val).toFixed(1)}%`;
};

export const categoryBreadcrumbString = (categories) => {
  if (!categories || !Array.isArray(categories)) return '';
  return categories.join(' › ');
};
