import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, addToCart, clickedButtonId }) => {
 
  const handleAddToCart = (e, product) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    addToCart(product);
  };

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products.map(product => (
        <Link 
          to={`/product/${product.productName}`} 
          state={{ product }} 
          key={product.id}
          className="block hover:no-underline" 
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
           <ProductCard 
            product={product}
            addToCart={addToCart}
            clickedButtonId={clickedButtonId}
          />

          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
};

export default ProductGrid;