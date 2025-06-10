import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    role: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    // Doctor specific fields
    specialization: '',
    consultation_fee: '',
    available_days: '',
    available_hours: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.username.trim()) {
      tempErrors.username = 'Username is required';
    }

    if (!formData.first_name.trim()) {
      tempErrors.first_name = 'First Name is required';
    }

    if (!formData.last_name.trim()) {
      tempErrors.last_name = 'Last Name is required';
    }

    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email address is invalid';
    }

    if (!formData.phone_number) {
      tempErrors.phone_number = 'Phone Number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone_number)) {
      tempErrors.phone_number = 'Phone Number is invalid';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      tempErrors.role = 'Please select a role';
    }

    if (!formData.date_of_birth) {
      tempErrors.date_of_birth = 'Date of Birth is required';
    }

    if (!formData.gender) {
      tempErrors.gender = 'Gender is required';
    }

    // Doctor specific validations
    if (formData.role === 'doctor') {
      if (!formData.specialization) {
        tempErrors.specialization = 'Specialization is required';
      }
      if (!formData.consultation_fee) {
        tempErrors.consultation_fee = 'Consultation fee is required';
      }
      if (!formData.available_days) {
        tempErrors.available_days = 'Available days are required';
      }
      if (!formData.available_hours) {
        tempErrors.available_hours = 'Available hours are required';
      }
    }

    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setApiError('');
      setSuccessMessage('');
      
      try {
        // Prepare data for backend
        const registrationData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          role: formData.role === 'patient' ? 'patient' : 'doctor',
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          // Include doctor specific fields only if role is doctor
          ...(formData.role === 'doctor' && {
            specialization: formData.specialization,
            consultation_fee: formData.consultation_fee,
            available_days: formData.available_days,
            available_hours: formData.available_hours
          })
        };

        console.log('Sending registration data:', registrationData);

        // FIXED: Removed the problematic headers and simplified the request
        const response = await fetch('https://doctorappointmentbackend-e6hx.onrender.com/users/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Removed credentials: 'include' unless you specifically need cookies
          body: JSON.stringify(registrationData),
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (!response.ok) {
          // Handle different types of errors
          if (data.detail) {
            throw new Error(data.detail);
          } else if (data.message) {
            throw new Error(data.message);
          } else if (typeof data === 'object') {
            // Handle validation errors from backend
            const errorMessages = Object.entries(data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('\n');
            throw new Error(errorMessages);
          } else {
            throw new Error('Registration failed. Please try again.');
          }
        }

        // Registration successful
        setSuccessMessage('Registration successful! Redirecting to login...');
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          phone_number: '',
          password: '',
          confirmPassword: '',
          role: '',
          first_name: '',
          last_name: '',
          date_of_birth: '',
          gender: '',
          specialization: '',
          consultation_fee: '',
          available_days: '',
          available_hours: ''
        });

        // Navigate to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);

      } catch (error) {
        console.error('Registration error:', error);
        setApiError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <div
        className="flex-grow flex items-center justify-center relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-6 py-12">
          {/* Welcome Message */}
          <div className="text-white mb-12 md:mb-0 md:w-1/2">
            <h2 className="text-3xl font-bold">Join MomCare</h2>
            <p className="text-pink-400 font-semibold mt-2 text-lg">
              Create your account to get started.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-pink-100 rounded-lg shadow-lg p-8 w-full md:w-1/2 max-w-md overflow-y-auto max-h-[80vh]">
            {apiError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                {apiError}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="username" className="block text-black font-semibold mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="first_name" className="block text-black font-semibold mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.first_name && <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-black font-semibold mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.last_name && <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-black font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-black font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-black font-semibold mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.date_of_birth && <p className="text-red-600 text-sm mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-black font-semibold mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-black font-semibold mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-black font-semibold mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-black font-semibold mb-1">
                  Register As
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
                {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
              </div>

              {formData.role === 'doctor' && (
                <>
                  <div>
                    <label htmlFor="specialization" className="block text-black font-semibold mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.specialization && <p className="text-red-600 text-sm mt-1">{errors.specialization}</p>}
                  </div>

                  <div>
                    <label htmlFor="consultation_fee" className="block text-black font-semibold mb-1">
                      Consultation Fee
                    </label>
                    <input
                      type="number"
                      id="consultation_fee"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.consultation_fee && <p className="text-red-600 text-sm mt-1">{errors.consultation_fee}</p>}
                  </div>

                  <div>
                    <label htmlFor="available_days" className="block text-black font-semibold mb-1">
                      Available Days
                    </label>
                    <input
                      type="text"
                      id="available_days"
                      name="available_days"
                      value={formData.available_days}
                      onChange={handleChange}
                      placeholder="e.g., Monday, Wednesday, Friday"
                      className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.available_days && <p className="text-red-600 text-sm mt-1">{errors.available_days}</p>}
                  </div>

                  <div>
                    <label htmlFor="available_hours" className="block text-black font-semibold mb-1">
                      Available Hours
                    </label>
                    <input
                      type="text"
                      id="available_hours"
                      name="available_hours"
                      value={formData.available_hours}
                      onChange={handleChange}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.available_hours && <p className="text-red-600 text-sm mt-1">{errors.available_hours}</p>}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-[#54074E] text-white font-semibold py-2 rounded-md hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>
              <p className="text-sm text-black text-center">
                Already have an account?{' '}
                <a href="/login" className="text-[#A1108E] font-bold">
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}