// components/OrderRemarksModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Send, User, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { notificationService } from '../hooks/notificationService';

const OrderRemarksModal = ({ orderId, userType, userId, isOpen, onClose }) => {
    const [remarks, setRemarks] = useState([]);
    const [newRemark, setNewRemark] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchRemarks();
            subscribeToRemarks();
        }
    }, [isOpen, orderId]);

    const fetchRemarks = async () => {
        try {
            const { data, error } = await supabase
                .from('order_remarks')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setRemarks(data || []);
        } catch (error) {
            console.error('Error fetching remarks:', error);
        }
    };

    const subscribeToRemarks = () => {
        return supabase
            .channel(`order-remarks-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'order_remarks',
                    filter: `order_id=eq.${orderId}`
                },
                (payload) => {
                    setRemarks(prev => [...prev, payload.new]);
                }
            )
            .subscribe();
    };

    const handleSendRemark = async () => {
        if (!newRemark.trim()) return;

        try {
            setLoading(true);

            // Create remark in database
            const { data, error } = await supabase
                .from('order_remarks')
                .insert([{
                    order_id: orderId,
                    remark: newRemark,
                    remark_type: isUrgent ? 'urgent' : 'general',
                    created_by: userId,
                    recipient_user_type: userType === 'customer' ? 'courier' : 'customer'
                }])
                .select()
                .single();

            if (error) throw error;

            // Notify the other user
            await notificationService.notifyOrderRemark(
                orderId,
                userId,
                userType,
                newRemark,
                isUrgent ? 'urgent' : 'general'
            );

            setNewRemark('');
            setIsUrgent(false);
        } catch (error) {
            console.error('Error sending remark:', error);
            alert('Error sending message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getSenderName = (remark) => {
        // Since recipient_user_type is the type of the recipient,
        // the sender is the opposite type
        return remark.recipient_user_type === 'courier' ? 'Customer' : 'Courier';
    };

    const isOwnRemark = (remark) => {
        return remark.created_by === userId;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="remarks-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order Messages</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="remarks-content">
                    <div className="remarks-list">
                        {remarks.length === 0 ? (
                            <div className="no-remarks">
                                <p>No messages yet. Start a conversation!</p>
                            </div>
                        ) : (
                            remarks.map((remark) => (
                                <div
                                    key={remark.id}
                                    className={`remark-item ${isOwnRemark(remark) ? 'own-remark' : 'other-remark'} ${remark.remark_type === 'urgent' ? 'urgent-remark' : ''}`}
                                >
                                    <div className="remark-header">
                                        <div className="remark-sender">
                                            <User size={14} />
                                            <span>{isOwnRemark(remark) ? 'You' : getSenderName(remark)}</span>
                                            {remark.remark_type === 'urgent' && (
                                                <AlertTriangle size={14} className="urgent-icon" />
                                            )}
                                        </div>
                                        <div className="remark-time">
                                            <Clock size={12} />
                                            {new Date(remark.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="remark-text">{remark.remark}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="remark-input-section">
                        <div className="input-header">
                            <label className="urgent-checkbox">
                                <input
                                    type="checkbox"
                                    checked={isUrgent}
                                    onChange={(e) => setIsUrgent(e.target.checked)}
                                />
                                <AlertTriangle size={14} />
                                <span>Urgent Message</span>
                            </label>
                        </div>
                        <div className="remark-input-container">
                            <textarea
                                value={newRemark}
                                onChange={(e) => setNewRemark(e.target.value)}
                                placeholder="Type your message here..."
                                rows={3}
                                className="remark-textarea"
                            />
                            <button
                                onClick={handleSendRemark}
                                disabled={loading || !newRemark.trim()}
                                className="send-remark-btn"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderRemarksModal;