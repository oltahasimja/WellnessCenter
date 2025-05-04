import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-white flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center"
    >
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiX className="text-red-500 text-3xl" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Error</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <motion.button 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRetry} 
        className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md"
      >
        Try Again
      </motion.button>
    </motion.div>
  </div>
);

export default ErrorState;