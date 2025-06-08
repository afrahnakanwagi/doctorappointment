import React from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function MomDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-pink-100">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome Back, <span className="text-pink-600">Afrah</span>
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
                className="w-full px-4 py-2 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, idx) => (
              <Card
                key={idx}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex items-center text-pink-600 font-bold mb-1">
                  <img src="/assets/icons/profile.svg" alt="Profile" className="w-5 h-5 mr-2" />
                  Dr. Sarah Johnson
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <img src="/assets/icons/profile.svg" alt="Profession" className="w-4 h-4 mr-2" />
                  Obstetrician
                </div>
                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <img src="/assets/icons/location.svg" alt="Location" className="w-4 h-4 mr-2" />
                  Downtown Medical Center
                </div>
                <div className="flex items-center text-sm text-gray-700 mb-4">
                  <img src="/assets/icons/time.svg" alt="Time" className="w-4 h-4 mr-2" />
                  Next: Mon, Jan 15, 10:00 AM
                </div>
                <div className="flex justify-center">
                  <Button className="w-2/3 bg-[#54074E] text-white hover:bg-[#6a0a5f]">
                    Book Appointment
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* View Appointments Button */}
          <div className="flex justify-center mt-10">
            <Button className="bg-[#54074E] text-white px-6 py-2 rounded-md hover:bg-[#6a0a5f]">
              View Your Appointments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
