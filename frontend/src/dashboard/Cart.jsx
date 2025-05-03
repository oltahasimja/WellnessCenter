import React from 'react';
import { FiX } from 'react-icons/fi';

const Cart = ({ showCart, setShowCart, cart = [], setCart }) => {

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className={`fixed top-0 right-0 bg-white w-80 h-screen shadow-md transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
          <FiX
            className="text-teal-500 cursor-pointer"
            onClick={() => setShowCart(false)}
          />
        </div>
        <div className="mt-4">
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center py-3 border-b border-teal-100"
              >
                <div>
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="text-gray-600 text-xs">€{item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-teal-500"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-teal-500"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">Total: €{totalPrice.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
};

export default Cart;
