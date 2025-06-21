// calendarUtils.js
import axios from "axios";
export const getSpecialistSchedule = (specialistId, schedules) => {
    return schedules.find(schedule => 
      schedule.specialistId?._id === specialistId
    );
  };
  
  export const getBookedAppointments = async (specialistId, selectedDate) => {
    try {
      const dateStr = new Date(selectedDate).toISOString().split('T')[0];
      
      const response = await axios.get(
        `http://localhost:5001/api/appointment`,
        {
          params: {
            specialistId: specialistId,
            date: dateStr,
            status: 'confirmed,pending'
          }
        }
      );
  
      const selectedDateObj = new Date(selectedDate);
      const selectedDateStart = new Date(selectedDateObj);
      selectedDateStart.setHours(0, 0, 0, 0);
      
      const selectedDateEnd = new Date(selectedDateObj);
      selectedDateEnd.setHours(23, 59, 59, 999);
  
      return response.data.filter(appt => {
        if (appt.status === 'canceled') return false;
        if (appt.specialistId?._id !== specialistId) return false;
        
        const apptDate = new Date(appt.appointmentDate);
        return apptDate >= selectedDateStart && apptDate <= selectedDateEnd;
      });
  
    } catch (error) {
      console.error("Error fetching booked appointments:", error);
      return [];
    }
  };
  
  export const getAvailableTimeSlots = async (specialistId, selectedDate, schedules) => {
    if (!specialistId || !selectedDate) return [];
  
    const schedule = getSpecialistSchedule(specialistId, schedules);
    if (!schedule) return [];
  
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();
  
    const bookedAppointments = await getBookedAppointments(specialistId, selectedDate);
  
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    const date = new Date(selectedDate);
    const availableSlots = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      if (schedule.breakStartTime && schedule.breakEndTime) {
        const [breakStartHour] = schedule.breakStartTime.split(':').map(Number);
        const [breakEndHour] = schedule.breakEndTime.split(':').map(Number);
        
        // Only skip if it's strictly within break time (not including end time)
        if (hour >= breakStartHour && hour < breakEndHour) {
          continue;
        }
      }
      
      if (isToday && hour <= now.getHours()) {
        continue;
      }
      
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      const isBooked = bookedAppointments.some(appt => {
        const apptDate = new Date(appt.appointmentDate);
        return apptDate.getHours() === hour;
      });
      
      if (!isBooked) {
        const localDateString = slotDate.toLocaleString('sv-SE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(' ', 'T');
    
        availableSlots.push({
          display: `${startTime} - ${endTime}`,
          isoString: localDateString
        });
      }
    }
    
    return availableSlots;
  };
  
  export const isWorkingDay = (date, schedule) => {
    if (!schedule || !schedule.workDays) return false;
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return schedule.workDays.some(day => day.includes(dayName));
  };
  
  export const getDayIndex = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };