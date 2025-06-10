import React from 'react';
import Button from './ui/Button';

const AppointmentDetailModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border-t-4 border-icon">
        <h2 className="text-2xl font-bold text-button mb-4 text-center">Appointment Details</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>Doctor:</strong> {appointment.doctorName}</p>
          <p><strong>Specialty:</strong> {appointment.specialty}</p>
          <p><strong>Location:</strong> {appointment.location}</p>
          <p><strong>Date:</strong> {appointment.date}</p>
          <p><strong>Time:</strong> {appointment.time}</p>
          <p className={`font-semibold ${appointment.status === 'Confirmed' ? 'text-green-600' : appointment.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>
            <strong>Status:</strong> {appointment.status}
          </p>
          {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 