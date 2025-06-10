import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

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
  const hasUserAppliedForTraining = (trainingId) => {
    return trainingApplications.some(app => 
      (app.trainingId?.mysqlId === trainingId || app.trainingId === trainingId) && 
      (app.userId?.id === loggedInUser?.id || app.userId?.mysqlId === loggedInUser?.id)
    );
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
  
    try {
      console.log("Preparing payload...");
      const payload = {
        trainingId: formData.trainingId.toString(), // Sigurohuni që është string
        userId: loggedInUser.id.toString(), // Sigurohuni që është string
        duration: '', // Ose merrni nga forma nëse është e nevojshme
        applicationDate: new Date().toISOString()
      };
  
      console.log("Payload to be sent:", payload);
  
      // Kontrollo nëse është update ose create
      const url = formData.id 
        ? `http://localhost:5000/api/trainingapplication/${formData.id}`
        : 'http://localhost:5000/api/trainingapplication';
  
      const method = formData.id ? 'put' : 'post';
  
      console.log(`Sending ${method} request to ${url}`);
  
      const response = await axios[method](url, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500; // Merrni parasysh të gjitha status code që nuk janë server error
        }
      });
  
      console.log("Server response:", response.data);
  
      if (response.status === 400 || response.status === 409) {
        // Gabime të njohura të biznesit
        alert(response.data.message || 'Gabim gjatë aplikimit');
        return;
      }
  
      if (response.status >= 200 && response.status < 300) {
        // Sukses
        alert('Aplikimi u dërgua me sukses!');
        await fetchTrainingApplications();
        setFormData({ 
          trainingId: '', 
          userId: loggedInUser.id 
        });
        setSelectedTrainingSchedule(null);
        return;
      }
  
      // Raste të tjera
      alert('Përgjigje e papritur nga serveri');
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
  
      let errorMessage = 'Gabim gjatë aplikimit: ';
      
      if (error.response) {
        // Gabimet nga serveri
        if (error.response.data && error.response.data.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += `${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Gabime në kërkesë (pa përgjigje)
        errorMessage += 'Nuk u mor përgjigje nga serveri';
      } else {
        // Gabime të tjera
        errorMessage += error.message;
      }
  
      alert(errorMessage);
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

  const hasUserApplied = () => {
    return trainingApplications.some(app => 
      app.userId?.id === loggedInUser?.id || 
      app.userId?.mysqlId === loggedInUser?.id
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-emerald-100">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl text-center backdrop-blur-sm bg-opacity-95">
          <div className="animate-spin w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold mb-4 text-teal-800">Duke u ngarkuar...</h1>
          <p className="text-teal-600">Ju lutem prisni ndërsa ngarkohen të dhënat</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-emerald-100">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl text-center backdrop-blur-sm bg-opacity-95">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-red-500">Gabim</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-emerald-100 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 mt-[5rem]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent sm:text-6xl lg:text-7xl">
              {isAdmin ? 'Menaxhimi i Aplikimeve për Trajnime' : 'Aplikoni për Trajnime'}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-teal-700 sm:mt-6">
              {isAdmin ? 'Menaxhoni aplikimet për trajnime' : 'Zgjidhni dhe aplikoni për trajnimet e disponueshme'}
            </p>
          </div>

          {!loggedInUser ? (
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden md:max-w-2xl p-8 text-center backdrop-blur-sm bg-opacity-95">
              <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Kërkohet Kyçja në Sistem</h3>
                <p className="text-red-600">
                  Duhet të jeni i kyçur për të aplikuar për trajnime. Ju lutem kyçuni në llogarinë tuaj.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Application Form - Only shown if admin or if user has no applications */}
              {(isAdmin || !hasUserApplied()) && (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 backdrop-blur-sm bg-opacity-95">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">
                      {formData.id ? '✏️ Përditëso Aplikimin' : '🎯 Apliko për Trajnim'}
                    </h2>
                  </div>
                  <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div>
                          <label htmlFor="user" className="block text-sm font-semibold text-teal-800 mb-2">
                            👤 Përdoruesi
                          </label>
                          <input
                            id="user"
                            type="text"
                            value={`${loggedInUser.name || ''} ${loggedInUser.lastName || ''}`}
                            readOnly
                            className="block w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:ring-4 focus:ring-teal-200 focus:border-teal-500 bg-teal-50 text-teal-800 font-medium transition-all duration-300" />
                        </div>

                        <div>
                          <label htmlFor="training" className="block text-sm font-semibold text-teal-800 mb-2">
                            📚 Trajnimi
                          </label>
                          <select
  id="training"
  value={formData.trainingId || ''}
  onChange={handleTrainingSelect}
  className="block w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300"
  required
>
  <option value="" disabled>Zgjidhni Trajnimin</option>
  {trainings
    .filter(training => !hasUserAppliedForTraining(training.mysqlId || training.id))
    .map((item) => {
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
                            <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                              ⚠️ Ky trajnim ka arritur numrin maksimal të aplikimeve (5). Ju lutem zgjidhni një trajnim tjetër.
                            </p>
                          )}
                        </div>
                      </div>

                      {selectedTrainingSchedule && selectedTrainingSchedule.length > 0 && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border-2 border-teal-200">
                          <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-teal-800">📅 Orari i Trajnimit</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedTrainingSchedule.map((schedule, index) => (
                              <div key={index} className="bg-white p-4 rounded-xl shadow-lg border border-teal-100">
                                <p className="font-semibold text-teal-700 mb-1">📅 Ditët: <span className="font-normal text-gray-600">{schedule.workDays?.join(', ') || 'N/A'}</span></p>
                                <p className="font-semibold text-teal-700 mb-1">🕐 Fillimi: <span className="font-normal text-gray-600">{schedule.startTime || 'N/A'}</span></p>
                                <p className="font-semibold text-teal-700">🕔 Përfundimi: <span className="font-normal text-gray-600">{schedule.endTime || 'N/A'}</span></p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className={`px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all duration-300 transform hover:scale-105 ${formData.trainingId && isTrainingFull(formData.trainingId)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-teal-200'}`}
                          disabled={formData.trainingId && isTrainingFull(formData.trainingId)}
                        >
                          {formData.id ? '✏️ Përditëso Aplikimin' : '🚀 Apliko për Trajnim'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* My Applications Section */}
              {!isAdmin && hasUserApplied() && (
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                      Aplikimet e Mia
                    </h2>
                  </div>

                  <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {trainingApplications
                      .filter(app => 
                        app.userId?.id === loggedInUser.id || 
                        app.userId?.mysqlId === loggedInUser.id
                      )
                      .map((item) => (
                        <div key={item.mysqlId || item.id} className="bg-white overflow-hidden shadow-2xl rounded-3xl backdrop-blur-sm bg-opacity-95 transition-all duration-300 transform hover:scale-105 hover:shadow-teal-200">
                          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div className="ml-4 flex-1">
                                <h3 className="text-lg font-bold text-white">
                                  {item.trainingId?.title || 'Unknown Training'}
                                </h3>
                                <p className="text-teal-100 text-sm">
                                  📅 Aplikuar më: {item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-6 py-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <dt className="text-sm font-semibold text-teal-700">
                                  ⏰ Kohëzgjatja
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 font-medium">
                                  {item.trainingId?.duration || 'N/A'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-semibold text-teal-700">
                                  📊 Statusi
                                </dt>
                                <dd className="mt-1">
                                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                    ✅ Aktiv
                                  </span>
                                </dd>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(item)}
                                className="inline-flex items-center px-4 py-2 border-2 border-teal-300 text-sm font-semibold rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all duration-300 transform hover:scale-105"
                              >
                                ✏️ Edito
                              </button>
                              <button
                                onClick={() => handleDelete(item.mysqlId || item.id)}
                                className="inline-flex items-center px-4 py-2 border-2 border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                              >
                                🗑️ Fshi
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
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                      Të gjitha Aplikimet
                    </h2>
                  </div>

                  <div className="bg-white shadow-2xl overflow-hidden rounded-3xl backdrop-blur-sm bg-opacity-95">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-teal-200">
                        <thead className="bg-gradient-to-r from-teal-500 to-emerald-500">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                              👤 Përdoruesi
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                              📚 Trajnimi
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                              ⏰ Kohëzgjatja
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                              📅 Data e Aplikimit
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                              📊 Statusi
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                              ⚙️ Veprime
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-teal-100">
                          {trainingApplications.length > 0 ? (
                            trainingApplications.map((item) => (
                              <tr key={item.mysqlId || item.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-all duration-300">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-teal-800">
                                    {item.userId?.name || 'Unknown'} {item.userId?.lastName || ''}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-teal-800">
                                    {item.trainingId?.title || 'Unknown Training'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600">
                                    {item.trainingId?.duration || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600">
                                    {item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                    ✅ Aktiv
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="mr-3 text-teal-600 hover:text-teal-800 font-semibold transition-colors duration-300"
                                  >
                                    ✏️ Edito
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.mysqlId || item.id)}
                                    className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-300"
                                  >
                                    🗑️ Fshi
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-6 py-8 text-center text-sm text-teal-600">
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  📋 Nuk ka asnjë aplikim për trajnime.
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Trainings Section */}
              <div className="mt-16">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl mb-6 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent sm:text-5xl">
                    🎓 Trajnimet e Disponueshme
                  </h2>
                  <p className="mt-4 max-w-2xl mx-auto text-xl text-teal-700 sm:mt-6">
                    Zgjidhni një nga trajnimet e disponueshme për të aplikuar
                  </p>
                </div>

                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {trainings.map((training) => {
                    const trainingId = training.mysqlId || training.id;
                    const isFull = isTrainingFull(trainingId);
                    const userApplication = trainingApplications.find(app => 
                      (app.trainingId?.mysqlId || app.trainingId) === trainingId &&
                      (app.userId?.id === loggedInUser.id || app.userId?.mysqlId === loggedInUser.id)
                    );

                    return (
                      <div
                        key={trainingId}
                        className={`flex flex-col rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 backdrop-blur-sm bg-opacity-95 ${isFull ? 'opacity-75' : 'hover:shadow-teal-200 hover:-translate-y-2 transform'}`}
                      >
                        <div className="flex-1 bg-white p-8 flex flex-col justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border border-teal-200">
                                ⏰ {training.duration || 'N/A'}
                              </span>
                              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${isFull
                                  ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
                                  : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'}`}>
                                {isFull ? '🚫 I plotë' : `✅ ${5 - (trainingCapacity[trainingId] || 0)} vende të lira`}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-teal-800 mb-4">
                              📚 {training.title}
                            </h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                              {training.description || 'Nuk ka përshkrim të disponueshëm për këtë trajnim.'}
                            </p>
                          </div>

                          <div className="mt-8">
                            {userApplication ? (
                              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                                <div className="flex items-center justify-center mb-2">
                                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <p className="text-sm font-bold text-green-800">
                                    ✅ Ju keni aplikuar për këtë trajnim
                                  </p>
                                </div>
                                <p className="text-xs text-green-600 mt-2">
                                  Ju mund të shikoni aplikimin tuaj në seksionin "Aplikimet e Mia" ose të fshini aplikimin ekzistues për të aplikuar për një trajnim tjetër.
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!isFull && !hasUserApplied()) {
                                    setFormData({ trainingId, userId: loggedInUser.id });
                                    fetchTrainingSchedule(trainingId);
                                  }
                                }}
                                className={`w-full flex items-center justify-center px-6 py-4 border-2 border-transparent text-base font-bold rounded-2xl shadow-xl text-white transition-all duration-300 transform ${isFull || hasUserApplied()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 hover:scale-105 shadow-teal-200'}`}
                                disabled={isFull || hasUserApplied()}
                              >
                                {isFull ? '🚫 Trajnimi i plotë' : hasUserApplied() ? '❌ Ju keni një aplikim aktiv' : '🚀 Apliko tani'}
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
    </>
  );
};

export default TrainingApplicationn;