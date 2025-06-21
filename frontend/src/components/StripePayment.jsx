import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { getSpecialistSchedule, getBookedAppointments, getAvailableTimeSlots, isWorkingDay, getDayIndex } from "../dashboard/Appointment/calendarUtils";
import axios from "axios";

const StripePayment = ({ appointmentData, onSuccess, schedules }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get specialist schedule
      const schedule = getSpecialistSchedule(appointmentData.specialistId, schedules);
      
      // Get the price from schedule (default to 5001 if not found)
      const amount = schedule?.price ? Math.round(schedule.price * 100) : 5001;

      // 1. Create payment intent
      const res = await axios.post("http://localhost:5001/api/stripe/create-payment-intent", {
        amount: amount,
        metadata: appointmentData
      });

      const clientSecret = res.data.clientSecret;

      // 2. Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        onSuccess(); // Continue with appointment creation
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <CardElement />
    <button 
  type="submit" 
  className="w-full py-4 px-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5"
  disabled={loading}
>
  {loading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </span>
  ) : (
    <span className="flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Pay & Confirm Appointment
    </span>
  )}
</button>
    </form>
  );
};

export default StripePayment;
