// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/auth';

// Fixed ID for admin user (since admin is not a real Supabase user)
// Using integer since database schema expects INTEGER type for user_id
const ADMIN_USER_ID = 999999;

export const useNotifications = (userType) => {
  const [notifications, setNotifications] = useState([]);
  // unreadCount is derived from notifications to ensure consistency
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    if (userType) {
      fetchNotifications();
      fetchPreferences();
      subscribeToNotifications();
    }
  }, [userType]);

  const fetchNotifications = async () => {
    try {
      const session = getCurrentUser();
      if (!session) return;

      let userId;

      if (userType === 'admin') {
        userId = ADMIN_USER_ID;
      } else {
        // Get user ID from the appropriate table based on userType
        let userTable = userType === 'customer' ? 'customers' : 'couriers';
        const { data: userData, error: userError } = await supabase
          .from(userTable)
          .select('id')
          .eq('email', session.email)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          return;
        }

        userId = userData.id;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('user_type', userType)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const session = getCurrentUser();
      if (!session) return;

      let userId;

      if (userType === 'admin') {
        userId = ADMIN_USER_ID;
      } else {
        let userTable = userType === 'customer' ? 'customers' : 'couriers';
        const { data: userData } = await supabase
          .from(userTable)
          .select('id')
          .eq('email', session.email)
          .single();

        if (!userData) return;
        userId = userData.id;
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('user_type', userType);

      if (error) throw error;

      const prefs = {};
      data?.forEach(pref => {
        prefs[pref.notification_type] = pref.enabled;
      });
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const session = getCurrentUser();
      if (!session) return;

      let userId;

      if (userType === 'admin') {
        userId = ADMIN_USER_ID;
      } else {
        let userTable = userType === 'customer' ? 'customers' : 'couriers';
        const { data: userData } = await supabase
          .from(userTable)
          .select('id')
          .eq('email', session.email)
          .single();

        if (!userData) return;
        userId = userData.id;
      }

      const subscription = supabase
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            );
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  // ... rest of the functions remain the same (markAsRead, markAllAsRead, updatePreference) ...
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const session = getCurrentUser();
      if (!session) return;

      let userId;

      if (userType === 'admin') {
        userId = ADMIN_USER_ID;
      } else {
        let userTable = userType === 'customer' ? 'customers' : 'couriers';
        const { data: userData } = await supabase
          .from(userTable)
          .select('id')
          .eq('email', session.email)
          .single();

        if (!userData) return;
        userId = userData.id;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('user_type', userType)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updatePreference = async (notificationType, enabled) => {
    try {
      const session = getCurrentUser();
      if (!session) return;

      let userId;

      if (userType === 'admin') {
        userId = ADMIN_USER_ID;
      } else {
        let userTable = userType === 'customer' ? 'customers' : 'couriers';
        const { data: userData } = await supabase
          .from(userTable)
          .select('id')
          .eq('email', session.email)
          .single();

        if (!userData) return;
        userId = userData.id;
      }

      // Upsert preference
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          user_type: userType,
          notification_type: notificationType,
          enabled: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,user_type,notification_type'
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [notificationType]: enabled }));
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreference,
    refreshNotifications: fetchNotifications
  };
};