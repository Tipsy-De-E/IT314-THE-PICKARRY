// Authentication utility functions
export const setUserSession = (userType, userData) => {
  localStorage.setItem('userType', userType);
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserSession = () => {
  const userType = localStorage.getItem('userType');
  const userData = localStorage.getItem('userData');
  
  if (userType && userData) {
    return {
      userType,
      userData: JSON.parse(userData)
    };
  }
  return null;
};

export const clearUserSession = () => {
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
};

export const isAuthenticated = () => {
  return getUserSession() !== null;
};

export const isAdmin = () => {
  const session = getUserSession();
  return session && session.userType === 'admin';
};

export const isCustomer = () => {
  const session = getUserSession();
  return session && session.userType === 'customer';
};

export const isCourier = () => {
  const session = getUserSession();
  return session && session.userType === 'courier';
};