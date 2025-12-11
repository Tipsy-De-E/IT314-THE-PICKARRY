import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Phone, Mail, MapPin, Package, Calendar,
    MoreVertical, CheckCircle, Clock, AlertCircle, XCircle,
    User, Truck, CreditCard, DollarSign, Navigation,
    Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const OrderProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [imageLoading, setImageLoading] = useState({});

    // Modal states
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const statusOptions = [
        'pending',
        'accepted',
        'picked_up',
        'on_the_way',
        'delivered',
        'cancelled'
    ];

    const cancelReasons = [
        'Customer requested cancellation',
        'Courier unavailable',
        'Package not ready',
        'Address issues',
        'Payment issues',
        'Other'
    ];

    useEffect(() => {
        fetchOrderData();
    }, [id]);

    const fetchOrderData = async () => {
        try {
            setLoading(true);

            // Fetch order with related data
            const { data: order, error } = await supabase
                .from('orders')
                .select(`
          *,
          customers:customer_id (
            id,
            customer_id,
            full_name,
            email,
            phone,
            address
          ),
          couriers:courier_id (
            id,
            full_name,
            phone,
            email,
            vehicle_type,
            plate_number
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (order) {
                // Format the order data
                const formattedOrder = {
                    id: order.id,
                    orderNumber: `ORD${String(order.id).slice(-8).toUpperCase()}`,
                    customer: {
                        id: order.customers?.customer_id || `CUS${String(order.customers?.id).padStart(3, '0')}`,
                        name: order.customers?.full_name || 'Unknown Customer',
                        email: order.customers?.email || 'No email',
                        phone: order.customers?.phone || 'No phone',
                        address: order.customers?.address || 'No address'
                    },
                    courier: order.courier_id ? {
                        id: `COU${String(order.courier_id).padStart(3, '0')}`,
                        name: order.couriers?.full_name || 'Not assigned',
                        phone: order.couriers?.phone || 'No phone',
                        email: order.couriers?.email || 'No email',
                        vehicle: order.couriers?.vehicle_type || 'Not specified',
                        plate: order.couriers?.plate_number || 'Not specified'
                    } : null,
                    locations: {
                        pickup: order.pickup_location || 'Not specified',
                        delivery: order.delivery_location || 'Not specified',
                        pickupNotes: order.pickup_notes || '',
                        deliveryNotes: order.delivery_notes || ''
                    },
                    service: {
                        type: order.selected_service || 'Standard',
                        distance: order.distance || 'N/A',
                        duration: order.estimated_duration || 'N/A',
                        rush: order.rush_service || false
                    },
                    payment: {
                        amount: order.total_amount || 0,
                        method: order.payment_method || 'Not specified',
                        status: order.payment_status || 'pending'
                    },
                    timeline: {
                        created: order.created_at,
                        accepted: order.accepted_at,
                        pickedUp: order.picked_up_at,
                        delivered: order.delivered_at,
                        cancelled: order.cancelled_at
                    },
                    status: order.status || 'pending',
                    notes: order.admin_notes || '',
                    items: order.items_description || 'No items description',
                    // Handle uploaded photos - ensure it's always an array
                    uploadedPhotos: Array.isArray(order.uploaded_photos)
                        ? order.uploaded_photos
                        : (order.uploaded_photos ? [order.uploaded_photos] : []),
                    description: order.description || 'No description',
                    category: order.selected_category || 'No category'
                };

                setOrderData(formattedOrder);
                setSelectedStatus(formattedOrder.status);
            }
        } catch (error) {
            console.error('Error fetching order data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedStatus) return;

        try {
            setUpdating(true);

            const updateData = {
                status: selectedStatus,
                updated_at: new Date().toISOString()
            };

            // Set timestamp based on status
            if (selectedStatus === 'accepted' && !orderData.timeline.accepted) {
                updateData.accepted_at = new Date().toISOString();
            } else if (selectedStatus === 'picked_up' && !orderData.timeline.pickedUp) {
                updateData.picked_up_at = new Date().toISOString();
            } else if (selectedStatus === 'delivered' && !orderData.timeline.delivered) {
                updateData.delivered_at = new Date().toISOString();
            } else if (selectedStatus === 'cancelled' && !orderData.timeline.cancelled) {
                updateData.cancelled_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setOrderData(prev => ({
                ...prev,
                status: selectedStatus,
                timeline: {
                    ...prev.timeline,
                    ...updateData
                }
            }));

            alert('Order status updated successfully!');
            setShowUpdateModal(false);

        } catch (error) {
            console.error('Error updating order status:', error);
            alert(`Error updating order: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason) return;

        try {
            setUpdating(true);

            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setOrderData(prev => ({
                ...prev,
                status: 'cancelled',
                timeline: {
                    ...prev.timeline,
                    cancelled: new Date().toISOString()
                }
            }));

            alert('Order cancelled successfully!');
            setShowCancelModal(false);
            setCancelReason('');

        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(`Error cancelling order: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleImageLoad = (index) => {
        setImageLoading(prev => ({
            ...prev,
            [index]: false
        }));
    };

    const handleImageError = (index) => {
        setImageLoading(prev => ({
            ...prev,
            [index]: false
        }));
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'bg-green-500';
            case 'accepted':
            case 'picked_up':
            case 'on_the_way':
                return 'bg-yellow-500';
            case 'pending':
                return 'bg-blue-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'text-green-400';
            case 'accepted':
            case 'picked_up':
            case 'on_the_way':
                return 'text-yellow-400';
            case 'pending':
                return 'text-blue-400';
            case 'cancelled':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'pending': 'Pending',
            'accepted': 'Accepted',
            'picked_up': 'Picked Up',
            'on_the_way': 'On the Way',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    const formatCurrency = (amount) => {
        return `₱${parseFloat(amount || 0).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-teal-400">Loading order details...</div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-red-400">Order not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header with back button and title */}
            <div className="flex items-center justify-between p-6 border-b border-teal-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/order')}
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        <ArrowLeft className="w-8 h-8" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-teal-400">Order Details</h1>
                        <p className="text-gray-400 mt-1">{orderData.orderNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(orderData.status)}`}></div>
                        <span className="text-white font-medium capitalize">
                            {getStatusDisplay(orderData.status)}
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setActionMenuOpen(!actionMenuOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-colors relative"
                            disabled={updating}
                        >
                            <MoreVertical className="w-5 h-5" />
                            {updating && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        {actionMenuOpen && (
                            <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setShowUpdateModal(true);
                                            setActionMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors text-blue-400 hover:bg-blue-500 hover:text-white"
                                        disabled={updating}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Update Status</span>
                                    </button>

                                    {orderData.status !== 'cancelled' && (
                                        <button
                                            onClick={() => {
                                                setShowCancelModal(true);
                                                setActionMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors text-red-400 hover:bg-red-500 hover:text-white"
                                            disabled={updating}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Cancel Order</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Order Header Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{orderData.orderNumber}</h2>
                            <p className="text-gray-400 mb-1">
                                Created: {formatDate(orderData.timeline.created)}
                            </p>
                            <p className="text-gray-400">
                                Service: <span className="text-teal-400">{orderData.service.type}</span>
                                {orderData.service.rush && (
                                    <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                                        RUSH
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">
                                {formatCurrency(orderData.payment.amount)}
                            </p>
                            <p className="text-gray-400 capitalize">
                                Payment: {orderData.payment.status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* UPLOADED IMAGES SECTION */}
                {orderData.uploadedPhotos && orderData.uploadedPhotos.length > 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-teal-400" />
                            Uploaded Items ({orderData.uploadedPhotos.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {orderData.uploadedPhotos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
                                        {imageLoading[index] !== false && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                                <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        <img
                                            src={photo}
                                            alt={`Order item ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                            onLoad={() => handleImageLoad(index)}
                                            onError={() => handleImageError(index)}
                                            onClick={() => setSelectedImage(photo)}
                                            style={{
                                                display: imageLoading[index] === false ? 'block' : 'none'
                                            }}
                                        />
                                        {imageLoading[index] === false && (
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <ImageIcon className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <span className="text-gray-400 text-sm">Item {index + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {orderData.uploadedPhotos.length < 3 && (
                            <div className="mt-4 text-center text-gray-400 text-sm">
                                {3 - orderData.uploadedPhotos.length} image(s) not uploaded
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-teal-400" />
                            Customer Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-teal-400" />
                                <div>
                                    <span className="text-white font-medium">{orderData.customer.name}</span>
                                    <span className="text-gray-400 text-sm block">{orderData.customer.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-teal-400" />
                                <span className="text-white">{orderData.customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-teal-400" />
                                <span className="text-white">{orderData.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-teal-400" />
                                <span className="text-white text-sm">{orderData.customer.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Courier Information */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-teal-400" />
                            Courier Information
                        </h3>
                        {orderData.courier ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-teal-400" />
                                    <div>
                                        <span className="text-white font-medium">{orderData.courier.name}</span>
                                        <span className="text-gray-400 text-sm block">{orderData.courier.id}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-teal-400" />
                                    <span className="text-white">{orderData.courier.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-teal-400" />
                                    <span className="text-white">{orderData.courier.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-teal-400" />
                                    <span className="text-white">{orderData.courier.vehicle} - {orderData.courier.plate}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-4 bg-gray-900 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                                <span className="text-gray-400">No courier assigned yet</span>
                            </div>
                        )}
                    </div>

                    {/* Location Details */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-teal-400" />
                            Delivery Route
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-green-400 mt-1" />
                                    <div className="flex-1">
                                        <h4 className="text-green-400 font-medium mb-1">Pickup Location</h4>
                                        <p className="text-white">{orderData.locations.pickup}</p>
                                        {orderData.locations.pickupNotes && (
                                            <p className="text-gray-400 text-sm mt-1">
                                                Notes: {orderData.locations.pickupNotes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <ArrowLeft className="w-6 h-6 text-teal-400 transform rotate-90" />
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-red-400 mt-1" />
                                    <div className="flex-1">
                                        <h4 className="text-red-400 font-medium mb-1">Delivery Location</h4>
                                        <p className="text-white">{orderData.locations.delivery}</p>
                                        {orderData.locations.deliveryNotes && (
                                            <p className="text-gray-400 text-sm mt-1">
                                                Notes: {orderData.locations.deliveryNotes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Distance</p>
                                    <p className="text-white font-medium">{orderData.service.distance}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Est. Duration</p>
                                    <p className="text-white font-medium">{orderData.service.duration}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Timeline & Payment */}
                    <div className="space-y-6">
                        {/* Payment Information */}
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-teal-400" />
                                Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-white font-bold text-lg">
                                        {formatCurrency(orderData.payment.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Method:</span>
                                    <span className="text-white capitalize">{orderData.payment.method}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`font-medium ${getStatusTextColor(orderData.payment.status)}`}>
                                        {orderData.payment.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-teal-400" />
                                Order Timeline
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Created:</span>
                                    <span className="text-white text-sm">{formatDate(orderData.timeline.created)}</span>
                                </div>
                                {orderData.timeline.accepted && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Accepted:</span>
                                        <span className="text-white text-sm">{formatDate(orderData.timeline.accepted)}</span>
                                    </div>
                                )}
                                {orderData.timeline.pickedUp && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Picked Up:</span>
                                        <span className="text-white text-sm">{formatDate(orderData.timeline.pickedUp)}</span>
                                    </div>
                                )}
                                {orderData.timeline.delivered && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Delivered:</span>
                                        <span className="text-white text-sm">{formatDate(orderData.timeline.delivered)}</span>
                                    </div>
                                )}
                                {orderData.timeline.cancelled && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Cancelled:</span>
                                        <span className="text-white text-sm">{formatDate(orderData.timeline.cancelled)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items & Notes */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Items & Additional Information</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-teal-400 font-medium mb-3">Items Description</h4>
                            <p className="text-white bg-gray-900 rounded-lg p-4">
                                {orderData.items}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-teal-400 font-medium mb-3">Category & Description</h4>
                            <div className="space-y-3">
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <p className="text-white font-medium mb-2">Category:</p>
                                    <p className="text-teal-400">{orderData.category}</p>
                                </div>
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <p className="text-white font-medium mb-2">Detailed Description:</p>
                                    <p className="text-gray-300">{orderData.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-teal-400 transition-colors"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Order item preview"
                            className="max-w-full max-h-screen object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Update Order Status</h3>
                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Select Status:
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>
                                        {getStatusDisplay(status)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                disabled={updating || selectedStatus === orderData.status}
                            >
                                {updating ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Cancel Order</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to cancel order {orderData.orderNumber}?
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Reason for cancellation:
                            </label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">Select a reason</option>
                                {cancelReasons.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                disabled={!cancelReason || updating}
                            >
                                {updating ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderProfile;