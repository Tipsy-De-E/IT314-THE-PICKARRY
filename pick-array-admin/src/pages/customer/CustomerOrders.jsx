import React, { useState } from 'react';
import { Search, Filter, Heart, Trash2, MapPin, Package, CreditCard, Clock, ChevronDown, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearUserSession } from '../../utils/auth';
import '../../styles/customer-orders.css';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Orders');

  const filterOptions = ['All Orders', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

  const orders = [
    {
      id: 1,
      pickupLocation: 'Brewbox Jasaan Plaza',
      deliveryLocation: 'Bobuntugan Zone 4',
      item: 'Iced Coffee Macha 2 Cups',
      payment: '200.00 Cash on Delivery',
      date: 'Aug 10,2025 1:00 PM',
      status: 'Completed'
    },
    {
      id: 2,
      pickupLocation: 'Brewbox Jasaan Plaza',
      deliveryLocation: 'Bobuntugan Zone 4',
      item: 'Iced Coffee Macha 2 Cups',
      payment: '200.00 Cash on Delivery',
      date: 'Aug 10,2025 1:00 PM',
      status: 'In Progress'
    },
    {
      id: 3,
      pickupLocation: 'Brewbox Jasaan Plaza',
      deliveryLocation: 'Bobuntugan Zone 4',
      item: 'Iced Coffee Macha 2 Cups',
      payment: '200.00 Cash on Delivery',
      date: 'Aug 10,2025 1:00 PM',
      status: 'Pending'
    },
    {
      id: 4,
      pickupLocation: 'Brewbox Jasaan Plaza',
      deliveryLocation: 'Bobuntugan Zone 4',
      item: 'Iced Coffee Macha 2 Cups',
      payment: '200.00 Cash on Delivery',
      date: 'Aug 10,2025 1:00 PM',
      status: 'Cancelled'
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.pickupLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.deliveryLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.item.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = selectedFilter === 'All Orders' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };

  return (
    <div className="customer-home">
      {/* Header */}
      <div className="customer-header">
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
          <div className="customer-profile">
            <div className="profile-avatar">
              <span>C</span>
            </div>
            <span className="profile-name">Customer</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="customer-content">
        {/* Sidebar */}
        <div className="customer-sidebar">
          <div className="customer-profile-card">
            <div className="profile-avatar-large">
              <span>C</span>
            </div>
            <div className="profile-info">
              <h3>Customer</h3>
              <p>customer@gmail.com</p>
            </div>
          </div>

          <nav className="customer-nav">
            <button
              onClick={() => navigate('/customer/home')}
              className="nav-item"
            >
              <div className="nav-icon">🏠</div>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/customer/orders')}
              className="nav-item active"
            >
              <div className="nav-icon">🛒</div>
              <span>Order</span>
            </button>
            <button
              onClick={() => navigate('/customer/menu')}
              className="nav-item"
            >
              <div className="nav-icon">☰</div>
              <span>Menu</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="orders-main-content">
          {/* Search and Filter */}
          <div className="orders-search-filter">
            <div className="search-input-container">
              <Search className="search-icon w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-dropdown">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="filter-button"
              >
                <span>{selectedFilter}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterOpen && (
                <div className="filter-options">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedFilter(option);
                        setFilterOpen(false);
                      }}
                      className={`filter-option ${selectedFilter === option ? 'selected' : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-pickup">
                    <MapPin className="w-5 h-5" />
                    <span>{order.pickupLocation}</span>
                  </div>
                  <div className="order-actions">
                    <button className="action-button favorite">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="action-button delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-detail">
                    <MapPin className="detail-icon w-4 h-4" />
                    <span>{order.deliveryLocation}</span>
                  </div>
                  <div className="order-detail">
                    <Package className="detail-icon w-4 h-4" />
                    <span>{order.item}</span>
                  </div>
                  <div className="order-detail">
                    <CreditCard className="detail-icon w-4 h-4" />
                    <span>{order.payment}</span>
                  </div>
                  <div className="order-detail">
                    <Clock className="detail-icon w-4 h-4" />
                    <span>{order.date}</span>
                  </div>
                </div>

                <div className="order-footer">
                  <button className="order-view-button">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="customer-footer">
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

export default CustomerOrders;
