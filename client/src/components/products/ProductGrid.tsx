import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onQuickView }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} onQuickView={onQuickView} />
      ))}
    </div>
  );
};

export default ProductGrid;
