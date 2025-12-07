import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, RefreshCw, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/customer-table.css';

const OrdersTable = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef(null);

  const filterOptions = ['All', 'Pending', 'Accepted', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'];

  // Helper functions - defined at the top
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'picked_up': 'Picked Up',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-active';
      case 'picked_up':
      case 'on_the_way':
        return 'status-inprogress';
      case 'delivered':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  };

  const truncateLocation = (location) => {
    if (location && location.length > 20) {
      return location.substring(0, 20) + '...';
    }
    return location || 'Not specified';
  };

  // Close filter dropdown when clicking outside
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers:customer_id (
            id,
            customer_id,
            full_name,
            email,
            phone
          ),
          couriers:courier_id (
            id,
            full_name,
            vehicle_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = (data || []).map(order => ({
        id: order.id,
        orderNumber: `ORD${String(order.id).slice(-8).toUpperCase()}`,
        customerId: order.customers?.customer_id || `CUS${String(order.customers?.id).padStart(3, '0')}`,
        customerName: order.customers?.full_name || 'Unknown Customer',
        courierId: order.courier_id ? `COU${String(order.courier_id).padStart(3, '0')}` : 'Not assigned',
        courierName: order.couriers?.full_name || 'Not assigned',
        pickupLocation: order.pickup_location || 'Not specified',
        deliveryLocation: order.delivery_location || 'Not specified',
        serviceType: order.selected_service || 'Standard',
        totalAmount: order.total_amount || 0,
        status: order.status || 'pending',
        created_at: order.created_at,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customerId?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.courierId?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.pickupLocation?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.deliveryLocation?.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter = selectedFilter === 'All' ||
      getStatusDisplay(order.status) === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedFilter('All');
    setFilterOpen(false);
  };

  if (loading) {
    return (
      <div className="customer-table-content">
        <div className="loading-container">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
          <p className="loading-text">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-table-content">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer ID, courier ID, or location"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="controls-container">
          <div className="relative" ref={filterRef}>
            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 min-w-[140px] justify-between
                ${selectedFilter !== 'All'
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium">{selectedFilter}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 min-w-[240px] animate-in fade-in-0 zoom-in-95">
                <div className="p-3">
                  {/* Filter Header */}
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-600">
                    <span className="text-sm font-semibold text-white">Filter by Status</span>
                    {selectedFilter !== 'All' && (
                      <button
                        onClick={clearFilter}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Filter Options */}
                  <div className="flex flex-col gap-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleFilterSelect(option)}
                        className={`
                          flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${selectedFilter === option
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }
                        `}
                      >
                        <span>{option}</span>
                        {selectedFilter === option && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Filter Stats */}
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <span className="text-xs text-gray-400">
                      Showing {filteredOrders.length} of {orders.length} orders
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={fetchOrders}
            className="refresh-button"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="stats-cards-container">
        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-number-customer">{orders.length}</div>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-number-customer">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-number-customer">
              {orders.filter(o => ['accepted', 'picked_up', 'on_the_way'].includes(o.status)).length}
            </div>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Delivered</div>
            <div className="stat-number-customer">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Cancelled</div>
            <div className="stat-number-customer">
              {orders.filter(o => o.status === 'cancelled').length}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <div className="table-summary">
            Showing {filteredOrders.length} of {orders.length} orders
            {selectedFilter !== 'All' && (
              <span className="inline-flex items-center gap-2 ml-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-medium">
                • Filtered by: {selectedFilter}
                <button
                  onClick={clearFilter}
                  className="hover:bg-blue-700 rounded transition-colors w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="table-container">
          <div className="table-overflow">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header-cell">Order ID</th>
                  <th className="table-header-cell">Customer ID</th>
                  <th className="table-header-cell">Courier ID</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Service Type</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-cell">
                      {orders.length === 0 ? 'No orders found' : 'No orders match your search and filter criteria'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="table-row">
                      <td className="table-cell-id">
                        {order.orderNumber}
                      </td>
                      <td className="table-cell-name">
                        <div className="name-container">
                          <span className="name-text">{order.customerId}</span>
                        </div>
                        <div className="contact-infos">
                          <div className="contact-email">{order.customerName}</div>
                        </div>
                      </td>
                      <td className="table-cell-name">
                        <div className="name-container">
                          <span className="name-text">{order.courierId}</span>
                        </div>
                        <div className="contact-infos">
                          <div className="contact-email">{order.courierName}</div>
                        </div>
                      </td>
                      <td className="table-cell-location">
                        <div className="location-flow">
                          <div className="location-from">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            <span>{truncateLocation(order.pickupLocation)}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                          <div className="location-to">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            <span>{truncateLocation(order.deliveryLocation)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell-service">
                        <span className="service-type">{order.serviceType}</span>
                      </td>
                      <td className="table-cell-amount">
                        <div className="amount-display">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="table-cell-status">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusDisplay(order.status)}
                        </span>
                      </td>
                      <td className="table-cell-actions">
                        <div className="actions-container">
                          <button
                            onClick={() => navigate(`/admin/order/details/${order.id}`)}
                            className="view-action-btn"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;