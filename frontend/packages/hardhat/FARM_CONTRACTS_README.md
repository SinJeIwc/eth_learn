# Farm Game Smart Contracts

Система взаимосвязанных смарт-контрактов для игры-фермы с детерминированными случайными событиями.

## 🎯 Архитектура

Контракты работают по цепочке: **Events → Effects → Market**

### Контракты

1. **FarmOrchestrator** - координатор всей системы
   - Управляет выполнением раундов
   - Commit-reveal схема для RNG
   - Гарантирует идемпотентность

2. **FarmEvents** - генератор событий
   - Случайные события (саранча, ветер, дождь, etc.)
   - Детерминированная генерация на основе seed

3. **FarmEffects** - применение эффектов
   - Изменяет состояние огорода (рост, здоровье)
   - Рассчитывает модификаторы урожая

4. **MarketManager** - управление рынком
   - Динамические цены на товары
   - Реакция на события и эффекты

## 📦 Установка и Деплой

### 1. Установите зависимости

```bash
cd frontend/packages/hardhat
yarn install
```

### 2. Скомпилируйте контракты

```bash
yarn compile
```

Это создаст typechain-types для TypeScript.

### 3. Задеплойте контракты

Локальная сеть (Hardhat):
```bash
# В одном терминале запустите node
yarn chain

# В другом терминале задеплойте
yarn deploy
```

Testnet (например, Status Sepolia):
```bash
yarn deploy --network statusSepolia
```

### 4. Сохраните адреса контрактов

После деплоя сохраните адрес `FarmOrchestrator` в `.env`:

```bash
FARM_ORCHESTRATOR_ADDRESS=0x...
```

## 🧪 Тестирование

Запустите тесты:

```bash
yarn test
```

Тесты покрывают:
- ✅ Создание огородов
- ✅ Commit-reveal flow
- ✅ Идемпотентность раундов
- ✅ Авторизацию (KEEPER_ROLE)
- ✅ Интеграцию с маркетом
- ✅ Edge cases

## 🤖 Запуск Keeper (автоматические раунды)

Keeper автоматически выполняет раунды каждые 20 секунд.

### Настройка

1. Убедитесь, что адрес deployer имеет KEEPER_ROLE:

```bash
# В Hardhat console
const orchestrator = await ethers.getContractAt("FarmOrchestrator", "0x...");
const KEEPER_ROLE = await orchestrator.KEEPER_ROLE();
await orchestrator.grantRole(KEEPER_ROLE, "0xKeeperAddress");
```

2. Установите адрес контракта в `.env`:

```bash
FARM_ORCHESTRATOR_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Запуск

```bash
yarn keeper
```

Keeper будет:
- Каждые 20 секунд обрабатывать все огороды
- Commit → Reveal → Execute для каждого раунда
- Логировать события, эффекты и изменения цен

## 🎮 Использование в игре

### Создание огорода

```typescript
const tx = await farmOrchestrator.connect(player).createGarden();
await tx.wait();
// Вернет gardenId
```

### Получение состояния

```typescript
const garden = await farmOrchestrator.getGarden(gardenId);
console.log({
  owner: garden.owner,
  health: garden.totalHealth, // 0-1000
  growth: garden.totalGrowth, // 0-1000
  plants: garden.plantCount
});
```

### Получение цен на рынке

```typescript
const prices = await marketManager.getAllPrices();
console.log({
  tomato: ethers.formatEther(prices[0]),
  wheat: ethers.formatEther(prices[1]),
  corn: ethers.formatEther(prices[2]),
  potato: ethers.formatEther(prices[3])
});
```

### Просмотр истории раундов

```typescript
const result = await farmOrchestrator.getRoundResult(gardenId, roundId);
const eventTypes = ["NONE", "LOCUSTS", "WIND", "RAIN", "DROUGHT", "FROST", "SUNSTORM", "PESTS"];
console.log({
  event: eventTypes[result.eventData.eventType],
  severity: result.eventData.severity,
  healthDelta: result.effectResult.healthDelta,
  growthDelta: result.effectResult.growthDelta
});
```

## 📊 События (Events)

Слушайте события для обновления UI в реальном времени:

```typescript
// Новый огород создан
farmOrchestrator.on("GardenCreated", (gardenId, owner) => {
  console.log(`New garden ${gardenId} by ${owner}`);
});

// Событие произошло
farmEvents.on("EventGenerated", (gardenId, roundId, eventType, severity) => {
  // Обновить UI с анимацией события
});

// Цены обновились
marketManager.on("PricesUpdated", (roundId, productIds, newPrices) => {
  // Обновить UI рынка
});
```

## 🔐 Безопасность

### Commit-Reveal RNG

Использована commit-reveal схема:
1. Keeper генерирует seed оффчейн
2. Коммитит hash(seed) on-chain
3. Ревилит seed и выполняет раунд
4. Финальный seed = keccak256(reveal + blockhash + gardenId + roundId)

Это предотвращает:
- ❌ Предсказание результатов
- ❌ Манипуляцию seed'ом
- ❌ Front-running

### Идемпотентность

Каждый раунд можно выполнить только один раз:
- Проверка `roundMetas[gardenId][roundId].executed`
- Revert при попытке повторного выполнения

### Авторизация

- `KEEPER_ROLE` - может выполнять commit/execute
- `DEFAULT_ADMIN_ROLE` - может обновлять контракты и роли
- `onlyOwner` - для административных функций MarketManager

## 🚀 Production готовность

Для production рекомендуется:

1. **Chainlink VRF v2** вместо commit-reveal
   - Более безопасный RNG
   - Гарантированная случайность

2. **Chainlink Keepers** вместо node script
   - Децентрализованный вызов
   - Uptime гарантия

3. **Proxy паттерн** для апгрейда контрактов
   - OpenZeppelin UUPS или Transparent Proxy

4. **Аудит контрактов**

## 🛠️ Разработка

### Добавление новых событий

1. Добавьте в `IFarmEvents.EventType` enum
2. Обновите вероятности в `FarmEvents`
3. Добавьте обработку в `FarmEffects.applyEffect()`

### Добавление новых товаров

1. Добавьте константы в `MarketManager`
2. Обновите `recalculatePrices()` логику
3. Обновите базовые цены

### Настройка интервала раундов

Измените константу в контракте:
```solidity
uint256 public constant ROUND_INTERVAL = 20; // seconds
```

И в keeper script:
```typescript
const ROUND_INTERVAL = 20; // секунды
```

## 📝 Типы событий

| Событие   | Эффект на здоровье | Эффект на рост | Модификатор урожая |
|-----------|-------------------|----------------|-------------------|
| NONE      | 0                 | +10            | 100%              |
| LOCUSTS   | -500 до 0         | -250 до 0      | 70%               |
| WIND      | варьируется       | варьируется    | 90-110%           |
| RAIN      | 0                 | +333 до 0      | 120%              |
| DROUGHT   | -333 до 0         | -200 до 0      | 80%               |
| FROST     | -500 до 0         | -333 до 0      | 60%               |
| SUNSTORM  | 0                 | +500 до 0      | 130%              |
| PESTS     | -333 до 0         | 0              | 85%               |

## 🐛 Troubleshooting

### Ошибка "Round already executed"
Раунд уже был выполнен. Используйте другой roundId (timestamp).

### Ошибка "Invalid reveal"
Hash reveal'а не совпадает с committed hash. Проверьте seed.

### Ошибка "AccessControl: account ... is missing role"
У аккаунта нет KEEPER_ROLE. Выдайте роль через `grantRole()`.

### Keeper не обрабатывает огороды
Проверьте:
- Установлен ли FARM_ORCHESTRATOR_ADDRESS в .env
- Есть ли у keeper'а KEEPER_ROLE
- Запущен ли Hardhat node (для локальной разработки)

## 📚 Дополнительные ресурсы

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Chainlink VRF](https://docs.chain.link/vrf)
- [Chainlink Keepers](https://docs.chain.link/keepers)

## 📄 Лицензия

MIT
