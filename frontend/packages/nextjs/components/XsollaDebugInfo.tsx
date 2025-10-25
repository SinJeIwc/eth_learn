'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function XsollaDebugInfo() {
  const searchParams = useSearchParams();
  const xsollaError = searchParams?.get('xsolla_error');
  const xsollaErrorDesc = searchParams?.get('xsolla_error_desc');
  const xsollaDetail = searchParams?.get('detail');
  const xsollaLogin = searchParams?.get('xsolla_login');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (xsollaError || xsollaLogin) {
      setDismissed(false);
    }
  }, [xsollaError, xsollaLogin]);

  if (dismissed) return null;

  if (xsollaLogin === 'success') {
    return (
      <div className="alert alert-success shadow-lg mb-4">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Вход через Xsolla успешен! / Xsolla login successful!</span>
        </div>
        <div className="flex-none">
          <button className="btn btn-sm btn-ghost" onClick={() => setDismissed(true)}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (xsollaError) {
    let errorMessage = '';
    switch (xsollaError) {
      case 'config_missing':
        errorMessage = 'Xsolla не настроен. Проверьте .env.local файл (NEXT_PUBLIC_XSOLLA_CLIENT_ID).';
        break;
      case 'missing_code':
        errorMessage = 'Ошибка: не получен code от Xsolla. Проверьте Redirect URI в настройках OAuth.';
        break;
      case 'missing_state':
        errorMessage = 'Ошибка: не получен state параметр. Возможно проблема с конфигурацией.';
        break;
      case 'state_mismatch':
        errorMessage = 'Ошибка CSRF: state не совпадает. Попробуйте снова.';
        break;
      case 'token_exchange':
        errorMessage = `Ошибка обмена токена: ${xsollaDetail || 'неизвестная ошибка'}. Проверьте XSOLLA_CLIENT_SECRET.`;
        break;
      default:
        errorMessage = `Ошибка Xsolla: ${xsollaError}. ${xsollaErrorDesc || ''}`;
    }

    return (
      <div className="alert alert-warning shadow-lg mb-4">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold">⚠️ Xsolla не настроен / Xsolla OAuth Error</h3>
            <div className="text-xs">{errorMessage}</div>
            {xsollaDetail && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">Детали ошибки</summary>
                <pre className="text-xs mt-1 p-2 bg-base-300 rounded">{decodeURIComponent(xsollaDetail)}</pre>
              </details>
            )}
          </div>
        </div>
        <div className="flex-none">
          <button className="btn btn-sm btn-ghost" onClick={() => setDismissed(true)}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}
