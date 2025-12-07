import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Package, CreditCard, Clock,
  DollarSign, Smartphone, Truck, Home, FileText,
  Calendar, Menu, Filter, ChevronDown, User, Bell,
  X, Navigation, Phone, Mail, Image, Loader, Eye,
  AlertTriangle, TrendingUp, Clock as ClockIcon, Download,
  MessageSquare, AlertCircle
} from 'lucide-react';
import { clearUserSession, getCurrentUser } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import logo from '../../assets/images/LOGO.png';
import '../../styles/courier-home.css';
import '../../styles/Courier-css/earnings-modal.css';
import EarningsModal from '../../components/EarningsModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { notificationService } from '../../hooks/notificationService';
import NotificationDropdown from '../../components/NotificationDropdown';
import OrderRemarksModal from '../../components/OrderRemarksModal';

const CourierHome = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Orders');
  const [activeTab, setActiveTab] = useState('current');
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaymentBreakdownModal, setShowPaymentBreakdownModal] = useState(false);
  const [deliveryEarnings, setDeliveryEarnings] = useState(0);
  const [bookEarnings, setBookEarnings] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [realTimeSubscription, setRealTimeSubscription] = useState(null);
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [showDeliveryEarningsModal, setShowDeliveryEarningsModal] = useState(false);
  const [showBookEarningsModal, setShowBookEarningsModal] = useState(false);
  const [deliveryEarningsData, setDeliveryEarningsData] = useState([]);
  const [bookEarningsData, setBookEarningsData] = useState([]);
  const [showAcceptConfirmationModal, setShowAcceptConfirmationModal] = useState(false);
  const [orderToAccept, setOrderToAccept] = useState(null);
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ delivery: 0, book: 0 });
  const [monthlyStats, setMonthlyStats] = useState({ delivery: 0, book: 0 });
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loadingActiveServices, setLoadingActiveServices] = useState(true);

  // Check authentication and load data
  useEffect(() => {
    checkAuthentication();
    return () => {
      if (realTimeSubscription) {
        realTimeSubscription.unsubscribe();
      }
    };
  }, []);

  // Load data when userData is available
  useEffect(() => {
    if (userData) {
      loadAllEarningsData();
      fetchPendingOrders();
      loadActiveServices();
      setupRealtimeSubscription();
    }
  }, [userData]);

  // Load active services (deliveries and bookings) that courier is currently handling
  const loadActiveServices = async () => {
    try {
      if (!userData?.id) return;

      setLoadingActiveServices(true);

      // Load active deliveries (not completed/cancelled)
      const { data: activeDeliveriesData, error: deliveriesError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          courier_status,
          delivery_time,
          estimated_duration,
          book_for_delivery,
          delivery_date,
          selected_service,
          pickup_location,
          delivery_location
        `)
        .eq('courier_id', userData.id)
        .eq('book_for_delivery', false)
        .in('status', ['accepted', 'picked_up', 'on_the_way', 'arrived'])
        .order('created_at', { ascending: false });

      if (deliveriesError) throw deliveriesError;

      // Load active bookings (not completed/cancelled)
      const { data: activeBookingsData, error: bookingsError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          courier_status,
          delivery_date,
          delivery_time,
          estimated_duration,
          book_for_delivery,
          selected_service,
          pickup_location,
          delivery_location
        `)
        .eq('courier_id', userData.id)
        .eq('book_for_delivery', true)
        .in('status', ['accepted', 'picked_up', 'on_the_way', 'arrived'])
        .order('delivery_date', { ascending: true });

      if (bookingsError) throw bookingsError;

      console.log('Active Deliveries:', activeDeliveriesData);
      console.log('Active Bookings:', activeBookingsData);

      setActiveDeliveries(activeDeliveriesData || []);
      setActiveBookings(activeBookingsData || []);

    } catch (error) {
      console.error('Error loading active services:', error);
    } finally {
      setLoadingActiveServices(false);
    }
  };

  // Check if courier can accept a new order
  const canAcceptOrder = (orderToCheck) => {
    // If courier has any active delivery, cannot accept new current delivery
    if (orderToCheck.requestType === 'current') {
      if (activeDeliveries.length > 0) {
        return {
          canAccept: false,
          reason: 'You already have an active delivery. Complete or cancel it before accepting a new one.',
          conflictType: 'active_delivery'
        };
      }
    }

    // If courier has any active booking, check for time conflicts
    if (orderToCheck.requestType === 'book') {
      if (activeDeliveries.length > 0) {
        return {
          canAccept: false,
          reason: 'You have an active delivery that might conflict with this booking.',
          conflictType: 'active_delivery_conflict'
        };
      }

      // Check for time conflicts with existing bookings
      if (activeBookings.length > 0) {
        const newBookingDate = new Date(orderToCheck.supabaseData.delivery_date);
        const newBookingTime = orderToCheck.supabaseData.delivery_time;
        const newBookingDuration = orderToCheck.supabaseData.estimated_duration || 60; // Default 60 minutes

        // Parse new booking time
        const [newHours, newMinutes] = newBookingTime.split(':').map(Number);
        const newStartTime = new Date(newBookingDate);
        newStartTime.setHours(newHours, newMinutes, 0, 0);
        const newEndTime = new Date(newStartTime.getTime() + newBookingDuration * 60000);

        for (const booking of activeBookings) {
          const existingDate = new Date(booking.delivery_date);
          const [existingHours, existingMinutes] = booking.delivery_time.split(':').map(Number);
          const existingStartTime = new Date(existingDate);
          existingStartTime.setHours(existingHours, existingMinutes, 0, 0);
          const existingEndTime = new Date(existingStartTime.getTime() + (booking.estimated_duration || 60) * 60000);

          // Check if dates are the same
          if (newBookingDate.toDateString() === existingDate.toDateString()) {
            // Check for time overlap
            if (
              (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
              (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
              (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
            ) {
              return {
                canAccept: false,
                reason: `This booking conflicts with your existing booking at ${booking.delivery_time}. Please complete or cancel that booking first.`,
                conflictType: 'booking_time_conflict'
              };
            }
          }
        }
      }
    }

    return { canAccept: true, reason: null, conflictType: null };
  };

  // Authentication check function
  const checkAuthentication = async () => {
    try {
      setLoading(true);
      const session = getCurrentUser();

      if (!session) {
        navigate('/customer/auth');
        return;
      }

      // Check if user is a registered courier
      const { data: courierData, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('email', session.email)
        .single();

      if (error || !courierData) {
        console.log('User is not a registered courier');
        navigate('/customer/home');
        return;
      }

      // Set user data for display including profile image
      setUserData({
        id: courierData.id,
        name: courierData.full_name || 'Courier',
        email: courierData.email || 'courier@gmail.com',
        initials: (courierData.full_name || 'Courier').charAt(0),
        vehicle: courierData.vehicle_type,
        profile_image: courierData.profile_image || ''
      });

      // Set profile image if available
      if (courierData.profile_image) {
        setProfileImage(courierData.profile_image);
      }

    } catch (error) {
      console.error('Authentication check error:', error);
      navigate('/customer/auth');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!userData?.id) return;

    // Subscribe to changes in the couriers table for this user
    const subscription = supabase
      .channel(`courier-profile-${userData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'couriers',
          filter: `id=eq.${userData.id}`
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload.new);
          // Update profile image if it changed
          if (payload.new.profile_image && payload.new.profile_image !== profileImage) {
            setProfileImage(payload.new.profile_image);
            // Also update userData with new profile image
            setUserData(prev => ({
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
  }, [userData?.id, profileImage]);

  // Enhanced earnings loading function with corrected query
  const loadAllEarningsData = async () => {
    try {
      if (!userData) return;

      console.log('Loading earnings for courier:', userData.id);

      // Load ALL earnings data with corrected order details
      const { data: allEarnings, error } = await supabase
        .from('courier_earnings')
        .select(`
            *,
            orders:order_id (
              id,
              pickup_location,
              delivery_location,
              delivery_item,
              total_amount,
              selected_service,
              customer_id,
              book_for_delivery,
              customers:customer_id (
                full_name
              )
            )
          `)
        .eq('courier_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading earnings:', error);
        throw error;
      }

      console.log('Raw earnings data:', allEarnings);

      // Process earnings data and generate order numbers
      const processedEarnings = (allEarnings || []).map(earning => ({
        ...earning,
        // Generate order number from order ID
        orderNumber: earning.orders ? `ORD-${String(earning.orders.id).slice(-8).toUpperCase()}` : `EARN-${String(earning.id).slice(-8).toUpperCase()}`
      }));

      // Separate delivery and book earnings
      const deliveryData = processedEarnings.filter(earning => earning.type === 'delivery');
      const bookData = processedEarnings.filter(earning => earning.type === 'booking');

      // Calculate totals
      const deliveryTotal = deliveryData.reduce((sum, earning) =>
        sum + parseFloat(earning.amount || 0), 0
      );
      const bookTotal = bookData.reduce((sum, earning) =>
        sum + parseFloat(earning.amount || 0), 0
      );

      // Set earnings data
      setDeliveryEarnings(deliveryTotal);
      setBookEarnings(bookTotal);
      setDeliveryEarningsData(deliveryData);
      setBookEarningsData(bookData);

      // Calculate recent earnings (last 10 transactions)
      const recent = processedEarnings.slice(0, 10);
      setRecentEarnings(recent);

      // Calculate weekly and monthly stats
      calculatePeriodStats(processedEarnings);

      console.log('Earnings loaded successfully:');
      console.log('- Delivery earnings:', deliveryTotal, '(', deliveryData.length, 'transactions)');
      console.log('- Book earnings:', bookTotal, '(', bookData.length, 'transactions)');
      console.log('- Recent earnings:', recent.length, 'transactions');

    } catch (error) {
      console.error('Error loading earnings data:', error);
      // Fallback: Load earnings without order details
      await loadEarningsFallback();
    }
  };

  // Fallback function to load earnings without order details
  const loadEarningsFallback = async () => {
    try {
      if (!userData) return;

      // Load earnings without order details
      const { data: allEarnings, error } = await supabase
        .from('courier_earnings')
        .select('*')
        .eq('courier_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fallback earnings data:', allEarnings);

      // Process earnings data
      const processedEarnings = (allEarnings || []).map(earning => ({
        ...earning,
        orderNumber: `EARN-${String(earning.id).slice(-8).toUpperCase()}`
      }));

      // Separate delivery and book earnings
      const deliveryData = processedEarnings.filter(earning => earning.type === 'delivery');
      const bookData = processedEarnings.filter(earning => earning.type === 'booking');

      // Calculate totals
      const deliveryTotal = deliveryData.reduce((sum, earning) =>
        sum + parseFloat(earning.amount || 0), 0
      );
      const bookTotal = bookData.reduce((sum, earning) =>
        sum + parseFloat(earning.amount || 0), 0
      );

      // Set earnings data
      setDeliveryEarnings(deliveryTotal);
      setBookEarnings(bookTotal);
      setDeliveryEarningsData(deliveryData);
      setBookEarningsData(bookData);

      // Calculate recent earnings
      const recent = processedEarnings.slice(0, 10);
      setRecentEarnings(recent);

      // Calculate weekly and monthly stats
      calculatePeriodStats(processedEarnings);

    } catch (error) {
      console.error('Error in fallback earnings loading:', error);
    }
  };

  // Calculate weekly and monthly statistics
  const calculatePeriodStats = (earnings) => {
    if (!earnings) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyDelivery = earnings
      .filter(earning =>
        earning.type === 'delivery' &&
        new Date(earning.created_at) >= oneWeekAgo
      )
      .reduce((sum, earning) => sum + parseFloat(earning.amount || 0), 0);

    const weeklyBook = earnings
      .filter(earning =>
        earning.type === 'booking' &&
        new Date(earning.created_at) >= oneWeekAgo
      )
      .reduce((sum, earning) => sum + parseFloat(earning.amount || 0), 0);

    const monthlyDelivery = earnings
      .filter(earning =>
        earning.type === 'delivery' &&
        new Date(earning.created_at) >= oneMonthAgo
      )
      .reduce((sum, earning) => sum + parseFloat(earning.amount || 0), 0);

    const monthlyBook = earnings
      .filter(earning =>
        earning.type === 'booking' &&
        new Date(earning.created_at) >= oneMonthAgo
      )
      .reduce((sum, earning) => sum + parseFloat(earning.amount || 0), 0);

    setWeeklyStats({
      delivery: weeklyDelivery,
      book: weeklyBook
    });

    setMonthlyStats({
      delivery: monthlyDelivery,
      book: monthlyBook
    });
  };

  // Fetch pending orders from Supabase
  const fetchPendingOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers:customer_id (
              full_name,
              email,
              phone
            )
          `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = data.map(order => ({
        id: order.id,
        orderNumber: `ORD-${order.id.slice(-8).toUpperCase()}`,
        pickupLocation: order.pickup_location,
        deliveryLocation: order.delivery_location,
        item: order.delivery_item,
        payment: order.total_amount,
        paymentMethod: order.payment_method || 'GCash',
        rushDelivery: order.is_rush_delivery ? `₱${order.rush_amount} (Rush)` : null,
        date: order.book_for_delivery
          ? `Book: ${new Date(order.delivery_date).toLocaleDateString()} ${order.delivery_time}`
          : `Today: ${order.delivery_time}`,
        status: 'Pending',
        deliveryStatus: 'pending',
        requestType: order.book_for_delivery ? 'book' : 'current',
        customerName: order.customers?.full_name || 'Customer',
        phone: order.customers?.phone || 'No phone',
        email: order.customers?.email || 'No email',
        vehicleType: order.selected_vehicle,
        serviceType: order.selected_service,
        distance: order.estimated_distance,
        estimatedTime: '10-15 mins',
        category: order.selected_category,
        description: order.description,
        items: [
          {
            name: order.delivery_item,
            quantity: 1,
            price: parseFloat(order.total_amount) - (order.is_rush_delivery ? parseFloat(order.rush_amount) : 0)
          }
        ],
        images: order.uploaded_photos || [],
        rushAmount: order.rush_amount,
        isRushDelivery: order.is_rush_delivery,
        supabaseData: order
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Setup realtime subscription for new orders and earnings
  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('courier-dashboard')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('New order received:', payload);
          fetchPendingOrders();
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload);
          if (payload.new.status === 'accepted') {
            setOrders(prev => prev.filter(order => order.id !== payload.new.id));
          }
          // Reload active services when order status changes
          if (payload.new.courier_id === userData?.id) {
            loadActiveServices();
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*', // Listen to ALL changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'courier_earnings',
          filter: `courier_id=eq.${userData?.id}`
        },
        (payload) => {
          console.log('Earnings update received:', payload);
          loadAllEarningsData(); // Refresh all earnings data
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `courier_id=eq.${userData?.id}`
        },
        (payload) => {
          console.log('Order update for active services:', payload);
          loadActiveServices(); // Refresh active services
        }
      )
      .subscribe();

    setRealTimeSubscription(subscription);
  };

  // PDF Download function for order receipt
  const downloadReceipt = async (order) => {
    try {
      // Show loading state
      const downloadButton = document.querySelector('.download-receipt-button-total');
      if (downloadButton) {
        const originalText = downloadButton.innerHTML;
        downloadButton.innerHTML = '<span>Generating PDF...</span>';
        downloadButton.disabled = true;
      }

      // Create a new div for the receipt that's visible for capture
      const receiptDiv = document.createElement('div');
      receiptDiv.style.position = 'fixed';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.top = '0';
      receiptDiv.style.width = '210mm';
      receiptDiv.style.minHeight = '297mm';
      receiptDiv.style.padding = '20mm';
      receiptDiv.style.backgroundColor = 'white';
      receiptDiv.style.color = 'black';
      receiptDiv.style.fontFamily = 'Arial, sans-serif';
      receiptDiv.style.zIndex = '9999';

      // Generate receipt content
      receiptDiv.innerHTML = generateReceiptHTML(order);
      document.body.appendChild(receiptDiv);

      // Wait a bit for the content to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use html2canvas to capture the receipt
      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: true
      });

      // Remove the temporary div
      document.body.removeChild(receiptDiv);

      // Convert canvas to PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download the PDF
      pdf.save(`Pickarry-Receipt-${order.orderNumber}.pdf`);

      // Restore button state
      if (downloadButton) {
        downloadButton.innerHTML = '<Download size={18} /><span>Download</span>';
        downloadButton.disabled = false;
      }

    } catch (error) {
      console.error('Error generating PDF receipt:', error);

      // Restore button state on error
      const downloadButton = document.querySelector('.download-receipt-button-total');
      if (downloadButton) {
        downloadButton.innerHTML = '<Download size={18} /><span>Download</span>';
        downloadButton.disabled = false;
      }

      // Fallback: Create a simple text receipt
      try {
        const textReceipt = generateTextReceipt(order);
        downloadTextReceipt(textReceipt, order.orderNumber);
        alert('PDF generation failed. A text receipt has been downloaded instead.');
      } catch (fallbackError) {
        console.error('Fallback receipt generation failed:', fallbackError);
        alert('Error generating receipt. Please try again.');
      }
    }
  };

  // Generate receipt HTML content
  const generateReceiptHTML = (order) => {
    const breakdown = calculateFareBreakdown(order);

    return `
        <div class="receipt-content" style="width: 100%; height: 100%;">
          <!-- Company Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
            <div style="text-align: left;">
              <h2 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">Pickarry Delivery</h2>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Courier Service Receipt</p>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 2px 0;"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
              <p style="margin: 2px 0;"><strong>Receipt ID:</strong> ${order.orderNumber}</p>
            </div>
          </div>

          <!-- Order Information -->
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
            <h4 style="margin: 0 0 15px 0; color: #000; font-size: 16px; font-weight: bold;">Order Information</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Customer:</span>
                <span style="color: #000; text-align: right;">${order.customerName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Service Type:</span>
                <span style="color: #000; text-align: right;">${order.serviceType}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Vehicle Type:</span>
                <span style="color: #000; text-align: right;">${order.vehicleType}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Pickup:</span>
                <span style="color: #000; text-align: right;">${order.pickupLocation}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Delivery:</span>
                <span style="color: #000; text-align: right;">${order.deliveryLocation}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Distance:</span>
                <span style="color: #000; text-align: right;">${order.distance}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Status:</span>
                <span style="color: #000; text-align: right;">${order.status}</span>
              </div>
            </div>
          </div>

          <!-- Payment Breakdown -->
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
            <h4 style="margin: 0 0 15px 0; color: #000; font-size: 16px; font-weight: bold;">Fare Breakdown</h4>
            <div>
              ${breakdown.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #333; font-size: 14px;">${item.description}</span>
                  <span style="color: #000; font-size: 14px; font-weight: 500;">₱${item.amount.toFixed(2)}</span>
                </div>
              `).join('')}
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #000; margin-top: 10px; font-weight: bold; font-size: 16px;">
                <span style="color: #000;">Total Amount</span>
                <span style="color: #000;">₱${order.payment}</span>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 15px 0; color: #000; font-size: 16px; font-weight: bold;">Payment Information</h4>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Payment Method:</span>
                <span style="color: #000;">${order.paymentMethod.includes('COD') ? 'Cash on Delivery' : 'GCash'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Delivery Type:</span>
                <span style="color: #000;">${order.requestType === 'current' ? 'Current Delivery' : 'Booked Delivery'}</span>
              </div>
            </div>
          </div>

          <!-- Courier Information -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 15px 0; color: #000; font-size: 16px; font-weight: bold;">Courier Information</h4>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Courier:</span>
                <span style="color: #000;">${userData?.name || 'Courier'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span style="font-weight: bold; color: #333;">Vehicle:</span>
                <span style="color: #000;">${userData?.vehicle || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid #000; margin-top: 20px; color: #666; font-size: 12px;">
            <p style="margin: 5px 0; font-style: italic;">Thank you for delivering with Pickarry!</p>
            <p style="margin: 5px 0;">For inquiries: THE-PICKARRY@GMAIL.COM</p>
            <p style="margin: 5px 0; font-size: 10px;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;
  };

  // Generate text receipt as fallback
  const generateTextReceipt = (order) => {
    const breakdown = calculateFareBreakdown(order);

    return `
  PICKARRY DELIVERY RECEIPT - COURIER COPY
  ==============================

  Order Number: ${order.orderNumber}
  Date: ${new Date().toLocaleDateString()}
  Time: ${new Date().toLocaleTimeString()}

  ORDER INFORMATION:
  ----------------
  Customer: ${order.customerName}
  Service: ${order.serviceType}
  Vehicle: ${order.vehicleType}
  Status: ${order.status}

  LOCATIONS:
  ---------
  Pickup: ${order.pickupLocation}
  Delivery: ${order.deliveryLocation}
  Distance: ${order.distance}

  FARE BREAKDOWN:
  --------------
  ${breakdown.map(item =>
      `${item.description}: ₱${item.amount.toFixed(2)}`
    ).join('\n')}

  TOTAL AMOUNT: ₱${order.payment}

  PAYMENT INFORMATION:
  ------------------
  Method: ${order.paymentMethod.includes('COD') ? 'Cash on Delivery' : 'GCash'}
  Type: ${order.requestType === 'current' ? 'Current Delivery' : 'Booked Delivery'}

  COURIER INFORMATION:
  ------------------
  Name: ${userData?.name || 'Courier'}
  Vehicle: ${userData?.vehicle || 'Not specified'}

  Thank you for delivering with Pickarry!
  For inquiries: THE-PICKARRY@GMAIL.COM
  ==============================
  Generated on: ${new Date().toLocaleString()}
    `.trim();
  };

  // Download text receipt
  const downloadTextReceipt = (content, orderNumber) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pickarry-Receipt-${orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Open delivery earnings modal
  const openDeliveryEarningsModal = async () => {
    console.log('Opening Delivery Earnings Modal');
    console.log('Delivery Earnings Data:', deliveryEarningsData);
    console.log('Delivery Total:', deliveryEarnings);
    setShowDeliveryEarningsModal(true);
  };

  // Open book earnings modal
  const openBookEarningsModal = async () => {
    console.log('Opening Book Earnings Modal');
    console.log('Book Earnings Data:', bookEarningsData);
    console.log('Book Total:', bookEarnings);
    setShowBookEarningsModal(true);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  // Show confirmation modal before accepting order
  const showAcceptConfirmation = (order) => {
    const acceptanceCheck = canAcceptOrder(order);

    if (!acceptanceCheck.canAccept) {
      // Show rejection modal with reason
      setSelectedOrder({
        ...order,
        rejectionReason: acceptanceCheck.reason,
        conflictType: acceptanceCheck.conflictType
      });
      setShowOrderDetailsModal(true);
      return;
    }

    setOrderToAccept(order);
    setShowAcceptConfirmationModal(true);
  };

  // Handle order acceptance after confirmation
  const confirmAcceptOrder = async () => {
    if (!orderToAccept) return;

    try {
      if (!userData) {
        alert('Please login again');
        return;
      }

      setAcceptingOrder(orderToAccept.id);
      setShowAcceptConfirmationModal(false);

      // Update order in Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          courier_id: userData.id,
          status: 'accepted',
          courier_status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderToAccept.id);

      if (error) throw error;

      // Record in order status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderToAccept.id,
          status: 'accepted',
          courier_status: 'accepted',
          notes: `Order accepted by courier ${userData.name}`
        });

      try {
        // Notify customer that courier accepted the order
        await notificationService.notifyCourierAccepted(
          orderToAccept.id,
          orderToAccept.supabaseData.customer_id,
          userData.name
        );

        // Notify customer about order status update
        await notificationService.notifyOrderUpdate(
          orderToAccept.id,
          'accepted',
          orderToAccept.supabaseData.customer_id,
          { courier_name: userData.name }
        );

      } catch (error) {
        console.error('Error sending notifications:', error);
      }

      console.log('Order accepted:', orderToAccept);

      // Remove the order from the local list
      setOrders(prev => prev.filter(o => o.id !== orderToAccept.id));

      // Reload active services
      loadActiveServices();

      // Close modals
      setShowOrderDetailsModal(false);
      setShowPaymentBreakdownModal(false);

      // Navigate to appropriate page
      navigate(orderToAccept.requestType === 'current' ? '/courier/history' : '/courier/book', {
        state: {
          acceptedOrder: {
            ...orderToAccept,
            status: 'Accepted',
            deliveryStatus: 'accepted'
          }
        }
      });

    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Error accepting order. Please try again.');
    } finally {
      setAcceptingOrder(null);
      setOrderToAccept(null);
    }
  };

  const openPaymentBreakdown = (order) => {
    setSelectedOrder(order);
    setShowPaymentBreakdownModal(true);
  };

  const calculateFareBreakdown = (order) => {
    if (!order) return [];
    const baseFare = 40.00;
    const distanceRate = parseFloat(order.distance) * 8.00;
    const serviceFee = 30.00;
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - serviceFee;

    const breakdown = [
      { description: 'Base Fare', amount: baseFare },
      { description: `Distance (${order.distance})`, amount: distanceRate },
      { description: 'Service Fee', amount: serviceFee },
      { description: 'Items Total', amount: itemsTotal },
    ];

    if (order.isRushDelivery) {
      breakdown.push({ description: 'Rush Delivery', amount: parseFloat(order.rushAmount) });
    }

    return breakdown;
  };

  // Calculate today's earnings
  const calculateTodayEarnings = (earningsData) => {
    const today = new Date().toDateString();
    return earningsData
      .filter(earning => new Date(earning.created_at).toDateString() === today)
      .reduce((sum, earning) => sum + parseFloat(earning.amount || 0), 0);
  };

  const todayDeliveryEarnings = calculateTodayEarnings(deliveryEarningsData);
  const todayBookEarnings = calculateTodayEarnings(bookEarningsData);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get service type from order data
  const getServiceType = (earning) => {
    if (earning.orders) {
      return earning.orders.selected_service || 'Delivery';
    }
    return earning.type === 'delivery' ? 'Delivery' : 'Booking';
  };

  // Get location info from order data
  const getLocationInfo = (earning) => {
    if (earning.orders) {
      return {
        pickup: earning.orders.pickup_location,
        delivery: earning.orders.delivery_location
      };
    }
    return { pickup: 'N/A', delivery: 'N/A' };
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.pickupLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.deliveryLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.item.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = selectedFilter === 'All Orders' || order.serviceType === selectedFilter;
    const matchesTab = activeTab === 'current' ? order.requestType === 'current' : order.requestType === 'book';
    const matchesCategory = activeCategory === 'All' || order.category === activeCategory;

    return matchesSearch && matchesFilter && matchesTab && matchesCategory;
  });

  // Render active services indicator
  const renderActiveServicesIndicator = () => {
    if (loadingActiveServices) {
      return (
        <div className="active-services-loading">
          <Loader size={16} className="animate-spin" />
          <span>Checking active services...</span>
        </div>
      );
    }

    const totalActiveServices = activeDeliveries.length + activeBookings.length;

    if (totalActiveServices === 0) {
      return null;
    }

    return (
      <div className="active-services-indicator">
        <AlertCircle size={18} />
        <span>
          You have {totalActiveServices} active service{totalActiveServices > 1 ? 's' : ''}
          {activeDeliveries.length > 0 && ` (${activeDeliveries.length} delivery${activeDeliveries.length > 1 ? 's' : ''})`}
          {activeBookings.length > 0 && ` (${activeBookings.length} booking${activeBookings.length > 1 ? 's' : ''})`}
        </span>
      </div>
    );
  };

  return (
    <div className="courier-home">
      {/* HEADER */}
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
                <span>{userData?.initials || 'C'}</span>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">Log Out</button>
        </div>
      </div>

      <div className="courier-content">
        {/* SIDEBAR */}
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
                <span>{userData?.initials || 'C'}</span>
              )}
            </div>
            <div className="profile-info">
              <h3>{userData?.name || 'Courier'}</h3>
              <p>{userData?.email || 'courier@gmail.com'}</p>
              {/* Active Services Indicator in Sidebar */}
              {/* {!loadingActiveServices && (activeDeliveries.length > 0 || activeBookings.length > 0) && (
                <div className="active-services-sidebar">
                  <div className="active-services-count">
                    <span className="active-label">Active Services:</span>
                    <span className="active-count">{activeDeliveries.length + activeBookings.length}</span>
                  </div>
                  <div className="active-services-breakdown">
                    {activeDeliveries.length > 0 && (
                      <span className="active-deliveries">Deliveries: {activeDeliveries.length}</span>
                    )}
                    {activeBookings.length > 0 && (
                      <span className="active-bookings">Bookings: {activeBookings.length}</span>
                    )}
                  </div>
                </div>
              )} */}
            </div>
          </div>

          <nav className="courier-nav">
            <button onClick={() => navigate('/courier/home')} className="nav-item active">
              <Home />Home
            </button>
            <button onClick={() => navigate('/courier/history')} className="nav-item">
              <FileText />Delivery
            </button>
            <button onClick={() => navigate('/courier/book')} className="nav-item">
              <Calendar />Book
            </button>
            <button onClick={() => navigate('/courier/menu')} className="nav-item">
              <Menu />Menu
            </button>
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="courier-main-contents">
          {/* Active Services Warning */}
          {renderActiveServicesIndicator()}

          {/* ENHANCED EARNINGS SUMMARY */}
          <div className="earnings-summary-enhanced">
            <div
              className="summary-card clickable"
              onClick={openDeliveryEarningsModal}
            >
              <div className="summary-header">
                <h3>Delivery Earnings</h3>
                <Eye size={18} className="view-icon" />
              </div>
              <p className="earnings-amount">₱{deliveryEarnings.toFixed(2)}</p>
              <div className="earnings-details">
                <span className="earnings-period">
                  Today: ₱{todayDeliveryEarnings.toFixed(2)}
                </span>
                <span className="earnings-count">
                  {deliveryEarningsData.length} Deliveries
                </span>
                <span className="earnings-period-stats">
                  Weekly: ₱{weeklyStats.delivery.toFixed(2)} • Monthly: ₱{monthlyStats.delivery.toFixed(2)}
                </span>
              </div>
            </div>

            <div
              className="summary-card clickable"
              onClick={openBookEarningsModal}
            >
              <div className="summary-header">
                <h3>Book Earnings</h3>
                <Eye size={18} className="view-icon" />
              </div>
              <p className="earnings-amount">₱{bookEarnings.toFixed(2)}</p>
              <div className="earnings-details">
                <span className="earnings-period">
                  Today: ₱ {todayBookEarnings.toFixed(2)}
                </span>
                <span className="earnings-count">
                  {bookEarningsData.length} Bookings
                </span>
                <span className="earnings-period-stats">
                  Weekly: ₱ {weeklyStats.book.toFixed(2)} • Monthly: ₱{monthlyStats.book.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Earnings Card */}
            <div className="summary-card total-earnings">
              <div className="summary-header">
                <h3>Total Earnings</h3>

              </div>
              <p className="earnings-amount total">₱{(deliveryEarnings + bookEarnings).toFixed(2)}</p>
              <div className="earnings-details">
                <span className="earnings-period">
                  Today: ₱ {(todayDeliveryEarnings + todayBookEarnings).toFixed(2)}
                </span>
                <span className="earnings-count">
                  {deliveryEarningsData.length + bookEarningsData.length} Total Services
                </span>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="courier-tabs">
            <button
              className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              <Package size={20} />
              <span>Delivery</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
            >
              <Calendar size={20} />
              <span>Book</span>
            </button>
          </div>

          {/* FILTER BUTTONS */}
          <div className="filter-buttons">
            <button
              onClick={() => setSelectedFilter('All Orders')}
              className={`filter-btn ${selectedFilter === 'All Orders' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('Pasundo')}
              className={`filter-btn pasundo ${selectedFilter === 'Pasundo' ? 'active' : ''}`}
            >
              Pasundo
            </button>
            <button
              onClick={() => setSelectedFilter('Pasugo')}
              className={`filter-btn pasugo ${selectedFilter === 'Pasugo' ? 'active' : ''}`}
            >
              Pasugo
            </button>
          </div>

          {/* SEARCH + CATEGORY + FILTER */}
          <div className="courier-search-bar">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category and Filter Dropdowns */}
            <div className="orders-toolbar-right">
              <div className="dropdown">
                <button className="dropdown-button" onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                }}>
                  {activeCategory} <ChevronDown className="w-4 h-4" />
                </button>
                {showCategoryDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => {
                      setActiveCategory('All');
                      setShowCategoryDropdown(false);
                    }}>All</div>
                    <div className="dropdown-item" onClick={() => {
                      setActiveCategory('Food');
                      setShowCategoryDropdown(false);
                    }}>Food</div>
                    <div className="dropdown-item" onClick={() => {
                      setActiveCategory('Documents');
                      setShowCategoryDropdown(false);
                    }}>Documents</div>
                    <div className="dropdown-item" onClick={() => {
                      setActiveCategory('Package');
                      setShowCategoryDropdown(false);
                    }}>Package</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ORDERS LIST */}
          <div className="courier-orders-list">
            {filteredOrders.length === 0 ? (
              <div className="no-orders">
                <Package size={48} className="no-orders-icon" />
                <h3>No orders available</h3>
                <p>When customers request services, they will appear here.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const acceptanceCheck = canAcceptOrder(order);

                return (
                  <div key={order.id} className="courier-order-card">
                    <div className="order-header">
                      <div className="order-pickup">
                        <MapPin className="w-5 h-5" />
                        <span>{order.pickupLocation}</span>
                      </div>
                      <div className="order-badge new-badge">NEW</div>
                    </div>

                    <div className="order-details">
                      <div className="order-detail">
                        <Package className="detail-icon w-4 h-4" />
                        <span>{order.item}</span>
                        <span className="detail-right detail-right-service service-type">{order.serviceType}</span>
                      </div>
                      <div className="order-detail">
                        <MapPin className="detail-icon w-4 h-4" />
                        <span>{order.deliveryLocation}</span>
                        <span className="detail-right detail-right-time">
                          {order.date}
                        </span>
                      </div>
                      <div className="order-detail">
                        <Truck className="detail-icon w-4 h-4" />
                        <span>{order.vehicleType}</span>
                        <span className="detail-right detail-right-payment">
                          {order.paymentMethod.includes('COD') ? 'COD' : 'GCash'}: ₱{order.payment}
                        </span>
                      </div>
                      <div className="order-detail">
                        <Clock className="detail-icon w-4 h-4" />
                        <span>Delivery Status: Pending Acceptance</span>
                        <span className={`detail-right detail-right-status status-text status-pending`}>
                          PENDING
                        </span>
                      </div>
                    </div>



                    <div className="order-footer">
                      <button
                        className="order-view-button"
                        onClick={() => openOrderDetails(order)}
                      >
                        View Details
                      </button>
                      {!acceptanceCheck.canAccept && (
                        <div className="acceptance-warning">
                          <AlertCircle size={16} />
                          <span>{acceptanceCheck.reason}</span>
                        </div>
                      )}
                      <div className="pending-order-actions">
                        <button
                          className={`action-button accept ${!acceptanceCheck.canAccept ? 'disabled' : ''}`}
                          onClick={() => showAcceptConfirmation(order)}
                          disabled={acceptingOrder === order.id || !acceptanceCheck.canAccept}
                          title={!acceptanceCheck.canAccept ? acceptanceCheck.reason : ''}
                        >
                          {acceptingOrder === order.id ? (
                            <>
                              <Loader size={16} className="animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            order.requestType === 'current' ? 'Accept Order' : 'Accept Book'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetailsModal(false)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-button" onClick={() => setShowOrderDetailsModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-bodys order-details-body">
              {/* Show rejection warning if applicable */}
              {selectedOrder.rejectionReason && (
                <div className={`rejection-warning ${selectedOrder.conflictType}`}>
                  <AlertCircle size={24} />
                  <div className="rejection-message">
                    <h4>Cannot Accept This Order</h4>
                    <p>{selectedOrder.rejectionReason}</p>
                    <div className="rejection-suggestions">
                      {selectedOrder.conflictType === 'active_delivery' && (
                        <button
                          className="suggestion-button"
                          onClick={() => {
                            setShowOrderDetailsModal(false);
                            navigate('/courier/history');
                          }}
                        >
                          View Active Deliveries
                        </button>
                      )}
                      {selectedOrder.conflictType === 'booking_time_conflict' && (
                        <button
                          className="suggestion-button"
                          onClick={() => {
                            setShowOrderDetailsModal(false);
                            navigate('/courier/book');
                          }}
                        >
                          View Active Bookings
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Real Customer Uploaded Photos */}
              {selectedOrder.images && selectedOrder.images.length > 0 && (
                <div className="order-images-section">
                  <h3>Order Photos</h3>
                  <div className="order-images-grid">
                    {selectedOrder.images.map((imgUrl, index) => (
                      <div key={index} className="order-image-item">

                        <div className="order-image-placeholder">
                          <img
                            src={imgUrl}
                            alt={`Order item ${index + 1}`}
                            className="order-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* <Image size={32} className="image-placeholder-icon" />
                          <span>Image {index + 1}</span> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Order Number</span>
                    <p className="info-value">{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="info-item">
                    <Calendar className="info-icon" />
                    <div>
                      <label>Order Date & Time</label>
                      <p>{selectedOrder.date}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin className="info-icon" />
                    <div>
                      <label>Pickup Location</label>
                      <p>{selectedOrder.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Navigation className="info-icon" />
                    <div>
                      <label>Delivery Location</label>
                      <p>{selectedOrder.deliveryLocation}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Truck className="info-icon" />
                    <div>
                      <label>Vehicle Type</label>
                      <p>{selectedOrder.vehicleType}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Clock className="info-icon" />
                    <div>
                      <label>Estimated Time</label>
                      <p>{selectedOrder.estimatedTime}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin className="info-icon" />
                    <div>
                      <label>Distance</label>
                      <p>{selectedOrder.distance}</p>
                    </div>
                  </div>
                  <div className="info-item full-width">
                    <Package className="info-icon" />
                    <div>
                      <label>Category</label>
                      <p>{selectedOrder.category}</p>
                    </div>
                  </div>
                  <div className="info-item full-width">
                    <FileText className="info-icon" />
                    <div>
                      <label>Description</label>
                      <p>{selectedOrder.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="customer-info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <User className="info-icon" />
                    <div>
                      <label>Name</label>
                      <p>{selectedOrder.customerName}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Phone className="info-icon" />
                    <div>
                      <label>Phone</label>
                      <p>{selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Mail className="info-icon" />
                    <div>
                      <label>Email</label>
                      <p>{selectedOrder.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="payment-info-section">
                <h3>Payment Information</h3>
                <div className="payment-summary">
                  <div className="payment-method">
                    {selectedOrder.paymentMethod.includes('GCash') ? (
                      <Smartphone className="info-icon" />
                    ) : (
                      <CreditCard className="info-icon" />
                    )}
                    <div>
                      <label>Payment Method</label>
                      <p>{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                  {selectedOrder.rushDelivery && (
                    <div className="rush-delivery-info">
                      <div>
                        <label>Rush Delivery</label>
                        <p className="amount">{selectedOrder.rushDelivery}</p>
                      </div>
                    </div>
                  )}
                  <div className="total-amount">
                    <div>
                      <label>Total Amount</label>
                      <p className="amount">₱{selectedOrder.payment}</p>
                    </div>
                    <button
                      className="breakdown-button"
                      onClick={() => {
                        setShowOrderDetailsModal(false);
                        openPaymentBreakdown(selectedOrder);
                      }}
                    >
                      Breakdown
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button secondary"
                  onClick={() => setShowOrderDetailsModal(false)}
                >
                  Close
                </button>

                {/* Only show accept button if there's no rejection reason */}
                {!selectedOrder.rejectionReason && (
                  <button
                    className="action-button accept"
                    onClick={() => showAcceptConfirmation(selectedOrder)}
                    disabled={acceptingOrder === selectedOrder.id}
                  >
                    {acceptingOrder === selectedOrder.id ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      selectedOrder.requestType === 'current' ? 'Accept Order' : 'Accept Book'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT BREAKDOWN MODAL */}
      {showPaymentBreakdownModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowPaymentBreakdownModal(false)}>
          <div className="payment-breakdown-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Breakdown</h2>
              <button className="close-button" onClick={() => setShowPaymentBreakdownModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-bodys">
              <div className="breakdown-header">
                <h3 className="order-number">Order #{selectedOrder.orderNumber}</h3>
                <p className="breakdown-subtitle">Automatic Fare Computation</p>
              </div>

              <div className="breakdown-items">
                {calculateFareBreakdown(selectedOrder).map((item, index) => (
                  <div key={index} className="breakdown-item">
                    <span className="breakdown-description">{item.description}</span>
                    <span className="breakdown-amount">₱{item.amount.toFixed(2)}</span>
                  </div>
                ))}

                {/* Total Amount with Download Button */}
                <div className="breakdown-total-container">
                  <div className="breakdown-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-amount">₱{selectedOrder.payment}</span>
                  </div>
                  <button
                    className="download-receipt-button-total"
                    onClick={() => downloadReceipt(selectedOrder)}
                    title="Download Receipt"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="fare-explanation">
                <h4>Fare Computation Explained:</h4>
                <ul className="explanation-list">
                  <li><strong>Base Fare:</strong> Fixed starting fee</li>
                  <li><strong>Distance Rate:</strong> ₱8.00 per kilometer</li>
                  <li><strong>Service Fee:</strong> Platform service charge</li>
                  <li><strong>Items Total:</strong> Cost of ordered items</li>
                  {selectedOrder.isRushDelivery && (
                    <li><strong>Rush Delivery:</strong> Priority service fee</li>
                  )}
                </ul>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button secondary"
                  onClick={() => setShowPaymentBreakdownModal(false)}
                >
                  Close
                </button>
                <button
                  className="action-button accept"
                  onClick={() => showAcceptConfirmation(selectedOrder)}
                  disabled={acceptingOrder === selectedOrder.id}
                >
                  {acceptingOrder === selectedOrder.id ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    selectedOrder.requestType === 'current' ? 'Accept Order' : 'Accept Book'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCEPT CONFIRMATION MODAL */}
      {showAcceptConfirmationModal && orderToAccept && (
        <div className="modal-overlay" onClick={() => setShowAcceptConfirmationModal(false)}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Acceptance</h2>
              <button className="close-button" onClick={() => setShowAcceptConfirmationModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-bodys">
              <div className="confirmation-content">
                <div className="confirmation-icon">
                  <AlertTriangle size={48} className="text-yellow-500" />
                </div>

                <div className="confirmation-message">
                  <h3>Are you sure you want to accept this service?</h3>
                  <p>Once accepted, you will be responsible for completing this delivery.</p>
                </div>

                <div className="order-summary">
                  <div className="summary-item">
                    <span className="summary-label">Order:</span>
                    <span className="summary-value">{orderToAccept.orderNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Service:</span>
                    <span className="summary-value">{orderToAccept.serviceType}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Pickup:</span>
                    <span className="summary-value">{orderToAccept.pickupLocation}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Delivery:</span>
                    <span className="summary-value">{orderToAccept.deliveryLocation}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Earnings:</span>
                    <span className="summary-value earnings">₱{orderToAccept.payment}</span>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <button
                    className="cancel-button secondary"
                    onClick={() => setShowAcceptConfirmationModal(false)}
                    disabled={acceptingOrder === orderToAccept.id}
                  >
                    Cancel
                  </button>
                  <button
                    className="action-button accept"
                    onClick={confirmAcceptOrder}
                    disabled={acceptingOrder === orderToAccept.id}
                  >
                    {acceptingOrder === orderToAccept.id ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      'Yes, Accept Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED EARNINGS MODALS WITH SCROLLING */}
      <EarningsModal
        isOpen={showDeliveryEarningsModal}
        onClose={() => setShowDeliveryEarningsModal(false)}
        earnings={deliveryEarningsData}
        title="Delivery Earnings"
        type="delivery"
        totalEarnings={deliveryEarnings}
        todayEarnings={todayDeliveryEarnings}
        weeklyEarnings={weeklyStats.delivery}
        monthlyEarnings={monthlyStats.delivery}
        recentEarnings={recentEarnings.filter(earning => earning.type === 'delivery')}
      />

      <EarningsModal
        isOpen={showBookEarningsModal}
        onClose={() => setShowBookEarningsModal(false)}
        earnings={bookEarningsData}
        title="Book Earnings"
        type="booking"
        totalEarnings={bookEarnings}
        todayEarnings={todayBookEarnings}
        weeklyEarnings={weeklyStats.book}
        monthlyEarnings={monthlyStats.book}
        recentEarnings={recentEarnings.filter(earning => earning.type === 'booking')}
      />

      {/* ORDER REMARKS MODAL */}
      {showRemarksModal && selectedOrder && (
        <OrderRemarksModal
          orderId={selectedOrder.id}
          userType="courier"
          userId={userData?.id}
          isOpen={showRemarksModal}
          onClose={() => setShowRemarksModal(false)}
        />
      )}

      {/* FOOTER */}
      <div className="courier-footer">
        <div className="footer-logo">
          <img src={logo} alt="Pickarry Logo" className="w-8 h-8" />
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Contact Us</a>
          <a href="#" className="footer-link">Terms of Use</a>
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

export default CourierHome;