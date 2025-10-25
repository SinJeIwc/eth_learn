import { useEffect, useState, useCallback } from 'react';

export interface XsollaUser {
  id: string;
  username?: string;
  email?: string;
  picture?: string;
}

export default function useXsollaAuth() {
  const [user, setUser] = useState<XsollaUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/xsolla/me');
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return null;
      }
      const data = await res.json();
      if (data && data.authenticated && data.user) {
        setUser({ id: data.user.id, username: data.user.username, email: data.user.email, picture: data.user.picture });
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('useXsollaAuth fetch error', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(() => {
    // redirect to server-side login start
    window.location.href = '/api/xsolla/login';
  }, []);

  const logout = useCallback(async () => {
    try {
      // call server-side logout to clear cookies
      window.location.href = '/api/xsolla/logout';
    } catch (e) {
      console.error('logout error', e);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/xsolla/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchMe();
      }
    } catch (e) {
      console.error('refresh error', e);
    }
  }, [fetchMe]);

  return { user, loading, fetchMe, login, logout, refresh };
}
