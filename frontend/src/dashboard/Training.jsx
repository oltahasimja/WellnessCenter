import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Training = () => {
  const [formData, setFormData] = useState({});
  const [trainingList, setTrainingList] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Duration options
  const durationOptions = [
    '1 muaj',
    '2 muaj',
    '3 muaj', 
    '4 muaj',
    '5 muaj',
    '6 muaj',
    '1 vit'
  ];

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check login status
        const userResponse = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (!userResponse.data.user) {
          navigate('/login');
          return;
        }
        setUser(userResponse.data.user);

        // Fetch trainings
        await fetchTrainings();
      } catch (error) {
        console.error('Error initializing data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [navigate]);

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/training', {
        withCredentials: true
      });
      
      console.log('API Response:', response.data); // Për debug
      
      const trainingsWithCreator = response.data.map(training => {
        // Nëse createdById është objekt i plotë
        if (training.createdById && typeof training.createdById === 'object') {
          return {
            ...training,
            creatorDisplayName: `${training.createdById.name} ${training.createdById.lastName || ''}`.trim()
          };
        }
        // Nëse kemi vetëm ID
        return {
          ...training,
          creatorDisplayName: training.creatorName || 'Unknown'
        };
      });
  
      setTrainingList(trainingsWithCreator);
    } catch (error) {
      console.error('Error fetching trainings:', error.response?.data || error.message);
    }
  };

  const getCreatorDisplayName = (training) => {
    if (training.creatorName) return training.creatorName;
    if (training.createdById?.name) {
      return `${training.createdById.name} ${training.createdById.lastName || ''}`.trim();
    }
    return 'Unknown';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
  
    try {
      const dataToSend = { 
        ...formData, 
        createdById: user.id
      };
  
      if (formData.id) {
        await axios.put(`http://localhost:5000/api/training/${formData.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/training', dataToSend);
      }
  
      await fetchTrainings();
      setFormData({});
    } catch (error) {
      console.error('Error saving training:', error.response?.data || error.message);
      if (error.response?.data?.message === 'User not found in MongoDB') {
        alert('User synchronization error. Please try again or contact support.');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      id: item.mysqlId || item.id
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/training/${id}`);
      await fetchTrainings();
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  const handleParticipantsChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), 1), 10);
    setFormData({ ...formData, max_participants: value });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Training Management</h1>
        
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input 
            type="text"
            placeholder="Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          
          <input 
            type="text"
            placeholder="Category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          
          <input 
            type="text"
            placeholder="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          
          <select
            value={formData.duration || ''}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="" disabled>Zgjidhni kohëzgjatjen</option>
            {durationOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          
          <input 
            type="number"
            placeholder="Max Participants"
            value={formData.max_participants || ''}
            onChange={handleParticipantsChange}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            min="1"
            max="10"
            required
          />
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg transition-colors"
          >
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Category</th>
                <th className="py-3 px-6 text-left">Description</th>
                <th className="py-3 px-6 text-left">Duration</th>
                <th className="py-3 px-6 text-left">Created By</th>
                <th className="py-3 px-6 text-left">Max Participants</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {trainingList.length > 0 ? (
                trainingList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">
                      <Link 
                        to={`/training/${item.mysqlId || item.id}`} 
                        className="text-blue-500 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-3 px-6 text-left">{item.category}</td>
                    <td className="py-3 px-6 text-left">{item.description}</td>
                    <td className="py-3 px-6 text-left">{item.duration}</td>
                    <td className="py-3 px-6 text-left">{item.creatorDisplayName}</td>
                    <td className="py-3 px-6 text-left">{item.max_participants}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.mysqlId || item.id)} 
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Training;