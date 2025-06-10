import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        let tempErrors = {};

        if (!formData.email) {
            tempErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Email address is invalid';
        }

        if (!formData.password) {
            tempErrors.password = 'Password is required';
        }

        if (!formData.role) {
            tempErrors.role = 'Please select your role';
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

            try {
                const loginData = {
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                };

                const response = await fetch('https://doctorappointmentbackend-e6hx.onrender.com/users/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Login failed');
                }

                console.log('Login successful:', data);

                localStorage.setItem('accessToken', data.tokens.access);
                localStorage.setItem('refreshToken', data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.role === 'doctor') {
                    navigate('/doctor-dashboard');
                } else if (data.role === 'patient') {
                    navigate('/mom-dashboard');
                } else {
                    throw new Error('Unknown user role');
                }

            } catch (error) {
                console.error('Login error:', error);
                setApiError(error.message || 'Login failed. Please check your credentials and try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            <Navbar />
            <div
                className="flex-grow flex items-center justify-center relative bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/login.jpg')" }}
            >
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-6 py-12">
                    <div className="text-white mb-12 md:mb-0 md:w-1/2">
                        <h2 className="text-3xl font-bold">Welcome Back</h2>
                        <p className="text-pink-400 font-semibold mt-2 text-lg">
                            Login to access your account.
                        </p>
                    </div>

                    <div className="bg-pink-100 rounded-lg shadow-lg p-8 w-full md:w-1/2 max-w-md">
                        {apiError && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                                {apiError}
                            </div>
                        )}
                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
                                <label htmlFor="role" className="block text-black font-semibold mb-1">
                                    Login As
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

                            <button
                                type="submit"
                                className="w-full bg-[#54074E] text-white font-semibold py-2 rounded-md hover:bg-purple-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging In...' : 'Login'}
                            </button>
                            <p className="text-sm text-black text-center">
                                Don't have an account?{' '}
                                <a href="/signup" className="text-[#A1108E] font-bold">
                                    Sign up here
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
