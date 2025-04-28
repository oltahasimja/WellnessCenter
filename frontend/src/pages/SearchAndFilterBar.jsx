import { FiFilter, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';

function SearchAndFilterBar({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  categories,
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <div className="mb-8 bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-5 pr-12 rounded-lg border-none bg-white/90 focus:ring-2 focus:ring-teal-300"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600" />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white/90 hover:bg-white py-3 px-5 rounded-lg font-medium"
        >
          <FiFilter /> Filters
          {showFilters ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
      
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div>
            <h3 className="font-medium text-white mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-teal-600 text-white'
                      : 'bg-white/90 hover:bg-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAndFilterBar;