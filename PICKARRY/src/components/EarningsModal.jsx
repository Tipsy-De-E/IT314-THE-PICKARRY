// components/EarningsModal.jsx
import React from 'react';
import { X, DollarSign } from 'lucide-react';
import '../styles/Courier-css/earnings-modal.css';

const EarningsModal = ({
    isOpen,
    onClose,
    earnings,
    title,
    type,
    totalEarnings = 0,
    todayEarnings = 0,
    weeklyEarnings = 0,
    monthlyEarnings = 0
}) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getServiceType = (earning) => {
        if (earning.orders) {
            return earning.orders.selected_service || 'Delivery';
        }
        return earning.type === 'delivery' ? 'Delivery' : 'Booking';
    };

    const getServiceBadgeClass = (serviceType) => {
        const type = serviceType.toLowerCase();
        if (type === 'pasugo') return 'pasugo';
        if (type === 'pasundo') return 'pasundo';
        if (type === 'booking') return 'booking';
        return 'delivery';
    };

    const getLocationInfo = (earning) => {
        if (earning.orders) {
            return {
                pickup: earning.orders.pickup_location,
                delivery: earning.orders.delivery_location,
                customer: earning.orders.customers?.full_name
            };
        }
        return { pickup: 'N/A', delivery: 'N/A', customer: 'N/A' };
    };

    const getOrderNumber = (earning) => {
        if (earning.orders && earning.orders.id) {
            return `ORD-${String(earning.orders.id).slice(-8).toUpperCase()}`;
        }
        if (earning.order_id) {
            return `ORD-${String(earning.order_id).slice(-8).toUpperCase()}`;
        }
        return `EARN-${String(earning.id).slice(-8).toUpperCase()}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="pickarry-earnings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pickarry-modal-header">
                    <h2>{title}</h2>
                    <button className="pickarry-close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="pickarry-modal-body">
                    {/* Earnings Summary - Horizontal Layout */}
                    <div className="pickarry-summary-cards">
                        <div className="pickarry-summary-card">
                            <span className="pickarry-summary-label">Today</span>
                            <span className="pickarry-summary-amount">₱{todayEarnings.toFixed(2)}</span>
                        </div>
                        <div className="pickarry-summary-card">
                            <span className="pickarry-summary-label">This Week</span>
                            <span className="pickarry-summary-amount">₱{weeklyEarnings.toFixed(2)}</span>
                        </div>
                        <div className="pickarry-summary-card">
                            <span className="pickarry-summary-label">This Month</span>
                            <span className="pickarry-summary-amount">₱{monthlyEarnings.toFixed(2)}</span>
                        </div>
                        <div className="pickarry-summary-card">
                            <span className="pickarry-summary-label">Total Earnings</span>
                            <span className="pickarry-summary-amount">₱{totalEarnings.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Transaction History with Table */}
                    <div className="pickarry-list-container">
                        <div className="pickarry-list-header">
                            <h3>Transaction History</h3>
                            <span className="pickarry-transaction-count">
                                {earnings.length} Transactions
                            </span>
                        </div>

                        <div className="pickarry-table-container">
                            {earnings.length === 0 ? (
                                <div className="pickarry-no-earnings">
                                    <DollarSign size={48} className="pickarry-no-earnings-icon" />
                                    <p>No {title.toLowerCase()} recorded yet</p>
                                </div>
                            ) : (
                                <table className="pickarry-earnings-table">
                                    <thead className="pickarry-table-header">
                                        <tr className="pickarry-table-header-row">
                                            <th className="pickarry-table-header-cell">OrderID</th>
                                            <th className="pickarry-table-header-cell">Location</th>
                                            <th className="pickarry-table-header-cell">Date/Time</th>
                                            <th className="pickarry-table-header-cell">Customer</th>
                                            <th className="pickarry-table-header-cell">Amount</th>
                                            <th className="pickarry-table-header-cell">Type of Service</th>
                                        </tr>
                                    </thead>
                                    <tbody className="pickarry-table-body">
                                        {earnings.map((earning, index) => {
                                            const locations = getLocationInfo(earning);
                                            const serviceType = getServiceType(earning);
                                            const badgeClass = getServiceBadgeClass(serviceType);

                                            return (
                                                <tr key={earning.id || index} className="pickarry-table-row">
                                                    <td className="pickarry-table-cell pickarry-order-id">
                                                        {getOrderNumber(earning)}
                                                    </td>
                                                    <td className="pickarry-table-cell pickarry-location">
                                                        <div className="pickarry-location-text">
                                                            <span className="pickarry-route">
                                                                {locations.pickup} → {locations.delivery}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="pickarry-table-cell pickarry-date-time">
                                                        {formatDate(earning.created_at)}
                                                    </td>
                                                    <td className="pickarry-table-cell pickarry-customer">
                                                        {locations.customer}
                                                    </td>
                                                    <td className="pickarry-table-cell pickarry-amount">
                                                        ₱{parseFloat(earning.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="pickarry-table-cell pickarry-service-type">
                                                        <span className={`pickarry-service-badge ${badgeClass}`}>
                                                            {serviceType}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsModal;