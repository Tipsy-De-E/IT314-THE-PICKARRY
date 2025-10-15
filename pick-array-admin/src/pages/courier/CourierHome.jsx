import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Package, CreditCard, Clock, ChevronDown, DollarSign, Smartphone, Truck } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import '../../styles/courier-home.css';

const CourierHome = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Orders');

  const filterOptions = ['All Orders', 'Pasundo', 'Pasugo'];

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

  const orders = [
    {
      id: 1,
      pickupLocation: 'Brewbox Jasaan Plaza',
      deliveryLocation: 'Bobuntugan Zone 4',
      item: 'Iced Coffee Macha 2 Cups',
      payment: '200.00 - Cash on Delivery (COD)',
      rushDelivery: '₱50.00 (Rush)',
      date: 'Aug 10, 2025 1:00 PM',
      status: 'Pasundo',
      customerName: 'Juan Dela Cruz',
      phone: '+63 912 345 6789'
    },
    {
      id: 2,
      pickupLocation: 'SM City Jasaan',
      deliveryLocation: 'Purok San Pedro',
      item: 'Documents & Letters',
      payment: '150.00 - GCash',
      rushDelivery: null,
      date: 'Aug 10, 2025 2:30 PM',
      status: 'Pasugo',
      customerName: 'Maria Santos',
      phone: '+63 917 654 3210'
    },
    {
      id: 3,
      pickupLocation: 'Jasaan Municipal Hall',
      deliveryLocation: 'Cabacungan Zone 8',
      item: 'Official Documents',
      payment: '100.00 - Cash on Delivery (COD)',
      rushDelivery: '₱25.00 (Rush)',
      date: 'Aug 10, 2025 3:15 PM',
      status: 'Pasundo',
      customerName: 'Pedro Reyes',
      phone: '+63 926 789 0123'
    },
    {
      id: 4,
      pickupLocation: 'Jasaan Pharmacy',
      deliveryLocation: 'Bobuntugan Zone 2',
      item: 'Medicines',
      payment: '300.00 - GCash',
      rushDelivery: null,
      date: 'Aug 10, 2025 4:00 PM',
      status: 'Pasugo',
      customerName: 'Ana Garcia',
      phone: '+63 935 456 7890'
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.pickupLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.deliveryLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.item.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = selectedFilter === 'All Orders' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const handleViewDetails = (orderId) => {
    navigate(`/courier/order-details/${orderId}`);
  };

  const handleViewServiceDetails = (serviceId) => {
    navigate(`/courier/service-details/${serviceId}`);
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
              className="nav-item active"
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
              className="nav-item"
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

                  <button
                    className="service-button"
                    style={{ borderColor: service.color, color: service.color }}
                    onClick={() => handleViewServiceDetails(service.id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="courier-search-filter">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search orders, customers, locations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-buttons">
              <button
                onClick={() => { setSelectedFilter('All Orders'); setFilterOpen(false); }}
                className={`filter-btn ${selectedFilter === 'All Orders' ? 'active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => { setSelectedFilter('Pasundo'); setFilterOpen(false); }}
                className={`filter-btn ${selectedFilter === 'Pasundo' ? 'active' : ''}`}
              >
                PASUNDO
              </button>
              <button
                onClick={() => { setSelectedFilter('Pasugo'); setFilterOpen(false); }}
                className={`filter-btn ${selectedFilter === 'Pasugo' ? 'active' : ''}`}
              >
                PASUGO
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="courier-orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="courier-order-card">
                <div className="order-header">
                  <div className="order-pickup">
                    <MapPin className="w-5 h-5" size={20} />
                    <span>{order.pickupLocation}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-detail">
                    <MapPin className="detail-icon" size={16} />
                    <span>{order.deliveryLocation}</span>
                  </div>
                  <div className="order-detail">
                    <Package className="detail-icon" size={16} />
                    <span>{order.item}</span>
                  </div>
                  <div className="order-detail">
                    {order.payment.includes('GCash') ? (
                      <Smartphone className="detail-icon" size={16} />
                    ) : (
                      <DollarSign className="detail-icon" size={16} />
                    )}
                    <span>{order.payment}</span>
                  </div>
                  {order.rushDelivery && (
                    <div className="order-detail">
                      <span className="detail-icon" style={{ color: '#ef4444' }}>🚀</span>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{order.rushDelivery}</span>
                    </div>
                  )}
                  <div className="order-detail">
                    <Clock className="detail-icon" size={16} />
                    <span>{order.date}</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-icon">👤</span>
                    <span>{order.customerName} - {order.phone}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="action-button accept">
                    Accept Order
                  </button>
                  <button
                    className="action-button view"
                    onClick={() => handleViewDetails(order.id)}
                  >
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

export default CourierHome;