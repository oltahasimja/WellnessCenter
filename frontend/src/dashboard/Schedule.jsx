import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';

const Schedule = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ workDays: [] });
  const [scheduleList, setScheduleList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/user/specialists');
      // console.log("Specialists data:", usersResponse.data);
      setUserList(usersResponse.data);
      
      const schedulesResponse = await axios.get('http://localhost:5000/api/schedule');
      // console.log("Schedules data:", schedulesResponse.data);
      
      const schedulesWithNames = schedulesResponse.data.map(schedule => {
        const specialistId = typeof schedule.specialistId === 'object' ? 
          schedule.specialistId._id : schedule.specialistId;
        
        const specialist = usersResponse.data.find(user => 
          user._id === specialistId || 
          user._id.toString() === specialistId
        );
        
    
        let roleName = 'No Role';
        // let roleDebug = { reason: 'Default initialization' };
        
        // Try to get role from the specialist
        if (specialist) {
          if (specialist.roleId) {
            if (typeof specialist.roleId === 'object' && specialist.roleId.name) {
              roleName = specialist.roleId.name;
            
            
            }
          }
        }
       
        
        return {
          ...schedule,
          specialistName: specialist ? 
            `${specialist.name} ${specialist.lastName}` : 
            (schedule.specialistId && typeof schedule.specialistId === 'object' && 
             schedule.specialistId.name && schedule.specialistId.lastName) ?
            `${schedule.specialistId.name} ${schedule.specialistId.lastName}` :
            'Unknown Specialist',
          specialistRole: roleName,
          specialistObj: specialist || null,
          // _debugRoleInfo: roleDebug // For debugging
        };
      });
      
      // setDebugInfo(debugData);
      setScheduleList(schedulesWithNames);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      // setDebugInfo({ error: err.toString(), stack: err.stack });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const specialist = userList.find(user => user._id === formData.specialistId);
      console.log("Selected specialist for submission:", specialist);
      
      const dataToSend = {
        ...formData,
        workDays: formData.workDays.join(', ')
      };
      
      let response;
      if (formData.id) {
        response = await axios.put(`http://localhost:5000/api/schedule/${formData.id}`, dataToSend);
      } else {
        response = await axios.post('http://localhost:5000/api/schedule', dataToSend);
      }
      
      const newSchedule = response.data;
      console.log("API response for schedule:", newSchedule);
      
      // Get the role name
      let roleName = 'No Role';
      let roleDebug = { reason: 'Default initialization' };
      
      if (specialist) {
        if (specialist.roleId) {
          if (typeof specialist.roleId === 'object' && specialist.roleId.name) {
            roleName = specialist.roleId.name;
            roleDebug = { reason: 'Found role object with name', roleObject: specialist.roleId };
          } else if (typeof specialist.roleId === 'string') {
            roleName = 'Role ID Only (String)';
            roleDebug = { reason: 'Role is string ID only', roleId: specialist.roleId };
          } else {
            roleDebug = { 
              reason: 'Role exists but is not usable', 
              roleType: typeof specialist.roleId,
              roleValue: specialist.roleId
            };
          }
        } else {
          roleDebug = { 
            reason: 'No roleId property on specialist', 
            specialistKeys: Object.keys(specialist)
          };
        }
      } else {
        roleDebug = { 
          reason: 'No matching specialist found', 
          searchedId: formData.specialistId 
        };
      }
      
      const scheduleWithName = {
        ...newSchedule,
        specialistName: specialist 
          ? `${specialist.name} ${specialist.lastName}` 
          : newSchedule.specialistName || 'Unknown Specialist',
        specialistRole: roleName,
        specialistObj: specialist || newSchedule.specialistObj || null,
        _debugRoleInfo: roleDebug // For debugging
      };
      
      if (formData.id) {
        setScheduleList(prev => prev.map(item => 
          item._id === newSchedule._id ? scheduleWithName : item
        ));
      } else {
        setScheduleList(prev => [scheduleWithName, ...prev]);
      }
      
      setFormData({ workDays: [] });
    } catch (err) {
      console.error("Error submitting schedule:", err);
      setError("Failed to save schedule. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rest of the component remains the same...
  const handleEdit = (item) => {
    let workDaysArray = [];
    
    if (typeof item.workDays === 'string') {
      workDaysArray = item.workDays.split(',')
        .map(day => day.trim())
        .filter(day => day.length > 0);
    } else if (Array.isArray(item.workDays)) {
      workDaysArray = [...item.workDays];
    }
    
    setFormData({
      ...item,
      id: item.mysqlId || item._id,
      specialistId: item.specialistObj?._id || item.specialistId,
      workDays: workDaysArray
    });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/schedule/${id}`);
        setScheduleList(prev => prev.filter(item => 
          (item.mysqlId !== id) && (item._id !== id)
        ));
      } catch (err) {
        console.error("Error deleting schedule:", err);
        setError("Failed to delete schedule. Please try again.");
        fetchData();
      } finally {
        setIsLoading(false);
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
      <>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allWeek"
            checked={formData.workDays?.length === daysOfWeek.length}
            onChange={() => handleDayChange('AllWeek')}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor="allWeek" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>All Week</label>
        </div>
        
        {daysOfWeek.map(day => (
          <div key={day} className="flex items-center">
            <input
              type="checkbox"
              id={day.toLowerCase()}
              checked={formData.workDays?.includes(day) || false}
              onChange={() => handleDayChange(day)}
              className="mr-2"
              disabled={isLoading}
            />
            <label htmlFor={day.toLowerCase()} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{day}</label>
          </div>
        ))}
      </>
    );
  };
  
  return (
    <div className={` ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`shadow-xl rounded-lg p-8 w-full max-w-10xl ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700'}`}>
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Schedule Management</h1>
        
        {error && (
          <div className={`mb-4 p-4 rounded ${theme === 'dark' ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'}`}>
            {error}
          </div>
        )}
        
        {debugInfo && (
          <div className="mb-6 p-4 border rounded bg-gray-100 text-black overflow-x-auto">
            <h3 className="font-bold">Debug Information:</h3>
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Specialist</label>
            <select
              value={formData.specialistId || ''}
              onChange={(e) => {
                const selectedSpecialist = userList.find(user => user._id === e.target.value);
                // console.log("Selected specialist:", selectedSpecialist);
                setFormData({ 
                  ...formData, 
                  specialistId: e.target.value,
                  specialistObj: selectedSpecialist
                });
              }}
              className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
              disabled={isLoading}
            >
              <option value="">Select Specialist</option>
              {userList.map((item) => {
                // console.log(`Specialist ${item.name}'s roleId:`, item.roleId);
                const roleDisplay = item.roleId && typeof item.roleId === 'object' && item.roleId.name 
                  ? item.roleId.name 
                  : 'No Role';
                
                return (
                  <option key={item._id} value={item._id}>
                    {item.name} {item.lastName} ({roleDisplay})
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Rest of the form remains the same */}
          <div>
            <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Work Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {renderWorkDaysCheckboxes()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Start Time</label>
              <input 
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>End Time</label>
              <input 
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Break Start Time</label>
              <input 
                type="time"
                value={formData.breakStartTime || ''}
                onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Break End Time</label>
              <input 
                type="time"
                value={formData.breakEndTime || ''}
                onChange={(e) => setFormData({ ...formData, breakEndTime: e.target.value })}
                className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-2 rounded-md transition duration-200 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (formData.id ? 'Update Schedule' : 'Add Schedule')}
          </button>
        </form>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Loading schedules...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse shadow-md rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
              <thead>
                <tr className={`uppercase text-sm ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'}`}>
                  <th className="py-3 px-6">Specialist</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Work Days</th>
                  <th className="py-3 px-6">Start Time</th>
                  <th className="py-3 px-6">End Time</th>
                  <th className="py-3 px-6">Break Start</th>
                  <th className="py-3 px-6">Break End</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
              {scheduleList.length > 0 ? (
                scheduleList.map((item) => (
                  <tr 
                    key={item._id || item.mysqlId} 
                    className={`border-b ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <td className="py-3 px-6">
                      {item.specialistObj 
                        ? `${item.specialistObj.name} ${item.specialistObj.lastName}`
                        : item.specialistName || 'Unknown Specialist'}
                    </td>
                    <td className="py-3 px-6 relative group">
                      {item.specialistRole}
                      <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-64 left-0 mt-1">
                        {/* {JSON.stringify(item._debugRoleInfo, null, 2)} */}
                      </div>
                    </td>
                    <td className="py-3 px-6">{item.workDays}</td>
                    <td className="py-3 px-6">{item.startTime}</td>
                    <td className="py-3 px-6">{item.endTime}</td>
                    <td className="py-3 px-6">{item.breakStartTime || '-'}</td>
                    <td className="py-3 px-6">{item.breakEndTime || '-'}</td>
                    <td className="py-3 px-6 flex space-x-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className={`py-1 px-3 rounded-md transition duration-200 ${theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.mysqlId || item._id)}
                        className={`py-1 px-3 rounded-md transition duration-200 ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={`py-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No schedules found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;