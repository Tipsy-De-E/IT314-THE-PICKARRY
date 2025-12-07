import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, Download, Shield, Truck, DollarSign, AlertTriangle } from 'lucide-react';
import '../../../styles/Menu-css/CourierPolicies.css';

const CourierPolicies = ({ onBack }) => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('code-of-conduct');

    const handleMenuClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/courier/menu');
        }
    };

    const policies = {
        'code-of-conduct': {
            title: 'Code of Conduct',
            icon: Shield,
            description: 'Professional standards and behavioral expectations',
            content: [
                'Always maintain professional behavior with customers and colleagues',
                'Respect customer privacy and confidentiality',
                'No discrimination or harassment of any kind',
                'Follow all traffic laws and regulations',
                'Report any incidents or accidents immediately',
                'Maintain proper hygiene and professional appearance',
                'Provide accurate delivery time estimates'
            ]
        },
        'delivery-standards': {
            title: 'Delivery Standards',
            icon: Truck,
            description: 'Quality and service delivery requirements',
            content: [
                'Ensure timely delivery within promised timeframes',
                'Verify customer identity for age-restricted items',
                'Handle packages with care and professionalism',
                'Maintain proper temperature control for food items',
                'Use proper packaging materials when required',
                'Confirm delivery with customers when possible',
                'Follow specific customer delivery instructions'
            ]
        },
        'payment-policies': {
            title: 'Payment Policies',
            icon: DollarSign,
            description: 'Earnings, payments, and financial guidelines',
            content: [
                'Payments are processed weekly every Friday',
                'Minimum payout threshold: ₱500',
                'Service fees and commission rates apply',
                'Tips go directly to the courier',
                'Report payment issues within 7 days',
                'Detailed earnings breakdown available in app',
                'Tax responsibilities are courier\'s responsibility'
            ]
        },
        'safety-protocols': {
            title: 'Safety Protocols',
            icon: AlertTriangle,
            description: 'Health, safety, and emergency procedures',
            content: [
                'Always wear safety gear when required',
                'Conduct vehicle safety checks daily',
                'Avoid dangerous areas and report concerns',
                'Emergency contact: 1-800-PICKARRY',
                'Follow COVID-19 safety guidelines',
                'Carry personal protective equipment',
                'Report unsafe working conditions immediately'
            ]
        }
    };

    const PolicyIcon = policies[activeSection].icon;

    return (
        <div className="courier-policies">
            <div className="policies-container">
                {/* Header */}
                <div className="policies-header">
                    <button onClick={handleMenuClick} className="back-button">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="header-content">
                        <div className="title-section">
                            <FileText className="title-icon" />
                            <h1>Courier Policies</h1>
                        </div>
                        <p className="subtitle">Review courier guidelines and policies</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="policies-navigation">
                    {Object.keys(policies).map((key) => {
                        const IconComponent = policies[key].icon;
                        return (
                            <button
                                key={key}
                                className={`nav-tab ${activeSection === key ? 'active' : ''}`}
                                onClick={() => setActiveSection(key)}
                            >
                                <IconComponent size={20} />
                                <span className="nav-text">{policies[key].title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <div className="policies-main-content">
                    <div className="policy-content-section">
                        {/* Policy Header */}
                        <div className="policy-header">
                            <div className="policy-title-section">
                                <div className="policy-icon">
                                    <PolicyIcon size={24} />
                                </div>
                                <div>
                                    <h2>{policies[activeSection].title}</h2>
                                    <p className="policy-description">
                                        {policies[activeSection].description}
                                    </p>
                                </div>
                            </div>
                            <button className="download-button">
                                <Download size={18} />
                                <span>Download PDF</span>
                            </button>
                        </div>

                        {/* Policy Items */}
                        <div className="policy-items-container">
                            <h3 className="section-title">Key Requirements</h3>
                            <div className="policy-items">
                                {policies[activeSection].content.map((item, index) => (
                                    <div key={index} className="policy-item">
                                        <div className="item-content">
                                            <CheckCircle className="item-icon" />
                                            <span className="item-text">{item}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important Reminders */}
                        <div className="reminders-section">
                            <div className="reminders-header">
                                <h3>Important Reminders</h3>
                                <div className="status-indicator">
                                    <div className="status-dot"></div>
                                    <span>Must Read</span>
                                </div>
                            </div>
                            <div className="reminders-grid">
                                <div className="reminder-card warning">
                                    <div className="reminder-header">
                                        <XCircle className="reminder-icon" />
                                        <span className="reminder-title">Violation Consequences</span>
                                    </div>
                                    <p>Violations may result in account suspension and temporary deactivation</p>
                                </div>
                                <div className="reminder-card critical">
                                    <div className="reminder-header">
                                        <XCircle className="reminder-icon" />
                                        <span className="reminder-title">Serious Offenses</span>
                                    </div>
                                    <p>Repeated offenses lead to permanent termination from the platform</p>
                                </div>
                                <div className="reminder-card success">
                                    <div className="reminder-header">
                                        <CheckCircle className="reminder-icon" />
                                        <span className="reminder-title">Compliance Benefits</span>
                                    </div>
                                    <p>Compliance ensures better earning opportunities and priority access</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions and Need Help at Bottom */}
                    <div className="bottom-actions-section">
                        <div className="action-card">
                            <h4>Quick Actions</h4>
                            <div className="action-buttons">
                                <button className="action-button">
                                    <Download size={16} />
                                    <span>Download All Policies</span>
                                </button>
                                <button className="action-button">
                                    <FileText size={16} />
                                    <span>View Agreement</span>
                                </button>
                                <button className="action-button">
                                    <Shield size={16} />
                                    <span>Safety Training</span>
                                </button>
                            </div>
                        </div>

                        <div className="support-card">
                            <h4>Need Help?</h4>
                            <p>Contact support for policy clarification</p>
                            <div className="support-info">
                                <div className="support-item">
                                    <span className="support-label">Email:</span>
                                    <span className="support-value">support@pickarry.com</span>
                                </div>
                                <div className="support-item">
                                    <span className="support-label">Phone:</span>
                                    <span className="support-value">1-800-PICKARRY</span>
                                </div>
                            </div>
                            <button className="support-button">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourierPolicies;