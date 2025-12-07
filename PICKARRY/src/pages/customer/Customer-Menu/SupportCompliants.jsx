import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, HelpCircle, AlertTriangle, Send, Phone, Mail, Clock, Truck } from 'lucide-react';
import { supabase } from '../../../utils/supabaseClient';
import { getCurrentUser } from '../../../utils/auth';
import notificationService from '../../../hooks/notificationService';
import '../../../styles/Customer-css/css-Menu/SupportCompliants.css';

const SupportComplaints = ({ onBack }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('support');
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        category: 'general',
        reportedUserId: '',
        orderId: ''
    });

    const [couriersList, setCouriersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentCustomerId, setCurrentCustomerId] = useState(null);
    const [currentCustomerName, setCurrentCustomerName] = useState('');
    const [currentCustomerEmail, setCurrentCustomerEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCurrentCustomer();
    }, []);

    const fetchCurrentCustomer = async () => {
        try {
            setLoading(true);
            const session = getCurrentUser();

            if (!session) {
                navigate('/customer/auth');
                return;
            }

            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('id, full_name, email')
                .eq('email', session.email)
                .single();

            if (customerError) throw customerError;

            setCurrentCustomerId(customerData.id);
            setCurrentCustomerName(customerData.full_name);
            setCurrentCustomerEmail(customerData.email);
            await fetchCustomerCouriersList(customerData.id);

        } catch (error) {
            console.error('Error fetching current customer:', error);
            setError('Failed to load customer data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerCouriersList = async (customerId) => {
        try {
            setLoading(true);
            setError('');

            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id,
                    courier_id,
                    couriers:courier_id (
                        id,
                        full_name,
                        email,
                        phone,
                        vehicle_type,
                        vehicle_brand,
                        vehicle_model
                    ),
                    delivery_date,
                    created_at,
                    pickup_location,
                    delivery_location,
                    selected_service,
                    status
                `)
                .eq('customer_id', customerId)
                .not('courier_id', 'is', null)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const uniqueCouriers = [];
            const seenCouriers = new Set();

            orders.forEach(order => {
                if (order.courier_id && order.couriers) {
                    const courierKey = `courier_${order.courier_id}`;
                    if (!seenCouriers.has(courierKey)) {
                        seenCouriers.add(courierKey);
                        uniqueCouriers.push({
                            id: order.courier_id,
                            name: order.couriers.full_name || `Courier #${order.courier_id}`,
                            email: order.couriers.email,
                            phone: order.couriers.phone,
                            type: 'courier',
                            vehicle: `${order.couriers.vehicle_type} - ${order.couriers.vehicle_brand} ${order.couriers.vehicle_model}`,
                            orderId: order.id,
                            serviceDate: order.delivery_date || order.created_at,
                            orderDetails: {
                                pickupLocation: order.pickup_location,
                                deliveryLocation: order.delivery_location,
                                serviceType: order.selected_service,
                                status: order.status
                            }
                        });
                    }
                }
            });

            setCouriersList(uniqueCouriers);
        } catch (error) {
            console.error('Error fetching customer couriers list:', error);
            setError('Failed to load courier list. Please try again.');
            setCouriersList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/customer/menu');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.reportedUserId) {
            alert('Please select a courier to report.');
            return;
        }

        try {
            setSubmitting(true);

            const selectedCourier = couriersList.find(courier => courier.id.toString() === formData.reportedUserId);

            const supportData = {
                subject: formData.subject,
                message: formData.message,
                category: formData.category,
                reporter_type: 'customer',
                reporter_id: currentCustomerId,
                reporter_name: currentCustomerName,
                reporter_email: currentCustomerEmail,
                reported_user_type: 'courier',
                reported_user_id: selectedCourier.id,
                reported_user_name: selectedCourier.name,
                reported_user_email: selectedCourier.email,
                order_id: formData.orderId || selectedCourier.orderId,
                status: 'open',
                priority: activeTab === 'complaint' ? 'high' : 'medium',
                ticket_type: activeTab === 'support' ? 'support' : 'complaint',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('support_complaints')
                .insert([supportData])
                .select()
                .single();

            if (error) throw error;

            console.log('Support request submitted:', supportData);

            // Send notifications
            await sendNotifications(supportData, selectedCourier);

            alert(`Your ${activeTab === 'support' ? 'support request' : 'complaint'} regarding ${selectedCourier?.name} has been submitted! We will get back to you within 24-48 hours.`);

            // Reset form
            setFormData({
                subject: '',
                message: '',
                category: 'general',
                reportedUserId: '',
                orderId: ''
            });

        } catch (error) {
            console.error('Error submitting support request:', error);
            alert('Failed to submit your request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const sendNotifications = async (supportData, reportedCourier) => {
        try {
            // Notify the reported courier
            await notificationService.createNotification({
                user_id: reportedCourier.id,
                user_type: 'courier',
                title: `⚠️ You've Been ${supportData.ticket_type === 'complaint' ? 'Reported' : 'Mentioned in a Support Request'}`,
                message: `${currentCustomerName} has filed a ${supportData.ticket_type} regarding your service. Subject: "${supportData.subject}"`,
                type: 'report_submitted',
                related_entity_type: 'support_complaint',
                related_entity_id: supportData.id,
                action_url: '/courier/support',
                priority: 'high',
                metadata: {
                    ticket_id: supportData.id,
                    reporter_name: currentCustomerName,
                    reporter_type: 'customer',
                    ticket_type: supportData.ticket_type,
                    subject: supportData.subject,
                    order_id: supportData.order_id,
                    reported_at: new Date().toISOString()
                }
            });

            // Notify admin about new complaint/report
            await notificationService.notifyNewSupportComplaint(supportData, 'customer');

        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'reportedUserId' && value) {
            const selectedCourier = couriersList.find(courier => courier.id.toString() === value);
            if (selectedCourier) {
                setFormData(prev => ({
                    ...prev,
                    orderId: selectedCourier.orderId
                }));
            }
        }
    };

    // ... rest of the component remains the same ...
    const contactMethods = [
        {
            icon: Phone,
            label: 'Phone Support',
            value: '+1-800-SUPPORT',
            description: 'Available 24/7 for urgent issues'
        },
        {
            icon: Mail,
            label: 'Email',
            value: 'support@pickarry.com',
            description: 'Send detailed inquiries'
        },
        {
            icon: Clock,
            label: 'Response Time',
            value: '24-48 hours',
            description: 'Typical response time'
        }
    ];

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Issue' },
        { value: 'payment', label: 'Payment Issue' },
        { value: 'delivery', label: 'Delivery Problem' },
        { value: 'safety', label: 'Safety Concern' },
        { value: 'courier_behavior', label: 'Courier Behavior' },
        { value: 'service_quality', label: 'Service Quality' },
        { value: 'damaged_items', label: 'Damaged Items' },
        { value: 'late_delivery', label: 'Late Delivery' },
        { value: 'communication_issue', label: 'Communication Issue' },
        { value: 'complaint', label: 'Formal Complaint' },
        { value: 'suggestion', label: 'Suggestion' },
        { value: 'other', label: 'Other' }
    ];

    const formatServiceDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getCourierDisplayInfo = (courier) => {
        let info = courier.name;
        if (courier.vehicle) {
            info += ` - ${courier.vehicle}`;
        }
        return info;
    };

    return (
        <div className="support-complaints">
            <div className="support-container">
                {/* Header */}
                <div className="support-header">
                    <button onClick={handleMenuClick} className="back-button">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="header-content">
                        <div className="title-section">
                            <MessageCircle className="title-icon" />
                            <h1>Support & Complaints</h1>
                        </div>
                        <p className="subtitle">
                            Report issues with couriers or get support for delivery-related concerns
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="support-tabs">
                    <button
                        className={`tab-button ${activeTab === 'support' ? 'active' : ''}`}
                        onClick={() => setActiveTab('support')}
                    >
                        <HelpCircle size={20} />
                        <span>Support Request</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'complaint' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaint')}
                    >
                        <AlertTriangle size={20} />
                        <span>File Complaint</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="support-main-content">
                    {/* Form Section */}
                    <div className="form-section-support">
                        <div className="form-header">
                            <h2>
                                {activeTab === 'support' ? 'Submit Support Request' : 'File Formal Complaint'}
                            </h2>
                            <p className="form-description">
                                {activeTab === 'support'
                                    ? "Describe your issue with a courier and we'll help you resolve it quickly"
                                    : "Report serious concerns about a courier that require immediate attention"
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertTriangle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="support-form">
                            {/* Courier Selection Dropdown */}
                            <div className="form-group">
                                <label className="form-label">
                                    <div className="label-with-icon">
                                        <Truck size={18} />
                                        <span>Select Courier</span>
                                    </div>
                                    <span className="required">*</span>
                                </label>
                                <select
                                    name="reportedUserId"
                                    value={formData.reportedUserId}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Choose a courier...</option>
                                    {couriersList.map(courier => (
                                        <option key={`courier_${courier.id}_${courier.orderId}`} value={courier.id}>
                                            {getCourierDisplayInfo(courier)} - Order: {courier.orderId} - {formatServiceDate(courier.serviceDate)}
                                        </option>
                                    ))}
                                </select>
                                {loading && (
                                    <div className="loading-text">Loading courier list...</div>
                                )}
                                {!loading && couriersList.length === 0 && (
                                    <div className="no-users-message">
                                        No couriers found in your order history. Support requests will appear here after you complete deliveries.
                                    </div>
                                )}
                                <div className="dropdown-description">
                                    Select the courier you want to report or get support about
                                </div>
                            </div>

                            {/* Order ID (auto-filled but visible) */}
                            {formData.orderId && (
                                <div className="form-group">
                                    <label className="form-label">
                                        Related Order ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.orderId}
                                        className="form-input"
                                        disabled
                                    />
                                    <div className="dropdown-description">
                                        This order ID is automatically associated with your selected courier
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">
                                    Category
                                    <span className="required">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Subject
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Brief description of your issue with the courier..."
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Message
                                    <span className="required">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder={
                                        activeTab === 'support'
                                            ? 'Please describe your issue with the courier in detail. Include any relevant order numbers, dates, specific problems, or delivery issues...'
                                            : 'Please provide detailed information about your complaint regarding the courier. Include dates, times, specific incidents, and any supporting evidence...'
                                    }
                                    className="form-textarea"
                                    rows="6"
                                    maxLength="1000"
                                    required
                                />
                                <div className="character-count">
                                    {formData.message.length}/1000 characters
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={!formData.reportedUserId || submitting || loading}
                            >
                                <Send size={20} />
                                <span>
                                    {submitting ? 'Submitting...' : `Submit ${activeTab === 'support' ? 'Support Request' : 'Formal Complaint'}`}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="contact-section-bottom">
                    <div className="contact-section-header">
                        <h2>Contact Information & Guidelines</h2>
                        <p>Get immediate assistance or learn how to submit effective support requests</p>
                    </div>

                    <div className="contact-section">
                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon">
                                    <HelpCircle size={24} />
                                </div>
                                <h4>What to Include in Your Request</h4>
                            </div>
                            <p className="info-description">
                                To help us resolve your issue faster, please include the following information:
                            </p>
                            <ul className="info-list">
                                <li>Order or reference numbers</li>
                                <li>Specific dates and times</li>
                                <li>Detailed description of the issue</li>
                                <li>Courier's name and vehicle information</li>
                                <li>Pickup and delivery locations</li>
                                <li>Photos or screenshots if available</li>
                                <li>Your contact information</li>
                            </ul>
                        </div>

                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon">
                                    <AlertTriangle size={24} />
                                </div>
                                <h4>Customer-Specific Guidelines</h4>
                            </div>
                            <p className="info-description">
                                When reporting a courier issue, please ensure:
                            </p>
                            <ul className="info-list">
                                <li>Be specific and factual in your description</li>
                                <li>Include relevant order numbers and delivery dates</li>
                                <li>Describe the courier behavior or issue clearly</li>
                                <li>Provide any evidence you may have (photos, messages)</li>
                                <li>Remain professional in your communication</li>
                                <li>For urgent safety issues, contact support immediately</li>
                                <li>Allow 24-48 hours for investigation and response</li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Methods */}
                    <div className="contact-methods-section">
                        <h3>Immediate Contact Options</h3>
                        <div className="contact-methods-grid">
                            {contactMethods.map((method, index) => (
                                <div key={index} className="contact-method-card">
                                    <div className="contact-method-icon">
                                        {React.createElement(method.icon, { size: 24 })}
                                    </div>
                                    <div className="contact-method-info">
                                        <h4>{method.label}</h4>
                                        <p className="contact-value">{method.value}</p>
                                        <p className="contact-description">{method.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Emergency Notice */}
                        <div className="emergency-notice">
                            <AlertTriangle size={16} />
                            <span>For safety emergencies or immediate threats, call emergency services first: 911</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportComplaints;