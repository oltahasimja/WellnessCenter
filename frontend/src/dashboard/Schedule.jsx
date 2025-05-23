import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import DeleteConfirmation from '../components/DeleteConfirmation';

const Schedule = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ workDays: [] });
  const [scheduleList, setScheduleList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Add state for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false, 
    itemId: null,
    itemName: ''
  });
  
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
      setUserList(usersResponse.data);
      
      const schedulesResponse = await axios.get('http://localhost:5000/api/schedule');
      
      const schedulesWithNames = schedulesResponse.data.map(schedule => {
        const specialistId = typeof schedule.specialistId === 'object' ? 
          schedule.specialistId._id : schedule.specialistId;
        
        const specialist = usersResponse.data.find(user => 
          user._id === specialistId || 
          user._id.toString() === specialistId
        );
        
        let roleName = 'No Role';
        
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
        };
      });
      
      setScheduleList(schedulesWithNames);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  const validateTimes = (startTime, endTime) => {
  if (!startTime || !endTime) return true; // Allow empty during form filling
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  // Convert times to total minutes for easier comparison
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  
  return startTotal < endTotal;
};
const [validationErrors, setValidationErrors] = useState({
  timeConflict: false,
  breakTimeConflict: false
});const validateBreakWithinWorkHours = (startTime, endTime, breakStart, breakEnd) => {
  if (!breakStart || !breakEnd) return true;
  
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start = convertToMinutes(startTime);
  const end = convertToMinutes(endTime);
  const breakS = convertToMinutes(breakStart);
  const breakE = convertToMinutes(breakEnd);
  
  return breakS >= start && breakE <= end && breakS < breakE;
};
  const handleSubmit = async (e) => {
     e.preventDefault();
  
  // Validate times
  if (!validateTimes(formData.startTime, formData.endTime)) {
    setValidationErrors({
      ...validationErrors,
      timeConflict: true
    });
    return;
  }
  
  // Validate break times if they exist
  if (formData.breakStartTime && formData.breakEndTime) {
    if (!validateTimes(formData.breakStartTime, formData.breakEndTime)) {
      setValidationErrors({
        ...validationErrors,
        breakTimeConflict: true
      });
      return;
    }
    
    // Also validate that break is within work hours
    const isBreakValid = validateBreakWithinWorkHours(
      formData.startTime, 
      formData.endTime,
      formData.breakStartTime,
      formData.breakEndTime
    );
    
    if (!isBreakValid) {
      setValidationErrors({
        ...validationErrors,
        breakTimeConflict: true
      });
      return;
    }
  }
  
  // Reset validation errors if everything is valid
  setValidationErrors({
    timeConflict: false,
    breakTimeConflict: false
  });
  
  // Rest of your existing submit logic...
 
    setIsLoading(true);
    setError(null);
    
    try {
      const specialist = userList.find(user => user._id === formData.specialistId);
      console.log("Selected specialist for submission:", specialist);
      
      const dataToSend = {
        ...formData,
        workDays: formData.workDays 
      };
      
      let response;
      if (formData.id) {
        response = await axios.put(`http://localhost:5000/api/schedule/${formData.id}`, dataToSend);
      } else {
        response = await axios.post('http://localhost:5000/api/schedule', dataToSend);
      }
      
      const newSchedule = response.data;
      
      // Get the role name
      let roleName = 'No Role';
      
      if (specialist) {
        if (specialist.roleId) {
          if (typeof specialist.roleId === 'object' && specialist.roleId.name) {
            roleName = specialist.roleId.name;
          } else if (typeof specialist.roleId === 'string') {
            roleName = 'Role ID Only (String)';
          }
        }
      }
      
      const scheduleWithName = {
        ...newSchedule,
        specialistName: specialist 
          ? `${specialist.name} ${specialist.lastName}` 
          : newSchedule.specialistName || 'Unknown Specialist',
        specialistRole: roleName,
        specialistObj: specialist || newSchedule.specialistObj || null,
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
  
  // Modified to open the delete confirmation modal
  const handleDeleteClick = (item) => {
    const itemName = item.specialistName || 'this schedule';
    setDeleteModal({
      isOpen: true,
      itemId: item.mysqlId || item._id,
      itemName: itemName
    });
  };
  
  // Handle the actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${deleteModal.itemId}`);
      setScheduleList(prev => prev.filter(item => 
        (item.mysqlId !== deleteModal.itemId) && (item._id !== deleteModal.itemId)
      ));
      // Close the modal after successful deletion
      setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError("Failed to delete schedule. Please try again.");
      fetchData();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Close the delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
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
      <div className="col-span-full bg-blue-50 dark:bg-blue-900/20 border dark:border-blue-700 border-blue-200 p-4 rounded-md shadow-sm mb-3">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="allWeek"
            checked={formData.workDays?.length === daysOfWeek.length}
            onChange={() => handleDayChange('AllWeek')}
            className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="allWeek" className={theme === 'dark' ? 'text-gray-300 font-semibold' : 'text-gray-700 font-semibold'}>
            Select All Week
          </label>
        </div>
    
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {daysOfWeek.map(day => (
    <div
        key={day}
        className={`flex items-center p-2 rounded-md border transition 
            ${formData.workDays?.includes(day) ? 
                (theme === 'dark' ? 'bg-blue-800 border-blue-500' : 'bg-blue-100 border-blue-400') : 
                (theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300')}`}
        onClick={(e) => {
            if (e.target.tagName !== 'INPUT') {
                handleDayChange(day);
            }
        }}
        style={{cursor: 'pointer'}} 
    >
        <input
            type="checkbox"
            id={day.toLowerCase()}
            checked={formData.workDays?.includes(day) || false}
            onChange={() => handleDayChange(day)}
            className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
            onClick={(e) => e.stopPropagation()} 
        />
        <label htmlFor={day.toLowerCase()} className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
            {day}
        </label>
    </div>
))}
        </div>
      </div>
    </>
    );
  };
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return scheduleList.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(scheduleList.length / itemsPerPage);
  };

  const renderPagination = () => {
    const totalPages = getTotalPages();
    
    return (
      <div className={`flex justify-between items-center mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className={`px-4 py-2 rounded-md ${currentPage === 1 || isLoading ? 
            (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') : 
            (theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300')}`}
        >
          Previous
        </button>
        
        <span>
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || isLoading || totalPages === 0}
          className={`px-4 py-2 rounded-md ${currentPage === totalPages || isLoading || totalPages === 0 ? 
            (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') : 
            (theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300')}`}
        >
          Next
        </button>
      </div>
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
              {userList
                .filter(user => {
                  // If we're in edit mode and this is the current specialist, always show it
                  if (formData.id && formData.specialistId === user._id) {
                    return true;
                  }
                  
                  // Otherwise, only show specialists without schedules
                  const hasSchedule = scheduleList.some(schedule => {
                    // Skip the current schedule item when checking
                    if (formData.id && (schedule._id === formData.id || schedule.mysqlId === formData.id)) {
                      return false;
                    }
                    return schedule.specialistObj && schedule.specialistObj._id === user._id;
                  });
                  return !hasSchedule; 
                })
                .map((item) => {
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
    onChange={(e) => {
      setFormData({ ...formData, startTime: e.target.value });
      setValidationErrors({...validationErrors, timeConflict: false});
    }}
    className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
      validationErrors.timeConflict ? 'border-red-500' : ''
    }`}
    required
    disabled={isLoading}
  />
</div>

{/* End Time Input */}
<div>
  <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>End Time</label>
  <input 
    type="time"
    value={formData.endTime || ''}
    onChange={(e) => {
      setFormData({ ...formData, endTime: e.target.value });
      setValidationErrors({...validationErrors, timeConflict: false});
    }}
    className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
      validationErrors.timeConflict ? 'border-red-500' : ''
    }`}
    required
    disabled={isLoading}
  />
  {validationErrors.timeConflict && (
    <p className="text-red-500 text-sm mt-1">End time must be after start time</p>
  )}
</div>

{/* Break Start Time Input */}
<div>
  <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Break Start Time</label>
  <input 
    type="time"
    value={formData.breakStartTime || ''}
    onChange={(e) => {
      setFormData({ ...formData, breakStartTime: e.target.value });
      setValidationErrors({...validationErrors, breakTimeConflict: false});
    }}
    className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
      validationErrors.breakTimeConflict ? 'border-red-500' : ''
    }`}
    disabled={isLoading}
  />
</div>

{/* Break End Time Input */}
<div>
  <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Break End Time</label>
  <input 
    type="time"
    value={formData.breakEndTime || ''}
    onChange={(e) => {
      setFormData({ ...formData, breakEndTime: e.target.value });
      setValidationErrors({...validationErrors, breakTimeConflict: false});
    }}
    className={`border p-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
      validationErrors.breakTimeConflict ? 'border-red-500' : ''
    }`}
    disabled={isLoading}
  />
  {validationErrors.breakTimeConflict && (
    <p className="text-red-500 text-sm mt-1">
      Break times must be within work hours and end time must be after start time
    </p>
  )}
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
          <>
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
                {getPaginatedData().length > 0 ? (
                  getPaginatedData().map((item) => (
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
                      </td>
                      <td className="py-3 px-6">
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
                          onClick={() => handleDeleteClick(item)}
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
            {scheduleList.length > 0 && renderPagination()}
          </>
        )}
        
        {/* Include the DeleteConfirmation component */}
        <DeleteConfirmation 
          isOpen={deleteModal.isOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          itemName={deleteModal.itemName}
        />
      </div>
    </div>
  );
};

export default Schedule;