// src/components/PaymentForm.js
import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const PaymentForm = ({ amount, applicationId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Krijo Payment Intent në backend
      const { data: intentData } = await axios.post("http://localhost:5001/api/stripe/create-payment-intent", {
        amount: amount, // Shuma vjen si prop, p.sh., 5000 për 50.00 EUR
        metadata: { trainingApplicationId: applicationId },
      });

      // 2. Konfirmo pagesën në Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: intentData.clientSecret,
        confirmParams: {
          // Sigurohu që të kthehesh në faqen e duhur pas pagesës
          return_url: `${window.location.origin}/trainings`,
        },
        redirect: 'if_required', // Kjo parandalon ridrejtimin e menjëhershëm
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occurred.");
        }
        setIsLoading(false);
        return;
      }
      
      // 3. Nëse pagesa ishte e suksesshme, përditëso databazën tënde
      if (paymentIntent.status === 'succeeded') {
        await axios.put(`http://localhost:5001/api/stripe/trainingapplication/${applicationId}/pay`);
        
        // Thirr funksionin onSuccess të dërguar nga komponenti prind
        onSuccess(); 
      }

    } catch (err) {
      console.error("Payment submission error:", err);
      setMessage("Failed to process payment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h2>
        <form id="payment-form" onSubmit={handleSubmit}>
          <PaymentElement id="payment-element" />
          <button 
            disabled={isLoading || !stripe || !elements} 
            id="submit" 
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-all"
          >
            <span id="button-text">
              {isLoading ? <div className="spinner" /> : `Pay €${(amount / 100).toFixed(2)}`}
            </span>
          </button>
          
          <button 
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg mt-3 transition-all"
          >
            Cancel
          </button>

          {message && <div id="payment-message" className="text-red-500 text-center mt-4">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;