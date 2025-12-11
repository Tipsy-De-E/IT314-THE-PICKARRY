import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Bike, Info, Globe, ChevronRight, Home, ShoppingCart, Menu, MessageCircle, CheckCircle, Clock, X, User, Edit, Phone, Mail, MapPin, Calendar, Truck, FileText, Shield, Package, CreditCard, Lock, HelpCircle, AlertCircle } from 'lucide-react';
import { clearUserSession, getCurrentUser, setUserSession } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import logo from '../../assets/images/LOGO.png';
import '../../styles/customer-menu.css';
import '../../styles/css-Menu/customer-features.css';
import AboutPickarry from './Customer-Menu/AboutPickarry';
import CustomerSettings from './Customer-Menu/CustomerSettings';
import CustomerSupport from './Customer-Menu/SupportCompliants';
import SwitchToCourier from './Customer-Menu/SwitchToCourier';
import CustomerPolicies from './Customer-Menu/CustomerPolicies'; // Add this import
import PersonalInfo from '../PersonalInfo';
import NotificationDropdown from '../../components/NotificationDropdown';

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [courierStatus, setCourierStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCourierStatusModal, setShowCourierStatusModal] = useState(false);
  const [showCourierSuspensionModal, setShowCourierSuspensionModal] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [suspensionData, setSuspensionData] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    checkCourierStatus();

    // Set up real-time subscription for profile changes
    const subscription = setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Set up real-time subscription to profile changes
  const setupRealtimeSubscription = () => {
    const session = getCurrentUser();
    if (!session) return null;

    // Subscribe to customer table changes for real-time profile updates
    return supabase
      .channel('customer-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `email=eq.${session.email}`
        },
        (payload) => {
          console.log('Real-time profile update received:', payload);
          if (payload.new) {
            // Update current user data with new profile information
            setCurrentUser(prev => ({
              ...prev,
              ...payload.new
            }));
            // Update profile image if available
            if (payload.new.profile_image) {
              setProfileImage(payload.new.profile_image);
            }
          }
        }
      )
      .subscribe();
  };

  // Fetch current user data from Supabase
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const session = getCurrentUser();

      if (!session) {
        navigate('/customer/auth');
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', session.email)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // Don't throw error if user doesn't exist in customers table yet
        if (error.code === 'PGRST116') {
          console.log('User not found in customers table, using session data');
          const fallbackUser = {
            full_name: session.user_metadata?.full_name || 'Customer',
            email: session.email,
            phone: session.user_metadata?.phone || '',
            address: '',
            date_of_birth: '',
            gender: '',
            profile_image: '',
            status: 'active',
            created_at: new Date().toISOString()
          };
          setCurrentUser(fallbackUser);
          return;
        }
        throw error;
      }

      setCurrentUser(data);
      if (data.profile_image) {
        setProfileImage(data.profile_image);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced check courier application status with suspension check
  const checkCourierStatus = async () => {
    try {
      const session = getCurrentUser();
      if (!session) return;

      // First, get courier basic info
      const { data: courierData, error: courierError } = await supabase
        .from('couriers')
        .select('application_status, background_check_status, created_at, updated_at, id')
        .eq('email', session.email)
        .single();

      if (courierError && courierError.code !== 'PGRST116') {
        console.error('Error checking courier status:', courierError);
        return;
      }

      // If we have courier data, check for suspensions
      if (courierData) {
        console.log('Courier found, ID:', courierData.id);

        // Try to get active suspension for this courier
        let activeSuspension = null;

        // Try different table/column name combinations
        try {
          // Option 1: Try with courier_suspensions table
          const { data: suspensionData, error: suspensionError } = await supabase
            .from('courier_suspensions')
            .select('*')
            .eq('courier_id', courierData.id)
            .eq('status', 'active')
            .maybeSingle(); // Use maybeSingle instead of single to avoid throwing error if no data

          if (suspensionError) {
            console.error('Error checking courier_suspensions:', suspensionError);

            // If table doesn't exist or has different structure, try alternative approach
            // Check if there's a general suspensions table
            try {
              const { data: altSuspensionData } = await supabase
                .from('suspensions')
                .select('*')
                .eq('user_id', courierData.id)
                .eq('user_type', 'courier')
                .eq('status', 'active')
                .maybeSingle();

              if (altSuspensionData) {
                activeSuspension = altSuspensionData;
              }
            } catch (altError) {
              console.log('No alternative suspension table found');
            }
          } else if (suspensionData) {
            activeSuspension = suspensionData;
            console.log('Found active suspension:', activeSuspension);
          }
        } catch (error) {
          console.error('Error in suspension check:', error);
        }

        // Store suspension data if found
        if (activeSuspension) {
          setSuspensionData({
            ...activeSuspension,
            userName: currentUser?.full_name || 'User',
            userEmail: session.email
          });

          // If there's an active suspension, override the application_status
          courierData.application_status = 'suspended';
          console.log('Overriding status to suspended due to active suspension');
        }

        // Set courier status
        setCourierStatus(courierData);

        // Automatically update session if already approved and not suspended
        if (courierData.application_status === 'approved' && !activeSuspension) {
          updateUserSessionToCourier();
        }
      } else {
        // No courier data found
        setCourierStatus(null);
      }
    } catch (error) {
      console.error('Error checking courier status:', error);
    }
  };

  // Update user session to courier role
  const updateUserSessionToCourier = () => {
    const currentUserSession = JSON.parse(localStorage.getItem('userSession'));
    if (currentUserSession && currentUserSession.role !== 'courier') {
      const updatedUser = {
        ...currentUserSession,
        role: 'courier',
        isApprovedCourier: true,
        hasPendingCourierApplication: false
      };
      localStorage.setItem('userSession', JSON.stringify(updatedUser));
      console.log('User session automatically updated to courier role');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.full_name) return 'C';
    return currentUser.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get display name
  const getDisplayName = () => {
    if (!currentUser?.full_name) return 'Customer';
    return currentUser.full_name.split(' ')[0]; // First name only
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format suspension duration for display
  const formatSuspensionDuration = (suspension) => {
    if (!suspension) return 'No suspension data';

    if (suspension.is_permanent) {
      return 'Permanent Suspension';
    }

    if (suspension.scheduled_lift_date) {
      const liftDate = new Date(suspension.scheduled_lift_date);
      const now = new Date();
      const diffTime = liftDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return 'Suspension ending today';
      }

      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
    }

    if (suspension.duration_days) {
      return `${suspension.duration_days} day${suspension.duration_days > 1 ? 's' : ''} suspension`;
    }

    return 'Duration not specified';
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };

  const handleSwitchToCourierClick = () => {
    if (courierStatus) {
      if (courierStatus.application_status === 'suspended') {
        // Show suspension modal if user is suspended
        setShowCourierSuspensionModal(true);
      } else {
        // Show status modal for other statuses
        setShowCourierStatusModal(true);
      }
    } else {
      // Navigate to courier application
      setActiveFeature('courier');
    }
  };

  // Enhanced switch to courier mode function
  const handleSwitchToCourierMode = async () => {
    try {
      console.log('=== SWITCH TO COURIER MODE START ===');

      // Get current session first
      let session = getCurrentUser();
      console.log('Current session from getCurrentUser():', session);

      if (!session) {
        console.error('No session found from getCurrentUser()');
        alert('Please log in again.');
        navigate('/customer/auth');
        return;
      }

      // Update user session to courier mode using the CORRECT storage method
      const updatedUser = {
        ...session,
        role: 'courier',
        isApprovedCourier: true,
        hasPendingCourierApplication: false
      };

      // Save using the CORRECT method - setUserSession from auth.js
      setUserSession('courier', updatedUser);

      console.log('User session updated to courier role:', updatedUser);

      // Close the modal first
      setShowCourierStatusModal(false);

      // Small delay to ensure state updates
      setTimeout(() => {
        console.log('Navigating to /courier/home');
        navigate('/courier/home');
      }, 100);

    } catch (error) {
      console.error('Error switching to courier mode:', error);
      alert('Error switching to courier mode. Please try again.');
    }
  };

  // Helper functions for dynamic courier button text
  const getCourierButtonTitle = () => {
    if (!courierStatus) return 'Switch to Courier';

    switch (courierStatus.application_status) {
      case 'approved':
        return 'Go to Courier Mode';
      case 'pending':
        return 'Application Pending';
      case 'rejected':
        return 'Apply Again';
      case 'suspended':
        return 'Suspended as a Courier';
      default:
        return 'Switch to Courier';
    }
  };

  const getCourierButtonDescription = () => {
    if (!courierStatus) return 'Become a delivery rider and earn money';

    switch (courierStatus.application_status) {
      case 'approved':
        return 'Switch to courier interface and start delivering';
      case 'pending':
        return 'Your application is under review';
      case 'rejected':
        return 'Submit a new courier application';
      case 'suspended':
        return 'Your courier account has been suspended';
      default:
        return 'Become a delivery rider and earn money';
    }
  };

  // Define menuOptions after the helper functions
  const menuOptions = [
    {
      id: 1,
      icon: Settings,
      title: 'Settings',
      description: 'Manage your account preferences and privacy settings',
      action: () => setActiveFeature('settings')
    },
    {
      id: 2,
      icon: MessageCircle,
      title: 'Support & Complaints',
      description: 'Get help with your deliveries and contact support',
      action: () => setActiveFeature('support')
    },
    {
      id: 3,
      icon: Bike,
      title: getCourierButtonTitle(),
      description: getCourierButtonDescription(),
      action: handleSwitchToCourierClick,
      status: courierStatus?.application_status
    },
    {
      id: 4,
      icon: Info,
      title: 'About',
      description: 'Learn more about Pickarry and our mission',
      action: () => setActiveFeature('about')
    },
    {
      id: 5,
      icon: FileText,
      title: 'Policies & Safety',
      description: 'Review terms, policies, and safety guidelines',
      action: () => setActiveFeature('policies')
    },
  ];

  const handleBackToMenu = () => {
    setActiveFeature(null);
    // Refresh user data when coming back to menu
    fetchUserData();
    checkCourierStatus();
  };

  const handleEditPersonalInfo = () => {
    setActiveFeature('personal-info');
  };

  if (loading) {
    return (
      <div className="customer-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Header Component with NotificationDropdown
  const Header = () => (
    <div className="customer-header">
      <div className="header-logo">
        <img src={logo} alt="Pickarry Logo" className="w-19 h-12" />
      </div>
      <div className="header-right">
        <NotificationDropdown userType="customer" />
        <div className="customer-profile">
          <div className="profile-avatar">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span>{getUserInitials()}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Log Out
        </button>
      </div>
    </div>
  );

  // Reusable Sidebar Component
  const Sidebar = () => (
    <div className="customer-sidebar">
      <div className="customer-profile-card">
        <div className="profile-avatar-large">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span>{getUserInitials()}</span>
          )}
        </div>
        <div className="profile-info">
          <h3>{currentUser?.full_name || 'Customer'}</h3>
          <p>{currentUser?.email || 'customer@gmail.com'}</p>
        </div>
      </div>

      <nav className="customer-nav">
        <button
          onClick={() => navigate('/customer/home')}
          className="nav-item"
        >
          <Home className="nav-icon w-6 h-6" />
          <span>Home</span>
        </button>
        <button
          onClick={() => navigate('/customer/orders')}
          className="nav-item"
        >
          <ShoppingCart className="nav-icon w-6 h-6" />
          <span>Delivery</span>
        </button>
        <button
          onClick={() => navigate('/customer/menu')}
          className="nav-item active"
        >
          <Menu className="nav-icon w-6 h-6" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );

  // Reusable Footer Component
  const Footer = () => (
    <div className="customer-footer">
      <div className="footer-logo">
        <img src={logo} alt="Pickarry Logo" className="w-8 h-8" />
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
        <p>© 2025 Pickarry - All rights reserved</p>
      </div>
    </div>
  );

  // Reusable Layout Component for feature pages
  const FeatureLayout = ({ children }) => (
    <div className="customer-home">
      <Header />
      <div className="customer-content">
        <Sidebar />
        <div className="menu-main-content">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );

  // Courier Status Modal Component
  const CourierStatusModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowCourierStatusModal(false)}
    >
      <div
        className="bg-[#1f2937] border border-[rgba(75,85,99,0.5)] rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[rgba(75,85,99,0.5)]">
          <h2 className="text-xl font-semibold text-white">Courier Application Status</h2>
          <button
            className="p-1 hover:bg-[rgba(55,65,81,0.8)] rounded-lg transition-colors duration-200"
            onClick={() => setShowCourierStatusModal(false)}
          >
            <X size={24} className="text-[#9ca3af]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Status Icon */}
          <div className={`flex justify-center mb-4 ${courierStatus?.application_status === 'approved' ? 'text-[#22c55e]' :
            courierStatus?.application_status === 'pending' ? 'text-[#fbbf24]' :
              'text-[#ef4444]'
            }`}>
            {courierStatus?.application_status === 'approved' && <CheckCircle size={64} />}
            {courierStatus?.application_status === 'pending' && <Clock size={64} />}
            {courierStatus?.application_status === 'rejected' && <X size={64} />}
          </div>

          {/* Status Content */}
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold mb-3 ${courierStatus?.application_status === 'approved' ? 'text-[#22c55e]' :
              courierStatus?.application_status === 'pending' ? 'text-[#fbbf24]' :
                'text-[#ef4444]'
              }`}>
              {courierStatus?.application_status === 'approved' && 'Application Approved!'}
              {courierStatus?.application_status === 'pending' && 'Application Under Review'}
              {courierStatus?.application_status === 'rejected' && 'Application Not Approved'}
            </h3>

            <p className="text-[#d1d5db] mb-4 leading-relaxed">
              {courierStatus?.application_status === 'approved' &&
                'Your courier application has been approved. You can now switch to courier mode and start accepting delivery requests.'}
              {courierStatus?.application_status === 'pending' &&
                'Your application is currently being reviewed by our team. This process usually takes 1-2 business days.'}
              {courierStatus?.application_status === 'rejected' &&
                'Your courier application was not approved. Please contact support for more information or submit a new application.'}
            </p>

            {courierStatus?.created_at && (
              <div className="bg-[#1f2937] border border-[rgba(75,85,99,0.3)] rounded-lg p-3">
                <p className="text-sm text-[#9ca3af]">
                  <span className="font-medium text-[#d1d5db]">Applied on:</span> {new Date(courierStatus.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {courierStatus?.application_status === 'approved' && (
              <button
                className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                onClick={handleSwitchToCourierMode}
              >
                Switch to Courier Mode
              </button>
            )}
            {courierStatus?.application_status === 'pending' && (
              <button
                className="w-full bg-[rgba(31,41,55,0.8)] hover:bg-[rgba(31,41,55,1)] text-[#9ca3af] hover:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 border border-[rgba(75,85,99,0.5)]"
                onClick={() => setShowCourierStatusModal(false)}
              >
                Check Back Later
              </button>
            )}
            {courierStatus?.application_status === 'rejected' && (
              <button
                className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                onClick={() => {
                  setShowCourierStatusModal(false);
                  setActiveFeature('courier');
                }}
              >
                Apply Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // NEW: Courier Suspension Modal Component
  const CourierSuspensionModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-5"
      onClick={() => setShowCourierSuspensionModal(false)}
    >
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 border border-red-600 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-red-600">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border border-red-400">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-red-400 mb-2">
            Suspended as a Courier
          </h2>
          <p className="text-red-300 text-lg">
            Your courier account has been suspended
          </p>
        </div>

        {/* User Information */}
        <div className="bg-gray-800 bg-opacity-50 border border-gray-600 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={18} />
            Account Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2 border-b border-gray-600">
              <User size={16} className="text-teal-400" />
              <span className="text-gray-300 font-medium min-w-16">Name:</span>
              <span className="text-white font-medium">{suspensionData?.userName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-gray-600">
              <Mail size={16} className="text-teal-400" />
              <span className="text-gray-300 font-medium min-w-16">Email:</span>
              <span className="text-white font-medium">{suspensionData?.userEmail || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <Truck size={16} className="text-teal-400" />
              <span className="text-gray-300 font-medium min-w-16">Account Type:</span>
              <span className="text-white font-medium">Courier</span>
            </div>
          </div>
        </div>

        {/* Suspension Details */}
        <div className="bg-gray-800 bg-opacity-50 border border-gray-600 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            Suspension Information
          </h3>

          <div className="space-y-4">
            {/* Suspension Reason */}
            <div className="space-y-2">
              <strong className="text-gray-300 text-sm flex items-center gap-2">
                📝 Suspension Reason:
              </strong>
              <p className="text-white bg-gray-900 p-3 rounded-lg border-l-4 border-red-500 font-medium">
                {suspensionData?.suspension_reason || 'No reason provided'}
              </p>
            </div>

            {/* Suspension Type */}
            <div className="space-y-2">
              <strong className="text-gray-300 text-sm flex items-center gap-2">
                ⚡ Suspension Type:
              </strong>
              <span className={`px-4 py-2 rounded-full font-semibold text-sm border ${suspensionData?.is_permanent
                ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-400 border-opacity-40'
                : 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400 border-opacity-40'
                }`}>
                {suspensionData?.is_permanent ? 'Permanent Suspension' : 'Temporary Suspension'}
              </span>
            </div>

            {/* Duration */}
            {!suspensionData?.is_permanent && (
              <div className="space-y-2">
                <strong className="text-gray-300 text-sm flex items-center gap-2">
                  ⏰ Duration:
                </strong>
                <span className="text-white">{formatSuspensionDuration(suspensionData)}</span>
              </div>
            )}

            {/* Scheduled Lift Date */}
            {suspensionData?.scheduled_lift_date && !suspensionData?.is_permanent && (
              <div className="space-y-2">
                <strong className="text-gray-300 text-sm flex items-center gap-2">
                  📅 Scheduled Reactivation:
                </strong>
                <span className="text-white">
                  {new Date(suspensionData.scheduled_lift_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* Suspension Notes */}
            {suspensionData?.suspension_notes && (
              <div className="space-y-2">
                <strong className="text-gray-300 text-sm flex items-center gap-2">
                  📋 Additional Notes:
                </strong>
                <p className="text-gray-300 bg-gray-900 p-3 rounded-lg border-l-4 border-gray-500 italic text-sm">
                  {suspensionData.suspension_notes}
                </p>
              </div>
            )}

            {/* Suspension Date */}
            <div className="space-y-2">
              <strong className="text-gray-300 text-sm flex items-center gap-2">
                📅 Suspended On:
              </strong>
              <span className="text-white">
                {new Date(suspensionData?.created_at || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-red-400">
            <AlertCircle size={18} />
            <strong className="text-base">Important Notice</strong>
          </div>
          <p className="text-red-300 mb-4 leading-relaxed">
            {suspensionData?.is_permanent ? (
              "This is a permanent suspension. Your courier account access has been permanently revoked due to serious violations of our terms of service."
            ) : (
              <>
                Your courier account access has been temporarily restricted.
                <strong> You can still use your customer account normally.</strong>
                {" "}You will be able to access your courier account automatically after the suspension period ends.
                {" "}The admin may also choose to reactivate your account earlier at their discretion.
              </>
            )}
          </p>
          <div className="bg-gray-900 bg-opacity-60 p-4 rounded-lg border-l-4 border-red-500">
            <p className="text-gray-300 text-sm">
              <strong>Need help?</strong> If you believe this is a mistake or want to appeal the suspension,
              please contact our support team at <span className="text-teal-400 font-semibold hover:text-teal-300 cursor-pointer">support@pickarry.com</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            className="px-8 py-3 bg-gray-600 bg-opacity-60 text-gray-200 border border-gray-500 rounded-xl font-semibold hover:bg-gray-500 hover:bg-opacity-80 hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg relative overflow-hidden"
            onClick={() => setShowCourierSuspensionModal(false)}
          >
            I Understand
          </button>
          <button
            className="px-8 py-3 bg-red-600 bg-opacity-60 text-white border border-red-500 rounded-xl font-semibold hover:bg-red-500 hover:bg-opacity-80 transition-all duration-300 transform hover:-translate-y-1 shadow-lg relative overflow-hidden"
            onClick={() => window.location.href = 'mailto:support@pickarry.com'}
          >
            Contact Support
          </button>
        </div>

        {/* Admin Note */}
        <div className="bg-teal-500 bg-opacity-10 border border-teal-500 border-opacity-30 rounded-xl p-4 text-center backdrop-blur-sm">
          <p className="text-teal-400 text-sm flex items-center justify-center gap-2">
            💡 <strong>Note:</strong> You can continue using Pickarry as a customer. Courier account reactivation can be done by the administrator.
            {!suspensionData?.is_permanent && " The system will automatically lift the suspension when the duration period ends."}
          </p>
        </div>
      </div>
    </div>
  );

  // Feature components with the new layout
  if (activeFeature === 'settings') {
    return (
      <FeatureLayout>
        <CustomerSettings onBack={handleBackToMenu} />
      </FeatureLayout>
    );
  }

  if (activeFeature === 'support') {
    return (
      <FeatureLayout>
        <CustomerSupport onBack={handleBackToMenu} />
      </FeatureLayout>
    );
  }

  if (activeFeature === 'about') {
    return (
      <FeatureLayout>
        <AboutPickarry onBack={handleBackToMenu} />
      </FeatureLayout>
    );
  }

  if (activeFeature === 'courier') {
    return (
      <FeatureLayout>
        <SwitchToCourier onBack={handleBackToMenu} />
      </FeatureLayout>
    );
  }

  if (activeFeature === 'policies') {
    return (
      <FeatureLayout>
        <CustomerPolicies onBack={handleBackToMenu} />
      </FeatureLayout>
    );
  }

  if (activeFeature === 'personal-info') {
    return (
      <FeatureLayout>
        <PersonalInfo onBack={handleBackToMenu} userType="customer" />
      </FeatureLayout>
    );
  }

  // Main Menu View
  return (
    <div className="customer-home">
      <Header />

      <div className="customer-content">
        <Sidebar />

        {/* Main Content */}
        <div className="menu-main-content">
          {/* Customer Profile Card */}
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer group mb-6"
            onClick={handleEditPersonalInfo}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-800 font-bold text-xl">{getUserInitials()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-white">{currentUser?.full_name || 'Customer'}</h2>
                    <Edit className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{currentUser?.email || 'customer@gmail.com'}</p>

                  {/* Contact Information */}
                  <div className="flex items-center gap-4 mt-3">
                    {currentUser?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-teal-400" />
                        <p className="text-gray-400 text-sm">{currentUser.phone}</p>
                      </div>
                    )}
                    {currentUser?.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        <p className="text-gray-400 text-sm">{formatDate(currentUser.date_of_birth)}</p>
                      </div>
                    )}
                  </div>

                  {/* Status and Member Info */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
                      <CheckCircle size={10} className="mr-1" />
                      Active Customer
                    </div>
                    {courierStatus && (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${courierStatus.application_status === 'approved'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : courierStatus.application_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        {courierStatus.application_status === 'approved' && <CheckCircle size={10} className="mr-1" />}
                        {courierStatus.application_status === 'pending' && <Clock size={10} className="mr-1" />}
                        {courierStatus.application_status === 'suspended' && <AlertCircle size={10} className="mr-1" />}
                        {courierStatus.application_status.charAt(0).toUpperCase() + courierStatus.application_status.slice(1)} Courier
                      </div>
                    )}
                    <div className="text-gray-400 text-xs">
                      Member since {new Date(currentUser?.created_at || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-all duration-200" />
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuOptions.map((option) => {
              const Icon = option.icon;
              const isCourierOption = option.id === 3;

              return (
                <div
                  key={option.id}
                  className={`bg-gray-800 border rounded-xl p-4 hover:bg-gray-750 hover:border-teal-500/30 transition-all duration-200 cursor-pointer group ${isCourierOption && courierStatus ? `courier-option status-${courierStatus.application_status}` : ''
                    } ${isCourierOption && courierStatus?.application_status === 'suspended'
                      ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/70'
                      : 'border-gray-700 hover:border-teal-500/30'}`}
                  onClick={option.action}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-all duration-200 ${isCourierOption && courierStatus
                        ? courierStatus.application_status === 'approved' ? 'bg-green-500/20'
                          : courierStatus.application_status === 'pending' ? 'bg-yellow-500/20'
                            : courierStatus.application_status === 'suspended' ? 'bg-red-500/20'
                              : 'bg-red-500/20'
                        : option.id === 5 ? 'bg-blue-500/20' // Special color for Policies
                          : 'bg-gray-700'
                        }`}>
                        <Icon className={`w-6 h-6 ${isCourierOption && courierStatus
                          ? courierStatus.application_status === 'approved' ? 'text-green-400'
                            : courierStatus.application_status === 'pending' ? 'text-yellow-400'
                              : courierStatus.application_status === 'suspended' ? 'text-red-400'
                                : 'text-red-400'
                          : option.id === 5 ? 'text-blue-400' // Special color for Policies icon
                            : 'text-teal-400'
                          }`} />
                      </div>
                      <div>
                        <h3 className={`font-medium text-lg ${isCourierOption && courierStatus?.application_status === 'suspended' ? 'text-red-300' : 'text-white'}`}>
                          {option.title}
                        </h3>
                        <p className={`text-sm ${isCourierOption && courierStatus?.application_status === 'suspended' ? 'text-red-200/80' : 'text-gray-400'}`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isCourierOption && courierStatus && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${courierStatus.application_status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : courierStatus.application_status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : courierStatus.application_status === 'suspended'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                          {courierStatus.application_status.charAt(0).toUpperCase() + courierStatus.application_status.slice(1)}
                        </div>
                      )}
                      <ChevronRight className={`w-5 h-5 transition-all duration-200 ${isCourierOption && courierStatus?.application_status === 'suspended'
                        ? 'text-red-400 group-hover:text-red-300'
                        : 'text-gray-400 group-hover:text-teal-400'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />

      {showCourierStatusModal && <CourierStatusModal />}
      {showCourierSuspensionModal && suspensionData && <CourierSuspensionModal />}
    </div>
  );
};

export default CustomerMenu;