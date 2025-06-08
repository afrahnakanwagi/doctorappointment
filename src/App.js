import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import LoginPage from "./screens/LoginPage";
import SignupPage from "./screens/SignupPage";
import MomDashboard from "./screens/MomDashboard";
import BookingPage from "./screens/BookingPage";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mom-dashboard" element={<MomDashboard />} />
        <Route path="/book-appointment" element={<BookingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
