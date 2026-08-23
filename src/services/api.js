/**
 * CatalogAI API Service
 * Built with Axios, designed for drop-in FastAPI / Node backend connectivity
 * with intelligent automatic fallback to realistic client-side mock engine.
 */

import axios from 'axios';
import { INITIAL_PRODUCTS, ANALYTICS_DATA } from './mockData';
import { enrichProductMock } from './mockAI';

// Backend configuration from local storage or environment
export const getApiConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : '';
  const savedUrl = localStorage.getItem('catalogai_api_url') || envUrl || 'http://localhost:8000/api/v1';
  const forceMock = localStorage.getItem('catalogai_force_mock') !== 'false'; // Default to demo mode
  return {
    baseUrl: savedUrl,
    isDemoMode: forceMock,
  };
};

export const setApiConfig = ({ baseUrl, isDemoMode }) => {
  if (baseUrl !== undefined) localStorage.setItem('catalogai_api_url', baseUrl);
  if (isDemoMode !== undefined) localStorage.setItem('catalogai_force_mock', isDemoMode ? 'true' : 'false');
};

const createAxiosClient = () => {
  const { baseUrl } = getApiConfig();
  return axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Local in-memory store for session persistence
let cachedProducts = [...INITIAL_PRODUCTS];

// Event listener helper for storage changes
const notifySubscribers = () => {
  window.dispatchEvent(new CustomEvent('catalogai_products_updated'));
};

/**
 * 1. enrichProduct(product, onStepProgress)
 * Enriches single supplier input
 */
export const enrichProduct = async (productData, onStepProgress = null) => {
  const { isDemoMode } = getApiConfig();
  const client = createAxiosClient();

  if (!isDemoMode) {
    try {
      const response = await client.post('/enrich', productData);
      if (response.data) {
        cachedProducts = [response.data, ...cachedProducts];
        notifySubscribers();
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API /enrich unavailable or error, falling back to mock engine:', error.message);
    }
  }

  // Use realistic mock engine
  const enriched = await enrichProductMock(productData, onStepProgress);
  cachedProducts = [enriched, ...cachedProducts.filter((p) => p.id !== enriched.id)];
  notifySubscribers();
  return enriched;
};

/**
 * 2. uploadProducts(file, onProgress)
 * Bulk upload and enrichment
 */
export const uploadProducts = async (productsList, onProgress = null) => {
  const { isDemoMode } = getApiConfig();
  const client = createAxiosClient();

  if (!isDemoMode) {
    try {
      const response = await client.post('/bulk-enrich', { products: productsList });
      if (response.data) {
        cachedProducts = [...response.data, ...cachedProducts];
        notifySubscribers();
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API /bulk-enrich unavailable, using client-side batch processing:', error.message);
    }
  }

  // Client-side batch processor with live progress
  const results = [];
  const total = productsList.length;

  for (let i = 0; i < total; i++) {
    const item = productsList[i];
    // Fast mock enrichment for batch items
    const enriched = await enrichProductMock({
      brand: item.brand,
      partNumber: item.partNumber,
      shortDescription: item.shortDescription,
    });
    enriched.id = `bulk-${Date.now()}-${i}`;
    results.push(enriched);

    if (onProgress) {
      onProgress({
        processedCount: i + 1,
        totalCount: total,
        currentProduct: enriched,
        percentage: Math.round(((i + 1) / total) * 100),
      });
    }
    // Small realistic delay between items
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  cachedProducts = [...results, ...cachedProducts];
  notifySubscribers();
  return results;
};

/**
 * 3. getProducts(filterOptions)
 */
export const getProducts = async (filters = {}) => {
  const { isDemoMode } = getApiConfig();
  const client = createAxiosClient();

  if (!isDemoMode) {
    try {
      const response = await client.get('/products', { params: filters });
      if (response.data) {
        cachedProducts = response.data;
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API /products unavailable, returning local cache:', error.message);
    }
  }

  // Client-side filtering
  let filtered = [...cachedProducts];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.productTitle?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.partNumber?.toLowerCase().includes(query) ||
        p.categoryPath?.toLowerCase().includes(query)
    );
  }

  if (filters.brand && filters.brand !== 'All') {
    filtered = filtered.filter((p) => p.brand?.toLowerCase() === filters.brand.toLowerCase());
  }

  if (filters.confidence && filters.confidence !== 'All') {
    if (filters.confidence === 'High') filtered = filtered.filter((p) => p.confidence >= 90);
    else if (filters.confidence === 'Medium') filtered = filtered.filter((p) => p.confidence >= 70 && p.confidence < 90);
    else if (filters.confidence === 'Low') filtered = filtered.filter((p) => p.confidence < 70);
  }

  if (filters.status && filters.status !== 'All') {
    filtered = filtered.filter((p) => p.status === filters.status || p.reviewStatus === filters.status);
  }

  return filtered;
};

/**
 * 4. getProduct(id)
 */
export const getProduct = async (id) => {
  const { isDemoMode } = getApiConfig();
  const client = createAxiosClient();

  if (!isDemoMode) {
    try {
      const response = await client.get(`/products/${id}`);
      if (response.data) return response.data;
    } catch (error) {
      console.warn('Backend API /products/:id unavailable, falling back to local cache:', error.message);
    }
  }

  const found = cachedProducts.find((p) => String(p.id) === String(id));
  if (found) return found;

  // Fallback to initial seed item 0
  return cachedProducts[0] || INITIAL_PRODUCTS[0];
};

/**
 * 5. updateProductAttribute(productId, attributeId, updatedData)
 * Human Review / Manual override update
 */
export const updateProductAttribute = async (productId, attributeId, updatedData) => {
  const prodIndex = cachedProducts.findIndex((p) => String(p.id) === String(productId));
  if (prodIndex === -1) return null;

  const product = cachedProducts[prodIndex];
  const attrIndex = (product.attributes || []).findIndex((a) => String(a.id) === String(attributeId));

  if (attrIndex !== -1) {
    const updatedAttributes = [...product.attributes];
    updatedAttributes[attrIndex] = {
      ...updatedAttributes[attrIndex],
      ...updatedData,
      source: 'manual_review',
      validationStatus: updatedData.action === 'reject' ? 'rejected' : 'verified_by_user',
      confidence: 100, // manual acceptance is 100% confidence
      reason: updatedData.reason || `Manually reviewed and approved by catalog specialist.`,
    };

    // Recalculate product overall confidence
    const confs = updatedAttributes.map((a) => a.confidence);
    const newAvg = Math.round(confs.reduce((acc, c) => acc + c, 0) / confs.length);

    const updatedProduct = {
      ...product,
      attributes: updatedAttributes,
      confidence: newAvg,
      status: newAvg >= 90 ? 'High Confidence' : newAvg >= 70 ? 'Medium Confidence' : 'Needs Review',
      reviewStatus: 'Approved',
    };

    cachedProducts[prodIndex] = updatedProduct;
    notifySubscribers();
    return updatedProduct;
  }

  return product;
};

/**
 * 6. getTraceability(id)
 */
export const getTraceability = async (id) => {
  const prod = await getProduct(id);
  return prod ? prod.traceability : [];
};

/**
 * 7. getAnalytics()
 */
export const getAnalytics = async (timeRange = '30 Days') => {
  const { isDemoMode } = getApiConfig();
  const client = createAxiosClient();

  if (!isDemoMode) {
    try {
      const response = await client.get('/analytics', { params: { range: timeRange } });
      if (response.data) return response.data;
    } catch (error) {
      console.warn('Backend API /analytics unavailable, returning mock analytics:', error.message);
    }
  }

  return ANALYTICS_DATA;
};
