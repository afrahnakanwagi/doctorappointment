import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCalendarAlt, FaClock, FaUsers, FaCalendarCheck, 
  FaMoneyBillWave, FaSearch, FaFilter, FaBell, 
  FaCalendarWeek, FaUserFriends, FaCheckCircle, 
  FaTimesCircle, FaBars, FaTimes 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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

// Main Dashboard Component
const DoctorDashboard = () => {
  const navigate = useNavigate();
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
    days: [],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30
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

  const [appointments] = useState([
    {
      id: 1,
      name: "Sarah Wilson",
      type: "Routine Checkup",
      date: "2024-03-20T10:00:00",
      status: "PENDING",
      details: {
        age: 28,
        reason: "Regular pregnancy checkup",
        previousVisits: 3,
        notes: "First trimester"
      }
    },
    {
      id: 2,
      name: "Emily Brown",
      type: "Prenatal Visit",
      date: "2024-03-20T14:00:00",
      status: "PENDING",
      details: {
        age: 32,
        reason: "Follow-up consultation",
        previousVisits: 5,
        notes: "Third trimester"
      }
    },
    {
      id: 3,
      name: "Maria Garcia",
      type: "Follow-up",
      date: "2024-03-21T09:00:00",
      status: "CONFIRMED",
      details: {
        age: 30,
        reason: "Post-delivery checkup",
        previousVisits: 8,
        notes: "2 weeks postpartum"
      }
    },
    {
      id: 4,
      name: "Lisa Chen",
      type: "Initial Consultation",
      date: "2024-03-21T11:30:00",
      status: "CONFIRMED",
      details: {
        age: 25,
        reason: "First pregnancy consultation",
        previousVisits: 0,
        notes: "First visit"
      }
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const analyticsData = {
    patientStats: {
      total: 45,
      new: 12,
      returning: 33
    },
    appointmentStats: {
      today: 5,
      week: 25,
      month: 98
    },
    revenueStats: {
      today: 250000,
      week: 1250000,
      month: 4900000
    }
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

  const showToast = (type, message) => {
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
  };

  const handleAvailabilitySubmit = (e) => {
    e.preventDefault();
    showToast('success', '✅ Availability updated successfully!');
    setShowAvailabilityModal(false);
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

  const confirmAction = () => {
    const { action, appointment } = showConfirmModal;
    if (action === 'accept') {
      showToast('success', `✅ Patient ${appointment.name} has been accepted successfully!`);
    } else {
      showToast('error', `❌ Patient ${appointment.name} has been rejected.`);
    }
    setShowConfirmModal({ show: false, action: null, appointment: null });
  };

  const handleModalClose = () => {
    const { action, appointment } = showConfirmModal;
    if (action && appointment) {
      showToast('info', `ℹ️ Action for patient ${appointment.name} has been cancelled.`);
    }
    setShowConfirmModal({ show: false, action: null, appointment: null });
  };

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

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const sidebarItems = [
    { id: 'patients', label: 'Patients', icon: <FaUserFriends /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'approved', label: 'Approved', icon: <FaCheckCircle /> },
    { id: 'rejected', label: 'Rejected', icon: <FaTimesCircle /> },
  ];

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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
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
              <button className="text-button hover:text-icon">
                <FaBell />
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
            <h1 className="text-3xl font-bold text-button">Welcome Back, Dr. Afrah</h1>
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
            {[
              { title: "Today's Appointments", count: 5, icon: <FaCalendarAlt className="text-2xl text-icon" />, color: "bg-card" },
              { title: "Pending Requests", count: 3, icon: <FaClock className="text-2xl text-icon" />, color: "bg-card" },
              { title: "Total Patients", count: 45, icon: <FaUsers className="text-2xl text-icon" />, color: "bg-card" },
              { title: "Available Slots", count: 12, icon: <FaCalendarCheck className="text-2xl text-icon" />, color: "bg-card" }
            ].map((stat, idx) => (
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
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
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
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
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
                      <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                      <p>Saturday: 9:00 AM - 1:00 PM</p>
                      <p>Sunday: Closed</p>
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
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4 text-button">Set Your Availability</h2>
              <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded text-button focus:ring-button"
                          checked={availability.days.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...availability.days, day]
                              : availability.days.filter(d => d !== day);
                            setAvailability({ ...availability, days: newDays });
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                      value={availability.startTime}
                      onChange={(e) => setAvailability({ ...availability, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                      value={availability.endTime}
                      onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Duration (minutes)
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 focus:border-button focus:ring-button"
                    value={availability.slotDuration}
                    onChange={(e) => setAvailability({ ...availability, slotDuration: e.target.value })}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAvailabilityModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
