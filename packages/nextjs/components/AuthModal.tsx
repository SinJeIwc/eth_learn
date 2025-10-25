"use client";

import { useEffect, useState } from "react";
import { XSOLLA_CONFIG } from "../config/xsolla";
import { UserData, createUserData } from "../lib/auth";

interface AuthModalProps {
  onLogin: (userData: UserData) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  userData?: UserData;
}

export default function AuthModal({ onLogin, onLogout, isAuthenticated, userData }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"xsolla" | "xsolla-id" | "guest">("xsolla");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [xsollaId, setXsollaId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showXsollaWidget, setShowXsollaWidget] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Listen for OAuth callback
  useEffect(() => {
    // Check if we have OAuth code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const token = urlParams.get("token"); // Xsolla может вернуть token напрямую

    if (token) {
      // Token received directly from Xsolla
      console.log("Xsolla token received:", token);

      try {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token payload:", payload);

        const userData = createUserData(payload.username || payload.email, payload.email, "xsolla");
        userData.xsollaToken = token;

        onLogin(userData);

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Ошибка обработки токена");
      }
    } else if (code && state === XSOLLA_CONFIG.STATE) {
      // Authorization code received (OAuth 2.0 flow)
      console.log("OAuth code received:", code);
      // Here you would exchange code for access token on your backend
      // For now, we'll simulate successful login
      const userData = createUserData(`user_${Date.now()}`, "user@xsolla.com", "xsolla");
      onLogin(userData);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for temporary token from callback page (fallback)
    const tempToken = localStorage.getItem("xsolla_temp_token");
    if (tempToken) {
      console.log("Found temporary token from callback page");
      localStorage.removeItem("xsolla_temp_token");

      try {
        const payload = JSON.parse(atob(tempToken.split(".")[1]));
        const userData = createUserData(payload.username || payload.email, payload.email, "xsolla");
        userData.xsollaToken = tempToken;
        onLogin(userData);
      } catch (err) {
        console.error("Failed to process temp token:", err);
      }
    }
  }, [onLogin]);

  // Listen for messages from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("📨 Message received from:", event.origin);
      console.log("📦 Message data:", event.data);

      // Accept messages from localhost (more permissive for development)
      if (
        !event.origin.includes("localhost") &&
        !event.origin.includes("127.0.0.1") &&
        !event.origin.includes("xsolla.com")
      ) {
        console.log("⚠️ Message rejected from unknown origin:", event.origin);
        return;
      }

      if (event.data.type === "xsolla-login-success" && event.data.token) {
        console.log("✅ Xsolla login success message received!");
        try {
          // Decode JWT to get user info
          const payload = JSON.parse(atob(event.data.token.split(".")[1]));
          console.log("👤 User info from token:", payload);

          const userData = createUserData(payload.username || payload.email, payload.email, "xsolla");
          userData.xsollaToken = event.data.token;

          onLogin(userData);
          setError(null);
          setIsLoading(false);
          console.log("🎉 User logged in successfully!");
        } catch (err) {
          console.error("❌ Failed to process login:", err);
          setError("Ошибка обработки данных пользователя");
          setIsLoading(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    console.log("👂 Listening for postMessage events...");

    return () => {
      window.removeEventListener("message", handleMessage);
      console.log("🔇 Stopped listening for postMessage events");
    };
  }, [onLogin]);

  // Helper function to process Xsolla token
  const processToken = (token: string) => {
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("👤 User info from token:", payload);

      const userData = createUserData(payload.username || payload.email, payload.email, "xsolla");
      userData.xsollaToken = token;

      onLogin(userData);
      setError(null);
      setIsLoading(false);

      // Show success message
      setSuccessMessage(`✅ Добро пожаловать, ${payload.username || payload.email}!`);

      // Hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

      console.log("✅ User logged in successfully!");
    } catch (err) {
      console.error("❌ Failed to process token:", err);
      setError("Ошибка обработки токена");
      setIsLoading(false);
    }
  };

  // Xsolla Auth handler - Using Login Widget
  const handleXsollaAuth = () => {
    if (XSOLLA_CONFIG.DEMO_MODE) {
      setError("Xsolla не настроен. Проверьте PROJECT_ID и CLIENT_ID в .env.local");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Xsolla Login Widget URL with Project ID
      const loginUrl = new URL("https://login-widget.xsolla.com/latest/");
      loginUrl.searchParams.append("projectId", XSOLLA_CONFIG.PROJECT_ID);
      loginUrl.searchParams.append("locale", XSOLLA_CONFIG.PREFERRED_LOCALE);

      // OAuth 2.0 parameters with callback page
      if (XSOLLA_CONFIG.CLIENT_ID) {
        loginUrl.searchParams.append("oauth2_client_id", XSOLLA_CONFIG.CLIENT_ID);
      }
      loginUrl.searchParams.append("response_type", XSOLLA_CONFIG.RESPONSE_TYPE);
      loginUrl.searchParams.append("redirect_uri", XSOLLA_CONFIG.REDIRECT_URI);
      loginUrl.searchParams.append("state", XSOLLA_CONFIG.STATE);
      loginUrl.searchParams.append("scope", XSOLLA_CONFIG.SCOPE);

      console.log("🚀 Opening Xsolla Login Widget");
      console.log("📍 Redirect URI:", XSOLLA_CONFIG.REDIRECT_URI);
      console.log("🔗 Full URL:", loginUrl.toString());

      // Open in popup window
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        loginUrl.toString(),
        "XsollaLogin",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
      );

      if (!popup) {
        setError("Не удалось открыть окно входа. Разрешите всплывающие окна.");
        setIsLoading(false);
        return;
      }

      // Poll popup URL for token (more aggressive approach)
      let pollCount = 0;
      const maxPolls = 600; // 5 minutes

      const pollTimer = setInterval(() => {
        pollCount++;

        try {
          if (!popup || popup.closed) {
            console.log("🚪 Popup closed by user");
            clearInterval(pollTimer);
            setIsLoading(false);

            // Check localStorage for fallback token
            const fallbackToken = localStorage.getItem("xsolla_temp_token");
            if (fallbackToken) {
              console.log("✅ Found fallback token in localStorage");
              localStorage.removeItem("xsolla_temp_token");
              processToken(fallbackToken);
            }
            return;
          }

          // Try to access popup URL
          const popupUrl = popup.location.href;
          console.log(`🔍 Checking popup URL (attempt ${pollCount}):`, popupUrl.substring(0, 50) + "...");

          // Check if token is in URL (both /api/blank and /xsolla-callback.html)
          if (popupUrl.includes("token=")) {
            const url = new URL(popupUrl);
            const token = url.searchParams.get("token");

            if (token) {
              console.log("🎉 Token found in popup URL!");
              processToken(token);

              // Close popup
              try {
                popup.close();
              } catch (e) {
                console.log("Could not close popup:", e);
              }

              clearInterval(pollTimer);
              setIsLoading(false);
            }
          }
        } catch (e) {
          // Cross-origin error - popup is still on xsolla.com domain
          // This is normal and expected
          if (pollCount % 10 === 0) {
            console.log(`⏳ Waiting for user login... (${pollCount / 2}s)`);
          }
        }

        // Timeout after 5 minutes
        if (pollCount >= maxPolls) {
          console.log("⏱️ Timeout reached");
          clearInterval(pollTimer);
          setIsLoading(false);
        }
      }, 500); // Check every 500ms
    } catch (err) {
      console.error("Failed to start Xsolla OAuth:", err);
      setError("Не удалось начать вход через Xsolla");
      setIsLoading(false);
    }
  };

  // Xsolla ID handler
  const handleXsollaIdAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!xsollaId.trim() || xsollaId.length < 3) {
      setError("Xsolla ID должен содержать минимум 3 символа");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Validate Xsolla ID with API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData: UserData = {
        username: `XsollaUser_${xsollaId}`,
        email: `${xsollaId}@xsolla.game`,
        authType: "xsolla-id",
      };

      onLogin(userData);
    } catch (err) {
      setError("Неверный Xsolla ID");
    } finally {
      setIsLoading(false);
    }
  };

  // Guest auth handler
  const handleGuestAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || username.length < 3) {
      setError("Имя должно содержать минимум 3 символа");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const userData = createUserData(username, email || undefined, "guest");
      onLogin(userData);
    } catch (err) {
      setError("Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && userData) {
    return (
      <div className="flex flex-col items-center space-y-4 bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <p className="text-green-400 text-xl font-bold mb-1">{userData.username}</p>
          <p className="text-gray-400 text-sm">{userData.email}</p>
          <p className="text-gray-500 text-xs mt-2">
            {userData.authType === "xsolla" && "🔐 Вход через Xsolla"}
            {userData.authType === "xsolla-id" && "🆔 Вход по Xsolla ID"}
            {userData.authType === "guest" && "👤 Гостевой вход"}
          </p>
        </div>
        <button onClick={onLogout} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg">
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => {
            setActiveTab("xsolla");
            setError(null);
          }}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
            activeTab === "xsolla" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Xsolla Auth
        </button>
        <button
          onClick={() => {
            setActiveTab("xsolla-id");
            setError(null);
          }}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
            activeTab === "xsolla-id" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Xsolla ID
        </button>
        <button
          onClick={() => {
            setActiveTab("guest");
            setError(null);
          }}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
            activeTab === "guest" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Гость
        </button>
      </div>

      {/* Xsolla Auth */}
      {activeTab === "xsolla" && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Официальный вход Xsolla</h3>
            <p className="text-gray-400 text-sm">Используйте ваш аккаунт Xsolla для входа</p>
          </div>

          {!XSOLLA_CONFIG.PROJECT_ID || XSOLLA_CONFIG.DEMO_MODE ? (
            <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 p-4 rounded-lg text-sm">
              <p className="font-bold mb-2">⚠️ Xsolla не настроен</p>
              <p className="text-xs">Для использования Xsolla необходимо:</p>
              <ol className="text-xs list-decimal list-inside mt-2 space-y-1">
                <li>
                  Создать аккаунт на{" "}
                  <a
                    href="https://publisher.xsolla.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    publisher.xsolla.com
                  </a>
                </li>
                <li>Получить PROJECT_ID и CLIENT_ID</li>
                <li>Добавить их в .env.local файл</li>
              </ol>
            </div>
          ) : null}

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</div>}

          {successMessage && (
            <div className="text-green-400 text-sm text-center bg-green-900/20 p-3 rounded-lg border border-green-500 animate-pulse">
              {successMessage}
            </div>
          )}

          <button
            onClick={handleXsollaAuth}
            disabled={isLoading || XSOLLA_CONFIG.DEMO_MODE}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? "⏳ Перенаправление..." : "🔐 Войти через Xsolla OAuth 2.0"}
          </button>

          <p className="text-xs text-gray-500 text-center">Безопасная аутентификация через Xsolla OAuth 2.0</p>
        </div>
      )}

      {/* Xsolla ID */}
      {activeTab === "xsolla-id" && (
        <form onSubmit={handleXsollaIdAuth} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Вход по Xsolla ID</h3>
            <p className="text-gray-400 text-sm">Введите ваш Xsolla User ID</p>
          </div>

          <div>
            <label htmlFor="xsollaId" className="block text-sm font-medium text-gray-300 mb-2">
              Xsolla ID
            </label>
            <input
              id="xsollaId"
              type="text"
              value={xsollaId}
              onChange={e => setXsollaId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Введите Xsolla ID"
              minLength={3}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">ID можно найти в профиле Xsolla</p>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={isLoading || !xsollaId.trim()}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Проверка..." : "🆔 Войти по ID"}
          </button>
        </form>
      )}

      {/* Guest */}
      {activeTab === "guest" && (
        <form onSubmit={handleGuestAuth} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Гостевой вход</h3>
            <p className="text-gray-400 text-sm">Быстрый вход без регистрации</p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Имя игрока
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Введите имя"
              minLength={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email (необязательно)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Вход..." : "👤 Войти как гость"}
          </button>

          <p className="text-xs text-gray-500 text-center">Данные сохранятся в браузере</p>
        </form>
      )}
    </div>
  );
}
