import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProduct } from '../services/api';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    brand: 'All',
    category: 'All',
    confidence: 'All',
    status: 'All',
    ...initialFilters,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();

    const handleUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('catalogai_products_updated', handleUpdate);
    return () => window.removeEventListener('catalogai_products_updated', handleUpdate);
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      brand: 'All',
      category: 'All',
      confidence: 'All',
      status: 'All',
    });
  };

  return {
    products,
    loading,
    filters,
    updateFilter,
    resetFilters,
    refresh: fetchProducts,
  };
};
