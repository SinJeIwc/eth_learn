import { useState, useEffect, useCallback } from "react";
import {
  UserData,
  AuthState,
  getStoredAuthData,
  storeAuthData,
  clearAuthData,
} from "../lib/auth";
import { isTokenExpired, verifyXsollaToken, getUserInfoFromToken } from "../lib/xsollaApi";
import { XSOLLA_CONFIG } from "../config/xsolla";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state on mount and verify Xsolla token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedData = getStoredAuthData();

      if (!storedData) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Check if user has Xsolla token
      if (storedData.authType === 'xsolla' && storedData.xsollaToken) {
        // Check if token is expired
        if (isTokenExpired(storedData.xsollaToken)) {
          console.log('Xsolla token expired, logging out');
          clearAuthData();
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Verify token with Xsolla API (optional, can be done on server)
        try {
          const isValid = await verifyXsollaToken(storedData.xsollaToken, XSOLLA_CONFIG.LOGIN_ID);
          
          if (!isValid) {
            console.log('Xsolla token is invalid, logging out');
            clearAuthData();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Update user info from token (in case it changed)
          const userInfo = getUserInfoFromToken(storedData.xsollaToken);
          if (userInfo) {
            storedData.username = userInfo.username;
            storedData.email = userInfo.email;
            storeAuthData(storedData);
          }

          console.log('✅ Xsolla token verified successfully');
        } catch (error) {
          console.error('Failed to verify Xsolla token:', error);
          // Continue with stored data even if verification fails (offline mode)
        }
      }

      setAuthState({
        isAuthenticated: true,
        userData: storedData,
        isLoading: false,
      });
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

  return {
    ...authState,
    login,
    logout,
  };
}
