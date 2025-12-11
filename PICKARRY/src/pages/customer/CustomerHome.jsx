import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ChevronDown,
  Navigation,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  CreditCard,
  AlertTriangle,
  Home,
  ShoppingCart,
  Menu,
  User,
  Bell,
  Truck,
  MessageSquare
} from 'lucide-react';
import { clearUserSession, getCurrentUser } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import logo from '../../assets/images/LOGO.png';
import '../../styles/customer-home.css';
import NotificationDropdown from '../../components/NotificationDropdown';
import MapComponent from '../../components/MapComponent';
import AddressAutocomplete from '../../components/AddressAutoComplete';
import { notificationService } from '../../hooks/notificationService';
import OrderRemarksModal from '../../components/OrderRemarksModal';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryItem, setDeliveryItem] = useState('');
  const [selectedService, setSelectedService] = useState('Pasundo');
  const [bookForDelivery, setBookForDelivery] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isRushDelivery, setIsRushDelivery] = useState(false);
  const [rushAmount, setRushAmount] = useState('');
  const [isWaitingForCourier, setIsWaitingForCourier] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  // ENHANCED STATE FOR MAPS AND COORDINATES
  const [pickupCoords, setPickupCoords] = useState(null);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // ENHANCED STATE FOR MAP PINPOINTING
  const [mapMode, setMapMode] = useState('view'); // 'view', 'pickup', 'delivery'
  const [activeLocationField, setActiveLocationField] = useState(null); // 'pickup' or 'delivery'
  const [pendingLocation, setPendingLocation] = useState(null); // Store location before confirmation
  const [showLocationConfirmModal, setShowLocationConfirmModal] = useState(false); // NEW: For custom location confirmation

  // NEW STATE FOR REAL-TIME UPDATES
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [realTimeSubscription, setRealTimeSubscription] = useState(null);
  const [acceptedCourier, setAcceptedCourier] = useState(null);
  const [showRemarksModal, setShowRemarksModal] = useState(false);

  // FARE MANAGEMENT STATE
  const [fareConfig, setFareConfig] = useState(null);
  const [vehicleRates, setVehicleRates] = useState([]);
  const [distanceSettings, setDistanceSettings] = useState([]);
  const [fareLoading, setFareLoading] = useState(true);

  // mobile detection and map state
  const [isMobile, setIsMobile] = useState(false);
  const [isMapOpenMobile, setIsMapOpenMobile] = useState(false);

  // Refs for vehicle carousel
  const vehiclesRef = useRef(null);
  const cardRefs = useRef(new Map());
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  // Fetch user data and fare configuration on component mount
  useEffect(() => {
    fetchUserData();
    fetchFareData();

    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      // Cleanup real-time subscription
      if (realTimeSubscription) {
        realTimeSubscription.unsubscribe();
      }
    };
  }, []);

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
    } catch (err) {
      console.error('Error fetching user data:', err);
      alert('Error loading user data');
    } finally {
      setLoading(false);
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

  // Convert vehicle rates to the format expected by the component
  const vehicles = vehicleRates.map(vehicle => ({
    id: vehicle.vehicle_id,
    type: vehicle.vehicle_type,
    price: vehicle.base_fare, // Base price for display
    icon: vehicle.icon,
    base_fare: vehicle.base_fare,
    distance_rate_per_km: vehicle.distance_rate_per_km
  }));

  const categories = [
    'Person',
    'Documents',
    'School Supplies',
    'Electronics',
    'Clothing',
    'Medicine',
    'Others'
  ];

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

  // ENHANCED: Handle address selection with coordinates
  const handlePickupAddressSelect = (suggestion) => {
    setPickupLocation(suggestion.address);
    setPickupCoords({ lat: suggestion.lat, lng: suggestion.lng });
  };

  const handleDeliveryAddressSelect = (suggestion) => {
    setDeliveryLocation(suggestion.address);
    setDeliveryCoords({ lat: suggestion.lat, lng: suggestion.lng });
  };

  // UPDATED: Handle map location selection with custom modal confirmation
  const handleMapLocationSelect = (address, coordinates) => {
    // Store the pending location for confirmation
    setPendingLocation({
      address,
      coordinates,
      field: activeLocationField
    });

    // Show custom confirmation modal instead of browser confirm
    setShowLocationConfirmModal(true);
  };

  // NEW: Confirm location selection and update the appropriate field
  const confirmLocationSelection = (address, coordinates) => {
    if (activeLocationField === 'pickup') {
      setPickupLocation(address);
      setPickupCoords(coordinates);
      console.log('Pickup location set:', address, coordinates);
    } else if (activeLocationField === 'delivery') {
      setDeliveryLocation(address);
      setDeliveryCoords(coordinates);
      console.log('Delivery location set:', address, coordinates);
    }

    // Reset to view mode after confirmation
    setMapMode('view');
    setActiveLocationField(null);
    setPendingLocation(null);
    setShowLocationConfirmModal(false);

    // Close mobile map if open
    if (isMobile) {
      setIsMapOpenMobile(false);
    }

    // Show success feedback
    if (isMobile) {
      alert(`${activeLocationField === 'pickup' ? 'Pickup' : 'Delivery'} location set successfully!`);
    }
  };

  // NEW: Cancel location selection
  const cancelLocationSelection = () => {
    setPendingLocation(null);
    setShowLocationConfirmModal(false);
    // Stay in pinpointing mode for another selection
  };

  // ENHANCED: Start pinpointing mode for pickup
  const startPickupPinpointing = () => {
    setMapMode('pickup');
    setActiveLocationField('pickup');
    if (isMobile) {
      setIsMapOpenMobile(true);
    }
  };

  // ENHANCED: Start pinpointing mode for delivery
  const startDeliveryPinpointing = () => {
    setMapMode('delivery');
    setActiveLocationField('delivery');
    if (isMobile) {
      setIsMapOpenMobile(true);
    }
  };

  // ENHANCED: Cancel pinpointing
  const cancelPinpointing = () => {
    setMapMode('view');
    setActiveLocationField(null);
    setPendingLocation(null);
    setShowLocationConfirmModal(false);
  };

  // NEW: Clear pending location and stay in pinpointing mode
  const clearPendingLocation = () => {
    setPendingLocation(null);
    setShowLocationConfirmModal(false);
  };

  // Update the estimated distance calculation
  const updateEstimatedDistance = async (distance, duration) => {
    setEstimatedDistance(distance);
    setEstimatedDuration(duration);

    // Update any existing order with distance information
    try {
      if (currentOrderId) {
        await supabase
          .from('orders')
          .update({
            estimated_distance: distance,
            estimated_duration: duration
          })
          .eq('id', currentOrderId);
      }
    } catch (error) {
      console.error('Error updating order with distance:', error);
    }
  };

  // UPDATED: Handle photo upload to Supabase Storage
  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    const totalFiles = uploadedPhotos.length + files.length;

    if (totalFiles > 3) {
      alert('Maximum 3 photos allowed');
      return;
    }

    // If user selects more than allowed, take only what's needed
    const filesToUpload = files.slice(0, 3 - uploadedPhotos.length);

    try {
      setLoading(true);

      // Upload each file to Supabase Storage
      const uploadPromises = filesToUpload.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('Uploading file:', filePath, file);

        const { data, error } = await supabase.storage
          .from('order-images')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error details:', error);
          throw error;
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('order-images')
          .getPublicUrl(filePath);

        console.log('Upload successful, public URL:', publicUrl);

        return {
          file,
          url: publicUrl,
          storagePath: filePath,
          id: Date.now() + Math.random()
        };
      });

      const newPhotos = await Promise.all(uploadPromises);
      setUploadedPhotos(prev => [...prev, ...newPhotos]);

    } catch (err) {
      console.error('Error uploading photos:', err);
      if (err.message?.includes('row-level security policy')) {
        alert('❌ Upload failed due to security policy. Please contact support.');
      } else if (err.message?.includes('JWT')) {
        alert('❌ Authentication error. Please log out and log in again.');
      } else {
        alert('❌ Error uploading photos. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Handle description submit
  const handleDescriptionSubmit = () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    if (uploadedPhotos.length !== 3) {
      alert('Please upload exactly 3 photos');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (rushAmount && parseFloat(rushAmount) <= 0) {
      alert('Please enter a valid rush delivery amount or leave it empty');
      return;
    }

    setDeliveryItem(description);
    setShowDescriptionModal(false);
  };

  const removePhoto = async (photoId) => {
    const photoToRemove = uploadedPhotos.find(p => p.id === photoId);
    if (photoToRemove && photoToRemove.storagePath) {
      try {
        // Remove from Supabase Storage
        const { error } = await supabase.storage
          .from('order-images')
          .remove([photoToRemove.storagePath]);

        if (error) {
          console.error('Error deleting photo from storage:', error);
        }
      } catch (err) {
        console.error('Error cleaning up photo:', err);
      }
    }

    // Remove from local state
    setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // UPDATED: handleOrder with dynamic fare calculation
  const handleOrder = async () => {
    // Check required fields
    const requiredFieldsCheck = !pickupLocation || !deliveryLocation || !deliveryItem || !selectedVehicle || !selectedPayment;
    const timeCheck = bookForDelivery ? (!selectedDate || !selectedTime) : !selectedTime;

    if (requiredFieldsCheck || timeCheck) {
      const missingFields = [];
      if (!pickupLocation) missingFields.push('pickup location');
      if (!deliveryLocation) missingFields.push('delivery location');
      if (!deliveryItem) missingFields.push('delivery item');
      if (!selectedVehicle) missingFields.push('vehicle');
      if (!selectedPayment) missingFields.push('payment method');
      if (timeCheck) {
        if (bookForDelivery && !selectedDate) missingFields.push('delivery date');
        if (!selectedTime) missingFields.push('delivery time');
      }
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Calculate dynamic fare
    const distanceInKm = parseFloat(estimatedDistance) || 5; // Default to 5km if not calculated
    const estimatedTimeInMinutes = parseFloat(estimatedDuration) || 15; // Default to 15min

    const selectedVehicleObj = vehicles.find(v => v.id === selectedVehicle);
    const fareCalculation = calculateFare(
      selectedVehicleObj?.type,
      distanceInKm,
      estimatedTimeInMinutes,
      isRushDelivery,
      0 // wait time
    );

    const totalAmount = fareCalculation.total;

    try {
      setIsWaitingForCourier(true);
      setOrderAccepted(false); // Reset acceptance state
      setAcceptedCourier(null); // Reset courier info

      // Build order data for Supabase with coordinates and fare breakdown
      const orderData = {
        customer_id: currentUser?.id,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        delivery_item: deliveryItem,
        selected_service: selectedService,
        book_for_delivery: bookForDelivery,
        delivery_date: selectedDate || null,
        delivery_time: selectedTime || null,
        selected_vehicle: selectedVehicleObj?.type,
        vehicle_price: totalAmount,
        selected_category: selectedCategory,
        description: description,
        uploaded_photos: uploadedPhotos.map(photo => photo.url),
        is_rush_delivery: isRushDelivery,
        rush_amount: isRushDelivery ? fareCalculation.breakdown.rushBonus : 0,
        payment_method: selectedPayment,
        estimated_distance: distanceInKm,
        estimated_duration: estimatedTimeInMinutes,
        total_amount: totalAmount,
        status: 'pending',
        courier_status: 'waiting',
        // NEW: Add coordinates and fare breakdown to order data
        pickup_coordinates: pickupCoords,
        delivery_coordinates: deliveryCoords,
        fare_breakdown: fareCalculation.breakdown
      };

      console.log('Submitting order data:', orderData);

      // Insert order directly into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Order created successfully:', data);
      setCurrentOrderId(data[0].id);

      // Record in order status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: data[0].id,
          status: 'pending',
          courier_status: 'waiting',
          notes: 'Order created and waiting for courier acceptance',
          created_at: new Date().toISOString()
        });

      if (historyError) {
        console.error('Error creating status history:', historyError);
      }

      alert('✅ Order submitted successfully! Waiting for a courier to accept...');

      try {
        // Notify couriers about new order
        await notificationService.notifyNewOrderToCouriers(data[0].id, {
          serviceType: selectedService,
          pickupLocation: pickupLocation,
          deliveryLocation: deliveryLocation,
          vehicleType: selectedVehicleObj?.type,
          totalAmount: totalAmount,
          distance: estimatedDistance,
          estimatedTime: estimatedDuration
        });

        // Notify customer about order received
        await notificationService.notifyOrderStatusUpdate(data[0].id, 'pending', currentUser.email);

      } catch (error) {
        console.error('Error sending notifications:', error);
      }

      // Start real-time subscription for order updates
      subscribeToOrderUpdates(data[0].id);

    } catch (err) {
      console.error('Order submission error:', err);
      alert('❌ Error submitting order: ' + err.message);
      setIsWaitingForCourier(false);
    }
  };

  // Enhanced Real-time subscription for order updates
  const subscribeToOrderUpdates = (orderId) => {
    // Clean up any existing subscription
    if (realTimeSubscription) {
      realTimeSubscription.unsubscribe();
    }

    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        async (payload) => {
          console.log('Order updated:', payload.new);

          // If courier accepts the order
          if (payload.new.courier_status === 'accepted' || payload.new.status === 'accepted') {
            setOrderAccepted(true);

            // Get courier details for notification
            if (payload.new.courier_id) {
              const { data: courier } = await supabase
                .from('couriers')
                .select('full_name, vehicle_type')
                .eq('id', payload.new.courier_id)
                .single();

              if (courier) {
                setAcceptedCourier(courier);
                // Show success message with courier name
                alert(`🎉 ${courier.full_name} accepted your order! They're on their way with a ${courier.vehicle_type}.`);
              } else {
                alert('🎉 Courier accepted your order! You can now track your delivery.');
              }
            }
          }

          // Handle delivery status updates with notifications
          if (payload.new.status === 'picked_up') {
            alert('📦 Your items have been picked up! The courier is now heading to your delivery location.');
          }

          if (payload.new.status === 'on_the_way') {
            alert('🚚 Your order is on the way! The courier is heading to your location.');

            // Notify customer about being on the way
            if (acceptedCourier) {
              await notificationService.notifyCourierOnTheWay(
                orderId,
                currentUser.id,
                acceptedCourier.full_name,
                '10-15 minutes'
              );
            }
          }

          if (payload.new.status === 'arrived') {
            alert('📍 Your courier has arrived at the delivery location!');
          }

          if (payload.new.status === 'delivered') {
            alert('✅ Your order has been delivered! Thank you for using Pickarry.');

            // Notify customer about delivery completion
            if (acceptedCourier) {
              await notificationService.notifyOrderDelivered(
                orderId,
                currentUser.id,
                acceptedCourier.full_name
              );
            }

            if (realTimeSubscription) {
              realTimeSubscription.unsubscribe();
            }
            setIsWaitingForCourier(false);
          }

          // If order is cancelled or rejected
          if (payload.new.status === 'cancelled' || payload.new.courier_status === 'rejected') {
            subscription.unsubscribe();
            setIsWaitingForCourier(false);
            setOrderAccepted(false);
            setAcceptedCourier(null);
            alert('Order was cancelled or rejected by courier.');
          }
        }
      )
      .subscribe();

    setRealTimeSubscription(subscription);

    // Auto-unsubscribe after 30 minutes (safety measure)
    setTimeout(() => {
      if (!orderAccepted) {
        subscription.unsubscribe();
        setIsWaitingForCourier(false);
        alert('No courier accepted your order within 30 minutes. Please try again.');
      }
    }, 30 * 60 * 1000);

    return subscription;
  };

  // Handle navigation to orders page
  const handleGoToDelivery = () => {
    if (realTimeSubscription) {
      realTimeSubscription.unsubscribe();
    }
    setIsWaitingForCourier(false);
    setOrderAccepted(false);
    setAcceptedCourier(null);
    navigate('/customer/orders');
  };

  const handleCancelOrder = () => {
    if (realTimeSubscription) {
      realTimeSubscription.unsubscribe();
    }
    setIsWaitingForCourier(false);
    setOrderAccepted(false);
    setAcceptedCourier(null);
  };

  const handleTimeSubmit = () => {
    if (bookForDelivery) {
      if (!selectedDate || !selectedTime) {
        alert('Please select both date and time for booking delivery');
        return;
      }
    } else {
      if (!selectedTime) {
        alert('Please select a time for immediate service');
        return;
      }
      if (!selectedDate) setSelectedDate(new Date().toISOString().split('T')[0]);
    }
    setShowTimeModal(false);
  };

  // Updated Vehicle navigation functions
  const nextVehicles = () => {
    if (currentVehicleIndex + 3 < vehicles.length) {
      setCurrentVehicleIndex(prev => prev + 1);
    }
  };

  const prevVehicles = () => {
    if (currentVehicleIndex > 0) {
      setCurrentVehicleIndex(prev => prev - 1);
    }
  };

  // Update the vehicles container to show only visible vehicles
  const getVisibleVehicles = () => {
    return vehicles.slice(currentVehicleIndex, currentVehicleIndex + 3);
  };

  // Vehicle carousel functions
  const centerCard = (vehicleId) => {
    const container = vehiclesRef.current;
    const card = cardRefs.current.get(vehicleId);
    if (!container || !card) return;
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const cardCenter = cardRect.left + cardRect.width / 2;
    const offset = cardCenter - containerCenter;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Touch handlers for mobile carousel
  const onTouchStart = (e) => {
    if (!vehiclesRef.current) return;
    isDragging.current = true;
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    touchCurrentX.current = touchStartX.current;
  };

  const onTouchMove = (e) => {
    if (!isDragging.current || !vehiclesRef.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = touchCurrentX.current - x;
    touchCurrentX.current = x;
    vehiclesRef.current.scrollLeft += dx;
  };

  const onTouchEnd = () => {
    if (!isDragging.current || !vehiclesRef.current) return;
    isDragging.current = false;

    const container = vehiclesRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestId = null;
    let minDistance = Infinity;

    for (const [id, el] of cardRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < minDistance) { minDistance = dist; closestId = id; }
    }

    if (closestId) {
      setSelectedVehicle(closestId);
      centerCard(closestId);
    } else {
      if (selectedVehicle) centerCard(selectedVehicle);
    }
  };

  // Mobile map toggle
  const toggleMapMobile = () => {
    setIsMapOpenMobile(prev => !prev);
    if (isMapOpenMobile) {
      // If closing map, reset to view mode
      setMapMode('view');
      setActiveLocationField(null);
      setPendingLocation(null);
      setShowLocationConfirmModal(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };

  // Auto-center first vehicle on mobile mount
  useEffect(() => {
    if (isMobile && vehicles.length > 0) {
      const first = vehicles[0];
      setTimeout(() => setSelectedVehicle(first.id), 120);
    }
  }, [isMobile, vehicles]);

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

  return (
    <div className="customer-home">
      <div className="customer-header">
        <div className="header-logo">
          <img src={logo} alt="Pickarry Logo" className="logo-img" />
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

      <div className="customer-content">
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
              <p className="profile-phone">{currentUser?.phone || 'No phone number'}</p>
            </div>
          </div>

          <nav className="customer-nav">
            <button onClick={() => navigate('/customer/home')} className="nav-item active">
              <Home className="nav-icon" /><span>Home</span>
            </button>
            <button onClick={() => navigate('/customer/orders')} className="nav-item">
              <ShoppingCart className="nav-icon" /><span>Delivery</span>
            </button>
            <button onClick={() => navigate('/customer/menu')} className="nav-item">
              <Menu className="nav-icon" /><span>Menu</span>
            </button>
          </nav>
        </div>

        <div className="main-content">
          {/* Booking Form */}
          <div className="booking-form">
            <div className="form-sections">
              {/* Pickup Location - Click entire container to pinpoint */}
              <div
                className="form-groups location-input-container-clickable"
                onClick={startPickupPinpointing}
              >
                <div className="input-with-icon">
                  <div className="location-input-container">
                    <AddressAutocomplete
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      onSelect={handlePickupAddressSelect}
                      placeholder="Pickup Location"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
                    />
                    <div
                      className="pinpoint-indicator"
                      onClick={(e) => {
                        e.stopPropagation();
                        startPickupPinpointing();
                        // Scroll to map on desktop
                        if (!isMobile) {
                          const mapElement = document.querySelector('.map-section');
                          if (mapElement) mapElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      style={{ cursor: 'pointer', zIndex: 10 }}
                    >
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Location - Click entire container to pinpoint */}
              <div
                className="form-groups location-input-container-clickable"
                onClick={startDeliveryPinpointing}
              >
                <div className="input-with-icon">
                  <div className="location-input-container">
                    <AddressAutocomplete
                      value={deliveryLocation}
                      onChange={setDeliveryLocation}
                      onSelect={handleDeliveryAddressSelect}
                      placeholder="Drop-off Location"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
                    />
                    <div
                      className="pinpoint-indicator"
                      onClick={(e) => {
                        e.stopPropagation();
                        startDeliveryPinpointing();
                        // Scroll to map on desktop
                        if (!isMobile) {
                          const mapElement = document.querySelector('.map-section');
                          if (mapElement) mapElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      style={{ cursor: 'pointer', zIndex: 10 }}
                    >
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-groups">
                <div className="input-with-icon" onClick={() => setShowDescriptionModal(true)}>
                  <input type="text" placeholder="Service Details" value={deliveryItem} readOnly />
                  <ChevronDown className="chevron-icon" />
                </div>
              </div>
            </div>

            <div className="booking-optionss">
              <div className="option-row">
                <div className="option-item service-dropdown-item">
                  <span className="service-text">{selectedService}</span>
                  <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="service-select-hidden">
                    <option value="Pasundo">Pasundo</option>
                    <option value="Pasugo">Pasugo</option>
                  </select>
                </div>
                <div className="option-item checkbox-item">
                  <span>Book For Delivery</span>
                  <div className="checkbox">
                    <input type="checkbox" id="bookDelivery" checked={bookForDelivery} onChange={(e) => setBookForDelivery(e.target.checked)} />
                    <label htmlFor="bookDelivery"></label>
                  </div>
                </div>
              </div>

              <div className="option-row">
                <div className="option-item payment-dropdown">
                  <CreditCard className="option-icon" />
                  <span className="payment-text">{selectedPayment || 'Select Payment'}</span>
                  <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="payment-select">
                    <option value="">Select Payment</option>
                    <option value="Cash on Delivery (COD)">💰 Cash on Delivery (COD)</option>
                    <option value="GCash">📱 GCash</option>
                  </select>
                </div>
                <div className="option-item" onClick={() => setShowTimeModal(true)}>
                  <Clock className="option-icon" />
                  <span>
                    {bookForDelivery ? (selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : 'Set Date & Time') : (selectedTime ? `Today ${selectedTime}` : 'Set Time')}
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed Vehicle Selection */}
            <div className="vehicle-selection">
              <button
                className={`vehicle-nav-btn prev ${currentVehicleIndex === 0 ? 'disabled' : ''}`}
                onClick={prevVehicles}
                disabled={currentVehicleIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>

              <div
                className="vehicles-container"
                ref={vehiclesRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {getVisibleVehicles().map((vehicle) => {
                  // Calculate dynamic price for each vehicle
                  const dist = parseFloat(estimatedDistance) || 5;
                  const time = parseFloat(estimatedDuration) || 15;
                  const sampleFare = calculateFare(vehicle.type, dist, time, isRushDelivery);

                  return (
                    <div
                      key={vehicle.id}
                      className={`vehicle-card ${selectedVehicle === vehicle.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedVehicle(vehicle.id); setTimeout(() => centerCard(vehicle.id), 40); }}
                      ref={(el) => { if (el) cardRefs.current.set(vehicle.id, el); }}
                    >
                      <div className="vehicle-icon">{vehicle.icon}</div>
                      <div className="vehicle-type">{vehicle.type}</div>
                      <div className="vehicle-price">₱{sampleFare.total.toFixed(2)}</div>
                      <div className="vehicle-base-rate text-xs text-gray-400">
                        Base: ₱{vehicle.base_fare}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className={`vehicle-nav-btn next ${currentVehicleIndex + 3 >= vehicles.length ? 'disabled' : ''}`}
                onClick={nextVehicles}
                disabled={currentVehicleIndex + 3 >= vehicles.length}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button className="order-button" onClick={handleOrder}>Order</button>
          </div>

          {/* Map Section */}
          {!isMobile && (
            <div className="map-section">
              <div className="map-header-with-controls">
                <h3>Route Map</h3>
                {mapMode !== 'view' && (
                  <div className="pinpointing-controls">
                    <div className="pinpointing-info">
                      <MapPin size={16} />
                      <span>Click on map to set {activeLocationField} location</span>
                    </div>
                    {pendingLocation && (
                      <div className="pending-location-confirmation">
                        <span>Selected: {pendingLocation.address}</span>
                        <div className="confirmation-buttons">
                          <button
                            className="confirm-location-btn"
                            onClick={() => confirmLocationSelection(pendingLocation.address, pendingLocation.coordinates)}
                          >
                            Confirm
                          </button>
                          <button className="cancel-pinpointing-btn" onClick={clearPendingLocation}>
                            Change
                          </button>
                        </div>
                      </div>
                    )}
                    <button className="cancel-pinpointing-btn" onClick={cancelPinpointing}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="map-container-wrapper">
                <div className="map-container">
                  <MapComponent
                    pickupLocation={pickupLocation}
                    deliveryLocation={deliveryLocation}
                    onDistanceCalculated={updateEstimatedDistance}
                    onLocationSelect={handleMapLocationSelect}
                    mode={mapMode}
                    onModeChange={setMapMode}
                    height="500px"
                  />
                </div>
              </div>
              <h4>Route Information</h4>
              <div className="location-info">
                <div className="location-header">
                </div>
                <div className="location-details">
                  <MapPin className="location-icon" />
                  <span>Distance: {estimatedDistance || 'Calculating...'}</span>
                </div>
                <div className="location-details">
                  <Clock className="location-icon" />
                  <span>Duration: {estimatedDuration || 'Calculating...'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="customer-footer">
        <div className="footer-logo"><img src={logo} alt="Pickarry Logo" className="w-8 h-8" /></div>
        <div className="footer-links">
          <a href="#" className="footer-link">Contact Us</a>
          <a href="#" className="footer-link">Terms of Use</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Rider's Policy</a>
          <a href="#" className="footer-link">Customer's Policy</a>
        </div>
        <div className="footer-copyright"><p>© 2025 Pickarry - All rights reserved</p></div>
      </div>

      {/* Mobile map drop-up UI */}
      {isMobile && (
        <>
          <button
            className={`mobile-map-toggle ${isMapOpenMobile ? 'open' : ''}`}
            onClick={toggleMapMobile}
            aria-expanded={isMapOpenMobile}
            aria-label="Toggle map"
          >
            <div className="toggle-content">
              <MapPin size={16} />
              <span className="toggle-text">
                {isMapOpenMobile ? 'Close Map' :
                  mapMode !== 'view' ? `Set ${activeLocationField} on Map` :
                    `Map • ${pickupLocation || 'Set pickup'}`}
              </span>
            </div>
            <div className="toggle-arrow">{isMapOpenMobile ? '▲' : '▼'}</div>
          </button>

          <div className={`mobile-map-panel ${isMapOpenMobile ? 'visible' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-map-header">
              <div className="map-title">
                <MapPin size={18} />
                <span>
                  {mapMode !== 'view' ? `Set ${activeLocationField} Location` : 'Map'}
                </span>
              </div>
              <div className="mobile-map-actions-header">
                {mapMode !== 'view' && (
                  <button className="cancel-pinpointing-btn-mobile" onClick={cancelPinpointing}>
                    Cancel
                  </button>
                )}
                <button className="mobile-map-close" onClick={toggleMapMobile}><X size={18} /></button>
              </div>
            </div>
            <div className="mobile-map-body">
              <div className="map-container" style={{ height: '300px' }}>
                <MapComponent
                  pickupLocation={pickupLocation}
                  deliveryLocation={deliveryLocation}
                  onDistanceCalculated={updateEstimatedDistance}
                  onLocationSelect={handleMapLocationSelect}
                  mode={mapMode}
                  onModeChange={setMapMode}
                  height="300px"
                />
              </div>

              <div className="mobile-map-actions">
                {/* Pending location confirmation for mobile */}
                {pendingLocation && (
                  <div className="pending-location-confirmation-mobile">
                    <div className="pending-location-text">
                      <strong>Selected:</strong> {pendingLocation.address}
                    </div>
                    <div className="confirmation-buttons-mobile">
                      <button
                        className="confirm-location-btn-mobile"
                        onClick={() => confirmLocationSelection(pendingLocation.address, pendingLocation.coordinates)}
                      >
                        Confirm
                      </button>
                      <button className="change-location-btn-mobile" onClick={clearPendingLocation}>
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Clickable location rows for mobile */}
                <div
                  className="mobile-location-row clickable"
                  onClick={startPickupPinpointing}
                >
                  <MapPin size={16} />
                  <div className="mobile-location-texts">
                    <div className="mobile-location-label">Pickup</div>
                    <div className="mobile-location-value">{pickupLocation || 'Tap to set pickup'}</div>
                  </div>
                  <div className="mobile-pinpoint-indicator">
                    <MapPin size={14} />
                  </div>
                </div>

                <div
                  className="mobile-location-row clickable"
                  onClick={startDeliveryPinpointing}
                >
                  <MapPin size={16} />
                  <div className="mobile-location-texts">
                    <div className="mobile-location-label">Delivery</div>
                    <div className="mobile-location-value">{deliveryLocation || 'Tap to set delivery'}</div>
                  </div>
                  <div className="mobile-pinpoint-indicator">
                    <MapPin size={14} />
                  </div>
                </div>

                <div className="route-info-mobile">
                  <div className="route-info-item">
                    <MapPin size={14} />
                    <span>Distance: {estimatedDistance || 'Calculating...'}</span>
                  </div>
                  <div className="route-info-item">
                    <Clock size={14} />
                    <span>Duration: {estimatedDuration || 'Calculating...'}</span>
                  </div>
                </div>

                {mapMode !== 'view' && !pendingLocation && (
                  <div className="pinpointing-instruction-mobile">
                    <p>📍 Tap on the map to set your {activeLocationField} location</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`mobile-map-backdrop ${isMapOpenMobile ? 'visible' : ''}`} onClick={() => {
            setIsMapOpenMobile(false);
            setMapMode('view');
            setActiveLocationField(null);
            setPendingLocation(null);
            setShowLocationConfirmModal(false);
          }} />
        </>
      )}

      {/* Location Confirmation Modal */}
      {showLocationConfirmModal && pendingLocation && (
        <div className="modal-overlay" onClick={cancelLocationSelection}>
          <div className="location-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="location-confirm-header">
              <MapPin size={24} className="location-confirm-icon" />
              <h3 className="text-xl font-bold text-white">Set {pendingLocation.field === 'pickup' ? 'Pickup' : 'Delivery'} Location</h3>
              <p className="text-gray-300 mt-2">Are you sure you want to set this location?</p>
            </div>

            <div className="location-confirm-body">
              <div className="selected-location-display">
                <div className="location-address-box">
                  <MapPin size={16} className="text-teal-400" />
                  <div className="location-address-text">
                    <strong className="text-white font-semibold">Selected Address:</strong>
                    <p className="text-gray-200 mt-1 text-sm">{pendingLocation.address}</p>
                  </div>
                </div>

                <div className="location-coordinates-box">
                  <div className="coordinate-item">
                    <span className="coordinate-label text-gray-400">Latitude:</span>
                    <span className="coordinate-value text-teal-300">{pendingLocation.coordinates.lat.toFixed(6)}</span>
                  </div>
                  <div className="coordinate-item">
                    <span className="coordinate-label text-gray-400">Longitude:</span>
                    <span className="coordinate-value text-teal-300">{pendingLocation.coordinates.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>

              <div className="location-confirm-actions">
                <button
                  className="location-confirm-btn confirm"
                  onClick={() => confirmLocationSelection(pendingLocation.address, pendingLocation.coordinates)}
                >
                  Yes, Set This Location
                </button>
                <button
                  className="location-confirm-btn cancel"
                  onClick={cancelLocationSelection}
                >
                  No, Choose Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDescriptionModal && (
        <div className="modal-overlay" onClick={() => setShowDescriptionModal(false)}>
          <div className="description-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-button" onClick={() => setShowDescriptionModal(false)}><ChevronLeft size={24} /></button>
              <h3>Description To Deliver</h3>
              <span className="required-text">*Required Field</span>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <div className="category-dropdown">
                  <button className="category-button" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                    <span>{selectedCategory || 'Category'}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="category-options">
                      {categories.map((category) => (
                        <div key={category} className="category-option" onClick={() => { setSelectedCategory(category); setShowCategoryDropdown(false); }}>
                          <span style={{ flex: 1, textAlign: 'left' }}>{category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <input type="file" id="photo-upload" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <button className="upload-button" onClick={() => document.getElementById('photo-upload').click()}><Upload size={16} /> Upload Photos ({uploadedPhotos.length}/3)</button>
                <span className="upload-note">*Exactly 3 photos required</span>

                {uploadedPhotos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #14b8a6' }}>
                        <img src={photo.url} alt="Uploaded" style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                        <button onClick={() => removePhoto(photo.id)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.8)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '12px' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <textarea placeholder="Enter Description" value={description} onChange={(e) => setDescription(e.target.value)} className="description-textarea" rows={3} />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Ipadali | Rush</label>
                <input type="number" placeholder="Enter Rush Amount" value={rushAmount} onChange={(e) => { setRushAmount(e.target.value); setIsRushDelivery(e.target.value && parseFloat(e.target.value) > 0); }} style={{ width: '100%', padding: '12px', background: 'rgba(31, 41, 55, 0.8)', border: '2px solid #14b8a6', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }} />
              </div>

              <button className="submit-button" onClick={handleDescriptionSubmit} disabled={uploadedPhotos.length !== 3}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showTimeModal && (
        <div className="modal-overlay" onClick={() => setShowTimeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{bookForDelivery ? 'Select Delivery Date & Time' : 'Select Delivery Time'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              {bookForDelivery && <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '16px', background: 'rgba(31, 41, 55, 0.8)', border: '2px solid #14b8a6', borderRadius: '12px', color: 'white', fontSize: '16px' }} />}
              <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ padding: '16px', background: 'rgba(31, 41, 55, 0.8)', border: '2px solid #14b8a6', borderRadius: '12px', color: 'white', fontSize: '16px' }} />
              {!bookForDelivery && <p style={{ color: '#9ca3af', fontSize: '14px', margin: '8px 0 0 0' }}>Service will be scheduled for today</p>}
            </div>
            <button onClick={handleTimeSubmit} style={{ width: '100%', padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '24px' }}>{bookForDelivery ? 'Set Date & Time' : 'Set Time'}</button>
            <button onClick={() => setShowTimeModal(false)} style={{ width: '100%', padding: '16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}>Cancel</button>
          </div>
        </div>
      )}

      {isWaitingForCourier && (
        <div className="modal-overlay" onClick={() => { }}>
          <div className="waiting-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="waiting-modal-header">
              <button className="cancel-modal-button" onClick={handleCancelOrder}><X size={24} /></button>
            </div>

            <div className="waiting-header">
              {orderAccepted ? (
                <>
                  <div className="success-icon">✅</div>
                  <h2>Order Accepted!</h2>
                  <p>
                    {acceptedCourier
                      ? `${acceptedCourier.full_name} accepted your order! They're on their way with a ${acceptedCourier.vehicle_type}.`
                      : 'Your courier is on the way! You can now track your delivery.'
                    }
                  </p>
                </>
              ) : (
                <>
                  <h2>Order Submitted</h2>
                  <p>Your service request has been submitted. We're finding the best courier for your delivery.</p>
                </>
              )}
            </div>

            <div className="waiting-body">
              <div className="waiting-details-section">
                <div className="waiting-details" style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="detail-item"><div className="detail-label-with-icon"><MapPin className="detail-icon" size={16} /><span>Pickup Location:</span></div><span className="detail-value">{pickupLocation || 'Not specified'}</span></div>
                  <div className="detail-item"><span className="detail-label">Delivery Location:</span><span className="detail-value">{deliveryLocation}</span></div>
                  <div className="detail-item"><span className="detail-label">Service:</span><span className="detail-value">{selectedService}</span></div>
                  {(() => {
                    const vehicleObj = vehicles.find(v => v.id === selectedVehicle);
                    // Use values from the order if available, or current state
                    const dist = parseFloat(estimatedDistance) || 5;
                    const time = parseFloat(estimatedDuration) || 15;
                    const fareInfo = calculateFare(vehicleObj?.type, dist, time, isRushDelivery, 0);

                    return (
                      <>
                        <div className="detail-item"><span className="detail-label">Vehicle:</span><span className="detail-value">{vehicleObj?.type || 'Not selected'}</span></div>
                        <div className="detail-item"><span className="detail-label">Base Fare:</span><span className="detail-value">₱{vehicleObj?.base_fare || 0}</span></div>
                        <div className="detail-item"><span className="detail-label">Distance Cost:</span><span className="detail-value">₱{fareInfo.breakdown.distanceCost.toFixed(2)}</span></div>
                        <div className="detail-item"><span className="detail-label">Time Cost:</span><span className="detail-value">₱{fareInfo.breakdown.timeCost.toFixed(2)}</span></div>
                        <div className="detail-item"><span className="detail-label">Distance:</span><span className="detail-value">{estimatedDistance || 'N/A'}</span></div>
                        <div className="detail-item"><span className="detail-label">Duration:</span><span className="detail-value">{estimatedDuration || 'N/A'}</span></div>
                        <div className="detail-item"><span className="detail-label">Category:</span><span className="detail-value">{selectedCategory || 'Not specified'}</span></div>
                        <div className="detail-item"><span className="detail-label">Description:</span><span className="detail-value">{description || 'Not specified'}</span></div>
                        <div className="detail-item"><span className="detail-label">Images Uploaded:</span><span className="detail-value">{uploadedPhotos.length}</span></div>
                        {rushAmount && parseFloat(rushAmount) > 0 && (<div className="detail-item"><span className="detail-label">Rush Fee:</span><span className="detail-value">₱{rushAmount}</span></div>)}
                        <div className="detail-item" style={{ marginTop: '8px', borderTop: '1px solid #374151', paddingTop: '8px' }}>
                          <span className="detail-label" style={{ fontWeight: 'bold', color: '#14b8a6' }}>Total Cost:</span>
                          <span className="detail-value" style={{ fontWeight: 'bold', color: '#14b8a6', fontSize: '1.2em' }}>₱{fareInfo.total.toFixed(2)}</span>
                        </div>
                        <div className="detail-item"><span className="detail-label">Delivery Time:</span><span className="detail-value">{selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : 'Not set'}</span></div>
                        <div className="detail-item"><span className="detail-label">Payment:</span><span className="detail-value">{selectedPayment}</span></div>
                        {acceptedCourier && (
                          <>
                            <div className="detail-item"><span className="detail-label">Courier:</span><span className="detail-value">{acceptedCourier.full_name}</span></div>
                            <div className="detail-item"><span className="detail-label">Courier Vehicle:</span><span className="detail-value">{acceptedCourier.vehicle_type}</span></div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="waiting-actions">
                  {orderAccepted ? (
                    <>
                      <button
                        className="message-courier-button secondary"
                        onClick={() => setShowRemarksModal(true)}
                      >
                        <MessageSquare size={16} />
                        Message Courier
                      </button>
                      <button className="go-to-delivery-button" onClick={handleGoToDelivery}>
                        <Truck size={16} /> Go to Delivery
                      </button>
                    </>
                  ) : (
                    <button className="report-issue-button" onClick={() => alert('Report issue functionality would be implemented here')}>
                      <AlertTriangle size={16} /> Report Issue
                    </button>
                  )}
                </div>
              </div>

              <div className="waiting-map-section">
                <div className="map-container modal-map-container">
                  <MapComponent
                    pickupLocation={pickupLocation}
                    deliveryLocation={deliveryLocation}
                    onDistanceCalculated={updateEstimatedDistance}
                    height="200px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER REMARKS MODAL */}
      {showRemarksModal && currentOrderId && (
        <OrderRemarksModal
          orderId={currentOrderId}
          userType="customer"
          userId={currentUser?.id}
          isOpen={showRemarksModal}
          onClose={() => setShowRemarksModal(false)}
        />
      )}

    </div>
  );
};

export default CustomerHome;