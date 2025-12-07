import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Heart, Trash2, MapPin, Package, CreditCard, Clock,
  ChevronDown, MessageSquare, X, Home, ShoppingCart, Menu, Truck,
  Navigation, Calendar, User, Phone, Mail, CheckCircle, TruckIcon, Smartphone,
  Bell, FileText, Download, MessageCircle, DollarSign, Percent, Zap,
  Star, Undo2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearUserSession, getCurrentUser } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import logo from '../../assets/images/LOGO.png';
import '../../styles/customer-orders.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { notificationService } from '../../hooks/notificationService';
import NotificationDropdown from '../../components/NotificationDropdown';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [activeService, setActiveService] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeFavoriteFilter, setActiveFavoriteFilter] = useState('All'); // All, Favourite, Delete
  const [activeDeliveryTiming, setActiveDeliveryTiming] = useState('All'); // All, Book, Current
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFavoriteFilterDropdown, setShowFavoriteFilterDropdown] = useState(false);
  const [showDeliveryTimingDropdown, setShowDeliveryTimingDropdown] = useState(false);
  const [customerRemarks, setCustomerRemarks] = useState({});
  const [courierFeedback, setCourierFeedback] = useState({});
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentOrderRemark, setCurrentOrderRemark] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderForRemarks, setSelectedOrderForRemarks] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showPaymentBreakdownModal, setShowPaymentBreakdownModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [realTimeSubscription, setRealTimeSubscription] = useState(null);
  const [favoritesTableExists, setFavoritesTableExists] = useState(false);

  // FARE MANAGEMENT STATE
  const [fareConfig, setFareConfig] = useState(null);
  const [vehicleRates, setVehicleRates] = useState([]);
  const [distanceSettings, setDistanceSettings] = useState([]);
  const [fareLoading, setFareLoading] = useState(false);

  // Fetch user data and orders on component mount
  useEffect(() => {
    fetchUserData();
    fetchFareData();

    return () => {
      if (realTimeSubscription) {
        realTimeSubscription.unsubscribe();
      }
    };
  }, []);

  // Check if favorites table exists
  const checkFavoritesTableExists = async () => {
    try {
      // Try to query the favorites table
      const { data, error } = await supabase
        .from('favorites')
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
          return false;
        }
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error checking favorites table:', error);
      return false;
    }
  };

  // Create favorites table
  const createFavoritesTable = async () => {
    try {
      console.log('Creating favorites table...');

      // First, let's check the structure of customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .limit(1);

      if (customerError) {
        console.error('Error checking customers table:', customerError);
        return false;
      }

      // Create the favorites table using SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS favorites (
            favorite_id BIGSERIAL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
            order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
            UNIQUE(user_id, order_id)
          );
          
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can manage their own favorites') THEN
              CREATE POLICY "Users can manage their own favorites" ON favorites
              FOR ALL USING (auth.uid() IN (SELECT auth.uid() FROM customers WHERE customers.id = favorites.user_id));
            END IF;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
          CREATE INDEX IF NOT EXISTS idx_favorites_order_id ON favorites(order_id);
        `
      });

      if (error) {
        console.error('Error creating favorites table via RPC:', error);

        // Alternative: Try to create table with a simple insert that will fail gracefully
        try {
          const { error: testError } = await supabase
            .from('favorites')
            .insert({ user_id: 0, order_id: 0 })
            .select();

          // If we get here, the table might exist but we got a different error
          if (testError && testError.code !== '23503') { // Foreign key violation is expected
            console.log('Favorites table might already exist with different structure');
          }
        } catch (insertError) {
          console.log('Table creation might require manual setup');
        }
        return false;
      }

      console.log('Favorites table created successfully');
      return true;
    } catch (error) {
      console.error('Error in createFavoritesTable:', error);
      return false;
    }
  };

  // Initialize favorites system
  const initializeFavorites = async () => {
    const tableExists = await checkFavoritesTableExists();
    if (!tableExists) {
      console.log('Favorites table does not exist, creating...');
      const created = await createFavoritesTable();
      setFavoritesTableExists(created);
    } else {
      setFavoritesTableExists(true);
    }
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

      if (error) throw error;

      setCurrentUser(data);

      // Initialize favorites system
      await initializeFavorites();

      // Once user data is loaded, fetch orders, favorites and setup real-time
      await fetchOrders(data.id);
      await fetchFavorites(data.id);
      await fetchDeletedOrders(data.id);
      setupRealtimeSubscription(data.id);

    } catch (err) {
      console.error('Error fetching user data:', err);
      alert('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorite orders
  const fetchFavorites = async (customerId) => {
    try {
      // First try to get from localStorage (fastest and most reliable)
      const storedFavorites = localStorage.getItem(`favorites_${customerId}`);
      if (storedFavorites) {
        const localFavorites = JSON.parse(storedFavorites);
        setFavorites(localFavorites);
      }

      // Then try to sync with Supabase if table exists
      if (favoritesTableExists) {
        const { data, error } = await supabase
          .from('favorites')
          .select('order_id')
          .eq('user_id', customerId);

        if (error) {
          console.log('Supabase fetch failed, using localStorage:', error.message);
          // We already set from localStorage above, so we're good
          return;
        }

        const supabaseFavorites = data.map(fav => fav.order_id);

        // If we have data from Supabase, use it and update localStorage
        if (supabaseFavorites.length > 0) {
          setFavorites(supabaseFavorites);
          localStorage.setItem(`favorites_${customerId}`, JSON.stringify(supabaseFavorites));
        }
      }

    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      // Fallback to localStorage if it exists
      const storedFavorites = localStorage.getItem(`favorites_${currentUser?.id}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  };

  // Fetch deleted orders (soft deleted)
  const fetchDeletedOrders = async (customerId) => {
    try {
      const storedDeleted = localStorage.getItem(`deleted_orders_${customerId}`);
      if (storedDeleted) {
        setDeletedOrders(JSON.parse(storedDeleted));
      }
    } catch (error) {
      console.error('Error fetching deleted orders:', error);
    }
  };

  // Add order to favorites
  const addToFavorites = async (orderId) => {
    if (!currentUser?.id) return;

    try {
      // Always update local state and localStorage first for immediate feedback
      const newFavorites = [...favorites, orderId];
      setFavorites(newFavorites);
      localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites));

      // Then try to sync with Supabase if table exists
      if (favoritesTableExists) {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: currentUser.id,
            order_id: orderId
          })
          .select()
          .single();

        if (error) {
          // If unique constraint violation, it's already a favorite - that's fine
          if (error.code === '23505') {
            console.log('Order already in favorites in database');
          } else if (error.code === '42501') {
            console.log('RLS policy blocked insert, using localStorage only');
            // Don't throw error, just continue with localStorage
          } else {
            console.error('Supabase error adding to favorites:', error);
            // Don't throw error, continue with localStorage
          }
        } else {
          console.log('Successfully added to favorites in database');
        }
      }

    } catch (error) {
      console.error('Error in addToFavorites:', error);
      // Don't show alert to user since localStorage will work
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (orderId) => {
    if (!currentUser?.id) return;

    try {
      // Always update local state and localStorage first for immediate feedback
      const newFavorites = favorites.filter(id => id !== orderId);
      setFavorites(newFavorites);
      localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites));

      // Then try to sync with Supabase if table exists
      if (favoritesTableExists) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('order_id', orderId);

        if (error) {
          if (error.code === '42501') {
            console.log('RLS policy blocked delete, using localStorage only');
            // Don't throw error, just continue with localStorage
          } else {
            console.error('Supabase error removing from favorites:', error);
            // Don't throw error, continue with localStorage
          }
        } else {
          console.log('Successfully removed from favorites in database');
        }
      }

    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      // Don't show alert to user since localStorage will work
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (orderId) => {
    if (favorites.includes(orderId)) {
      await removeFromFavorites(orderId);
    } else {
      await addToFavorites(orderId);
    }
  };

  // Soft delete order (move to deleted filter)
  const softDeleteOrder = async (orderId) => {
    if (!currentUser?.id) return;

    try {
      const newDeletedOrders = [...deletedOrders, orderId];
      setDeletedOrders(newDeletedOrders);
      localStorage.setItem(`deleted_orders_${currentUser.id}`, JSON.stringify(newDeletedOrders));

      alert('Order moved to deleted. It will be permanently deleted if you delete it again from the deleted filter.');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  // Permanently delete order
  const permanentDeleteOrder = async (orderId) => {
    if (!currentUser?.id) return;

    try {
      // Remove from deleted orders list
      const newDeletedOrders = deletedOrders.filter(id => id !== orderId);
      setDeletedOrders(newDeletedOrders);
      localStorage.setItem(`deleted_orders_${currentUser.id}`, JSON.stringify(newDeletedOrders));

      // Also remove from favorites if it's there
      if (favorites.includes(orderId)) {
        await removeFromFavorites(orderId);
      }

      alert('Order permanently deleted.');
    } catch (error) {
      console.error('Error permanently deleting order:', error);
      alert('Error deleting order');
    }
  };

  // Restore deleted order
  const restoreOrder = async (orderId) => {
    if (!currentUser?.id) return;

    try {
      const newDeletedOrders = deletedOrders.filter(id => id !== orderId);
      setDeletedOrders(newDeletedOrders);
      localStorage.setItem(`deleted_orders_${currentUser.id}`, JSON.stringify(newDeletedOrders));

      alert('Order restored successfully.');
    } catch (error) {
      console.error('Error restoring order:', error);
      alert('Error restoring order');
    }
  };

  // Handle delete action based on current filter
  const handleDeleteOrder = (orderId) => {
    if (activeFavoriteFilter === 'Delete') {
      // If already in delete filter, permanently delete
      if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
        permanentDeleteOrder(orderId);
      }
    } else {
      // Otherwise, soft delete
      if (window.confirm('Move this order to deleted? You can restore it later from the deleted filter.')) {
        softDeleteOrder(orderId);
      }
    }
  };

  // Fetch fare configuration data
  const fetchFareData = async () => {
    try {
      setFareLoading(true);

      // Fetch fare configuration
      const { data: configData, error: configError } = await supabase
        .from('fare_configuration')
        .select('*')
        .eq('is_active', true)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (configData) {
        setFareConfig(configData);
      } else {
        // Use default values if no config exists
        setFareConfig({
          time_rate_per_minute: 9,
          platform_commission: 0.8,
          bonus_rate: 3,
          penalty_rate_per_minute: 32,
          grace_period_seconds: 320
        });
      }

      // Fetch vehicle rates
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicle_rates')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (vehicleError) throw vehicleError;

      if (vehicleData) {
        setVehicleRates(vehicleData);
      }

      // Fetch distance settings
      const { data: distanceData, error: distanceError } = await supabase
        .from('distance_fare_settings')
        .select('*')
        .eq('is_active', true)
        .order('min_distance');

      if (distanceError) throw distanceError;

      if (distanceData) {
        setDistanceSettings(distanceData);
      }

    } catch (error) {
      console.error('Error fetching fare data:', error);
    } finally {
      setFareLoading(false);
    }
  };

  // Calculate dynamic fare based on fare configuration
  const calculateFare = (vehicleType, distance, estimatedTime, isRush = false, waitTime = 0) => {
    if (!fareConfig || !vehicleRates.length) {
      console.warn('Fare configuration not loaded');
      return {
        subtotal: 0,
        platformFee: 0,
        total: 0,
        breakdown: {
          baseFare: 0,
          distanceCost: 0,
          timeCost: 0,
          penaltyCost: 0,
          rushBonus: 0,
          platformFee: 0
        }
      };
    }

    const vehicle = vehicleRates.find(v => v.vehicle_type === vehicleType);
    if (!vehicle) {
      console.warn(`Vehicle type not found: ${vehicleType}`);
      return {
        subtotal: 0,
        platformFee: 0,
        total: 0,
        breakdown: {
          baseFare: 0,
          distanceCost: 0,
          timeCost: 0,
          penaltyCost: 0,
          rushBonus: 0,
          platformFee: 0
        }
      };
    }

    // Get distance multiplier
    const distanceSetting = distanceSettings.find(setting =>
      distance >= setting.min_distance && distance < setting.max_distance
    ) || { base_multiplier: 1.0, time_multiplier: 1.0 };

    // Calculate base components
    const baseFare = vehicle.base_fare * distanceSetting.base_multiplier;
    const distanceCost = distance * vehicle.distance_rate_per_km;
    const timeCost = estimatedTime * fareConfig.time_rate_per_minute * distanceSetting.time_multiplier;

    // Calculate penalty if wait time exceeds grace period
    const gracePeriodMinutes = fareConfig.grace_period_seconds / 60;
    const penaltyTime = Math.max(0, waitTime - gracePeriodMinutes);
    const penaltyCost = penaltyTime * fareConfig.penalty_rate_per_minute;

    // Add rush bonus
    const rushBonus = isRush ? fareConfig.bonus_rate : 0;

    const subtotal = baseFare + distanceCost + timeCost + penaltyCost + rushBonus;

    // Apply platform commission
    const platformFee = subtotal * (fareConfig.platform_commission / 100);

    return {
      subtotal: subtotal,
      platformFee: platformFee,
      total: subtotal + platformFee,
      breakdown: {
        baseFare,
        distanceCost,
        timeCost,
        penaltyCost,
        rushBonus,
        platformFee
      }
    };
  };

  // Load courier feedback for all orders (FROM courier TO customer)
  const loadCourierFeedback = async (ordersData) => {
    try {
      const courierFeedbackObj = {};

      // Get all order IDs
      const orderIds = ordersData.map(order => order.id);

      if (orderIds.length > 0) {
        const { data, error } = await supabase
          .from('order_remarks')
          .select('order_id, remark, created_by, recipient_user_type, created_at')
          .in('order_id', orderIds)
          .eq('recipient_user_type', 'customer') // Feedback FROM courier TO customer
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Only take the latest feedback for each order
        data.forEach(item => {
          if (!courierFeedbackObj[item.order_id]) {
            courierFeedbackObj[item.order_id] = item.remark;
          }
        });
      }

      setCourierFeedback(courierFeedbackObj);
    } catch (error) {
      console.error('Error loading courier feedback:', error);
    }
  };

  // Fetch orders from Supabase with customer and courier details
  const fetchOrders = async (customerId) => {
    try {
      console.log('Fetching orders for customer:', customerId);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers:customer_id (
            full_name,
            email,
            phone,
            profile_image
          ),
          couriers:courier_id (
            full_name,
            phone,
            vehicle_type,
            vehicle_brand,
            vehicle_model,
            plate_number,
            profile_image
          ),
          order_status_history (
            status,
            courier_status,
            notes,
            created_at
          ),
          order_remarks (
            id,
            remark,
            created_at,
            created_by,
            recipient_user_type
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched orders with details:', data);

      const formattedOrders = data.map(order => convertDbOrderToFrontend(order));
      setOrders(formattedOrders);

      // Load both customer remarks and courier feedback
      await loadCustomerRemarks(data);
      await loadCourierFeedback(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Load customer remarks for all orders (FROM customer TO courier)
  const loadCustomerRemarks = async (ordersData) => {
    try {
      const customerRemarksObj = {};

      // Get all order IDs
      const orderIds = ordersData.map(order => order.id);

      if (orderIds.length > 0) {
        const { data, error } = await supabase
          .from('order_remarks')
          .select('order_id, remark, created_by, recipient_user_type, created_at')
          .in('order_id', orderIds)
          .eq('recipient_user_type', 'courier') // Feedback FROM customer TO courier
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Only take the latest remark for each order
        data.forEach(item => {
          if (!customerRemarksObj[item.order_id]) {
            customerRemarksObj[item.order_id] = item.remark;
          }
        });
      }

      setCustomerRemarks(customerRemarksObj);
    } catch (error) {
      console.error('Error loading customer remarks:', error);
    }
  };

  // Setup real-time subscription for order updates
  const setupRealtimeSubscription = (customerId) => {
    const subscription = supabase
      .channel(`customer-orders-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${customerId}`
        },
        (payload) => {
          console.log('Order change received:', payload);
          fetchOrders(customerId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_status_history',
          filter: `order_id=in.(${orders.map(o => o.id).join(',')})`
        },
        (payload) => {
          console.log('Status history update:', payload);
          fetchOrders(customerId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_remarks',
          filter: `order_id=in.(${orders.map(o => o.id).join(',')})`
        },
        async (payload) => {
          console.log('Remark update received:', payload);
          await fetchOrders(customerId);
        }
      )
      .subscribe();

    setRealTimeSubscription(subscription);
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
    return currentUser.full_name.split(' ')[0];
  };

  // Dynamic status options based on active tab
  const getStatusOptions = () => {
    if (activeTab === 'current' || activeTab === 'book') {
      return ['All', 'Pending', 'Accepted', 'In Progress'];
    } else if (activeTab === 'history') {
      return ['All', 'Completed', 'Cancelled'];
    }
    return ['All'];
  };

  // Function to format date display based on tab
  const formatDateDisplay = (order, tab) => {
    if (order.book_for_delivery && order.delivery_date && order.delivery_time) {
      const deliveryDate = new Date(order.delivery_date);
      return `Book: ${deliveryDate.toLocaleDateString()} ${order.delivery_time}`;
    } else {
      const createdDate = new Date(order.created_at);
      if (tab === 'current') {
        return `Today: ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return createdDate.toLocaleString();
    }
  };

  // Convert database order to frontend format
  const convertDbOrderToFrontend = (dbOrder) => {
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'in_progress': 'In Progress',
      'picked_up': 'In Progress',
      'on_the_way': 'In Progress',
      'arrived': 'In Progress',
      'delivered': 'Completed',
      'cancelled': 'Cancelled'
    };

    const deliveryStatusMap = {
      'pending': 'pending',
      'accepted': 'accepted',
      'in_progress': 'on_the_way',
      'picked_up': 'picked_up',
      'on_the_way': 'on_the_way',
      'arrived': 'arrived',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    const status = statusMap[dbOrder.status] || 'Pending';
    const deliveryStatus = deliveryStatusMap[dbOrder.status] || 'pending';

    const customerName = dbOrder.customers?.full_name || 'Customer';
    const customerEmail = dbOrder.customers?.email || '';
    const customerPhone = dbOrder.customers?.phone || '';
    const customerProfileImage = dbOrder.customers?.profile_image || '';

    const courierInfo = dbOrder.courier_id && dbOrder.couriers ? {
      name: dbOrder.couriers.full_name,
      phone: dbOrder.couriers.phone,
      vehicle: `${dbOrder.couriers.vehicle_type} ${dbOrder.couriers.vehicle_brand} ${dbOrder.couriers.vehicle_model}`,
      plateNumber: dbOrder.couriers.plate_number,
      profileImage: dbOrder.couriers.profile_image,
      completedDeliveries: 127
    } : null;

    const timeline = generateTimeline(dbOrder);

    // Calculate actual fare breakdown if available, otherwise use stored data
    let fareBreakdown = dbOrder.fare_breakdown;
    if (!fareBreakdown && dbOrder.estimated_distance && dbOrder.selected_vehicle) {
      const calculatedFare = calculateFare(
        dbOrder.selected_vehicle,
        dbOrder.estimated_distance,
        dbOrder.estimated_duration || 15,
        dbOrder.is_rush_delivery
      );
      fareBreakdown = calculatedFare.breakdown;
    }

    return {
      id: dbOrder.id,
      orderNumber: `ORD-${dbOrder.id.toString().slice(-8).toUpperCase()}`,
      pickupLocation: dbOrder.pickup_location,
      deliveryLocation: dbOrder.delivery_location,
      item: dbOrder.delivery_item,
      category: dbOrder.selected_category,
      description: dbOrder.description,
      payment: `₱${dbOrder.total_amount?.toFixed(2) || '0.00'} ${dbOrder.payment_method === 'GCash' ? 'GCash' : 'COD'}`,
      vehicleType: dbOrder.selected_vehicle,
      date: formatDateDisplay(dbOrder, activeTab),
      status: status,
      deliveryStatus: deliveryStatus,
      serviceType: dbOrder.selected_service,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      customerProfileImage: customerProfileImage,
      distance: dbOrder.estimated_distance || '3.2 km',
      estimatedTime: dbOrder.estimated_duration ? `${dbOrder.estimated_duration} mins` : '15-20 mins',
      items: [
        { name: dbOrder.delivery_item, quantity: 1, price: dbOrder.vehicle_price || 0 },
        ...(dbOrder.rush_amount > 0 ? [{ name: 'Rush Delivery Fee', quantity: 1, price: dbOrder.rush_amount }] : [])
      ],
      paymentMethod: dbOrder.payment_method,
      totalAmount: dbOrder.total_amount || 0,
      images: dbOrder.uploaded_photos || [],
      courierInfo: courierInfo,
      timeline: timeline,
      book_for_delivery: dbOrder.book_for_delivery,
      delivery_date: dbOrder.delivery_date,
      delivery_time: dbOrder.delivery_time,
      created_at: dbOrder.created_at,
      supabaseData: dbOrder,
      fare_breakdown: fareBreakdown,
      is_rush_delivery: dbOrder.is_rush_delivery,
      rush_amount: dbOrder.rush_amount || 0,
      estimated_distance: dbOrder.estimated_distance,
      estimated_duration: dbOrder.estimated_duration
    };
  };

  const generateTimeline = (order) => {
    const timeline = [];

    timeline.push({
      status: 'pending',
      timestamp: new Date(order.created_at).getTime(),
      description: 'Order received',
      time: new Date(order.created_at).toLocaleTimeString()
    });

    if (order.order_status_history && order.order_status_history.length > 0) {
      order.order_status_history.forEach(history => {
        const status = history.courier_status || history.status;
        if (status && status !== 'pending') {
          timeline.push({
            status: status,
            timestamp: new Date(history.created_at).getTime(),
            description: history.notes || `Status updated to ${status}`,
            time: new Date(history.created_at).toLocaleTimeString()
          });
        }
      });
    }

    return timeline.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Save customer remarks (FROM customer TO courier)
  const saveCustomerRemarks = async () => {
    if (selectedOrderId && currentOrderRemark.trim()) {
      try {
        if (!currentUser?.id) {
          alert('Please login again');
          return;
        }

        // Check if remark already exists - if so, update it; otherwise insert new
        if (customerRemarks[selectedOrderId]) {
          // Update existing remark
          const { data, error } = await supabase
            .from('order_remarks')
            .update({
              remark: currentOrderRemark,
              updated_at: new Date().toISOString()
            })
            .eq('order_id', selectedOrderId)
            .eq('created_by', currentUser.id)
            .eq('recipient_user_type', 'courier')
            .select()
            .single();

          if (error) throw error;
        } else {
          // Insert new remark
          const { data, error } = await supabase
            .from('order_remarks')
            .insert({
              order_id: selectedOrderId,
              remark: currentOrderRemark,
              created_by: currentUser.id,
              recipient_user_type: 'courier',
              remark_type: 'feedback',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
        }

        // Update local state
        setCustomerRemarks(prev => ({
          ...prev,
          [selectedOrderId]: currentOrderRemark
        }));

        // Send notification to courier about customer feedback
        try {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order && order.supabaseData && order.supabaseData.courier_id) {
            await notificationService.notifyCustomerFeedback(
              selectedOrderId,
              currentUser.full_name || 'Customer',
              currentOrderRemark,
              order.supabaseData.courier_id
            );
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }

        setShowRemarksModal(false);
        setCurrentOrderRemark('');
        setSelectedOrderId(null);
        setSelectedOrderForRemarks(null);

        alert(customerRemarks[selectedOrderId]
          ? 'Feedback updated successfully! The courier has been notified.'
          : 'Thank you for your feedback! The courier has been notified.'
        );
      } catch (err) {
        console.error('Error saving customer remarks:', err);
        alert('Error saving feedback. Please try again.');
      }
    } else {
      alert('Please enter your feedback before submitting.');
    }
  };

  // Open remarks modal for history orders
  const openRemarksModal = (order, existingRemark = '') => {
    setSelectedOrderId(order.id);
    setSelectedOrderForRemarks(order);
    setCurrentOrderRemark(existingRemark || '');
    setShowRemarksModal(true);
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const openPaymentBreakdown = (order) => {
    setSelectedOrder(order);
    setShowPaymentBreakdownModal(true);
  };

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  // Get status display text
  const getStatusDisplay = (deliveryStatus) => {
    const statusMap = {
      'pending': 'Pending Acceptance',
      'accepted': 'Courier Assigned',
      'picked_up': 'Package Picked Up',
      'on_the_way': 'On The Way',
      'arrived': 'Courier Arrived',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'completed': 'Completed'
    };
    return statusMap[deliveryStatus] || deliveryStatus;
  };

  // Timeline rendering function for customer view
  const renderTimeline = (order) => {
    const statusOrder = ['pending', 'accepted', 'picked_up', 'on_the_way', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.deliveryStatus);

    return (
      <div className="delivery-timeline-horizontal">
        {statusOrder.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const timelineEvent = order.timeline?.find(event => event.status === status);

          return (
            <div key={status} className={`timeline-step-horizontal ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="timeline-marker-horizontal">
                {isCompleted ? <CheckCircle size={16} /> : <div className="pending-marker-horizontal" />}
              </div>
              <div className="timeline-content-horizontal">
                <span className="timeline-status-horizontal">{getStatusDisplay(status)}</span>
                {timelineEvent && (
                  <span className="timeline-time-horizontal">{timelineEvent.time}</span>
                )}
              </div>
              {index < statusOrder.length - 1 && (
                <div className={`timeline-connector-horizontal ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Function to handle calling courier
  const handleCallCourier = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  // Function to handle messaging courier
  const handleMessageCourier = (phoneNumber) => {
    window.open(`sms:${phoneNumber}`, '_self');
  };

  // Calculate fare breakdown based on actual fare calculation
  const calculateFareBreakdown = (order) => {
    if (!order) return [];

    // If we have stored fare breakdown, use it
    if (order.fare_breakdown) {
      const breakdown = [];

      if (order.fare_breakdown.baseFare > 0) {
        breakdown.push({
          description: 'Base Fare',
          amount: order.fare_breakdown.baseFare,
          icon: <DollarSign size={16} />
        });
      }

      if (order.fare_breakdown.distanceCost > 0) {
        breakdown.push({
          description: `Distance (${order.distance || '0 km'})`,
          amount: order.fare_breakdown.distanceCost,
          icon: <MapPin size={16} />
        });
      }

      if (order.fare_breakdown.timeCost > 0) {
        breakdown.push({
          description: `Time (${order.estimatedTime || '0 mins'})`,
          amount: order.fare_breakdown.timeCost,
          icon: <Clock size={16} />
        });
      }

      if (order.fare_breakdown.rushBonus > 0) {
        breakdown.push({
          description: 'Rush Delivery Bonus',
          amount: order.fare_breakdown.rushBonus,
          icon: <Zap size={16} />
        });
      }

      if (order.fare_breakdown.platformFee > 0) {
        breakdown.push({
          description: 'Platform Service Fee',
          amount: order.fare_breakdown.platformFee,
          icon: <Percent size={16} />
        });
      }

      return breakdown;
    }

    // Fallback to basic calculation if no stored breakdown
    const baseFare = 40.00;
    const distanceRate = parseFloat(order.distance || 5) * 8.00;
    const serviceFee = 30.00;
    const itemsTotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    return [
      { description: 'Base Fare', amount: baseFare, icon: <DollarSign size={16} /> },
      { description: `Distance (${order.distance || '5 km'})`, amount: distanceRate, icon: <MapPin size={16} /> },
      { description: 'Service Fee', amount: serviceFee, icon: <Percent size={16} /> },
      { description: 'Items Total', amount: itemsTotal, icon: <Package size={16} /> },
    ];
  };

  if (loading || fareLoading) {
    return (
      <div className="customer-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const statusOptions = getStatusOptions();

  // Filter orders based on active filters
  const filteredOrders = orders.filter(order => {
    // Skip if order is deleted (unless we're in delete filter)
    if (activeFavoriteFilter !== 'Delete' && deletedOrders.includes(order.id)) {
      return false;
    }

    // Tab filter
    if (activeTab === 'current') {
      // Current deliveries: not completed/cancelled, not booked
      if (order.status === 'Completed' || order.status === 'Cancelled' || order.book_for_delivery) return false;
    } else if (activeTab === 'book') {
      // Booked deliveries
      if (!order.book_for_delivery) return false;
    } else if (activeTab === 'history') {
      // History: completed or cancelled
      if (order.status !== 'Completed' && order.status !== 'Cancelled') return false;
    }

    // Favorite filter
    if (activeFavoriteFilter === 'Favourite' && !favorites.includes(order.id)) return false;
    if (activeFavoriteFilter === 'Delete' && !deletedOrders.includes(order.id)) return false;

    // Delivery timing filter
    if (activeDeliveryTiming === 'Book' && !order.book_for_delivery) return false;
    if (activeDeliveryTiming === 'Current' && order.book_for_delivery) return false;

    // Service filter
    if (activeService !== 'All' && order.serviceType !== activeService) return false;

    // Status filter
    if (activeStatus !== 'All' && order.status !== activeStatus) return false;

    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const searchableFields = [
        order.orderNumber,
        order.item,
        order.pickupLocation,
        order.deliveryLocation,
        order.customerName,
        order.serviceType,
        order.vehicleType,
        order.status
      ];
      if (!searchableFields.some(field => field && field.toLowerCase().includes(searchLower))) return false;
    }

    return true;
  });

  // Sort orders: favorites first, then by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.id);
    const bIsFavorite = favorites.includes(b.id);

    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;

    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Reusable Header Component with Notification
  const Header = () => (
    <div className="customer-header">
      <div className="header-logo">
        <img src={logo} alt="Pickarry Logo" className="w-19 h-12" />
      </div>
      <div className="header-right">
        <NotificationDropdown userType="customer" />
        <div className="customer-profile">
          <div className="profile-avatar">
            {currentUser?.profile_image ? (
              <img
                src={currentUser.profile_image}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span>{getUserInitials()}</span>
            )}
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">Log Out</button>
      </div>
    </div>
  );

  // Reusable Sidebar Component
  const Sidebar = () => (
    <div className="customer-sidebar">
      <div className="customer-profile-card">
        <div className="profile-avatar-large">
          {currentUser?.profile_image ? (
            <img
              src={currentUser.profile_image}
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
          {currentUser?.phone && <p className="profile-phone">{currentUser.phone}</p>}
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
          className="nav-item active"
        >
          <ShoppingCart className="nav-icon w-6 h-6" />
          <span>Delivery</span>
        </button>
        <button
          onClick={() => navigate('/customer/menu')}
          className="nav-item"
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

  return (
    <div className="customer-home">
      <Header />

      <div className="customer-content">
        <Sidebar />

        {/* MAIN CONTENT */}
        <div className="orders-main-content">
          {/* TABS */}
          <div className="orders-tabs">
            {['current', 'book', 'history'].map(tab => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveStatus('All');
                  setActiveFavoriteFilter('All');
                  setActiveDeliveryTiming('All');
                }}
              >
                {tab === 'current' ? 'Current Delivery' :
                  tab === 'history' ? 'Order History' : 'Booked Delivery'}
              </button>
            ))}
          </div>

          {/* SERVICE FILTERS */}
          <div className="delivery-filters">
            {['All', 'Pasundo', 'Pasugo'].map(option => (
              <button
                key={option}
                className={`delivery-filter-btn ${activeService === option ? 'active' : ''}`}
                onClick={() => setActiveService(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {/* SEARCH + DROPDOWNS */}
          <div className="orders-toolbar">
            <div className="orders-toolbar-left">
              <div className="search-input-container">
                <Search className="search-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="orders-toolbar-right">
              {/* Favorite Filter Dropdown (Only for History Tab) */}
              {activeTab === 'history' && (
                <div className="dropdown">
                  <button className="dropdown-button" onClick={() => {
                    setShowFavoriteFilterDropdown(!showFavoriteFilterDropdown);
                    setShowFilterDropdown(false);
                    setShowDeliveryTimingDropdown(false);
                  }}>
                    {activeFavoriteFilter} <ChevronDown className="w-4 h-4" />
                  </button>
                  {showFavoriteFilterDropdown && (
                    <div className="dropdown-menu">
                      {['All', 'Favourite', 'Delete'].map(option => (
                        <div
                          key={option}
                          className={`dropdown-item ${activeFavoriteFilter === option ? 'selected' : ''}`}
                          onClick={() => {
                            setActiveFavoriteFilter(option);
                            setShowFavoriteFilterDropdown(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Timing Filter Dropdown */}
              <div className="dropdown">
                <button className="dropdown-button" onClick={() => {
                  setShowDeliveryTimingDropdown(!showDeliveryTimingDropdown);
                  setShowFilterDropdown(false);
                  setShowFavoriteFilterDropdown(false);
                }}>
                  {activeDeliveryTiming === 'All' ? 'All Delivery' : activeDeliveryTiming} <ChevronDown className="w-4 h-4" />
                </button>
                {showDeliveryTimingDropdown && (
                  <div className="dropdown-menu">
                    {['All', 'Book', 'Current'].map(option => (
                      <div
                        key={option}
                        className={`dropdown-item ${activeDeliveryTiming === option ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveDeliveryTiming(option);
                          setShowDeliveryTimingDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter Dropdown (Dynamic) */}
              <div className="dropdown">
                <button className="dropdown-button" onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowFavoriteFilterDropdown(false);
                  setShowDeliveryTimingDropdown(false);
                }}>
                  {activeStatus} <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="dropdown-menu">
                    {statusOptions.map(option => (
                      <div
                        key={option}
                        className={`dropdown-item ${activeStatus === option ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveStatus(option);
                          setShowFilterDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ORDERS LIST */}
          <div className="orders-list">
            {sortedOrders.length === 0 ? (
              activeTab === 'history' ? (
                <div className="no-orders-container">
                  {activeFavoriteFilter === 'Delete' ? (
                    <>
                      <Trash2 size={48} className="no-orders-icon" />
                      <h2 className="no-orders-title">No Deleted Orders</h2>
                      <p className="no-orders-text">
                        You haven't deleted any orders yet. Deleted orders will appear here.
                      </p>
                    </>
                  ) : activeFavoriteFilter === 'Favourite' ? (
                    <>
                      <Heart size={48} className="no-orders-icon" />
                      <h2 className="no-orders-title">No Favorite Orders</h2>
                      <p className="no-orders-text">
                        You haven't marked any orders as favorites yet. Click the heart icon to add orders to favorites.
                      </p>
                    </>
                  ) : (
                    <>
                      <Package size={48} className="no-orders-icon" />
                      <h2 className="no-orders-title">No Order History Yet</h2>
                      <p className="no-orders-text">
                        You haven't placed any orders yet. Start your first delivery with Pickarry today!
                      </p>
                      <div className="no-orders-actions">
                        <button
                          className="no-orders-button"
                          onClick={() => navigate('/customer/home')}
                        >
                          🏠 Start Ordering
                        </button>
                        <button
                          className="no-orders-button secondary"
                          onClick={() => navigate('/customer/menu')}
                        >
                          📋 Browse Services
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="no-orders-container">
                  <Package size={48} className="no-orders-icon" />
                  <h2 className="no-orders-title">No {activeTab === 'current' ? 'Current' : 'Booked'} Orders</h2>
                  <p className="no-orders-text">
                    {activeTab === 'current'
                      ? "You don't have any active deliveries right now."
                      : "You don't have any booked deliveries scheduled."}
                  </p>
                </div>
              )
            ) : (
              sortedOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-pickup">
                      <MapPin className="w-5 h-5" />
                      <span>{order.pickupLocation}</span>
                    </div>
                    {activeTab === 'history' && (
                      <div className="order-actions">
                        {/* Favorite Button */}
                        <button
                          className={`action-button favorite ${favorites.includes(order.id) ? 'active' : ''}`}
                          onClick={() => toggleFavorite(order.id)}
                          title={favorites.includes(order.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className="w-5 h-5"
                            fill={favorites.includes(order.id) ? 'currentColor' : 'none'}
                          />
                        </button>

                        {/* Delete/Restore Button */}
                        {activeFavoriteFilter === 'Delete' ? (
                          <button
                            className="action-button restore"
                            onClick={() => restoreOrder(order.id)}
                            title="Restore order"
                          >
                            <Undo2 className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            className="action-button delete"
                            onClick={() => handleDeleteOrder(order.id)}
                            title={activeFavoriteFilter === 'Delete' ? 'Permanently delete' : 'Move to deleted'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
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
                      <span className="detail-right detail-right-time">{order.date}</span>
                    </div>

                    <div className="order-detail">
                      <Truck className="detail-icon w-4 h-4" />
                      <span>{order.vehicleType}</span>
                      <span className="detail-right detail-right-payment">
                        {order.paymentMethod === 'GCash' ? 'GCash' : 'COD'}: ₱{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="order-detail">
                      <Clock className="detail-icon w-4 h-4" />
                      <span>Delivery Status</span>
                      <span className={`detail-right detail-right-status status-text status-${order.deliveryStatus}`}>
                        {getStatusDisplay(order.deliveryStatus)}
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

                    <div className='current-order-actions'>
                      {/* Track Delivery Button */}
                      {(activeTab === 'current' || activeTab === 'book') &&
                        order.status !== 'Completed' &&
                        order.status !== 'Cancelled' &&
                        order.deliveryStatus !== 'pending' && (
                          <button
                            className="track-delivery-button"
                            onClick={() => {
                              setShowOrderDetailsModal(false);
                              openTrackingModal(order);
                            }}
                          >
                            <TruckIcon size={16} />
                            <span>Track Delivery</span>
                          </button>
                        )}

                      {/* Customer Feedback Button (FROM customer TO courier) */}
                      {activeTab === 'history' && activeFavoriteFilter !== 'Delete' && (
                        <button
                          className={`remarks-button ${customerRemarks[order.id] ? 'has-remarks' : ''}`}
                          onClick={() => openRemarksModal(order, customerRemarks[order.id])}
                        >
                          <MessageCircle size={16} />
                          <span>{customerRemarks[order.id] ? 'View/Edit Feedback' : 'Add Feedback'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Favorite Badge */}
                  {favorites.includes(order.id) && activeFavoriteFilter !== 'Delete' && (
                    <div className="favorite-badge">
                      <Star size={12} fill="currentColor" />
                      <span>Favorite</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetailsModal(false)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={() => setShowOrderDetailsModal(false)}>
                <X size={24} />
              </button>
              <h2>Order Details</h2>
            </div>

            <div className="modal-bodys order-details-body">
              {/* Order Images Section */}
              <div className="order-images-section">
                <h3>Order Items</h3>
                <div className="order-images-grid">
                  {selectedOrder.images && selectedOrder.images.length > 0 ? (
                    selectedOrder.images.map((imageUrl, index) => (
                      <div key={index} className="order-image-item">
                        <div className="order-image-placeholder">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`Item ${index + 1}`}
                              className="order-image"
                              onError={(e) => {
                                console.error('Failed to load image:', imageUrl);
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.image-placeholder-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                              onLoad={(e) => {
                                const fallback = e.target.parentElement.querySelector('.image-placeholder-fallback');
                                if (fallback) fallback.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div className="image-placeholder-fallback" style={{ display: imageUrl ? 'none' : 'flex' }}>
                            <Package className="image-placeholder-icon" size={32} />
                            <span className="image-label">Item {index + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`empty-${index}`} className="order-image-item">
                        <div className="order-image-placeholder empty">
                          <Package className="image-placeholder-icon" size={32} />
                          <span className="image-label">Item {index + 1}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Information */}
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
                  <div className="info-item">
                    <Package className="info-icon" />
                    <div>
                      <label>Category</label>
                      <p>{selectedOrder.category}</p>
                    </div>
                  </div>
                  <div className="info-item full-width">
                    <MessageSquare className="info-icon" />
                    <div>
                      <label>Description</label>
                      <p>{selectedOrder.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="service-info-section">
                <h3>Service Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Truck className="info-icon" />
                    <div>
                      <label>Service Type</label>
                      <p className="service-type">{selectedOrder.serviceType}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Clock className="info-icon" />
                    <div>
                      <label>Delivery Type</label>
                      <p>{selectedOrder.book_for_delivery ? 'Booked Delivery' : 'Current Delivery'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Information Section */}
              {selectedOrder.courierInfo && (
                <div className="courier-info-section">
                  <h3>Courier Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <User className="info-icon" />
                      <div>
                        <label>Courier Name</label>
                        <p>{selectedOrder.courierInfo.name}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <Phone className="info-icon" />
                      <div>
                        <label>Courier Phone</label>
                        <p>{selectedOrder.courierInfo.phone}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <Truck className="info-icon" />
                      <div>
                        <label>Vehicle</label>
                        <p>{selectedOrder.courierInfo.vehicle}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <FileText className="info-icon" />
                      <div>
                        <label>Plate Number</label>
                        <p>{selectedOrder.courierInfo.plateNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="payment-info-section">
                <h3>Payment Information</h3>
                <div className="payment-summary">
                  <div className="payment-method">
                    {selectedOrder.paymentMethod === 'GCash' ? (
                      <Smartphone className="info-icon" />
                    ) : (
                      <CreditCard className="info-icon" />
                    )}
                    <div>
                      <label>Payment Method</label>
                      <p>{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="total-amount">
                    <div>
                      <label>Total Amount</label>
                      <p className="amount">₱{selectedOrder.totalAmount.toFixed(2)}</p>
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

              {/* Order Status */}
              <div className="status-section">
                <h3>Order Status</h3>
                <div className="delivery-status-info">
                  <div className={`status-badge status-${selectedOrder.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedOrder.status}
                  </div>
                  <p className="delivery-status-detail">
                    Current Delivery Status: <strong>{getStatusDisplay(selectedOrder.deliveryStatus)}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  className="close-details-button"
                  onClick={() => setShowOrderDetailsModal(false)}
                >
                  Close
                </button>

                {/* Customer Feedback Button (FROM customer TO courier) */}
                {activeTab === 'history' && (
                  <button
                    className={`remarks-button ${customerRemarks[selectedOrder.id] ? 'has-remarks' : ''}`}
                    onClick={() => {
                      setShowOrderDetailsModal(false);
                      openRemarksModal(selectedOrder, customerRemarks[selectedOrder.id]);
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>{customerRemarks[selectedOrder.id] ? 'View/Edit Feedback' : 'Add Feedback'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT BREAKDOWN MODAL - UPDATED WITH FARE MANAGEMENT */}
      {showPaymentBreakdownModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowPaymentBreakdownModal(false)}>
          <div className="payment-breakdown-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={() => setShowPaymentBreakdownModal(false)}>
                <X size={24} />
              </button>
              <h2>Payment Breakdown</h2>
            </div>

            <div className="modal-bodys">
              <div className="breakdown-header">
                <h3 className="order-number">Order #{selectedOrder.orderNumber}</h3>
                <p className="breakdown-subtitle">Dynamic Fare Computation</p>
              </div>

              {/* Payment Breakdown Items */}
              <div className="breakdown-items">
                {calculateFareBreakdown(selectedOrder).map((item, index) => (
                  <div key={index} className="breakdown-item">
                    <div className="breakdown-item-header">
                      {item.icon}
                      <span className="breakdown-description">{item.description}</span>
                    </div>
                    <span className="breakdown-amount">₱{item.amount.toFixed(2)}</span>
                  </div>
                ))}

                {/* Rush Delivery Notice */}
                {selectedOrder.is_rush_delivery && selectedOrder.rush_amount > 0 && (
                  <div className="rush-delivery-notice">
                    <Zap size={16} className="rush-icon" />
                    <span>Rush Delivery Service Applied</span>
                  </div>
                )}

                {/* Total Amount with Download Button */}
                <div className="breakdown-total-container">
                  <div className="breakdown-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-amount">₱{selectedOrder.totalAmount.toFixed(2)}</span>
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

              {/* Fare Explanation */}
              <div className="fare-explanation">
                <h4>Fare Computation Explained:</h4>
                <ul className="explanation-list">
                  <li><strong>Base Fare:</strong> Fixed starting fee based on vehicle type</li>
                  <li><strong>Distance Rate:</strong> Calculated per kilometer based on actual route</li>
                  <li><strong>Time Cost:</strong> Based on estimated delivery time</li>
                  <li><strong>Platform Fee:</strong> Service charge for platform maintenance</li>
                  {selectedOrder.is_rush_delivery && (
                    <li><strong>Rush Bonus:</strong> Additional fee for priority service</li>
                  )}
                </ul>
                {fareConfig && (
                  <div className="fare-config-info">
                    <p><strong>Current Rates:</strong></p>
                    <div className="rate-details">
                      <span>Time Rate: ₱{fareConfig.time_rate_per_minute}/min</span>
                      <span>Platform Fee: {fareConfig.platform_commission}%</span>
                      {selectedOrder.is_rush_delivery && (
                        <span>Rush Bonus: ₱{fareConfig.bonus_rate}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY TRACKING MODAL */}
      {showTrackingModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowTrackingModal(false)}>
          <div className="delivery-tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={() => setShowTrackingModal(false)}>
                <X size={24} />
              </button>
              <h2>Track Your Delivery</h2>
            </div>

            <div className="tracking-body">
              {/* Order Info Header */}
              <div className="tracking-header">
                <p className="order-number">Order #{selectedOrder.orderNumber}</p>
                <p className="order-items">{selectedOrder.item}</p>
                <p className="delivery-type">
                  {selectedOrder.book_for_delivery ? 'Booked Delivery' : 'Current Delivery'}
                </p>
              </div>

              {/* Location Info */}
              <div className="location-info">
                <div className="store-info">
                  <MapPin className="location-icon" size={20} />
                  <div className="location-details">
                    <h4>{selectedOrder.pickupLocation}</h4>
                    <p>Pickup Location</p>
                  </div>
                </div>

                <div className="arrow-icon">→</div>

                <div className="customer-info">
                  <MapPin className="location-icon" size={20} />
                  <div className="location-details">
                    <h4>{selectedOrder.deliveryLocation}</h4>
                    <p>Delivery Location</p>
                  </div>
                </div>
              </div>

              {/* Courier Information */}
              {selectedOrder.courierInfo && (
                <div className="courier-info">
                  <div className="courier-header">
                    <h3 className="courier-name">{selectedOrder.courierInfo.name}</h3>
                    <div className="courier-deliveries">
                      {selectedOrder.courierInfo.completedDeliveries} deliveries
                    </div>
                  </div>
                  <div className="courier-details">
                    <div className="vehicle-info">
                      <Truck className="vehicle-icon" size={16} />
                      <span>{selectedOrder.courierInfo.vehicle} - {selectedOrder.courierInfo.plateNumber}</span>
                    </div>
                    <div className="phone-info">
                      <Phone className="phone-icon" size={16} />
                      <span>{selectedOrder.courierInfo.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Progress */}
              <div className="delivery-progress">
                <h3 className="progress-header">Delivery Progress</h3>
                {renderTimeline(selectedOrder)}
              </div>

              {/* Estimated Arrival */}
              <div className="estimated-arrival">
                <p>Estimated Arrival: {selectedOrder.estimatedTime}</p>
                {selectedOrder.book_for_delivery && selectedOrder.delivery_date && (
                  <p className="scheduled-date">
                    Scheduled for: {new Date(selectedOrder.delivery_date).toLocaleDateString()} at {selectedOrder.delivery_time}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="tracking-actions">
                {selectedOrder.courierInfo && (
                  <>
                    <button
                      className="action-button-primary"
                      onClick={() => handleCallCourier(selectedOrder.courierInfo.phone)}
                    >
                      <Phone size={18} />
                      <span>CALL COURIER</span>
                    </button>
                    <button
                      className="action-button-secondary"
                      onClick={() => handleMessageCourier(selectedOrder.courierInfo.phone)}
                    >
                      <MessageSquare size={18} />
                      <span>MESSAGE</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD REMARKS MODAL (for Order History) - NOW INCLUDES BOTH FEEDBACKS */}
      {showRemarksModal && selectedOrderForRemarks && (
        <div className="modal-overlay" onClick={() => setShowRemarksModal(false)}>
          <div className="remarks-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={() => setShowRemarksModal(false)}>
                <X size={24} />
              </button>
              <h2>
                {customerRemarks[selectedOrderId] ? 'View/Edit Your Feedback' : 'Add Feedback for Courier'}
              </h2>
            </div>
            <div className="modal-bodys">
              <div className="order-info">
                <p className="order-id">Order ID: {selectedOrderForRemarks.orderNumber}</p>
                {selectedOrderForRemarks.courierInfo && (
                  <p className="courier-name">Courier: {selectedOrderForRemarks.courierInfo.name}</p>
                )}
              </div>

              {/* Courier's Feedback Section (FROM courier TO customer) */}
              {courierFeedback[selectedOrderId] && (
                <div className="courier-feedback-section">
                  <h3>Courier's Feedback to You</h3>
                  <div className="feedback-display">
                    <div className="feedback-header">
                      <User className="feedback-icon" size={16} />
                      <span className="feedback-source">From Courier</span>
                    </div>
                    <div className="feedback-text-container">
                      <p className="feedback-text-full">
                        {courierFeedback[selectedOrderId]}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer's Feedback Section (FROM customer TO courier) */}
              <div className="customer-feedback-section">
                <h3>Your Feedback to Courier</h3>
                <textarea
                  value={currentOrderRemark}
                  onChange={(e) => setCurrentOrderRemark(e.target.value)}
                  placeholder="How was your experience with the courier? Were they punctual, professional, and careful with your items? Any suggestions for improvement?"
                  className="remarks-textarea"
                  rows={6}
                  maxLength={500}
                />
                <p className="character-count">{currentOrderRemark.length} / 500 characters</p>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowRemarksModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="save-button"
                  onClick={saveCustomerRemarks}
                  disabled={!currentOrderRemark.trim()}
                >
                  {customerRemarks[selectedOrderId] ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );

  // Helper functions (receipt download, etc.)
  async function downloadReceipt(order) {
    try {
      const downloadButton = document.querySelector('.download-receipt-button-total');
      if (downloadButton) {
        downloadButton.innerHTML = '<span>Generating PDF...</span>';
        downloadButton.disabled = true;
      }

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

      receiptDiv.innerHTML = generateReceiptHTML(order);
      document.body.appendChild(receiptDiv);

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: true
      });

      document.body.removeChild(receiptDiv);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      pdf.save(`Pickarry-Receipt-${order.orderNumber}.pdf`);

      if (downloadButton) {
        downloadButton.innerHTML = '<Download size={18} /><span>Download</span>';
        downloadButton.disabled = false;
      }

    } catch (error) {
      console.error('Error generating PDF receipt:', error);
      const downloadButton = document.querySelector('.download-receipt-button-total');
      if (downloadButton) {
        downloadButton.innerHTML = '<Download size={18} /><span>Download</span>';
        downloadButton.disabled = false;
      }

      try {
        const textReceipt = generateTextReceipt(order);
        downloadTextReceipt(textReceipt, order.orderNumber);
        alert('PDF generation failed. A text receipt has been downloaded instead.');
      } catch (fallbackError) {
        console.error('Fallback receipt generation failed:', fallbackError);
        alert('Error generating receipt. Please try again.');
      }
    }
  }

  function generateReceiptHTML(order) {
    const breakdown = calculateFareBreakdown(order);

    return `
      <div class="receipt-content" style="width: 100%; height: 100%;">
        <!-- Company Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
          <div style="text-align: left;">
            <img src="${logo}" alt="Pickarry Logo" style="width: 60px; height: auto; margin-bottom: 10px;" />
            <h2 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">Pickarry Delivery</h2>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Dynamic Fare Receipt</p>
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
            ${order.courierInfo ? `
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="font-weight: bold; color: #333;">Courier:</span>
              <span style="color: #000; text-align: right;">${order.courierInfo.name}</span>
            </div>
            ` : ''}
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
              <span style="color: #000;">₱${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #000; font-size: 16px; font-weight: bold;">Payment Information</h4>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="font-weight: bold; color: #333;">Payment Method:</span>
              <span style="color: #000;">${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'GCash'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="font-weight: bold; color: #333;">Status:</span>
              <span style="color: #000;">${order.status}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 2px solid #000; margin-top: 20px; color: #666; font-size: 12px;">
          <p style="margin: 5px 0; font-style: italic;">Thank you for choosing Pickarry!</p>
          <p style="margin: 5px 0;">For inquiries: THE-PICKARRY@GMAIL.COM</p>
          <p style="margin: 5px 0; font-size: 10px;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  function generateTextReceipt(order) {
    const breakdown = calculateFareBreakdown(order);

    return `
PICKARRY DELIVERY RECEIPT
==============================

Order Number: ${order.orderNumber}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

CUSTOMER INFORMATION:
-------------------
Name: ${order.customerName}
Service: ${order.serviceType}
Vehicle: ${order.vehicleType}

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

TOTAL AMOUNT: ₱${order.totalAmount.toFixed(2)}

PAYMENT INFORMATION:
------------------
Method: ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'GCash'}
Status: ${order.status}

Thank you for choosing Pickarry!
For inquiries: THE-PICKARRY@GMAIL.COM
==============================
Generated on: ${new Date().toLocaleString()}
  `.trim();
  }

  function downloadTextReceipt(content, orderNumber) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pickarry-Receipt-${orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default CustomerOrders;