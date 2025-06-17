import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function BookingPage() {
  const { user, accessToken, isLoading, axiosInstance } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { doctorId, doctorName } = location.state || {};

  const [doctors, setDoctors] = useState([]);
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user || (!user.email && !user.username)) {
      toast.error('Please login to book appointments');
      navigate('/login');
      return;
    }

    if (!doctorId) {
      navigate('/mom-dashboard');
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get('https://doctorappointmentbackend-e6hx.onrender.com/users/users/');
        setDoctors(response.data.filter((u) => u.is_doctor));
      } catch (err) {
        console.error('BookingPage: Failed to fetch doctors:', err);
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        toast.error('Failed to load doctors');
      }
    };

    if (accessToken) fetchDoctors();
  }, [accessToken, doctorId, navigate, user, isLoading, axiosInstance]);

  const doctor = doctors.find((d) => d.id === doctorId) || {
    id: doctorId,
    username: doctorName ? doctorName.replace('Dr. ', '') : 'Unknown Doctor',
  };

  const appointmentTypes = [
    { value: 'PRENATAL', label: 'Prenatal Checkup' },
    { value: 'POSTNATAL', label: 'Postnatal Checkup' },
    { value: 'GENERAL', label: 'General Consultation' },
    { value: 'ROUTINE', label: 'Routine Checkup' },
    { value: 'SPECIALIST', label: 'Specialist Consultation' },
    { value: 'EMERGENCY', label: 'Emergency Visit' },
    { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
    { value: 'LAB_TEST', label: 'Lab Test' },
    { value: 'DIAGNOSTIC', label: 'Diagnostic' },
    { value: 'VACCINATION', label: 'Vaccination' },
    { value: 'OTHER', label: 'Other' },
  ];

  const timeSlots = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
  ];

  const getDates = () => Array.from({ length: 9 }, (_, i) => addDays(new Date(), i));

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hrs, mins] = time.split(':').map(Number);
    if (modifier === 'PM' && hrs !== 12) hrs += 12;
    if (modifier === 'AM' && hrs === 12) hrs = 0;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
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

  const handleCancelBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowSummary(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }
    if (!user?.username && !user?.email) {
      console.log('BookingPage: No user.username or user.email in handleConfirmBooking', { user });
      toast.error('User identifier not found. Please log in again.');
      navigate('/login');
      return;
    }
    if (!appointmentType) {
      toast.error('Please select an appointment type');
      return;
    }

    const payload = {
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_start_time: convertTo24Hour(selectedTime),
      appointment_type: appointmentType,
      reason,
      patient: user.username || user.email,  // Prefer username, fallback to email
      doctor_id: doctor.id,
    };

    console.log('Sending booking payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await axiosInstance.post(
        'https://doctorappointmentbackend-e6hx.onrender.com/appointment/appointments/',
        payload
      );

      // Update the confirmation message with the actual appointment details
      setShowConfirmation(true);

      // Show success message with appointment details
      toast.success(`Appointment booked successfully! Status: ${response.data.status}`);

      // You can also store the appointment details in state if needed
      const appointmentDetails = response.data.appointment;
      console.log('Appointment details:', appointmentDetails);

    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.non_field_errors?.join(', ') ||
        err.response?.data?.message ||
        'Booking failed';
      toast.error(errorMessage);
    }
  };
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    navigate('/mom-dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-10">
      <Navbar />
      <div className="bg-card p-10 mt-10 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-2">Book Appointment</h2>
        <p className="text-gray-600 mb-8">
          Schedule a visit with {doctor?.username || 'a doctor'}
        </p>

        <div className="mb-6">
          <label className="font-medium mb-3 flex items-center gap-2">
            📅 Select Date
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {getDates().map((date, i) => (
              <button
                key={i}
                onClick={() => handleDateSelect(date)}
                className={`border px-4 py-3 rounded text-sm ${selectedDate && format(selectedDate, 'PPP') === format(date, 'PPP')
                  ? 'bg-button text-white'
                  : 'hover:bg-button/10'
                  }`}
              >
                {format(date, 'E, MMM d')}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="mb-6">
            <label className="font-medium mb-3 flex items-center gap-2">
              ⏱ Select Time
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {timeSlots.map((time, i) => (
                <button
                  key={i}
                  onClick={() => handleTimeSelect(time)}
                  className={`border px-4 py-3 rounded text-sm ${selectedTime === time ? 'bg-button text-white' : 'hover:bg-button/10'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {showSummary && (
          <div className="bg-card p-6 rounded-lg mb-8">
            <div className="mb-4">
              <strong>Appointment Summary</strong>
              <p>{doctor?.username}</p>
              <p>{selectedDate ? format(selectedDate, 'PPP') : ''}</p>
              <p>{selectedTime} (location TBD)</p>
            </div>
            <label className="mb-2 block">
              Type:
              <select
                className="w-full p-2 border rounded"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <option value="">-- Select Type --</option>
                {appointmentTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reason:
              <textarea
                className="w-full p-2 border rounded mt-2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your reason..."
              />
            </label>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleCancelBooking}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center max-w-sm">
              <h3 className="font-bold text-2xl mb-2">Booking Confirmed!</h3>
              <div className="text-left mb-4">
                <p><strong>Doctor:</strong> {doctor?.username}</p>
                <p><strong>Date:</strong> {selectedDate ? format(selectedDate, 'PPP') : ''}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Type:</strong> {appointmentType}</p>
                <p><strong>Status:</strong> PENDING</p>
                <p className="text-sm text-gray-600 mt-2">
                  Your appointment is pending confirmation from the doctor.
                </p>
              </div>
              <Button className="mt-4" onClick={handleCloseConfirmation}>
                Close
              </Button>
            </div>
          </div>
        )}      </div>
    </div>
  );
}