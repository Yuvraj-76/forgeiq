import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Layers, Tag, ShieldCheck } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

export const ProductCard = ({ product, onSelect }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onSelect) onSelect(product);
    else navigate(`/product/${product.id}`);
  };

  const categoryStr = Array.isArray(product.category)
    ? product.category.slice(-2).join(' › ')
    : product.categoryPath || product.category || 'General';

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleClick}
      className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
            {product.brand}
          </span>
          <ConfidenceBadge score={product.confidence || 95} size="sm" />
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {product.productTitle || `${product.brand} ${product.partNumber}`}
        </h3>

        <div className="mt-2 text-xs text-slate-500 font-mono">
          SKU: <span className="font-semibold text-slate-700">{product.partNumber}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
          <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">{categoryStr}</span>
        </div>

        {/* Quick attributes pills */}
        {(product.attributes || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.attributes.slice(0, 3).map((attr, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600 font-medium"
              >
                {attr.name}: <strong className="text-slate-800">{attr.value}</strong>
              </span>
            ))}
            {product.attributes.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-semibold">
                +{product.attributes.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
        <span>Inspect Traceability & Specs</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};

export default ProductCard;
