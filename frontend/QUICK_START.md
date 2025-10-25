# 🎮 Quick Start Guide - Farm Game

## Сейчас нужно выполнить 3 команды в 3 разных терминалах

### Терминал 1: Запустить Hardhat локальную сеть

```powershell
cd 'C:\Web\alatoo work\main\eth_learn\frontend\packages\hardhat'
yarn chain
```

**Не закрывайте этот терминал!** Hardhat сеть должна работать постоянно.

---

### Терминал 2: Задеплоить Farm контракты

```powershell
cd 'C:\Web\alatoo work\main\eth_learn\frontend\packages\hardhat'
yarn deploy:farm
```

**Скопируйте адрес FarmOrchestrator** из вывода (например: `0x5FbDB...`).

Создайте файл `.env` в папке `packages/hardhat`:

```env
FARM_ORCHESTRATOR_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Замените адрес на ваш из вывода деплоя!

---

### Терминал 3: Запустить Keeper (автоматизация раундов)

```powershell
cd 'C:\Web\alatoo work\main\eth_learn\frontend\packages\hardhat'
yarn keeper
```

Keeper будет выполнять раунды каждые 20 секунд автоматически! 🤖

---

### Терминал 4: Запустить Next.js фронтенд

```powershell
cd 'C:\Web\alatoo work\main\eth_learn\frontend\packages\nextjs'
yarn dev
```

Откройте браузер: **http://localhost:3000/farm**

---

## ✅ Что вы увидите

1. **Подключите кошелек** (MetaMask)
2. **Нажмите "Create Garden"** - создаст ваш огород on-chain
3. **Keeper автоматически начнет выполнять раунды** каждые 20 секунд
4. **Смотрите live updates**: 
   - Health и Growth меняются от случайных событий
   - Market prices меняются в зависимости от урожайности
   - Recent Events показывает последние 5 раундов

---

## 🎲 События которые могут произойти

- 🌾 **NONE (30%)** - Ничего не происходит
- 🦗 **LOCUSTS (15%)** - Саранча атакует (damage)
- 💨 **WIND (10%)** - Ветер (minor damage)
- 🌧️ **RAIN (20%)** - Дождь (good for growth!)
- ☀️ **DROUGHT (10%)** - Засуха (reduces health)
- ❄️ **FROST (5%)** - Мороз (heavy damage!)
- 🌞 **SUNSTORM (5%)** - Солнечная буря (boosts growth!)
- 🐛 **PESTS (5%)** - Вредители (moderate damage)

---

## 💰 Динамика рынка

- **Плохие события** (низкий урожай) → **цены растут** 📈
- **Хорошие события** (высокий урожай) → **цены падают** 📉
- Диапазон: **50% - 200%** от базовой цены

---

## ⚠️ Troubleshooting

### Ошибка TypeScript при открытии /farm
Выполните деплой (терминал 2) чтобы сгенерировать TypeChain типы.

### Keeper не видит огород
Это нормально! Keeper ждет пока вы создадите огород через UI.

### После перезапуска yarn chain все сбросилось
Это нормально для локальной сети. Нужно:
1. Заново `yarn deploy:farm`
2. Обновить `.env` с новым адресом
3. Перезапустить `yarn keeper`

---

## 📚 Дополнительные команды

```powershell
# Тесты контрактов
yarn test:farm

# Компиляция
yarn compile

# Деплой на Status Sepolia testnet
yarn deploy --network statusSepolia

# Просмотр аккаунтов
yarn account
```

---

**Готово! Наслаждайтесь игрой! 🌾🎮**
