import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

function OrderConfirmation() {
  const { state } = useLocation();
  const { orderNumber = '123456', clientData, cart = [], totalPrice = 0 } = state || {};

  if (!state) {
    // Fallback if accessed directly without order info
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">Please place an order first.</p>
          <Link to="/productspage">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-lg font-medium text-lg transition-all duration-200"
            >
              Back to Shopping
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl w-full flex flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <FaCheckCircle className="text-5xl text-lime-400 mb-4" />
          <h2 className="text-4xl font-extrabold mb-2">Order Confirmed!</h2>
          <p className="text-lg max-w-md">
            Thank you, {clientData?.name}! Your wellness goodies are on their way. We'll notify you with shipping updates.
          </p>
        </div>

        {/* Order Summary Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-teal-100/30 backdrop-blur-xl border border-teal-200/50 px-8 py-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full max-w-lg mx-auto"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Order Number</h3>
          <p className="text-3xl font-bold text-teal-700 mb-6">#{orderNumber}</p>

          <div className="mb-6 text-gray-700 leading-relaxed">
            We’re preparing your items at our <strong>Organic Hub, Wellness Street</strong>.
            Expect a delivery update within 24 hours.
          </div>

          <div className="my-4 text-left">
            <p className="font-medium text-gray-700">Shipping to:</p>
            <p className="text-gray-600">
              {clientData?.street}, {clientData?.city}, {clientData?.country}
            </p>
          </div>

          <div className="my-4">
            <p className="font-medium text-gray-700">
              Total Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
            <p className="font-bold text-lg text-teal-600">Total: ${totalPrice.toFixed(2)}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/orders">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-teal-700 transition"
              >
                View My Orders
              </motion.button>
            </Link>
            <Link to="/productspage">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-teal-600 border border-teal-600 px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-gray-50 transition"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default OrderConfirmation;
