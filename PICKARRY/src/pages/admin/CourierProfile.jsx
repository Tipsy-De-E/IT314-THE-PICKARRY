import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, CreditCard, Car, Palette,
  MoreVertical, UserX, CheckCircle, Clock, Package, AlertCircle,
  XCircle, X, Download, ZoomIn, ZoomOut, RotateCcw, Calendar, UserCheck
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const CourierProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [courierData, setCourierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionNotes, setSuspensionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState(1);
  const [isPermanentSuspension, setIsPermanentSuspension] = useState(false);

  // License image viewer states
  const [licenseImageLoading, setLicenseImageLoading] = useState(false);
  const [licenseImageError, setLicenseImageError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Vehicle registration image viewer states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationImageLoading, setRegistrationImageLoading] = useState(false);
  const [registrationImageError, setRegistrationImageError] = useState('');
  const [registrationZoomLevel, setRegistrationZoomLevel] = useState(1);
  const [registrationRotation, setRegistrationRotation] = useState(0);

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
    fetchCourierData();
  }, [id]);

  // Fixed suspension check function for couriers
  const checkActiveCourierSuspension = async (courierId) => {
    try {
      const numericCourierId = parseInt(courierId);

      const { data, error } = await supabase
        .from('courier_suspensions')
        .select('*')
        .eq('courier_id', numericCourierId)
        .eq('status', 'active');

      if (error) {
        console.error('Error checking courier suspension:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error checking courier suspension:', error);
      return null;
    }
  };

  // Helper function to log status changes
  const logStatusChange = async (oldStatus, newStatus, reason = '', notes = '', table = 'courier') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.warn('No active session found for logging status change');
        return;
      }

      const actionBy = session.user.id;
      const tableName = table === 'customer' ? 'customer_status_history' : 'courier_status_history';
      const idField = table === 'customer' ? 'customer_id' : 'courier_id';

      try {
        const { error } = await supabase
          .from(tableName)
          .insert({
            [idField]: parseInt(id),
            old_status: oldStatus,
            new_status: newStatus,
            reason: reason,
            notes: notes,
            action_by: actionBy,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Error logging ${table} status change:`, error);
        }
      } catch (error) {
        console.warn(`Could not log ${table} status change:`, error);
      }
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  };

  // Helper function for suspensions
  const logSuspension = async (reason, notes = '', durationDays = null, isPermanent = false, userType = 'courier') => {
    try {
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
        suspension_reason: reason,
        suspension_notes: notes,
        suspended_by: suspendedBy,
        duration_days: durationDays,
        scheduled_lift_date: scheduledLiftDate,
        is_permanent: isPermanent,
        status: 'active',
        user_type: userType,
        created_at: new Date().toISOString()
      };

      // Add the appropriate ID field based on user type
      if (userType === 'courier') {
        suspensionData.courier_id = parseInt(id);
      } else {
        suspensionData.customer_id = parseInt(id);
      }

      console.log(`Attempting to insert ${userType} suspension data:`, suspensionData);

      const tableName = userType === 'courier' ? 'courier_suspensions' : 'customer_suspensions';
      const { error } = await supabase
        .from(tableName)
        .insert(suspensionData);

      if (error) {
        console.error(`Error inserting ${userType} suspension:`, error);
        throw error;
      }

      console.log(`${userType} suspension logged successfully`);
      return suspensionData;
    } catch (error) {
      console.error(`Error logging ${userType} suspension:`, error);
      throw error;
    }
  };

  // Find associated customer account for this courier
  const findAssociatedCustomer = async () => {
    try {
      // First get the courier's email
      const { data: courier } = await supabase
        .from('couriers')
        .select('email')
        .eq('id', parseInt(id))
        .single();

      if (!courier?.email) return null;

      // Find customer with same email
      const { data: customer } = await supabase
        .from('customers')
        .select('id, status')
        .eq('email', courier.email)
        .single();

      return customer;
    } catch (error) {
      console.error('Error finding associated customer:', error);
      return null;
    }
  };

  // Function to update both courier and customer status
  const updateUserStatus = async (statusType, newStatus) => {
    try {
      console.log(`Updating ${statusType} status to: ${newStatus} for user ${id}`);

      const updateData = {
        updated_at: new Date().toISOString()
      };

      // For couriers, update both application_status and status fields
      if (statusType === 'courier') {
        updateData.application_status = newStatus;
        updateData.status = newStatus;

        const { error } = await supabase
          .from('couriers')
          .update(updateData)
          .eq('id', parseInt(id));

        if (error) throw error;

        // Also update the associated customer if exists
        const customer = await findAssociatedCustomer();
        if (customer) {
          console.log(`Found associated customer ${customer.id}, updating to ${newStatus}`);

          const { error: customerError } = await supabase
            .from('customers')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', customer.id);

          if (customerError) {
            console.error('Error updating customer status:', customerError);
          } else {
            console.log('Customer status updated successfully');
          }
        }
      }

      console.log(`${statusType} status updated successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${statusType} status:`, error);
      return { success: false, error };
    }
  };

  const fetchCourierData = async () => {
    try {
      setLoading(true);

      const { data: courier, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error) throw error;

      if (courier) {
        const activeSuspension = await checkActiveCourierSuspension(courier.id);

        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('courier_id', courier.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (ordersError) console.error('Error fetching orders:', ordersError);

        const ordersList = orders || [];
        const orderSummary = {
          total: ordersList.length,
          completed: ordersList.filter(order => order.status === 'delivered' || order.status === 'completed').length,
          canceled: ordersList.filter(order => order.status === 'canceled').length,
          pending: ordersList.filter(order => order.status === 'pending' || order.status === 'accepted').length
        };

        const recentOrders = ordersList.map(order => ({
          orderId: order.order_id || `ORD-${order.id}`,
          customer: order.customer_name || 'Customer',
          amount: `₱${order.total_amount || order.amount || '0'}`,
          date: new Date(order.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'
        }));

        // Also check if there's an associated customer
        const associatedCustomer = await findAssociatedCustomer();

        setCourierData({
          ...courier,
          orderSummary,
          recentOrders,
          activeSuspension,
          associatedCustomer
        });
      }
    } catch (error) {
      console.error('Error fetching courier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setUpdating(true);

      const result = await updateUserStatus('courier', 'approved');
      if (!result.success) throw result.error;

      await logStatusChange(courierData.application_status, 'approved');

      // Update background check status as well
      const { error: bgCheckError } = await supabase
        .from('couriers')
        .update({
          background_check_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(id));

      if (bgCheckError) console.error('Error updating background check:', bgCheckError);

      setCourierData(prev => ({
        ...prev,
        application_status: 'approved',
        status: 'approved',
        background_check_status: 'approved'
      }));

      alert('Courier approved successfully!');
      setShowApproveModal(false);

    } catch (error) {
      console.error('Error approving courier:', error);
      alert(`Error approving courier: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return;

    try {
      setUpdating(true);

      const result = await updateUserStatus('courier', 'rejected');
      if (!result.success) throw result.error;

      await logStatusChange(courierData.application_status, 'rejected', rejectionReason);

      setCourierData(prev => ({
        ...prev,
        application_status: 'rejected',
        status: 'rejected'
      }));

      alert('Courier rejected successfully!');
      setShowRejectModal(false);
      setRejectionReason('');

    } catch (error) {
      console.error('Error rejecting courier:', error);
      alert(`Error rejecting courier: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspensionReason) return;

    try {
      setUpdating(true);

      // Update courier status to suspended
      const result = await updateUserStatus('courier', 'suspended');
      if (!result.success) throw result.error;

      // Get selected reason details
      const selectedReason = suspensionReasons.find(r => r.reason === suspensionReason);
      const durationDays = isPermanentSuspension ? 0 : suspensionDuration;

      // Log suspension for courier
      await logSuspension(suspensionReason, suspensionNotes, durationDays, isPermanentSuspension, 'courier');

      // Log status change for courier
      await logStatusChange(courierData.application_status, 'suspended', suspensionReason, suspensionNotes, 'courier');

      // Find associated customer and log their suspension too
      const customer = await findAssociatedCustomer();
      if (customer) {
        // Log customer suspension
        await logSuspension(suspensionReason, `Courier suspension - ${suspensionNotes}`, durationDays, isPermanentSuspension, 'customer');

        // Log customer status change
        await logStatusChange(customer.status, 'suspended', `Associated courier suspended: ${suspensionReason}`, suspensionNotes, 'customer');
      }

      // Refresh courier data
      await fetchCourierData();

      alert('Courier suspended successfully! Associated customer account has also been suspended.');
      setShowSuspendModal(false);
      setSuspensionReason('');
      setSuspensionNotes('');
      setSuspensionDuration(1);
      setIsPermanentSuspension(false);

    } catch (error) {
      console.error('Error suspending courier:', error);
      alert(`Error suspending courier: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleActivate = async () => {
    try {
      setUpdating(true);

      // Update courier status to active
      const result = await updateUserStatus('courier', 'active');
      if (!result.success) throw result.error;

      // Log status change
      await logStatusChange(courierData.application_status, 'active', 'Account reactivated', '', 'courier');

      // Update suspension record if exists
      try {
        const activeSuspension = await checkActiveCourierSuspension(id);
        if (activeSuspension) {
          const { data: { session } } = await supabase.auth.getSession();

          await supabase
            .from('courier_suspensions')
            .update({
              lifted_at: new Date().toISOString(),
              lifted_by: session?.user?.id || null,
              status: 'lifted',
              updated_at: new Date().toISOString()
            })
            .eq('id', activeSuspension.id);
        }
      } catch (suspensionError) {
        console.warn('Could not update suspension record:', suspensionError);
      }

      // Find associated customer and activate them too
      const customer = await findAssociatedCustomer();
      if (customer && customer.status === 'suspended') {
        await supabase
          .from('customers')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.id);

        await logStatusChange('suspended', 'active', 'Associated courier reactivated', '', 'customer');
      }

      // Refresh courier data
      await fetchCourierData();

      alert('Courier activated successfully! Associated customer account has also been activated.');

    } catch (error) {
      console.error('Error activating courier:', error);
      alert(`Error activating courier: ${error.message}`);
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

  // License modal functions
  const openLicenseModal = () => {
    setLicenseImageLoading(true);
    setLicenseImageError('');
    setZoomLevel(1);
    setRotation(0);
    setShowLicenseModal(true);
  };

  const closeLicenseModal = () => {
    setShowLicenseModal(false);
    setLicenseImageLoading(false);
    setLicenseImageError('');
  };

  const handleImageLoad = () => {
    setLicenseImageLoading(false);
  };

  const handleImageError = () => {
    setLicenseImageLoading(false);
    setLicenseImageError('Failed to load license image');
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const downloadImage = async () => {
    if (!courierData?.license_image_url) return;

    try {
      const response = await fetch(courierData.license_image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `license-${courierData.full_name}-${courierData.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  // Vehicle registration modal functions
  const openRegistrationModal = () => {
    setRegistrationImageLoading(true);
    setRegistrationImageError('');
    setRegistrationZoomLevel(1);
    setRegistrationRotation(0);
    setShowRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationImageLoading(false);
    setRegistrationImageError('');
  };

  const handleRegistrationImageLoad = () => {
    setRegistrationImageLoading(false);
  };

  const handleRegistrationImageError = () => {
    setRegistrationImageLoading(false);
    setRegistrationImageError('Failed to load registration image');
  };

  const registrationZoomIn = () => {
    setRegistrationZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const registrationZoomOut = () => {
    setRegistrationZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const registrationResetZoom = () => {
    setRegistrationZoomLevel(1);
  };

  const registrationRotateImage = () => {
    setRegistrationRotation(prev => (prev + 90) % 360);
  };

  const downloadRegistrationImage = async () => {
    if (!courierData?.vehicle_registration_url) return;

    try {
      const response = await fetch(courierData.vehicle_registration_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registration-${courierData.full_name}-${courierData.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (['active', 'approved', 'delivered', 'completed'].includes(statusLower)) {
      return 'bg-green-500';
    } else if (['pending', 'processing'].includes(statusLower)) {
      return 'bg-yellow-500';
    } else if (['suspended', 'inactive', 'rejected', 'canceled'].includes(statusLower)) {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  const getStatusTextColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (['active', 'approved', 'delivered', 'completed'].includes(statusLower)) {
      return 'text-green-400';
    } else if (['pending', 'processing'].includes(statusLower)) {
      return 'text-yellow-400';
    } else if (['suspended', 'inactive', 'rejected', 'canceled'].includes(statusLower)) {
      return 'text-red-400';
    }
    return 'text-gray-400';
  };

  const getActionMenuOptions = () => {
    if (!courierData) return [];

    const status = courierData.application_status?.toLowerCase();
    const options = [];

    if (status === 'pending') {
      options.push(
        {
          action: 'approve',
          label: 'Approve Application',
          icon: CheckCircle,
          className: 'text-green-400 hover:bg-green-500 hover:text-white',
          onClick: () => setShowApproveModal(true)
        },
        {
          action: 'reject',
          label: 'Reject Application',
          icon: XCircle,
          className: 'text-red-400 hover:bg-red-500 hover:text-white',
          onClick: () => setShowRejectModal(true)
        }
      );
    } else if (status === 'active' || status === 'approved') {
      options.push({
        action: 'suspend',
        label: 'Suspend Courier',
        icon: UserX,
        className: 'text-red-400 hover:bg-red-500 hover:text-white',
        onClick: () => setShowSuspendModal(true)
      });
    } else if (status === 'suspended') {
      options.push({
        action: 'activate',
        label: 'Activate Courier',
        icon: CheckCircle,
        className: 'text-green-400 hover:bg-green-500 hover:text-white',
        onClick: handleActivate
      });
    }

    // Add background check approval option if pending
    if (courierData.background_check_status === 'pending' && (status === 'approved' || status === 'active')) {
      options.push({
        action: 'approve_background',
        label: 'Approve Background Check',
        icon: UserCheck,
        className: 'text-blue-400 hover:bg-blue-500 hover:text-white',
        onClick: async () => {
          try {
            setUpdating(true);
            const { error } = await supabase
              .from('couriers')
              .update({
                background_check_status: 'approved',
                updated_at: new Date().toISOString()
              })
              .eq('id', parseInt(id));

            if (error) throw error;

            setCourierData(prev => ({
              ...prev,
              background_check_status: 'approved'
            }));

            alert('Background check approved successfully!');
          } catch (error) {
            console.error('Error approving background check:', error);
            alert(`Error: ${error.message}`);
          } finally {
            setUpdating(false);
          }
        }
      });
    }

    return options;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-teal-400">Loading courier profile...</div>
      </div>
    );
  }

  if (!courierData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-400">Courier not found</div>
      </div>
    );
  }

  const actionOptions = getActionMenuOptions();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between p-6 border-b border-teal-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/courier')}
            className="text-teal-400 hover:text-teal-300 transition-colors"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-3xl font-bold text-teal-400">Courier Profile</h1>
        </div>

        <div className="flex items-center gap-4 relative">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(courierData.application_status)}`}></div>
            <span className="text-white font-medium capitalize">
              {courierData.application_status || 'Pending'}
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
        {/* Profile Header Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{courierData.full_name}</h2>
              <p className="text-gray-400 mb-1">ID: {courierData.id}</p>
              <p className="text-gray-400">Applied: {new Date(courierData.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Vehicle: {courierData.vehicle_type}</p>
              <p className="text-gray-400">Background Check:
                <span className={`ml-2 capitalize ${getStatusTextColor(courierData.background_check_status)}`}>
                  {courierData.background_check_status || 'pending'}
                </span>
              </p>
            </div>
          </div>

          {/* Associated Customer Info */}
          {courierData.associatedCustomer && (
            <div className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h4 className="text-blue-300 font-semibold">Associated Customer Account</h4>
              </div>
              <div className="text-blue-200 text-sm space-y-1">
                <p><strong>Customer ID:</strong> {courierData.associatedCustomer.id}</p>
                <p><strong>Status:</strong>
                  <span className={`ml-2 capitalize ${getStatusTextColor(courierData.associatedCustomer.status)}`}>
                    {courierData.associatedCustomer.status || 'active'}
                  </span>
                </p>
                <p className="text-blue-300 text-xs italic">
                  Note: Suspending/activating this courier will also affect their customer account.
                </p>
              </div>
            </div>
          )}

          {/* Active Suspension Info */}
          {courierData.activeSuspension && (
            <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h4 className="text-red-300 font-semibold">Account Suspended</h4>
              </div>
              <div className="text-red-200 text-sm space-y-1">
                <p><strong>Reason:</strong> {courierData.activeSuspension.suspension_reason}</p>
                <p><strong>Duration:</strong> {courierData.activeSuspension.is_permanent ? 'Permanent' : `${courierData.activeSuspension.duration_days} days`}</p>
                {courierData.activeSuspension.scheduled_lift_date && (
                  <p><strong>Scheduled Lift:</strong> {new Date(courierData.activeSuspension.scheduled_lift_date).toLocaleDateString()}</p>
                )}
                {courierData.activeSuspension.suspension_notes && (
                  <p><strong>Notes:</strong> {courierData.activeSuspension.suspension_notes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-400" />
                <span className="text-white">{courierData.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-400" />
                <span className="text-white">{courierData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-400" />
                <div>
                  <span className="text-white block">{courierData.address || 'Not provided'}</span>
                  <span className="text-gray-400 text-sm">
                    {courierData.city} {courierData.zip_code && `, ${courierData.zip_code}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver's License & Vehicle Details */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Driver's License</h3>
              {courierData.license_image_url ? (
                <button
                  onClick={openLicenseModal}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors w-full justify-center"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>View License</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-gray-900 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400">No license uploaded</span>
                </div>
              )}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Vehicle Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-400">Type:</span>
                  </div>
                  <span className="text-white">{courierData.vehicle_type || 'Not specified'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-400">Plate Number:</span>
                  </div>
                  <span className="text-white font-mono">{courierData.plate_number || 'Not specified'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-400">Brand:</span>
                  </div>
                  <span className="text-white">{courierData.vehicle_brand || 'Not specified'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-400">Model:</span>
                  </div>
                  <span className="text-white">{courierData.vehicle_model || 'Not specified'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-400">Color:</span>
                  </div>
                  <span className="text-white">{courierData.vehicle_color || 'Not specified'}</span>
                </div>

                {courierData.vehicle_year && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span className="text-gray-400">Year:</span>
                    </div>
                    <span className="text-white">{courierData.vehicle_year}</span>
                  </div>
                )}
              </div>

              {courierData.other_details && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <h4 className="text-teal-400 text-sm font-medium mb-2">Additional Details:</h4>
                  <p className="text-white text-sm">{courierData.other_details}</p>
                </div>
              )}

              {courierData.vehicle_registration_url && (
                <button
                  onClick={openRegistrationModal}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>View Vehicle Registration</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Order Summary</h3>
            <Package className="w-6 h-6 text-teal-400" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.total}</p>
              <p className="text-gray-400 text-sm">Total Orders</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.completed}</p>
              <p className="text-gray-400 text-sm">Completed</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.canceled}</p>
              <p className="text-gray-400 text-sm">Canceled</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.pending}</p>
              <p className="text-gray-400 text-sm">Pending</p>
            </div>
          </div>

          {/* Recent Orders */}
          {courierData.recentOrders.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Recent Orders</h4>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Order ID</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courierData.recentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-700 last:border-b-0">
                        <td className="py-3 px-4 text-white">{order.orderId}</td>
                        <td className="py-3 px-4 text-white">{order.customer}</td>
                        <td className="py-3 px-4 text-white">{order.amount}</td>
                        <td className="py-3 px-4 text-white">{order.date}</td>
                        <td className="py-3 px-4">
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

      {/* License Image Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                Driver's License - {courierData.full_name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={rotateImage}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Rotate"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadImage}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={closeLicenseModal}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - Image Container */}
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
              {licenseImageLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-teal-400 text-lg">Loading license image...</div>
                </div>
              )}

              {licenseImageError && (
                <div className="flex flex-col items-center justify-center py-12 text-red-400">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p className="text-lg mb-4">{licenseImageError}</p>
                  <button
                    onClick={() => window.open(courierData.license_image_url, '_blank')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                  >
                    Open in New Tab
                  </button>
                </div>
              )}

              {courierData.license_image_url && !licenseImageError && (
                <div className="relative">
                  <img
                    src={courierData.license_image_url}
                    alt={`Driver's License of ${courierData.full_name}`}
                    className="max-w-full max-h-[70vh] object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div>
                  <span>Courier ID: {courierData.id}</span>
                  <span className="mx-2">•</span>
                  <span>Name: {courierData.full_name}</span>
                </div>
                <div className="text-right">
                  <button
                    onClick={closeLicenseModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Registration Image Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                Vehicle Registration - {courierData.full_name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={registrationZoomOut}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={registrationResetZoom}
                  className="p-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  title="Reset Zoom"
                >
                  {Math.round(registrationZoomLevel * 100)}%
                </button>
                <button
                  onClick={registrationZoomIn}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={registrationRotateImage}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Rotate"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadRegistrationImage}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={closeRegistrationModal}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - Image Container */}
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
              {registrationImageLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-teal-400 text-lg">Loading registration image...</div>
                </div>
              )}

              {registrationImageError && (
                <div className="flex flex-col items-center justify-center py-12 text-red-400">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p className="text-lg mb-4">{registrationImageError}</p>
                  <button
                    onClick={() => window.open(courierData.vehicle_registration_url, '_blank')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                  >
                    Open in New Tab
                  </button>
                </div>
              )}

              {courierData.vehicle_registration_url && !registrationImageError && (
                <div className="relative">
                  <img
                    src={courierData.vehicle_registration_url}
                    alt={`Vehicle Registration of ${courierData.full_name}`}
                    className="max-w-full max-h-[70vh] object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${registrationZoomLevel}) rotate(${registrationRotation}deg)`
                    }}
                    onLoad={handleRegistrationImageLoad}
                    onError={handleRegistrationImageError}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div>
                  <span>Courier ID: {courierData.id}</span>
                  <span className="mx-2">•</span>
                  <span>Name: {courierData.full_name}</span>
                </div>
                <div className="text-right">
                  <button
                    onClick={closeRegistrationModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Approve Courier</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to approve {courierData.full_name} as a courier?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={updating}
              >
                {updating ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Reject Courier Application</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to reject {courierData.full_name}'s application?
            </p>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Reason for rejection:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Please provide a reason for rejection..."
                rows="3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={!rejectionReason.trim() || updating}
              >
                {updating ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-white mb-4">Suspend Courier</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to suspend {courierData.full_name}'s account?
              The user will not be able to log in or use the services until reactivated.
            </p>

            {courierData.associatedCustomer && (
              <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                <div className="flex items-center gap-2 text-blue-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Note:</span>
                  <span>This will also suspend the associated customer account (ID: {courierData.associatedCustomer.id})</span>
                </div>
              </div>
            )}

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
              {/* {!isPermanentSuspension && suspensionDuration > 0 && (
                <div className="p-3 bg-blue-900 border border-blue-700 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Scheduled Lift Date:</span>
                    <span>{calculateLiftDate()}</span>
                  </div>
                </div>
              )} */}

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

export default CourierProfile;