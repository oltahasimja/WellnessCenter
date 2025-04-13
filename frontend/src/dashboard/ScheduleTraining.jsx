import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScheduleTraining = () => {
  const [formData, setFormData] = useState({ workDays: [] });
  const [scheduletrainingList, setScheduleTrainingList] = useState([]);
  const [trainingList, setTrainingList] = useState([]);
  const [error, setError] = useState(null);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    fetchScheduleTrainings();
    fetchTrainings();
  }, []);

  const fetchScheduleTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/scheduletraining');
      setScheduleTrainingList(response.data);
    } catch (err) {
      setError('Failed to fetch schedule trainings');
      console.error(err);
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/training');
      setTrainingList(response.data);
    } catch (err) {
      setError('Failed to fetch trainings');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Krijo një kopje të të dhënave për dërgim
      const dataToSend = {
        ...formData,
        workDays: formData.workDays
      };

      if (formData.id) {
        await axios.put(`http://localhost:5000/api/scheduletraining/${formData.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/scheduletraining', dataToSend);
      }
      
      fetchScheduleTrainings();
      setFormData({ workDays: [] });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule training');
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    // Konverto workDays në array nëse është string
    let workDaysArray = [];
    if (typeof item.workDays === 'string') {
      workDaysArray = item.workDays.split(',').map(day => day.trim());
    } else if (Array.isArray(item.workDays)) {
      workDaysArray = [...item.workDays];
    }

    // Krijo objektin e të dhënave për editim
    const editData = {
      ...item,
      id: item.mysqlId || item._id,
      trainingId: item.trainingId?.mysqlId || item.trainingId?._id || item.trainingId,
      workDays: workDaysArray
    };

    setFormData(editData);
  };

  // ... (pjesa tjetër e kodit mbetet e njëjtë)

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/scheduletraining/${id}`);
    fetchScheduleTrainings();
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
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md shadow-sm mb-3">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="allWeek"
            checked={formData.workDays?.length === daysOfWeek.length}
            onChange={() => handleDayChange('AllWeek')}
            className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="allWeek" className="text-gray-700 font-semibold">
            Select All Week
          </label>
        </div>
    
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className={`flex items-center p-2 rounded-md border transition 
                ${formData.workDays?.includes(day) ? 
                  'bg-blue-100 border-blue-400' : 
                  'bg-white border-gray-300'}`}
            >
              <input
                type="checkbox"
                id={day.toLowerCase()}
                checked={formData.workDays?.includes(day) || false}
                onChange={() => handleDayChange(day)}
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={day.toLowerCase()} className="text-gray-700">
                {day}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">ScheduleTraining Management</h1>
        
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Training</label>
            <select
              value={formData.trainingId || ''}
              onChange={(e) => setFormData({ ...formData, trainingId: e.target.value })}
              className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled>Select Training</option>
              {trainingList.map((item) => (
                <option key={item.mysqlId} value={item.mysqlId}>{item.title}</option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Days</label>
            {renderWorkDaysCheckboxes()}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={formData.endTime || ''}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Training</th>
                <th className="py-3 px-6 text-left">workDays</th>
                <th className="py-3 px-6 text-left">startTime</th>
                <th className="py-3 px-6 text-left">endTime</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {scheduletrainingList.length > 0 ? (
                scheduletrainingList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.trainingId?.title || ''}</td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.workDays) 
                          ? item.workDays.map((day, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 rounded text-xs">
                                {day}
                              </span>
                            ))
                          : typeof item.workDays === 'string' 
                            ? item.workDays.split(',').map((day, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-200 rounded text-xs">
                                  {day.trim()}
                                </span>
                              ))
                            : 'No days'}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">{item.startTime}</td>
                    <td className="py-3 px-6 text-left">{item.endTime}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
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

export default ScheduleTraining;