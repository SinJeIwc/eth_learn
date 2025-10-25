// Simplified authentication system

export type AuthType = 'xsolla' | 'xsolla-id' | 'guest';

export interface UserData {
  username: string;
  email: string;
  authType: AuthType;
  xsollaToken?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  userData?: UserData;
  isLoading: boolean;
}

const STORAGE_KEY = 'game_user_data';

export function getStoredAuthData(): UserData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to retrieve auth data:', error);
    return null;
  }
}

export function storeAuthData(userData: UserData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.warn('Failed to store auth data:', error);
  }
}

export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function validateUsername(username: string): boolean {
  return username.trim().length >= 3;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create user data from username
 */
export function createUserData(username: string, email?: string, authType: AuthType = 'guest'): UserData {
  return {
    username: username.trim(),
    email: email || `${username.toLowerCase()}@game.local`,
    authType,
  };
}
