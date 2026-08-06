import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchBar } from '../components/products/SearchBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Sparkles, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

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
        if (categoryParam) params.append('category', categoryParam);
        if (brandParam) params.append('brand', brandParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        if (sortParam) params.append('sort', sortParam);
        params.append('page', pageParam.toString());
        params.append('limit', '12');

        if (queryParam) {
          if (isVectorParam) {
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
            setMetadata({ page: 1, pages: 1, total: res.data.data.total });
          } else {
            setProducts(res.data.data.products);
            setMetadata({
              page: res.data.data.page,
              pages: res.data.data.pages,
              total: res.data.data.total,
            });
          }
        }
      } catch {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [queryParam, isVectorParam, categoryParam, brandParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  const handleSearch = (q: string, isV: boolean) => {
    const p = new URLSearchParams(searchParams);
    if (q) { p.set('search', q); p.set('isVector', isV.toString()); }
    else { p.delete('search'); p.delete('isVector'); }
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const handlePage = (num: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', num.toString());
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => setSearchParams({});

  const activeFilters = [
    categoryParam && { key: 'category', label: `Category: ${categoryParam}` },
    brandParam && { key: 'brand', label: `Brand: ${brandParam}` },
    minPriceParam && { key: 'minPrice', label: `Min: $${minPriceParam}` },
    maxPriceParam && { key: 'maxPrice', label: `Max: $${maxPriceParam}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const categories = ['Electronics', 'Shoes', 'Mobiles', 'Clothing', 'Accessories', 'Suitcases', 'Audio'];
  const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Zara', 'LG', 'Bose'];

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</h3>
        <button onClick={clearAll} className="text-xs text-accent hover:underline">Clear All</button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category</label>
        <select value={categoryParam} onChange={(e) => handleFilter('category', e.target.value)} className="select text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Brand</label>
        <select value={brandParam} onChange={(e) => handleFilter('brand', e.target.value)} className="select text-sm">
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Price Range</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minPriceParam} onChange={(e) => handleFilter('minPrice', e.target.value)} className="input text-sm" />
          <input type="number" placeholder="Max" value={maxPriceParam} onChange={(e) => handleFilter('maxPrice', e.target.value)} className="input text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Sort By</label>
        <select value={sortParam} onChange={(e) => handleFilter('sort', e.target.value)} className="select text-sm">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating_desc">Top Rated</option>
          <option value="name_asc">Name: A → Z</option>
        </select>
      </div>
    </div>
  );

  // Pagination with ellipsis
  const renderPagination = () => {
    if (metadata.pages <= 1) return null;
    const pages: (number | string)[] = [];
    const current = metadata.page;
    const total = Math.min(metadata.pages, 100);

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-10">
        <button onClick={() => handlePage(current - 1)} disabled={current === 1} className="btn btn-ghost btn-sm disabled:opacity-30">
          <ChevronLeft size={16} /> Prev
        </button>
        {pages.map((p, i) =>
          typeof p === 'string' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-text-muted">…</span>
          ) : (
            <button key={p} onClick={() => handlePage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === current ? 'bg-accent text-white' : 'hover:bg-bg-alt text-text-secondary'}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => handlePage(current + 1)} disabled={current === total} className="btn btn-ghost btn-sm disabled:opacity-30">
          Next <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link to="/" className="hover:text-text">Home</Link>
          <span>/</span>
          <span className="text-text font-medium">Shop</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Browse Products</h1>
        <SearchBar onSearch={handleSearch} initialQuery={queryParam} initialIsVector={isVectorParam} />

        {isVectorParam && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <Sparkles size={14} className="animate-pulse" /> AI Vector Search active — matching by concept
          </div>
        )}

        {/* Active Filter Pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span key={f.key} className="badge badge-accent flex items-center gap-1">
                {f.label}
                <button onClick={() => handleFilter(f.key, '')} className="hover:text-accent-hover"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn btn-secondary btn-sm mb-6 lg:hidden">
        <SlidersHorizontal size={16} /> Filters
      </button>

      <div className="flex gap-8">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 bg-black/30 lg:hidden" style={{ zIndex: 'var(--z-modal)' }} onClick={() => setFiltersOpen(false)}>
            <div className="absolute top-0 left-0 bottom-0 w-80 bg-surface p-6 shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="btn-icon"><X size={20} /></button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Products */}
        <section className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner count={12} />
          ) : products.length === 0 ? (
            <EmptyState type="search" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-text-secondary">{metadata.total.toLocaleString()} products found</p>
              </div>
              <ProductGrid products={products} />
              {!isVectorParam && renderPagination()}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
