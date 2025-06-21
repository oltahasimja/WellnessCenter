import React, { useState } from "react";

const AppointmentItem = ({ appt, isSpecialistView, updateStatus, statusColors }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const userFullName = `${appt.userId?.name || ''} ${appt.userId?.lastName || ''}`.trim();
  const specialistFullName = `${appt.specialistId?.name || ''} ${appt.specialistId?.lastName || ''}`.trim();
  const specialistRole = appt.specialistId?.roleId?.name || "Specialist";

  const handleCancel = () => {
    updateStatus(appt._id, "canceled", cancelReason);
    setShowCancelModal(false);
    setCancelReason("");
  };

  return (
    <li className="py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1 space-y-2">
          <h3 className="font-medium text-gray-800">
            {isSpecialistView ? userFullName : specialistFullName}
            <span className="text-sm text-gray-500 ml-2">
              ({isSpecialistView ? "Client" : specialistRole})
            </span>
          </h3>
          <p className="text-gray-600">Date: {new Date(appt.appointmentDate).toLocaleString()}</p>
          <p className="text-gray-600">Type: {appt.type.replace("_", " ")}</p>
          {appt.notes && <p className="text-gray-600">Notes: {appt.notes}</p>}
          {appt.paymentMethod === "online" && (
            <p className="text-green-600 font-semibold">Payment: Online - Done</p>
          )}
          {appt.paymentMethod === "cash" && (
            <p className="text-gray-600">Payment: Cash - To be paid</p>
          )}
        </div>

        <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors?.[appt.status] || 'bg-gray-100'}`}>
            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
          </span>

          {isSpecialistView && appt.status === "pending" && (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => updateStatus(appt._id, "confirmed")}
                className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reason for Cancellation</h3>
            <textarea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Enter reason to send via email..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Send & Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default AppointmentItem;
