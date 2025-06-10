import React, { createContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); 
  const [showCart, setShowCart] = useState(false);
  const [userId, setUserId] = useState(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user?.id || null;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      if (user?.id !== userId) {
        setUserId(user?.id || null);
      }
    }, 1000); // kontrollon çdo sekond

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        setCart([]); // pas logout, pastrohet cart-i
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/api/cartitem/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch cart");

        const cartData = await response.json();
        if (Array.isArray(cartData)) {
          const items = cartData.flatMap(c => c.items || []);
          setCart(items);
        }
      } catch (err) {
        console.error("Error loading cart from backend:", err);
      }
    };

    fetchCart();
  }, [userId]); // refresh shportes kur userId ndryshon

  return (
    <CartContext.Provider value={{ cart, setCart, showCart, setShowCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
