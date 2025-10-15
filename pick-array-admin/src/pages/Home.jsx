import React, { useState, useEffect, useRef } from 'react';
import { Users, Truck, ShoppingCart, Filter, ChevronDown } from 'lucide-react';
import '../styles/dashboard.css';

const Home = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Current');
  const filterRef = useRef(null);

  // Filter options
  const filterOptions = ['Current', 'Previous', 'Week', 'Month', 'Year'];

  // Statistics data for different periods
  const statsData = {
    Current: [
      { label: 'Total Customers', value: '1,200', color: 'blue' },
      { label: 'Total Couriers', value: '1,200', color: 'teal' },
      { label: 'Total Orders', value: '1,200', color: 'purple' }
    ],
    Previous: [
      { label: 'Total Customers', value: '1,150', color: 'blue' },
      { label: 'Total Couriers', value: '1,180', color: 'teal' },
      { label: 'Total Orders', value: '1,180', color: 'purple' }
    ],
    Week: [
      { label: 'Total Customers', value: '85', color: 'blue' },
      { label: 'Total Couriers', value: '92', color: 'teal' },
      { label: 'Total Orders', value: '156', color: 'purple' }
    ],
    Month: [
      { label: 'Total Customers', value: '320', color: 'blue' },
      { label: 'Total Couriers', value: '285', color: 'teal' },
      { label: 'Total Orders', value: '450', color: 'purple' }
    ],
    Year: [
      { label: 'Total Customers', value: '3,800', color: 'blue' },
      { label: 'Total Couriers', value: '2,950', color: 'teal' },
      { label: 'Total Orders', value: '5,200', color: 'purple' }
    ]
  };

  // Order statistics data for different periods
  const orderStatsData = {
    Current: [
      { label: 'Delivered', value: 480, color: '#22c55e', percentage: 65 },
      { label: 'Canceled', value: 120, color: '#ef4444', percentage: 35 },
      { label: 'Pending', value: 37, color: '#06b6d4', percentage: 20 },
      { label: 'Ongoing', value: 23, color: '#eab308', percentage: 15 }
    ],
    Previous: [
      { label: 'Delivered', value: 450, color: '#22c55e', percentage: 62 },
      { label: 'Canceled', value: 110, color: '#ef4444', percentage: 32 },
      { label: 'Pending', value: 42, color: '#06b6d4', percentage: 25 },
      { label: 'Ongoing', value: 28, color: '#eab308', percentage: 18 }
    ],
    Week: [
      { label: 'Delivered', value: 120, color: '#22c55e', percentage: 77 },
      { label: 'Canceled', value: 15, color: '#ef4444', percentage: 10 },
      { label: 'Pending', value: 12, color: '#06b6d4', percentage: 8 },
      { label: 'Ongoing', value: 9, color: '#eab308', percentage: 6 }
    ],
    Month: [
      { label: 'Delivered', value: 380, color: '#22c55e', percentage: 84 },
      { label: 'Canceled', value: 35, color: '#ef4444', percentage: 8 },
      { label: 'Pending', value: 25, color: '#06b6d4', percentage: 6 },
      { label: 'Ongoing', value: 10, color: '#eab308', percentage: 2 }
    ],
    Year: [
      { label: 'Delivered', value: 4200, color: '#22c55e', percentage: 81 },
      { label: 'Canceled', value: 580, color: '#ef4444', percentage: 11 },
      { label: 'Pending', value: 320, color: '#06b6d4', percentage: 6 },
      { label: 'Ongoing', value: 100, color: '#eab308', percentage: 2 }
    ]
  };

  const stats = statsData[selectedFilter];
  const orderStats = orderStatsData[selectedFilter];

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Recently registered data
  const recentCustomers = [
    { id: '01', name: 'Scottie mafren' },
    { id: '02', name: 'Kuya Sam' }
  ];

  const recentCouriers = [
    { id: '05', name: 'Domskie Hansam' },
    { id: '06', name: 'Luke Chie' }
  ];

  return (
    <div className="dashboard-container">
      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <h3 className="stat-label">{stat.label}</h3>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Order Statistics Section */}
      <div className="order-statistics-section">
        <div className="section-header">
          <h2 className="section-title">Order Statistics</h2>
          <div ref={filterRef} className={`filter-container ${filterOpen ? 'open' : ''}`}>
            <button
              className="filter-button"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <span>{selectedFilter}</span>
              <ChevronDown className="filter-icon" />
            </button>
            {filterOpen && (
              <div className="filter-dropdown">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    className={`filter-option ${selectedFilter === option ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFilter(option);
                      setFilterOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="statistics-content">
          {/* Chart Area */}
          <div className="chart-container">
            <div className="chart-area">
              {orderStats.map((stat, index) => (
                <div
                  key={index}
                  className="chart-bar"
                  style={{
                    height: `${stat.percentage * 3}px`,
                    backgroundColor: stat.color
                  }}
                />
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="order-stats-cards">
            {orderStats.map((stat, index) => (
              <div key={index} className="order-stat-card">
                <div className="stat-indicator">
                  <div
                    className="stat-dot"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="stat-number">{stat.value}</span>
                </div>
                <span className="stat-status">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Registered Section */}
      <div className="recently-registered-section">
        <h2 className="section-title">Recently Registered</h2>

        <div className="registered-grid">
          {/* Customers */}
          <div className="registered-category">
            <div className="category-header">
              <Users className="category-icon" />
              <h3 className="category-title">Customers</h3>
            </div>
            <div className="registered-list">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="registered-item">
                  <span className="item-id">{customer.id}</span>
                  <span className="item-name">{customer.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Couriers */}
          <div className="registered-category">
            <div className="category-header">
              <Truck className="category-icon" />
              <h3 className="category-title">Couriers</h3>
            </div>
            <div className="registered-list">
              {recentCouriers.map((courier) => (
                <div key={courier.id} className="registered-item">
                  <span className="item-id">{courier.id}</span>
                  <span className="item-name">{courier.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;