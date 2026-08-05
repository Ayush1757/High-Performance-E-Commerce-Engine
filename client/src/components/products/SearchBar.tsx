import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import api from '../../api';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string, isVector: boolean) => void;
  placeholder?: string;
  initialQuery?: string;
  initialIsVector?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search products...',
  initialQuery = '',
  initialIsVector = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isVector, setIsVector] = useState(initialIsVector);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when debouncedQuery changes
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
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
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

  const handleToggleMode = () => {
    const nextMode = !isVector;
    setIsVector(nextMode);
    setShowSuggestions(false);
    onSearch(query, nextMode);
  };

  return (
    <div className="search-bar-outer-wrapper" ref={containerRef}>
      <form onSubmit={handleSubmit} className={`search-bar-form ${isVector ? 'vector-mode-active' : ''}`}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={isVector ? 'Ask AI: "cozy winter hoodie" or "noise canceling headphones"' : placeholder}
            className="search-input-field"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown-card">
              {suggestions.map((catGroup: any) => (
                <div key={catGroup.category} className="suggestion-category-group">
                  <span className="suggestion-category-title">{catGroup.category}</span>
                  {catGroup.products.map((prod: any) => (
                    <button
                      key={prod._id}
                      type="button"
                      onClick={() => handleSuggestionClick(prod.name)}
                      className="suggestion-item-btn"
                    >
                      <span className="suggested-name">{prod.name}</span>
                      <span className="suggested-price">${prod.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleMode}
          className={`search-mode-toggle-btn ${isVector ? 'active' : ''}`}
          title={isVector ? 'Switch to Keyword Search' : 'Switch to AI Vector Search'}
        >
          <Sparkles size={16} className={isVector ? 'animate-pulse' : ''} />
          <span className="mode-label-text">{isVector ? 'AI Search' : 'Regular'}</span>
        </button>

        <button type="submit" className="search-submit-action-btn">
          <Search size={18} />
        </button>
      </form>
    </div>
  );
};
export default SearchBar;
