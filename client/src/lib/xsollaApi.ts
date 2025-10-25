// Xsolla API integration for game authentication and user management

interface XsollaUserInfo {
  id: string;
  username: string;
  email: string;
  picture?: string;
  groups?: Array<{ id: number; name: string }>;
}

interface XsollaTokenPayload {
  sub: string; // User ID
  username: string;
  email: string;
  exp: number;
  iat: number;
  xsolla_login_access_key: string;
  xsolla_login_project_id: string;
  groups?: Array<{ id: number; name: string; is_default: boolean }>;
}

/**
 * Decode JWT token without verification (client-side only)
 * For production, verify token on server!
 */
export function decodeXsollaToken(token: string): XsollaTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode Xsolla token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeXsollaToken(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get user info from token
 */
export function getUserInfoFromToken(token: string): XsollaUserInfo | null {
  const payload = decodeXsollaToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    username: payload.username,
    email: payload.email,
    groups: payload.groups,
  };
}

/**
 * Verify token with Xsolla API (server-side recommended)
 * This makes a request to Xsolla to validate the token
 */
export async function verifyXsollaToken(token: string, loginProjectId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://login.xsolla.com/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Token verification failed:', response.status);
      return false;
    }

    const userData = await response.json();
    console.log('User verified:', userData);
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Get user attributes (custom game data)
 */
export async function getUserAttributes(token: string, loginProjectId: string, publisherId: string) {
  try {
    const response = await fetch(
      `https://login.xsolla.com/api/attributes/users/me/get_read_only`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-SERVER-AUTHORIZATION': loginProjectId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get attributes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get user attributes:', error);
    return null;
  }
}

/**
 * Update user attributes (save game progress, inventory, etc)
 */
export async function updateUserAttributes(
  token: string,
  loginProjectId: string,
  attributes: Record<string, any>
) {
  try {
    const response = await fetch(
      `https://login.xsolla.com/api/attributes/users/me/update`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-SERVER-AUTHORIZATION': loginProjectId,
        },
        body: JSON.stringify({ attributes }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update attributes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update user attributes:', error);
    return null;
  }
}

/**
 * Save game progress to Xsolla user storage
 */
export async function saveGameProgress(
  token: string,
  loginProjectId: string,
  gameData: {
    level?: number;
    coins?: number;
    inventory?: any[];
    farmProgress?: any;
  }
) {
  return updateUserAttributes(token, loginProjectId, {
    game_level: gameData.level,
    game_coins: gameData.coins,
    game_inventory: JSON.stringify(gameData.inventory),
    game_farm_progress: JSON.stringify(gameData.farmProgress),
    last_save: new Date().toISOString(),
  });
}

/**
 * Load game progress from Xsolla user storage
 */
export async function loadGameProgress(token: string, loginProjectId: string, publisherId: string) {
  const attributes = await getUserAttributes(token, loginProjectId, publisherId);
  
  if (!attributes) return null;

  try {
    return {
      level: parseInt(attributes.game_level) || 1,
      coins: parseInt(attributes.game_coins) || 0,
      inventory: attributes.game_inventory ? JSON.parse(attributes.game_inventory) : [],
      farmProgress: attributes.game_farm_progress ? JSON.parse(attributes.game_farm_progress) : null,
      lastSave: attributes.last_save,
    };
  } catch (error) {
    console.error('Failed to parse game progress:', error);
    return null;
  }
}

export type { XsollaUserInfo, XsollaTokenPayload };
