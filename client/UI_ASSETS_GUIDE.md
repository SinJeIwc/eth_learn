# Работа с UI ассетами в Phaser

## Как использовать отдельные элементы из большого изображения

### 1. Кропинг изображений

Если у вас есть большое изображение с несколькими UI элементами (например, `Buttons.png`), вы можете извлечь отдельные кнопки несколькими способами:

#### Способ 1: Использование Phaser.GameObjects.Image с crop

```javascript
// Загружаем полное изображение кнопок
this.load.image("buttons", "/UI/PNG/Buttons.png");

// В create методе
const buttonsTexture = this.textures.get("buttons");
const attackButton = this.add.image(100, 100, "buttons");

// Кропим изображение для получения только кнопки атаки
// Параметры: x, y, width, height (координаты и размеры нужной области)
attackButton.setCrop(0, 0, 64, 32); // Пример координат
```

#### Способ 2: Создание атласа текстур

```javascript
// В preload методе создаем атлас из большого изображения
this.load.image("buttons-full", "/UI/PNG/Buttons.png");

// В create методе добавляем отдельные фреймы
this.textures.addSpriteSheetFromAtlas("ui-buttons", {
  atlas: "buttons-full",
  frame: "__BASE",
  frameWidth: 64,
  frameHeight: 32,
});

// Теперь можем использовать отдельные кнопки
const attackButton = this.add.image(100, 100, "ui-buttons", 0);
```

#### Способ 3: Определение координат вручную

```javascript
// Загружаем изображение
this.load.image('buttons', '/UI/PNG/Buttons.png');

// Создаем функцию для извлечения конкретной кнопки
createButton(x, y, buttonType) {
  const button = this.add.image(x, y, 'buttons');

  // Координаты для разных типов кнопок (нужно определить визуально)
  const buttonCoords = {
    attack: { x: 0, y: 0, width: 64, height: 32 },
    defend: { x: 64, y: 0, width: 64, height: 32 },
    magic: { x: 128, y: 0, width: 64, height: 32 }
  };

  const coords = buttonCoords[buttonType];
  button.setCrop(coords.x, coords.y, coords.width, coords.height);

  return button;
}

// Использование
const attackBtn = this.createButton(100, 500, 'attack');
```

### 2. Доступные UI элементы

- `Action_panel.png` - панель действий
- `Buttons.png` - различные кнопки
- `Circle_menu.png` - круговое меню
- `Craft.png` - интерфейс крафта
- `Equipment.png` - панель экипировки
- `Icons.png` - различные иконки
- `Inventory.png` - интерфейс инвентаря
- `character_panel.png` - панель персонажа

### 3. Пример создания UI в игре

```javascript
class GameScene extends Phaser.Scene {
  preload() {
    this.load.image("action-panel", "/UI/PNG/Action_panel.png");
    this.load.image("buttons", "/UI/PNG/Buttons.png");
    this.load.image("icons", "/UI/PNG/Icons.png");
  }

  create() {
    // Создаем панель действий
    const actionPanel = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      "action-panel"
    );
    actionPanel.setScale(0.8);

    // Создаем кнопку атаки (вырезаем из большого изображения)
    const attackButton = this.add.image(200, 550, "buttons");
    attackButton.setCrop(0, 0, 64, 32); // Координаты кнопки атаки
    attackButton.setInteractive();
    attackButton.on("pointerdown", () => {
      console.log("Attack button clicked!");
    });

    // Создаем иконку здоровья
    const healthIcon = this.add.image(50, 50, "icons");
    healthIcon.setCrop(0, 0, 32, 32); // Координаты иконки здоровья
  }
}
```

### 4. Интерактивные кнопки

```javascript
createInteractiveButton(x, y, texture, cropArea, callback) {
  const button = this.add.image(x, y, texture);

  if (cropArea) {
    button.setCrop(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
  }

  button.setInteractive();
  button.on('pointerdown', callback);

  // Добавляем hover эффекты
  button.on('pointerover', () => {
    button.setTint(0xcccccc);
  });

  button.on('pointerout', () => {
    button.clearTint();
  });

  return button;
}
```

Этот подход позволяет эффективно использовать большие изображения UI, вырезая из них только нужные элементы.
