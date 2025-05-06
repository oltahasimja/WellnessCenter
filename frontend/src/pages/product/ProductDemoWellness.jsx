import { useState } from 'react';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';

function ProductDemoWellness() {
  // Wellness product data with working image URL
  const product = {
    name: 'Yoga Mat (Premium)',
    type: 'Equipment',
    description: 'Eco-friendly 6mm thick mat with alignment markers. Non-slip surface perfect for all yoga styles.',
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.8,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Working yoga mat image
    benefits: 'Non-slip • Eco-friendly • 6mm thickness',
    inStock: true
  };

  const [cart, setCart] = useState([]);

  const addToCart = () => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-xl font-bold text-teal-600">Wellness Center</h1>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Product Image - Fixed display */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md h-96 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x800?text=Wellness+Product';
              }}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Type Badge */}
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
              product.type === 'Supplement' 
                ? 'bg-purple-100 text-purple-800' 
                : product.type === 'Equipment' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
            }`}>
              {product.type}
            </span>

            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-teal-600">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
              )}
            </div>

            {/* Benefits */}
            <div className="py-2">
              <p className="text-sm text-gray-600">
                {product.benefits.split(' • ').map((item, i) => (
                  <span key={i} className="mr-3">
                    <span className="w-2 h-2 bg-teal-400 rounded-full inline-block mr-1"></span>
                    {item}
                  </span>
                ))}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-700">{product.description}</p>

            {/* Add to Cart */}
            <motion.button
              onClick={addToCart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 bg-teal-500 hover:bg-teal-600 text-white py-3 px-8 rounded-lg flex items-center gap-2 shadow-md"
            >
              <FiShoppingCart />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDemoWellness;