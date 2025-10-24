"use client";

import { XSOLLA_CONFIG } from "../config/xsolla";

export default function XsollaStatus() {
  const isConfigured = !XSOLLA_CONFIG.DEMO_MODE;
  
  if (isConfigured) {
    return (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-400 font-medium">Xsolla настроен</span>
        </div>
        <p className="text-green-300 text-sm mt-1">
          Project ID: {XSOLLA_CONFIG.PROJECT_ID}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-yellow-400 font-medium">Xsolla не настроен</span>
      </div>
      <p className="text-yellow-300 text-sm mt-1">
        Используется fallback аутентификация. Для настройки Xsolla следуйте инструкциям в XSOLLA_LOGIN_SETUP.md
      </p>
    </div>
  );
}
