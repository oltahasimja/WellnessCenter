
import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Header';
import CartContext from '../../context/CartContext';




function ProductDetailPage() {
  const { state } = useLocation();
  const { setCart, setShowCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const product = state?.product;

   useEffect(() => {
    if (!product) {
      navigate('/products');
    }
  }, [product, navigate]);

  if (!product) {
    return null; 
  }

  const addToCart = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.id) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id || 
        (item.productId && item.productId === product.id)
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id || 
           (item.productId && item.productId === product.id))
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { 
          ...product, 
          quantity,
          productId: product.id // For API consistency
        }];
      }
    });

    // Show the cart after adding
    setShowCart(true);
  };

  return (
<div className="min-h-screen bg-white">
  <Header/>
  {/* Header part of products */}
  <div className="relative bg-white py-20 border-b border-gray-200">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-2xl md:text-4xl font-semibold text-emerald-600 mb-2">{product.name}</h1>
      <p className="text-lg text-emerald-500">{product.category}</p>
    </div>
  </div>

  {/* Product Detail Section */}
  <div className="container mx-auto px-4 sm:px-6 py-12">
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Product Image */}
      <div className="lg:w-1/2">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl p-6 border border-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="lg:w-1/2">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Rating and Price */}
          <div className="flex justify-between items-center  mb-6">
            <div className="flex items-center">
              <div className="flex text-amber-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(product.rating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-gray-500 ml-1">({product.rating})</span>
            </div>
            <span className="text-3xl font-bold text-amber-400">${product.price.toFixed(2)}</span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-8">
            <label className="block text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 bg-gray-200 rounded-l-lg text-gray-700"
              >
                -
              </button>
              <span className="px-4 py-1 bg-gray-100 text-gray-700">{quantity}</span>
              <button
                onClick={(() => setQuantity(quantity + 1))}
                className="px-3 py-1 bg-gray-200 rounded-r-lg text-gray-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart - Green button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addToCart}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg shadow-md font-medium text-lg transition-colors"
          >
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </motion.button>

          {/* Product Details */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium text-emerald-600">{product.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Footer with green text */}
  <footer className="bg-emerald-100 text-center py-8 mt-16 border-t border-gray-200 text-emerald-700">
    <div className="max-w-4xl mx-auto px-4">
      <p className="text-sm md:text-base">
        © {new Date().getFullYear()} Wellness Market. All rights reserved.
      </p>
      <p className="text-sm mt-2 text-emerald-600">
        Bringing you thoughtfully sourced, eco-conscious wellness products to support your healthy lifestyle.
      </p>
    </div>
  </footer>
</div>


  );
}

export default ProductDetailPage;