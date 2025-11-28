import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authApi, setCsrfToken } from '@/services/apiClient';

const STORAGE_KEY = 'zenith-admin-user';
const safeStorage =
  typeof window !== 'undefined' ? window.localStorage : undefined;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const persistUser = (data, remember) => {
    if (!safeStorage) return;
    if (remember && data) {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      safeStorage.removeItem(STORAGE_KEY);
    }
  };

  const hydrateFromStorage = () => {
    if (!safeStorage) return null;
    const cached = safeStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  };

  const syncAuthState = (session) => {
    if (session?.user) {
      setUser(session.user);
      setIsAuthenticated(true);
      setAuthError(null);
      if (session.csrf_token) {
        setCsrfToken(session.csrf_token);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setCsrfToken(null);
    }
  };

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const session = await authApi.check();
      syncAuthState(session);
    } catch (error) {
      const cached = hydrateFromStorage();
      if (cached) {
        setUser(cached);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthError(
        error?.message || 'Unable to verify session. Please login again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username, password, rememberMe = true) => {
    try {
      const response = await authApi.login({ username, password });
      syncAuthState(response);
      persistUser(response.user, rememberMe);
      return { success: true };
    } catch (error) {
      setAuthError(error?.message || 'Invalid credentials');
      return {
        success: false,
        error: error?.message || 'Invalid username or password',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout failed', error);
    } finally {
      persistUser(null, false);
      syncAuthState(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    authError,
    login,
    logout,
    refreshSession: checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};