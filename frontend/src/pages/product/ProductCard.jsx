import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiStar, FiAward, FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product, addToCart, clickedButtonId }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-72 bg-gray-50 overflow-hidden">
        <motion.img 
          src={product.image || '/images/product-placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.4 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/product-placeholder.jpg';
          }}
        />
        
        {product.premium && (
          <div className="absolute top-4 left-4 flex items-center">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm">
              <FiAward className="text-amber-400 mr-1" size={14} />
              <span className="text-xs font-medium text-gray-800">Premium</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link to={`/products/${product.id}`} className="hover:underline">
              <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
            </Link>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${star <= product.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-teal-500 text-lg">€{product.price}</span>
          </div>
        </div>
        
        <motion.button 
          onClick={handleAddToCart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center justify-center gap-2 text-sm font-medium text-white py-3 px-4 rounded-xl transition-all duration-300 shadow-md ${
            clickedButtonId === product.id 
              ? 'bg-amber-400 ring-2 ring-amber-200 ring-offset-2'
              : 'bg-teal-500 hover:bg-teal-600'
          }`}
        >
          <AnimatePresence mode="wait">
            {clickedButtonId === product.id ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <FiShoppingCart size={16} />
                </motion.div>
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <FiShoppingCart size={16} />
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;