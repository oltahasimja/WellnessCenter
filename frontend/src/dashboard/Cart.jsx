import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');

  // fetch items and calculate the total price
  const fetchCartItems = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/cart'); 
      setCartItems(response.data.items);
      calculateTotalPrice(response.data.items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, []); 

  // calculate total price 
  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // fetch cart items when the component mounts
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]); // Add fetchCartItems to the dependency array

  // removing an item from the cart
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/cart/remove/${productId}`);
      setMessage('Item removed from cart successfully!');
      fetchCartItems(); // Fetch updated cart
    } catch (error) {
      console.error('Error removing from cart:', error);
      setMessage('Failed to remove item from cart');
    }
  };

  // updating item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put('http://localhost:5000/cart/update', { productId, quantity });
      fetchCartItems(); 
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Your Shopping Cart</h1>
        
        {message && <p className="text-center text-green-500 mb-4">{message}</p>}

        {/* cart items */}
        <div className="overflow-x-auto">
          {cartItems.length > 0 ? (
            <table className="w-full border-collapse shadow-md rounded-md bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Product</th>
                  <th className="py-3 px-6 text-left">Price</th>
                  <th className="py-3 px-6 text-left">Quantity</th>
                  <th className="py-3 px-6 text-left">Total</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {cartItems.map((item) => (
                  <tr key={item.productId} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center space-x-4">
                        <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                        <p>{item.productName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">{new Intl.NumberFormat('en-US').format(item.price)}€</td>
                    <td className="py-3 px-6 text-left">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, e.target.value)}
                        className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="py-3 px-6 text-left">
                      {new Intl.NumberFormat('en-US').format(item.price * item.quantity)}€
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-4">Your cart is empty!</p>
          )}
        </div>

        {/* total */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Total Price: {new Intl.NumberFormat('en-US').format(totalPrice)}€</h3>
        </div>

        {/* checkout button */}
        <div className="mt-6">
          <button
            onClick={() => alert('Coming soon')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
