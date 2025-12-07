import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, Calendar, Menu, ChevronLeft, Send, MessageCircle } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import logo from '../../assets/images/LOGO.png';
import '../../styles/courier-support.css';

const CourierSupportComplaints = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    const handleLogout = () => {
        clearUserSession();
        navigate('/');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }
        // Handle submission logic here
        console.log({ category, subject, message });
        alert('Your feedback has been submitted successfully!');
        // Reset form
        setCategory('');
        setSubject('');
        setMessage('');
    };

    const categories = [
        'Payment Issue',
        'Order Problem',
        'Technical Issue',
        'Account Issue',
        'Safety Concern',
        'Other'
    ];

    return (
        <div className="courier-home">
            {/* Header */}
            <div className="courier-header">
                <div className="header-logo">
                    <img src={logo} alt="Pickarry Logo" className="w-19 h-12" />
                </div>
                <div className="header-right">
                    <button className="header-notification-btn">
                        <span className="notification-bell">🔔</span>
                        <span className="notification-dot"></span>
                    </button>
                    <div className="courier-profile">
                        <div className="profile-avatar">
                            <span>C</span>
                        </div>
                        <span className="profile-name">Courier</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
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
                        <button onClick={() => navigate('/courier/home')} className="nav-item">
                            <Home />
                            <span>Home</span>
                        </button>
                        <button onClick={() => navigate('/courier/history')} className="nav-item">
                            <FileText />
                            <span>Delivery</span>
                        </button>
                        <button onClick={() => navigate('/courier/book')} className="nav-item">
                            <Calendar />
                            <span>Book</span>
                        </button>
                        <button onClick={() => navigate('/courier/menu')} className="nav-item">
                            <Menu />
                            <span>Menu</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="courier-main-content">
                    <div className="page-header">
                        <button onClick={() => navigate('/courier/menu')} className="back-button">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1>Support & Complaints</h1>
                            <p>Get help and submit feedback</p>
                        </div>
                    </div>

                    <div className="support-container">
                        <div className="support-card">
                            <div className="support-header">
                                <MessageCircle className="support-icon" />
                                <h2>How can we help you?</h2>
                                <p>Please provide details about your concern and we'll get back to you as soon as possible.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="support-form">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Subject *</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Brief description of your concern"
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Please provide detailed information about your concern..."
                                        className="form-textarea"
                                        rows={6}
                                        required
                                    />
                                    <span className="char-count">{message.length} / 500</span>
                                </div>

                                <button type="submit" className="submit-button">
                                    <Send size={20} />
                                    Submit Feedback
                                </button>
                            </form>
                        </div>

                        <div className="support-info">
                            <div className="info-card">
                                <h3>Contact Information</h3>
                                <div className="info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">support@pickarry.com</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-value">+63 912 345 6789</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Hours:</span>
                                    <span className="info-value">24/7 Support</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <h3>Response Time</h3>
                                <p>We typically respond within 24-48 hours. For urgent matters, please call our hotline.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="courier-footer">
                <div className="footer-logo">
                    <img src={logo} alt="Pickarry Logo" className="w-8 h-8" />
                </div>
                <div className="footer-links">
                    <a href="#" className="footer-link">Contact Us</a>
                    <a href="#" className="footer-link">Terms of Use</a>
                    <a href="#" className="footer-link">Privacy Policy</a>
                </div>
                <div className="footer-copyright">
                    <p>© 2025 Pickarry - All rights reserved</p>
                </div>
            </div>
        </div>
    );
};

export default CourierSupportComplaints;