import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-teal-700 py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Wellness Journey?</h2>
        <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
          Join our community today and experience the benefits of our expert-led classes and programs.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }} 
          className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-bold transition-colors"
        >
          Sign Up Now
        </motion.button>
      </div>
    </motion.footer>
  );
};

export default Footer;