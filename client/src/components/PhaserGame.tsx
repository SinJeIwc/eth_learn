"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

// Основная сцена игры

class GameScene extends Phaser.Scene {
  private plant!: Phaser.GameObjects.Sprite;
  private growButton!: Phaser.GameObjects.DOMElement;
  private harvestButton!: Phaser.GameObjects.DOMElement;
  private plantStage: number = 0; // 0 - seed, 1 - grown, 2 - harvested
  private onGameReady?: () => void;

  // Добавляем дополнительные места для посадки растений
  private plantSpots: Phaser.GameObjects.Container[] = [];

  constructor(config: { onGameReady?: () => void }) {
    super({ key: "GameScene" });
    this.onGameReady = config.onGameReady;
  }

  preload() {
    // Загружаем фон из public (используем существующие публичные ассеты)
    this.load.image("background", "/location/PNG/summer/summer1.png");
    // Мы не используем внешние спрайты растений — будем рисовать растение графикой
  }

  create() {
    // Фон
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Растение (будем рисовать как графику в контейнере)
    this.plantStage = 0;
    const plantContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY + 100);
    const plantGraphics = this.add.graphics();
    plantGraphics.fillStyle(0x2f855a, 1);
    // начальный «семечко»
    plantGraphics.fillEllipse(0, 20, 8, 8);
    plantContainer.add(plantGraphics);
    // Сохраняем контейнер в this.plant (как any)
    // @ts-ignore
    this.plant = plantContainer;
    plantContainer.setVisible(false);

    // Создаем несколько мест для посадки
    const spotPositions = [
      { x: this.cameras.main.centerX - 150, y: this.cameras.main.centerY + 100 },
      { x: this.cameras.main.centerX, y: this.cameras.main.centerY + 100 },
      { x: this.cameras.main.centerX + 150, y: this.cameras.main.centerY + 100 },
    ];

    spotPositions.forEach((pos, index) => {
      const spot = this.add.container(pos.x, pos.y);
      const graphics = this.add.graphics();
      graphics.fillStyle(0x2f855a, 1);
      graphics.fillEllipse(0, 20, 8, 8);
      spot.add(graphics);
      spot.setVisible(false);
      this.plantSpots.push(spot);
    });

    // Кнопка "Вырастить"
    this.growButton = this.add.dom(this.cameras.main.centerX, this.cameras.main.centerY + 200, 'button', 'font-size: 1.25rem; padding: 0.5rem 1rem; border-radius: 8px; background: #4ade80; color: #222; border: none; cursor: pointer;', 'Вырастить');
    this.growButton.addListener('click');
    this.growButton.on('click', () => {
      this.startGrowing();
    });

    // Кнопка "Собрать продукт" (скрыта до роста)
    this.harvestButton = this.add.dom(this.cameras.main.centerX, this.cameras.main.centerY + 260, 'button', 'font-size: 1.25rem; padding: 0.5rem 1rem; border-radius: 8px; background: #facc15; color: #222; border: none; cursor: pointer; display: none;', 'Собрать продукт');
    this.harvestButton.addListener('click');
    this.harvestButton.on('click', () => {
      this.harvestPlant();
    });

    // Кнопка "Посадить семечко"
    const plantButton = this.add.dom(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'button',
      'font-size: 1.25rem; padding: 0.5rem 1rem; border-radius: 8px; background: #4ade80; color: #222; border: none; cursor: pointer;',
      'Посадить семечко'
    );
    plantButton.addListener('click');
    plantButton.on('click', () => {
      this.plantSpots.forEach((spot) => spot.setVisible(true));
      (plantButton.node as HTMLElement).style.display = 'none';
    });

    this.onGameReady?.();
  }

  startGrowing() {
    (this.growButton.node as HTMLElement).style.display = 'none';
    // @ts-ignore plant is container
    const container = this.plant as unknown as Phaser.GameObjects.Container;
    container.setVisible(true);
    // Получаем графику внутри контейнера
    const graphics = container.list[0] as Phaser.GameObjects.Graphics;
    // Сбрасываем масштаб и анимируем рост (scale)
    graphics.scaleX = 1;
    graphics.scaleY = 1;
    this.tweens.add({
      targets: graphics,
      scaleX: 4,
      scaleY: 4,
      duration: 1800,
      ease: 'Power2',
      onComplete: () => {
        this.plantStage = 2;
        (this.harvestButton.node as HTMLElement).style.display = '';
      }
    });
  }

  harvestPlant() {
    (this.harvestButton.node as HTMLElement).style.display = 'none';
    // @ts-ignore plant is container
    const container = this.plant as unknown as Phaser.GameObjects.Container;
    container.setVisible(false);
    // Сброс состояния
    (this.growButton.node as HTMLElement).style.display = '';
    this.plantStage = 0;
  }


  update() {
    // Здесь можно добавить анимацию или эффекты для огорода
  }
}

interface PhaserGameProps {
  onGameReady?: () => void;
}

export default function PhaserGame({ onGameReady }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    // Конфигурация Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      backgroundColor: "#000000",
      scene: new GameScene({ onGameReady }),
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 300 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      dom: {
        createContainer: true,
      },
    };

    // Создаем игру
    phaserGameRef.current = new Phaser.Game(config);

    // Обработчик изменения размера окна
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(
          window.innerWidth,
          window.innerHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);

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
