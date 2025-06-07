import React from "react";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button"; 
import { Card, CardContent } from "./../components/ui/Card";
import {
  CalendarIcon,
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "lucide-react";
import "@fontsource/poppins";

const HomeScreen = () => {
  return (
    <div className="font-[Poppins] bg-background min-h-screen">
      <Navbar />

      {/* Main Content */}
      <div className="text-center py-16 px-4 md:px-0">
        <div className="max-w-2xl mx-auto bg-card p-10 rounded-xl shadow-md">
          <h1 className="text-4xl font-bold mb-4">
            Your Journey, <span className="text-button">Our Care</span>
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Connect with trusted healthcare providers for your pregnancy journey.
            Book appointments with doctors and midwives who understand your needs.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">I'm a Mom</Button>
            <Button>I'm a Healthy Provider</Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-16">
        <Card className="bg-card">
          <CardContent className="text-center p-6">
            <CalendarIcon className="mx-auto text-icon" size={32} />
            <h2 className="text-lg font-semibold mt-4 text-button">Easy Booking</h2>
            <p className="text-sm mt-2 text-gray-700">
              Browse available time slots and book appointments that fit your schedule
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="text-center p-6">
            <UsersIcon className="mx-auto text-icon" size={32} />
            <h2 className="text-lg font-semibold mt-4 text-button">Trusted Providers</h2>
            <p className="text-sm mt-2 text-gray-700">
              Connect with verified doctors and midwives specialized in maternal care
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="text-center p-6">
            <ShieldCheckIcon className="mx-auto text-icon" size={32} />
            <h2 className="text-lg font-semibold mt-4 text-button">Secure Platform</h2>
            <p className="text-sm mt-2 text-gray-700">
              Your health information is protected with industry-standard security
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="text-center p-6">
            <ClockIcon className="mx-auto text-icon" size={32} />
            <h2 className="text-lg font-semibold mt-4 text-button">24/7 Access</h2>
            <p className="text-sm mt-2 text-gray-700">
              Book appointments anytime, anywhere with our responsive platform
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;