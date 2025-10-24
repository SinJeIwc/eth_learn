"use client";

import { useState } from "react";
import { UserData } from "../lib/auth";

interface SimpleLoginProps {
  onLogin: (userData: UserData) => void;
  onBack: () => void;
}

export default function SimpleLogin({ onLogin, onBack }: SimpleLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Имитация проверки учетных данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Простая проверка (в реальном приложении здесь будет API вызов)
      if (username.length < 3) {
        throw new Error("Имя пользователя должно содержать минимум 3 символа");
      }
      
      if (password.length < 4) {
        throw new Error("Пароль должен содержать минимум 4 символа");
      }

      // Создаем пользовательские данные для fallback входа
      const userData: UserData = {
        token: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: username.trim(),
        email: `${username.trim().toLowerCase()}@game.local`,
        authType: 'fallback'
      };

      onLogin(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white font-pixelify-sans mb-2">
          Простой вход
        </h2>
        <p className="text-gray-400 text-sm">
          Xsolla недоступен. Войдите с помощью простой формы
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Имя пользователя
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите имя пользователя"
            disabled={isLoading}
            minLength={3}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите пароль"
            disabled={isLoading}
            minLength={4}
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            disabled={isLoading}
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </div>
      </form>

      <div className="text-xs text-gray-500 text-center max-w-sm">
        <p>Это простая форма входа для случаев, когда Xsolla недоступен.</p>
        <p>Ваши данные сохраняются локально для сессии.</p>
      </div>
    </div>
  );
}
