import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Header';
import Footer from '../Footer';
import CartContext from '../../context/CartContext';

const turmericProduct = {
  name: 'Organic Turmeric Powder',
  description: 'Premium anti-inflammatory golden spice',
  detailedDescription: 'Our organic turmeric contains high curcumin levels (5-7%) for maximum health benefits. Sourced directly from Indian farms using sustainable practices.',
  price: 35.00,
  category: 'Spices',
  rating: 4.5,
  image: '/images/turmeric.jpg',
  benefits: [
    'Natural anti-inflammatory properties',
    'Supports joint and digestive health',
    'Rich in antioxidants',
    'Boosts immune function',
    'Promotes radiant skin'
  ],
  usage: '½ tsp daily in warm milk or meals',
  origin: 'Kerala, India',
  storage: 'Store in cool, dry place away from sunlight'
};

function TurmericProductPage() {
  const { cart, setCart } = useContext(CartContext);
  const [showCart, setShowCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.name === turmericProduct.name);
      if (existingItem) {
        return prevCart.map(item =>
          item.name === turmericProduct.name 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...turmericProduct, quantity }];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header cart={cart} showCart={showCart} setShowCart={setShowCart} />

      {/* Product Hero Section */}
      <div className="relative bg-amber-500 py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Organic Turmeric Powder</h1>
          <p className="text-lg text-amber-100">The Golden Spice of Life</p>
        </div>
      </div>

      {/* Product Detail Section */}
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Image */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl p-6">
              <img
                src={turmericProduct.image}
                alt={turmericProduct.name}
                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              />
              <div className="mt-6 flex justify-center space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-amber-100 rounded-lg border-2 border-amber-300"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Rating and Price */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="flex text-amber-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(turmericProduct.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-500 ml-1">({turmericProduct.rating})</span>
                </div>
                <span className="text-3xl font-bold text-amber-600">${turmericProduct.price.toFixed(2)}</span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-700">{turmericProduct.detailedDescription}</p>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Benefits</h2>
                <ul className="space-y-2">
                  {turmericProduct.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage */}
              <div className="mb-8 bg-amber-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Recommended Usage</h2>
                <p className="text-amber-700">{turmericProduct.usage}</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-200 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addToCart}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-lg shadow-md font-medium text-lg"
              >
                Add to Cart - ${(turmericProduct.price * quantity).toFixed(2)}
              </motion.button>

              {/* Product Details */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Product Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Origin</p>
                    <p className="font-medium">{turmericProduct.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Storage</p>
                    <p className="font-medium">{turmericProduct.storage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{turmericProduct.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TurmericProductPage;