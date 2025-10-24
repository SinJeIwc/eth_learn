"use client";

import { useState } from "react";
import { UserData } from "../lib/auth";

interface UserIDLoginProps {
  onLogin: (userData: UserData) => void;
  onBack: () => void;
}

export default function UserIDLogin({ onLogin, onBack }: UserIDLoginProps) {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError("Пожалуйста, введите User ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Имитация проверки User ID через webhook
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Простая проверка формата User ID
      if (userId.length < 3) {
        throw new Error("User ID должен содержать минимум 3 символа");
      }

      // Создаем пользовательские данные для User ID входа
      const userData: UserData = {
        token: `userid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: `User_${userId}`,
        email: `user_${userId}@game.local`,
        authType: 'userid'
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
          Вход по User ID
        </h2>
        <p className="text-gray-400 text-sm">
          Введите ваш User ID из игры
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
            User ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите ваш User ID"
            disabled={isLoading}
            minLength={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            User ID можно найти в настройках игры или в профиле игрока
          </p>
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
            disabled={isLoading || !userId.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </div>
      </form>

      <div className="text-xs text-gray-500 text-center max-w-sm">
        <p>Этот способ входа использует ваш User ID из игры.</p>
        <p>User ID должен быть уникальным для каждого игрока.</p>
      </div>
    </div>
  );
}
