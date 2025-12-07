import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Package, CreditCard, Clock, CheckCircle, XCircle, MessageSquare, X, TrendingUp, DollarSign, Home, FileText, Calendar, Menu, Search, Filter, Heart, Trash2, Truck, ChevronDown, Bike, Bell } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import logo from '../../assets/images/LOGO.png';
import '../../styles/courier-history.css';

const TWENTY_SECONDS = 20;

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

    // tick to re-render countdowns
    const [now, setNow] = useState(Date.now());
    React.useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Dynamic status options based on active tab
    const getStatusOptions = () => {
        if (activeTab === 'current' || activeTab === 'book') {
            return ['All', 'Pending', 'In Progress'];
        } else if (activeTab === 'history') {
            return ['All', 'Completed', 'Cancelled'];
        }
        return ['All'];
    };

    // Function to format date display based on tab
    const formatDateDisplay = (date, tab) => {
        if (tab === 'current') {
            return `Today: ${date.split(' ').slice(-2).join(' ')}`;
        } else if (tab === 'book') {
            return `Book: ${date}`;
        } else {
            return date;
        }
    };

    const statusOptions = getStatusOptions();

    const handleLogout = () => {
        clearUserSession();
        navigate('/');
    };

    // Current Orders Data
    const [currentOrders, setCurrentOrders] = useState([
        {
            id: 1,
            pickupLocation: 'Brewbox Jasaan Plaza',
            deliveryLocation: 'Bobuntugan Zone 4',
            item: 'Iced Coffee Matcha (2 Cups)',
            payment: '₱200.00 COD',
            vehicleType: 'Motorcycle',
            category: 'Food',
            date: 'Oct 22, 2025 1:00 PM',
            status: 'In Progress',
            customerName: 'Juan Dela Cruz',
            serviceType: 'Pasugo',
            phone: '+63 912 345 6789',
            acceptedAt: Date.now(), // timestamp when delivery was accepted
        },
        {
            id: 2,
            pickupLocation: 'SM City Jasaan',
            deliveryLocation: 'Zone 4, San Pedro',
            item: 'Documents',
            payment: '₱150.00 GCash',
            vehicleType: 'Car',
            category: 'Documents',
            date: 'Oct 22, 2025 2:30 PM',
            status: 'Pending',
            customerName: 'Maria Santos',
            serviceType: 'Pasundo',
            phone: '+63 917 654 3210',
            acceptedAt: Date.now(), // timestamp when delivery was accepted
        },
    ]);

    // Add accepted order from navigation state
    React.useEffect(() => {
        if (location.state?.acceptedOrder) {
            const acceptedOrder = location.state.acceptedOrder;
            const newDelivery = {
                id: Date.now(), // unique id
                pickupLocation: acceptedOrder.pickupLocation,
                deliveryLocation: acceptedOrder.deliveryLocation,
                item: acceptedOrder.item,
                payment: acceptedOrder.payment,
                status: acceptedOrder.status,
                vehicleType: 'Motorcycle',
                category: 'Food',
                date: acceptedOrder.date,
                customerName: acceptedOrder.customerName,
                serviceType: acceptedOrder.status,
                phone: acceptedOrder.phone,
                acceptedAt: Date.now(), // timestamp when delivery was accepted
            };
            setCurrentOrders(prev => [newDelivery, ...prev]);
            // Clear the state to prevent re-adding on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    // Completed Orders Data
    const completedOrders = [
        {
            id: 3,
            pickupLocation: 'Municipal Hall',
            deliveryLocation: 'Zone 3, Bobuntugan',
            item: 'Permit Papers',
            payment: '₱120.00 COD',
            vehicleType: 'Motorcycle',
            category: 'Documents',
            date: 'Oct 20, 2025 4:30 PM',
            status: 'Completed',
            customerName: 'Carlos Mendoza',
            serviceType: 'Pasundo',
            earnings: '₱50.00',
            phone: '+63 921 456 7890',
        },
    ];

    // Filtering logic
    const getFilteredOrders = (orders) => {
        return orders.filter(order => {
            const matchesSearch =
                order.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.item.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesService =
                activeService === 'All' || order.serviceType === activeService;

            const matchesStatus =
                activeStatus === 'All' || order.status === activeStatus;

            const matchesCategory =
                activeCategory === 'All' || order.category === activeCategory;

            const matchesTab =
                activeTab === 'current'
                    ? order.status !== 'Completed' && order.status !== 'Cancelled'
                    : order.status === 'Completed' || order.status === 'Cancelled';

            return matchesSearch && matchesService && matchesStatus && matchesCategory && matchesTab;
        });
    };

    const filteredCurrentOrders = getFilteredOrders(currentOrders);
    const filteredCompletedOrders = getFilteredOrders(completedOrders);

    const totalEarnings = completedOrders
        .filter(order => order.status === 'Completed')
        .reduce((sum, order) => sum + parseFloat(order.earnings.replace('₱', '')), 0);

    // helper for countdown
    const getRemainingSeconds = (delivery) => {
        if (!delivery.acceptedAt) return TWENTY_SECONDS;
        const elapsed = Math.floor((now - delivery.acceptedAt) / 1000);
        return Math.max(0, TWENTY_SECONDS - elapsed);
    };

    const formatSeconds = (s) => {
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    };

    // cancel delivery
    const cancelDelivery = (id) => {
        setCurrentOrders(prev => prev.filter(d => d.id !== id));
    };

    // auto-finalize deliveries after 20 seconds (mark as accepted or in progress)
    React.useEffect(() => {
        currentOrders.forEach(delivery => {
            if (delivery.acceptedAt) {
                const elapsed = Math.floor((now - delivery.acceptedAt) / 1000);
                if (elapsed >= TWENTY_SECONDS) {
                    // auto-accept delivery - could update status or progress
                    setCurrentOrders(prev => prev.map(d =>
                        d.id === delivery.id ? { ...d, status: 'In Progress' } : d
                    ));
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [now, currentOrders]);

    const openRemarksModal = (orderId, existingRemark = '') => {
        setSelectedOrderId(orderId);
        setCurrentOrderRemark(existingRemark || '');
        setShowRemarksModal(true);
    };

    const saveRemark = () => {
        if (selectedOrderId) {
            setRemarks({
                ...remarks,
                [selectedOrderId]: currentOrderRemark
            });
            setShowRemarksModal(false);
            setCurrentOrderRemark('');
            setSelectedOrderId(null);
        }
    };

    return (
        <div className="courier-home">
            {/* Header */}
            <div className="courier-headers">
                <div className="header-logo">
                    <img src={logo} alt="Pickarry Logo" className="w-19 h-12" />
                </div>
                <div className="header-right">
                    <button className="header-notification-btn">
                        <Bell size={20} />
                    </button>
                    <div className="courier-profile">
                        <div className="profile-avatar">
                            <span>C</span>
                        </div>
                        {/* <span className="profile-name">Courier</span> */}
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
                            <span>C</span>
                        </div>
                        <div className="profile-info">
                            <h3>Courier</h3>
                            <p>courier@gmail.com</p>
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
                            className="nav-item active"
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
                            className="nav-item"
                        >
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
                                onClick={() => {
                                    setActiveTab(tab);
                                    setActiveStatus('All');
                                }}
                            >
                                {tab === 'current' ? 'Current Delivery' : 'Delivery History'}
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
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="orders-toolbar-right">
                            {/* Category Dropdown */}
                            <div className="dropdown">
                                <button className="dropdown-button" onClick={() => {
                                    setShowCategoryDropdown(!showCategoryDropdown);
                                    setShowFilterDropdown(false);
                                }}>
                                    Category <ChevronDown className="w-4 h-4" />
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

                            {/* Filter Dropdown (Dynamic) */}
                            <div className="dropdown">
                                <button className="dropdown-button" onClick={() => {
                                    setShowFilterDropdown(!showFilterDropdown);
                                    setShowCategoryDropdown(false);
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

                    {/* Current Deliveries Tab */}
                    {activeTab === 'current' && (
                        <div className="orders-main-content">
                            <div className="orders-list">
                                {filteredCurrentOrders.length === 0 ? (
                                    <p className="no-orders-text">No orders found.</p>
                                ) : (
                                    filteredCurrentOrders.map((order) => (
                                        <div key={order.id} className="order-card">
                                            <div className="order-header">
                                                <div className="order-pickup">
                                                    <MapPin className="w-5 h-5" />
                                                    <span>{order.pickupLocation}</span>
                                                </div>
                                                {activeTab === 'history' && (
                                                    <div className="order-actions">
                                                        <button className="action-button favorite"><Heart className="w-5 h-5" /></button>
                                                        <button className="action-button delete"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="order-details">
                                                <div className="order-detail">
                                                    <MapPin className="detail-icon w-4 h-4" />
                                                    <span>{order.deliveryLocation}</span>
                                                    <span className="detail-right detail-right-time">{formatDateDisplay(order.date, activeTab)}</span>
                                                </div>
                                                <div className="order-detail">
                                                    <Package className="detail-icon w-4 h-4" />
                                                    <span>{order.item}</span>
                                                </div>
                                                <div className="order-detail">
                                                    <CreditCard className="detail-icon w-4 h-4" />
                                                    <span>{order.payment}</span>
                                                </div>
                                                <div className="order-detail">
                                                    <Bike className="detail-icon w-4 h-4" />
                                                    <span>{order.vehicleType}</span>
                                                    <span className={`detail-right detail-right-status status-text status-${order.status.toLowerCase()}`}>{order.status}</span>
                                                </div>
                                            </div>

                                            <div className="order-footer">
                                                <button className="order-view-button">View</button>
                                                {(order.status === 'In Progress' || order.status === 'Pending') && (
                                                    <button className="order-action-button">
                                                        Update Status
                                                    </button>
                                                )}
                                                {(order.status === 'Completed' || order.status === 'Cancelled') && (
                                                    <button
                                                        className={`remarks-button ${remarks[order.id] ? 'has-remarks' : ''}`}
                                                        onClick={() => openRemarksModal(order.id, remarks[order.id])}
                                                    >
                                                        <MessageSquare size={16} />
                                                        <span>{remarks[order.id] ? 'View Remarks' : 'Add Remarks'}</span>
                                                    </button>
                                                )}
                                                {order.status === 'Pending' && (
                                                    <button className="action-button" style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.4)', color: '#14b8a6' }}>
                                                        Auto-accept in {formatSeconds(getRemainingSeconds(order))}
                                                    </button>
                                                )}
                                                {order.status === 'In Progress' && (
                                                    <button className="action-button view" onClick={() => cancelDelivery(order.id)}>
                                                        Cancel Delivery
                                                    </button>
                                                )}
                                            </div>

                                            {remarks[order.id] && (
                                                <div className="remarks-preview"><p className="remark-text">{remarks[order.id]}</p></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delivery History Tab */}
                    {activeTab === 'history' && (
                        <>
                            {/* Summary Cards */}
                            <div className="earnings-summary">
                                <div className="summary-card">
                                    <h3>Total Earnings</h3>
                                    <p className="earnings-amount">₱{totalEarnings.toFixed(2)}</p>
                                    <span className="earnings-period">This Month</span>
                                </div>
                                <div className="summary-card">
                                    <h3>Completed Orders</h3>
                                    <p className="orders-count">
                                        {completedOrders.filter(order => order.status === 'Completed').length}
                                    </p>
                                    <span className="orders-period">This Month</span>
                                </div>
                            </div>

                            <div className="orders-main-content">
                                <div className="orders-list">
                                    {filteredCompletedOrders.length === 0 ? (
                                        <p className="no-orders-text">No orders found.</p>
                                    ) : (
                                        filteredCompletedOrders.map((order) => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-header">
                                                    <div className="order-pickup">
                                                        <MapPin className="w-5 h-5" />
                                                        <span>{order.pickupLocation}</span>
                                                    </div>
                                                    {activeTab === 'history' && (
                                                        <div className="order-actions">
                                                            <button className="action-button favorite"><Heart className="w-5 h-5" /></button>
                                                            <button className="action-button delete"><Trash2 className="w-5 h-5" /></button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="order-details">
                                                    <div className="order-detail">
                                                        <MapPin className="detail-icon w-4 h-4" />
                                                        <span>{order.deliveryLocation}</span>
                                                        <span className="detail-right detail-right-time">{formatDateDisplay(order.date, activeTab)}</span>
                                                    </div>
                                                    <div className="order-detail">
                                                        <Package className="detail-icon w-4 h-4" />
                                                        <span>{order.item}</span>
                                                    </div>
                                                    <div className="order-detail">
                                                        <CreditCard className="detail-icon w-4 h-4" />
                                                        <span>{order.payment}</span>
                                                    </div>
                                                    <div className="order-detail">
                                                        <Bike className="detail-icon w-4 h-4" />
                                                        <span>{order.vehicleType}</span>
                                                        <span className={`detail-right detail-right-status status-text status-${order.status.toLowerCase()}`}>{order.status}</span>
                                                    </div>
                                                </div>

                                                <div className="order-footer">
                                                    <div className="order-earnings">
                                                        <span className="earnings-label">Earnings:</span>
                                                        <span className="earnings-value">{order.earnings}</span>
                                                    </div>

                                                    <div className="order-actions">
                                                        <button className="order-view-button">View</button>
                                                        <button
                                                            className={`remarks-button ${remarks[order.id] ? 'has-remarks' : ''}`}
                                                            onClick={() => openRemarksModal(order.id, remarks[order.id])}
                                                        >
                                                            <MessageSquare size={16} />
                                                            <span>{remarks[order.id] ? 'View Remarks' : 'Add Remarks'}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {remarks[order.id] && (
                                                    <div className="remarks-preview"><p className="remark-text">{remarks[order.id]}</p></div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Remarks Modal */}
            {showRemarksModal && (
                <div className="modal-overlay" onClick={() => setShowRemarksModal(false)}>
                    <div className="remarks-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Remarks & Concerns</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowRemarksModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="order-info">
                                <p className="order-id">
                                    Order ID: {selectedOrderId}
                                </p>
                            </div>

                            <div className="remarks-form">
                                <label htmlFor="remarks-textarea">Add Your Remarks or Concerns:</label>
                                <textarea
                                    id="remarks-textarea"
                                    className="remarks-textarea"
                                    placeholder="Enter any concerns, issues, or notes about this delivery. This helps us improve our service and address any problems."
                                    value={currentOrderRemark}
                                    onChange={(e) => setCurrentOrderRemark(e.target.value)}
                                    rows={6}
                                    maxLength={500}
                                />
                                <p className="character-count">
                                    {currentOrderRemark.length} / 500 characters
                                </p>
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
                                    onClick={saveRemark}
                                    disabled={!currentOrderRemark.trim()}
                                >
                                    Save Remarks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
