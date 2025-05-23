import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  
  axios.defaults.withCredentials = true;

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

  const fetchLoggedInUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user');
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
      const response = await axios.get('http://localhost:5000/api/trainingapplication');
      // Ensure each item has proper user and training data
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
      const response = await axios.get('http://localhost:5000/api/training');
      setTrainingList(response.data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setError('Failed to fetch trainings list');
    }
  };

  const fetchTrainingSchedule = async (trainingId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scheduleTraining`);
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
        await axios.put(`http://localhost:5000/api/trainingapplication/${formData.id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/trainingapplication', payload);
      }
      
      await fetchTrainingApplications();
      setFormData({ 
        trainingId: '', 
        userId: loggedInUser.id 
      });
      setSelectedTrainingSchedule(null);
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
        await axios.delete(`http://localhost:5000/api/trainingapplication/${id}`);
        await fetchTrainingApplications();
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">Duke u ngarkuar...</h1>
          <p className="text-gray-600">Ju lutem prisni ndërsa ngarkohen të dhënat</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500">Gabim</h1>
          <p className="text-gray-600">{error}</p>
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Menaxhimi i Aplikimeve për Trajnime</h1>
        
        {!loggedInUser ? (
          <div className="text-center text-red-500 mb-6">
            Duhet të jeni i loguar për të aplikuar për trajnime!
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Përdoruesi</label>
                <input 
                  type="text" 
                  value={`${loggedInUser.name || ''} ${loggedInUser.lastName || ''}`} 
                  readOnly 
                  className="border p-3 rounded-md w-full bg-gray-100" 
                />
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trajnimi</label>
                <select
                  value={formData.trainingId || ''}
                  onChange={handleTrainingSelect}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="" disabled>Zgjidhni Trajnimin</option>
                  {trainingList.map((item) => {
                    const trainingId = item.mysqlId || item.id;
                    const isFull = isTrainingFull(trainingId);
                    return (
                      <option 
                        key={trainingId} 
                        value={trainingId}
                        disabled={isFull}
                      >
                        {item.title} {isFull ? ' (I plotë)' : ''}
                      </option>
                    );
                  })}
                </select>
                {formData.trainingId && isTrainingFull(formData.trainingId) && (
                  <p className="text-red-500 text-sm mt-1">
                    Ky trajnim ka arritur numrin maksimal të aplikimeve (5). Ju lutem zgjidhni një trajnim tjetër.
                  </p>
                )}
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg"
                disabled={formData.trainingId && isTrainingFull(formData.trainingId)}
              >
                {formData.id ? 'Përditëso' : 'Apliko'}
              </button>
            </form>

            {selectedTrainingSchedule && selectedTrainingSchedule.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Orari i Trajnimit të Selektuar</h2>
                {selectedTrainingSchedule.map((schedule, index) => (
                  <div key={index} className="mb-4">
                    <p><strong>Ditët:</strong> {schedule.workDays?.join(', ') || 'N/A'}</p>
                    <p><strong>Koha e fillimit:</strong> {schedule.startTime || 'N/A'}</p>
                    <p><strong>Koha e përfundimit:</strong> {schedule.endTime || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Duration</th>
                <th className="py-3 px-6 text-left">Data e Aplikimit</th>
                <th className="py-3 px-6 text-left">Përdoruesi</th>
                <th className="py-3 px-6 text-left">Trajnimi</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {trainingapplicationList.length > 0 ? (
                trainingapplicationList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.trainingId?.duration || 'N/A'}</td>
                    <td className="py-3 px-6 text-left">
                      {item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {item.userId?.name || 'Unknown'} {item.userId?.lastName || ''}
                    </td>
                    <td className="py-3 px-6 text-left">{item.trainingId?.title || 'Unknown Training'}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Edito
                      </button>
                      <button 
                        onClick={() => handleDelete(item.mysqlId || item.id)} 
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Fshi
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingApplication;