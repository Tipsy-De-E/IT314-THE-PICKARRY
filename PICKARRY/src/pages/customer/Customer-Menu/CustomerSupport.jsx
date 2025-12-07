import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, Clock } from 'lucide-react';

const CustomerSupport = ({ onBack }) => {
    const [formData, setFormData] = useState({
        category: 'general',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Support request:', formData);
        alert('Your support request has been submitted! We will get back to you within 24 hours.');
        setFormData({ category: 'general', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const contactMethods = [
        {
            icon: Phone,
            title: 'Phone Support',
            value: '1-800-PICKARRY',
            description: 'Available 24/7 for urgent issues',
            available: true
        },
        {
            icon: Mail,
            title: 'Email Support',
            value: 'support@pickarry.com',
            description: 'Response within 24 hours',
            available: true
        },
        {
            icon: Clock,
            title: 'Live Chat',
            value: 'Available 8AM-8PM',
            description: 'Instant messaging support',
            available: false
        }
    ];

    const faqs = [
        {
            question: 'How do I track my delivery?',
            answer: 'You can track your delivery in real-time through the Orders section in the app.'
        },
        {
            question: 'What if my item is damaged?',
            answer: 'Report damaged items within 2 hours of delivery for immediate assistance.'
        },
        {
            question: 'How can I change my delivery address?',
            answer: 'Contact support immediately if the courier has not yet picked up your item.'
        }
    ];

    return (
        <div className="customer-feature-page">
            <div className="feature-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />

                </button>
                <div className="feature-title">
                    <MessageCircle size={24} />
                    <h1>Support & Help</h1>
                </div>
                <p className="feature-description">
                    Get help with your deliveries and contact our support team
                </p>
            </div>

            <div className="support-content">
                <div className="support-main">
                    <div className="support-form-section">
                        <h3>Submit a Support Request</h3>
                        <form onSubmit={handleSubmit} className="support-form">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="delivery">Delivery Issue</option>
                                    <option value="payment">Payment Problem</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Brief description of your issue"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Please describe your issue in detail..."
                                    className="form-textarea"
                                    rows="5"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">
                                Submit Request
                            </button>
                        </form>
                    </div>

                    <div className="faq-section">
                        <h3>Frequently Asked Questions</h3>
                        <div className="faq-list">
                            {faqs.map((faq, index) => (
                                <div key={index} className="faq-item">
                                    <h4>{faq.question}</h4>
                                    <p>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="contact-sidebar">
                    <h3>Contact Methods</h3>
                    <div className="contact-methods">
                        {contactMethods.map((method, index) => {
                            const Icon = method.icon;
                            return (
                                <div key={index} className={`contact-method ${method.available ? 'available' : 'unavailable'}`}>
                                    <div className="method-icon">
                                        <Icon size={20} />
                                    </div>
                                    <div className="method-content">
                                        <h4>{method.title}</h4>
                                        <p className="method-value">{method.value}</p>
                                        <p className="method-description">{method.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSupport;