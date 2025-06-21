import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ScheduleTraining = () => {
  const [formData, setFormData] = useState({ workDays: [] });
  const [scheduletrainingList, setScheduleTrainingList] = useState([]);
  const [trainingList, setTrainingList] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { theme, setTheme } = useTheme();

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

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
    fetchScheduleTrainings();
    fetchTrainings();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = scheduletrainingList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(scheduletrainingList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchScheduleTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/scheduletraining');
      setScheduleTrainingList(response.data);
    } catch (err) {
      setError('Failed to fetch schedule trainings');
      console.error(err);
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/training');
      setTrainingList(response.data);
    } catch (err) {
      setError('Failed to fetch trainings');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        workDays: formData.workDays
      };

      if (formData.id) {
        await axios.put(`http://localhost:5001/api/scheduletraining/${formData.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:5001/api/scheduletraining', dataToSend);
      }
      
      fetchScheduleTrainings();
      setFormData({ workDays: [] });
      setError(null);
      setCurrentPage(1); // Reset to first page after modification
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule training');
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    let workDaysArray = [];
    if (typeof item.workDays === 'string') {
      workDaysArray = item.workDays.split(',').map(day => day.trim());
    } else if (Array.isArray(item.workDays)) {
      workDaysArray = [...item.workDays];
    }

    const editData = {
      ...item,
      id: item.mysqlId || item._id,
      trainingId: item.trainingId?.mysqlId || item.trainingId?._id || item.trainingId,
      workDays: workDaysArray
    };

    setFormData(editData);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`http://localhost:5001/api/scheduletraining/${id}`);
        fetchScheduleTrainings();
        // Adjust page if we deleted the last item on the page
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error("Error deleting schedule:", err);
      }
    }
  };

  const handleDayChange = (day) => {
    setFormData(prev => {
      if (day === 'AllWeek') {
        return {
          ...prev,
          workDays: prev.workDays.length === daysOfWeek.length ? [] : [...daysOfWeek]
        };
      }
      
      const newWorkDays = prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day];
      
      return { 
        ...prev, 
        workDays: [...new Set(newWorkDays)]
      };
    });
  };

  const renderWorkDaysCheckboxes = () => {
    return (
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 rounded-md shadow-sm mb-3">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="allWeek"
            checked={formData.workDays?.length === daysOfWeek.length}
            onChange={() => handleDayChange('AllWeek')}
            className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="allWeek" className="text-gray-700 dark:text-gray-300 font-semibold">
            Select All Week
          </label>
        </div>
    
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className={`flex items-center p-2 rounded-md border transition 
                ${formData.workDays?.includes(day) ? 
                  'bg-blue-100 dark:bg-blue-800 border-blue-400 dark:border-blue-500' : 
                  'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}
            >
              <input
                type="checkbox"
                id={day.toLowerCase()}
                checked={formData.workDays?.includes(day) || false}
                onChange={() => handleDayChange(day)}
                className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor={day.toLowerCase()} className="text-gray-700 dark:text-gray-300">
                {day}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500 dark:text-red-400">Error</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Try Again
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-0">Schedule Training Management</h1>
            <ThemeSwitcher />
          </div>
          
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Training</label>
                <select
                  value={formData.trainingId || ''}
                  onChange={(e) => setFormData({ ...formData, trainingId: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled className="dark:bg-gray-700">Select Training</option>
                  {trainingList.map((item) => (
                    <option 
                      key={item.mysqlId || item.id} 
                      value={item.mysqlId || item.id}
                      className="dark:bg-gray-700"
                    >
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Days</label>
              {renderWorkDaysCheckboxes()}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-semibold text-lg transition-colors shadow-sm"
            >
              {formData.id ? 'Update' : 'Add'}
            </button>
          </form>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm mb-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Training
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Work Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    End Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.mysqlId || item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.trainingId?.title || ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.workDays) 
                            ? item.workDays.map((day, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                                  {day}
                                </span>
                              ))
                            : typeof item.workDays === 'string' 
                              ? item.workDays.split(',').map((day, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                                    {day.trim()}
                                  </span>
                                ))
                              : 'No days'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.startTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.mysqlId || item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {scheduletrainingList.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, scheduletrainingList.length)}
                </span>{' '}
                of <span className="font-medium">{scheduletrainingList.length}</span> results
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

export default ScheduleTraining;