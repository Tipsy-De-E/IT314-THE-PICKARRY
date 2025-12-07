// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, MapPin, User, Truck, Calendar, Package, DollarSign, Clock, FileText, Image, Navigation } from 'lucide-react';
// import { supabase } from '../../utils/supabaseClient';
// import StatusBadge from '../../components/StatusBadge';

// const OrderView = () => {
//     const { orderId } = useParams();
//     const navigate = useNavigate();
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         if (orderId) {
//             fetchOrderDetails();
//         }
//     }, [orderId]);

//     const fetchOrderDetails = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const { data, error } = await supabase
//                 .from('orders')
//                 .select(`
//           *,
//           customers:customer_id (
//             full_name,
//             email,
//             phone,
//             address
//           ),
//           couriers:courier_id (
//             full_name,
//             email,
//             phone,
//             vehicle_type,
//             plate_number
//           )
//         `)
//                 .eq('id', orderId)
//                 .single();

//             if (error) throw error;

//             console.log('Order details:', data);
//             setOrder(data);

//         } catch (err) {
//             console.error('Error fetching order details:', err);
//             setError('Failed to load order details. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     const formatTime = (timeString) => {
//         if (!timeString) return 'N/A';
//         return timeString;
//     };

//     const getStatusDisplay = (status) => {
//         const statusMap = {
//             'pending': 'Pending',
//             'accepted': 'Accepted',
//             'picked_up': 'Picked Up',
//             'on_the_way': 'On the Way',
//             'arrived': 'Arrived',
//             'delivered': 'Delivered',
//             'cancelled': 'Cancelled'
//         };
//         return statusMap[status] || status;
//     };

//     const getCategoryDisplay = (category) => {
//         const categoryMap = {
//             'food_beverage': 'Food & Beverage',
//             'documents_papers': 'Documents & Papers',
//             'household_hardware': 'Household & Hardware',
//             'other': 'Other / Miscellaneous'
//         };
//         return categoryMap[category] || category;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-white p-6">
//                 <div className="text-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div>
//                     <p className="text-gray-400 mt-4">Loading order details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-white p-6">
//                 <div className="text-center py-12">
//                     <p className="text-red-400 mb-4">{error}</p>
//                     <button
//                         onClick={fetchOrderDetails}
//                         className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     if (!order) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-white p-6">
//                 <div className="text-center py-12">
//                     <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//                     <p className="text-gray-400 text-lg">Order not found</p>
//                     <button
//                         onClick={() => navigate('/admin/orders')}
//                         className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors mt-4"
//                     >
//                         Back to Orders
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-900 text-white p-6">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-4">
//                     <button
//                         onClick={() => navigate('/admin/orders')}
//                         className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
//                     >
//                         <ArrowLeft className="w-5 h-5" />
//                     </button>
//                     <div>
//                         <h1 className="text-2xl font-bold">Order Details</h1>
//                         <p className="text-gray-400">Order ID: {order.id}</p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <StatusBadge status={getStatusDisplay(order.status)} />
//                     {order.is_rush_delivery && (
//                         <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
//                             Rush Delivery
//                         </span>
//                     )}
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Main Order Information - Left Column */}
//                 <div className="lg:col-span-2 space-y-6">
//                     {/* Order Summary Card */}
//                     <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                             <Package className="w-5 h-5 text-teal-400" />
//                             Order Summary
//                         </h2>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <p className="text-gray-400 text-sm">Delivery Item</p>
//                                 <p className="text-white font-medium">{order.delivery_item || 'Not specified'}</p>
//                             </div>
//                             <div>
//                                 <p className="text-gray-400 text-sm">Category</p>
//                                 <p className="text-white font-medium">
//                                     {getCategoryDisplay(order.selected_category) || 'Not specified'}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-gray-400 text-sm">Service Type</p>
//                                 <p className="text-white font-medium">{order.selected_service || 'Not specified'}</p>
//                             </div>
//                             <div>
//                                 <p className="text-gray-400 text-sm">Vehicle Type</p>
//                                 <p className="text-white font-medium">{order.selected_vehicle || 'Not specified'}</p>
//                             </div>
//                         </div>

//                         {order.description && (
//                             <div className="mt-4">
//                                 <p className="text-gray-400 text-sm">Description</p>
//                                 <p className="text-white mt-1">{order.description}</p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Location Information Card */}
//                     <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                             <Navigation className="w-5 h-5 text-teal-400" />
//                             Location Details
//                         </h2>

//                         <div className="space-y-4">
//                             <div className="flex items-start gap-3">
//                                 <MapPin className="w-5 h-5 text-teal-400 mt-1" />
//                                 <div className="flex-1">
//                                     <p className="text-gray-400 text-sm">Pickup Location</p>
//                                     <p className="text-white">{order.pickup_location || 'Not specified'}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <MapPin className="w-5 h-5 text-blue-400 mt-1" />
//                                 <div className="flex-1">
//                                     <p className="text-gray-400 text-sm">Delivery Location</p>
//                                     <p className="text-white">{order.delivery_location || 'Not specified'}</p>
//                                 </div>
//                             </div>

//                             {order.estimated_distance && (
//                                 <div className="flex items-center gap-2 mt-3 p-3 bg-gray-700 rounded-lg">
//                                     <Clock className="w-4 h-4 text-yellow-400" />
//                                     <span className="text-gray-400">Estimated Distance:</span>
//                                     <span className="text-white font-medium">{order.estimated_distance}</span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Timeline Card */}
//                     <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                             <Clock className="w-5 h-5 text-teal-400" />
//                             Order Timeline
//                         </h2>

//                         <div className="space-y-3">
//                             <div className="flex justify-between items-center py-2 border-b border-gray-700">
//                                 <span className="text-gray-400">Order Created</span>
//                                 <span className="text-white">{formatDate(order.created_at)}</span>
//                             </div>

//                             {order.accepted_at && (
//                                 <div className="flex justify-between items-center py-2 border-b border-gray-700">
//                                     <span className="text-gray-400">Accepted</span>
//                                     <span className="text-white">{formatDate(order.accepted_at)}</span>
//                                 </div>
//                             )}

//                             {order.picked_up_at && (
//                                 <div className="flex justify-between items-center py-2 border-b border-gray-700">
//                                     <span className="text-gray-400">Picked Up</span>
//                                     <span className="text-white">{formatDate(order.picked_up_at)}</span>
//                                 </div>
//                             )}

//                             {order.on_the_way_at && (
//                                 <div className="flex justify-between items-center py-2 border-b border-gray-700">
//                                     <span className="text-gray-400">On the Way</span>
//                                     <span className="text-white">{formatDate(order.on_the_way_at)}</span>
//                                 </div>
//                             )}

//                             {order.arrived_at && (
//                                 <div className="flex justify-between items-center py-2 border-b border-gray-700">
//                                     <span className="text-gray-400">Arrived</span>
//                                     <span className="text-white">{formatDate(order.arrived_at)}</span>
//                                 </div>
//                             )}

//                             {order.delivered_at && (
//                                 <div className="flex justify-between items-center py-2">
//                                     <span className="text-gray-400">Delivered</span>
//                                     <span className="text-white">{formatDate(order.delivered_at)}</span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Sidebar - Right Column */}
//                 <div className="space-y-6">
//                     {/* Delivery Schedule Card */}
//                     <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                             <Calendar className="w-5 h-5 text-teal-400" />
//                             Delivery Schedule
//                         </h2>

//                         <div className="space-y-3">
//                             <div>
//                                 <p className="text-gray-400 text-sm">Delivery Date</p>
//                                 <p className="text-white font-medium">
//                                     {order.delivery_date ? formatDate(order.delivery_date) : 'Not scheduled'}
//                                 </p>
//                             </div>

//                             <div>
//                                 <p className="text-gray-400 text-sm">Delivery Time</p>
//                                 <p className="text-white font-medium">
//                                     {order.delivery_time ? formatTime(order.delivery_time) : 'Not specified'}
//                                 </p>
//                             </div>

//                             <div>
//                                 <p className="text-gray-400 text-sm">Book for Delivery</p>
//                                 <p className="text-white font-medium">
//                                     {order.book_for_delivery ? 'Yes' : 'No'}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Customer Information Card */}
//                     <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                             <User className="w-5 h-5 text-teal-400" />
//                             Customer Information
//                         </h2>

//                         <div className="space-y-3">
//                             <div>
//                                 <p className="text-gray-400 text-sm">Name</p>
//                                 <p className="text-white font-medium">{order.customers?.full_name || 'Unknown'}</p>
//                             </div>

//                             <div>
//                                 <p className="text-gray-400 text-sm">Email</p>
//                                 <p className="text-white font-medium">{order.customers?.email || 'Not provided'}</p>
//                             </div>

//                             <div>
//                                 <p className="text-gray-400 text-sm">Phone</p>
//                                 <p className="text-white font-medium">{order.customers?.phone || 'Not provided'}</p>
//                             </div>

//                             {order.customers?.address && (
//                                 <div>
//                                     <p className="text-gray-400 text-sm">Address</p>
//                                     <p className="text-white text-sm">{order.customers.address}</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Courier Information Card */}
//                     {order.couriers && (
//                         <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                                 <Truck className="w-5 h-5 text-teal-400" />
//                                 Courier Information
//                             </h2>

//                             <div className="space-y-3">
//                                 <div>
//                                     <p className="text-gray-400 text-sm">Name</p>
//                                     <p className="text-white font-medium">{order.couriers.full_name}</p>
//                                 </div>

//                                 <div>
//                                     <p className="text-gray-400 text-sm">Email</p>
//                                     <p className="text-white font-medium">{order.couriers.email}</p>
//                                 </div>

//                                 <div>
//                                     <p className="text-gray-400 text-sm">Phone</p>
//                                     <p className="text-white font-medium">{order.couriers.phone || 'Not provided'}</p>
//                                 </div>

//                                 <div>
//                                     <p className="text-gray-400 text-sm">Vehicle Type</p>
//                                     <p className="text-white font-medium">{order.couriers.vehicle_type}</p>
//                                 </div>

//                                 {order.couriers.plate_number && (
//                                     <div>
//                                         <p className="text-gray-400 text-sm">Plate Number</p>
//                                         <p className="text-white font-medium">{order.couriers.plate_number}</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Payment Information Card */}
//                     <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                             <DollarSign className="w-5 h-5 text-teal-400" />
//                             Payment Information
//                         </h2>

//                         <div className="space-y-3">
//                             <div className="flex justify-between items-center">
//                                 <span className="text-gray-400">Vehicle Price</span>
//                                 <span className="text-white">₱{parseFloat(order.vehicle_price || 0).toFixed(2)}</span>
//                             </div>

//                             {order.is_rush_delivery && (
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-400">Rush Amount</span>
//                                     <span className="text-white">₱{parseFloat(order.rush_amount || 0).toFixed(2)}</span>
//                                 </div>
//                             )}

//                             <div className="flex justify-between items-center pt-2 border-t border-gray-700">
//                                 <span className="text-white font-bold">Total Amount</span>
//                                 <span className="text-white font-bold text-lg">
//                                     ₱{parseFloat(order.total_amount || 0).toFixed(2)}
//                                 </span>
//                             </div>

//                             <div className="mt-3">
//                                 <p className="text-gray-400 text-sm">Payment Method</p>
//                                 <p className="text-white font-medium">{order.payment_method || 'Not specified'}</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Uploaded Photos */}
//                     {order.uploaded_photos && (
//                         <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
//                             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                                 <Image className="w-5 h-5 text-teal-400" />
//                                 Uploaded Photos
//                             </h2>
//                             <div className="space-y-2">
//                                 {order.uploaded_photos.split(',').map((photo, index) => (
//                                     <div key={index} className="text-blue-400 hover:text-blue-300 cursor-pointer">
//                                         <FileText className="w-4 h-4 inline mr-2" />
//                                         Photo {index + 1}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderView;