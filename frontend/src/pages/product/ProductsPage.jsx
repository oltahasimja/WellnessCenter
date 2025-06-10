import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Header from '../Header';
import ShoppingCart from './ShoppingCart';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';
import ProductSearch from './ProductSearch';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import Footer from '../Footer';
import CartContext from '../../context/CartContext';

// static products 
const staticProducts = [
  {
    id: 1,
    name: 'Organic Turmeric Powder',
    description: 'Anti-inflammatory golden spice from India',
    price: 35.00,
    category: 'Spices',
    rating: 4.5,
    image: '/images/turmeric.jpg'
  },
  {
    id: 2,
    name: 'Cold-Pressed Coconut Oil',
    description: 'Pure virgin coconut oil for cooking and hair care',
    price: 21.00,
    category: 'Oils',
    rating: 4.8,
    image: '/images/cold.jpg'
  },
  {
    id: 3,
    name: 'Himalayan Salt Lamp',
    description: 'Natural air purifier and mood enhancer',
    price: 75.00,
    category: 'Home',
    rating: 4.3,
    image: '/images/lamp.jpg'
  },
  {
    id: 4,
    name: 'Bamboo Toothbrush Set',
    description: 'Eco-friendly biodegradable toothbrushes',
    price: 22.00,
    category: 'Personal Care',
    rating: 4.7,
    image: '/images/brush.jpg'
  },
  {
    id: 5,
    name: 'Lavender Essential Oil',
    description: 'Calming and relaxing aromatherapy oil',
    price: 17.00,
    category: 'Essentials',
    rating: 4.6,
    image: '/images/lavander.jpg'
  },
  {
    id: 6,
    name: 'Matcha Green Tea Powder',
    description: 'Premium ceremonial grade matcha from Japan',
    price: 28.00,
    category: 'Teas',
    rating: 4.9,
    image: '/images/matcha.jpg'
  },
  {
    id: 7,
    name: 'Yoga Mat',
    description: 'Non-slip eco-friendly yoga mat',
    price: 40.00,
    category: 'Fitness',
    rating: 4.4,
    image: '/images/yoga.jpg'
  },
  {
    id: 8,
    name: 'Aloe Vera Gel',
    description: 'Pure aloe vera for skin hydration',
    price: 36.00,
    category: 'Personal Care',
    rating: 4.2,
    image: '/images/aloe.jpg'
  }
];

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
  const {cart, setCart} = useContext(CartContext);
  const [showCart, setShowCart] = useState(false);
  const [clickedButtonId, setClickedButtonId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // fetch from your api
        const response = await fetch('http://localhost:5001/api/product');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const dbProducts = await response.json();
        
        // database products if available
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          setFilteredProducts(dbProducts);
          setCategories(['All', ...new Set(dbProducts.map(p => p.category))]);
        } 
        // display static products if api returns empty
        else {
          setProducts(staticProducts);
          setFilteredProducts(staticProducts);
          setCategories(['All', ...new Set(staticProducts.map(p => p.category))]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // display static products if api fails 
        setProducts(staticProducts);
        setFilteredProducts(staticProducts);
        setCategories(['All', ...new Set(staticProducts.map(p => p.category))]);
        setError(err.message);
      } finally {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
        setLoading(false);
      }
    };

    fetchProducts();
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

 const addToCart = async (product) => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.id) {
      console.error('User not logged in');
      return;
    }

    const payload = {
      userId: user.id, // per MySQL
      usersId: user.id, // per Mongo reference
      productId: product.id || product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    };

    const response = await fetch("http://localhost:5001/api/cartitem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to add to cart");

    const savedItem = await response.json();

    // opsionalisht mund të përditësosh gjendjen
    setCart(prevCart => [...prevCart, savedItem]);
    setClickedButtonId(product.id);
    setTimeout(() => setClickedButtonId(null), 1000);
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
};

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/product');
      const dbProducts = await response.json();
      
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
        setFilteredProducts(dbProducts);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refreshProducts} />;

  return (
    <div className="min-h-screen bg-gray-100"> 
      <Header cart={cart} showCart={showCart} setShowCart={setShowCart} />

      {/* Hero Section */}
      <div className="relative bg-teal-400 py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Wellness Essentials</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">
            A carefully selected wellness collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-5 py-10">
        {/* Search and Filter Section */}
        <div className="mb-14 flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <ProductSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showSearch={showSearch}
              setShowSearch={setShowSearch}
            />
          </div>
          
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
          
          <AnimatePresence>
            {showFilters && (
              <div className="w-full sm:col-span-2">
                <ProductFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  ratingFilter={ratingFilter}
                  setRatingFilter={setRatingFilter}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState 
            onResetFilters={() => {
              setSelectedCategory('All');
              setSearchTerm('');
              setPriceRange([0, 1000]);
              setRatingFilter(null);
            }}
            onRefresh={refreshProducts}
          />
        ) : (
          <ProductGrid 
            products={filteredProducts}
            addToCart={addToCart}
            clickedButtonId={clickedButtonId}
          />
        )}
      </main>

      <Footer />
      <ShoppingCart 
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
}

export default ProductsPage;



