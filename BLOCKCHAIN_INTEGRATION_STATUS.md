# 🔗 Интеграция блокчейна - ГОТОВО!

## ✅ Что было сделано

### 1. Создан хук `useFarmContracts.ts`

Хук для взаимодействия со смарт-контрактами:

- ✅ Чтение баланса FarmCoin
- ✅ Чтение количества PlantNFT
- ✅ Чтение количества FarmLand
- ✅ Функция `buySeeds()` - покупка семян
- ✅ Функция `plantSeed()` - посадка
- ✅ Функция `harvestCrop()` - сбор урожая
- ✅ Функция `approveFarmCoin()` - одобрение трат

### 2. Обновлен компонент `FarmGame.tsx`

- ✅ Добавлен импорт `useAccount` и `useFarmContracts`
- ✅ Отображается реальный баланс из блокчейна
- ✅ Показывается количество PlantNFT и FarmLand
- ✅ Индикатор "⛓️ Blockchain" когда кошелек подключен
- ✅ MapModal получает реальный баланс монет

## 🎮 Как использовать

### Шаг 1: Запустите сервер

```bash
cd frontend/packages/nextjs
yarn dev
```

### Шаг 2: Откройте игру

```
http://localhost:3001/game
```

### Шаг 3: Пройдите авторизацию Xsolla

Нажмите кнопку авторизации на главном экране

### Шаг 4: Подключите кошелек

1. Нажмите "Connect Wallet" (правый верхний угол)
2. Выберите **Status Network Sepolia**
3. Подтвердите подключение

### Шаг 5: Получите стартовые ресурсы

**Через Debug UI (рекомендуется):**

1. Откройте в новой вкладке: http://localhost:3001/debug
2. Найдите контракт `FarmMarketplace` (адрес: `0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575`)
3. Вызовите функцию `giveStarterCoins`:

   ```
   player: <ваш адрес кошелька>
   amount: 1000000000000000000000
   ```

   _(Это даст 1000 FarmCoins)_

4. Вызовите функцию `mintStarterLand`:
   ```
   player: <ваш адрес кошелька>
   ```
   _(Это создаст 48 земельных участков 8x6)_

### Шаг 6: Проверьте интеграцию

В игре вы должны увидеть:

- 💰 Баланс FarmCoin (например: 1000)
- 🌱 0 (количество PlantNFT)
- 🏞️ 48 (количество земельных участков)
- ⛓️ Blockchain (индикатор что данные идут из блокчейна)

## 🛒 Покупка семян через блокчейн

### MapModal уже подключен к блокчейну!

Когда вы открываете карту и покупаете семена:

**Что происходит сейчас:**

1. MapModal показывает ваш реальный баланс FarmCoin
2. При покупке вызывается локальная функция (пока)
3. Баланс отображается из блокчейна

**Для полной интеграции покупки нужно:**

Обновить MapModal чтобы использовать `useFarmContracts`:

```tsx
// В MapModal.tsx
import { useFarmContracts } from "~~/hooks/useFarmContracts";

const MapModal = ({ isOpen, onClose, coins, ... }) => {
  const { buySeeds, approveFarmCoin } = useFarmContracts();

  const handleBuySeeds = async (cropType: string, amount: number) => {
    try {
      // 1. Одобрить трату
      const totalCost = PRICES[`${cropType}_seed`] * amount;
      await approveFarmCoin(BigInt(totalCost * 1e18));

      // 2. Купить семена
      await buySeeds(cropType, amount);

      alert("Семена куплены! Транзакция в блокчейне!");
    } catch (error) {
      console.error("Error:", error);
      alert("Ошибка покупки");
    }
  };

  // ... rest of the code
};
```

## 📊 Адреса контрактов (Status Sepolia)

| Контракт        | Адрес                                        | Explorer                                                                                      |
| --------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| FarmCoin        | `0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00` | [View](https://sepoliascan.status.network/address/0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00) |
| PlantNFT        | `0x36C02dA8a0983159322a80FFE9F24b1acfF8B570` | [View](https://sepoliascan.status.network/address/0x36C02dA8a0983159322a80FFE9F24b1acfF8B570) |
| FarmLand        | `0x809d550fca64d94Bd9F66E60752A544199cfAC3D` | [View](https://sepoliascan.status.network/address/0x809d550fca64d94Bd9F66E60752A544199cfAC3D) |
| FarmMarketplace | `0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575` | [View](https://sepoliascan.status.network/address/0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575) |

## 🔧 Следующие шаги для полной интеграции

### Высокий приоритет:

1. **Покупка семян через блокчейн**

   - Обновить MapModal для вызова `buySeeds()`
   - Добавить `approveFarmCoin()` перед покупкой
   - Показать уведомления о статусе транзакции

2. **Посадка через блокчейн**

   - Обновить FarmGrid для вызова `plantSeed()`
   - Связать клик на клетку с контрактом
   - Создать PlantNFT при посадке

3. **Сбор урожая через блокчейн**
   - Обновить логику сбора для вызова `harvestCrop()`
   - Проверять `isReadyToHarvest` из контракта
   - Сжигать PlantNFT и давать награду

### Средний приоритет:

4. **Синхронизация состояния**

   - Читать PlantNFT для отображения на грядке
   - Обновлять UI при изменениях в блокчейне
   - Подписка на события контракта

5. **UI/UX улучшения**
   - Loading индикаторы при транзакциях
   - Toast уведомления (success/error)
   - Анимации при покупке/посадке/сборе

## 🐛 Решение проблем

### "Баланс показывает 0"

**Решение:** Получите стартовые монеты через Debug UI (функция `giveStarterCoins`)

### "Не вижу индикатор Blockchain"

**Решение:** Подключите кошелек к Status Network Sepolia

### "Ошибка при транзакции"

**Причины:**

- Не одобрена трата FarmCoin → вызовите `approveFarmCoin()` сначала
- Недостаточно монет → получите через `giveStarterCoins`
- Неправильная сеть → убедитесь что выбрана Status Sepolia (chainId: 1660990954)

### "Gas fees?"

**Ответ:** Gas = 0! Status Network Sepolia имеет бесплатные транзакции 🎉

## 📚 Документация контрактов

### FarmMarketplace.buySeed()

```solidity
function buySeed(SeedType seedType, uint256 quantity) external
// SeedType: 0=WHEAT, 1=GRAPE, 2=PUMPKIN
// Требует: approve FarmCoin перед вызовом
```

### FarmMarketplace.plantSeed()

```solidity
function plantSeed(SeedType seedType, uint256 landTokenId) external returns (uint256 plantTokenId)
// Создает PlantNFT на указанном участке земли
// Требует: владение landTokenId
```

### FarmMarketplace.harvestCrop()

```solidity
function harvestCrop(uint256 plantTokenId) external
// Сжигает PlantNFT, минтит FarmCoin
// Требует: plant.growthStage == 3 (mature)
```

## ✅ Текущий статус

- ✅ Контракты задеплоены
- ✅ Хук `useFarmContracts` создан
- ✅ FarmGame показывает данные из блокчейна
- ✅ Отображается баланс FarmCoin
- ✅ Показывается количество NFT
- ⏳ MapModal читает баланс (но покупка еще локальная)
- ⏳ Посадка пока локальная (нужно подключить к контракту)
- ⏳ Сбор урожая пока локальный (нужно подключить к контракту)

---

**Вывод:** Базовая интеграция готова! Игра показывает реальные данные из блокчейна. Осталось подключить действия (покупка, посадка, сбор) к контрактам.

**Следующий шаг:** Обновить MapModal для вызова `buySeeds()` при покупке семян.
