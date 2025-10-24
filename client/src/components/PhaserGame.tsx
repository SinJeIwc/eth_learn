"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

// Основная сцена игры
class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private dialogBox!: Phaser.GameObjects.Graphics;
  private dialogText!: Phaser.GameObjects.Text;
  private isDialogVisible = false;
  private currentDialog = 0;
  private dialogs = [
    "Как я здесь оказался?",
    "Это место выглядит знакомо...",
    "Мне нужно найти выход из этого леса.",
    "Управление: Стрелки/WASD для движения, Пробел/W для прыжка, S для атаки"
  ];
  private onGameReady?: () => void;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor(config: { onGameReady?: () => void }) {
    super({ key: "GameScene" });
    this.onGameReady = config.onGameReady;
  }

  preload() {
    // Загружаем фон
    this.load.image(
      "background",
      "/Location/PNG/Battleground1/Bright/Battleground1.png"
    );
    this.load.image("sky", "/Location/PNG/Battleground1/Bright/sky.png");
    this.load.image(
      "hills",
      "/Location/PNG/Battleground1/Bright/hills&trees.png"
    );

    // Загружаем персонажа как спрайтшиты
    // Предположим, что каждый спрайтшит содержит несколько кадров в горизонтальной линии
    this.load.spritesheet("player-idle", "/Person/Samurai/Idle.png", {
      frameWidth: 128, // Ширина одного кадра (нужно подобрать)
      frameHeight: 128, // Высота одного кадра (нужно подобрать)
    });
    
    this.load.spritesheet("player-walk", "/Person/Samurai/Walk.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    this.load.spritesheet("player-run", "/Person/Samurai/Run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    this.load.spritesheet("player-attack1", "/Person/Samurai/Attack_1.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    this.load.spritesheet("player-jump", "/Person/Samurai/Jump.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    // Загружаем UI элементы
    this.load.image("dialog-bg", "/UI/PNG/Text1.png");
    this.load.image("buttons", "/UI/PNG/Buttons.png");
  }

  create() {
    // Создаем фон
    const sky = this.add.image(0, 0, "sky").setOrigin(0, 0);
    const hills = this.add.image(0, 0, "hills").setOrigin(0, 0);
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);

    // Масштабируем фон под размер экрана
    const scaleX = this.cameras.main.width / background.width;
    const scaleY = this.cameras.main.height / background.height;
    const scale = Math.max(scaleX, scaleY);

    sky.setScale(scale);
    hills.setScale(scale);
    background.setScale(scale);

    // Создаем персонажа с физикой
    this.player = this.physics.add.sprite(400, 500, "player-idle");
    this.player.setScale(2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Создаем анимации для персонажа
    this.createPlayerAnimations();

    // Запускаем анимацию idle
    this.player.play("idle");

    // Создаем диалоговое окно
    this.createDialogBox();

    // Добавляем управление клавишами для демонстрации анимаций
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D,SPACE') as { [key: string]: Phaser.Input.Keyboard.Key };
    
    // Сохраняем ссылки на клавиши для использования в update
    this.cursors = cursors;
    this.wasd = wasd;

    // Показываем первый диалог через небольшую задержку
    this.time.delayedCall(1000, () => {
      this.showDialog();
    });

    // Обработчик клика для продолжения диалога
    this.input.on("pointerdown", () => {
      if (this.isDialogVisible) {
        this.nextDialog();
      }
    });

    this.onGameReady?.();
  }

  createPlayerAnimations() {
    // Создаем анимацию idle
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player-idle", { start: 0, end: -1 }),
      frameRate: 8,
      repeat: -1,
    });

    // Создаем анимацию ходьбы
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player-walk", { start: 0, end: -1 }),
      frameRate: 10,
      repeat: -1,
    });

    // Создаем анимацию бега
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player-run", { start: 0, end: -1 }),
      frameRate: 12,
      repeat: -1,
    });

    // Создаем анимацию атаки
    this.anims.create({
      key: "attack1",
      frames: this.anims.generateFrameNumbers("player-attack1", { start: 0, end: -1 }),
      frameRate: 15,
      repeat: 0, // Проигрывается один раз
    });

    // Создаем анимацию прыжка
    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player-jump", { start: 0, end: -1 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  createDialogBox() {
    // Создаем фон для диалога
    this.dialogBox = this.add.graphics();
    this.dialogBox.fillStyle(0x000000, 0.8);
    this.dialogBox.fillRoundedRect(
      50,
      this.cameras.main.height - 150,
      this.cameras.main.width - 100,
      100,
      10
    );
    this.dialogBox.lineStyle(3, 0xffffff, 1);
    this.dialogBox.strokeRoundedRect(
      50,
      this.cameras.main.height - 150,
      this.cameras.main.width - 100,
      100,
      10
    );
    this.dialogBox.setVisible(false);

    // Создаем текст диалога
    this.dialogText = this.add.text(80, this.cameras.main.height - 130, "", {
      fontFamily: "Pixelify Sans",
      fontSize: "24px",
      color: "#ffffff",
      wordWrap: { width: this.cameras.main.width - 160 },
    });
    this.dialogText.setVisible(false);
  }

  showDialog() {
    this.isDialogVisible = true;
    this.dialogBox.setVisible(true);
    this.dialogText.setVisible(true);
    this.dialogText.setText(this.dialogs[this.currentDialog]);
  }

  nextDialog() {
    this.currentDialog++;
    if (this.currentDialog >= this.dialogs.length) {
      this.hideDialog();
    } else {
      this.dialogText.setText(this.dialogs[this.currentDialog]);
    }
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    this.currentDialog = 0;
  }

  update() {
    // Управление персонажем (только если диалог не активен)
    if (!this.isDialogVisible && this.cursors && this.wasd) {
      let isMoving = false;
      const speed = 160;

      // Движение влево/вправо
      if (this.cursors.left.isDown || this.wasd.A.isDown) {
        this.player.setVelocityX(-speed);
        this.player.setFlipX(true); // Поворачиваем персонажа влево
        isMoving = true;
      } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
        this.player.setVelocityX(speed);
        this.player.setFlipX(false); // Поворачиваем персонажа вправо
        isMoving = true;
      } else {
        this.player.setVelocityX(0);
      }

      // Прыжок
      if ((this.cursors.up.isDown || this.wasd.W.isDown || this.wasd.SPACE.isDown) && (this.player.body as Phaser.Physics.Arcade.Body)?.touching.down) {
        this.player.setVelocityY(-500);
        this.player.play('jump', true);
      }

      // Атака
      if (Phaser.Input.Keyboard.JustDown(this.wasd.S)) {
        this.player.play('attack1', true);
        // Возвращаемся к idle после атаки
        this.player.once('animationcomplete', () => {
          if (!isMoving) {
            this.player.play('idle', true);
          }
        });
      }

      // Выбираем анимацию в зависимости от движения
      if (isMoving && (this.player.body as Phaser.Physics.Arcade.Body)?.touching.down) {
        if (this.cursors.shift?.isDown) {
          this.player.play('run', true);
        } else {
          this.player.play('walk', true);
        }
      } else if ((this.player.body as Phaser.Physics.Arcade.Body)?.touching.down && !this.player.anims.isPlaying) {
        this.player.play('idle', true);
      }
    }
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
