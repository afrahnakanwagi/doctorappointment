import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt, FaClock, FaUsers, FaCalendarCheck,
  FaMoneyBillWave, FaSearch, FaFilter, FaBell,
  FaCalendarWeek, FaUserFriends, FaCheckCircle,
  FaTimesCircle, FaBars, FaTimes, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext";

const Button = ({ children, className = "", variant, ...props }) => {
  const base = "rounded-lg px-4 py-2 font-medium transition-all duration-200 flex items-center gap-2";
  const styles = {
    primary: "bg-button text-white hover:bg-opacity-90 shadow-md",
    secondary: "bg-white text-button border-2 border-button hover:bg-button hover:text-white",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ className = "", children }) => (
  <div className={`rounded-xl shadow-lg bg-card hover:shadow-xl transition-shadow duration-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className = "", children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        {children}
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, axiosInstance } = useAuth();
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState({ show: false, action: null, appointment: null });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });
  const [availability, setAvailability] = useState({
    day_of_week: "MON",
    start_time: "09:00",
    end_time: "17:00",
    slot_duration: 30,
    is_active: true
  });
  const [consultationFee, setConsultationFee] = useState({
    regular: 50000,
    followUp: 40000,
    emergency: 75000
  });
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New appointment request from Sarah Wilson", time: "5 minutes ago", read: false },
    { id: 2, message: "Appointment with Maria Garcia confirmed", time: "1 hour ago", read: false },
    { id: 3, message: "Follow-up reminder: Lisa Chen", time: "2 hours ago", read: true }
  ]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const calculateAge = useCallback((dob) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }, []);

const fetchAppointments = useCallback(async () => {
  try {
    setLoading(true);
    console.log("Fetching appointments...");
    console.log("Current auth token:", localStorage.getItem('accessToken'));
    
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    };
    console.log("Request config:", config);

    const response = await axiosInstance.get(
      'https://doctorappointmentbackend-e6hx.onrender.com/appointment/appointments/',
      config
    );
    console.log("API Response:", response);
    console.log("Response data:", response.data);

    const transformedAppointments = response.data.map(appointment => {
      try {
        console.log("Processing appointment:", appointment);
        
        let appointmentDate;
        if (appointment.slot) {
          const slotParts = appointment.slot.split(' on ');
          if (slotParts.length > 1) {
            const dateStr = slotParts[1].split(' with ')[0];
            appointmentDate = new Date(dateStr);
          }
        }
        
        if (!appointmentDate || isNaN(appointmentDate.getTime())) {
          appointmentDate = new Date(appointment.created_at);
        }

        if (isNaN(appointmentDate.getTime())) {
          console.error("Invalid date for appointment:", appointment);
          return null;
        }

        return {
          id: appointment.id,
          name: appointment.patient?.username || 'Unknown Patient',
          type: appointment.appointment_type || 'Regular',
          date: appointmentDate.toISOString(),
          status: appointment.status || 'PENDING',
          details: {
            age: appointment.patient?.date_of_birth ? calculateAge(appointment.patient.date_of_birth) : 0,
            reason: appointment.reason || '',
            previousVisits: 0,
            notes: appointment.notes || ''
          },
          rawData: appointment
        };
      } catch (transformError) {
        console.error("Error transforming appointment:", transformError, appointment);
        return null;
      }
    }).filter(Boolean);

    console.log("Transformed appointments:", transformedAppointments);
    setAppointments(transformedAppointments);
    setError(null);
  } catch (err) {
    console.error("Fetch error:", err);
    console.error("Error response:", err.response);
    console.error("Error request:", err.request);
    console.error("Error config:", err.config);
    const errorMessage = err.response 
      ? `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`
      : err.message;
    setError(errorMessage);
    toast.error(`Failed to fetch appointments: ${errorMessage}`);
  } finally {
    console.log("Fetch completed");
    setLoading(false);
    setRefreshing(false);
  }
}, [axiosInstance, calculateAge]);
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      try {
        const response = await axiosInstance.get(
          "https://doctorappointmentbackend-e6hx.onrender.com/appointment/doctor/availability/"
        );
        setDoctorAvailability(response.data);
      } catch (error) {
        console.error("Error fetching doctor availability:", error);
        toast.error("Failed to load schedule");
      }
    };

    fetchDoctorAvailability();
  }, [axiosInstance]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      let matchesDate = true;
      switch (dateFilter) {
        case "today":
          matchesDate = appointmentDate.toDateString() === new Date().toDateString();
          break;
        case "week":
          matchesDate = appointmentDate >= startOfWeek;
          break;
        case "month":
          matchesDate = appointmentDate >= startOfMonth;
          break;
        case "year":
          matchesDate = appointmentDate >= startOfYear;
          break;
        case "custom":
          matchesDate = customDateRange.start && customDateRange.end ?
            appointmentDate >= customDateRange.start && appointmentDate <= customDateRange.end :
            true;
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter, customDateRange]);

  const appointmentsForSelectedDate = useMemo(() => {
    return filteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === selectedDate.toDateString();
    });
  }, [filteredAppointments, selectedDate]);

  const filteredAppointmentsByTab = useMemo(() => {
    switch (activeTab) {
      case 'approved':
        return filteredAppointments.filter(app => app.status === 'CONFIRMED');
      case 'rejected':
        return filteredAppointments.filter(app => app.status === 'REJECTED');
      case 'appointments':
      default:
        return filteredAppointments;
    }
  }, [filteredAppointments, activeTab]);

  const analyticsData = useMemo(() => ({
    patientStats: {
      total: [...new Set(appointments.map(a => a.rawData.patient.id))].length,
      new: appointments.filter(a => a.details.previousVisits === 0).length,
      returning: appointments.filter(a => a.details.previousVisits > 0).length
    },
    appointmentStats: {
      today: filteredAppointments.filter(a =>
        new Date(a.date).toDateString() === new Date().toDateString()
      ).length,
      week: filteredAppointments.filter(a =>
        new Date(a.date) >= new Date(new Date().setDate(new Date().getDate() - 7))
      ).length,
      month: filteredAppointments.filter(a =>
        new Date(a.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length
    },
    revenueStats: {
      today: filteredAppointments.filter(a =>
        new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'CONFIRMED'
      ).length * consultationFee.regular,
      week: filteredAppointments.filter(a =>
        new Date(a.date) >= new Date(new Date().setDate(new Date().getDate() - 7)) && a.status === 'CONFIRMED'
      ).length * consultationFee.regular,
      month: filteredAppointments.filter(a =>
        new Date(a.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1) && a.status === 'CONFIRMED'
      ).length * consultationFee.regular
    }
  }), [appointments, filteredAppointments, consultationFee]);

  const statsCards = useMemo(() => [
    {
      title: "Today's Appointments",
      count: analyticsData.appointmentStats.today,
      icon: <FaCalendarAlt className="text-2xl text-icon" />,
      color: "bg-card"
    },
    {
      title: "Pending Requests",
      count: filteredAppointments.filter(a => a.status === 'PENDING').length,
      icon: <FaClock className="text-2xl text-icon" />,
      color: "bg-card"
    },
    {
      title: "Total Patients",
      count: analyticsData.patientStats.total,
      icon: <FaUsers className="text-2xl text-icon" />,
      color: "bg-card"
    },
    {
      title: "Available Slots",
      count: doctorAvailability.filter(a => a.is_active).length,
      icon: <FaCalendarCheck className="text-2xl text-icon" />,
      color: "bg-card"
    }
  ], [analyticsData, filteredAppointments, doctorAvailability]);

  const showToast = useCallback((type, message) => {
    const options = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (type) {
      case 'success':
        toast.success(message, {
          ...options,
          style: {
            background: '#4CAF50',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        break;
      case 'error':
        toast.error(message, {
          ...options,
          style: {
            background: '#f44336',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        break;
      case 'info':
        toast.info(message, {
          ...options,
          style: {
            background: '#2196F3',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        break;
      default:
        toast(message, options);
    }
  }, []);

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(
        "https://doctorappointmentbackend-e6hx.onrender.com/appointment/doctor/availability/",
        {
          ...availability,
          start_time: `${availability.start_time}:00`,
          end_time: `${availability.end_time}:00`
        }
      );
      showToast('success', "Availability set successfully!");
      setShowAvailabilityModal(false);

      const response = await axiosInstance.get(
        "https://doctorappointmentbackend-e6hx.onrender.com/appointment/doctor/availability/"
      );
      setDoctorAvailability(response.data);
    } catch (error) {
      console.error("Error setting availability:", error);
      showToast('error', error.response?.data?.message || "Failed to set availability");
    }
  };

  const handleFeeSubmit = (e) => {
    e.preventDefault();
    showToast('success', '✅ Consultation fees updated successfully!');
    setShowFeeModal(false);
  };

  const handleAppointmentAction = (action, appointment) => {
    setShowConfirmModal({
      show: true,
      action,
      appointment
    });
  };

  const confirmAction = async () => {
    const { action, appointment } = showConfirmModal;
    try {
      const status = action === 'accept' ? 'CONFIRMED' : 'REJECTED';
      const response = await axiosInstance.patch(
        `https://doctorappointmentbackend-e6hx.onrender.com/appointment/appointments/${appointment.id}/status/`,
        { status }
      );

      if (response.status === 200) {
        // Update the local state immediately
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt.id === appointment.id 
              ? { ...apt, status: status }
              : apt
          )
        );
        
        showToast('success', `✅ Patient ${appointment.name} has been ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      }
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      showToast('error', `Failed to ${action} appointment: ${error.response?.data?.message || error.message}`);
    } finally {
      setShowConfirmModal({ show: false, action: null, appointment: null });
    }
  };

  const handleModalClose = () => {
    const { action, appointment } = showConfirmModal;
    if (action && appointment) {
      showToast('info', `ℹ️ Action for patient ${appointment.name} has been cancelled.`);
    }
    setShowConfirmModal({ show: false, action: null, appointment: null });
  };

  const refreshAppointments = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  const sidebarItems = [
    { id: 'patients', label: 'Patients', icon: <FaUserFriends /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'approved', label: 'Approved', icon: <FaCheckCircle /> },
    { id: 'rejected', label: 'Rejected', icon: <FaTimesCircle /> },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button mx-auto mb-4">
            <FaSpinner className="inline-block text-2xl" />
          </div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-500">
          <FaTimesCircle className="text-4xl mx-auto mb-4" />
          <p>Error loading appointments: {error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={refreshAppointments}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-card shadow-lg transition-all duration-300 z-50 ${showSidebar ? 'w-64' : 'w-0'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-button">Doctor Portal</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-button hover:text-icon"
            >
              <FaTimes />
            </button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                  ? 'bg-button text-white'
                  : 'text-button hover:bg-button/10'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${showSidebar ? 'ml-64' : 'ml-0'}`}>
        {/* Top Navigation */}
        <nav className="bg-navbar shadow-md p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-button hover:text-icon"
            >
              <FaBars />
            </button>
            <div className="flex items-center space-x-4">
              <button
                className="text-button hover:text-icon relative"
                onClick={refreshAppointments}
                disabled={refreshing}
              >
                {refreshing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaBell />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-button hover:text-icon"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-button">Welcome Back, Dr. {user?.username}</h1>
            <p className="text-gray-600 mt-2">Here's your appointment overview for today</p>
          </div>

          {/* Analytics Section */}
          <div className="mb-8">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Patient Analytics */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-button mb-4">Patient Analytics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Patients</span>
                        <span className="font-semibold">{analyticsData.patientStats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">New Patients</span>
                        <span className="font-semibold text-green-600">{analyticsData.patientStats.new}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Returning Patients</span>
                        <span className="font-semibold text-blue-600">{analyticsData.patientStats.returning}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Analytics */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-button mb-4">Appointment Analytics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Today's Appointments</span>
                        <span className="font-semibold">{analyticsData.appointmentStats.today}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">This Week</span>
                        <span className="font-semibold">{analyticsData.appointmentStats.week}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">{analyticsData.appointmentStats.month}</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Analytics */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-button mb-4">Revenue Analytics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Today's Revenue</span>
                        <span className="font-semibold">{formatCurrency(analyticsData.revenueStats.today)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">This Week</span>
                        <span className="font-semibold">{formatCurrency(analyticsData.revenueStats.week)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">{formatCurrency(analyticsData.revenueStats.month)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 bg-card p-1 rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                className="text-sm"
                onClick={() => setViewMode('list')}
              >
                <FaCalendarAlt /> List View
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                className="text-sm"
                onClick={() => setViewMode('calendar')}
              >
                <FaCalendarWeek /> Calendar View
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFeeModal(true)}
              className="flex items-center gap-2"
            >
              <FaMoneyBillWave /> Set Fees
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-button focus:ring-button"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FaFilter /> Filters
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 p-4 bg-card rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {/* Custom Date Range */}
                  {dateFilter === "custom" && (
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <DatePicker
                          selected={customDateRange.start}
                          onChange={(date) => setCustomDateRange(prev => ({ ...prev, start: date }))}
                          className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                          dateFormat="MM/dd/yyyy"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <DatePicker
                          selected={customDateRange.end}
                          onChange={(date) => setCustomDateRange(prev => ({ ...prev, end: date }))}
                          className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                          dateFormat="MM/dd/yyyy"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, idx) => (
              <Card key={idx}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <h2 className="text-2xl font-semibold mt-1 text-button">{stat.count}</h2>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Appointments Section */}
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardContent>
                  <h2 className="text-xl font-semibold mb-4 text-button">
                    {activeTab === 'patients' ? 'Patients' :
                      activeTab === 'approved' ? 'Approved Appointments' :
                        activeTab === 'rejected' ? 'Rejected Appointments' :
                          'All Appointments'}
                  </h2>
                  <div className="space-y-4">
                    {filteredAppointmentsByTab.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No appointments found</p>
                    ) : (
                      filteredAppointmentsByTab.map((appt) => (
                        <div key={appt.id} className="border rounded-lg p-4 hover:bg-card transition-colors cursor-pointer" onClick={() => setShowAppointmentDetails(appt)}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-button">{appt.name}</h3>
                              <p className="text-sm text-gray-600">{appt.type}</p>
                              <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleString()}</p>
                            </div>
                            {activeTab === 'appointments' && (
                              <div className="flex gap-2">
                                <Button variant="success" className="text-sm py-1" onClick={(e) => { e.stopPropagation(); handleAppointmentAction('accept', appt); }}>Accept</Button>
                                <Button variant="danger" className="text-sm py-1" onClick={(e) => { e.stopPropagation(); handleAppointmentAction('reject', appt); }}>Reject</Button>
                              </div>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                              appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                              {appt.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent>
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      className="w-full border-none"
                      tileClassName={({ date }) => {
                        const hasAppointments = filteredAppointments.some(
                          app => new Date(app.date).toDateString() === date.toDateString()
                        );
                        return hasAppointments ? 'bg-button text-white rounded-full' : '';
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Selected Date Appointments */}
              <div>
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-4 text-button">
                      Appointments for {selectedDate.toLocaleDateString()}
                    </h2>
                    <div className="space-y-4">
                      {appointmentsForSelectedDate.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No appointments for this date</p>
                      ) : (
                        appointmentsForSelectedDate.map(appt => (
                          <div
                            key={appt.id}
                            className="border rounded-lg p-4 hover:bg-card transition-colors cursor-pointer"
                            onClick={() => setShowAppointmentDetails(appt)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-button">{appt.name}</h3>
                                <p className="text-sm text-gray-600">{appt.type}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(appt.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                {appt.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Availability and Fees Section */}
          <div className="mt-8">
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-button">Practice Settings</h2>
                    <p className="text-gray-600">Manage your consultation hours and fees</p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => setShowAvailabilityModal(true)}>
                      <FaClock /> Set Available Times
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-button">Current Schedule</h3>
                    <div className="space-y-2 text-gray-600">
                      {doctorAvailability.length === 0 ? (
                        <p>No schedule set</p>
                      ) : (
                        doctorAvailability.map((schedule) => (
                          <div key={schedule.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{schedule.day_of_week}</p>
                              <p className="text-sm">
                                {new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                {new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {schedule.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-button">Appointment Duration</h3>
                    <p className="text-gray-600">30 minutes per consultation</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-button">Current Fees</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>Regular Consultation: {formatCurrency(consultationFee.regular)}</p>
                      <p>Follow-up Visit: {formatCurrency(consultationFee.followUp)}</p>
                      <p>Emergency Visit: {formatCurrency(consultationFee.emergency)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal.show} onClose={handleModalClose}>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-button">
            {showConfirmModal.action === 'accept' ? 'Accept Appointment' : 'Reject Appointment'}
          </h2>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              {showConfirmModal.action === 'accept'
                ? 'Are you sure you want to accept this appointment?'
                : 'Are you sure you want to reject this appointment?'}
            </p>
            <div className="bg-card p-4 rounded-lg">
              <p className="font-semibold text-button">{showConfirmModal.appointment?.name}</p>
              <p className="text-sm text-gray-600">{showConfirmModal.appointment?.type}</p>
              <p className="text-sm text-gray-500">{showConfirmModal.appointment?.date || showConfirmModal.appointment?.time}</p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant={showConfirmModal.action === 'accept' ? 'success' : 'danger'}
              onClick={confirmAction}
            >
              {showConfirmModal.action === 'accept' ? 'Accept' : 'Reject'}
            </Button>
          </div>
        </CardContent>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal isOpen={showAppointmentDetails} onClose={() => setShowAppointmentDetails(null)}>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-button">Appointment Details</h2>
          {showAppointmentDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-button">{showAppointmentDetails.name}</h3>
                <p className="text-gray-600">{showAppointmentDetails.type}</p>
                <p className="text-gray-500">{showAppointmentDetails.date || showAppointmentDetails.time}</p>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 text-button">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{showAppointmentDetails.details.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Previous Visits</p>
                    <p className="font-medium">{showAppointmentDetails.details.previousVisits}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 text-button">Visit Details</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Reason for Visit</p>
                    <p className="font-medium">{showAppointmentDetails.details.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{showAppointmentDetails.details.notes}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="secondary" onClick={() => setShowAppointmentDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Modal>

      {/* Consultation Fees Modal */}
      <Modal isOpen={showFeeModal} onClose={() => setShowFeeModal(false)}>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-button">Set Consultation Fees</h2>
          <form onSubmit={handleFeeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regular Consultation Fee (UGX)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                  value={consultationFee.regular}
                  onChange={(e) => setConsultationFee({ ...consultationFee, regular: parseInt(e.target.value) })}
                  min="0"
                  step="1000"
                />
                <p className="text-sm text-gray-500 mt-1">Current: {formatCurrency(consultationFee.regular)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Visit Fee (UGX)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                  value={consultationFee.followUp}
                  onChange={(e) => setConsultationFee({ ...consultationFee, followUp: parseInt(e.target.value) })}
                  min="0"
                  step="1000"
                />
                <p className="text-sm text-gray-500 mt-1">Current: {formatCurrency(consultationFee.followUp)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Visit Fee (UGX)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                  value={consultationFee.emergency}
                  onChange={(e) => setConsultationFee({ ...consultationFee, emergency: parseInt(e.target.value) })}
                  min="0"
                  step="1000"
                />
                <p className="text-sm text-gray-500 mt-1">Current: {formatCurrency(consultationFee.emergency)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={() => setShowFeeModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Modal>

      {/* Availability Modal */}
      <Modal isOpen={showAvailabilityModal} onClose={() => setShowAvailabilityModal(false)}>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-button">Set Availability</h2>
          <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                value={availability.day_of_week}
                onChange={(e) => setAvailability({ ...availability, day_of_week: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-button focus:border-button"
              >
                <option value="MON">Monday</option>
                <option value="TUE">Tuesday</option>
                <option value="WED">Wednesday</option>
                <option value="THU">Thursday</option>
                <option value="FRI">Friday</option>
                <option value="SAT">Saturday</option>
                <option value="SUN">Sunday</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={availability.start_time}
                onChange={(e) => setAvailability({ ...availability, start_time: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-button focus:border-button"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={availability.end_time}
                onChange={(e) => setAvailability({ ...availability, end_time: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-button focus:border-button"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (minutes)
              </label>
              <select
                value={availability.slot_duration}
                onChange={(e) => setAvailability({ ...availability, slot_duration: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-button focus:border-button"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={availability.is_active}
                onChange={(e) => setAvailability({ ...availability, is_active: e.target.checked })}
                className="h-4 w-4 text-button focus:ring-button border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAvailabilityModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button/90"
              >
                Save Availability
              </button>
            </div>
          </form>
        </CardContent>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;