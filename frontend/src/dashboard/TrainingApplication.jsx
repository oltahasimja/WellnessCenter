import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const TrainingApplication = () => {
  const [formData, setFormData] = useState({ 
    trainingId: '',
    userId: null 
  });
  const [trainingapplicationList, setTrainingApplicationList] = useState([]);
  const [trainingList, setTrainingList] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [trainingCapacity, setTrainingCapacity] = useState({});
  const [selectedTrainingSchedule, setSelectedTrainingSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { theme, setTheme } = useTheme();
  
  axios.defaults.withCredentials = true;

  // Theme switcher component
  const ThemeSwitcher = () => (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      {theme === "dark" ? (
        <FaSun className="text-yellow-400" />
      ) : (
        <FaMoon className="text-gray-700" />
      )}
    </button>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchLoggedInUser();
        await Promise.all([
          fetchTrainingApplications(),
          fetchTrainings()
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = trainingapplicationList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(trainingapplicationList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchLoggedInUser = async () => {
    try {
      const response = await axios.get('http://localhost:5001/user');
      setLoggedInUser(response.data.user);
      setFormData(prev => ({ 
        ...prev, 
        userId: response.data.user?.id || null
      }));
    } catch (error) {
      console.error("Error fetching logged in user:", error);
      setError('Failed to fetch user data');
    }
  };

  const fetchTrainingApplications = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/trainingapplication');
      const processedData = response.data.map(item => ({
        ...item,
        userId: item.userId || { name: 'Unknown', lastName: '' },
        trainingId: item.trainingId || { title: 'Unknown Training', duration: '' }
      }));
      setTrainingApplicationList(processedData);
      calculateTrainingCapacity(processedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError('Failed to fetch training applications');
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/training');
      setTrainingList(response.data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setError('Failed to fetch trainings list');
    }
  };

  const fetchTrainingSchedule = async (trainingId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/scheduleTraining`);
      const filteredSchedules = response.data.filter(schedule => {
        const scheduleTrainingId = schedule.trainingId?.mysqlId || schedule.trainingId;
        return scheduleTrainingId === trainingId;
      });
      setSelectedTrainingSchedule(filteredSchedules);
    } catch (error) {
      console.error("Error fetching training schedule:", error);
      setSelectedTrainingSchedule(null);
    }
  };

  const calculateTrainingCapacity = (applications) => {
    const capacityMap = {};
    applications.forEach(app => {
      const trainingId = app.trainingId?.mysqlId || app.trainingId;
      capacityMap[trainingId] = (capacityMap[trainingId] || 0) + 1;
    });
    setTrainingCapacity(capacityMap);
  };

  const handleTrainingSelect = (e) => {
    const trainingId = e.target.value;
    setFormData({ ...formData, trainingId });
    if (trainingId) {
      fetchTrainingSchedule(trainingId);
    } else {
      setSelectedTrainingSchedule(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loggedInUser) {
      alert('Duhet të jeni i loguar për të aplikuar për trajnime!');
      return;
    }

    if (!formData.trainingId) {
      alert('Ju lutem zgjidhni një trajnim!');
      return;
    }

    if (trainingCapacity[formData.trainingId] >= 5) {
      alert('Nuk ka vende të lira në këtë trajnim! Maksimumi 5 aplikime janë pranuar.');
      return;
    }

    try {
      const payload = {
        trainingId: formData.trainingId,
        userId: loggedInUser.id,
        duration: '',
        applicationDate: new Date().toISOString()
      };

      if (formData.id) {
        await axios.put(`http://localhost:5001/api/trainingapplication/${formData.id}`, payload);
      } else {
        await axios.post('http://localhost:5001/api/trainingapplication', payload);
      }
      
      await fetchTrainingApplications();
      setFormData({ 
        trainingId: '', 
        userId: loggedInUser.id 
      });
      setSelectedTrainingSchedule(null);
      setCurrentPage(1); // Reset to first page after modification
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(`Gabim gjatë aplikimit: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.mysqlId || item.id,
      trainingId: item.trainingId?.mysqlId || item.trainingId,
      userId: loggedInUser?.id || null
    });
    fetchTrainingSchedule(item.trainingId?.mysqlId || item.trainingId);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurtë që dëshironi të fshini këtë aplikim?')) {
      try {
        await axios.delete(`http://localhost:5001/api/trainingapplication/${id}`);
        await fetchTrainingApplications();
        // Adjust page if we deleted the last item on the page
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error("Error deleting application:", error);
      }
    }
  };

  const isTrainingFull = (trainingId) => {
    return trainingCapacity[trainingId] >= 5;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl dark:text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500 dark:text-red-400">Gabim</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-0">Menaxhimi i Aplikimeve për Trajnime</h1>
            <ThemeSwitcher />
          </div>
          
          {!loggedInUser ? (
            <div className="text-center text-red-500 dark:text-red-400 mb-6">
              Duhet të jeni i loguar për të aplikuar për trajnime!
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Përdoruesi</label>
                    <input 
                      type="text" 
                      value={`${loggedInUser.name || ''} ${loggedInUser.lastName || ''}`} 
                      readOnly 
                      className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full bg-gray-100 dark:bg-gray-700 dark:text-white" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trajnimi</label>
                    <select
                      value={formData.trainingId || ''}
                      onChange={handleTrainingSelect}
                      className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="" disabled className="dark:bg-gray-700">Zgjidhni Trajnimin</option>
                      {trainingList.map((item) => {
                        const trainingId = item.mysqlId || item.id;
                        const isFull = isTrainingFull(trainingId);
                        return (
                          <option 
                            key={trainingId} 
                            value={trainingId}
                            disabled={isFull}
                            className="dark:bg-gray-700"
                          >
                            {item.title} {isFull ? ' (I plotë)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {formData.trainingId && isTrainingFull(formData.trainingId) && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        Ky trajnim ka arritur numrin maksimal të aplikimeve (5). Ju lutem zgjidhni një trajnim tjetër.
                      </p>
                    )}
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-semibold text-lg transition-colors shadow-sm"
                  disabled={formData.trainingId && isTrainingFull(formData.trainingId)}
                >
                  {formData.id ? 'Përditëso' : 'Apliko'}
                </button>
              </form>

              {selectedTrainingSchedule && selectedTrainingSchedule.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Orari i Trajnimit të Selektuar</h2>
                  {selectedTrainingSchedule.map((schedule, index) => (
                    <div key={index} className="mb-4 dark:text-gray-300">
                      <p><strong>Ditët:</strong> {schedule.workDays?.join(', ') || 'N/A'}</p>
                      <p><strong>Koha e fillimit:</strong> {schedule.startTime || 'N/A'}</p>
                      <p><strong>Koha e përfundimit:</strong> {schedule.endTime || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm mt-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data e Aplikimit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Përdoruesi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trajnimi
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.mysqlId || item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.trainingId?.duration || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.userId?.name || 'Unknown'} {item.userId?.lastName || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.trainingId?.title || 'Unknown Training'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Edito
                          </button>
                          <button
                            onClick={() => handleDelete(item.mysqlId || item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Fshi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nuk ka të dhëna
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {trainingapplicationList.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, trainingapplicationList.length)}
                </span>{' '}
                of <span className="font-medium">{trainingapplicationList.length}</span> results
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 border rounded-md text-sm ${currentPage === number ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingApplication;