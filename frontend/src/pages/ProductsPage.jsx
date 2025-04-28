import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiShoppingCart, FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';


function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Loading State
  const LoadingState = () => (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-4 h-4 bg-teal-400 rounded-full animate-bounce"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                backgroundColor: i === 1 ? '#f59e0b' : '#2dd4bf'
              }}
            />
          ))}
        </div>
        <p className="text-teal-800 font-medium">Loading wellness products...</p>
      </div>
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md border border-teal-100 max-w-md w-full text-center transform transition-all duration-300 hover:shadow-lg">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiX className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-teal-400 hover:bg-teal-500 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 hover:shadow-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white p-8 rounded-lg border border-teal-100 text-center max-w-md mx-auto shadow-sm transform transition-all duration-300 hover:shadow-md">
      <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiSearch className="text-teal-400 text-xl" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No Wellness Products Found</h2>
      <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
      <button 
        onClick={() => {
          setSelectedCategory('All');
          setSearchTerm('');
        }}
        className="bg-teal-400 hover:bg-teal-500 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-md"
      >
        Reset Filters
      </button>
    </div>
  );

  // Enhanced Wellness Product Card
  const ProductCard = ({ product, addToCart }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        className="relative group overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Product image with parallax effect */}
        <div className="relative h-60 overflow-hidden rounded-t-xl">
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          <img 
            src={product.image || '/images/product-placeholder.jpg'} 
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/product-placeholder.jpg';
            }}
          />
          
          {/* Floating category badge */}
          {product.category && (
            <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-sm">
              {product.category}
            </span>
          )}
        </div>
        
        {/* Product content */}
        <div className="relative bg-white p-5 rounded-b-xl border border-teal-100">
          {/* Floating price tag */}
          <div className="absolute -top-5 left-4 h-10 px-3 flex items-center justify-center bg-teal-400 text-white font-bold rounded-lg shadow-md">
            €{product.price}
          </div>
          
          <div className="pt-2">
            <Link to={`/products/${product.id}`} className="hover:underline">
              <h2 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">
                {product.name}
              </h2>
            </Link>
            
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
            
            <div className="flex justify-between items-center">
              {/* Rating stars (placeholder) */}
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= 4 ? 'text-amber-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Add to cart button with animation */}
              <button 
                onClick={() => addToCart(product)}
                className="relative overflow-hidden flex items-center gap-1 text-sm font-medium text-white bg-teal-400 hover:bg-teal-500 py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-md group/button"
              >
                <span className="relative z-10">Add to Cart</span>
                <FiShoppingCart className="relative z-10" size={16} />
                
                {/* Button hover effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-amber-400 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Shopping Cart
  const ShoppingCart = ({ showCart, setShowCart, cart, setCart }) => {
    const removeFromCart = (productId) => {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
      if (newQuantity < 1) return;
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
      <div className={`fixed inset-0 z-50 ${showCart ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity duration-300"
          onClick={() => setShowCart(false)}
        />
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-teal-100">
            <h2 className="text-lg font-semibold text-gray-900">Your Wellness Cart ({cart.length})</h2>
            <button 
              onClick={() => setShowCart(false)}
              className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="h-[calc(100%-180px)] overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingCart className="text-teal-400 text-xl" />
                </div>
                <p className="text-gray-500 mb-4">Your wellness cart is empty</p>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-sm font-medium text-white bg-teal-400 hover:bg-teal-500 py-2 px-6 rounded transition-all duration-300 hover:shadow-md"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-teal-100">
                    <div className="w-16 h-16 bg-teal-50 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-900 font-medium">€{item.price}</p>
                      <div className="flex items-center mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-teal-200 rounded-l flex items-center justify-center hover:bg-teal-50 transition-colors duration-200"
                        >
                          -
                        </button>
                        <span className="w-10 h-8 border-t border-b border-teal-200 flex items-center justify-center text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-teal-200 rounded-r flex items-center justify-center hover:bg-teal-50 transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-teal-100 bg-white">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">€{cartTotal.toFixed(2)}</span>
              </div>
              <Link
                to="/client-order-form"
                state={{ cart }}
                className="block w-full text-center py-3 bg-teal-400 hover:bg-teal-500 text-white font-medium rounded transition-all duration-300 hover:shadow-md"
              >
                Proceed to Order
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/product');
        setProducts(response.data);
        setFilteredProducts(response.data);
        
        const uniqueCategories = ['All', ...new Set(response.data.map(p => p.category))];
        setCategories(uniqueCategories);
        
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Apply filters
  useEffect(() => {
    let result = products;
    
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm]);

  // Add to cart function
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    
    // Add a small visual feedback
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
      cartButton.classList.add('animate-ping');
      setTimeout(() => {
        cartButton.classList.remove('animate-ping');
      }, 500);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen">

  {/* Main Content */}
  <main className="relative bg-white rounded-xl max-w-7xl mx-auto my-6 px-4 py-8 shadow-md">
    {/* Products Header Section */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-2">
          <span className="inline-block bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent">
            Products
          </span>
        </h1>
        <p className="text-teal-600 italic">Nourish your body and soul with our curated collection</p>
      </div>
      
      <button 
        onClick={() => setShowCart(!showCart)}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-teal-200 hover:border-teal-400 bg-white text-teal-600 transition-all duration-200 hover:shadow-sm"
      >
        <FiShoppingCart className="text-teal-600" />
        <span>Cart</span>
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>
    </div>

    {/* Shopping Cart Popup */}
    <ShoppingCart 
      showCart={showCart} 
      setShowCart={setShowCart} 
      cart={cart} 
      setCart={setCart}
    />

    {/* Search and Filter Section */}
    <div className="mb-8 w-full">
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <div className="flex-1 relative w-full">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <FiSearch className="text-teal-400" />
          </div>
          <input
            type="text"
            placeholder="Find your perfect wellness product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all duration-200 shadow-sm"
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full border border-teal-200 hover:border-teal-400 bg-white text-teal-600 transition-all duration-200 hover:shadow-sm"
        >
          <FiFilter size={16} />
          <span>Filters</span>
          {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </div>
      
      {/* Filters Dropdown */}
      {showFilters && (
        <div className="mt-4 p-6 bg-white rounded-2xl border border-teal-100 shadow-sm w-full">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filter Products
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-teal-400 to-amber-400 text-white shadow-md'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100 hover:shadow-sm'
                }`}
              >
                {category === 'All' ? 'All Products' : category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    
    {/* Products Grid */}
    {filteredProducts.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>
    )}
  </main>
</div>
  );
}

export default ProductsPage;