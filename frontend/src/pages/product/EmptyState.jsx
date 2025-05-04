import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const EmptyState = ({ onResetFilters }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white p-10 rounded-2xl border border-gray-100 text-center max-w-md mx-auto shadow-lg"
  >
    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <FiSearch className="text-teal-500 text-2xl" />
    </div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-3">No Products Found</h2>
    <p className="text-gray-500 mb-6">We couldn't find any items matching your criteria</p>
    <motion.button 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onResetFilters}
      className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md"
    >
      Reset All Filters
    </motion.button>
  </motion.div>
);

export default EmptyState;