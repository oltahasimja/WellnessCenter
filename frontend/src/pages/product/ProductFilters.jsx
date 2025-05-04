import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const ProductFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  ratingFilter,
  setRatingFilter
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
    >
      <h3 className="font-medium text-gray-800 text-lg mb-6">Customize Your Preferences</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'All' ? 'All Categories' : category}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* price range */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
          <div className="space-y-4">
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>€{priceRange[0]}</span>
                <span>€{priceRange[1]}</span>
              </div>
            </div>   
          </div>
        </div>
        
        {/* ratings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2].map(rating => (
              <motion.button
                key={rating}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  ratingFilter === rating
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FiStar
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} ${
                        ratingFilter === rating ? 'text-white fill-white' : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">{rating}+ Stars</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductFilters;