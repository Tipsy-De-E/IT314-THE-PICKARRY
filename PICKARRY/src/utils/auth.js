// // utils/auth.js

// // Store user session
// export const setUserSession = (userType, userData) => {
//   try {
//     localStorage.setItem('userType', userType);
//     localStorage.setItem('userData', JSON.stringify(userData));
//   } catch (err) {
//     console.error('Error setting user session:', err);
//   }
// };

// // Retrieve user session
// export const getUserSession = () => {
//   try {
//     const userType = localStorage.getItem('userType');
//     const userData = localStorage.getItem('userData');

//     if (userType && userData) {
//       return {
//         userType,
//         userData: JSON.parse(userData)
//       };
//     }
//     return null;
//   } catch (err) {
//     console.error('Error reading user session:', err);
//     return null;
//   }
// };

// // Clear user session
// export const clearUserSession = () => {
//   try {
//     localStorage.removeItem('userType');
//     localStorage.removeItem('userData');
//   } catch (err) {
//     console.error('Error clearing user session:', err);
//   }
// };

// // Check if any user is authenticated
// export const isAuthenticated = () => getUserSession() !== null;

// // Check user roles
// export const isAdmin = () => {
//   const session = getUserSession();
//   return session?.userType === 'admin';
// };

// export const isCustomer = () => {
//   const session = getUserSession();
//   return session?.userType === 'customer';
// };

// export const isCourier = () => {
//   const session = getUserSession();
//   return session?.userType === 'courier';
// };

// // Get current user data directly
// export const getCurrentUser = () => getUserSession()?.userData || null;

// utils/auth.js
import { supabase } from './supabaseClient';

// Store user session
export const setUserSession = async (userType, userData) => {
  try {
    // Get the actual Supabase user ID
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    const sessionData = {
      userType,
      userData: {
        ...userData,
        // Include the actual Supabase user ID
        id: authUser?.id || userData.id,
        email: authUser?.email || userData.email
      },
      // Store the Supabase session separately
      supabaseUserId: authUser?.id
    };

    localStorage.setItem('userType', userType);
    localStorage.setItem('userData', JSON.stringify(sessionData.userData));
    localStorage.setItem('supabaseSession', JSON.stringify(sessionData));
    
    console.log('User session set:', sessionData);
  } catch (err) {
    console.error('Error setting user session:', err);
  }
};

// Retrieve user session
export const getUserSession = () => {
  try {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    const supabaseSession = localStorage.getItem('supabaseSession');

    // Prefer the supabaseSession if available
    if (supabaseSession) {
      return JSON.parse(supabaseSession);
    }

    // Fallback to old format
    if (userType && userData) {
      return {
        userType,
        userData: JSON.parse(userData)
      };
    }
    return null;
  } catch (err) {
    console.error('Error reading user session:', err);
    return null;
  }
};

// Clear user session
export const clearUserSession = () => {
  try {
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    localStorage.removeItem('supabaseSession');
  } catch (err) {
    console.error('Error clearing user session:', err);
  }
};

// Get current user data with proper ID extraction
export const getCurrentUser = () => {
  const session = getUserSession();
  
  if (!session) return null;

  // If we have the new session format with supabaseUserId
  if (session.supabaseUserId) {
    return {
      ...session.userData,
      id: session.supabaseUserId // Use the actual Supabase user ID
    };
  }

  // Fallback to old format
  return session.userData;
};

// Get user ID directly (for notifications)
export const getUserId = async () => {
  try {
    // Method 1: Try to get from current session
    const session = getCurrentUser();
    if (session?.id) {
      return session.id;
    }

    // Method 2: Try to get from Supabase auth directly
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser?.id) {
      return authUser.id;
    }

    // Method 3: Try to get from session storage
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (authSession?.user?.id) {
      return authSession.user.id;
    }

    console.error('Could not get user ID from any method');
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Check if any user is authenticated
export const isAuthenticated = () => {
  const session = getUserSession();
  if (session) return true;

  // Also check if there's a Supabase session
  try {
    const supabaseSession = localStorage.getItem('supabase.auth.token');
    return !!supabaseSession;
  } catch (err) {
    return false;
  }
};

// Check user roles
export const isAdmin = () => {
  const session = getUserSession();
  return session?.userType === 'admin';
};

export const isCustomer = () => {
  const session = getUserSession();
  return session?.userType === 'customer';
};

export const isCourier = () => {
  const session = getUserSession();
  return session?.userType === 'courier';
};