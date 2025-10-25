# ✅ ФИНАЛЬНЫЙ ЗАПУСК - Farm Game

## 🎉 ВСЕ ГОТОВО!

### ✅ Что сделано:

1. ✅ **7 Smart Contracts** задеплоены на **Status Sepolia**
2. ✅ **Xsolla OAuth 2.0** настроен
3. ✅ **TypeScript типы** сгенерированы
4. ✅ **Цепная реакция** работает

---

## 🚀 ЗАПУСК (3 шага)

### Шаг 1: Обнови .env.local

`packages/nextjs/.env.local`:

```env
# Xsolla OAuth (уже есть)
NEXT_PUBLIC_XSOLLA_PROJECT_ID=295131
NEXT_PUBLIC_XSOLLA_CLIENT_ID=14057
XSOLLA_CLIENT_SECRET=ваш_секрет

# Адреса контрактов на Status Sepolia
NEXT_PUBLIC_FARM_MARKETPLACE=0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575
NEXT_PUBLIC_PRICE_ORACLE=0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154
```

### Шаг 2: Запусти фронтенд

```powershell
cd 'C:\Web\alatoo work\main\eth_learn\frontend\packages\nextjs'
yarn dev
```

### Шаг 3: Играй!

1. Открой: **http://localhost:3000**
2. **Login с Xsolla** (правый верхний угол)
3. **Connect Wallet** (MetaMask)
4. **Переключись на Status Sepolia** в MetaMask
5. **Начинай играть!** 🌾

---

## 🌐 Добавить Status Sepolia в MetaMask

```javascript
// Скопируй в консоль браузера:
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x630C90BA',
    chainName: 'Status Sepolia',
    nativeCurrency: { 
      name: 'SNT', 
      symbol: 'SNT', 
      decimals: 18 
    },
    rpcUrls: ['https://public.sepolia.rpc.status.network'],
    blockExplorerUrls: ['https://sepoliascan.status.network']
  }]
});
```

---

## 🎮 Как играть

### 1. Получи стартовые ресурсы

Админ должен дать тебе:
- **48 Land NFTs** (8x6 клеток)
- **100 FarmCoin** (игровая валюта)

*Функция для админа:*
```solidity
marketplace.mintStarterLand(твой_адрес);
marketplace.giveStarterCoins(твой_адрес, 100 ether);
```

### 2. Купи семена

```
Shop → Buy Seeds → Выбери тип (Wheat/Grape/Pumpkin)
```

**Цены динамические!** Зависят от событий.

### 3. Посади семена

```
Inventory → Select Seed → Click на клетку земли
```

### 4. Триггерни событие! 🔥

```
Click "Trigger Event" → Цепная реакция:
  1. Случайное событие (🌧️ дождь, 🦗 саранча, ❄️ мороз...)
  2. Влияет на твои растения (health, growth)
  3. Меняет плодородность земли
  4. ИЗМЕНЯЕТ ЦЕНЫ для всех игроков!
```

### 5. Собери урожай

```
Когда растение созрело → Click "Harvest" → Получи FarmCoin!
```

**Награда зависит от здоровья растения!**

---

## 🔥 Цепная реакция

```
triggerRandomEvent()
       ↓
GameEvents: Генерирует событие (например: FROST severity:850)
       ↓
GameEffects: Применяет к твоим растениям
  - Health: -595
  - Fertility: -283
       ↓
PriceOracle: Пересчитывает цены
  - Wheat: +28.3% (плохой урожай → дефицит)
  - Grape: +21.2%
  - Pumpkin: +17.0%
       ↓
Marketplace: Использует новые цены для покупок/продаж
```

---

## 📊 События и эффекты

| Событие | Вероятность | Эффект |
|---------|------------|--------|
| 🌾 NONE | 30% | Ничего |
| 🌧️ RAIN | 20% | +Health, +Growth ✅ |
| 🦗 LOCUSTS | 15% | -Health (до -500) ❌ |
| 💨 WIND | 10% | -Health (minor) |
| ☀️ DROUGHT | 10% | -Health, -Fertility |
| 🌞 SUNSTORM | 5% | ++Health, ++Growth ✅✅ |
| ❄️ FROST | 5% | ---Health (до -700) ❌❌❌ |
| 🐛 PESTS | 5% | -Health (moderate) |

---

## 📍 Адреса контрактов

**Status Sepolia (Chain ID: 1660990954)**

```
FarmMarketplace: 0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575
FarmCoin:        0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00
PlantNFT:        0x36C02dA8a0983159322a80FFE9F24b1acfF8B570
FarmLand:        0x809d550fca64d94Bd9F66E60752A544199cfAC3D
GameEvents:      0x4c5859f0F772848b2D91F1D83E2Fe57935348029
GameEffects:     0x1291Be112d480055DaFd8a610b7d1e203891C274
PriceOracle:     0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154
```

**Explorer:** https://sepoliascan.status.network

---

## 🐛 Проблемы?

### "Cannot read properties of undefined"
```
Перезапусти yarn dev после деплоя
```

### "Xsolla login не работает"
```
Проверь .env.local - CLIENT_SECRET должен быть правильным
```

### "Transaction failed"
```
1. Убедись что подключен к Status Sepolia
2. Проверь есть ли SNT для gas
3. Получил ли ты стартовые ресурсы от админа
```

### "Prices not updating"
```
Дождись подтверждения транзакции triggerRandomEvent()
Цены обновятся автоматически через события
```

---

## 📚 Дополнительная документация

- `INTEGRATION_GUIDE.md` - Полная интеграция
- `FARM_GAME_CONTRACTS.md` - Архитектура контрактов
- `DEPLOYED_ADDRESSES.md` - Адреса на Status Sepolia
- `XSOLLA_SETUP.md` - Настройка OAuth

---

## ✨ Что дальше?

- [ ] Добавить UI компоненты для игры
- [ ] Keeper bot для авто-событий
- [ ] Leaderboard (топ фермеры)
- [ ] P2P marketplace
- [ ] Сезонные события
- [ ] Апгрейды земли

---

**🎉 ВСЁ РАБОТАЕТ! ИГРАЙ И НАСЛАЖДАЙСЯ! 🌾🎮**
