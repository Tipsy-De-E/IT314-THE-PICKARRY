// // hooks/notificationService.js
// import { supabase } from '../utils/supabaseClient';

// export const notificationService = {
//   // Get user ID from email
//   async getUserId(email, userType) {
//     try {
//       const table = userType === 'customer' ? 'customers' : 'couriers';
//       const { data, error } = await supabase
//         .from(table)
//         .select('id')
//         .eq('email', email)
//         .single();

//       if (error) throw error;
//       return data.id;
//     } catch (error) {
//       console.error('Error getting user ID:', error);
//       return null;
//     }
//   },

//   // Get user email from ID
//   async getUserEmail(userId, userType) {
//     try {
//       const table = userType === 'customer' ? 'customers' : 'couriers';
//       const { data, error } = await supabase
//         .from(table)
//         .select('email')
//         .eq('id', userId)
//         .single();

//       if (error) throw error;
//       return data.email;
//     } catch (error) {
//       console.error('Error getting user email:', error);
//       return null;
//     }
//   },

//   // Enhanced notification creation
//   async createNotification(notificationData) {
//     try {
//       console.log('Creating notification:', notificationData);

//       // Validate required fields
//       const requiredFields = ['user_id', 'user_type', 'title', 'message', 'type'];
//       for (const field of requiredFields) {
//         if (!notificationData[field]) {
//           throw new Error(`Missing required field: ${field}`);
//         }
//       }

//       // Check user notification preferences (skip for admin notifications)
//       if (notificationData.user_type !== 'admin') {
//         const shouldSend = await this.shouldSendNotification(
//           notificationData.user_id, 
//           notificationData.user_type, 
//           notificationData.type
//         );

//         if (!shouldSend) {
//           console.log(`Notification skipped due to user preference: ${notificationData.type}`);
//           return null;
//         }
//       }

//       const { data, error } = await supabase
//         .from('notifications')
//         .insert([{
//           ...notificationData,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         }])
//         .select();

//       if (error) {
//         console.error('Error creating notification:', error);
//         throw error;
//       }

//       console.log('Notification created successfully:', data[0]);
//       return data[0];
//     } catch (error) {
//       console.error('Error in createNotification:', error);
//       throw error;
//     }
//   },

//   // Check user notification preferences
//   async shouldSendNotification(userId, userType, notificationType) {
//     try {
//       const { data, error } = await supabase
//         .from('notification_preferences')
//         .select('enabled')
//         .eq('user_id', userId)
//         .eq('user_type', userType)
//         .eq('notification_type', notificationType)
//         .single();

//       // If no preference found, default to enabled
//       if (error || !data) {
//         return true;
//       }

//       return data.enabled;
//     } catch (error) {
//       console.error('Error checking notification preference:', error);
//       return true;
//     }
//   },

//   // Initialize default preferences for a user
//   async initializeUserPreferences(userId, userType) {
//     try {
//       const defaultPreferences = [
//         'delivery_update',
//         'new_order', 
//         'payment_update',
//         'rating_received',
//         'report_update',
//         'system_alert',
//         'rule_change',
//         'promotion',
//         'customer_feedback',
//         'courier_feedback',
//         'order_accepted',
//         'on_the_way',
//         'order_delivered'
//       ];

//       const preferences = defaultPreferences.map(type => ({
//         user_id: userId,
//         user_type: userType,
//         notification_type: type,
//         enabled: true,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       }));

//       const { error } = await supabase
//         .from('notification_preferences')
//         .upsert(preferences, {
//           onConflict: 'user_id,user_type,notification_type'
//         });

//       if (error) throw error;
//       console.log('Default preferences initialized for user:', userId);
//     } catch (error) {
//       console.error('Error initializing preferences:', error);
//     }
//   },

//   // Enhanced order status notifications
//   async notifyOrderStatusUpdate(orderId, newStatus, customerEmail, metadata = {}) {
//     try {
//       const customerId = await this.getUserId(customerEmail, 'customer');
//       if (!customerId) {
//         console.error('Customer not found for email:', customerEmail);
//         return;
//       }

//       const statusConfig = {
//         pending: {
//           title: '📦 Order Received',
//           message: 'Your order has been received and is waiting for a courier',
//           priority: 'normal'
//         },
//         accepted: {
//           title: '🎉 Order Accepted!',
//           message: `Your order has been accepted by ${metadata.courier_name || 'a courier'}!`,
//           priority: 'high'
//         },
//         picked_up: {
//           title: '📦 Package Picked Up',
//           message: 'Your items have been picked up and are on the way!',
//           priority: 'normal'
//         },
//         on_the_way: {
//           title: '🚚 On The Way!',
//           message: 'Your delivery is en route to your location.',
//           priority: 'normal'
//         },
//         arrived: {
//           title: '📍 Courier Arrived',
//           message: 'Your courier has arrived at the delivery location',
//           priority: 'high'
//         },
//         delivered: {
//           title: '✅ Delivery Completed!',
//           message: 'Your order has been successfully delivered. Thank you!',
//           priority: 'normal'
//         },
//         cancelled: {
//           title: '❌ Order Cancelled',
//           message: `Your order has been cancelled${metadata.reason ? `: ${metadata.reason}` : ''}`,
//           priority: 'high'
//         }
//       };

//       const config = statusConfig[newStatus] || {
//         title: 'Order Status Update',
//         message: `Your order status has been updated to ${newStatus}`,
//         priority: 'normal'
//       };

//       return this.createNotification({
//         user_id: customerId,
//         user_type: 'customer',
//         title: config.title,
//         message: config.message,
//         type: 'delivery_update',
//         related_entity_type: 'order',
//         related_entity_id: orderId,
//         action_url: '/customer/orders',
//         priority: config.priority,
//         metadata: {
//           order_id: orderId,
//           status: newStatus,
//           ...metadata
//         }
//       });
//     } catch (error) {
//       console.error('Error in notifyOrderStatusUpdate:', error);
//     }
//   },

//   // Enhanced courier assignment notification
//   async notifyCourierAssigned(orderId, customerEmail, courierName) {
//     try {
//       const customerId = await this.getUserId(customerEmail, 'customer');
//       if (!customerId) return;

//       return this.createNotification({
//         user_id: customerId,
//         user_type: 'customer',
//         title: '🚗 Courier Assigned!',
//         message: `${courierName} has accepted your order and is on the way to pickup.`,
//         type: 'order_accepted',
//         related_entity_type: 'order',
//         related_entity_id: orderId,
//         action_url: '/customer/orders',
//         priority: 'high',
//         metadata: {
//           order_id: orderId,
//           courier_name: courierName,
//           assigned_at: new Date().toISOString()
//         }
//       });
//     } catch (error) {
//       console.error('Error in notifyCourierAssigned:', error);
//     }
//   },

//   // Enhanced delivery progress notifications
//   async notifyDeliveryProgress(orderId, customerEmail, status, courierName, estimatedTime = null) {
//     try {
//       const customerId = await this.getUserId(customerEmail, 'customer');
//       if (!customerId) return;

//       const progressConfig = {
//         picked_up: {
//           title: '📦 Package Picked Up',
//           message: `${courierName} has picked up your items and is heading to you.`
//         },
//         on_the_way: {
//           title: '🚚 On The Way!',
//           message: `${courierName} is on the way${estimatedTime ? `, ETA: ${estimatedTime}` : ''}.`
//         },
//         arrived: {
//           title: '📍 Arrived at Location',
//           message: `${courierName} has arrived at the delivery location.`
//         }
//       };

//       const config = progressConfig[status] || {
//         title: 'Delivery Update',
//         message: `Your delivery status has been updated.`
//       };

//       return this.createNotification({
//         user_id: customerId,
//         user_type: 'customer',
//         title: config.title,
//         message: config.message,
//         type: 'delivery_update',
//         related_entity_type: 'order',
//         related_entity_id: orderId,
//         action_url: '/customer/orders',
//         priority: 'normal',
//         metadata: {
//           order_id: orderId,
//           status: status,
//           courier_name: courierName,
//           estimated_time: estimatedTime
//         }
//       });
//     } catch (error) {
//       console.error('Error in notifyDeliveryProgress:', error);
//     }
//   },

//   // NEW: Customer feedback notification to courier
//   async notifyCustomerFeedback(orderId, customerName, feedback, courierId) {
//     try {
//       return this.createNotification({
//         user_id: courierId,
//         user_type: 'courier',
//         title: '💬 Customer Feedback Received',
//         message: `${customerName} provided feedback on your service: "${feedback.length > 100 ? feedback.substring(0, 100) + '...' : feedback}"`,
//         type: 'customer_feedback',
//         related_entity_type: 'order',
//         related_entity_id: orderId,
//         action_url: '/courier/history',
//         priority: 'normal',
//         metadata: {
//           order_id: orderId,
//           customer_name: customerName,
//           feedback: feedback,
//           received_at: new Date().toISOString()
//         }
//       });
//     } catch (error) {
//       console.error('Error in notifyCustomerFeedback:', error);
//     }
//   },

//   // NEW: Courier feedback notification to customer
//   async notifyCourierFeedback(orderId, courierName, feedback, customerId) {
//     try {
//       return this.createNotification({
//         user_id: customerId,
//         user_type: 'customer',
//         title: '💬 Courier Feedback Received',
//         message: `${courierName} provided feedback on your order: "${feedback.length > 100 ? feedback.substring(0, 100) + '...' : feedback}"`,
//         type: 'courier_feedback',
//         related_entity_type: 'order',
//         related_entity_id: orderId,
//         action_url: '/customer/orders',
//         priority: 'normal',
//         metadata: {
//           order_id: orderId,
//           courier_name: courierName,
//           feedback: feedback,
//           received_at: new Date().toISOString()
//         }
//       });
//     } catch (error) {
//       console.error('Error in notifyCourierFeedback:', error);
//     }
//   },

//   // NEW: Enhanced new order notifications for couriers
//   async notifyNewOrderToCouriers(orderId, orderDetails) {
//     try {
//       console.log('Notifying couriers about new order:', orderId);

//       // Get eligible couriers
//       let query = supabase
//         .from('couriers')
//         .select('id, email, vehicle_type, is_online')
//         .eq('application_status', 'approved')
//         .eq('is_online', true);

//       if (orderDetails.vehicleType && orderDetails.vehicleType !== 'Any') {
//         query = query.eq('vehicle_type', orderDetails.vehicleType);
//       }

//       const { data: couriers, error } = await query;

//       if (error || !couriers || couriers.length === 0) {
//         console.log('No eligible couriers found');
//         return [];
//       }

//       console.log(`Notifying ${couriers.length} couriers`);

//       const notifications = [];
//       for (const courier of couriers) {
//         const notification = await this.createNotification({
//           user_id: courier.id,
//           user_type: 'courier',
//           title: '📦 New Delivery Request!',
//           message: `New ${orderDetails.serviceType} order available - ₱${orderDetails.totalAmount}`,
//           type: 'new_order',
//           related_entity_type: 'order',
//           related_entity_id: orderId,
//           action_url: '/courier/home',
//           priority: 'high',
//           metadata: {
//             order_id: orderId,
//             service_type: orderDetails.serviceType,
//             pickup_location: orderDetails.pickupLocation,
//             delivery_location: orderDetails.deliveryLocation,
//             vehicle_type: orderDetails.vehicleType,
//             amount: orderDetails.totalAmount,
//             distance: orderDetails.distance,
//             estimated_time: orderDetails.estimatedTime
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifyNewOrderToCouriers:', error);
//       return [];
//     }
//   },

//   // ADMIN NOTIFICATION FUNCTIONS

//   // Notify admin about new customer signup
//   async notifyNewCustomerSignup(customerData) {
//     try {
//       console.log('Notifying admin about new customer signup:', customerData);

//       // Get all admin users
//       const adminUsers = await this.getAdminUsers();
      
//       const notifications = [];
//       for (const admin of adminUsers) {
//         const notification = await this.createNotification({
//           user_id: admin.id,
//           user_type: 'admin',
//           title: '👤 New Customer Signed Up!',
//           message: `${customerData.full_name} just registered on the platform.`,
//           type: 'new_customer_signup',
//           related_entity_type: 'customer',
//           related_entity_id: customerData.id,
//           action_url: '/admin/customers',
//           priority: 'normal',
//           metadata: {
//             customer_id: customerData.id,
//             customer_name: customerData.full_name,
//             customer_email: customerData.email,
//             signup_date: new Date().toISOString()
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifyNewCustomerSignup:', error);
//     }
//   },

//   // Notify admin about new courier application
//   async notifyNewCourierApplication(courierData) {
//     try {
//       console.log('Notifying admin about new courier application:', courierData);

//       const adminUsers = await this.getAdminUsers();
      
//       const notifications = [];
//       for (const admin of adminUsers) {
//         const notification = await this.createNotification({
//           user_id: admin.id,
//           user_type: 'admin',
//           title: '🚚 New Courier Application!',
//           message: `${courierData.full_name} submitted a courier application.`,
//           type: 'new_courier_application',
//           related_entity_type: 'courier',
//           related_entity_id: courierData.id,
//           action_url: '/admin/couriers',
//           priority: 'high',
//           metadata: {
//             courier_id: courierData.id,
//             courier_name: courierData.full_name,
//             courier_email: courierData.email,
//             vehicle_type: courierData.vehicle_type,
//             application_date: new Date().toISOString()
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifyNewCourierApplication:', error);
//     }
//   },

//   // Notify admin about new support ticket
//   async notifyNewSupportTicket(ticketData, userType) {
//     try {
//       console.log('Notifying admin about new support ticket:', ticketData);

//       const adminUsers = await this.getAdminUsers();
      
//       const notifications = [];
//       for (const admin of adminUsers) {
//         const notification = await this.createNotification({
//           user_id: admin.id,
//           user_type: 'admin',
//           title: '📞 New Support Ticket',
//           message: `New ${userType} support ticket: ${ticketData.subject}`,
//           type: 'support_ticket',
//           related_entity_type: 'support_ticket',
//           related_entity_id: ticketData.id,
//           action_url: '/admin/support',
//           priority: ticketData.priority === 'high' ? 'high' : 'normal',
//           metadata: {
//             ticket_id: ticketData.id,
//             subject: ticketData.subject,
//             user_type: userType,
//             priority: ticketData.priority,
//             created_at: new Date().toISOString()
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifyNewSupportTicket:', error);
//     }
//   },

//   // Notify admin about new complaint
//   async notifyNewComplaint(complaintData, userType) {
//     try {
//       console.log('Notifying admin about new complaint:', complaintData);

//       const adminUsers = await this.getAdminUsers();
      
//       const notifications = [];
//       for (const admin of adminUsers) {
//         const notification = await this.createNotification({
//           user_id: admin.id,
//           user_type: 'admin',
//           title: '⚠️ New Complaint Reported',
//           message: `New ${userType} complaint requires attention.`,
//           type: 'complaint_reported',
//           related_entity_type: 'complaint',
//           related_entity_id: complaintData.id,
//           action_url: '/admin/complaints',
//           priority: 'high',
//           metadata: {
//             complaint_id: complaintData.id,
//             complaint_type: complaintData.type,
//             user_type: userType,
//             reported_at: new Date().toISOString()
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifyNewComplaint:', error);
//     }
//   },

//   // NEW: Support complaint notification function
//   async notifyNewSupportComplaint(complaintData, reporterType) {
//     try {
//       console.log('Notifying admin about new support complaint:', complaintData);

//       const adminUsers = await this.getAdminUsers();
      
//       const notifications = [];
//       for (const admin of adminUsers) {
//         const notification = await this.createNotification({
//           user_id: admin.id,
//           user_type: 'admin',
//           title: `⚠️ New ${complaintData.ticket_type === 'complaint' ? 'Complaint' : 'Support Request'}`,
//           message: `${complaintData.reporter_name} (${reporterType}) reported ${complaintData.reported_user_name} (${complaintData.reported_user_type}). Category: ${complaintData.category}`,
//           type: 'complaint_reported',
//           related_entity_type: 'support_complaint',
//           related_entity_id: complaintData.id,
//           action_url: '/admin/support-complaints',
//           priority: complaintData.priority === 'high' ? 'high' : 'normal',
//           metadata: {
//             complaint_id: complaintData.id,
//             reporter_name: complaintData.reporter_name,
//             reporter_type: reporterType,
//             reported_user_name: complaintData.reported_user_name,
//             reported_user_type: complaintData.reported_user_type,
//             category: complaintData.category,
//             ticket_type: complaintData.ticket_type,
//             order_id: complaintData.order_id,
//             priority: complaintData.priority,
//             reported_at: new Date().toISOString()
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifyNewSupportComplaint:', error);
//     }
//   },

//   // NEW: Suspension notification function
//   async notifyUserSuspension(userId, userType, reason, duration = null) {
//     try {
//       const notification = await this.createNotification({
//         user_id: userId,
//         user_type: userType,
//         title: '🚫 Account Suspension',
//         message: `Your account has been suspended${duration ? ` for ${duration}` : ''}. Reason: ${reason}`,
//         type: 'suspension',
//         related_entity_type: 'account',
//         related_entity_id: userId,
//         action_url: userType === 'customer' ? '/customer/support' : '/courier/support',
//         priority: 'high',
//         metadata: {
//           suspension_reason: reason,
//           suspension_duration: duration,
//           suspended_at: new Date().toISOString(),
//           appeal_process: 'Contact support to appeal this decision'
//         }
//       });

//       return notification;
//     } catch (error) {
//       console.error('Error in notifyUserSuspension:', error);
//     }
//   },

//   // Notify admin about urgent system issues
//   async notifySystemIssue(issueData) {
//     try {
//       console.log('Notifying admin about system issue:', issueData);

//       const adminUsers = await this.getAdminUsers();
      
//       const notifications = [];
//       for (const admin of adminUsers) {
//         const notification = await this.createNotification({
//           user_id: admin.id,
//           user_type: 'admin',
//           title: '🚨 System Issue Detected',
//           message: issueData.description,
//           type: 'system_issue',
//           related_entity_type: 'system',
//           related_entity_id: issueData.id,
//           action_url: '/admin/system',
//           priority: 'high',
//           metadata: {
//             issue_id: issueData.id,
//             severity: issueData.severity,
//             component: issueData.component,
//             detected_at: new Date().toISOString()
//           }
//         });
        
//         if (notification) {
//           notifications.push(notification);
//         }
//       }

//       return notifications;
//     } catch (error) {
//       console.error('Error in notifySystemIssue:', error);
//     }
//   },

//   // Get admin users (you'll need to implement this based on your admin system)
//   async getAdminUsers() {
//     try {
//       // This is a placeholder - you'll need to implement based on your admin system
//       // You might have an 'admins' table or use a different method to identify admin users

//       // For now, return a default admin user (you should replace this with actual admin users)
//       return [
//         { id: 999999, email: 'admin@gmail.com', name: 'Admin' }
//       ];
//     } catch (error) {
//       console.error('Error getting admin users:', error);
//       return [];
//     }
//   },

//   // Utility methods
//   async markAsRead(notificationId) {
//     const { error } = await supabase
//       .from('notifications')
//       .update({ 
//         is_read: true,
//         updated_at: new Date().toISOString()
//       })
//       .eq('id', notificationId);

//     if (error) {
//       console.error('Error marking notification as read:', error);
//       throw error;
//     }
//   },

//   async markAllAsRead(userId, userType) {
//     const { error } = await supabase
//       .from('notifications')
//       .update({ 
//         is_read: true,
//         updated_at: new Date().toISOString()
//       })
//       .eq('user_id', userId)
//       .eq('user_type', userType)
//       .eq('is_read', false);

//     if (error) {
//       console.error('Error marking all notifications as read:', error);
//       throw error;
//     }
//   }
// };

// export default notificationService;

// hooks/notificationService.js
// hooks/notificationService.js
import { supabase } from '../utils/supabaseClient';

export const notificationService = {
  // Helper function to convert integer ID to UUID format
  intToUUID(intId) {
    if (!intId) return null;
    
    // Convert integer to hex and pad to 32 characters for UUID format
    const hexString = intId.toString(16).padStart(32, '0');
    
    // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    return `${hexString.substring(0, 8)}-${hexString.substring(8, 12)}-${hexString.substring(12, 16)}-${hexString.substring(16, 20)}-${hexString.substring(20, 32)}`;
  },

  // Get user ID from email
  async getUserId(email, userType) {
    try {
      const table = userType === 'customer' ? 'customers' : 'couriers';
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  // Get user email from ID
  async getUserEmail(userId, userType) {
    try {
      const table = userType === 'customer' ? 'customers' : 'couriers';
      const { data, error } = await supabase
        .from(table)
        .select('email')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data.email;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  },

  // Enhanced notification creation - FIXED: Convert integer IDs to UUID format
  async createNotification(notificationData) {
    try {
      console.log('Creating notification:', notificationData);

      // Validate required fields
      const requiredFields = ['user_id', 'user_type', 'title', 'message', 'type'];
      for (const field of requiredFields) {
        if (!notificationData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Convert related_entity_id to UUID format if it's an integer
      const fixedNotificationData = {
        ...notificationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Convert integer IDs to proper UUID format
      if (notificationData.related_entity_id && typeof notificationData.related_entity_id === 'number') {
        fixedNotificationData.related_entity_id = this.intToUUID(notificationData.related_entity_id);
        console.log('✅ Converted integer ID to UUID:', notificationData.related_entity_id, '->', fixedNotificationData.related_entity_id);
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([fixedNotificationData])
        .select();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      console.log('✅ Notification created successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw error;
    }
  },

  // Check user notification preferences
  async shouldSendNotification(userId, userType, notificationType) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('enabled')
        .eq('user_id', userId)
        .eq('user_type', userType)
        .eq('notification_type', notificationType)
        .single();

      // If no preference found, default to enabled
      if (error || !data) {
        return true;
      }

      return data.enabled;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return true;
    }
  },

  // Initialize default preferences for a user
  async initializeUserPreferences(userId, userType) {
    try {
      const defaultPreferences = [
        'delivery_update',
        'new_order', 
        'payment_update',
        'rating_received',
        'report_update',
        'system_alert',
        'rule_change',
        'promotion',
        'customer_feedback',
        'courier_feedback',
        'order_accepted',
        'on_the_way',
        'order_delivered'
      ];

      const preferences = defaultPreferences.map(type => ({
        user_id: userId,
        user_type: userType,
        notification_type: type,
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(preferences, {
          onConflict: 'user_id,user_type,notification_type'
        });

      if (error) throw error;
      console.log('Default preferences initialized for user:', userId);
    } catch (error) {
      console.error('Error initializing preferences:', error);
    }
  },

  // Enhanced order status notifications
  async notifyOrderStatusUpdate(orderId, newStatus, customerEmail, metadata = {}) {
    try {
      const customerId = await this.getUserId(customerEmail, 'customer');
      if (!customerId) {
        console.error('Customer not found for email:', customerEmail);
        return;
      }

      const statusConfig = {
        pending: {
          title: '📦 Order Received',
          message: 'Your order has been received and is waiting for a courier',
          priority: 'normal'
        },
        accepted: {
          title: '🎉 Order Accepted!',
          message: `Your order has been accepted by ${metadata.courier_name || 'a courier'}!`,
          priority: 'high'
        },
        picked_up: {
          title: '📦 Package Picked Up',
          message: 'Your items have been picked up and are on the way!',
          priority: 'normal'
        },
        on_the_way: {
          title: '🚚 On The Way!',
          message: 'Your delivery is en route to your location.',
          priority: 'normal'
        },
        arrived: {
          title: '📍 Courier Arrived',
          message: 'Your courier has arrived at the delivery location',
          priority: 'high'
        },
        delivered: {
          title: '✅ Delivery Completed!',
          message: 'Your order has been successfully delivered. Thank you!',
          priority: 'normal'
        },
        cancelled: {
          title: '❌ Order Cancelled',
          message: `Your order has been cancelled${metadata.reason ? `: ${metadata.reason}` : ''}`,
          priority: 'high'
        }
      };

      const config = statusConfig[newStatus] || {
        title: 'Order Status Update',
        message: `Your order status has been updated to ${newStatus}`,
        priority: 'normal'
      };

      return this.createNotification({
        user_id: customerId,
        user_type: 'customer',
        title: config.title,
        message: config.message,
        type: 'delivery_update',
        related_entity_type: 'order',
        related_entity_id: orderId,
        action_url: '/customer/orders',
        priority: config.priority,
        metadata: {
          order_id: orderId,
          status: newStatus,
          ...metadata
        }
      });
    } catch (error) {
      console.error('Error in notifyOrderStatusUpdate:', error);
    }
  },

  // Enhanced courier assignment notification
  async notifyCourierAssigned(orderId, customerEmail, courierName) {
    try {
      const customerId = await this.getUserId(customerEmail, 'customer');
      if (!customerId) return;

      return this.createNotification({
        user_id: customerId,
        user_type: 'customer',
        title: '🚗 Courier Assigned!',
        message: `${courierName} has accepted your order and is on the way to pickup.`,
        type: 'order_accepted',
        related_entity_type: 'order',
        related_entity_id: orderId,
        action_url: '/customer/orders',
        priority: 'high',
        metadata: {
          order_id: orderId,
          courier_name: courierName,
          assigned_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in notifyCourierAssigned:', error);
    }
  },

  // Enhanced delivery progress notifications
  async notifyDeliveryProgress(orderId, customerEmail, status, courierName, estimatedTime = null) {
    try {
      const customerId = await this.getUserId(customerEmail, 'customer');
      if (!customerId) return;

      const progressConfig = {
        picked_up: {
          title: '📦 Package Picked Up',
          message: `${courierName} has picked up your items and is heading to you.`
        },
        on_the_way: {
          title: '🚚 On The Way!',
          message: `${courierName} is on the way${estimatedTime ? `, ETA: ${estimatedTime}` : ''}.`
        },
        arrived: {
          title: '📍 Arrived at Location',
          message: `${courierName} has arrived at the delivery location.`
        }
      };

      const config = progressConfig[status] || {
        title: 'Delivery Update',
        message: `Your delivery status has been updated.`
      };

      return this.createNotification({
        user_id: customerId,
        user_type: 'customer',
        title: config.title,
        message: config.message,
        type: 'delivery_update',
        related_entity_type: 'order',
        related_entity_id: orderId,
        action_url: '/customer/orders',
        priority: 'normal',
        metadata: {
          order_id: orderId,
          status: status,
          courier_name: courierName,
          estimated_time: estimatedTime
        }
      });
    } catch (error) {
      console.error('Error in notifyDeliveryProgress:', error);
    }
  },

  // Customer feedback notification to courier
  async notifyCustomerFeedback(orderId, customerName, feedback, courierId) {
    try {
      return this.createNotification({
        user_id: courierId,
        user_type: 'courier',
        title: '💬 Customer Feedback Received',
        message: `${customerName} provided feedback on your service: "${feedback.length > 100 ? feedback.substring(0, 100) + '...' : feedback}"`,
        type: 'customer_feedback',
        related_entity_type: 'order',
        related_entity_id: orderId,
        action_url: '/courier/history',
        priority: 'normal',
        metadata: {
          order_id: orderId,
          customer_name: customerName,
          feedback: feedback,
          received_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in notifyCustomerFeedback:', error);
    }
  },

  // Courier feedback notification to customer
  async notifyCourierFeedback(orderId, courierName, feedback, customerId) {
    try {
      return this.createNotification({
        user_id: customerId,
        user_type: 'customer',
        title: '💬 Courier Feedback Received',
        message: `${courierName} provided feedback on your order: "${feedback.length > 100 ? feedback.substring(0, 100) + '...' : feedback}"`,
        type: 'courier_feedback',
        related_entity_type: 'order',
        related_entity_id: orderId,
        action_url: '/customer/orders',
        priority: 'normal',
        metadata: {
          order_id: orderId,
          courier_name: courierName,
          feedback: feedback,
          received_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in notifyCourierFeedback:', error);
    }
  },

  // Enhanced new order notifications for couriers
  async notifyNewOrderToCouriers(orderId, orderDetails) {
    try {
      console.log('Notifying couriers about new order:', orderId);

      // Get eligible couriers
      let query = supabase
        .from('couriers')
        .select('id, email, vehicle_type')
        .eq('application_status', 'approved');

      // Fetch all approved and online couriers first
      // We filter vehicle type in memory to avoid 400 errors from DB enum mismatches
      const { data: allCouriers, error } = await query;

      if (error) {
        console.error('Error fetching couriers for notification:', error);
        return;
      }

      let couriers = allCouriers || [];

      // Filter couriers by vehicle type in memory
      if (orderDetails.vehicleType && orderDetails.vehicleType !== 'Any') {
        const requestedType = orderDetails.vehicleType.toLowerCase();
        
        // Map of requested types to possible DB values (aliases)
        // This handles cases where DB stores 'walking' but frontend asks for 'On-Foot'
        const typeAliases = {
          'on-foot': ['walking', 'on-foot', 'on foot', 'walker'],
          'walking': ['walking', 'on-foot', 'on foot', 'walker'],
          'bicycle': ['bicycle', 'bike', 'cycling'],
          'motorcycle': ['motorcycle', 'motorbike', 'moto'],
          'scooter': ['scooter', 'motorcycle'],
          'car': ['car', 'sedan', '4-wheels'],
          'van': ['van', 'l300', 'truck'],
          'truck': ['truck', 'van', 'l300']
        };

        const searchTerms = typeAliases[requestedType] || [requestedType];

        couriers = couriers.filter(courier => {
          if (!courier.vehicle_type) return false;
          const courierVehicle = courier.vehicle_type.toLowerCase();
          
          // Check if the courier's vehicle matches any of the valid aliases
          return searchTerms.some(term => courierVehicle === term || courierVehicle.includes(term));
        });

        console.log(`Filtered couriers for ${requestedType}:`, couriers.length);
      }

      if (error || !couriers || couriers.length === 0) {
        console.log('No eligible couriers found');
        return [];
      }

      console.log(`Notifying ${couriers.length} couriers`);

      const notifications = [];
      for (const courier of couriers) {
        const notification = await this.createNotification({
          user_id: courier.id,
          user_type: 'courier',
          title: '📦 New Delivery Request!',
          message: `New ${orderDetails.serviceType} order available - ₱${orderDetails.totalAmount}`,
          type: 'new_order',
          related_entity_type: 'order',
          related_entity_id: orderId,
          action_url: '/courier/home',
          priority: 'high',
          metadata: {
            order_id: orderId,
            service_type: orderDetails.serviceType,
            pickup_location: orderDetails.pickupLocation,
            delivery_location: orderDetails.deliveryLocation,
            vehicle_type: orderDetails.vehicleType,
            amount: orderDetails.totalAmount,
            distance: orderDetails.distance,
            estimated_time: orderDetails.estimatedTime
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyNewOrderToCouriers:', error);
      return [];
    }
  },

  // ADMIN NOTIFICATION FUNCTIONS

  // Get admin users - FIXED: Since no admins table, use a default admin ID
  async getAdminUsers() {
    try {
      // Since you don't have an admins table, we'll use a default admin user
      return [
        { 
          id: 999999, 
          email: 'admin@gmail.com', 
          name: 'Admin',
          user_type: 'admin'
        }
      ];
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [
        { 
          id: 999999, 
          email: 'admin@gmail.com', 
          name: 'Admin',
          user_type: 'admin'
        }
      ];
    }
  },

  // Notify admin about new customer signup - FIXED
  async notifyNewCustomerSignup(customerData) {
    try {
      console.log('Notifying admin about new customer signup:', customerData);

      // Get all admin users
      const adminUsers = await this.getAdminUsers();
      
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          user_id: admin.id,
          user_type: 'admin',
          title: '👤 New Customer Signed Up!',
          message: `${customerData.full_name} just registered on the platform.`,
          type: 'new_customer_signup',
          related_entity_type: 'customer',
          related_entity_id: customerData.id,
          action_url: '/admin/customers',
          priority: 'normal',
          metadata: {
            customer_id: customerData.id,
            customer_name: customerData.full_name,
            customer_email: customerData.email,
            signup_date: new Date().toISOString()
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      console.log(`✅ Created ${notifications.length} admin notifications for new customer`);
      return notifications;
    } catch (error) {
      console.error('Error in notifyNewCustomerSignup:', error);
    }
  },

  // Notify admin about new courier application - FIXED
  async notifyNewCourierApplication(courierData) {
    try {
      console.log('Notifying admin about new courier application:', courierData);

      const adminUsers = await this.getAdminUsers();
      
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          user_id: admin.id,
          user_type: 'admin',
          title: '🚚 New Courier Application!',
          message: `${courierData.full_name} submitted a courier application.`,
          type: 'new_courier_application',
          related_entity_type: 'courier',
          related_entity_id: courierData.id,
          action_url: '/admin/couriers',
          priority: 'high',
          metadata: {
            courier_id: courierData.id,
            courier_name: courierData.full_name,
            courier_email: courierData.email,
            vehicle_type: courierData.vehicle_type,
            application_date: new Date().toISOString(),
            application_status: 'pending'
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      console.log(`✅ Created ${notifications.length} admin notifications for new courier application`);
      return notifications;
    } catch (error) {
      console.error('Error in notifyNewCourierApplication:', error);
    }
  },

  // Notify admin about new support ticket
  async notifyNewSupportTicket(ticketData, userType) {
    try {
      console.log('Notifying admin about new support ticket:', ticketData);

      const adminUsers = await this.getAdminUsers();
      
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          user_id: admin.id,
          user_type: 'admin',
          title: '📞 New Support Ticket',
          message: `New ${userType} support ticket: ${ticketData.subject}`,
          type: 'support_ticket',
          related_entity_type: 'support_ticket',
          related_entity_id: ticketData.id,
          action_url: '/admin/support',
          priority: ticketData.priority === 'high' ? 'high' : 'normal',
          metadata: {
            ticket_id: ticketData.id,
            subject: ticketData.subject,
            user_type: userType,
            priority: ticketData.priority,
            created_at: new Date().toISOString()
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyNewSupportTicket:', error);
    }
  },

  // Notify admin about new complaint
  async notifyNewComplaint(complaintData, userType) {
    try {
      console.log('Notifying admin about new complaint:', complaintData);

      const adminUsers = await this.getAdminUsers();
      
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          user_id: admin.id,
          user_type: 'admin',
          title: '⚠️ New Complaint Reported',
          message: `New ${userType} complaint requires attention.`,
          type: 'complaint_reported',
          related_entity_type: 'complaint',
          related_entity_id: complaintData.id,
          action_url: '/admin/complaints',
          priority: 'high',
          metadata: {
            complaint_id: complaintData.id,
            complaint_type: complaintData.type,
            user_type: userType,
            reported_at: new Date().toISOString()
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyNewComplaint:', error);
    }
  },

  // Support complaint notification function
  async notifyNewSupportComplaint(complaintData, reporterType) {
    try {
      console.log('Notifying admin about new support complaint:', complaintData);

      const adminUsers = await this.getAdminUsers();
      
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          user_id: admin.id,
          user_type: 'admin',
          title: `⚠️ New ${complaintData.ticket_type === 'complaint' ? 'Complaint' : 'Support Request'}`,
          message: `${complaintData.reporter_name} (${reporterType}) reported ${complaintData.reported_user_name} (${complaintData.reported_user_type}). Category: ${complaintData.category}`,
          type: 'complaint_reported',
          related_entity_type: 'support_complaint',
          related_entity_id: complaintData.id,
          action_url: '/admin/support-complaints',
          priority: complaintData.priority === 'high' ? 'high' : 'normal',
          metadata: {
            complaint_id: complaintData.id,
            reporter_name: complaintData.reporter_name,
            reporter_type: reporterType,
            reported_user_name: complaintData.reported_user_name,
            reported_user_type: complaintData.reported_user_type,
            category: complaintData.category,
            ticket_type: complaintData.ticket_type,
            order_id: complaintData.order_id,
            priority: complaintData.priority,
            reported_at: new Date().toISOString()
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyNewSupportComplaint:', error);
    }
  },

  // Suspension notification function
  async notifyUserSuspension(userId, userType, reason, duration = null) {
    try {
      const notification = await this.createNotification({
        user_id: userId,
        user_type: userType,
        title: '🚫 Account Suspension',
        message: `Your account has been suspended${duration ? ` for ${duration}` : ''}. Reason: ${reason}`,
        type: 'suspension',
        related_entity_type: 'account',
        related_entity_id: userId,
        action_url: userType === 'customer' ? '/customer/support' : '/courier/support',
        priority: 'high',
        metadata: {
          suspension_reason: reason,
          suspension_duration: duration,
          suspended_at: new Date().toISOString(),
          appeal_process: 'Contact support to appeal this decision'
        }
      });

      return notification;
    } catch (error) {
      console.error('Error in notifyUserSuspension:', error);
    }
  },

  // Notify admin about urgent system issues
  async notifySystemIssue(issueData) {
    try {
      console.log('Notifying admin about system issue:', issueData);

      const adminUsers = await this.getAdminUsers();
      
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          user_id: admin.id,
          user_type: 'admin',
          title: '🚨 System Issue Detected',
          message: issueData.description,
          type: 'system_issue',
          related_entity_type: 'system',
          related_entity_id: issueData.id,
          action_url: '/admin/system',
          priority: 'high',
          metadata: {
            issue_id: issueData.id,
            severity: issueData.severity,
            component: issueData.component,
            detected_at: new Date().toISOString()
          }
        });
        
        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifySystemIssue:', error);
    }
  },

  // Utility methods
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId, userType) {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('user_type', userType)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};

export default notificationService;