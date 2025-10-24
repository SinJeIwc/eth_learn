"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const FarmGame = dynamic(() => import("../components/FarmGame"), {
  ssr: false,
});

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStartGame = () => {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative">
      {isTransitioning && (
        <div className="fixed inset-0 bg-black z-50 animate-fadeIn"></div>
      )}

      <div className="flex flex-col items-center justify-center text-center space-y-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl font-pixelify-sans">
          I was reincarnated in another world and now I study farm economics.
        </h1>

        <button
          onClick={handleStartGame}
          className="px-16 py-6 text-3xl font-bold text-white bg-transparent border-2 border-white hover:bg-white hover:text-black transition-all duration-300 font-pixelify-sans"
        >
          START
        </button>
      </div>
    </main>
  );
}
