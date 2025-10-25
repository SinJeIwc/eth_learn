import React from 'react';

export default function XsollaLoginButton({ children }: { children?: React.ReactNode }) {
  return (
    <button
      onClick={() => (window.location.href = '/api/xsolla/login')}
      className="btn btn-primary"
      aria-label="Login with Xsolla"
    >
      {children ?? 'Login with Xsolla'}
    </button>
  );
}
