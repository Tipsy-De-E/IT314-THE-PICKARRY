import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, MoreVertical, UserX, CheckCircle, Package, ShoppingBag, X, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/customer-profile.css';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionNotes, setSuspensionNotes] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState(1);
  const [isPermanentSuspension, setIsPermanentSuspension] = useState(false);

  const suspensionReasons = [
    { reason: 'Fraudulent Activity', severity: 'high', defaultDuration: 30 },
    { reason: 'Non-payment', severity: 'medium', defaultDuration: 7 },
    { reason: 'Abusive behavior', severity: 'high', defaultDuration: 14 },
    { reason: 'Excessive cancellations', severity: 'medium', defaultDuration: 3 },
    { reason: 'Violation of policies', severity: 'medium', defaultDuration: 7 },
    { reason: 'Fake/invalid information', severity: 'high', defaultDuration: 30 },
    { reason: 'Misuse of refunds/complaints', severity: 'high', defaultDuration: 14 },
    { reason: 'Chargeback abuse', severity: 'high', defaultDuration: 30 },
    { reason: 'Multiple account creation', severity: 'high', defaultDuration: 30 },
    { reason: 'Harassment of staff/couriers', severity: 'high', defaultDuration: 30 },
    { reason: 'Payment fraud', severity: 'high', defaultDuration: 30 },
    { reason: 'Service abuse', severity: 'medium', defaultDuration: 7 }
  ];

  const durationOptions = [
    { label: '1 day', value: 1 },
    { label: '3 days', value: 3 },
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
    { label: 'Permanent', value: 0, permanent: true }
  ];

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  // Fixed suspension check function
  const checkActiveSuspension = async (customerId) => {
    try {
      const { data, error } = await supabase
        .from('customer_suspensions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active');

      if (error) {
        console.error('Error checking suspension:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error checking suspension:', error);
      return null;
    }
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Fetch customer basic info
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (customer) {
        // Fetch active suspension if exists - using the fixed function
        const activeSuspension = await checkActiveSuspension(customer.id);

        // Fetch orders for this customer
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (ordersError) console.error('Error fetching orders:', ordersError);

        // Calculate order summary
        const ordersList = orders || [];
        const orderSummary = {
          total: ordersList.length,
          completed: ordersList.filter(order => order.status === 'delivered' || order.status === 'completed').length,
          canceled: ordersList.filter(order => order.status === 'canceled').length,
          pending: ordersList.filter(order => order.status === 'pending' || order.status === 'accepted').length
        };

        // Format recent orders
        const recentOrders = ordersList.map(order => ({
          orderId: order.order_id || `ORD-${order.id}`,
          courier: order.courier_name || 'Courier',
          amount: `₱${order.total_amount || order.amount || '0'}`,
          date: new Date(order.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'
        }));

        setCustomerData({
          ...customer,
          orderSummary,
          recentOrders,
          activeSuspension
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to log status changes
  const logStatusChange = async (oldStatus, newStatus, reason = '', notes = '') => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.warn('No active session found for logging status change');
        return;
      }

      const actionBy = session.user.id;

      const { error } = await supabase
        .from('customer_status_history')
        .insert({
          customer_id: id,
          old_status: oldStatus,
          new_status: newStatus,
          reason: reason,
          notes: notes,
          action_by: actionBy
        });

      if (error) {
        console.error('Error logging status change:', error);
        // If table doesn't exist, just log warning
        if (error.message.includes('does not exist')) {
          console.warn('customer_status_history table does not exist yet.');
        }
      }
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  };

  // Fixed suspension logging function
  const logSuspension = async (reason, notes = '', durationDays = null, isPermanent = false) => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.warn('No active session found for logging suspension');
        return null;
      }

      const suspendedBy = session.user.id;

      let scheduledLiftDate = null;
      if (!isPermanent && durationDays > 0) {
        const liftDate = new Date();
        liftDate.setDate(liftDate.getDate() + durationDays);
        scheduledLiftDate = liftDate.toISOString();
      }

      const suspensionData = {
        customer_id: parseInt(id),
        reason: reason,
        duration: durationDays?.toString() || '0',
        duration_days: durationDays,
        scheduled_lift_date: scheduledLiftDate,
        is_permanent: isPermanent,
        suspended_by: suspendedBy,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('customer_suspensions')
        .insert([suspensionData])
        .select();

      if (error) {
        console.error('Error logging suspension:', error);
        // Try without the select() if it fails
        const { error: insertError } = await supabase
          .from('customer_suspensions')
          .insert([suspensionData]);

        if (insertError) {
          console.error('Error inserting suspension (fallback):', insertError);
          throw insertError;
        }
        return [suspensionData]; // Return the data we tried to insert
      }

      return data;
    } catch (error) {
      console.error('Error logging suspension:', error);
      throw error;
    }
  };

  const handleSuspend = async () => {
    if (!suspensionReason) return;

    try {
      setUpdating(true);

      // Update customer status
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Get selected reason details
      const selectedReason = suspensionReasons.find(r => r.reason === suspensionReason);
      const durationDays = isPermanentSuspension ? 0 : suspensionDuration;

      // Log both status change and suspension details
      await Promise.all([
        logStatusChange(customerData.status, 'suspended', suspensionReason, suspensionNotes),
        logSuspension(suspensionReason, suspensionNotes, durationDays, isPermanentSuspension)
      ]);

      // Refresh customer data
      await fetchCustomerData();

      alert('Customer suspended successfully!');
      setShowSuspendModal(false);
      setSuspensionReason('');
      setSuspensionNotes('');
      setSuspensionDuration(1);
      setIsPermanentSuspension(false);
      setActionMenuOpen(false);

    } catch (error) {
      console.error('Error suspending customer:', error);
      alert(`Error suspending customer: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleActivate = async () => {
    try {
      setUpdating(true);

      // Update customer status
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Log status change
      await logStatusChange(customerData.status, 'active', 'Account reactivated');

      // Update suspension record if exists
      try {
        const activeSuspension = await checkActiveSuspension(id);
        if (activeSuspension) {
          await supabase
            .from('customer_suspensions')
            .update({
              status: 'lifted',
              lifted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', activeSuspension.id);
        }
      } catch (suspensionError) {
        console.warn('Could not update suspension record:', suspensionError);
      }

      // Refresh customer data
      await fetchCustomerData();

      alert('Customer activated successfully!');
      setActionMenuOpen(false);

    } catch (error) {
      console.error('Error activating customer:', error);
      alert(`Error activating customer: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle reason selection to set default duration
  const handleReasonChange = (reason) => {
    setSuspensionReason(reason);
    const selected = suspensionReasons.find(r => r.reason === reason);
    if (selected && !isPermanentSuspension) {
      setSuspensionDuration(selected.defaultDuration);
    }
  };

  // Handle permanent suspension toggle
  const handlePermanentToggle = (permanent) => {
    setIsPermanentSuspension(permanent);
    if (permanent) {
      setSuspensionDuration(0);
    } else {
      const selected = suspensionReasons.find(r => r.reason === suspensionReason);
      setSuspensionDuration(selected?.defaultDuration || 1);
    }
  };

  // Calculate lift date for display
  const calculateLiftDate = () => {
    if (isPermanentSuspension) return 'Permanent (No automatic lift)';

    const liftDate = new Date();
    liftDate.setDate(liftDate.getDate() + suspensionDuration);
    return liftDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'delivered':
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
      case 'inactive':
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'delivered':
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'suspended':
      case 'inactive':
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getActionMenuOptions = () => {
    const status = customerData?.status?.toLowerCase();
    const options = [];

    if (status === 'active') {
      options.push({
        action: 'suspend',
        label: 'Suspend Customer',
        icon: UserX,
        className: 'text-red-400 hover:bg-red-500 hover:text-white',
        onClick: () => setShowSuspendModal(true)
      });
    } else if (status === 'suspended' || status === 'inactive') {
      options.push({
        action: 'activate',
        label: 'Activate Customer',
        icon: CheckCircle,
        className: 'text-green-400 hover:bg-green-500 hover:text-white',
        onClick: handleActivate
      });
    }

    return options;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-teal-400">Loading customer profile...</div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-400">Customer not found</div>
      </div>
    );
  }

  const actionOptions = getActionMenuOptions();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/customer')}
            className="text-teal-400 hover:text-teal-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(customerData.status)}`}></div>
            <span className="text-white font-medium capitalize">
              {customerData.status || 'Pending'}
            </span>
          </div>

          {actionOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setActionMenuOpen(!actionMenuOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors relative"
                disabled={updating}
              >
                <MoreVertical className="w-5 h-5" />
                {updating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              {actionMenuOpen && (
                <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                  <div className="p-2">
                    {actionOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          option.onClick();
                          setActionMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors ${option.className} ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={updating}
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{customerData.full_name}</h2>
          <div className="flex items-center gap-4 text-gray-400">
            <span>CUS{String(customerData.id).padStart(3, '0')}</span>
            <span>Member since {new Date(customerData.created_at).toLocaleDateString()}</span>
          </div>

          {/* Active Suspension Info */}
          {customerData.activeSuspension && (
            <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h4 className="text-red-300 font-semibold">Account Suspended</h4>
              </div>
              <div className="text-red-200 text-sm space-y-1">
                <p><strong>Reason:</strong> {customerData.activeSuspension.reason}</p>
                <p><strong>Duration:</strong> {customerData.activeSuspension.is_permanent ? 'Permanent' : `${customerData.activeSuspension.duration_days} days`}</p>
                {customerData.activeSuspension.scheduled_lift_date && (
                  <p><strong>Scheduled Lift:</strong> {new Date(customerData.activeSuspension.scheduled_lift_date).toLocaleDateString()}</p>
                )}
                {customerData.activeSuspension.notes && (
                  <p><strong>Notes:</strong> {customerData.activeSuspension.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-400" />
                  <span className="text-white">{customerData.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-teal-400" />
                  <span className="text-white">{customerData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-teal-400" />
                  <span className="text-white">{customerData.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Details</h3>
              <div className="space-y-3">
                {customerData.date_of_birth && (
                  <div>
                    <label className="text-gray-400 text-sm">Date of Birth:</label>
                    <p className="text-white">{new Date(customerData.date_of_birth).toLocaleDateString()}</p>
                  </div>
                )}
                {customerData.gender && (
                  <div>
                    <label className="text-gray-400 text-sm">Gender:</label>
                    <p className="text-white capitalize">{customerData.gender}</p>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 text-sm">Account Created:</label>
                  <p className="text-white">{new Date(customerData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Order Summary</h3>
            <ShoppingBag className="w-6 h-6 text-teal-400" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{customerData.orderSummary.total}</p>
              <p className="text-gray-400 text-sm">Total Orders</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{customerData.orderSummary.completed}</p>
              <p className="text-gray-400 text-sm">Completed</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{customerData.orderSummary.canceled}</p>
              <p className="text-gray-400 text-sm">Cancelled</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{customerData.orderSummary.pending}</p>
              <p className="text-gray-400 text-sm">Pending</p>
            </div>
          </div>

          {/* Recent Orders */}
          {customerData.recentOrders.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Recent Orders</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 text-gray-300 font-medium">OrderID</th>
                      <th className="text-left py-3 text-gray-300 font-medium">Courier</th>
                      <th className="text-left py-3 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-3 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.recentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-700 last:border-b-0">
                        <td className="py-3 text-white">{order.orderId}</td>
                        <td className="py-3 text-white">{order.courier}</td>
                        <td className="py-3 text-white">{order.amount}</td>
                        <td className="py-3 text-white">{order.date}</td>
                        <td className="py-3">
                          <span className={`font-medium ${getStatusTextColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Suspend Customer</h3>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspensionReason('');
                  setSuspensionNotes('');
                  setSuspensionDuration(1);
                  setIsPermanentSuspension(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={updating}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to suspend {customerData.full_name}'s account?
              The customer will not be able to log in or use the services until reactivated.
            </p>

            <div className="space-y-6 mb-6">
              {/* Suspension Reason */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Please provide a reason for suspension *
                </label>
                <select
                  value={suspensionReason}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select a reason</option>
                  {suspensionReasons.map(reason => (
                    <option key={reason.reason} value={reason.reason}>
                      {reason.reason} ({reason.severity} severity)
                    </option>
                  ))}
                </select>
              </div>

              {/* Suspension Type */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Suspension Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="suspensionType"
                      checked={!isPermanentSuspension}
                      onChange={() => handlePermanentToggle(false)}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-white">Temporary Suspension</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="suspensionType"
                      checked={isPermanentSuspension}
                      onChange={() => handlePermanentToggle(true)}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-white">Permanent Suspension</span>
                  </label>
                </div>
              </div>

              {/* Duration Selection (only for temporary) */}
              {!isPermanentSuspension && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Suspension Duration *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {durationOptions.filter(opt => !opt.permanent).map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSuspensionDuration(option.value)}
                        className={`p-3 rounded-lg border transition-colors ${suspensionDuration === option.value
                          ? 'bg-teal-600 border-teal-500 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lift Date Display */}
              {!isPermanentSuspension && suspensionDuration > 0 && (
                <div className="p-3 bg-blue-900 border border-blue-700 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Scheduled Lift Date:</span>
                    <span>{calculateLiftDate()}</span>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  value={suspensionNotes}
                  onChange={(e) => setSuspensionNotes(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add any additional details, specific incidents, or context..."
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspensionReason('');
                  setSuspensionNotes('');
                  setSuspensionDuration(1);
                  setIsPermanentSuspension(false);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={!suspensionReason || updating}
              >
                {updating ? 'Suspending...' : `Suspend ${isPermanentSuspension ? 'Permanently' : `for ${suspensionDuration} day${suspensionDuration > 1 ? 's' : ''}`}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;