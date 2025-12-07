import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, UserX, RefreshCw } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/customer-table.css';

const CustomerTable = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const filterOptions = ['All', 'Active', 'Inactive', 'Pending', 'Suspended'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate total orders for each customer
      const customersWithOrders = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('customer_id', customer.id);

          const totalOrders = orders?.length || 0;

          return {
            ...customer,
            totalOrders,
            status: customer.status || 'Active'
          };
        })
      );

      setCustomers(customersWithOrders);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.full_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter = selectedFilter === 'All' ||
      customer.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleAction = async (action, customer) => {
    if (action === 'view') {
      navigate(`/admin/customer/profile/${customer.id}`);
    } else if (action === 'suspend') {
      await updateCustomerStatus(customer.id, 'Suspended');
    } else if (action === 'activate') {
      await updateCustomerStatus(customer.id, 'Active');
    }
    setActionMenuOpen(null);
  };

  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      setUpdating(customerId);
      const { error } = await supabase
        .from('customers')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(customer =>
        customer.id === customerId
          ? { ...customer, status: newStatus }
          : customer
      ));

      await logAdminActivity('customer_status_update', customerId, newStatus);
      alert(`Customer ${newStatus} successfully!`);

    } catch (error) {
      console.error('Error updating customer status:', error);
      alert(`Error updating customer status: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const logAdminActivity = async (action, targetId, details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('admin_activity_log')
        .insert([{
          admin_id: user?.id,
          action,
          target_user_id: targetId,
          target_user_type: 'customer',
          details: { status: details },
          user_agent: navigator.userAgent
        }]);

      if (error) console.error('Error logging activity:', error);
    } catch (error) {
      console.error('Error in logAdminActivity:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'inactive':
      case 'suspended':
        return 'status-inactive';
      default:
        return 'status-pending';
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'active': 'Active',
      'pending': 'Pending',
      'inactive': 'Inactive',
      'suspended': 'Suspended'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="customer-table-content">
        <div className="loading-container">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
          <p className="loading-text">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-table-content">
      {/* Header Section */}
      {/* <div className="customer-header-section">
        <h1 className="customer-main-title">Customers</h1>
        <p className="customer-subtitle">Manage and monitor customer accounts and activities</p>
      </div> */}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or phone"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="controls-container">
          <div className="filter-container">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="filter-button"
            >
              <span><strong> {selectedFilter}</strong></span>
              <Filter className="w-4 h-4" />
            </button>

            {filterOpen && (
              <div className="filter-dropdown">
                <div className="filter-dropdown-content">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedFilter(option);
                        setFilterOpen(false);
                      }}
                      className={`filter-option ${selectedFilter === option ? 'filter-option-selected' : 'filter-option-default'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={fetchCustomers}
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
            <div className="stat-label">Total Customers</div>
            <div className="stat-number-customer">{customers.length}</div>

          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Active Customers</div>
            <div className="stat-number-customer">
              {customers.filter(c => c.status === 'Active').length}
            </div>

          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Pending</div>
            <div className="stat-number-customer">
              {customers.filter(c => c.status === 'Pending').length}
            </div>

          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Suspended</div>
            <div className="stat-number-customer">
              {customers.filter(c => c.status === 'Suspended').length}
            </div>

          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <div className="table-summary">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>

        <div className="table-container">
          <div className="table-overflow">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Contact Information</th>
                  <th className="table-header-cell">Orders</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data-cell">
                      {customers.length === 0 ? 'No customers found' : 'No customers match your search'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.id} className="table-row">
                      <td className="table-cell-id">CUS{String(customer.id).padStart(3, '0')}</td>
                      <td className="table-cell-name">
                        <div className="name-container">
                          <span className="name-text">{customer.full_name}</span>
                          {customer.status === 'pending' && (
                            <span className="new-badge">NEW</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell-contact">
                        <div className="contact-infos">
                          <div className="contact-email">{customer.email}</div>
                          <div className="contact-phone">{customer.phone}</div>
                        </div>
                      </td>
                      <td className="table-cell-orders">
                        <span className="orders-count">{customer.totalOrders}</span>
                      </td>
                      <td className="table-cell-status">
                        <span className={`status-badge ${getStatusColor(customer.status)}`}>
                          {getStatusDisplay(customer.status)}
                          {updating === customer.id && <RefreshCw className="w-3 h-3 ml-1 animate-spin inline" />}
                        </span>
                      </td>
                      <td className="table-cell-actions">
                        <div className="actions-container">
                          <button
                            onClick={() => navigate(`/admin/customer/profile/${customer.id}`)}
                            className="view-action-btn"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>

                          {/* <div className="more-actions-container">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)}
                              className="more-actions-btn"
                              disabled={updating === customer.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {actionMenuOpen === index && (
                              <div className="action-menu-dropdown">
                                {customer.status === 'Active' ? (
                                  <button
                                    onClick={() => handleAction('suspend', customer)}
                                    className="action-menu-button action-menu-button-suspend"
                                    disabled={updating === customer.id}
                                  >
                                    <UserX className="w-4 h-4" />
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAction('activate', customer)}
                                    className="action-menu-button action-menu-button-activate"
                                    disabled={updating === customer.id}
                                  >
                                    <UserX className="w-4 h-4" />
                                    Activate
                                  </button>
                                )}
                              </div>
                            )}
                          </div> */}
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

export default CustomerTable;