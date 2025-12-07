import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Wrench, Calendar, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import '../../../styles/Menu-css/VehicleMaintenance.css';

const VehicleMaintenance = ({ onBack }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('checklist');

    const handleMenuClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/courier/menu');
        }
    };
    const [completedItems, setCompletedItems] = useState([1, 2, 4, 5, 8]);

    const maintenanceChecklist = [
        {
            category: 'Daily Checks',
            items: [
                { id: 1, name: 'Tire Pressure', completed: true },
                { id: 2, name: 'Brake Function', completed: true },
                { id: 3, name: 'Lights & Signals', completed: false },
                { id: 4, name: 'Oil Level', completed: true },
                { id: 5, name: 'Fuel Level', completed: true }
            ]
        },
        {
            category: 'Weekly Checks',
            items: [
                { id: 6, name: 'Chain Lubrication', completed: false },
                { id: 7, name: 'Brake Pads', completed: false },
                { id: 8, name: 'Tire Tread', completed: true },
                { id: 9, name: 'Battery Check', completed: false }
            ]
        },
        {
            category: 'Monthly Checks',
            items: [
                { id: 10, name: 'Engine Tune-up', completed: false },
                { id: 11, name: 'Suspension Check', completed: false },
                { id: 12, name: 'Wheel Alignment', completed: false }
            ]
        }
    ];

    const maintenanceTips = [
        {
            title: 'Tire Maintenance',
            description: 'Check tire pressure weekly and look for signs of wear. Proper inflation improves fuel efficiency and safety.',
            icon: '🛞',
            frequency: 'Weekly'
        },
        {
            title: 'Oil Changes',
            description: 'Regular oil changes are crucial for engine health. Follow manufacturer recommendations for your vehicle type.',
            icon: '🛢️',
            frequency: 'Every 3,000-5,000 km'
        },
        {
            title: 'Brake Inspection',
            description: 'Listen for unusual noises and check brake responsiveness. Replace pads before they wear completely.',
            icon: '🛑',
            frequency: 'Every 6 months'
        },
        {
            title: 'Battery Care',
            description: 'Keep terminals clean and check voltage regularly. Extreme temperatures affect battery life.',
            icon: '🔋',
            frequency: 'Monthly'
        },
        {
            title: 'Chain Maintenance',
            description: 'Lubricate motorcycle chains regularly and check for proper tension to ensure smooth operation.',
            icon: '⛓️',
            frequency: 'Every 500 km'
        },
        {
            title: 'Coolant System',
            description: 'Check coolant levels and look for leaks. Overheating can cause serious engine damage.',
            icon: '🌡️',
            frequency: 'Monthly'
        }
    ];

    const serviceSchedule = [
        {
            period: 'Every 3,000 km',
            services: ['Oil Change', 'Filter Replacement', 'Basic Inspection'],
            icon: '🛢️'
        },
        {
            period: 'Every 6,000 km',
            services: ['Tire Rotation', 'Brake Check', 'Chain Lubrication'],
            icon: '🛞'
        },
        {
            period: 'Every 12,000 km',
            services: ['Full Brake Inspection', 'Suspension Check', 'Battery Test'],
            icon: '🔧'
        },
        {
            period: 'Every 24,000 km',
            services: ['Major Service', 'Engine Tune-up', 'Complete Vehicle Check'],
            icon: '⚙️'
        }
    ];

    const servicePartners = [
        {
            name: 'QuickLube Pro',
            benefits: '15% discount for Pickarry couriers',
            distance: '2.3 km away',
            rating: '4.8 ★',
            address: '123 Main Street'
        },
        {
            name: 'AutoCare Express',
            benefits: 'Priority service for delivery drivers',
            distance: '3.1 km away',
            rating: '4.6 ★',
            address: '456 Service Road'
        },
        {
            name: 'Bike Masters',
            benefits: 'Specialized motorcycle service',
            distance: '1.8 km away',
            rating: '4.9 ★',
            address: '789 Rider Avenue'
        }
    ];

    const toggleChecklistItem = (itemId) => {
        setCompletedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const calculateCompletion = () => {
        const totalItems = maintenanceChecklist.reduce((acc, section) => acc + section.items.length, 0);
        const completedCount = completedItems.length;
        return Math.round((completedCount / totalItems) * 100);
    };

    const completionRate = calculateCompletion();

    return (
        <div className="vehicle-maintenance">
            <div className="maintenance-container">
                {/* Header */}
                <div className="maintenance-header">
                    <button onClick={handleMenuClick} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content">
                        <div className="title-section">
                            <Truck className="title-icon" />
                            <h1>Vehicle Maintenance</h1>
                        </div>
                        <p className="subtitle">Keep your vehicle in top condition for safe deliveries</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="maintenance-tabs">
                    <button
                        className={`tab-button ${activeTab === 'checklist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('checklist')}
                    >
                        <CheckCircle size={20} />
                        <span>Checklist</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'tips' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tips')}
                    >
                        <Wrench size={20} />
                        <span>Tips</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        <Calendar size={20} />
                        <span>Schedule</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="maintenance-content">
                    {/* Checklist Tab */}
                    {activeTab === 'checklist' && (
                        <div className="tab-content checklist-tab">
                            <div className="content-header">
                                <h2>Maintenance Checklist</h2>
                                <div className="completion-status">
                                    <span className="completion-text">{completionRate}% Complete</span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${completionRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="checklist-sections">
                                {maintenanceChecklist.map((section) => (
                                    <div key={section.category} className="checklist-section">
                                        <h3 className="section-title">{section.category}</h3>
                                        <div className="checklist-items">
                                            {section.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`checklist-item ${completedItems.includes(item.id) ? 'completed' : ''}`}
                                                    onClick={() => toggleChecklistItem(item.id)}
                                                >
                                                    <div className="item-left">
                                                        <div className="check-box">
                                                            {completedItems.includes(item.id) && (
                                                                <CheckCircle size={16} />
                                                            )}
                                                        </div>
                                                        <span className="item-text">{item.name}</span>
                                                    </div>
                                                    {completedItems.includes(item.id) ? (
                                                        <CheckCircle className="status-icon completed" size={20} />
                                                    ) : (
                                                        <AlertTriangle className="status-icon pending" size={20} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tips Tab */}
                    {activeTab === 'tips' && (
                        <div className="tab-content tips-tab">
                            <div className="content-header">
                                <h2>Maintenance Tips</h2>
                                <p className="section-description">Essential tips to keep your vehicle running smoothly</p>
                            </div>

                            <div className="tips-grid">
                                {maintenanceTips.map((tip, index) => (
                                    <div key={index} className="tip-card">
                                        <div className="tip-header">
                                            <div className="tip-icon">{tip.icon}</div>
                                            <div className="tip-title-section">
                                                <h3>{tip.title}</h3>
                                                <span className="frequency-badge">{tip.frequency}</span>
                                            </div>
                                        </div>
                                        <p className="tip-description">{tip.description}</p>
                                        <button className="reminder-btn">
                                            <Clock size={16} />
                                            Set Reminder
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="maintenance-alert">
                                <div className="alert-content">
                                    <AlertTriangle className="alert-icon" />
                                    <div className="alert-text">
                                        <h3>Next Service Due</h3>
                                        <p>15 days or 500 km remaining</p>
                                    </div>
                                </div>
                                <button className="schedule-btn">Schedule Now</button>
                            </div>
                        </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="tab-content schedule-tab">
                            <div className="content-header">
                                <h2>Service Schedule</h2>
                                <p className="section-description">Recommended maintenance intervals</p>
                            </div>

                            <div className="schedule-cards">
                                {serviceSchedule.map((schedule, index) => (
                                    <div key={index} className="schedule-card">
                                        <div className="schedule-header">
                                            <div className="schedule-icon">{schedule.icon}</div>
                                            <div className="schedule-period">{schedule.period}</div>
                                        </div>
                                        <div className="services-list">
                                            {schedule.services.map((service, sIndex) => (
                                                <div key={sIndex} className="service-item">
                                                    <CheckCircle size={16} />
                                                    <span>{service}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="partners-section">
                                <h3>Recommended Service Centers</h3>
                                <div className="partners-list">
                                    {servicePartners.map((partner, index) => (
                                        <div key={index} className="partner-card">
                                            <div className="partner-header">
                                                <h4>{partner.name}</h4>
                                                <span className="rating">{partner.rating}</span>
                                            </div>
                                            <p className="partner-benefit">{partner.benefits}</p>
                                            <div className="partner-details">
                                                <div className="detail-item">
                                                    <MapPin size={14} />
                                                    <span>{partner.distance}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span>{partner.address}</span>
                                                </div>
                                            </div>
                                            <button className="contact-btn">Contact</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleMaintenance;