import React, { createContext, useState, useContext } from 'react';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);

  const addToCompare = (product: Product) => {
    if (compareList.length >= 4) {
      toast.error('You can compare at most 4 products at a time');
      return;
    }
    if (!isInCompare(product._id)) {
      setCompareList((prev) => [...prev, product]);
      toast.success(`${product.name} added to Compare list!`);
    } else {
      toast.error('Product already in compare list');
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p._id !== productId));
    toast.success('Removed from compare list');
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareList.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
