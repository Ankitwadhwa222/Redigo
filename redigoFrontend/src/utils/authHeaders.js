export const getStoredToken = () => {
  return localStorage.getItem('token') || null;
};

export const getAuthToken = () => {
  const token = getStoredToken();
  if (!token) return null;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const getAuthHeaders = () => {
  const authToken = getAuthToken();
  return authToken ? { Authorization: authToken } : {};
};
