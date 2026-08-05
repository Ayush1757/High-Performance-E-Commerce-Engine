import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="product-grid-layout">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
export default ProductGrid;
