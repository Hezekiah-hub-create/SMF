import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on initial render
    return !!localStorage.getItem('token');
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token by fetching profile
          const userData = await authService.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function - accepts API response with token and user
  const login = async (response) => {
    const { token, user } = response;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile - use useCallback to maintain stable reference
  const updateUser = useCallback(async (userData) => {
    setUser(prevUser => {
      if (JSON.stringify(prevUser) !== JSON.stringify(userData)) {
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return prevUser;
    });
  }, []);

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser
  }), [user, token, loading, isAuthenticated, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
