import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchBar } from '../components/products/SearchBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Sparkles, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({ page: 1, pages: 1, total: 0 });

  // Read search filters from URL
  const queryParam = searchParams.get('search') || '';
  const isVectorParam = searchParams.get('isVector') === 'true';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = '/products';
        const params = new URLSearchParams();

        // Populate params
        if (categoryParam) params.append('category', categoryParam);
        if (brandParam) params.append('brand', brandParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        if (sortParam) params.append('sort', sortParam);
        params.append('page', pageParam.toString());
        params.append('limit', '8');

        if (queryParam) {
          if (isVectorParam) {
            // Using AI Vector Search endpoint
            endpoint = '/search';
            params.append('q', queryParam);
          } else {
            params.append('search', queryParam);
          }
        }

        const res = await api.get(`${endpoint}?${params.toString()}`);
        if (res.data.success) {
          if (isVectorParam) {
            setProducts(res.data.data.results);
            setMetadata({
              page: 1,
              pages: 1,
              total: res.data.data.total,
            });
          } else {
            setProducts(res.data.data.products);
            setMetadata({
              page: res.data.data.page,
              pages: res.data.data.pages,
              total: res.data.data.total,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        toast.error('Failed to fetch catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    queryParam,
    isVectorParam,
    categoryParam,
    brandParam,
    minPriceParam,
    maxPriceParam,
    sortParam,
    pageParam,
  ]);

  const handleSearchTrigger = (q: string, isV: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (q) {
      newParams.set('search', q);
      newParams.set('isVector', isV.toString());
    } else {
      newParams.delete('search');
      newParams.delete('isVector');
    }
    newParams.set('page', '1'); // Reset pagination
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNum: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNum.toString());
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const categories = ['Electronics', 'Shoes', 'Mobiles', 'Clothing', 'Accessories'];
  const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Zara', 'Gucci', 'LG'];

  return (
    <div className="products-page-container">
      <div className="search-section-header">
        <h1 className="page-heading">Browse Store</h1>
        <SearchBar
          onSearch={handleSearchTrigger}
          initialQuery={queryParam}
          initialIsVector={isVectorParam}
        />
        {isVectorParam && (
          <div className="ai-mode-status-indicator">
            <Sparkles size={14} className="text-accent animate-pulse" />
            <span>AI Vector Search enabled: matches concepts and descriptions</span>
          </div>
        )}
      </div>

      <div className="catalog-layout">
        {/* Left Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-header-row">
            <h3>
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button onClick={clearAllFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="category-select">Category</label>
            <select
              id="category-select"
              value={categoryParam}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="brand-select">Brand</label>
            <select
              id="brand-select"
              value={brandParam}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range ($)</label>
            <div className="price-inputs-row">
              <input
                type="number"
                placeholder="Min"
                value={minPriceParam}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                aria-label="Minimum Price"
              />
              <ArrowLeftRight size={14} className="price-divider" />
              <input
                type="number"
                placeholder="Max"
                value={maxPriceParam}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                aria-label="Maximum Price"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">Sort By</label>
            <select
              id="sort-select"
              value={sortParam}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </aside>

        {/* Right side catalog contents */}
        <section className="catalog-products-results">
          {loading ? (
            <div className="center-loader-wrapper-large">
              <LoadingSpinner message="Searching AuraStore inventory..." />
            </div>
          ) : products.length === 0 ? (
            <EmptyState type="search" />
          ) : (
            <>
              <div className="results-count-row">
                <span className="results-total-text">Showing {metadata.total} products</span>
              </div>
              <ProductGrid products={products} />

              {/* Pagination controls */}
              {!isVectorParam && metadata.pages > 1 && (
                <div className="pagination-controls-row">
                  <button
                    disabled={pageParam === 1}
                    onClick={() => handlePageChange(pageParam - 1)}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  {Array.from({ length: metadata.pages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`pagination-btn pagination-num ${pNum === pageParam ? 'active' : ''}`}
                    >
                      {pNum}
                    </button>
                  ))}
                  <button
                    disabled={pageParam === metadata.pages}
                    onClick={() => handlePageChange(pageParam + 1)}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
export default ProductsPage;
