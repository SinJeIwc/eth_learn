"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

/**
 * Main game scene
 */
class GameScene extends Phaser.Scene {
  private onGameReady?: () => void;

  constructor(config: { onGameReady?: () => void }) {
    super({ key: "GameScene" });
    this.onGameReady = config.onGameReady;
  }

  preload() {
    // Load background from public folder
    this.load.image("background", "/background.png");
  }

  create() {
    // Set background
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Notify that game is ready
    this.onGameReady?.();
  }

  update() {
    // Game loop - can be used for animations or effects
  }
}

interface PhaserGameProps {
  onGameReady?: () => void;
}

/**
 * PhaserGame - Wrapper component for Phaser game instance
 */
export default function PhaserGame({ onGameReady }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    // Phaser configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      backgroundColor: "#000000",
      scene: new GameScene({ onGameReady }),
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    // Create game instance
    phaserGameRef.current = new Phaser.Game(config);

    // Handle window resize
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [onGameReady]);

  return <div ref={gameRef} className="w-full h-screen" />;
}
