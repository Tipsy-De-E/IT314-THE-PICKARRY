import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageCircle,
  FileText,
  Shield,
  Users,
  Truck,
  Info,
  ChevronRight,
  Home,
  Calendar,
  Menu,
  User,
  Settings,
  CheckCircle,
  Edit3
} from 'lucide-react';
import { clearUserSession, getCurrentUser } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import logo from '../../assets/images/LOGO.png';
import '../../styles/courier-menu.css';
import SupportComplaints from './Courier-Menu/SupportComplaints';
import CourierPolicies from './Courier-Menu/CourierPolicies';
import SafetyGuidelines from './Courier-Menu/SafetyGuidelines';
import RiderCommunity from './Courier-Menu/RiderCommunity';
import VehicleMaintenance from './Courier-Menu/VehicleMaintenance';
import AboutPickarry from './Courier-Menu/AboutPickarry';
import SwitchToCustomer from './Courier-Menu/SwitchToCustomer';
import CustomerSettings from '../customer/Customer-Menu/CustomerSettings';
import NotificationDropdown from '../../components/NotificationDropdown';
import PersonalInfo from '../../pages/PersonalInfo'; // Import the PersonalInfo component

const CourierMenu = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('menu');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [profileImage, setProfileImage] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!currentUser?.id) return;

    // Subscribe to changes in the couriers table for this user
    const subscription = supabase
      .channel(`courier-profile-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'couriers',
          filter: `id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload.new);
          // Update profile image if it changed
          if (payload.new.profile_image && payload.new.profile_image !== profileImage) {
            setProfileImage(payload.new.profile_image);
            // Also update userData with new profile image
            setCurrentUser(prev => ({
              ...prev,
              profile_image: payload.new.profile_image
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, profileImage]);

  // Fetch current user data from Supabase
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const session = getCurrentUser();

      if (!session) {
        navigate('/customer/auth');
        return;
      }

      // Try to get courier data first
      const { data: courierData, error: courierError } = await supabase
        .from('couriers')
        .select('*')
        .eq('email', session.email)
        .single();

      if (courierData && !courierError) {
        setCurrentUser(courierData);
        // Set profile image if available
        if (courierData.profile_image) {
          setProfileImage(courierData.profile_image);
        }
      } else {
        // Fallback to customer data
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('email', session.email)
          .single();

        if (customerData && !customerError) {
          setCurrentUser(customerData);
          // Set profile image if available
          if (customerData.profile_image) {
            setProfileImage(customerData.profile_image);
          }
        } else {
          // Use session data as fallback
          setCurrentUser({
            full_name: session.user_metadata?.full_name || 'Courier',
            email: session.email,
            phone: session.user_metadata?.phone || ''
          });
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const handleSwitchToCustomer = () => {
    setShowSwitchModal(true);
  };

  const handleCloseSwitchModal = () => {
    setShowSwitchModal(false);
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
    if (!currentUser?.full_name) return 'Courier';
    return currentUser.full_name.split(' ')[0];
  };

  const menuOptions = [
    {
      icon: User,
      title: 'Switch to Customer',
      description: 'Switch back to customer mode',
      action: handleSwitchToCustomer
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Manage your account preferences and privacy settings',
      action: () => setActiveView('settings')
    },
    {
      icon: MessageCircle,
      title: 'Support & Complaints',
      description: 'Get help and submit feedback',
      action: () => setActiveView('support')
    },
    {
      icon: FileText,
      title: 'Courier Policies',
      description: 'Review courier guidelines and policies',
      action: () => setActiveView('policies')
    },
    {
      icon: Shield,
      title: 'Safety Guidelines',
      description: 'Important safety information for riders',
      action: () => setActiveView('safety')
    },
    {
      icon: Truck,
      title: 'Vehicle Maintenance',
      description: 'Tips for vehicle care and maintenance',
      action: () => setActiveView('maintenance')
    },
    {
      icon: Info,
      title: 'About Pickarry',
      description: 'Learn more about our company',
      action: () => setActiveView('about')
    }
  ];

  if (loading) {
    return (
      <div className="courier-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courier-home">
      {/* Header */}
      <div className="courier-headers">
        <div className="header-logo">
          <img src={logo} alt="Pickarry Logo" className="w-19 h-12" />
        </div>
        <div className="header-right">
          <NotificationDropdown userType="courier" />
          <div className="courier-profile">
            <div className="profile-avatar">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-avatar-image"
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

      <div className="courier-content">
        {/* Sidebar */}
        <div className="courier-sidebar">
          <div className="courier-profile-card">
            <div className="profile-avatar-large">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-avatar-image-large"
                />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>
            <div className="profile-info">
              <h3>{currentUser?.full_name || 'Courier'}</h3>
              <p>{currentUser?.email || 'courier@gmail.com'}</p>
              {/* {currentUser?.vehicle_type && (
                <p className="vehicle-info">Vehicle: {currentUser.vehicle_type}</p>
              )} */}
            </div>
          </div>

          <nav className="courier-nav">
            <button
              onClick={() => navigate('/courier/home')}
              className="nav-item"
            >
              <Home className="nav-icon w-6 h-6" />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/courier/history')}
              className="nav-item"
            >
              <FileText className="nav-icon w-6 h-6" />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => navigate('/courier/book')}
              className="nav-item"
            >
              <Calendar className="nav-icon w-6 h-6" />
              <span>Book</span>
            </button>
            <button
              onClick={() => navigate('/courier/menu')}
              className="nav-item active"
            >
              <Menu className="nav-icon w-6 h-6" />
              <span>Menu</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="courier-main-contents">
          {activeView === 'menu' && (
            <>
              {/* Profile Section - Similar to your screenshot */}
              <div
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer group mb-6"
                onClick={() => setActiveView('personal-info')}
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
                        <h2 className="text-xl font-bold text-white">{currentUser?.full_name || 'Courier'}</h2>
                        <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
                      </div>
                      <p className="text-gray-400 text-sm mb-1">{currentUser?.email || 'courier@gmail.com'}</p>
                      {currentUser?.vehicle_type && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-teal-400" />
                          <p className="text-gray-400 text-sm">Vehicle: {currentUser.vehicle_type}</p>
                          {currentUser?.vehicle_brand && (
                            <span className="text-gray-500 text-sm">• {currentUser.vehicle_brand}</span>
                          )}
                          {currentUser?.plate_number && (
                            <span className="text-gray-500 text-sm">• {currentUser.plate_number}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          <CheckCircle size={10} className="mr-1" />
                          Active Customer
                        </div>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle size={10} className="mr-1" />
                          Active Courier
                        </div>
                        <div className="text-gray-400 text-xs">
                          Member since {new Date(currentUser?.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-all duration-200" />
                </div>

                {/* Additional Info Row */}
                {/* <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{currentUser?.total_orders || 0}</div>
                    <div className="text-gray-400 text-xs">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{currentUser?.completed_orders || 0}</div>
                    <div className="text-gray-400 text-xs">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{currentUser?.rating || '4.8'}</div>
                    <div className="text-gray-400 text-xs">Rating</div>
                  </div>
                </div> */}
              </div>

              {/* Menu Items */}
              <div className="space-y-3">
                {menuOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:bg-gray-750 hover:border-teal-500/30 transition-all duration-200 cursor-pointer group"
                      onClick={option.action}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-all duration-200">
                            <Icon className="w-6 h-6 text-teal-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-lg">{option.title}</h3>
                            <p className="text-gray-400 text-sm">{option.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-all duration-200" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeView === 'personal-info' && (
            <PersonalInfo
              onBack={() => setActiveView('menu')}
              userType="courier"
            />
          )}
          {activeView === 'settings' && <CustomerSettings onBack={() => setActiveView('menu')} />}
          {activeView === 'support' && <SupportComplaints onBack={() => setActiveView('menu')} />}
          {activeView === 'policies' && <CourierPolicies onBack={() => setActiveView('menu')} />}
          {activeView === 'safety' && <SafetyGuidelines onBack={() => setActiveView('menu')} />}
          {activeView === 'community' && <RiderCommunity onBack={() => setActiveView('menu')} />}
          {activeView === 'maintenance' && <VehicleMaintenance onBack={() => setActiveView('menu')} />}
          {activeView === 'about' && <AboutPickarry onBack={() => setActiveView('menu')} />}
        </div>
      </div>

      {/* Switch to Customer Modal */}
      <SwitchToCustomer
        isOpen={showSwitchModal}
        onClose={handleCloseSwitchModal}
        onBack={handleCloseSwitchModal}
      />

      {/* Footer */}
      <div className="courier-footer">
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
    </div>
  );
};

export default CourierMenu;