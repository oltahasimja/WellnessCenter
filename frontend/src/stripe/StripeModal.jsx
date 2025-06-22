import React from 'react';
import { useStripe, useElements, CardElement, ElementsConsumer } from '@stripe/react-stripe-js';
import axios from 'axios';

const StripeForm = ({ clientSecret, onSuccess, programId }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.paymentIntent?.status === 'succeeded') {
      await axios.put(`http://localhost:5001/api/stripe/userprograms/${programId}/pay`);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
      <CardElement />
      <button type="submit" disabled={!stripe} className="mt-4 bg-teal-500 text-white px-4 py-2 rounded">
        Pay
      </button>
    </form>
  );
};

const StripeModal = ({ show, onClose, clientSecret, programId, onSuccess, selectedProgram }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.paymentIntent?.status === 'succeeded') {
      await axios.put(`http://localhost:5001/api/stripe/userprograms/${programId}/pay`);
      onSuccess();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Complete Your Payment</h2>
        <p className="text-gray-600 mb-2">
          Program: <strong>{selectedProgram?.programId?.title}</strong>
        </p>
        <p className="text-gray-600 mb-4">
          Price: <strong>{selectedProgram?.programId?.price} €</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <CardElement />
          <button
            type="submit"
            disabled={!stripe}
            className="mt-4 bg-teal-500 text-white px-4 py-2 rounded"
          >
            Pay
          </button>
        </form>
        <button onClick={onClose} className="mt-4 text-red-500">
          Cancel
        </button>
      </div>
    </div>
  );
};



export default StripeModal;