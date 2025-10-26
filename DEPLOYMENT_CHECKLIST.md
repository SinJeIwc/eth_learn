# ✅ Чеклист деплоя системы событий

## Перед деплоем

- [ ] Все контракты скомпилированы без ошибок
- [ ] Обновлены файлы:
  - [ ] `PlantNFT.sol` - добавлены `reduceGrowthTime` и `getPlantsByOwner`
  - [ ] `GameEvents.sol` - добавлена система `lastEventHour`
  - [ ] `SimpleGameEffects.sol` - создан новый контракт
  - [ ] `PriceOracle.sol` - добавлена `setWheatMultiplier`
- [ ] Создан deploy скрипт `04_deploy_updated_event_system.ts`

## Деплой

```bash
cd frontend/packages/hardhat
yarn deploy --tags UpdatedEventSystem --network statusSepolia
```

- [ ] PlantNFT задеплоен
- [ ] GameEvents задеплоен
- [ ] SimpleGameEffects задеплоен
- [ ] PriceOracle задеплоен
- [ ] FarmMarketplace задеплоен
- [ ] Сохранены все адреса контрактов

## Настройка прав

- [ ] SimpleGameEffects авторизован на PlantNFT
- [ ] FarmMarketplace авторизован на PlantNFT
- [ ] SimpleGameEffects установлен как effectsContract в GameEvents

## Фронтенд

- [ ] Создан `useHourlyEventTrigger.ts` хук
- [ ] Создан `EventNotification.tsx` компонент
- [ ] Хук интегрирован в `FarmGame.tsx`
- [ ] Компонент EventNotification добавлен в UI
- [ ] Сгенерированы TypeScript типы: `yarn hardhat typechain`

## Тестирование

### Базовая проверка

- [ ] Открыть игру в браузере
- [ ] Подключить кошелек
- [ ] Проверить консоль на ошибки

### Триггер событий

- [ ] Зайти на `/debug`
- [ ] Найти GameEvents контракт
- [ ] Вызвать `canTriggerEvent()` - должно вернуть `true` (если прошел час)
- [ ] Вызвать `triggerEvent()` - создать событие
- [ ] Проверить `getEventsCount()` - счетчик увеличился

### UI уведомлений

- [ ] Уведомление появилось в правом верхнем углу
- [ ] Правильный цвет события (синий/желтый/голубой)
- [ ] Правильное описание эффекта
- [ ] Счетчик событий отображается

### Дождь (RAIN)

- [ ] Посадить растение через магазин
- [ ] Дождаться события RAIN (или вызвать вручную)
- [ ] Зайти на `/debug`
- [ ] SimpleGameEffects → `applyRainToPlant(plantTokenId)`
- [ ] PlantNFT → `getPlant(tokenId)` - проверить что `plantedAt` уменьшился

### Засуха (DROUGHT)

- [ ] Дождаться события DROUGHT
- [ ] Открыть магазин
- [ ] Цена семян пшеницы удвоилась
- [ ] `/debug` → PriceOracle → `getSeedPrice(0)` показывает 2x

### Зима (WINTER)

- [ ] Посадить 10+ растений
- [ ] Дождаться события WINTER
- [ ] `/debug` → SimpleGameEffects → `applyWinterToFarmer(yourAddress)`
- [ ] PlantNFT → `balanceOf(yourAddress)` - часть растений уничтожена

### Автоматический триггер

- [ ] Подождать начала нового часа (например 18:00)
- [ ] Проверить консоль: "🎲 Triggering hourly event..."
- [ ] Проверить: "✅ Event triggered successfully!"
- [ ] `getEventsCount()` автоматически увеличился

## Финальная проверка

- [ ] Игра работает без ошибок
- [ ] События генерируются автоматически каждый час
- [ ] UI показывает текущее событие
- [ ] Эффекты применяются корректно
- [ ] Цены обновляются при засухе
- [ ] Дождь уменьшает время роста
- [ ] Зима убивает растения

## Если что-то не работает

### События не триггерятся

1. Проверь `deployedContracts.ts` - есть ли адрес GameEvents
2. Открой консоль браузера - есть ли ошибки
3. Убедись что кошелек подключен
4. Проверь `GameEvents.lastEventHour()` - прошел ли час

### Ошибка "Not authorized"

1. `/debug` → PlantNFT → `isAuthorized(simpleGameEffectsAddress)`
2. Если false: PlantNFT → `addAuthorized(simpleGameEffectsAddress)`
3. Повтори для FarmMarketplace

### Цены не меняются

1. Проверь что событие DROUGHT создалось: `getEvent(lastEventId)`
2. Проверь множитель: PriceOracle → `cropMultipliers(0)` должно быть 2000
3. Проверь что SimpleGameEffects вызвал `setWheatMultiplier(2)`

### UI не обновляется

1. Проверь что EventNotification импортирован в FarmGame
2. Проверь консоль на ошибки fetch
3. Убедись что deployedContracts.ts актуален
4. Перезагрузи страницу (Ctrl+Shift+R)

## Готово! 🎉

Система событий работает и готова к использованию!

Следующие шаги:

- Добавить больше UI для применения эффектов
- Создать страницу истории событий
- Добавить систему достижений
- Реализовать страховку растений
