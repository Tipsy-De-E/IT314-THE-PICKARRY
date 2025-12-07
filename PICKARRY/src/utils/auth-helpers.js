import { supabase } from './supabase';


export const logUserActivity = async (action, targetUserId, targetUserType, details = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logData = {
      admin_id: user?.id, 
      action,
      target_user_id: targetUserId,
      target_user_type: targetUserType,
      details,
      ip_address: details.ipAddress, 
      user_agent: navigator.userAgent
    };

    const { error } = await supabase
      .from('admin_activity_log')
      .insert([logData]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logUserActivity:', error);
  }
};

export const createCourierProfile = async (userId, courierData) => {
  try {
 
    const { count } = await supabase
      .from('couriers')
      .select('*', { count: 'exact', head: true });

    const courierId = `COU_${String(count + 1).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('couriers')
      .insert([{
        user_id: userId,
        courier_id: courierId,
        name: courierData.name,
        phone: courierData.phone,
        email: courierData.email,
        address: courierData.address,
        vehicle_type: courierData.vehicleType,
        license_number: courierData.licenseNumber,
        status: 'pending' 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating courier profile:', error);
    throw error;
  }
};