// components/NotificationDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Bell,
    X,
    Check,
    ExternalLink,
    Clock,
    Settings,
    Filter,
    AlertTriangle,
    CheckCircle,
    Info,
    MessageSquare,
    Star,
    CreditCard,
    Shield,
    UserCheck,
    Truck,
    MapPin,
    Package,
    UserPlus,
    FileText,
    AlertCircle,
    User
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import '../styles/notificationDropdown.css';

const NotificationDropdown = ({ userType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        preferences,
        updatePreference
    } = useNotifications(userType);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        const icons = {
            // Customer & Courier icons
            delivery_update: <Truck size={16} className="text-blue-500" />,
            payment_confirmation: <CreditCard size={16} className="text-green-500" />,
            new_order: <Bell size={16} className="text-orange-500" />,
            system_alert: <Info size={16} className="text-purple-500" />,
            rule_change: <Shield size={16} className="text-yellow-500" />,
            complaint_response: <MessageSquare size={16} className="text-red-500" />,
            promotion: <Star size={16} className="text-pink-500" />,
            rating_received: <Star size={16} className="text-yellow-500" />,
            account_update: <UserCheck size={16} className="text-teal-500" />,
            suspension_notice: <AlertTriangle size={16} className="text-red-500" />,
            courier_assigned: <UserCheck size={16} className="text-green-500" />,
            report_submitted: <AlertTriangle size={16} className="text-orange-500" />,
            report_update: <Info size={16} className="text-blue-500" />,
            suspension: <AlertTriangle size={16} className="text-red-500" />,
            remark_added: <MessageSquare size={16} className="text-purple-500" />,
            payment_update: <CreditCard size={16} className="text-green-500" />,
            order_accepted: <CheckCircle size={16} className="text-green-500" />,
            on_the_way: <Truck size={16} className="text-blue-500" />,
            order_delivered: <Package size={16} className="text-green-500" />,

            // Admin specific icons
            new_customer_signup: <UserPlus size={16} className="text-green-500" />,
            new_courier_application: <FileText size={16} className="text-blue-500" />,
            support_ticket: <MessageSquare size={16} className="text-orange-500" />,
            complaint_reported: <AlertCircle size={16} className="text-red-500" />,
            urgent_issue: <AlertTriangle size={16} className="text-red-500" />,
            system_issue: <AlertCircle size={16} className="text-yellow-500" />,
            admin_alert: <Shield size={16} className="text-purple-500" />
        };
        return icons[type] || <Bell size={16} className="text-gray-500" />;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'priority-high',
            normal: 'priority-normal',
            low: 'priority-low'
        };
        return colors[priority] || 'priority-normal';
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);

        // Navigate based on notification type and action_url
        if (notification.action_url) {
            navigate(notification.action_url);
        } else {
            // Default navigation based on notification type and user type
            if (userType === 'admin') {
                switch (notification.type) {
                    case 'new_customer_signup':
                        navigate('/admin/customers');
                        break;
                    case 'new_courier_application':
                        navigate('/admin/couriers');
                        break;
                    case 'support_ticket':
                    case 'complaint_reported':
                        navigate('/admin/support');
                        break;
                    case 'urgent_issue':
                    case 'system_issue':
                        navigate('/admin/system');
                        break;
                    default:
                        navigate('/admin');
                }
            } else {
                // Existing customer/courier navigation
                switch (notification.type) {
                    case 'delivery_update':
                    case 'courier_assigned':
                    case 'order_accepted':
                    case 'on_the_way':
                    case 'order_delivered':
                        navigate(userType === 'customer' ? '/customer/orders' : '/courier/history');
                        break;
                    case 'new_order':
                        navigate('/courier/home');
                        break;
                    case 'report_submitted':
                    case 'report_update':
                        if (userType === 'admin') {
                            navigate(`/admin/reports/${notification.related_entity_id}`);
                        } else {
                            navigate(userType === 'customer' ? '/customer/support' : '/courier/support');
                        }
                        break;
                    case 'suspension':
                        navigate(userType === 'customer' ? '/customer/support' : '/courier/support');
                        break;
                    case 'rating_received':
                        navigate(userType === 'courier' ? '/courier/ratings' : '/customer/ratings');
                        break;
                    case 'remark_added':
                        navigate(userType === 'customer' ? '/customer/orders' : '/courier/history');
                        break;
                    default:
                        navigate('/');
                }
            }
        }

        setIsOpen(false);
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    const handleSettings = () => {
        setIsOpen(false);
        navigate('/notification-settings');
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.is_read;
        return notification.type === filter;
    });

    // Different notification types based on user type
    const getNotificationTypes = () => {
        if (userType === 'admin') {
            return [
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'new_customer_signup', label: 'New Signups', count: notifications.filter(n => n.type === 'new_customer_signup').length },
                { key: 'new_courier_application', label: 'Applications', count: notifications.filter(n => n.type === 'new_courier_application').length },
                { key: 'support_ticket', label: 'Support', count: notifications.filter(n => n.type === 'support_ticket').length },
                { key: 'complaint_reported', label: 'Complaints', count: notifications.filter(n => n.type === 'complaint_reported').length }
            ];
        } else {
            return [
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'delivery_update', label: 'Delivery Updates', count: notifications.filter(n => n.type === 'delivery_update').length },
                { key: 'new_order', label: 'New Orders', count: notifications.filter(n => n.type === 'new_order').length },
                { key: 'payment_update', label: 'Payments', count: notifications.filter(n => n.type === 'payment_update').length },
                { key: 'remark_added', label: 'Messages', count: notifications.filter(n => n.type === 'remark_added').length }
            ];
        }
    };

    const notificationTypes = getNotificationTypes();

    return (
        <div className="notification-dropdown-container" ref={dropdownRef}>
            <button
                className="notification-trigger-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-indicator">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    {/* Header */}
                    <div className="notification-panel-header">
                        <div className="notification-title-section">
                            <h3 className="notification-panel-title">
                                {userType === 'admin' ? 'Notifications' : 'Notifications'}
                            </h3>
                            {unreadCount > 0 && (
                                <span className="unread-count-badge">{unreadCount} unread</span>
                            )}
                        </div>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="action-btn secondary"
                                    title="Mark all as read"
                                >
                                    <Check size={16} />
                                </button>
                            )}
                            <button
                                onClick={handleSettings}
                                className="action-btn secondary"
                                title="Notification settings"
                            >
                                <Settings size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="action-btn secondary"
                                title="Close notifications"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="notification-filters">
                        {notificationTypes.map(({ key, label, count }) => (
                            <button
                                key={key}
                                className={`notification-filter-btn ${filter === key ? 'active' : ''}`}
                                onClick={() => setFilter(key)}
                            >
                                {label}
                                {count > 0 && <span className="filter-count">{count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    <div className="notifications-scroll-container">
                        {filteredNotifications.length === 0 ? (
                            <div className="empty-notifications-state">
                                <div className="empty-notifications-icon">
                                    <Bell size={48} />
                                </div>
                                <h4 className="empty-title">No notifications</h4>
                                <p className="empty-description">
                                    {filter === 'all'
                                        ? "You're all caught up!"
                                        : `No ${filter} notifications`}
                                </p>
                            </div>
                        ) : (
                            <div className="notifications-list">
                                {filteredNotifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${!notification.is_read ? 'notification-unread' : ''} ${getPriorityColor(notification.priority)}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-item-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-item-content">
                                            <div className="notification-item-header">
                                                <h5 className="notification-item-title">
                                                    {notification.title}
                                                </h5>
                                                <div className="notification-item-meta">
                                                    {!notification.is_read && (
                                                        <div className="unread-dot"></div>
                                                    )}
                                                    <span className="notification-time">
                                                        <Clock size={12} />
                                                        {getTimeAgo(notification.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="notification-item-message">
                                                {notification.message}
                                            </p>
                                            {notification.metadata && (
                                                <div className="notification-metadata">
                                                    {notification.metadata.customer_name && (
                                                        <span className="metadata-tag">
                                                            <User size={12} />
                                                            {notification.metadata.customer_name}
                                                        </span>
                                                    )}
                                                    {notification.metadata.courier_name && (
                                                        <span className="metadata-tag">
                                                            <Truck size={12} />
                                                            {notification.metadata.courier_name}
                                                        </span>
                                                    )}
                                                    {notification.metadata.order_id && (
                                                        <span className="metadata-tag">
                                                            Order: {notification.metadata.order_id.slice(-8)}
                                                        </span>
                                                    )}
                                                    {notification.metadata.ticket_id && (
                                                        <span className="metadata-tag">
                                                            Ticket: #{notification.metadata.ticket_id}
                                                        </span>
                                                    )}
                                                    {notification.metadata.status && (
                                                        <span className={`metadata-tag status-${notification.metadata.status}`}>
                                                            {notification.metadata.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="notification-panel-footer">
                            <button
                                onClick={handleViewAll}
                                className="view-all-notifications-btn"
                            >
                                <span>View all notifications</span>
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;