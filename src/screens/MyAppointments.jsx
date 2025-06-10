import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import AppointmentDetailModal from '../components/AppointmentDetailModal';

const bookedAppointments = [
  {
    id: 1,
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Obstetrician',
    location: 'Downtown Medical Center',
    date: 'Monday, July 22, 2024',
    time: '10:00 AM',
    status: 'Confirmed',
    notes: 'First prenatal check-up.',
  },
  {
    id: 2,
    doctorName: 'Dr. Emily White',
    specialty: 'Gynecologist',
    location: 'Uptown Clinic',
    date: 'Tuesday, July 23, 2024',
    time: '11:30 AM',
    status: 'Pending',
    notes: 'Annual women\'s health exam.',
  },
  {
    id: 3,
    doctorName: 'Dr. Jessica Brown',
    specialty: 'Pediatrician',
    location: 'Medical Arts Building',
    date: 'Wednesday, July 24, 2024',
    time: '02:00 PM',
    status: 'Cancelled',
    notes: 'Follow-up for vaccination.',
  },
];

export default function MyAppointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow px-4 py-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-button text-center mb-8">
            Your Booked Appointments
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookedAppointments.map((appointment) => (
              <Card key={appointment.id} className="bg-card rounded-lg shadow-md p-6">
                <CardContent>
                  <h2 className="text-xl font-bold text-button mb-2">{appointment.doctorName}</h2>
                  <p className="text-gray-700 text-sm mb-1"><strong>Specialty:</strong> {appointment.specialty}</p>
                  <p className="text-gray-700 text-sm mb-1"><strong>Location:</strong> {appointment.location}</p>
                  <p className="text-gray-700 text-sm mb-1"><strong>Date:</strong> {appointment.date}</p>
                  <p className="text-gray-700 text-sm mb-1"><strong>Time:</strong> {appointment.time}</p>
                  <p className={`text-sm font-semibold mt-2 ${appointment.status === 'Confirmed' ? 'text-green-600' : appointment.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                    Status: {appointment.status}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleViewDetails(appointment)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 