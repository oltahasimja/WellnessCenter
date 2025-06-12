import React, { createContext, useState } from 'react';

export const CartContext = createContext(); // ✅ Add this

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [userId, setUserId] = useState(null);

  const addToCart = async (product, quantity = 1) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.id) {
      alert('Please login to add items to cart');
      return false;
    }

    try {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.productId === product.id);
        
        if (existingItem) {
          return prevCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevCart, { 
            ...product,
            productId: product.id,
            quantity
          }];
        }
      });

      const response = await fetch('http://localhost:5001/api/cartitem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          quantity
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      setCart(prevCart => prevCart.filter(item => item.productId !== product.id));
      return false;
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      showCart,
      setShowCart,
      addToCart,
      removeFromCart,
      updateQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
};
