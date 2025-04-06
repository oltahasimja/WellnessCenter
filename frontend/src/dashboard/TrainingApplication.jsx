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
  const [trainingCapacity, setTrainingCapacity] = useState({}); // Track training capacities
  
  axios.defaults.withCredentials = true;

  useEffect(() => {
    fetchLoggedInUser();
    fetchTrainingApplications();
    fetchTrainings();
  }, []);

  const fetchLoggedInUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user');
      setLoggedInUser(response.data.user);
      setFormData(prev => ({ 
        ...prev, 
        userId: response.data.user.id
      }));
    } catch (error) {
      console.error("Error fetching logged in user:", error);
    }
  };

  const fetchTrainingApplications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trainingapplication');
      setTrainingApplicationList(response.data);
      calculateTrainingCapacity(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/training');
      setTrainingList(response.data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
  };

  // Calculate how many applications exist for each training
  const calculateTrainingCapacity = (applications) => {
    const capacityMap = {};
    applications.forEach(app => {
      const trainingId = app.trainingId?.mysqlId || app.trainingId;
      capacityMap[trainingId] = (capacityMap[trainingId] || 0) + 1;
    });
    setTrainingCapacity(capacityMap);
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

    // Check if training is full (5 applications)
    if (trainingCapacity[formData.trainingId] >= 5) {
      alert('Nuk ka vende të lira në këtë trajnim! Maksimumi 5 aplikime janë pranuar.');
      return;
    }

    try {
      const payload = {
        trainingId: formData.trainingId,
        userId: loggedInUser.id,
        status: 'Në pritje',
        applicationDate: new Date().toISOString()
      };

      if (formData.id) {
        await axios.put(`http://localhost:5000/api/trainingapplication/${formData.id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/trainingapplication', payload);
      }
      
      fetchTrainingApplications();
      setFormData({ 
        trainingId: '', 
        userId: loggedInUser.id 
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(`Gabim gjatë aplikimit: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.mysqlId || item.id,
      trainingId: item.trainingId?.mysqlId || item.trainingId,
      userId: loggedInUser.id
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurtë që dëshironi të fshini këtë aplikim?')) {
      try {
        await axios.delete(`http://localhost:5000/api/trainingapplication/${id}`);
        fetchTrainingApplications();
      } catch (error) {
        console.error("Error deleting application:", error);
      }
    }
  };

  // Check if a training is full (5 applications)
  const isTrainingFull = (trainingId) => {
    return trainingCapacity[trainingId] >= 5;
  };

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
                  value={`${loggedInUser.name} ${loggedInUser.lastName}`} 
                  readOnly 
                  className="border p-3 rounded-md w-full bg-gray-100" 
                />
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trajnimi</label>
                <select
                  value={formData.trainingId || ''}
                  onChange={(e) => setFormData({ ...formData, trainingId: e.target.value })}
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
          </>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Statusi</th>
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
                    <td className="py-3 px-6 text-left">{item.status || 'Në pritje'}</td>
                    <td className="py-3 px-6 text-left">
                      {new Date(item.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {item.userId?.name || loggedInUser.name} {item.userId?.lastName || loggedInUser.lastName}
                    </td>
                    <td className="py-3 px-6 text-left">{item.trainingId?.title || ''}</td>
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