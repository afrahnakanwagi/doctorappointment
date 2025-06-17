import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function MomDashboard() {
    const navigate = useNavigate();
    const { axiosInstance } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const getInitial = (name) => (name && name.length > 0 ? name[0] : '');

    const { user } = useAuth();


    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const usersResponse = await axiosInstance.get(
                    'https://doctorappointmentbackend-e6hx.onrender.com/users/users/'
                );

                const doctorUsers = usersResponse.data.filter(user => user.role === 'Doctor');

                const doctorsWithAvailability = await Promise.all(
                    doctorUsers.map(async (doctor) => {
                        try {
                            const availabilityResponse = await axiosInstance.get(
                                `https://doctorappointmentbackend-e6hx.onrender.com/appointment/doctor/availability/`
                            );
                            return {
                                ...doctor,
                                availability: availabilityResponse.data
                            };
                        } catch (error) {
                            console.error(`Error fetching availability for doctor ${doctor.id}:`, error);
                            return {
                                ...doctor,
                                availability: []
                            };
                        }
                    })
                );

                setDoctors(doctorsWithAvailability);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                toast.error(error.response?.data?.message || 'Failed to load doctors');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [axiosInstance]);

    const filteredDoctors = doctors.filter((doctor) => {
        const fullName = doctor.full_name || '';
        const specialization = doctor.specialization || '';
        return (
            fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            specialization.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <div className="flex-grow px-4 py-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Message */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-button">
                            Welcome Back, <span className="text-icon">{user?.username}</span>
                        </h1>
                        <p className="text-lg font-medium text-gray-800 mt-1">
                            Find Your Healthcare Provider
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex justify-center mb-8">
                        <div className="w-full max-w-xl">
                            <input
                                type="text"
                                placeholder="Search for doctors..."
                                className="w-full px-4 py-2 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-icon"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Loading Spinner */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading doctors...</p>
                        </div>
                    ) : (
                        <>
                            {/* Doctor Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredDoctors.map((doctor) => (
                                    <Card
                                        key={doctor.id}
                                        className="bg-card rounded-lg shadow-md p-4 hover:shadow-xl hover:scale-[1.02] transition-transform duration-200"
                                    >
                                        <CardContent>
                                            <div className="flex items-center text-button font-bold mb-1">
                                                <span className="w-8 h-8 rounded-full bg-button text-white flex items-center justify-center mr-2">
                                                    {/* Using the safe initials helper */}
                                                    {getInitial(doctor.username)}{getInitial(doctor.full_name)}
                                                    {/* Or, alternatively: */}
                                                    {/* {getInitialsFromFullName(doctor.full_name)} */}
                                                </span>
                                                Dr. {doctor.username} 
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <span className="w-4 h-4 mr-2">👨‍⚕️</span>
                                                {doctor.specialization}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 mb-2">
                                                <span className="w-4 h-4 mr-2">💰</span>
                                                Consultation Fee:{' '}
                                                {new Intl.NumberFormat('en-UG', {
                                                    style: 'currency',
                                                    currency: 'UGX',
                                                    minimumFractionDigits: 0,
                                                }).format(doctor.consultation_fee)}
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                    Available Hours:
                                                </h4>
                                                {doctor.availability?.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {doctor.availability.map((schedule) => (
                                                            <div key={schedule.id} className="text-sm text-gray-600">
                                                                {schedule.day_of_week}: {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No schedule available</p>
                                                )}
                                            </div>
                                            <div className="flex justify-center mt-4">
                                                <Button
                                                    className="w-2/3"
                                                    onClick={() =>
                                                        navigate('/book-appointment', {
                                                            state: {
                                                                doctorId: doctor.id,
                                                                doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                                                                specialization: doctor.specialization,
                                                                consultationFee: doctor.consultation_fee,
                                                            },
                                                        })
                                                    }
                                                >
                                                    Book Appointment
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* No Matches */}
                            {filteredDoctors.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No doctors found matching your search.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* View Appointments Button */}
                    <div className="flex justify-center mt-10">
                        <Button
                            className="px-6 py-2 rounded-md"
                            onClick={() => navigate('/my-appointments')}
                        >
                            View Your Appointments
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}