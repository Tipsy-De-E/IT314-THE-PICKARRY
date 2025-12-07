import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageCircle, ThumbsUp, Share2, Calendar, MapPin } from 'lucide-react';
import '../../../styles/Menu-css/RiderCommunity.css';

const RiderCommunity = ({ onBack }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('forum');

    const handleMenuClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/courier/menu');
        }
    };

    const forumPosts = [
        {
            id: 1,
            user: 'Mike T.',
            role: 'Bike Courier',
            time: '2 hours ago',
            content: 'Any tips for handling multiple deliveries during rush hour? The downtown area gets pretty chaotic around 5-7 PM.',
            likes: 24,
            comments: 8
        },
        {
            id: 2,
            user: 'Sarah J.',
            role: 'Car Courier',
            time: '5 hours ago',
            content: 'Just completed my 1000th delivery! 🎉 This community has been incredibly helpful throughout my journey.',
            likes: 56,
            comments: 12
        },
        {
            id: 3,
            user: 'Alex R.',
            role: 'Bike Courier',
            time: '1 day ago',
            content: 'Best routes for avoiding traffic in the financial district? Seems like construction is everywhere these days.',
            likes: 15,
            comments: 6
        }
    ];

    const events = [
        {
            id: 1,
            title: 'Monthly Rider Meetup',
            date: 'Dec 15, 2024',
            time: '6:00 PM',
            location: 'Central Park Cafe',
            attendees: 24
        },
        {
            id: 2,
            title: 'Safety Training Workshop',
            date: 'Dec 20, 2024',
            time: '2:00 PM',
            location: 'Pickarry HQ',
            attendees: 18
        },
        {
            id: 3,
            title: 'Holiday Party',
            date: 'Dec 22, 2024',
            time: '7:00 PM',
            location: 'Downtown Events Center',
            attendees: 45
        }
    ];

    return (
        <div className="community-main-content">
            <div className="community-header">
                <div className="community-title">
                    <button onClick={handleMenuClick} className="menu-back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <Users className="community-title-icon" />
                    <h1>Rider Community</h1>
                </div>
                <p className="community-subtitle">Connect with other riders</p>
            </div>

            <div className="community-tabs">
                <button
                    className={`community-tab ${activeTab === 'forum' ? 'active' : ''}`}
                    onClick={() => setActiveTab('forum')}
                >
                    <MessageCircle size={18} />
                    Community Forum
                </button>
                <button
                    className={`community-tab ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    <Calendar size={18} />
                    Upcoming Events
                </button>
            </div>

            {activeTab === 'forum' && (
                <div className="forum-content">
                    <div className="new-post-card">
                        <div className="post-avatar">
                            <span>C</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Start a discussion with fellow riders..."
                            className="post-input"
                        />
                        <button className="post-button">Post</button>
                    </div>

                    <div className="forum-posts">
                        {forumPosts.map((post) => (
                            <div key={post.id} className="forum-post">
                                <div className="post-header">
                                    <div className="post-user">
                                        <div className="post-avatar">
                                            <span>{post.user.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="user-name">{post.user}</div>
                                            <div className="user-role">{post.role}</div>
                                        </div>
                                    </div>
                                    <div className="post-time">{post.time}</div>
                                </div>

                                <div className="post-content">
                                    {post.content}
                                </div>

                                <div className="post-actions">
                                    <button className="post-action">
                                        <ThumbsUp size={16} />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button className="post-action">
                                        <MessageCircle size={16} />
                                        <span>{post.comments}</span>
                                    </button>
                                    <button className="post-action">
                                        <Share2 size={16} />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'events' && (
                <div className="events-content">
                    <div className="events-grid">
                        {events.map((event) => (
                            <div key={event.id} className="event-card">
                                <div className="event-header">
                                    <h3>{event.title}</h3>
                                    <div className="event-attendees">
                                        {event.attendees} attending
                                    </div>
                                </div>

                                <div className="event-details">
                                    <div className="event-detail">
                                        <Calendar size={16} />
                                        <span>{event.date} at {event.time}</span>
                                    </div>
                                    <div className="event-detail">
                                        <MapPin size={16} />
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="event-actions">
                                    <button className="attend-button">Attend</button>
                                    <button className="maybe-button">Maybe</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="community-stats">
                        <h3>Community Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-number">1,247</div>
                                <div className="stat-label">Active Riders</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">89</div>
                                <div className="stat-label">Events This Month</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">564</div>
                                <div className="stat-label">Forum Posts</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Support Available</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderCommunity;