import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';

const doctorsData = [
  {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Obstetrician',
      location: 'Downtown Medical Center',
      profileIcon: '/assets/icons/profile.svg',
      locationIcon: '/assets/icons/location.svg',
  },
  {
      id: 2,
      name: 'Dr. Emily White',
      specialty: 'Gynecologist',
      location: 'Uptown Clinic',
      profileIcon: '/assets/icons/profile.svg',
      locationIcon: '/assets/icons/location.svg',
  },
  {
      id: 3,
      name: 'Dr. Jessica Brown',
      specialty: 'Pediatrician',
      location: 'Medical Arts Building',
      profileIcon: '/assets/icons/profile.svg',
      locationIcon: '/assets/icons/location.svg',
  },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId } = location.state || {};

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const doctor = doctorId ? doctorsData.find(d => d.id === doctorId) : doctorsData[0];

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 9; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); 
    setShowSummary(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowSummary(true);
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
    console.log('Booking Confirmed:', {
      doctor: doctor.name,
      date: selectedDate ? format(selectedDate, 'PPP') : 'N/A',
      time: selectedTime || 'N/A',
      location: doctor.location,
    });
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    navigate('/mom-dashboard');
  };

  const handleCancelBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowSummary(false);
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-y-auto pb-10">
      <Navbar />
      <div className="bg-card p-10 mt-10 rounded-xl shadow-lg w-full max-w-2xl border border-card-light">
        <h2 className="text-3xl font-bold text-button mb-2">Book Appointment</h2>
        <p className="text-md text-gray-600 mb-8">
          Schedule your visit with {doctor.name}
        </p>

        <div className="bg-card p-6 rounded-lg mb-8 flex items-start gap-5 shadow-md border border-card-light">
          <img src={doctor.profileIcon} alt="Profile" className="w-10 h-10 mt-1 text-icon" />
          <div>
            <h3 className="font-semibold text-xl text-button">{doctor.name}</h3>
            <p className="text-icon text-md font-semibold">{doctor.specialty}</p>
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <img src={doctor.locationIcon} alt="Location" className="w-5 h-5 mr-2 text-icon" />
              {doctor.location}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="font-medium text-button flex items-center gap-3 mb-3 text-lg">
            <img src="/assets/icons/calendar.svg" alt="Calendar" className="w-6 h-6 text-icon" />
            Select Date
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {getDates().map((date, idx) => (
              <button
                key={idx}
                onClick={() => handleDateSelect(date)}
                className={`border border-button px-4 py-3 rounded-md text-sm transition-all duration-200 ease-in-out
                  ${selectedDate && format(selectedDate, 'PP') === format(date, 'PP') ? 'bg-button text-white shadow-md transform scale-105' : 'text-button hover:bg-button/10 hover:shadow-sm'}`}
              >
                {format(date, 'E, MMM d')}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="mb-6">
            <label className="font-medium text-button flex items-center gap-3 mb-3 mt-6 text-lg">
              <img src="/assets/icons/time.svg" alt="Time" className="w-6 h-6 text-icon" />
              Select Time
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {timeSlots.map((time, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTimeSelect(time)}
                  className={`border border-button px-4 py-3 rounded-md text-sm transition-all duration-200 ease-in-out
                    ${selectedTime === time ? 'bg-button text-white shadow-md transform scale-105' : 'text-button hover:bg-button/10 hover:shadow-sm'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {showSummary && selectedDate && selectedTime && (
          <div className="bg-card p-6 rounded-lg mb-8 shadow-md border border-card-light">
            <h3 className="font-semibold text-xl text-button mb-3">Appointment Summary</h3>
            <p className="text-md text-gray-700 mb-1"><strong>Doctor:</strong> {doctor.name}</p>
            <p className="text-md text-gray-700 mb-1"><strong>Date:</strong> {format(selectedDate, 'PPP')}</p>
            <p className="text-md text-gray-700 mb-1"><strong>Time:</strong> {selectedTime}</p>
            <p className="text-md text-gray-700"><strong>Location:</strong> {doctor.location}</p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={handleCancelBooking}>
            Cancel
          </Button>
          <Button onClick={handleConfirmBooking} disabled={!selectedDate || !selectedTime}>
            Confirm Booking
          </Button>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full border-t-4 border-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#EA3EF7" className="w-16 h-16 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="text-2xl font-bold text-button mb-2">Booking Confirmed!</h3>
              <p className="text-gray-700 mb-4">
                Your appointment with Dr. {doctor.name} on {format(selectedDate, 'PPP')} at {selectedTime} has been successfully booked.
              </p>
              <Button onClick={handleCloseConfirmation} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
