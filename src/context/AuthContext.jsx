import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isLoading, setIsLoading] = useState(true);
  const [axiosInstance] = useState(() => {
    const instance = axios.create();
    
    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(
              'https://doctorappointmentbackend-e6hx.onrender.com/users/token/refresh/',
              {
                refresh: refreshToken
              }
            );

            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            setToken(newAccessToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Update token and user when localStorage changes
    const handleStorageChange = () => {
      setToken(localStorage.getItem('accessToken'));
      setUser(JSON.parse(localStorage.getItem('user')));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isLoading,
    axiosInstance,
    setToken: (newToken) => {
      localStorage.setItem('accessToken', newToken);
      setToken(newToken);
    },
    setUser: (newUser) => {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    },
    logout
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
