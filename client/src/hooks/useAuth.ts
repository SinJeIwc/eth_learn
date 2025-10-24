import { useState, useEffect, useCallback } from 'react';
import { UserData, AuthState, getStoredAuthData, storeAuthData, clearAuthData, validateToken } from '../lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedData = getStoredAuthData();
      
      if (storedData && validateToken(storedData.token)) {
        setAuthState({
          isAuthenticated: true,
          userData: storedData,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData: UserData) => {
    storeAuthData(userData);
    setAuthState({
      isAuthenticated: true,
      userData,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshAuth = useCallback(() => {
    const storedData = getStoredAuthData();
    
    if (storedData && validateToken(storedData.token)) {
      setAuthState({
        isAuthenticated: true,
        userData: storedData,
        isLoading: false,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
  };
}
