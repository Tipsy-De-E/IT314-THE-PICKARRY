import React, { useState } from 'react';
import { ArrowLeft, Bell, Shield, Eye, Globe, MessageCircle } from 'lucide-react';
// import '../../../styles/Customer-css/css-Menu/CustomerS.css';

const CustomerSettings = ({ onBack }) => {
    const [settings, setSettings] = useState({
        notifications: true,
        emailUpdates: true,
        smsAlerts: false,
        privacyMode: true,
        locationServices: true,
        language: 'english'
    });

    const handleToggle = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const settingOptions = [
        {
            icon: Bell,
            title: 'Push Notifications',
            description: 'Receive order updates and promotions',
            type: 'toggle',
            key: 'notifications'
        },
        {
            icon: MessageCircle,
            title: 'Email Updates',
            description: 'Get order summaries and newsletters',
            type: 'toggle',
            key: 'emailUpdates'
        },
        {
            icon: Bell,
            title: 'SMS Alerts',
            description: 'Text messages for urgent updates',
            type: 'toggle',
            key: 'smsAlerts'
        },
        {
            icon: Eye,
            title: 'Privacy Mode',
            description: 'Hide personal information from riders',
            type: 'toggle',
            key: 'privacyMode'
        },
        {
            icon: Globe,
            title: 'Location Services',
            description: 'Allow location access for better delivery',
            type: 'toggle',
            key: 'locationServices'
        },
        {
            icon: Shield,
            title: 'Privacy Policy',
            description: 'View how we protect your data',
            type: 'link',
            action: () => console.log('Privacy Policy')
        }
    ];

    return (
        <div className="customer-feature-page">
            <div className="feature-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />

                </button>
                <div className="feature-title">
                    <Bell size={24} />
                    <h1>Settings</h1>
                </div>
                <p className="feature-description">
                    Manage your account preferences and privacy settings
                </p>
            </div>

            <div className="settings-content">
                <div className="settings-section">
                    <h3>Notification Preferences</h3>
                    <div className="settings-list">
                        {settingOptions.slice(0, 3).map((option, index) => (
                            <div key={index} className="setting-item">
                                <div className="setting-info">
                                    <div className="setting-icon">
                                        <option.icon size={20} />
                                    </div>
                                    <div className="setting-text">
                                        <h4>{option.title}</h4>
                                        <p>{option.description}</p>
                                    </div>
                                </div>
                                {option.type === 'toggle' && (
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings[option.key]}
                                            onChange={() => handleToggle(option.key)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Privacy & Security</h3>
                    <div className="settings-list">
                        {settingOptions.slice(3).map((option, index) => (
                            <div key={index} className="setting-item">
                                <div className="setting-info">
                                    <div className="setting-icon">
                                        <option.icon size={20} />
                                    </div>
                                    <div className="setting-text">
                                        <h4>{option.title}</h4>
                                        <p>{option.description}</p>
                                    </div>
                                </div>
                                {option.type === 'toggle' ? (
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings[option.key]}
                                            onChange={() => handleToggle(option.key)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                ) : (
                                    <button className="link-button" onClick={option.action}>
                                        View
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Language</h3>
                    <div className="language-selector">
                        <select
                            value={settings.language}
                            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                            className="language-select"
                        >
                            <option value="english">English</option>
                            <option value="filipino">Filipino</option>
                            <option value="spanish">Spanish</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSettings;