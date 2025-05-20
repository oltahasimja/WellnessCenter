import { FiShoppingCart, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import CartContext from '../../context/CartContext';

const ShoppingCart = () => {
  const { cart, setCart, showCart, setShowCart } = useContext(CartContext);

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {showCart && (
        <div className="fixed inset-0 z-50">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setShowCart(false)}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Your Cart ({cart.length})</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="h-[calc(100%-180px)] overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiShoppingCart className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500 mb-6">Your cart is empty</p>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCart(false)}
                    className="text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 py-3 px-8 rounded-xl transition-all duration-300 shadow-md"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-4 pb-6 border-b border-gray-100"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-800 font-medium">€{item.price}</p>
                        <div className="flex items-center mt-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                          >
                            -
                          </button>
                          <span className="w-10 h-8 border-t border-b border-gray-200 flex items-center justify-center text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-200 rounded-r-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <FiX size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-medium text-gray-800">Total:</span>
                  <span className="font-semibold text-gray-800 text-lg">€{cartTotal.toFixed(2)}</span>
                </div>
                <Link
                  to="/client-order-form"
                  state={{ cart }}
                  className="block w-full text-center py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;