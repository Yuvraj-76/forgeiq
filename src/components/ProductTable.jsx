import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { formatDate } from '../utils/formatters';

export const ProductTable = ({
  products = [],
  onSelectProduct,
  showActions = true,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('processedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'confidence') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (product) => {
    const status = product.status || (product.confidence >= 70 ? 'Completed' : 'Needs Review');

    if (status === 'Completed' || status === 'High Confidence') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock className="w-3 h-3 animate-spin" /> Processing
        </span>
      );
    }
    if (status === 'Needs Review' || product.confidence < 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3 h-3" /> Needs Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading catalog items...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800">No products found</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try adjusting your search query, clearing filters, or uploading new supplier products.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th
                onClick={() => handleSort('productTitle')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Product Title & Part No.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('brand')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Brand</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th
                onClick={() => handleSort('confidence')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th
                onClick={() => handleSort('processedAt')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Processed At</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              {showActions && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {sortedProducts.map((p) => {
              const categoryStr = Array.isArray(p.category)
                ? p.category.slice(-2).join(' › ')
                : p.categoryPath || p.category || 'General Tools';

              return (
                <tr
                  key={p.id}
                  id={`product-row-${p.id}`}
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(p);
                    else navigate(`/product/${p.id}`);
                  }}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                >
                  {/* Product Title + Part */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {p.productTitle || `${p.brand} ${p.partNumber}`}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      SKU: <span className="font-semibold text-slate-700">{p.partNumber}</span>
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                      {p.brand}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600">
                    {categoryStr}
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 px-4">
                    <ConfidenceBadge score={p.confidence || 95} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(p)}</td>

                  {/* Processed At */}
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {formatDate(p.processedAt)}
                  </td>

                  {/* Action */}
                  {showActions && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        id={`view-product-btn-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${p.id}`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-white hover:bg-indigo-100 transition-all"
                        aria-label="View product details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
