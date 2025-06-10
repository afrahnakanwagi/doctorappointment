import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function MomDashboard() {
    const navigate = useNavigate();

    const [doctors] = useState([
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            specialty: 'Obstetrician',
            location: 'Downtown Medical Center',
            nextAppointment: 'Mon, July 22, 10:00 AM',
            profileIcon: '/assets/icons/profile.svg',
            locationIcon: '/assets/icons/location.svg',
            timeIcon: '/assets/icons/time.svg',
        },
        {
            id: 2,
            name: 'Dr. Emily White',
            specialty: 'Gynecologist',
            location: 'Uptown Clinic',
            nextAppointment: 'Tue, July 23, 11:30 AM',
            profileIcon: '/assets/icons/profile.svg',
            locationIcon: '/assets/icons/location.svg',
            timeIcon: '/assets/icons/time.svg',
        },
        {
            id: 3,
            name: 'Dr. Jessica Brown',
            specialty: 'Pediatrician',
            location: 'Medical Arts Building',
            nextAppointment: 'Wed, July 24, 02:00 PM',
            profileIcon: '/assets/icons/profile.svg',
            locationIcon: '/assets/icons/location.svg',
            timeIcon: '/assets/icons/time.svg',
        },
    ]);

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
                            Welcome Back, <span className="text-icon">Afrah</span>
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
                            />
                        </div>
                    </div>

                    {/* Doctor Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
                            <Card
                                key={doctor.id}
                                className="bg-card rounded-lg shadow-md p-4 hover:shadow-xl hover:scale-[1.02] transition-transform duration-200"
                            >
                                <CardContent>
                                    <div className="flex items-center text-button font-bold mb-1">
                                        <img src={doctor.profileIcon} alt="Profile" className="w-5 h-5 mr-2" />
                                        {doctor.name}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <img src={doctor.profileIcon} alt="Profession" className="w-4 h-4 mr-2" />
                                        {doctor.specialty}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 mb-2">
                                        <img src={doctor.locationIcon} alt="Location" className="w-4 h-4 mr-2" />
                                        {doctor.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 mb-4">
                                        <img src={doctor.timeIcon} alt="Time" className="w-4 h-4 mr-2" />
                                        Next: {doctor.nextAppointment}
                                    </div>
                                    <div className="flex justify-center">
                                        <Button
                                            className="w-2/3"
                                            onClick={() => navigate('/book-appointment', { state: { doctorId: doctor.id } })}
                                        >
                                            Book Appointment
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* View Appointments Button */}
                    <div className="flex justify-center mt-10">
                        <Button className="px-6 py-2 rounded-md" onClick={() => navigate('/my-appointments')}>
                            View Your Appointments
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
