import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, CreditCard, Clock, CheckCircle, XCircle, Truck, DollarSign } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import '../../styles/courier-book.css';

const CourierBook = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const bookingServices = [
    {
      id: 1,
      name: 'Pasundo',
      description: 'Immediate pickup and delivery service',
      available: 12,
      color: '#22c55e'
    },
    {
      id: 2,
      name: 'Pasugo',
      description: 'Scheduled delivery service',
      available: 8,
      color: '#3b82f6'
    },
    {
      id: 3,
      name: 'Express',
      description: 'Rush delivery (Same day)',
      available: 5,
      color: '#f59e0b'
    },
    {
      id: 4,
      name: 'Bulk Orders',
      description: 'Multiple items delivery',
      available: 3,
      color: '#8b5cf6'
    }
  ];

  const availableBookings = [
    {
      id: 1,
      pickupLocation: 'SM City Mall',
      deliveryLocation: 'Downtown Area',
      item: 'Shopping Bags (3 items)',
      payment: '₱200.00',
      serviceType: 'Pasundo',
      customerName: 'Maria Garcia',
      phone: '+63 912 345 6789',
      status: 'Available',
      timestamp: '5 mins ago',
      priority: 'Normal',
      distance: '2.5 km'
    },
    {
      id: 2,
      pickupLocation: 'Robinson\'s Plaza',
      deliveryLocation: 'Residential Area',
      item: 'Electronics Package',
      payment: '₱350.00',
      serviceType: 'Pasugo',
      customerName: 'John Santos',
      phone: '+63 917 654 3210',
      status: 'Available',
      timestamp: '12 mins ago',
      priority: 'High',
      distance: '4.2 km'
    },
    {
      id: 3,
      pickupLocation: 'Jasaan Market',
      deliveryLocation: 'Cabacungan Zone',
      item: 'Groceries',
      payment: '₱150.00',
      serviceType: 'Pasundo',
      customerName: 'Angela Cruz',
      phone: '+63 918 765 4321',
      status: 'Available',
      timestamp: '8 mins ago',
      priority: 'Normal',
      distance: '1.8 km'
    },
    {
      id: 4,
      pickupLocation: 'City Hospital',
      deliveryLocation: 'Jasaan Clinic',
      item: 'Medical Documents (Urgent)',
      payment: '₱500.00',
      serviceType: 'Pasugo',
      customerName: 'Dr. Reyes',
      phone: '+63 919 876 5432',
      status: 'Available',
      timestamp: '2 mins ago',
      priority: 'Urgent',
      distance: '3.1 km'
    },
    {
      id: 5,
      pickupLocation: 'Restaurant XYZ',
      deliveryLocation: 'Residential Condo',
      item: 'Food Delivery',
      payment: '₱100.00',
      serviceType: 'Pasundo',
      customerName: 'Ramon Lopez',
      phone: '+63 920 987 6543',
      status: 'Available',
      timestamp: '15 mins ago',
      priority: 'High',
      distance: '2.0 km'
    }
  ];

  const filteredBookings = selectedFilter === 'All'
    ? availableBookings
    : availableBookings.filter(booking => booking.serviceType === selectedFilter);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'rgba(239, 68, 68, 0.1)';
      case 'High': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(34, 197, 94, 0.1)';
    }
  };

  return (
    <div className="courier-home">
      {/* Header */}
      <div className="courier-header">
        <div className="header-logo">
          <div className="logo-icon">
            <div className="delivery-person">
              <div className="person-body"></div>
              <div className="person-head"></div>
              <div className="delivery-bag"></div>
            </div>
            <div className="scooter">
              <div className="scooter-body"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
            </div>
          </div>
          <span className="brand-name">Pickarry</span>
        </div>
        <div className="header-right">
          <button className="notification-button">
            <span className="notification-bell">🔔</span>
            <span className="notification-dot"></span>
          </button>
          <div className="courier-profile">
            <div className="profile-avatar">
              <span>C</span>
            </div>
            <span className="profile-name">Courier</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="courier-content">
        {/* Sidebar */}
        <div className="courier-sidebar">
          <div className="courier-profile-card">
            <div className="profile-avatar-large">
              <span>C</span>
            </div>
            <div className="profile-info">
              <h3>Courier</h3>
              <p>courier@gmail.com</p>
            </div>
          </div>

          <nav className="courier-nav">
            <button
              onClick={() => navigate('/courier/home')}
              className="nav-item"
            >
              <div className="nav-icon">🏠</div>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/courier/history')}
              className="nav-item"
            >
              <div className="nav-icon">📋</div>
              <span>History</span>
            </button>
            <button
              onClick={() => navigate('/courier/book')}
              className="nav-item active"
            >
              <div className="nav-icon">📅</div>
              <span>Book</span>
            </button>
            <button
              onClick={() => navigate('/courier/menu')}
              className="nav-item"
            >
              <div className="nav-icon">☰</div>
              <span>Menu</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="courier-main-content">
          {/* Available Booking Services */}
          <div className="booking-services-section">
            <div className="section-header">
              <h2>Available Booking Services</h2>
              <p>Services you can book for delivery</p>
            </div>

            <div className="booking-services-grid">
              {bookingServices.map((service) => (
                <div key={service.id} className="booking-service-card">
                  <div className="service-header">
                    <div className="service-icon" style={{ backgroundColor: `${service.color}20` }}>
                      <Truck size={24} style={{ color: service.color }} />
                    </div>
                    <h3>{service.name}</h3>
                  </div>

                  <p className="service-description">{service.description}</p>

                  <div className="service-availability">
                    <div className="availability-badge">
                      <span className="availability-count">{service.available}</span>
                      <span className="availability-label">Available</span>
                    </div>
                  </div>

                  <button className="service-button" style={{ borderColor: service.color, color: service.color }}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Bookings Header */}
          <div className="section-header">
            <h2>Recent Booking Requests</h2>
            <p>Delivery requests waiting for acceptance</p>
          </div>

          {/* Search and Filter */}
          <div className="book-search-filter">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by location, customer name..."
                className="search-input"
              />
            </div>

            <div className="filter-buttons">
              <button
                onClick={() => setSelectedFilter('All')}
                className={`filter-btn ${selectedFilter === 'All' ? 'active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('Pasundo')}
                className={`filter-btn ${selectedFilter === 'Pasundo' ? 'active' : ''}`}
              >
                PASUNDO
              </button>
              <button
                onClick={() => setSelectedFilter('Pasugo')}
                className={`filter-btn ${selectedFilter === 'Pasugo' ? 'active' : ''}`}
              >
                PASUGO
              </button>
            </div>
          </div>

          {/* Available Bookings List */}
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-pickup">
                    <MapPin size={20} />
                    <div className="pickup-info">
                      <span className="pickup-main">{booking.pickupLocation}</span>
                      <span className="pickup-sub">→ {booking.deliveryLocation}</span>
                    </div>
                  </div>
                  <div className="booking-priority">
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityBgColor(booking.priority),
                        color: getPriorityColor(booking.priority),
                        borderColor: getPriorityColor(booking.priority)
                      }}
                    >
                      {booking.priority}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="booking-detail">
                    <Package size={16} className="detail-icon" />
                    <span>{booking.item}</span>
                  </div>
                  <div className="booking-detail">
                    <DollarSign size={16} className="detail-icon" />
                    <span>{booking.payment}</span>
                  </div>
                  <div className="booking-detail">
                    <Truck size={16} className="detail-icon" />
                    <span>{booking.serviceType}</span>
                  </div>
                  <div className="booking-detail">
                    <Clock size={16} className="detail-icon" />
                    <span>{booking.timestamp} • {booking.distance}</span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-icon">👤</span>
                    <span>{booking.customerName} ({booking.phone})</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="action-button accept">
                    Accept Booking
                  </button>
                  <button className="action-button view">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="courier-footer">
        <div className="footer-logo">
          <div className="logo-icon">
            <div className="delivery-person">
              <div className="person-body"></div>
              <div className="person-head"></div>
              <div className="delivery-bag"></div>
            </div>
            <div className="scooter">
              <div className="scooter-body"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
            </div>
          </div>
          <span className="brand-name">Pickarry</span>
        </div>

        <div className="footer-links">
          <a href="#" className="footer-link">Contact Us</a>
          <a href="#" className="footer-link">Terms of Use</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Rider's Policy</a>
          <a href="#" className="footer-link">Customer's Policy</a>
        </div>

        <div className="footer-copyright">
          <p>INFERNO Copyright © 2021 Inferno - All rights reserved || Designed By: Mahesh</p>
        </div>
      </div>
    </div>
  );
};

export default CourierBook;