# 🎲 Система событий - Инструкция по деплою и использованию

## 📋 Обзор

Система почасовых событий для фермерской игры с тремя типами событий:

- 🌧️ **Дождь**: Уменьшает время роста всех растений на 2 часа
- ☀️ **Засуха**: Удваивает цены на пшеницу (семена и урожай)
- ❄️ **Зима**: Убивает 10-50% случайных растений игрока

## 🚀 Шаг 1: Деплой обновленных контрактов

### Измененные контракты:

1. **PlantNFT.sol** - Добавлены функции:

   - `reduceGrowthTime(tokenId, timeReduction)` - уменьшает время роста для дождя
   - `getPlantsByOwner(owner)` - получает все растения игрока для зимы

2. **GameEvents.sol** - Система часовых триггеров:

   - `lastEventHour` - отслеживает последний час события
   - `canTriggerEvent()` - проверяет, прошел ли час
   - `triggerEvent()` - генерирует событие (только раз в час)

3. **SimpleGameEffects.sol** (НОВЫЙ) - Применение эффектов:

   - `applyEventEffects(eventType, severity)` - вызывается из GameEvents
   - `applyRainToPlant(plantTokenId)` - игрок применяет бонус дождя
   - `applyWinterToFarmer(farmer)` - обрабатывает урон от зимы

4. **PriceOracle.sol** - Управление ценами:
   - `setWheatMultiplier(multiplier)` - устанавливает множитель цен пшеницы

### Команды деплоя:

```bash
cd frontend/packages/hardhat

# Деплой обновленной системы
yarn deploy --tags UpdatedEventSystem --network statusSepolia

# Или полный редеплой всех контрактов
yarn deploy --reset --network statusSepolia
```

### После деплоя:

1. Сохраните новые адреса контрактов из терминала
2. Автоматически сгенерируются TypeScript типы
3. Проверьте файл `deployedContracts.ts` на наличие новых адресов

## ⚙️ Шаг 2: Настройка авторизаций

После деплоя нужно настроить права доступа между контрактами:

```solidity
// 1. Авторизовать SimpleGameEffects на PlantNFT
PlantNFT.addAuthorized(simpleGameEffectsAddress);

// 2. Авторизовать FarmMarketplace на PlantNFT
PlantNFT.addAuthorized(farmMarketplaceAddress);

// 3. Установить SimpleGameEffects в GameEvents
GameEvents.setEffectsContract(simpleGameEffectsAddress);
```

Это делается автоматически в скрипте деплоя `04_deploy_updated_event_system.ts`.

## 🎮 Шаг 3: Клиентская интеграция

### Компоненты:

1. **useHourlyEventTrigger** - Хук для автоматической проверки событий

   - Проверяет каждый час, можно ли триггернуть событие
   - Автоматически вызывает `GameEvents.triggerEvent()`
   - Использует `setInterval` с расчетом до следующего часа

2. **EventNotification** - UI компонент уведомлений
   - Показывает текущее активное событие
   - Цветовая индикация: синий (дождь), желтый (засуха), голубой (зима)
   - Автообновление каждые 30 секунд

### Использование в коде:

```tsx
import { useHourlyEventTrigger } from "~~/hooks/useHourlyEventTrigger";
import EventNotification from "~~/components/EventNotification";

function FarmGame() {
  // Автоматическая проверка и триггер событий
  const { isChecking } = useHourlyEventTrigger();

  return (
    <div>
      <EventNotification />
      {/* Остальной UI */}
    </div>
  );
}
```

## 🧪 Шаг 4: Тестирование

### Проверка почасовых триггеров:

```bash
# В консоли браузера будут логи:
🎲 Triggering hourly event...
✅ Event triggered successfully! Total events: 3
```

### Ручное тестирование событий:

1. Перейдите на страницу `/debug`
2. Найдите контракт `GameEvents`
3. Вызовите функции:
   - `canTriggerEvent()` - проверить, можно ли триггернуть
   - `triggerEvent()` - принудительно создать событие (если прошел час)
   - `getEventsCount()` - получить количество событий
   - `getEvent(eventId)` - посмотреть детали события

### Тестирование эффектов:

**Дождь:**

1. Посадите растение
2. Дождитесь события RAIN
3. Вызовите `SimpleGameEffects.applyRainToPlant(plantTokenId)`
4. Проверьте через `PlantNFT.getPlant(tokenId)` - `plantedAt` должен уменьшиться на 2 часа

**Засуха:**

1. Дождитесь события DROUGHT
2. Проверьте цены в магазине - пшеница должна подорожать в 2 раза
3. `PriceOracle.getSeedPrice(WHEAT_SEED)` и `getCropPrice(WHEAT)` покажут новые цены

**Зима:**

1. Посадите несколько растений
2. Дождитесь события WINTER
3. Вызовите `SimpleGameEffects.applyWinterToFarmer(yourAddress)`
4. 10-50% ваших растений будут уничтожены

## 📊 Шаг 5: Мониторинг

### Проверка событий в блокчейне:

```typescript
// Читаем последнее событие
const eventsCount = await gameEvents.getEventsCount();
const lastEvent = await gameEvents.getEvent(eventsCount - 1);

console.log({
  type: lastEvent.eventType, // 0=NONE, 1=RAIN, 2=DROUGHT, 3=WINTER
  severity: lastEvent.severity, // 0-1000
  timestamp: new Date(Number(lastEvent.timestamp) * 1000),
});
```

### Отслеживание events:

```typescript
// Слушаем события из SimpleGameEffects
simpleGameEffects.on("RainApplied", (plantsAffected, timeReduced) => {
  console.log(`🌧️ Дождь! Затронуто растений: ${plantsAffected}`);
});

simpleGameEffects.on("DroughtApplied", (wheatMultiplier) => {
  console.log(`☀️ Засуха! Множитель пшеницы: ${wheatMultiplier / 1000}x`);
});

simpleGameEffects.on("WinterApplied", (farmer, plantsDied, plantsTotal) => {
  console.log(`❄️ Зима! Погибло ${plantsDied} из ${plantsTotal} растений`);
});
```

## 🔧 Отладка

### Проблема: События не триггерятся автоматически

**Решение:**

1. Проверьте, что кошелек подключен
2. Откройте консоль браузера и ищите ошибки
3. Убедитесь, что `deployedContracts.ts` содержит правильные адреса
4. Проверьте, что прошел час с последнего события: `GameEvents.lastEventHour()`

### Проблема: "Not authorized" при применении эффектов

**Решение:**

1. Убедитесь, что SimpleGameEffects авторизован на PlantNFT:
   ```solidity
   PlantNFT.isAuthorized(simpleGameEffectsAddress) // должно вернуть true
   ```
2. Если false, вызовите `PlantNFT.addAuthorized(simpleGameEffectsAddress)`

### Проблема: Цены не меняются при засухе

**Решение:**

1. Проверьте множители: `PriceOracle.cropMultipliers(CropType.WHEAT)`
2. Должно быть 2000 (2.0x) после засухи
3. Проверьте, что SimpleGameEffects вызывает `priceOracle.setWheatMultiplier(2)`

## 📈 Метрики системы

### Вероятности событий:

- NONE (нет события): 40%
- RAIN (дождь): 25%
- DROUGHT (засуха): 20%
- WINTER (зима): 15%

### Временные параметры:

- **Проверка триггера**: каждый час (точно на XX:00:00)
- **Обновление UI**: каждые 30 секунд
- **Бонус дождя**: -2 часа роста
- **Множитель засухи**: 2x цена пшеницы
- **Урон зимы**: 10-50% растений (зависит от severity)

## 🎯 Roadmap улучшений

- [ ] Добавить UI кнопку "Применить бонус дождя" для каждого растения
- [ ] Автоматическое применение зимнего урона (без вызова игроком)
- [ ] История событий на странице статистики
- [ ] Push-уведомления о новых событиях
- [ ] Система достижений за выживание в зимах
- [ ] Страховка растений (защита от зимы за FarmCoin)

## 📝 Полезные команды

```bash
# Компиляция контрактов
yarn hardhat compile

# Запуск тестов
yarn hardhat test

# Верификация контрактов
yarn hardhat verify --network statusSepolia <ADDRESS> <CONSTRUCTOR_ARGS>

# Генерация TypeScript типов
yarn hardhat typechain

# Проверка газа транзакций
yarn hardhat test --gas-reporter
```

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи в консоли браузера (F12)
2. Посмотрите транзакции в Status Network Explorer
3. Убедитесь, что все контракты задеплоены на одной сети
4. Проверьте баланс FarmCoin (нужен для транзакций)
5. Убедитесь, что сеть Status Sepolia активна (gasless должен работать)
