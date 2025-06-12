// ProductGrid.js
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, addToCart, clickedButtonId }) => {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { 
      state: { product } 
    });
  };

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          whileHover={{ y: -5 }}
          className="relative cursor-pointer"
          onClick={() => handleProductClick(product)}
        >
          <ProductCard
            product={product}
            addToCart={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            clickedButtonId={clickedButtonId}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;