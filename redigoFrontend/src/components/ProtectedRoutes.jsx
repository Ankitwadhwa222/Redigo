import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
          withCredentials: true // Send cookies
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Fall back to localStorage auth.
      }

      const localToken = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');
      if (localToken && localUser) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;