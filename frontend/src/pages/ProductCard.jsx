import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';

function ProductCard({ product, addToCart }) {
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
      <Link to={`/products/${product.id}`} className="block">
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img 
            src={product.image || '/images/product-placeholder.jpg'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/product-placeholder.jpg';
            }}
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/products/${product.id}`} className="hover:underline">
            <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h2>
          </Link>
          {product.category && (
            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-teal-600">€{product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;