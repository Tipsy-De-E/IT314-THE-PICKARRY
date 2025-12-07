// src/components/Admin/AboutPickarryAdmin.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Edit, Upload } from 'lucide-react';
import { initialAboutData, saveAboutData, loadAboutData } from '../../data/aboutData';
import '../../styles/AdminAboutPickarry.css';

const AboutPickarryAdmin = ({ onBack }) => {
    const [aboutData, setAboutData] = useState(initialAboutData);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRefs = useRef({});

    useEffect(() => {
        // Load saved data on component mount
        const savedData = loadAboutData();
        setAboutData(savedData);
    }, []);

    const handleSave = () => {
        saveAboutData(aboutData);
        setIsEditing(false);
        alert('Changes saved successfully!');
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleImageUpload = (teamMemberId, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAboutData(prev => ({
                    ...prev,
                    team: prev.team.map(member =>
                        member.id === teamMemberId
                            ? { ...member, avatar: e.target.result }
                            : member
                    )
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const updateField = (section, field, value) => {
        setAboutData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateStat = (index, field, value) => {
        setAboutData(prev => ({
            ...prev,
            stats: prev.stats.map((stat, i) =>
                i === index ? { ...stat, [field]: value } : stat
            )
        }));
    };

    const updateFeature = (index, field, value) => {
        setAboutData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) =>
                i === index ? { ...feature, [field]: value } : feature
            )
        }));
    };

    const updateTeamMember = (index, field, value) => {
        setAboutData(prev => ({
            ...prev,
            team: prev.team.map((member, i) =>
                i === index ? { ...member, [field]: value } : member
            )
        }));
    };

    const updateContact = (field, value) => {
        setAboutData(prev => ({
            ...prev,
            contact: {
                ...prev.contact,
                [field]: value
            }
        }));
    };

    const triggerFileInput = (memberId) => {
        if (fileInputRefs.current[memberId]) {
            fileInputRefs.current[memberId].click();
        }
    };

    return (
        <div className="admin-about-page">
            <div className="admin-about-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-content">
                    <h1>About Pickarry - Admin</h1>
                    <p>Manage the content that appears on customer and courier About pages</p>
                </div>
                <div className="header-actions">
                    {isEditing ? (
                        <button className="save-button" onClick={handleSave}>
                            <Save size={20} />
                            Save Changes
                        </button>
                    ) : (
                        <button className="edit-button" onClick={handleEdit}>
                            <Edit size={20} />
                            Edit Content
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-about-content">
                {/* Hero Section */}
                <div className="admin-section">
                    <h2>Hero Section</h2>
                    <div className="section-content">
                        <div className="input-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={aboutData.hero.title}
                                onChange={(e) => updateField('hero', 'title', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <textarea
                                value={aboutData.hero.description}
                                onChange={(e) => updateField('hero', 'description', e.target.value)}
                                disabled={!isEditing}
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="admin-section">
                    <h2>Statistics</h2>
                    <div className="stats-grid-admin">
                        {aboutData.stats.map((stat, index) => (
                            <div key={index} className="stat-input-group">
                                <div className="input-group">
                                    <label>Number</label>
                                    <input
                                        type="text"
                                        value={stat.number}
                                        onChange={(e) => updateStat(index, 'number', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Label</label>
                                    <input
                                        type="text"
                                        value={stat.label}
                                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="admin-section">
                    <h2>Features</h2>
                    <div className="features-grid-admin">
                        {aboutData.features.map((feature, index) => (
                            <div key={index} className="feature-input-card">
                                <div className="input-group">
                                    <label>Icon Name (Target, Users, Award, Clock)</label>
                                    <input
                                        type="text"
                                        value={feature.icon}
                                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea
                                        value={feature.description}
                                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                        disabled={!isEditing}
                                        rows="3"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Our Story */}
                <div className="admin-section">
                    <h2>Our Story</h2>
                    <div className="section-content">
                        <div className="input-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={aboutData.story.title}
                                onChange={(e) => updateField('story', 'title', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="input-group">
                            <label>Content</label>
                            <textarea
                                value={aboutData.story.content}
                                onChange={(e) => updateField('story', 'content', e.target.value)}
                                disabled={!isEditing}
                                rows="4"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <div className="admin-section">
                    <h2>Team Members</h2>
                    <div className="team-grid-admin">
                        {aboutData.team.map((member, index) => (
                            <div key={member.id} className="team-input-card">
                                <div className="team-avatar-upload">
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="team-avatar" />
                                    ) : (
                                        <div className="team-avatar-placeholder">
                                            {member.initials}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button
                                            className="upload-button"
                                            onClick={() => triggerFileInput(member.id)}
                                        >
                                            <Upload size={16} />
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(member.id, e)}
                                        ref={el => fileInputRefs.current[member.id] = el}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Position</label>
                                    <input
                                        type="text"
                                        value={member.position}
                                        onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Initials</label>
                                    <input
                                        type="text"
                                        value={member.initials}
                                        onChange={(e) => updateTeamMember(index, 'initials', e.target.value)}
                                        disabled={!isEditing}
                                        maxLength="2"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="admin-section">
                    <h2>Contact Information</h2>
                    <div className="contact-grid-admin">
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={aboutData.contact.email}
                                onChange={(e) => updateContact('email', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="input-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                value={aboutData.contact.phone}
                                onChange={(e) => updateContact('phone', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="input-group">
                            <label>Address</label>
                            <input
                                type="text"
                                value={aboutData.contact.address}
                                onChange={(e) => updateContact('address', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPickarryAdmin;