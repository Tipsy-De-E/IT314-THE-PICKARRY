// pages/NotificationsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Filter, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsPage = ({ userType }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const { notifications, markAsRead, markAllAsRead } = useNotifications(userType);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.is_read;
        return notification.type === filter;
    });

    const getNotificationTypes = () => {
        const types = [...new Set(notifications.map(n => n.type))];
        return types;
    };

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={24} />
                </button>
                <div className="header-content">
                    <Bell size={28} className="header-icon" />
                    <h1>Notifications</h1>
                </div>
                <div className="header-actions">
                    <button onClick={markAllAsRead} className="action-btn">
                        <Check size={20} />
                        Mark all read
                    </button>
                </div>
            </div>

            <div className="notifications-content">
                <div className="notifications-filters">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread Only</option>
                            {getNotificationTypes().map(type => (
                                <option key={type} value={type}>
                                    {type.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="notifications-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={48} className="empty-icon" />
                            <h3>No notifications</h3>
                            <p>When you get notifications, they'll appear here</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationCard = ({ notification, onMarkAsRead }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-gray-400',
            normal: 'text-blue-400',
            high: 'text-orange-400',
            urgent: 'text-red-400'
        };
        return colors[priority] || 'text-blue-400';
    };

    return (
        <div
            className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
            onClick={handleClick}
        >
            <div className="notification-main">
                <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className={`priority-badge ${getPriorityColor(notification.priority)}`}>
                        • {notification.priority}
                    </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                    <span className="notification-time">
                        {new Date(notification.created_at).toLocaleDateString()} •
                        {new Date(notification.created_at).toLocaleTimeString()}
                    </span>
                    <span className="notification-type">{notification.type}</span>
                </div>
            </div>
            {!notification.is_read && (
                <div className="notification-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                        className="mark-read-btn"
                    >
                        <Check size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;