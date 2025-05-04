import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const ProductSearch = ({ searchTerm, setSearchTerm, showSearch, setShowSearch }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowSearch(!showSearch)}
        className="flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-xl border border-gray-200 hover:border-teal-400 bg-white text-gray-700 transition-all duration-200 shadow-sm"
      >
        <FiSearch size={18} />
        <span>Search</span>
      </motion.button>
      
      {/* input */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 relative overflow-hidden"
          >
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center">
              <FiSearch className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-5 py-3.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all duration-200 shadow-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;