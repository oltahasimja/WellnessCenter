import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { useTheme } from '../components/ThemeContext';
import { FaSearch } from 'react-icons/fa';

const Program = () => {
  const [formData, setFormData] = useState({});
  const [programList, setProgramList] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [user, setUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const programsPerPage = 5;
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user', { withCredentials: true });
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.log('Përdoruesi nuk është i kyçur.');
        navigate('/login');
      }
    };

    checkLoginStatus();
    fetchPrograms();
  }, [navigate]);

  const fetchPrograms = async () => {
    const response = await axios.get('http://localhost:5001/api/program');
    setProgramList(response.data);
    setFilteredPrograms(response.data); // Initialize filtered programs
  };

  // Search function
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredPrograms(programList);
      setCurrentPage(1);
      return;
    }
    
    const filtered = programList.filter(item => 
      item.title.toLowerCase().includes(term.toLowerCase()) ||
      (item.createdById?.name && item.createdById.name.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredPrograms(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
  const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
  
    const dataToSend = { ...formData, createdById: user.id };
  
    if (formData.id) {
      await axios.put(`http://localhost:5001/api/program/${formData.id}`, dataToSend);
    } else {
      await axios.post('http://localhost:5001/api/program', dataToSend);
    }
    fetchPrograms();
    setFormData({});
    setCurrentPage(1);
  };

  const handleEdit = (item) => {
    setFormData({ ...item, id: item.mysqlId || item.id });
  };

  const handleDeleteClick = (id) => {
    if (!user) return;
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/program/${itemToDelete}`, {
        data: { userId: user.id }
      });
      fetchPrograms();
      if (currentPrograms.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-1 mb-[2rem]">
        <div className={`p-6 flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg rounded-lg p-6 w-full max-w-3xl`}>
              <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Program Management
              </h1>
              
              {/* Search Bar */}
              <div className="mb-6 relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search by title or creator..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`border p-3 rounded-l-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                    }`}
                  />
                  <div className={`p-3 rounded-r-md ${
                    theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-200 border'
                  }`}>
                    <FaSearch className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <input
                  type="text"
                  placeholder="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />

                <input
                  type="text"
                  placeholder="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />

                 <input
                  type="text"
                  placeholder="price"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />

                <button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg"
                >
                  {formData.id ? 'Përditëso' : 'Shto'}
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className={`w-full border-collapse shadow-md rounded-md ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <thead>
                    <tr className={`${
                      theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'
                    } uppercase text-sm leading-normal`}>
                      <th className="py-3 px-6 text-left">Title</th>
                      <th className="py-3 px-6 text-left">Description</th>
                      <th className="py-3 px-6 text-left">Price</th>


                      <th className="py-3 px-6 text-left">Created By</th>
                      <th className="py-3 px-6 text-left">Created At</th>
                      <th className="py-3 px-6 text-center">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm font-light ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {currentPrograms.length > 0 ? (
                      currentPrograms.map((item) => (
                        <tr 
                          key={item.mysqlId || item.id} 
                          className={`border-b ${
                            theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <td className="py-3 px-6 text-left">
                            <Link 
                              to={`/programs/${item.mysqlId || item.id}`}
                              className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'} hover:underline`}
                            >
                              {item.title}
                            </Link>
                          </td>
                          <td className="py-3 px-6 text-left">{item.description}</td>
                          <td className="py-3 px-6 text-left">
                            {item.price ? `${item.price} €` : 'N/A'}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {item.createdById?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 flex justify-center space-x-2">
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item.mysqlId || item.id)} 
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan="5" 
                          className={`text-center py-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {searchTerm ? 'No matching programs found' : 'Nuk ka të dhëna'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {filteredPrograms.length > programsPerPage && (
                  <div className={`flex justify-between items-center mt-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <button 
                      onClick={prevPage} 
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === 1 
                          ? (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`mx-1 px-3 py-1 rounded-md ${
                            currentPage === number
                              ? 'bg-blue-500 text-white'
                              : theme === 'dark' 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={nextPage} 
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === totalPages 
                          ? (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmation 
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={
          programList.find(item => (item.mysqlId || item.id) === itemToDelete)?.title || "this program"
        }
      />
    </div>
  );
};

export default Program;