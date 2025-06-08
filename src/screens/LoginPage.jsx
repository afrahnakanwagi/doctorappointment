import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function MomCareLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === 'mom@gmail.com' && password === 'password') {
      navigate('/mom-dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar />
      <div className="flex-grow flex items-center justify-center relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/login.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-6 py-12">
          <div className="text-white mb-12 md:mb-0 md:w-1/2">
            <h2 className="text-3xl font-bold">Welcome to MomCare</h2>
            <p className="text-pink-400 font-semibold mt-2 text-lg">get appointments with qualified doctors.</p>
          </div>
          <div className="bg-pink-100 rounded-lg shadow-lg p-8 w-full md:w-1/2 max-w-md">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-black font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-black font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <span onClick={togglePasswordVisibility} className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-pink-600">
                    {showPassword ? (
                      <EyeOffIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </span>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#54074E] text-white font-semibold py-2 rounded-md hover:bg-purple-700">Login</button>
              <p className="text-sm text-black text-center">
                Don't have an account?{' '}
                <span onClick={handleSignUpRedirect} className="text-pink-600 font-bold cursor-pointer">Sign up here</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
      9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
      className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 3l18 18M10.5 10.5a3 3 0 004.5 4.5M6.364 6.364C4.45
      7.951 3.172 9.822 2.458 12c1.274 4.057 5.064 7 9.542
      7 1.545 0 3.014-.35 4.338-.976M15.75 15.75a6 6 0
      01-8.49-8.49" />
    </svg>
  );
}
