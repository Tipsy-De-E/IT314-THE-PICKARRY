import React, { useState, useEffect, useRef } from 'react';
import { Users, Truck, ShoppingCart, Filter, ChevronDown, Bell } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { notificationService } from '../../hooks/notificationService';
import '../../styles/dashboard.css';

const Home = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Current');
  const [statsData, setStatsData] = useState(null);
  const [orderStatsData, setOrderStatsData] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentCouriers, setRecentCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef(null);

  // Filter options
  const filterOptions = ['Current', 'Previous', 'Week', 'Month', 'Year'];

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch data when filter changes
  useEffect(() => {
    if (statsData) {
      (async () => {
        await calculateOrderStats();
      })();
    }
  }, [selectedFilter, statsData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data in parallel for better performance
      const [
        customersData,
        couriersData,
        ordersData,
        recentCustomersData,
        recentCouriersData
      ] = await Promise.all([
        fetchCustomers(),
        fetchCouriers(),
        fetchOrders(),
        fetchRecentCustomers(),
        fetchRecentCouriers()
      ]);

      // Calculate statistics
      const calculatedStats = calculateStats(customersData, couriersData, ordersData);
      setStatsData(calculatedStats);
      setRecentCustomers(recentCustomersData);
      setRecentCouriers(recentCouriersData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*');

    if (error) throw error;
    return data || [];
  };

  const fetchCouriers = async () => {
    const { data, error } = await supabase
      .from('couriers')
      .select('*');

    if (error) throw error;
    return data || [];
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) throw error;
    return data || [];
  };

  const fetchRecentCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data?.map(customer => ({
      id: customer.id,
      name: customer.full_name || 'Unknown Customer'
    })) || [];
  };

  const fetchRecentCouriers = async () => {
    const { data, error } = await supabase
      .from('couriers')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data?.map(courier => ({
      id: courier.id,
      name: courier.full_name || 'Unknown Courier'
    })) || [];
  };

  const calculateStats = (customers, couriers, orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Current month orders
    const currentMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    // Previous month orders
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear;
    });

    // Weekly orders (last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const weeklyOrders = orders.filter(order => new Date(order.created_at) >= weekAgo);

    // Monthly orders (last 30 days)
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);
    const monthlyOrders = orders.filter(order => new Date(order.created_at) >= monthAgo);

    // Yearly orders (current year)
    const yearlyOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getFullYear() === currentYear;
    });

    return {
      Current: [
        {
          label: 'Total Customers',
          value: customers.length.toLocaleString(),
          color: 'blue'
        },
        {
          label: 'Total Couriers',
          value: couriers.length.toLocaleString(),
          color: 'teal'
        },
        {
          label: 'Total Orders',
          value: currentMonthOrders.length.toLocaleString(),
          color: 'purple'
        }
      ],
      Previous: [
        {
          label: 'Total Customers',
          value: customers.length.toLocaleString(), // You might want to track historical customer count
          color: 'blue'
        },
        {
          label: 'Total Couriers',
          value: couriers.length.toLocaleString(), // You might want to track historical courier count
          color: 'teal'
        },
        {
          label: 'Total Orders',
          value: prevMonthOrders.length.toLocaleString(),
          color: 'purple'
        }
      ],
      Week: [
        {
          label: 'Total Customers',
          value: customers.length.toLocaleString(),
          color: 'blue'
        },
        {
          label: 'Total Couriers',
          value: couriers.length.toLocaleString(),
          color: 'teal'
        },
        {
          label: 'Total Orders',
          value: weeklyOrders.length.toLocaleString(),
          color: 'purple'
        }
      ],
      Month: [
        {
          label: 'Total Customers',
          value: customers.length.toLocaleString(),
          color: 'blue'
        },
        {
          label: 'Total Couriers',
          value: couriers.length.toLocaleString(),
          color: 'teal'
        },
        {
          label: 'Total Orders',
          value: monthlyOrders.length.toLocaleString(),
          color: 'purple'
        }
      ],
      Year: [
        {
          label: 'Total Customers',
          value: customers.length.toLocaleString(),
          color: 'blue'
        },
        {
          label: 'Total Couriers',
          value: couriers.length.toLocaleString(),
          color: 'teal'
        },
        {
          label: 'Total Orders',
          value: yearlyOrders.length.toLocaleString(),
          color: 'purple'
        }
      ]
    };
  };

  const calculateOrderStats = async () => {
    if (!statsData) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // You'll need to fetch orders based on the selected filter period
    // For now, I'll use a simplified calculation based on order statuses
    const { data: orders } = await supabase
      .from('orders')
      .select('status');

    if (!orders) return;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const totalOrders = orders.length;

    const orderStats = {
      Current: calculateOrderStatusStats(statusCounts, totalOrders),
      Previous: calculateOrderStatusStats(statusCounts, totalOrders), // You might want different logic for previous periods
      Week: calculateOrderStatusStats(statusCounts, totalOrders),
      Month: calculateOrderStatusStats(statusCounts, totalOrders),
      Year: calculateOrderStatusStats(statusCounts, totalOrders)
    };

    setOrderStatsData(orderStats);
  };

  const calculateOrderStatusStats = (statusCounts, totalOrders) => {
    // Map your order statuses to the display categories
    const statusMapping = {
      'delivered': 'Delivered',
      'cancelled': 'Canceled',
      'pending': 'Pending',
      'accepted': 'Ongoing',
      'picked_up': 'Ongoing',
      'on_the_way': 'Ongoing'
    };

    const aggregatedCounts = {};

    Object.entries(statusCounts).forEach(([status, count]) => {
      const displayStatus = statusMapping[status] || 'Other';
      aggregatedCounts[displayStatus] = (aggregatedCounts[displayStatus] || 0) + count;
    });

    return [
      {
        label: 'Delivered',
        value: aggregatedCounts['Delivered'] || 0,
        color: '#22c55e',
        percentage: totalOrders > 0 ? Math.round(((aggregatedCounts['Delivered'] || 0) / totalOrders) * 100) : 0
      },
      {
        label: 'Canceled',
        value: aggregatedCounts['Canceled'] || 0,
        color: '#ef4444',
        percentage: totalOrders > 0 ? Math.round(((aggregatedCounts['Canceled'] || 0) / totalOrders) * 100) : 0
      },
      {
        label: 'Pending',
        value: aggregatedCounts['Pending'] || 0,
        color: '#06b6d4',
        percentage: totalOrders > 0 ? Math.round(((aggregatedCounts['Pending'] || 0) / totalOrders) * 100) : 0
      },
      {
        label: 'Ongoing',
        value: aggregatedCounts['Ongoing'] || 0,
        color: '#eab308',
        percentage: totalOrders > 0 ? Math.round(((aggregatedCounts['Ongoing'] || 0) / totalOrders) * 100) : 0
      }
    ];
  };

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

  const stats = statsData ? statsData[selectedFilter] : [];
  const orderStats = orderStatsData ? orderStatsData[selectedFilter] : [];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <h3 className="stat-label-admin">{stat.label}</h3>
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
                  title={`${stat.label}: ${stat.value} orders (${stat.percentage}%)`}
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
              {recentCustomers.length > 0 ? (
                recentCustomers.map((customer) => (
                  <div key={customer.id} className="registered-item">
                    <span className="item-id">{customer.id}</span>
                    <span className="item-name">{customer.name}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No recent customers</div>
              )}
            </div>
          </div>

          {/* Couriers */}
          <div className="registered-category">
            <div className="category-header">
              <Truck className="category-icon" />
              <h3 className="category-title">Couriers</h3>
            </div>
            <div className="registered-list">
              {recentCouriers.length > 0 ? (
                recentCouriers.map((courier) => (
                  <div key={courier.id} className="registered-item">
                    <span className="item-id">{courier.id}</span>
                    <span className="item-name">{courier.name}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No recent couriers</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;