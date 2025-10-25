// Xsolla Configuration
// Based on official Xsolla Login SDK documentation
export const XSOLLA_CONFIG = {
  // Login Project ID from Publisher Account (Players > Login > Dashboard)
  PROJECT_ID: process.env.NEXT_PUBLIC_XSOLLA_PROJECT_ID || "YOUR_XSOLLA_PROJECT_ID",
  
  // Login ID (UUID from Publisher Account URL path)
  LOGIN_ID: process.env.NEXT_PUBLIC_XSOLLA_LOGIN_ID || "YOUR_LOGIN_ID",
  
  // OAuth 2.0 Client ID from Players > Login > Security > OAuth 2.0
  CLIENT_ID: process.env.NEXT_PUBLIC_XSOLLA_CLIENT_ID || "YOUR_CLIENT_ID",
  
  // OAuth 2.0 Client Secret (ВАЖНО: используется только на сервере!)
  CLIENT_SECRET: process.env.XSOLLA_CLIENT_SECRET || "",
  
  // Redirect URI after successful authentication
  REDIRECT_URI: typeof window !== 'undefined' ? `${window.location.origin}/xsolla-callback.html` : '',
  
  // Callback URL for the widget
  CALLBACK_URL: typeof window !== 'undefined' ? `${window.location.origin}/xsolla-callback.html` : '',
  
  // Preferred locale for the widget
  PREFERRED_LOCALE: 'ru_RU',
  
  // OAuth 2.0 response type (use 'code' for OAuth 2.0 flow)
  RESPONSE_TYPE: 'code',
  
  // Custom state for OAuth (используется для защиты от CSRF)
  STATE: 'game_auth_state',
  
  // OAuth scope - 'offline' для refresh token, 'email' для получения email
  SCOPE: 'offline email',
  
  // Demo mode detection
  DEMO_MODE: process.env.NEXT_PUBLIC_XSOLLA_PROJECT_ID === "YOUR_XSOLLA_PROJECT_ID" || !process.env.NEXT_PUBLIC_XSOLLA_PROJECT_ID,
  
  // Login Widget settings
  LOGIN_TYPES: {
    CLASSIC: true,        // Email/Password, Username/Password
    PASSWORDLESS: false,   // Magic Link, SMS, Email Code
    SOCIAL: false,        // Google, Facebook, Steam, Discord
  },
  
  // User data to collect
  USER_DATA: {
    USERNAME: true,
    EMAIL: true,
    AVATAR: true,
    COUNTRY: false,
    LANGUAGE: false,
  }
};

// Instructions for setup:
// 1. Go to Xsolla Publisher Account: https://publisher.xsolla.com/
// 2. Create Login project: Players > Login > Dashboard
// 3. Get Project ID from Login project settings
// 4. Get Client ID from: Players > Login > Security > OAuth 2.0
// 5. Add localhost URLs to Callback URLs and Allowed origins (CORS)
// 6. Create .env.local file in the client directory:
//    NEXT_PUBLIC_XSOLLA_PROJECT_ID=your_project_id
//    NEXT_PUBLIC_XSOLLA_CLIENT_ID=your_client_id
//
// For demo/testing without Xsolla:
// - The system will automatically show fallback login
// - No Xsolla setup required for testing
