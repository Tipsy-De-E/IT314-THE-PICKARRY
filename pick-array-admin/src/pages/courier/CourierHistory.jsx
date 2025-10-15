import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, CreditCard, Clock, CheckCircle, XCircle, MessageSquare, X, Truck, TrendingUp, DollarSign } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import '../../styles/courier-history.css';

const CourierHistory = () => {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentOrderRemark, setCurrentOrderRemark] = useState('');

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const completedOrders = [
    {
      id: 1,
      pickupLocation: 'Brewbox Jasaan Plaza',
      deliveryLocation: 'Bobuntugan Zone 4',
      item: 'Iced Coffee Macha 2 Cups',
      payment: '200.00 Cash on Delivery',
      date: 'Aug 9, 2025 1:00 PM',
      status: 'Completed',
      customerName: 'Juan Dela Cruz',
      earnings: '₱50.00'
    },
    {
      id: 2,
      pickupLocation: 'SM City Jasaan',
      deliveryLocation: 'Purok San Pedro',
      item: 'Documents & Letters',
      payment: '150.00 Cash on Delivery',
      date: 'Aug 8, 2025 2:30 PM',
      status: 'Completed',
      customerName: 'Maria Santos',
      earnings: '₱40.00'
    },
    {
      id: 3,
      pickupLocation: 'Jasaan Municipal Hall',
      deliveryLocation: 'Cabacungan Zone 8',
      item: 'Official Documents',
      payment: '100.00 Cash on Delivery',
      date: 'Aug 7, 2025 3:15 PM',
      status: 'Cancelled',
      customerName: 'Pedro Reyes',
      earnings: '₱0.00'
    }
  ];

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

  const totalEarnings = completedOrders
    .filter(order => order.status === 'Completed')
    .reduce((sum, order) => sum + parseFloat(order.earnings.replace('₱', '')), 0);

  const totalAvailableBookings = bookingServices.reduce((sum, service) => sum + service.available, 0);

  const openRemarksModal = (orderId, existingRemark = '') => {
    setSelectedOrderId(orderId);
    setCurrentOrderRemark(existingRemark || '');
    setShowRemarksModal(true);
  };

  const saveRemark = () => {
    if (selectedOrderId) {
      setRemarks({
        ...remarks,
        [selectedOrderId]: currentOrderRemark
      });
      setShowRemarksModal(false);
      setCurrentOrderRemark('');
      setSelectedOrderId(null);
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
              className="nav-item active"
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
          {/* History Header */}
          <div className="history-header">
            <h1>Delivery History</h1>
            <p>Track your completed deliveries and earnings</p>
          </div>

          {/* Summary Cards */}
          <div className="earnings-summary">
            <div className="summary-card">
              <h3>Total Earnings</h3>
              <p className="earnings-amount">₱{totalEarnings.toFixed(2)}</p>
              <span className="earnings-period">This Month</span>
            </div>
            <div className="summary-card">
              <h3>Completed Orders</h3>
              <p className="orders-count">
                {completedOrders.filter(order => order.status === 'Completed').length}
              </p>
              <span className="orders-period">This Month</span>
            </div>
            <div className="summary-card">
              <h3>Available Bookings</h3>
              <p className="bookings-count">{totalAvailableBookings}</p>
              <span className="bookings-period">Total Services</span>
            </div>
          </div>

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

          {/* History List */}
          <div className="history-section">
            <div className="section-header">
              <h2>Delivery History</h2>
              <p>Your past deliveries and earnings</p>
            </div>

            <div className="history-list">
              {completedOrders.map((order) => (
                <div key={order.id} className="history-order-card">
                  <div className="order-header">
                    <div className="order-pickup">
                      <MapPin size={20} />
                      <span>{order.pickupLocation}</span>
                    </div>
                    <div className="order-status">
                      {order.status === 'Completed' ? (
                        <CheckCircle size={20} className="status-icon completed" />
                      ) : (
                        <XCircle size={20} className="status-icon cancelled" />
                      )}
                      <span className={`status-text ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="order-detail">
                      <MapPin size={16} className="detail-icon" />
                      <span>{order.deliveryLocation}</span>
                    </div>
                    <div className="order-detail">
                      <Package size={16} className="detail-icon" />
                      <span>{order.item}</span>
                    </div>
                    <div className="order-detail">
                      <DollarSign size={16} className="detail-icon" />
                      <span>{order.payment}</span>
                    </div>
                    <div className="order-detail">
                      <Clock size={16} className="detail-icon" />
                      <span>{order.date}</span>
                    </div>
                    <div className="order-detail">
                      <span className="detail-icon">👤</span>
                      <span>{order.customerName}</span>
                    </div>
                  </div>

                  <div className="order-footer">
                    {order.status === 'Completed' && (
                      <div className="order-earnings">
                        <span className="earnings-label">Earnings:</span>
                        <span className="earnings-value">{order.earnings}</span>
                      </div>
                    )}

                    <button
                      className={`remarks-button ${remarks[order.id] ? 'has-remarks' : ''}`}
                      onClick={() => openRemarksModal(order.id, remarks[order.id])}
                    >
                      <MessageSquare size={16} />
                      <span>
                        {remarks[order.id] ? 'View Remarks' : 'Add Remarks'}
                      </span>
                    </button>
                  </div>

                  {remarks[order.id] && (
                    <div className="remarks-preview">
                      <p className="remark-text">{remarks[order.id]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Modal */}
      {showRemarksModal && (
        <div className="modal-overlay" onClick={() => setShowRemarksModal(false)}>
          <div className="remarks-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Remarks & Concerns</h2>
              <button
                className="close-button"
                onClick={() => setShowRemarksModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-info">
                <p className="order-id">
                  Order ID: {selectedOrderId}
                </p>
              </div>

              <div className="remarks-form">
                <label htmlFor="remarks-textarea">Add Your Remarks or Concerns:</label>
                <textarea
                  id="remarks-textarea"
                  className="remarks-textarea"
                  placeholder="Enter any concerns, issues, or notes about this delivery. This helps us improve our service and address any problems."
                  value={currentOrderRemark}
                  onChange={(e) => setCurrentOrderRemark(e.target.value)}
                  rows={6}
                  maxLength={500}
                />
                <p className="character-count">
                  {currentOrderRemark.length} / 500 characters
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowRemarksModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="save-button"
                  onClick={saveRemark}
                  disabled={!currentOrderRemark.trim()}
                >
                  Save Remarks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default CourierHistory;