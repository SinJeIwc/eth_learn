"use client";

import { useEffect, useState } from "react";
import { XSOLLA_CONFIG } from "../config/xsolla";
import SimpleLogin from "./SimpleLogin";
import UserIDLogin from "./UserIDLogin";

declare global {
  interface Window {
    XL: {
      init: (options: { 
        projectId: string; 
        callbackUrl: string;
        preferredLocale?: string;
        clientId?: string;
        responseType?: string;
        state?: string;
        redirectUri?: string;
        scope?: string;
      }) => void;
      loginPopup: (options: {
        callback: (data: { token: string; user: { username: string; email: string } }) => void;
        errorCallback: (error: any) => void;
      }) => void;
    };
  }
}

interface UserData {
  token: string;
  username: string;
  email: string;
  authType?: 'xsolla' | 'fallback' | 'userid';
}

interface XsollaLoginProps {
  onLogin: (userData: UserData) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  userData?: UserData;
}

export default function XsollaLogin({ onLogin, onLogout, isAuthenticated, userData }: XsollaLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [showUserID, setShowUserID] = useState(false);
  const [xsollaFailed, setXsollaFailed] = useState(false);

  useEffect(() => {
    // Check for existing session on component mount
    const existingToken = localStorage.getItem('xsolla_token');
    const existingUserData = localStorage.getItem('xsolla_user_data');
    
    if (existingToken && existingUserData) {
      try {
        const userData = JSON.parse(existingUserData);
        onLogin(userData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Session data parsing failed:', error);
        }
        setError("Данные сессии повреждены. Войдите снова.");
        localStorage.removeItem('xsolla_token');
        localStorage.removeItem('xsolla_user_data');
      }
    }

    // Check if we're in demo mode (no Xsolla Project ID configured)
    if (XSOLLA_CONFIG.DEMO_MODE) {
      setXsollaFailed(true);
      // Don't set error, just show both options
      return;
    }

    // Dynamically load the Xsolla Login Widget script
    const script = document.createElement("script");
    script.src = "https://cdn.xsolla.net/login-widget/sdk/1.0.0/xl.min.js";
    script.async = true;
    script.onload = () => {
      if (window.XL) {
        try {
          window.XL.init({
            projectId: XSOLLA_CONFIG.PROJECT_ID,
            callbackUrl: XSOLLA_CONFIG.CALLBACK_URL,
            preferredLocale: XSOLLA_CONFIG.PREFERRED_LOCALE,
            clientId: XSOLLA_CONFIG.CLIENT_ID,
            responseType: XSOLLA_CONFIG.RESPONSE_TYPE,
            state: XSOLLA_CONFIG.STATE,
            redirectUri: XSOLLA_CONFIG.REDIRECT_URI,
            scope: XSOLLA_CONFIG.SCOPE
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Xsolla initialization failed:', error);
          }
          setXsollaFailed(true);
          setError("Xsolla инициализация не удалась. Используйте простой вход.");
        }
      }
    };
    script.onerror = () => {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn("Xsolla script loading failed. Retrying...", {
          attempt: retryCount + 1,
          projectId: XSOLLA_CONFIG.PROJECT_ID,
          url: script.src
        });
      }
      
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setError(`Загрузка Xsolla виджета... (попытка ${retryCount + 1}/3)`);
        // Retry after a short delay
        setTimeout(() => {
          const retryScript = document.createElement("script");
          retryScript.src = "https://cdn.xsolla.net/login-widget/sdk/1.0.0/xl.min.js";
          retryScript.async = true;
          retryScript.onload = () => {
            if (window.XL) {
              try {
                window.XL.init({
                  projectId: XSOLLA_CONFIG.PROJECT_ID,
                  callbackUrl: XSOLLA_CONFIG.CALLBACK_URL,
                  preferredLocale: XSOLLA_CONFIG.PREFERRED_LOCALE,
                  clientId: XSOLLA_CONFIG.CLIENT_ID,
                  responseType: XSOLLA_CONFIG.RESPONSE_TYPE,
                  state: XSOLLA_CONFIG.STATE,
                  redirectUri: XSOLLA_CONFIG.REDIRECT_URI,
                  scope: XSOLLA_CONFIG.SCOPE
                });
                setError(null);
              } catch (error) {
                setXsollaFailed(true);
                setError("Xsolla инициализация не удалась. Используйте простой вход.");
              }
            }
          };
          retryScript.onerror = () => {
            setError("Не удалось загрузить Xsolla виджет. Проверьте подключение к интернету.");
          };
          document.body.appendChild(retryScript);
        }, 1000);
      } else {
        setError("Не удалось загрузить Xsolla виджет. Проверьте подключение к интернету.");
        setXsollaFailed(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onLogin]);

  const handleLogin = () => {
    if (!window.XL) {
      setError("Xsolla виджет не инициализирован. Обновите страницу и попробуйте снова.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      window.XL.loginPopup({
        callback: (data: { token: string; user: { username: string; email: string } }) => {
          try {
            const userData: UserData = {
              token: data.token,
              username: data.user.username,
              email: data.user.email,
              authType: 'xsolla'
            };
            
            // Store in localStorage for session persistence
            localStorage.setItem('xsolla_token', data.token);
            localStorage.setItem('xsolla_user_data', JSON.stringify(userData));
            
            onLogin(userData);
            setIsLoading(false);
          } catch (storageError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn("Session storage failed:", storageError);
            }
            setError("Вход успешен, но не удалось сохранить сессию. Попробуйте снова.");
            setIsLoading(false);
          }
        },
        errorCallback: (error: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Xsolla Login Error:", error);
          }
          setError("Вход не удался. Проверьте учетные данные и попробуйте снова.");
          setIsLoading(false);
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Login popup initialization failed:", error);
      }
      setError("Не удалось открыть окно входа. Попробуйте снова.");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('xsolla_token');
    localStorage.removeItem('xsolla_user_data');
    onLogout();
  };

  if (isAuthenticated && userData) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-green-400 text-lg font-bold">
            Logged in as {userData.username}
          </p>
          <p className="text-gray-400 text-sm">{userData.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setXsollaFailed(false);
    // Force reload the page to retry script loading
    window.location.reload();
  };

  const handleFallbackLogin = () => {
    setShowFallback(true);
    setError(null);
  };

  const handleUserIDLogin = () => {
    setShowUserID(true);
    setError(null);
  };

  const handleBackToXsolla = () => {
    setShowFallback(false);
    setShowUserID(false);
    setError(null);
  };

  const handleSimpleLogin = (userData: UserData) => {
    // Store fallback user data
    localStorage.setItem('xsolla_token', userData.token);
    localStorage.setItem('xsolla_user_data', JSON.stringify(userData));
    onLogin(userData);
  };

  const handleUserIDAuth = (userData: UserData) => {
    // Store User ID user data
    localStorage.setItem('xsolla_token', userData.token);
    localStorage.setItem('xsolla_user_data', JSON.stringify(userData));
    onLogin(userData);
  };

  // Show fallback login form
  if (showFallback) {
    return <SimpleLogin onLogin={handleSimpleLogin} onBack={handleBackToXsolla} />;
  }

  // Show User ID login form
  if (showUserID) {
    return <UserIDLogin onLogin={handleUserIDAuth} onBack={handleBackToXsolla} />;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="text-red-400 text-sm text-center max-w-md">
          {error}
          {error.includes("Unable to load") && (
            <div className="mt-3 space-y-2">
              <button
                onClick={handleRetry}
                className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                Попробовать снова
              </button>
              <button
                onClick={handleFallbackLogin}
                className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
              >
                Простой вход
              </button>
            </div>
          )}
        </div>
      )}
      
      {xsollaFailed && !error && (
        <div className="text-center max-w-md">
          {XSOLLA_CONFIG.DEMO_MODE && (
            <p className="text-gray-400 text-sm mb-4">
              Xsolla не настроен. Выберите способ входа:
            </p>
          )}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Попробовать Xsolla снова
            </button>
            <button
              onClick={handleFallbackLogin}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Простой вход
            </button>
          </div>
        </div>
      )}

      {!xsollaFailed && !error && (
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Вход через Xsolla..." : "Войти через Xsolla"}
          </button>
          <button
            onClick={handleUserIDLogin}
            className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Вход по User ID
          </button>
          <button
            onClick={handleFallbackLogin}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Простой вход
          </button>
        </div>
      )}
    </div>
  );
}