import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, UserX, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/courier-table.css';

const CourierTable = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionNotes, setSuspensionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const filterOptions = ['All', 'Active', 'Pending', 'Suspended', 'Approved', 'Rejected'];

  const suspensionReasons = [
    'Fraudulent Activity',
    'Non-payment',
    'Abusive behavior',
    'Excessive cancellations',
    'Violation of policies',
    'Fake/invalid information',
    'Misuse of refunds/complaints'
  ];

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('couriers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const couriersWithDeliveries = await Promise.all(
        (data || []).map(async (courier) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('id, status')
            .eq('courier_id', courier.id);

          const totalDeliveries = orders?.filter(order =>
            order.status === 'delivered' || order.status === 'completed'
          ).length || 0;

          return {
            ...courier,
            totalDeliveries,
            status: courier.application_status || 'pending'
          };
        })
      );

      setCouriers(couriersWithDeliveries);
    } catch (error) {
      console.error('Error fetching couriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch =
      courier.full_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      courier.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      courier.phone?.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter = selectedFilter === 'All' ||
      courier.application_status?.toLowerCase() === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const handleApprove = async () => {
    if (!selectedCourier) return;

    try {
      setUpdating(selectedCourier.id);

      const { error } = await supabase
        .from('couriers')
        .update({
          application_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCourier.id);

      if (error) throw error;

      setCouriers(prev => prev.map(courier =>
        courier.id === selectedCourier.id
          ? { ...courier, application_status: 'approved', status: 'approved' }
          : courier
      ));

      alert('Courier approved successfully!');
      setShowApproveModal(false);
      setSelectedCourier(null);

    } catch (error) {
      console.error('Error approving courier:', error);
      alert(`Error approving courier: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async () => {
    if (!selectedCourier || !rejectionReason) return;

    try {
      setUpdating(selectedCourier.id);

      const { error } = await supabase
        .from('couriers')
        .update({
          application_status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
          rejected_by: (await supabase.auth.getUser()).data.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCourier.id);

      if (error) throw error;

      setCouriers(prev => prev.map(courier =>
        courier.id === selectedCourier.id
          ? { ...courier, application_status: 'rejected', status: 'rejected' }
          : courier
      ));

      alert('Courier rejected successfully!');
      setShowRejectModal(false);
      setSelectedCourier(null);
      setRejectionReason('');

    } catch (error) {
      console.error('Error rejecting courier:', error);
      alert(`Error rejecting courier: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleSuspend = async () => {
    if (!selectedCourier || !suspensionReason) return;

    try {
      setUpdating(selectedCourier.id);

      const { error } = await supabase
        .from('couriers')
        .update({
          application_status: 'suspended',
          suspension_reason: suspensionReason,
          suspension_notes: suspensionNotes,
          suspended_at: new Date().toISOString(),
          suspended_by: (await supabase.auth.getUser()).data.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCourier.id);

      if (error) throw error;

      setCouriers(prev => prev.map(courier =>
        courier.id === selectedCourier.id
          ? { ...courier, application_status: 'suspended', status: 'suspended' }
          : courier
      ));

      alert('Courier suspended successfully!');
      setShowSuspendModal(false);
      setSelectedCourier(null);
      setSuspensionReason('');
      setSuspensionNotes('');

    } catch (error) {
      console.error('Error suspending courier:', error);
      alert(`Error suspending courier: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const openApproveModal = (courier) => {
    setSelectedCourier(courier);
    setShowApproveModal(true);
  };

  const openRejectModal = (courier) => {
    setSelectedCourier(courier);
    setShowRejectModal(true);
  };

  const openSuspendModal = (courier) => {
    setSelectedCourier(courier);
    setShowSuspendModal(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'suspended':
      case 'rejected':
        return 'status-inactive';
      default:
        return 'status-pending';
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'active': 'Active',
      'pending': 'Pending',
      'suspended': 'Suspended',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="courier-table-content">
        <div className="loading-container">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
          <p className="loading-text">Loading couriers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courier-table-content">
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
              <span><strong>{selectedFilter}</strong></span>
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
            onClick={fetchCouriers}
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
            <div className="stat-label">Total Couriers</div>
            <div className="stat-number-courier">{couriers.length}</div>
          </div>
        </div>
        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Active Couriers</div>
            <div className="stat-number-courier">
              {couriers.filter(c => c.application_status === 'active' || c.application_status === 'approved').length}
            </div>
          </div>
        </div>
        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Pending Review</div>
            <div className="stat-number-courier">
              {couriers.filter(c => c.application_status === 'pending').length}
            </div>
          </div>
        </div>
        <div className="stat-cards">
          <div className="stat-content">
            <div className="stat-label">Suspended</div>
            <div className="stat-number-courier">
              {couriers.filter(c => c.application_status === 'suspended').length}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <div className="table-summary">
            Showing {filteredCouriers.length} of {couriers.length} couriers
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
                  <th className="table-header-cell">Vehicle Type</th>
                  <th className="table-header-cell">Deliveries</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCouriers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data-cell">
                      {couriers.length === 0 ? 'No courier applications found' : 'No couriers match your search'}
                    </td>
                  </tr>
                ) : (
                  filteredCouriers.map((courier, index) => (
                    <tr key={courier.id} className="table-row">
                      <td className="table-cell-id">COU{String(courier.id).padStart(3, '0')}</td>
                      <td className="table-cell-name">
                        <div className="name-container">
                          <span className="name-text">{courier.full_name}</span>
                          {courier.application_status === 'pending' && (
                            <span className="new-badge">NEW</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell-contact">
                        <div className="contact-infos">
                          <div className="contact-email">{courier.email}</div>
                          <div className="contact-phone">{courier.phone}</div>
                        </div>
                      </td>
                      <td className="table-cell-vehicle">
                        {courier.vehicle_type || 'Not specified'}
                      </td>
                      <td className="table-cell-deliveries">
                        <span className="deliveries-count">{courier.totalDeliveries}</span>
                      </td>
                      <td className="table-cell-status">
                        <span className={`status-badge ${getStatusColor(courier.application_status)}`}>
                          {getStatusDisplay(courier.application_status)}
                          {updating === courier.id && <RefreshCw className="w-3 h-3 ml-1 animate-spin inline" />}
                        </span>
                      </td>
                      <td className="table-cell-actions">
                        <div className="actions-container">
                          <button
                            onClick={() => navigate(`/admin/courier/profile/${courier.id}`)}
                            className="view-action-btn"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>

                          {/* Show Approve/Reject buttons for pending applications */}
                          {/* {courier.application_status === 'pending' && (
                            <>
                              <button
                                onClick={() => openApproveModal(courier)}
                                className="approve-action-btn"
                                disabled={updating === courier.id}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(courier)}
                                className="reject-action-btn"
                                disabled={updating === courier.id}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )} */}

                          {/* Show suspend button for active/approved couriers */}
                          {/* {(courier.application_status === 'active' || courier.application_status === 'approved') && (
                            <button
                              onClick={() => openSuspendModal(courier)}
                              className="suspend-action-btn"
                              disabled={updating === courier.id}
                            >
                              <UserX className="w-4 h-4" />
                              Suspend
                            </button>
                          )} */}
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

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Approve Courier</h3>
            <p className="modal-text">
              Are you sure you want to approve {selectedCourier?.full_name} as a courier?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowApproveModal(false)}
                className="modal-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="modal-button confirm"
                disabled={updating === selectedCourier?.id}
              >
                {updating === selectedCourier?.id ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Reject Courier Application</h3>
            <p className="modal-text">
              Are you sure you want to reject {selectedCourier?.full_name}'s application?
            </p>
            <div className="form-group">
              <label className="form-label">Reason for rejection:</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="form-textarea"
                placeholder="Please provide a reason for rejection..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="modal-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="modal-button reject"
                disabled={!rejectionReason.trim() || updating === selectedCourier?.id}
              >
                {updating === selectedCourier?.id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Suspend Courier</h3>
            <p className="modal-text">
              Are you sure you want to suspend {selectedCourier?.full_name}'s account?
              The user will not be able to log in or use the services until reactivated.
            </p>
            <div className="form-group">
              <label className="form-label">Please provide a reason for suspension:</label>
              <select
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="form-select"
              >
                <option value="">Select a reason</option>
                {suspensionReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Additional notes (optional):</label>
              <textarea
                value={suspensionNotes}
                onChange={(e) => setSuspensionNotes(e.target.value)}
                className="form-textarea"
                placeholder="Add any additional details..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspensionReason('');
                  setSuspensionNotes('');
                }}
                className="modal-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="modal-button suspend"
                disabled={!suspensionReason || updating === selectedCourier?.id}
              >
                {updating === selectedCourier?.id ? 'Suspending...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierTable;