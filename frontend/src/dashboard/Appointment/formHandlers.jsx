import axios from "axios";
import { filterSpecialistsByType } from "./authUtils";
import { getBookedAppointments, getSpecialistSchedule } from "./calendarUtils";

export const handleAppointmentChange = (
  e,
  formData,
  setFormData,
  setErrorMessage,
  workingDays,
  specialists,
  schedules,
  setFilteredSpecialists
) => {
  const { name, value } = e.target;
  setErrorMessage('');
  
  if (name === 'appointmentDate') {
    const selectedDate = new Date(value);
    const now = new Date();
    
    if (selectedDate.toDateString() === now.toDateString() && 
        selectedDate.getHours() <= now.getHours()) {
      setErrorMessage('You cannot select a time slot in the past');
      return;
    }

    // Check if the day is a working day
    if (formData.specialistId) {
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (!workingDays.includes(dayName)) {
        setErrorMessage(`Specialist doesn't work on ${dayName}`);
        return;
      }
    }
  }
  
  const newFormData = { ...formData, [name]: value };
  setFormData(newFormData);

  if (name === 'type') {
    filterSpecialistsByType(value, specialists, setFilteredSpecialists);
    if (!newFormData.filteredSpecialists?.some(spec => spec._id === newFormData.specialistId)) {
      setFormData(prev => ({ ...prev, specialistId: '' }));
    }
  }

  if (name === 'specialistId') {
    setFormData(prev => ({ ...prev, appointmentDate: '' }));
  }
};

export const handleAppointmentSubmit = async (
  e,
  formData,
  specialists,
  schedules,
  setFormData,
  setSuccessMessage,
  setErrorMessage,
  onAppointmentCreated
) => {
  // e.preventDefault();
  if (e?.preventDefault) e.preventDefault();

  setErrorMessage('');
  setSuccessMessage('');
  
  try {
    const selectedSpecialist = specialists.find(spec => 
      spec._id === formData.specialistId
    );

    if (!selectedSpecialist) {
      throw new Error('No specialist found with the selected ID');
    }

    const appointmentDateTime = new Date(formData.appointmentDate);
    const appointmentHour = appointmentDateTime.getHours();

    // Check if time slot is already booked
    const bookedAppointments = await getBookedAppointments(
      formData.specialistId, 
      formData.appointmentDate
    );

    const isTimeSlotTaken = bookedAppointments.some(appt => {
      const apptDate = new Date(appt.appointmentDate);
      const apptHour = apptDate.getHours();
      return appointmentHour === apptHour;
    });

    if (isTimeSlotTaken) {
      throw new Error('This time slot is already booked. Please choose another time.');
    }

    // Check if time is within working hours
    const specialistSchedule = getSpecialistSchedule(formData.specialistId, schedules);
    if (specialistSchedule) {
      const [startHour, startMinute] = specialistSchedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = specialistSchedule.endTime.split(':').map(Number);
      
      const appointmentMinute = appointmentDateTime.getMinutes();
      
      if (appointmentHour < startHour || 
          (appointmentHour === startHour && appointmentMinute < startMinute) ||
          appointmentHour > endHour ||
          (appointmentHour === endHour && appointmentMinute > endMinute)) {
        throw new Error(`Appointment time must be between ${specialistSchedule.startTime} and ${specialistSchedule.endTime}`);
      }

      // Check break time
      if (specialistSchedule.breakStartTime && specialistSchedule.breakEndTime) {
        const [breakStartHour, breakStartMinute] = specialistSchedule.breakStartTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = specialistSchedule.breakEndTime.split(':').map(Number);
        
        if ((appointmentHour > breakStartHour || 
            (appointmentHour === breakStartHour && appointmentMinute >= breakStartMinute)) &&
            (appointmentHour < breakEndHour ||
            (appointmentHour === breakEndHour && appointmentMinute < breakEndMinute))) {
          throw new Error(`Cannot book during break time (${specialistSchedule.breakStartTime}-${specialistSchedule.breakEndTime})`);
        }
      }
    }

    const appointmentData = {
      ...formData,
      specialistId: selectedSpecialist._id,
      userId: parseInt(formData.userId, 10),
      appointmentDate: appointmentDateTime.toISOString(),
      status: 'pending'
    };

    await axios.post("http://localhost:5001/api/appointment", appointmentData);
    
    setFormData(prev => ({ 
      ...prev, 
      specialistId: "", 
      appointmentDate: "", 
      notes: "" 
    }));

    setSuccessMessage('Appointment created successfully!');
    
    // Notify parent component that appointment was created
    if (onAppointmentCreated) {
      onAppointmentCreated();
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    setErrorMessage(error.message);
  }
};