import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, addToCart, clickedButtonId }) => {
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          addToCart={addToCart}
          clickedButtonId={clickedButtonId}
        />
      ))}
    </motion.div>
  );
};

export default ProductGrid;