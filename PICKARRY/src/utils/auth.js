// utils/auth.js

// Store user session
export const setUserSession = (userType, userData) => {
  try {
    console.log('🔧 Setting user session:', { userType, userData });
    
    const sessionData = {
      userType,
      userData,
      timestamp: new Date().getTime()
    };

    localStorage.setItem('userType', userType);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    console.log('✅ User session set successfully');
    return true;
  } catch (err) {
    console.error('❌ Error setting user session:', err);
    return false;
  }
};

// Retrieve user session
export const getUserSession = () => {
  try {
    // Try to get from unified session storage first
    const sessionStr = localStorage.getItem('userSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      
      // Check if session is expired (optional: 24 hours)
      const now = new Date().getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - session.timestamp > maxAge) {
        console.log('🕒 Session expired, clearing...');
        clearUserSession();
        return null;
      }
      
      return session;
    }

    // Fallback to old format for backward compatibility
    const userType = localStorage.getItem('userType');
    const userDataStr = localStorage.getItem('userData');

    if (userType && userDataStr) {
      console.log('🔍 Found old format session, migrating...');
      const userData = JSON.parse(userDataStr);
      
      // Migrate to new format
      const sessionData = {
        userType,
        userData,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      return sessionData;
    }

    console.log('🔍 No user session found');
    return null;
  } catch (err) {
    console.error('❌ Error reading user session:', err);
    return null;
  }
};

// Clear user session
export const clearUserSession = () => {
  try {
    console.log('🧹 Clearing user session...');
    
    // Clear all session-related items
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    localStorage.removeItem('userSession');
    
    console.log('✅ User session cleared successfully');
    return true;
  } catch (err) {
    console.error('❌ Error clearing user session:', err);
    return false;
  }
};

// Check if any user is authenticated
export const isAuthenticated = () => {
  const session = getUserSession();
  
  if (!session) {
    console.log('🔍 No session found in isAuthenticated()');
    return false;
  }
  
  // Check session age
  const now = new Date().getTime();
  const sessionAge = now - session.timestamp;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (sessionAge > maxAge) {
    console.log('🕒 Session expired in isAuthenticated()');
    clearUserSession();
    return false;
  }
  
  console.log('✅ User is authenticated');
  return true;
};

// Check user roles
export const isAdmin = () => {
  const session = getUserSession();
  const isAdmin = session?.userType === 'admin';
  console.log('👑 isAdmin check:', isAdmin);
  return isAdmin;
};

export const isCustomer = () => {
  const session = getUserSession();
  const isCustomer = session?.userType === 'customer';
  console.log('👤 isCustomer check:', isCustomer);
  return isCustomer;
};

export const isCourier = () => {
  const session = getUserSession();
  const isCourier = session?.userType === 'courier';
  console.log('🚚 isCourier check:', isCourier);
  return isCourier;
};

// Get current user data directly
export const getCurrentUser = () => {
  const session = getUserSession();
  return session?.userData || null;
};

// Get user ID directly
export const getUserId = () => {
  const user = getCurrentUser();
  return user?.id || null;
};

// Helper to get user role
export const getUserRole = () => {
  const session = getUserSession();
  return session?.userType || null;
};

// Verify and refresh session if needed
export const verifySession = () => {
  const session = getUserSession();
  
  if (!session) {
    return false;
  }
  
  // Check if session is recent (within last 5 minutes)
  const now = new Date().getTime();
  const sessionAge = now - session.timestamp;
  const refreshThreshold = 5 * 60 * 1000; // 5 minutes
  
  if (sessionAge > refreshThreshold) {
    console.log('🔄 Refreshing session timestamp...');
    session.timestamp = now;
    localStorage.setItem('userSession', JSON.stringify(session));
  }
  
  return true;
};

// Check if session exists and is valid
export const checkSessionValidity = () => {
  if (!isAuthenticated()) {
    return false;
  }
  
  return verifySession();
};