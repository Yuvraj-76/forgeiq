import React, { useState } from 'react';
import { Sparkles, ShieldCheck, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { ProductInputForm } from '../components/ProductInputForm';
import { ProcessingSteps } from '../components/ProcessingSteps';
import { EnrichmentResult } from '../components/EnrichmentResult';
import { ReviewPanel } from '../components/ReviewPanel';
import { useEnrichment } from '../hooks/useEnrichment';

export const Enrichment = () => {
  const {
    product,
    isLoading,
    processingState,
    error,
    runEnrichment,
    selectedAttributeForReview,
    setSelectedAttributeForReview,
    handleReviewAttribute,
    activeTab,
    setActiveTab,
  } = useEnrichment();

  const handleFormSubmit = async (formData) => {
    await runEnrichment(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Product Data Enrichment Studio
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Input unstructured raw supplier records to extract standardized specifications, UNSPSC taxonomy, and marketplace-ready feature sets.
          </p>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Supplier Input Form & Pipeline Stepper */}
        <div className="lg:col-span-5 space-y-6">
          <ProductInputForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            processingState={processingState}
          />

          {/* Processing Animation during live generation */}
          {isLoading && processingState && (
            <ProcessingSteps processingState={processingState} />
          )}

          {/* Value proposition tip card */}
          {!isLoading && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100/80 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-2 font-bold text-indigo-950">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Zero Hallucination Guarantee</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                CatalogAI anchors every generated title, attribute, and UNSPSC category to extracted supplier tokens and verified OEM technical databases.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Enriched Product Result */}
        <div className="lg:col-span-7">
          {product ? (
            <EnrichmentResult
              product={product}
              onReviewAttribute={(attr) => setSelectedAttributeForReview(attr)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">Ready to Enrich</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter supplier information on the left and click "Generate Product Data".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Human Review Modal Dialog for editing / overriding attributes */}
      {selectedAttributeForReview && (
        <ReviewPanel
          attribute={selectedAttributeForReview}
          onClose={() => setSelectedAttributeForReview(null)}
          onSave={handleReviewAttribute}
        />
      )}
    </div>
  );
};

export default Enrichment;
