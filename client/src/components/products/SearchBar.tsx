import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string, isVector: boolean) => void;
  placeholder?: string;
  initialQuery?: string;
  initialIsVector?: boolean;
  large?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search products, brands, categories...',
  initialQuery = '',
  initialIsVector = false,
  large = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isVector, setIsVector] = useState(initialIsVector);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2 || isVector) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await api.get(`/search/suggest?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch {
        // silently ignore suggestion errors
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, isVector]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query, isVector);
  };

  const handleSuggestionClick = (productName: string) => {
    setQuery(productName);
    setShowSuggestions(false);
    onSearch(productName, false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 bg-surface border rounded-xl transition-all duration-200 ${
          large ? 'p-2 border-border shadow-md focus-within:shadow-lg focus-within:border-accent' : 'p-1.5 border-border focus-within:border-accent'
        }`}
      >
        <div className="flex items-center pl-3 text-text-muted">
          <Search size={large ? 20 : 18} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={isVector ? 'Ask AI: "cozy winter hoodie" or "noise canceling headphones"' : placeholder}
          className={`flex-1 bg-transparent outline-none text-text placeholder-text-muted ${large ? 'text-base py-2' : 'text-sm py-1'}`}
        />

        {query && (
          <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="text-text-muted hover:text-text p-1">
            <X size={16} />
          </button>
        )}

        {/* AI Toggle */}
        <button
          type="button"
          onClick={() => { setIsVector(!isVector); setShowSuggestions(false); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            isVector
              ? 'bg-accent text-white shadow-sm'
              : 'bg-bg-alt text-text-secondary hover:bg-border'
          }`}
        >
          <Sparkles size={14} className={isVector ? 'animate-pulse' : ''} />
          {isVector ? 'AI' : 'AI'}
        </button>

        <button
          type="submit"
          className={`btn btn-primary shrink-0 ${large ? '' : 'btn-sm'}`}
        >
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
            style={{ zIndex: 'var(--z-dropdown)' }}
          >
            {suggestions.map((catGroup: any) => (
              <div key={catGroup.category}>
                <div className="px-4 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-bg-alt">{catGroup.category}</div>
                {catGroup.products.map((prod: any) => (
                  <button
                    key={prod._id}
                    type="button"
                    onClick={() => handleSuggestionClick(prod.name)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-bg-alt transition-colors"
                  >
                    <span className="text-text truncate mr-4">{prod.name}</span>
                    <span className="text-accent font-semibold shrink-0">${prod.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
