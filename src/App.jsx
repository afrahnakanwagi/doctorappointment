import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";

import HomeScreen from "./screens/HomeScreen";
import LoginPage from "./screens/LoginPage";
import SignupPage from "./screens/SignupPage";
import MomDashboard from "./screens/MomDashboard";
import BookingPage from "./screens/BookingPage";
import MyAppointments from "./screens/MyAppointments";
import DoctorDashboard from "./screens/DoctorDashboard";

import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mom-dashboard" element={<MomDashboard />} />
          <Route path="/book-appointment" element={<BookingPage />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route
            path="*"
            element={
              <div style={{ padding: 20 }}>
                <h2>404 - Page Not Found</h2>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
