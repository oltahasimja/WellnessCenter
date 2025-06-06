import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrainingApplicationn = () => {
  const [formData, setFormData] = useState({ 
    trainingId: '',
    userId: null 
  });
  const [trainingApplications, setTrainingApplications] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [trainingCapacity, setTrainingCapacity] = useState({});
  const [selectedTrainingSchedule, setSelectedTrainingSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
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
      setIsAdmin(response.data.user?.role === 'admin');
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
      const processedData = response.data.map(item => ({
        ...item,
        userId: item.userId || { name: 'Unknown', lastName: '' },
        trainingId: item.trainingId || { title: 'Unknown Training', duration: '' }
      }));
      setTrainingApplications(processedData);
      calculateTrainingCapacity(processedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError('Failed to fetch training applications');
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/training');
      setTrainings(response.data);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {isAdmin ? 'Menaxhimi i Aplikimeve për Trajnime' : 'Aplikoni për Trajnime'}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {isAdmin ? 'Menaxhoni aplikimet për trajnime' : 'Zgjidhni dhe aplikoni për trajnimet e disponueshme'}
          </p>
        </div>

        {!loggedInUser ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 text-center">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="text-lg font-medium text-red-800">Kërkohet Kyçja në Sistem</h3>
              <p className="mt-2 text-red-600">
                Duhet të jeni i kyçur për të aplikuar për trajnime. Ju lutem kyçuni në llogarinë tuaj.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Application Form - Only shown if admin or if user has no applications */}
            {(isAdmin || trainingApplications.filter(app => app.userId?.id === loggedInUser.id).length === 0) && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {formData.id ? 'Përditëso Aplikimin' : 'Apliko për Trajnim'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                          Përdoruesi
                        </label>
                        <input
                          id="user"
                          type="text"
                          value={`${loggedInUser.name || ''} ${loggedInUser.lastName || ''}`}
                          readOnly
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        />
                      </div>

                      <div>
                        <label htmlFor="training" className="block text-sm font-medium text-gray-700 mb-1">
                          Trajnimi
                        </label>
                        <select
                          id="training"
                          value={formData.trainingId || ''}
                          onChange={handleTrainingSelect}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="" disabled>Zgjidhni Trajnimin</option>
                          {trainings.map((item) => {
                            const trainingId = item.mysqlId || item.id;
                            const isFull = isTrainingFull(trainingId);
                            return (
                              <option 
                                key={trainingId} 
                                value={trainingId}
                                disabled={isFull}
                                className={isFull ? 'text-gray-400' : ''}
                              >
                                {item.title} {isFull ? ' (I plotë)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {formData.trainingId && isTrainingFull(formData.trainingId) && (
                          <p className="mt-2 text-sm text-red-600">
                            Ky trajnim ka arritur numrin maksimal të aplikimeve (5). Ju lutem zgjidhni një trajnim tjetër.
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedTrainingSchedule && selectedTrainingSchedule.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-medium text-blue-800 mb-3">Orari i Trajnimit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {selectedTrainingSchedule.map((schedule, index) => (
                            <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                              <p className="font-medium text-gray-700">Ditët: <span className="font-normal">{schedule.workDays?.join(', ') || 'N/A'}</span></p>
                              <p className="font-medium text-gray-700">Fillimi: <span className="font-normal">{schedule.startTime || 'N/A'}</span></p>
                              <p className="font-medium text-gray-700">Përfundimi: <span className="font-normal">{schedule.endTime || 'N/A'}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className={`px-6 py-3 rounded-md font-semibold text-white shadow-sm transition-colors duration-200 ${
                          formData.trainingId && isTrainingFull(formData.trainingId)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={formData.trainingId && isTrainingFull(formData.trainingId)}
                      >
                        {formData.id ? 'Përditëso Aplikimin' : 'Apliko për Trajnim'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* My Applications Section */}
            {!isAdmin && trainingApplications.filter(app => app.userId?.id === loggedInUser.id).length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Aplikimet e Mia
                </h2>
                
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {trainingApplications
                    .filter(app => app.userId?.id === loggedInUser.id)
                    .map((item) => (
                      <div key={item.mysqlId || item.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.trainingId?.title || 'Unknown Training'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Aplikuar më: {item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="border-t border-gray-200 pt-4">
                              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Kohëzgjatja
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {item.trainingId?.duration || 'N/A'}
                                  </dd>
                                </div>
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Statusi
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Aktiv
                                    </span>
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                          <div className="mt-5 flex justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Edito
                            </button>
                            <button
                              onClick={() => handleDelete(item.mysqlId || item.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Fshi
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Admin View - Show all applications */}
            {isAdmin && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Të gjitha Aplikimet
                </h2>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Përdoruesi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trajnimi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kohëzgjatja
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data e Aplikimit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statusi
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Veprime
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trainingApplications.length > 0 ? (
                        trainingApplications.map((item) => (
                          <tr key={item.mysqlId || item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.userId?.name || 'Unknown'} {item.userId?.lastName || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.trainingId?.title || 'Unknown Training'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.trainingId?.duration || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Aktiv
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(item)}
                                className="mr-2 text-yellow-600 hover:text-yellow-900"
                              >
                                Edito
                              </button>
                              <button
                                onClick={() => handleDelete(item.mysqlId || item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Fshi
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            Nuk ka asnjë aplikim për trajnime.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Available Trainings Section */}
            <div className="mt-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-4xl">
                  Trajnimet e Disponueshme
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                  Zgjidhni një nga trajnimet e disponueshme për të aplikuar
                </p>
              </div>

              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {trainings.map((training) => {
                  const trainingId = training.mysqlId || training.id;
                  const isFull = isTrainingFull(trainingId);
                  const userApplication = trainingApplications.find(app => 
                    (app.trainingId?.mysqlId || app.trainingId) === trainingId && 
                    app.userId?.id === loggedInUser.id
                  );

                  return (
                    <div 
                      key={trainingId} 
                      className={`flex flex-col rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                        isFull ? 'opacity-75' : 'hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {training.duration || 'N/A'}
                            </span>
                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                              isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {isFull ? 'I plotë' : `${5 - (trainingCapacity[trainingId] || 0)} vende të lira`}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {training.title}
                          </h3>
                          <p className="mt-3 text-base text-gray-500">
                            {training.description || 'Nuk ka përshkrim të disponueshëm për këtë trajnim.'}
                          </p>
                        </div>
                        
                        <div className="mt-6">
                          {userApplication ? (
                            <div className="w-full bg-green-50 border border-green-200 rounded-md p-3 text-center">
                              <p className="text-sm font-medium text-green-800">
                                Ju keni aplikuar për këtë trajnim
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (!isFull) {
                                  setFormData({ trainingId, userId: loggedInUser.id });
                                  fetchTrainingSchedule(trainingId);
                                }
                              }}
                              className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                                isFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                              disabled={isFull}
                            >
                              {isFull ? 'Trajnimi i plotë' : 'Apliko tani'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingApplicationn;