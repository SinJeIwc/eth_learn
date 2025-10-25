# 🌾 Time-Based Farm Game - Новая Архитектура

## 🎯 Концепция

Система с **детерминированной рандомизацией** на основе времени:
- ✅ Персонализированный магазин для каждого игрока
- ✅ События каждый час влияют на всех
- ✅ Цены меняются от событий
- ✅ Ускорение/замедление роста

---

## 🏗️ Архитектура (3 основных контракта)

### 1. **TimeBasedOracle** ⏰
**READ-ONLY контракт** - только чтение, нет записи!

```solidity
// Дневной хеш (обновляется каждые 24 часа в 00:00 UTC)
bytes32 dailyHash = oracle.getDailyHash();
// Результат: 0x1a2b3c... (уникален для каждого дня)

// Часовой хеш (обновляется каждый час)
bytes32 hourlyHash = oracle.getHourlyHash();
// Результат: 0x4d5e6f... (уникален для каждого часа)

// Персонализированный хеш для игрока
bytes32 playerHash = oracle.getPlayerDailyHash(player, dailyHash);
// Результат: уникален для (игрок + день)
```

**Как работает:**
```
День 1: dailyHash = hash(year:2025, month:10, day:26)
День 2: dailyHash = hash(year:2025, month:10, day:27) ← НОВЫЙ ХЕШ!

Игрок A: hash(0xAAAA... + dailyHash) = магазин [🌾5, 🍇0, 🎃3, 🌽2]
Игрок B: hash(0xBBBB... + dailyHash) = магазин [🌾2, 🍇7, 🎃0, 🌽5]
```

---

### 2. **PersonalizedShop** 🏪
**READ-ONLY контракт** - магазин уникален для каждого игрока!

```solidity
struct ShopInventory {
    uint256 dailyEpoch;      // Номер дня
    uint8 wheatQuantity;     // 0-10 штук
    uint8 grapeQuantity;     // 0-10 штук
    uint8 pumpkinQuantity;   // 0-10 штук
    uint8 cornQuantity;      // 0-10 штук
    uint256 wheatPrice;      // Цена с учетом событий
    uint256 grapePrice;
    uint256 pumpkinPrice;
    uint256 cornPrice;
}
```

**Пример использования:**
```javascript
// Игрок смотрит магазин
const priceMultipliers = await hourlyEvents.getPriceMultipliers();
const shop = await personalizedShop.getPlayerShop(playerAddress, priceMultipliers);

console.log(shop);
// {
//   dailyEpoch: 19287,
//   wheatQuantity: 5,      ← У ЭТОГО игрока 5 пшениц
//   grapeQuantity: 0,      ← Винограда нет сегодня
//   pumpkinQuantity: 3,
//   cornQuantity: 7,
//   wheatPrice: 0.00115,   ← Цена увеличена на 15% из-за события!
//   grapePrice: 0.003,
//   pumpkinPrice: 0.005,
//   cornPrice: 0.002
// }
```

**У другого игрока:**
```javascript
const shopB = await personalizedShop.getPlayerShop(playerB, priceMultipliers);
// {
//   wheatQuantity: 2,      ← У другого игрока ДРУГОЙ магазин!
//   grapeQuantity: 8,
//   pumpkinQuantity: 0,
//   cornQuantity: 4,
//   ...
// }
```

---

### 3. **HourlyEvents** 🎲
**READ-ONLY + Caching** - события влияют на ВСЮ игру!

**Типы событий:**

| Событие | Вероятность | Эффект |
|---------|------------|--------|
| **NONE** | 40% | Ничего не происходит |
| **RAIN** 🌧️ | 15% | Рост ускоряется в 2 раза! |
| **LOCUSTS** 🦗 | 10% | Уничтожает 10-50% посевов (50% шанс на игрока) |
| **PRICE_SURGE** 📈 | 15% | Одна культура +15% к цене |
| **DROUGHT** ☀️ | 10% | Рост замедляется в 2 раза |
| **BLESSING** ✨ | 10% | Все цены -10% |

**Пример:**
```solidity
// Получить текущее событие
HourlyEvents.GameEvent memory event = hourlyEvents.getCurrentEvent();

console.log(event);
// {
//   eventType: RAIN,
//   hourlyEpoch: 462696,
//   targetCrop: 0,    // Не используется для RAIN
//   severity: 35,     // Не используется для RAIN
//   timestamp: 1729900800
// }

// Проверить влияет ли саранча на игрока (50/50)
bool affected = hourlyEvents.doesEventAffectPlayer(playerAddress);
// true - саранча атакует!
// false - повезло, саранча мимо

// Получить множители цен
uint256[4] multipliers = hourlyEvents.getPriceMultipliers();
// [1150, 1000, 1000, 1000] ← пшеница +15%

// Получить множитель скорости роста
uint256 growthMultiplier = hourlyEvents.getGrowthMultiplier();
// 2000 = 2x быстрее (RAIN)
// 500 = 2x медленнее (DROUGHT)
// 1000 = нормально
```

---

## 🔥 Как работает система целиком

### Сценарий 1: Игрок смотрит магазин

```javascript
// 1. Получаем текущие события
const event = await hourlyEvents.getCurrentEvent();
const priceMultipliers = await hourlyEvents.getPriceMultipliers();

// 2. Смотрим персональный магазин
const shop = await personalizedShop.getPlayerShop(
  playerAddress,
  priceMultipliers
);

// 3. Отображаем UI
console.log(`Today's shop for you:`);
console.log(`🌾 Wheat: ${shop.wheatQuantity} @ ${shop.wheatPrice} ETH`);
console.log(`🍇 Grape: ${shop.grapeQuantity} @ ${shop.grapePrice} ETH`);
console.log(`🎃 Pumpkin: ${shop.pumpkinQuantity} @ ${shop.pumpkinPrice} ETH`);
console.log(`🌽 Corn: ${shop.cornQuantity} @ ${shop.cornPrice} ETH`);

console.log(`\nCurrent event: ${event.eventType}`);
```

---

### Сценарий 2: Событие "Дождь" 🌧️

```
Час 14:00 → hourlyHash обновляется
    ↓
HourlyEvents генерирует: RAIN event
    ↓
getGrowthMultiplier() возвращает 2000 (2x)
    ↓
Растение растет 30 минут → Теперь растет 15 минут!
    ↓
Все игроки получают буст
```

**Реализация ускорения:**

```solidity
// В PlantNFT контракте
function updatePlantForEvent(uint256 plantTokenId) external {
    Plant memory plant = plants[plantTokenId];
    uint256 growthMultiplier = hourlyEvents.getGrowthMultiplier();
    
    if (growthMultiplier == 2000) {
        // Дождь - ускорение 2x
        // Старое: plantedAt = 1000, growTime = 30 минут
        // Новое: plantedAt = 1000 - 15 минут (как будто прошло 15 минут)
        uint256 elapsedTime = block.timestamp - plant.plantedAt;
        uint256 boostedTime = elapsedTime * 2; // Удваиваем прогресс
        
        plant.plantedAt = block.timestamp - boostedTime;
        plants[plantTokenId] = plant;
    }
}
```

---

### Сценарий 3: Событие "Саранча" 🦗

```
Час 15:00 → hourlyHash обновляется
    ↓
HourlyEvents генерирует: LOCUSTS (severity: 35)
    ↓
Игрок A: doesEventAffectPlayer() → true (50% roll)
    ↓
Уничтожить 35% посевов игрока A
    ↓
Игрок B: doesEventAffectPlayer() → false
    ↓
Игрок B не пострадал!
```

**Реализация:**

```solidity
function applyLocustDamage(address player) external {
    HourlyEvents.GameEvent memory event = hourlyEvents.getCurrentEvent();
    
    require(event.eventType == HourlyEvents.EventType.LOCUSTS, "Not locusts");
    
    // Проверяем 50/50 шанс
    bool affected = hourlyEvents.doesEventAffectPlayer(player);
    if (!affected) {
        return; // Повезло!
    }
    
    // Уничтожить severity% посевов
    uint256[] memory plantIds = getPlayerPlants(player);
    uint256 toDestroy = (plantIds.length * event.severity) / 100;
    
    for (uint256 i = 0; i < toDestroy; i++) {
        plantNFT.burn(plantIds[i]);
    }
}
```

---

### Сценарий 4: Событие "Повышение цен" 📈

```
Час 16:00 → hourlyHash обновляется
    ↓
HourlyEvents генерирует: PRICE_SURGE (targetCrop: 0 = WHEAT)
    ↓
getPriceMultipliers() → [1150, 1000, 1000, 1000]
    ↓
Пшеница +15% для ВСЕХ игроков на 1 час!
    ↓
Игрок A видит: wheatPrice = 0.00115 ETH (было 0.001)
Игрок B видит: wheatPrice = 0.00115 ETH
```

---

## 📊 Временная шкала

```
00:00 UTC - Новый день
  ↓ dailyHash меняется
  ↓ У всех игроков новый магазин!
  ↓
01:00 - Новый час
  ↓ hourlyHash меняется
  ↓ Событие: RAIN
  ↓ Все растут быстрее!
  ↓
02:00 - Новый час
  ↓ hourlyHash меняется
  ↓ Событие: LOCUSTS
  ↓ Некоторые игроки теряют посевы
  ↓
03:00 - Новый час
  ↓ hourlyHash меняется
  ↓ Событие: PRICE_SURGE (пшеница)
  ↓ Пшеница +15%
  ↓
... (24 часа)
  ↓
00:00 UTC +1 день
  ↓ НОВЫЙ МАГАЗИН!
```

---

## 🎮 Интеграция с Xsolla

Xsolla будет хранить **off-chain инвентарь**:

```javascript
// После покупки в магазине on-chain
const tx = await marketplace.buySeed(CropType.WHEAT, 3);
await tx.wait();

// Сохраняем в Xsolla инвентарь
await xsollaAPI.addItem(userId, {
  itemId: 'wheat_seed',
  quantity: 3,
  acquiredAt: Date.now()
});

// Когда игрок хочет посадить
const seeds = await xsollaAPI.getInventory(userId, 'wheat_seed');
// Сажаем on-chain
const plantTx = await marketplace.plantSeed(CropType.WHEAT, landId);
// Удаляем из Xsolla
await xsollaAPI.removeItem(userId, 'wheat_seed', 1);
```

---

## 🚀 Deployment

```powershell
# 1. Задеплоить контракты
yarn deploy:timedbased --network statusSepolia

# 2. Получить адреса
TimeBasedOracle:    0x...
PersonalizedShop:   0x...
HourlyEvents:       0x...

# 3. Интегрировать с фронтендом
```

---

## ✨ Преимущества архитектуры

1. **Детерминированность** - можно pre-compute магазин off-chain
2. **Газ-эффективность** - read-only операции бесплатны
3. **Уникальность** - каждый игрок видит свой магазин
4. **Честность** - нельзя манипулировать (хеш зависит от блокчейна)
5. **Предсказуемость** - можно увидеть будущие события заранее

---

**Готово к реализации! 🎉**
