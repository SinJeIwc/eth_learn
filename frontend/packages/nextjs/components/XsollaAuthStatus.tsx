import React from 'react';
import useXsollaAuth from '../hooks/useXsollaAuth';

export default function XsollaAuthStatus() {
  const { user, loading, login, logout } = useXsollaAuth();

  if (loading) return <div>Checking auth...</div>;

  if (!user)
    return (
      <div>
        <button onClick={login} className="btn btn-sm btn-ghost">
          Sign in
        </button>
      </div>
    );

  return (
    <div className="flex items-center gap-2">
      {user.picture ? <img src={user.picture} alt="avatar" className="w-8 h-8 rounded-full" /> : null}
      <div className="text-sm">
        <div>{user.username ?? user.email ?? user.id}</div>
      </div>
      <button onClick={logout} className="btn btn-sm btn-ghost">
        Sign out
      </button>
    </div>
  );
}
