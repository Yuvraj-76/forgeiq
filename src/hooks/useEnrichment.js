import { useState, useCallback } from 'react';
import { enrichProduct, updateProductAttribute } from '../services/api';
import { INITIAL_PRODUCTS } from '../services/mockData';

export const useEnrichment = () => {
  const [product, setProduct] = useState(INITIAL_PRODUCTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingState, setProcessingState] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAttributeForReview, setSelectedAttributeForReview] = useState(null);
  const [activeTab, setActiveTab] = useState('attributes'); // 'attributes', 'features', 'traceability', 'raw'

  const runEnrichment = useCallback(async ({ brand, partNumber, shortDescription }) => {
    setIsLoading(true);
    setError(null);
    setProcessingState({
      currentStep: 1,
      totalSteps: 7,
      stepName: 'Parsing supplier data',
      stepDetail: 'Tokenizing brand, model, SKU, and raw input text',
      progressPercent: 14,
    });

    try {
      const result = await enrichProduct(
        { brand, partNumber, shortDescription },
        (stepInfo) => {
          setProcessingState(stepInfo);
        }
      );
      setProduct(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to enrich product data. Please check inputs.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReviewAttribute = useCallback(async (attributeId, updatedData) => {
    if (!product) return;
    try {
      const updatedProduct = await updateProductAttribute(product.id, attributeId, updatedData);
      if (updatedProduct) {
        setProduct({ ...updatedProduct });
        setSelectedAttributeForReview(null);
      }
    } catch (err) {
      console.error('Failed to update attribute review:', err);
    }
  }, [product]);

  return {
    product,
    setProduct,
    isLoading,
    processingState,
    error,
    runEnrichment,
    selectedAttributeForReview,
    setSelectedAttributeForReview,
    handleReviewAttribute,
    activeTab,
    setActiveTab,
  };
};
