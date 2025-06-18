import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaUserMd, FaMapMarkerAlt } from 'react-icons/fa';

export default function MyAppointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axiosInstance } = useAuth();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        'https://doctorappointmentbackend-e6hx.onrender.com/appointment/appointments/'
      );
      console.log("Appointments response:", response.data);

      const transformedAppointments = response.data.map(appointment => {
        try {
          let appointmentDate;
          if (appointment.slot) {
            const dateTimeMatch = appointment.slot.match(/(\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2}:\d{2})/);
            if (dateTimeMatch) {
              const [_, dateStr, timeStr] = dateTimeMatch;
              appointmentDate = new Date(`${dateStr}T${timeStr}`);
            }
          }

          if (!appointmentDate || isNaN(appointmentDate.getTime())) {
            appointmentDate = new Date(appointment.created_at);
          }

          return {
            id: appointment.id,
            doctorName: appointment.slot ? appointment.slot.split(' with ')[1] : 'Unknown Doctor',
            specialty: appointment.appointment_type || 'General',
            location: 'Medical Center',
            date: appointmentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: appointmentDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: appointment.status || 'PENDING',
            notes: appointment.notes || '',
            reason: appointment.reason || '',
            rawData: appointment
          };
        } catch (error) {
          console.error("Error transforming appointment:", error);
          return null;
        }
      }).filter(Boolean);

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [axiosInstance]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAppointmentAction = async (action, appointment) => {
    try {
      const status = action === 'accept' ? 'CONFIRMED' : 'REJECTED';
      const response = await axiosInstance.patch(
        `https://doctorappointmentbackend-e6hx.onrender.com/appointment/appointments/${appointment.id}/status/`,
        { status }
      );

      if (response.status === 200) {
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt.id === appointment.id 
              ? { ...apt, status: status }
              : apt
          )
        );
        
        toast.success(`Appointment ${action === 'accept' ? 'approved' : 'rejected'} successfully!`);
      }
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      toast.error(`Failed to ${action} appointment: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow px-4 py-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-button text-center mb-8">
            Your Booked Appointments
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-button">{appointment.doctorName}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <FaUserMd className="mr-2 text-button" />
                        <span className="text-sm">{appointment.specialty}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <FaMapMarkerAlt className="mr-2 text-button" />
                        <span className="text-sm">{appointment.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt className="mr-2 text-button" />
                        <span className="text-sm">{appointment.date}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <FaClock className="mr-2 text-button" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <p className="text-gray-700 text-sm mt-3">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => handleViewDetails(appointment)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-600">No appointments found.</p>
              <Button
                className="mt-4"
                onClick={() => window.location.href = '/book-appointment'}
              >
                Book New Appointment
              </Button>
            </div>
          )}
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