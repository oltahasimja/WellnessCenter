import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiChevronDown, FiChevronUp, FiSearch, FiStar, FiAward, FiX, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import ShoppingCart from './ShoppingCart';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [clickedButtonId, setClickedButtonId] = useState(null);


  const LoadingState = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute w-6 h-6 bg-teal-400 rounded-full"
                style={{
                  left: `${i * 32}px`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [1, 0.6, 1],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-teal-600 font-medium text-lg">Curating Your Wellness Collection</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiX className="text-red-500 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.reload()} 
          className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md"
        >
          Try Again
        </motion.button>
      </motion.div>
    </div>
  );


  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-10 rounded-2xl border border-gray-100 text-center max-w-md mx-auto shadow-lg"
    >
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiSearch className="text-teal-500 text-2xl" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">No Products Found</h2>
      <p className="text-gray-500 mb-6">We couldn't find any items matching your criteria</p>
      <motion.button 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedCategory('All');
          setSearchTerm('');
          setPriceRange([0, 1000]);
          setRatingFilter(null);
        }}
        className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md"
      >
        Reset All Filters
      </motion.button>
    </motion.div>
  );

  // product card
  const ProductCard = ({ product, addToCart }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleAddToCart = (product) => {
      setClickedButtonId(product.id);
      setTimeout(() => setClickedButtonId(null), 1000);
      addToCart(product);
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-72 bg-gray-50 overflow-hidden">
          <motion.img 
            src={product.image || '/images/product-placeholder.jpg'} 
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.4 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/product-placeholder.jpg';
            }}
          />
          
  
          {product.discount && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400 text-white shadow-md"
            >
              {product.discount}% OFF
            </motion.div>
          )}
          
    
          {product.premium && (
            <div className="absolute top-4 left-4 flex items-center">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm">
                <FiAward className="text-amber-400 mr-1" size={14} />
                <span className="text-xs font-medium text-gray-800">Premium</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link to={`/products/${product.id}`} className="hover:underline">
                <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
              </Link>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-4 h-4 ${star <= product.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {product.originalPrice ? (
                <>
                  <span className="font-bold text-teal-500 text-lg">€{product.price}</span>
                  <span className="text-sm text-gray-400 line-through">€{product.originalPrice}</span>
                </>
              ) : (
                <span className="font-bold text-teal-500 text-lg">€{product.price}</span>
              )}
            </div>
          </div>
          
          <motion.button 
            onClick={() => handleAddToCart(product)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center gap-2 text-sm font-medium text-white py-3 px-4 rounded-xl transition-all duration-300 shadow-md ${
              clickedButtonId === product.id 
                ? 'bg-amber-400 ring-2 ring-amber-200 ring-offset-2'
                : 'bg-teal-500 hover:bg-teal-600'
            }`}
          >
            <AnimatePresence mode="wait">
              {clickedButtonId === product.id ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <FiShoppingCart size={16} />
                  </motion.div>
                  Added!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <FiShoppingCart size={16} />
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    );
  };

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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
    
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      result = result.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }
    
    if (ratingFilter) {
      result = result.filter(product => product.rating >= ratingFilter);
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, priceRange, ratingFilter]);

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
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-gray-100"> 
      <Header 
        cart={cart}
        showCart={showCart}
        setShowCart={setShowCart}
      />

      {/* Main Content */}
      <main className="container mx-auto px-5 py-10 pt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3 font-serif tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-600">
                Our Collection
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Quality Products For Your Wellness Journey
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSearch(!showSearch)}
              className="flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-xl border border-gray-200 hover:border-teal-400 bg-white text-gray-700 transition-all duration-200 shadow-sm"
            >
              <FiSearch size={18} />
              <span>Search Products</span>
            </motion.button>
            
            {/* Search Input */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 relative overflow-hidden"
                >
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center">
                    <FiSearch className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for premium wellness products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-5 py-3.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all duration-200 shadow-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Filter Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-xl border border-gray-200 hover:border-teal-400 bg-white text-gray-700 transition-all duration-200 shadow-sm"
            >
              <FiFilter size={18} />
              <span>Filter</span>
              {showFilters ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </motion.button>
          </div>
          
          {/* Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
              >
                <h3 className="font-medium text-gray-800 text-lg mb-6">Customize Your Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <motion.button
                          key={category}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCategory(category)}
                          className={`block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedCategory === category
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category === 'All' ? 'All Categories' : category}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
                    <div className="space-y-4">
                      <div className="px-1">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>€{priceRange[0]}</span>
                          <span>€{priceRange[1]}</span>
                        </div>
                      </div>   
                    </div>
                  </div>
                  
                  {/* Rating Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2].map(rating => (
                        <motion.button
                          key={rating}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                            ratingFilter === rating
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <FiStar
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} ${
                                  ratingFilter === rating ? 'text-white fill-white' : ''
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm">{rating}+ Stars</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Cart */}
      <ShoppingCart 
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
};

export default ProductsPage;