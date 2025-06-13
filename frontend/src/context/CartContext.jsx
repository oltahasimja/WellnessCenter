// In CartContext.js
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [userId, setUserId] = useState(null);

  // Add this new function to handle adding items
  const addToCart = async (product, quantity = 1) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.id) {
      alert('Please login to add items to cart');
      return false;
    }

    try {
      // Optimistic UI update
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

      // Sync with backend
      const response = await fetch('http://localhost:5001/api/cartitem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      // Revert optimistic update on error
      setCart(prevCart => prevCart.filter(item => item.productId !== product.id));
      return false;
    }
  };

  // Update the provider value to include addToCart
  return (
    <CartContext.Provider value={{ 
      cart, 
      setCart, 
      showCart, 
      setShowCart,
      addToCart, // Make sure to expose this
      removeFromCart, 
      updateQuantity 
    }}>
      {children}
    </CartContext.Provider>
  );
};