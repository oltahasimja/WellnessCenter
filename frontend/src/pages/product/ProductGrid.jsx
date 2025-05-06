import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, addToCart, clickedButtonId }) => {
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products.map(product => (
        <Link 
          to={`/product/${encodeURIComponent(product.name)}`}
          state={{ productData: product }}
          key={product.id}
          className="block" // Ensure Link takes full width/height
        >
          <ProductCard 
            product={product}
            addToCart={(e) => {
              e.preventDefault(); // Prevent navigation when clicking add to cart
              addToCart(product);
            }}
            clickedButtonId={clickedButtonId}
          />
        </Link>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
