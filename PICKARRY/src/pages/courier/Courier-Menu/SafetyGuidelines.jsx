import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Car, Stethoscope, Phone } from 'lucide-react';
import '../../../styles/Menu-css/SafetyGuidelines.css';

const SafetyGuidelines = ({ onBack }) => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('vehicle');

    const handleMenuClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/courier/menu');
        }
    };

    const guidelines = {
        vehicle: {
            icon: Car,
            title: 'Vehicle Safety',
            items: [
                'Conduct daily vehicle inspections before starting work',
                'Check tire pressure, brakes, and lights regularly',
                'Ensure proper vehicle registration and insurance',
                'Keep emergency kit in vehicle at all times',
                'Report any vehicle issues immediately'
            ]
        },
        personal: {
            icon: Shield,
            title: 'Personal Safety',
            items: [
                'Always wear reflective clothing at night',
                'Carry personal identification and work ID',
                'Be aware of your surroundings at all times',
                'Avoid dangerous or poorly lit areas',
                'Trust your instincts - if it feels unsafe, leave'
            ]
        },
        emergency: {
            icon: AlertTriangle,
            title: 'Emergency Procedures',
            items: [
                'Memorize emergency contact: 1-800-PICKARRY',
                'In case of accident, call 911 first',
                'Document incidents with photos and notes',
                'Know basic first aid procedures',
                'Keep emergency cash and phone charger'
            ]
        },
        health: {
            icon: Stethoscope,
            title: 'Health & Wellness',
            items: [
                'Take regular breaks to avoid fatigue',
                'Stay hydrated and maintain proper nutrition',
                'Use proper lifting techniques for heavy packages',
                'Protect yourself from extreme weather conditions',
                'Report health concerns to management'
            ]
        }
    };

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
                            <Shield className="title-icon" />
                            <h1>Safety Guidelines</h1>
                        </div>
                        <p className="subtitle">Essential safety guidelines for couriers</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="maintenance-content">
                    <div className="safety-categories">
                        {Object.keys(guidelines).map((key) => {
                            const CategoryIcon = guidelines[key].icon;
                            return (
                                <button
                                    key={key}
                                    className={`safety-category ${activeCategory === key ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(key)}
                                >
                                    <CategoryIcon className="category-icon" />
                                    <span>{guidelines[key].title}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="guidelines-content">
                        <div className="guidelines-header">
                            <h2>{guidelines[activeCategory].title}</h2>
                            <div className="guidelines-count">
                                {guidelines[activeCategory].items.length} Guidelines
                            </div>
                        </div>

                        <div className="guidelines-list">
                            {guidelines[activeCategory].items.map((item, index) => (
                                <div key={index} className="guideline-item">
                                    <div className="guideline-number">{index + 1}</div>
                                    <div className="guideline-text">{item}</div>
                                </div>
                            ))}
                        </div>

                        <div className="safety-tips">
                            <h3>Quick Safety Tips</h3>
                            <div className="tips-grid">
                                <div className="safety-tip">
                                    <strong>Stay Visible</strong>
                                    <p>Use reflective gear and proper lighting</p>
                                </div>
                                <div className="safety-tip">
                                    <strong>Plan Routes</strong>
                                    <p>Check routes before starting delivery</p>
                                </div>
                                <div className="safety-tip">
                                    <strong>Emergency Kit</strong>
                                    <p>Keep first aid and emergency supplies</p>
                                </div>
                                <div className="safety-tip">
                                    <strong>Weather Ready</strong>
                                    <p>Check weather and dress appropriately</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyGuidelines;
