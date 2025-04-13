
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const ScheduleTraining = () => {
  const [formData, setFormData] = useState({});
  const [scheduletrainingList, setScheduleTrainingList] = useState([]);
  const [trainingList, setTrainingList] = useState([]);
  useEffect(() => {
    fetchScheduleTrainings();
    fetchTrainings();;
  }, []);
  const fetchScheduleTrainings = async () => {
    const response = await axios.get('http://localhost:5000/api/scheduletraining');
    setScheduleTrainingList(response.data);
  };
  const fetchTrainings = async () => {
    const response = await axios.get('http://localhost:5000/api/training');
    setTrainingList(response.data);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/scheduletraining/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/scheduletraining', formData);
    }
    fetchScheduleTrainings();
    setFormData({});
  };
  const handleEdit = (item) => {
    // Create a copy of the item to avoid direct modification
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/scheduletraining/${id}`);
    fetchScheduleTrainings();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">ScheduleTraining Management</h1>
        
        {/* Forma */}
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

  {/* Work Days - Multi-select */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1">Work Days</label>
    <select
      multiple
      value={formData.workDays || []}
      onChange={(e) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, workDays: options });
      }}
      className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none h-auto"
    >
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
      <option value="Saturday">Saturday</option>
      <option value="Sunday">Sunday</option>
    </select>
  </div>

  {/* Start Time */}
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

  {/* End Time */}
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
        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Training</th><th className="py-3 px-6 text-left">workDays</th><th className="py-3 px-6 text-left">startTime</th><th className="py-3 px-6 text-left">endTime</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {scheduletrainingList.length > 0 ? (
                scheduletrainingList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.trainingId?.title || ''}</td><td className="py-3 px-6 text-left">{item.workDays}</td><td className="py-3 px-6 text-left">{item.startTime}</td><td className="py-3 px-6 text-left">{item.endTime}</td>
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
