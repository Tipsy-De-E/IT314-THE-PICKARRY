import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, Clock, Search } from 'lucide-react';
import '../../../styles/Admin-css/menu-Css/SupportComplaints.css';

const SupportComplaints = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const complaints = [
        {
            id: 'SUP-001',
            customer: 'John Doe',
            category: 'Delivery Issue',
            subject: 'Package not delivered',
            status: 'pending',
            date: '2025-11-02',
            priority: 'high'
        },
        {
            id: 'SUP-002',
            customer: 'Jane Smith',
            category: 'Payment Problem',
            subject: 'Payment not processed',
            status: 'in-progress',
            date: '2025-11-01',
            priority: 'medium'
        },
        {
            id: 'SUP-003',
            customer: 'Mike Johnson',
            category: 'Technical Issue',
            subject: 'App crashing on startup',
            status: 'resolved',
            date: '2025-10-30',
            priority: 'low'
        }
    ];

    const stats = [
        { label: 'Total Complaints', value: '156', color: 'blue' },
        { label: 'Pending', value: '42', color: 'yellow' },
        { label: 'In Progress', value: '28', color: 'purple' },
        { label: 'Resolved', value: '86', color: 'green' }
    ];

    return (
        <div className="feature-page">
            <div className="feature-header">
                <div className="feature-header-top">
                    <button className="back-button" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="feature-title-group">
                        <MessageCircle size={28} color="#10b981" />
                        <h1>Support & Complaints</h1>
                    </div>
                </div>
                <p className="feature-description">
                    Manage customer support requests and complaints
                </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <h3>{stat.value}</h3>
                        <p>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="content-section">
                <div className="section-header">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </button>
                        <button
                            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
                            onClick={() => setActiveTab('in-progress')}
                        >
                            In Progress
                        </button>
                        <button
                            className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('resolved')}
                        >
                            Resolved
                        </button>
                    </div>
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Complaints Table */}
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Category</th>
                                <th>Subject</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(complaint => (
                                <tr key={complaint.id}>
                                    <td><span className="id-badge">{complaint.id}</span></td>
                                    <td>{complaint.customer}</td>
                                    <td>{complaint.category}</td>
                                    <td>{complaint.subject}</td>
                                    <td>
                                        <span className={`priority-badge priority-${complaint.priority}`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${complaint.status}`}>
                                            {complaint.status.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td>{complaint.date}</td>
                                    <td>
                                        <button className="action-btn view-btn">View</button>
                                        <button className="action-btn resolve-btn">Resolve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupportComplaints;