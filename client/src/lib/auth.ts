export interface UserData {
  token: string;
  username: string;
  email: string;
  authType?: 'xsolla' | 'fallback' | 'userid';
}

export interface AuthState {
  isAuthenticated: boolean;
  userData?: UserData;
  isLoading: boolean;
}

/**
 * Validates a token by checking its format and expiration
 * Supports both Xsolla JWT tokens and fallback tokens
 */
export function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Check if it's a fallback token
  if (token.startsWith('fallback_')) {
    // Fallback tokens are valid for 24 hours
    const tokenTime = parseInt(token.split('_')[1]);
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return (currentTime - tokenTime) < twentyFourHours;
  }

  // Xsolla JWT token validation
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Decode the payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Token validation error:', error);
    }
    return false;
  }
}

/**
 * Gets the stored authentication data from localStorage
 */
export function getStoredAuthData(): UserData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem('xsolla_token');
    const userDataStr = localStorage.getItem('xsolla_user_data');
    
    if (!token || !userDataStr) {
      return null;
    }

    // Validate the token
    if (!validateToken(token)) {
      // Clear invalid data
      localStorage.removeItem('xsolla_token');
      localStorage.removeItem('xsolla_user_data');
      return null;
    }

    const userData = JSON.parse(userDataStr);
    return userData;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Auth data retrieval failed:', error);
    }
    // Clear corrupted data
    localStorage.removeItem('xsolla_token');
    localStorage.removeItem('xsolla_user_data');
    return null;
  }
}

/**
 * Stores authentication data in localStorage
 */
export function storeAuthData(userData: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('xsolla_token', userData.token);
    localStorage.setItem('xsolla_user_data', JSON.stringify(userData));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Auth data storage failed:', error);
    }
  }
}

/**
 * Clears stored authentication data
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('xsolla_token');
  localStorage.removeItem('xsolla_user_data');
}

/**
 * Creates authenticated headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('xsolla_token') : null;
  
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Determines the authentication type based on token
 */
export function getAuthType(token: string): 'xsolla' | 'fallback' {
  return token.startsWith('fallback_') ? 'fallback' : 'xsolla';
}

/**
 * Validates token with Xsolla API (placeholder for real implementation)
 * In a real application, you would make an API call to Xsolla to validate the token
 */
export async function validateTokenWithXsolla(token: string): Promise<boolean> {
  // Skip API validation for fallback tokens
  if (token.startsWith('fallback_')) {
    return validateToken(token);
  }

  try {
    // This is a placeholder - in a real implementation, you would:
    // 1. Make a request to Xsolla's token validation endpoint
    // 2. Check the response for token validity
    // 3. Handle errors appropriately
    
    const response = await fetch('/api/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.valid;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Token validation with Xsolla failed:', error);
    }
    return false;
  }
}
