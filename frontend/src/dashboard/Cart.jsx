import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();  

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const updateQuantity = (id, amount) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(item.quantity + amount, 1) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); 
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); 
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const proceedToOrder = () => {
    navigate('/client-order-form', { state: { cart } });
  };
  

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <table className="w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">Product</th>
              <th className="px-4 py-2 text-left border-b">Price</th>
              <th className="px-4 py-2 text-left border-b">Quantity</th>
              <th className="px-4 py-2 text-left border-b">Total</th>
              <th className="px-4 py-2 text-left border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}> {/* each item has a unique id */}
                <td className="px-4 py-2 border-b">{item.name}</td>
                <td className="px-4 py-2 border-b">€{item.price}</td>
                <td className="px-4 py-2 border-b">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)} 
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400 transition"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold">{item.quantity}</span> 
                    <button
                      onClick={() => updateQuantity(item.id, 1)} 
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400 transition"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2 border-b">€{(item.price * item.quantity).toFixed(2)}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 className="text-xl font-semibold mt-4">Total: €{totalPrice.toFixed(2)}</h3>
      <button onClick={proceedToOrder} className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-400 transition">
        Proceed to Order
      </button>
    </div>
  );
};

export default Cart;
