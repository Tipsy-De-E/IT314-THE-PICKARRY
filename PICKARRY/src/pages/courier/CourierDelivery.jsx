import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Package, CreditCard, Clock, CheckCircle, XCircle, MessageSquare, X, TrendingUp, DollarSign, Home, FileText, Calendar, Menu, Search, Filter, Heart, Trash2, Truck, ChevronDown, Bike, Bell, Phone, Loader2 } from 'lucide-react';
import { clearUserSession, getCurrentUser } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import logo from '../../assets/images/LOGO.png';
import '../../styles/courier-history.css';
import { notificationService } from '../../hooks/notificationService';
import NotificationDropdown from '../../components/NotificationDropdown';

const CourierDelivery = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [remarks, setRemarks] = useState({});
    const [showRemarksModal, setShowRemarksModal] = useState(false);
    const [currentOrderRemark, setCurrentOrderRemark] = useState('');
    const [activeTab, setActiveTab] = useState('current'); // 'current', 'history'
    const [activeService, setActiveService] = useState('All'); // 'All', 'Pasugo', 'Pasundo'
    const [activeStatus, setActiveStatus] = useState('All');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrders, setCurrentOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [profileImage, setProfileImage] = useState('');
    const [updatingOrder, setUpdatingOrder] = useState(null);

    // Initial load
    useEffect(() => {
        checkAuthentication();
    }, []);

    // Load orders when user is authenticated
    useEffect(() => {
        if (userData?.id) {
            loadOrders();
            setupRealtimeSubscription();
        }
    }, [userData, activeTab]);

    // Check authentication
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

            setUserData({
                id: courierData.id,
                name: courierData.full_name || 'Courier',
                email: courierData.email,
                profile_image: courierData.profile_image
            });

            if (courierData.profile_image) {
                setProfileImage(courierData.profile_image);
            }

        } catch (error) {
            console.error('Auth error:', error);
            navigate('/customer/auth');
        } finally {
            setLoading(false);
        }
    };

    // Load orders from Supabase
    const loadOrders = async () => {
        try {
            setLoading(true);
            if (activeTab === 'current') {
                // Fetch active orders (accepted, picked_up, on_the_way, arrived)
                // Filter out 'book_for_delivery' if this page is only for immediate ones, 
                // OR include all. Ideally, 'CourierBook' handles booked ones.
                // For now, let's show ALL active orders assigned to this courier.
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        customers:customer_id (
                            full_name,
                            phone,
                            email,
                            profile_image
                        )
                    `)
                    .eq('courier_id', userData.id)
                    .in('status', ['accepted', 'picked_up', 'on_the_way', 'arrived'])
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCurrentOrders(data.map(formatOrderData));

            } else {
                // Fetch history (completed, cancelled)
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        customers:customer_id (
                            full_name,
                            phone,
                            email
                        ),
                        courier_earnings (
                            amount
                        )
                    `)
                    .eq('courier_id', userData.id)
                    .in('status', ['completed', 'delivered', 'cancelled'])
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCompletedOrders(data.map(formatOrderData));
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format order data for display
    const formatOrderData = (order) => {
        return {
            id: order.id,
            pickupLocation: order.pickup_location,
            deliveryLocation: order.delivery_location,
            item: order.delivery_item,
            payment: `₱${order.total_amount?.toFixed(2)} ${order.payment_method === 'GCash' ? 'GCash' : 'COD'}`,
            vehicleType: order.selected_vehicle,
            category: order.selected_category,
            date: new Date(order.created_at).toLocaleString(),
            status: convertStatus(order.status), // Display friendly status
            rawStatus: order.status, // Keep raw status for logic
            customerName: order.customers?.full_name || 'Customer',
            phone: order.customers?.phone || 'No phone',
            serviceType: order.selected_service,
            earnings: order.courier_earnings?.[0]?.amount ? `₱${parseFloat(order.courier_earnings[0].amount).toFixed(2)}` : '₱0.00',
            supabaseData: order
        };
    };

    const convertStatus = (status) => {
        const map = {
            'pending': 'Pending',
            'accepted': 'Accepted',
            'picked_up': 'Picked Up',
            'on_the_way': 'On The Way',
            'arrived': 'Arrived',
            'delivered': 'Completed',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return map[status] || status;
    };

    // Realtime subscription
    const setupRealtimeSubscription = () => {
        const subscription = supabase
            .channel(`courier-delivery-${userData.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `courier_id=eq.${userData.id}`
            }, () => {
                loadOrders();
            })
            .subscribe();

        return subscription;
    };

    // Update Status Logic
    const handleUpdateStatus = async (orderId, currentStatus) => {
        try {
            setUpdatingOrder(orderId);
            let newStatus;
            let statusMessage;

            // Determine next status
            if (currentStatus === 'accepted') {
                newStatus = 'picked_up';
                statusMessage = 'Package picked up';
            } else if (currentStatus === 'picked_up') {
                newStatus = 'on_the_way';
                statusMessage = 'On the way to delivery';
            } else if (currentStatus === 'on_the_way') {
                newStatus = 'arrived';
                statusMessage = 'Arrived at location';
            } else if (currentStatus === 'arrived') {
                newStatus = 'delivered'; // Will be marked as completed
                statusMessage = 'Delivery completed';
            } else {
                return;
            }

            // Define timestamp fields for each status
            const timestampFields = {
                'picked_up': 'picked_up_at',
                'on_the_way': 'on_the_way_at',
                'arrived': 'arrived_at',
                'delivered': 'delivered_at'
            };

            const updates = {
                status: newStatus,
                courier_status: newStatus,
                updated_at: new Date().toISOString()
            };

            // Add timestamp
            if (timestampFields[newStatus]) {
                updates[timestampFields[newStatus]] = new Date().toISOString();
            }

            // Update Order
            const { error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderId);

            if (error) throw error;

            // Add History
            await supabase
                .from('order_status_history')
                .insert({
                    order_id: orderId,
                    status: newStatus,
                    courier_status: newStatus,
                    notes: statusMessage,
                    created_at: new Date().toISOString()
                });

            // Calculate earnings if completed
            if (newStatus === 'delivered') {
                const order = currentOrders.find(o => o.id === orderId);
                if (order && order.supabaseData) {
                    await supabase
                        .from('courier_earnings')
                        .insert({
                            courier_id: userData.id,
                            order_id: orderId,
                            amount: order.supabaseData.total_amount,
                            type: 'delivery',
                            description: `Earnings from delivery ${order.supabaseData.id}`
                        });
                }
            }

            // Send Notifications
            const order = currentOrders.find(o => o.id === orderId);
            if (order && order.supabaseData?.customers?.email) {
                if (newStatus === 'delivered') {
                    await notificationService.notifyOrderStatusUpdate(
                        orderId,
                        'delivered',
                        order.supabaseData.customers.email,
                        { courier_name: userData.name }
                    );
                } else {
                    await notificationService.notifyDeliveryProgress(
                        orderId,
                        order.supabaseData.customers.email,
                        newStatus,
                        userData.name
                    );
                }
            }

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdatingOrder(null);
        }
    };

    // Filter logic
    const getFilteredOrders = (orders) => {
        return orders.filter(order => {
            const matchesSearch =
                (order.pickupLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.deliveryLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.item || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesService = activeService === 'All' || order.serviceType === activeService;
            // Map activeStatus 'In Progress' to the various internal statuses
            const matchesStatus =
                activeStatus === 'All' ||
                (activeStatus === 'In Progress' && ['picked_up', 'on_the_way', 'arrived'].includes(order.rawStatus)) ||
                convertStatus(order.rawStatus) === activeStatus;

            return matchesSearch && matchesService && matchesStatus;
        });
    };

    const filteredCurrentOrders = getFilteredOrders(currentOrders);
    const filteredCompletedOrders = getFilteredOrders(completedOrders);

    // Helpers
    const getNextStatusLabel = (currentStatus) => {
        if (currentStatus === 'accepted') return 'Pick Up Package';
        if (currentStatus === 'picked_up') return 'Start Delivery';
        if (currentStatus === 'on_the_way') return 'Arrived at Location';
        if (currentStatus === 'arrived') return 'Complete Delivery';
        return 'Update Status';
    };

    const handleLogout = () => {
        clearUserSession();
        navigate('/');
    };

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
                                <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <span>{userData?.name?.charAt(0) || 'C'}</span>
                            )}
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-button">Log Out</button>
                </div>
            </div>

            <div className="courier-content">
                {/* Sidebar */}
                <div className="courier-sidebar">
                    <div className="courier-profile-card">
                        <div className="profile-avatar-large">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <span>{userData?.name?.charAt(0) || 'C'}</span>
                            )}
                        </div>
                        <div className="profile-info">
                            <h3>{userData?.name || 'Courier'}</h3>
                            <p>{userData?.email || 'courier@gmail.com'}</p>
                        </div>
                    </div>

                    <nav className="courier-nav">
                        <button onClick={() => navigate('/courier/home')} className="nav-item">
                            <Home className="nav-icon w-6 h-6" />
                            <span>Home</span>
                        </button>
                        <button onClick={() => navigate('/courier/history')} className="nav-item active">
                            <FileText className="nav-icon w-6 h-6" />
                            <span>Delivery</span>
                        </button>
                        <button onClick={() => navigate('/courier/book')} className="nav-item">
                            <Calendar className="nav-icon w-6 h-6" />
                            <span>Book</span>
                        </button>
                        <button onClick={() => navigate('/courier/menu')} className="nav-item">
                            <Menu className="nav-icon w-6 h-6" />
                            <span>Menu</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="orders-main-content">
                    {/* Tabs */}
                    <div className="delivery-tabs">
                        {['current', 'history'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'current' ? 'Current Delivery' : 'Delivery History'}
                            </button>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="orders-toolbar">
                        <div className="search-input-container">
                            <Search className="search-icon w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                        </div>
                    ) : (
                        <div className="orders-list">
                            {(activeTab === 'current' ? filteredCurrentOrders : filteredCompletedOrders).length === 0 ? (
                                <p className="no-orders-text">No orders found.</p>
                            ) : (
                                (activeTab === 'current' ? filteredCurrentOrders : filteredCompletedOrders).map((order) => (
                                    <div key={order.id} className="order-card">
                                        <div className="order-header">
                                            <div className="order-pickup">
                                                <MapPin className="w-5 h-5" />
                                                <span>{order.pickupLocation}</span>
                                            </div>
                                        </div>

                                        <div className="order-details">
                                            <div className="order-detail">
                                                <MapPin className="detail-icon w-4 h-4" />
                                                <span>{order.deliveryLocation}</span>
                                            </div>
                                            <div className="order-detail">
                                                <Package className="detail-icon w-4 h-4" />
                                                <span>{order.item}</span>
                                            </div>
                                            <div className="order-detail">
                                                <Bike className="detail-icon w-4 h-4" />
                                                <span>{order.vehicleType}</span>
                                                <span className={`detail-right detail-right-status status-text status-${order.status.toLowerCase().replace(' ', '-')}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            {order.phone && (
                                                <div className="order-detail">
                                                    <Phone className="detail-icon w-4 h-4" />
                                                    <span>{order.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="order-footer">
                                            {activeTab === 'current' && (
                                                <button
                                                    className="order-action-button w-full"
                                                    onClick={() => handleUpdateStatus(order.id, order.rawStatus)}
                                                    disabled={updatingOrder === order.id}
                                                >
                                                    {updatingOrder === order.id ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                                                        </span>
                                                    ) : (
                                                        getNextStatusLabel(order.rawStatus)
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

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

export default CourierDelivery;
