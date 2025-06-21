import { FiShoppingCart, FiX, FiPackage } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';

const ShoppingCart = () => {
  const { cart, setCart, showCart, setShowCart } = useContext(CartContext);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  // Check for current user on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
  }, []);

  const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || !user.id) return;

    try {
      const res = await fetch(`http://localhost:5001/api/cartitem/${user.id}/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove item");

      setCart(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      console.error("Failed to remove item from backend", err);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || !user.id) {
      console.error("No user found in localStorage");
      return;
    }

    // Optimistically update the UI first
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    try {
      console.log(`Updating quantity - User: ${user.id}, Product: ${productId}, Quantity: ${newQuantity}`);
      
      const res = await fetch(`http://localhost:5001/api/cartitem/${user.id}/${productId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(errData.message || "Failed to update quantity");
      }

      const updatedItem = await res.json();
      console.log("Successfully updated:", updatedItem);

    } catch (err) {
      console.error("Error updating quantity", err);
      
      // Revert the optimistic update on error
      setCart(prev =>
        prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity } // This will revert to previous state
            : item
        )
      );
    }
  };

  const fetchUserOrders = async () => {
    if (!currentUser || !currentUser.email) {
      console.error("No user found");
      return;
    }

    setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:5001/api/order');
      if (!res.ok) throw new Error("Failed to fetch orders");
      
      const allOrders = await res.json();
      
      // Filter orders by current user's email
      const userOrders = allOrders.filter(order => 
        order.clientData.email === currentUser.email
      );
      
      setOrders(userOrders);
      setShowOrders(true);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowCart(false);
              setShowOrders(false);
            }}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {showOrders ? 'My Orders' : `Your Cart (${cart.length})`}
              </h2>
              <div className="flex items-center gap-2">
                {!showOrders && currentUser && (
                  <button 
                    onClick={fetchUserOrders}
                    disabled={loadingOrders}
                    className="text-teal-500 hover:text-teal-600 mr-3 flex items-center gap-1"
                  >
                    <FiPackage size={16} />
                    <span className="text-sm">
                      {loadingOrders ? 'Loading...' : 'View Orders'}
                    </span>
                  </button>
                )}
                {showOrders && (
                  <button 
                    onClick={() => setShowOrders(false)}
                    className="text-teal-500 hover:text-teal-600 mr-3 text-sm"
                  >
                    Back to Cart
                  </button>
                )}
                <button 
                  onClick={() => {
                    setShowCart(false);
                    setShowOrders(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="h-[calc(100%-180px)] overflow-y-auto p-6">
              {showOrders ? (
                // Orders View
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiPackage className="text-gray-400 text-2xl" />
                      </div>
                      <p className="text-gray-500">No orders found</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <motion.div 
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-800">Order #{order.mysqlId}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <span className="font-semibold text-teal-600">€{order.totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {order.cart.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Product ID: {item.productId} (x{item.quantity})
                              </span>
                              <span className="text-gray-800">€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
                          <p><strong>Delivery:</strong> {order.clientData.street}, {order.clientData.city}</p>
                          <p><strong>Phone:</strong> {order.clientData.phone}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                // Cart View
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShoppingCart className="text-gray-400 text-2xl" />
                      </div>
                      <p className="text-gray-500 mb-6">Your cart is empty</p>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowCart(false);
                          navigate('/productspage');
                        }}
                        className="text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 py-3 px-8 rounded-xl transition"
                      >
                        Continue Shopping
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map(item => (
                        <motion.div 
                          key={item.productId || item._id}
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
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 border border-gray-200 rounded-l-lg flex items-center justify-center"
                            >-</button>

                            <span className="w-10 h-8 border-t border-b border-gray-200 flex items-center justify-center text-sm">
                              {item.quantity ?? 1}
                            </span>

                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 border border-gray-200 rounded-r-lg flex items-center justify-center"
                            >+</button>
                          </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FiX size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {!showOrders && cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-medium text-gray-800">Total:</span>
                  <span className="font-semibold text-gray-800 text-lg">€{cartTotal.toFixed(2)}</span>
                </div>
                <Link
                  to="/client-order-form"
                  state={{ cart }}
                  className="block w-full text-center py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl"
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