// components/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, ArrowLeft, ToggleLeft, ToggleRight, UserPlus, FileText, MessageSquare, AlertCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationSettings = ({ userType }) => {
    const navigate = useNavigate();
    const { preferences, updatePreference } = useNotifications(userType);
    const [localPreferences, setLocalPreferences] = useState({});

    useEffect(() => {
        setLocalPreferences(preferences);
    }, [preferences]);

    const getNotificationTypes = () => {
        if (userType === 'admin') {
            return [
                {
                    key: 'new_customer_signup',
                    label: 'New Customer Signups',
                    description: 'Notifications when new customers register on the platform',
                    icon: <UserPlus size={16} />
                },
                {
                    key: 'new_courier_application',
                    label: 'Courier Applications',
                    description: 'Notifications when new couriers submit applications',
                    icon: <FileText size={16} />
                },
                {
                    key: 'support_ticket',
                    label: 'Support Tickets',
                    description: 'Notifications for new support tickets and messages',
                    icon: <MessageSquare size={16} />
                },
                {
                    key: 'complaint_reported',
                    label: 'Complaints & Reports',
                    description: 'Notifications for user complaints and reported issues',
                    icon: <AlertCircle size={16} />
                },
                {
                    key: 'urgent_issue',
                    label: 'Urgent Issues',
                    description: 'Critical alerts requiring immediate attention',
                    icon: <AlertCircle size={16} />
                },
                {
                    key: 'system_alert',
                    label: 'System Alerts',
                    description: 'Important system updates and maintenance notifications',
                    icon: <Shield size={16} />
                }
            ];
        } else {
            return [
                {
                    key: 'delivery_update',
                    label: 'Delivery Updates',
                    description: 'Order status changes, courier assignments, and delivery progress'
                },
                {
                    key: 'new_order',
                    label: 'New Order Alerts',
                    description: 'New delivery requests in your area (for couriers)'
                },
                {
                    key: 'payment_update',
                    label: 'Payment Notifications',
                    description: 'Payment confirmations, failures, and refunds'
                },
                {
                    key: 'rating_received',
                    label: 'Rating Notifications',
                    description: 'When you receive new ratings or reviews'
                },
                {
                    key: 'report_update',
                    label: 'Report Updates',
                    description: 'Status updates on submitted reports or complaints'
                },
                {
                    key: 'system_alert',
                    label: 'System Alerts',
                    description: 'Important system updates and announcements'
                },
                {
                    key: 'rule_change',
                    label: 'Policy Changes',
                    description: 'Updates to terms of service or platform policies'
                },
                {
                    key: 'promotion',
                    label: 'Promotions & Offers',
                    description: 'Special offers, discounts, and promotional content'
                }
            ];
        }
    };

    const notificationTypes = getNotificationTypes();

    const handleToggle = async (type, enabled) => {
        setLocalPreferences(prev => ({ ...prev, [type]: enabled }));
        await updatePreference(type, enabled);
    };

    return (
        <div className="notification-settings-container">
            <div className="settings-header">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="settings-title">
                    {userType === 'admin' ? 'Admin Notification Settings' : 'Notification Settings'}
                </h1>
            </div>

            <div className="settings-content">
                <div className="settings-section">
                    <h2 className="section-title">Notification Preferences</h2>
                    <p className="section-description">
                        Choose which notifications you want to receive
                    </p>

                    <div className="preferences-list">
                        {notificationTypes.map(({ key, label, description, icon }) => (
                            <div key={key} className="preference-item">
                                <div className="preference-info">
                                    <div className="preference-header">
                                        {icon && <span className="preference-icon">{icon}</span>}
                                        <h3 className="preference-label">{label}</h3>
                                    </div>
                                    <p className="preference-description">{description}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(key, !localPreferences[key])}
                                    className={`toggle-btn ${localPreferences[key] !== false ? 'active' : ''}`}
                                >
                                    {localPreferences[key] !== false ? (
                                        <ToggleRight size={32} className="toggle-icon active" />
                                    ) : (
                                        <ToggleLeft size={32} className="toggle-icon" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-section">
                    <h2 className="section-title">Notification Types</h2>
                    <div className="notification-types-grid">
                        <div className="type-card">
                            <div className="type-icon high-priority">
                                <Bell size={20} />
                            </div>
                            <h3>High Priority</h3>
                            <p>Critical alerts that require immediate attention</p>
                        </div>
                        <div className="type-card">
                            <div className="type-icon normal-priority">
                                <Bell size={20} />
                            </div>
                            <h3>Normal Priority</h3>
                            <p>Regular updates about platform activities</p>
                        </div>
                        <div className="type-card">
                            <div className="type-icon low-priority">
                                <Bell size={20} />
                            </div>
                            <h3>Low Priority</h3>
                            <p>Informational updates and non-urgent notifications</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;