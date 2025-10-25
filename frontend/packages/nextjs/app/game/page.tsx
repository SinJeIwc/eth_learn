"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AuthModal from "~~/components/AuthModal";
import { useAuth } from "~~/hooks/useAuth";

const FarmGame = dynamic(() => import("~~/components/FarmGame"), {
  ssr: false,
});

export default function GamePage() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAuthenticated, userData, login, logout, isLoading } = useAuth();

  const handleStartGame = () => {
    if (!isAuthenticated) {
      return;
    }

    setIsTransitioning(true);
    setTimeout(() => {
      setIsGameStarted(true);
    }, 500);
  };

  const handleExitGame = () => {
    setIsGameStarted(false);
    setIsTransitioning(false);
  };

  if (isGameStarted) {
    return <FarmGame onExit={handleExitGame} />;
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative">
      {isTransitioning && <div className="fixed inset-0 bg-black z-50 animate-fadeIn"></div>}

      <div className="flex flex-col items-center justify-center text-center space-y-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl font-pixelify-sans">
          Я переродилась в другом мире и теперь мне нужно выйти из леса и добраться до города
        </h1>

        <AuthModal onLogin={login} onLogout={logout} isAuthenticated={isAuthenticated} userData={userData} />

        {isAuthenticated && (
          <button
            onClick={handleStartGame}
            className="px-16 py-6 text-3xl font-bold text-white bg-transparent border-2 border-white hover:bg-white hover:text-black transition-all duration-300 font-pixelify-sans"
          >
            START
          </button>
        )}
      </div>
    </main>
  );
}
