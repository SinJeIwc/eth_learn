# 🎮 Авторизация в игре через Xsolla

## ✅ Что реализовано

### 1. **Три метода входа**
- **🔐 Xsolla OAuth 2.0** - полноценная авторизация через Xsolla Login Widget
- **🆔 Xsolla ID** - вход по User ID (симуляция)
- **👤 Гостевой вход** - локальное сохранение без авторизации

### 2. **Xsolla API интеграция**
Файл: `src/lib/xsollaApi.ts`

**Функции:**
- `decodeXsollaToken()` - декодирование JWT токена
- `isTokenExpired()` - проверка срока действия токена
- `getUserInfoFromToken()` - извлечение данных пользователя из токена
- `verifyXsollaToken()` - проверка токена через Xsolla API
- `saveGameProgress()` - сохранение прогресса в облако Xsolla
- `loadGameProgress()` - загрузка прогресса из облака

### 3. **Автоматическая проверка токена**
Файл: `src/hooks/useAuth.ts`

При загрузке приложения:
1. ✅ Проверяет наличие сохраненного токена
2. ✅ Проверяет срок действия токена
3. ✅ Верифицирует токен с Xsolla API
4. ✅ Автоматически разлогинивает если токен истек
5. ✅ Обновляет данные пользователя из токена

### 4. **Профиль пользователя в игре**
Компонент: `src/components/GameUserProfile.tsx`

Отображает:
- Аватар пользователя
- Username и Email
- Тип авторизации (Xsolla/Guest)
- User ID (для Xsolla)
- Статус облачного сохранения
- Игровой прогресс (уровень, монеты, инвентарь)

## 🔧 Как использовать

### Получить информацию о пользователе

```typescript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, userData } = useAuth();

  if (!isAuthenticated) {
    return <div>Войдите в систему</div>;
  }

  return (
    <div>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>Auth Type: {userData.authType}</p>
      {userData.xsollaToken && (
        <p>Xsolla Token: {userData.xsollaToken.substring(0, 20)}...</p>
      )}
    </div>
  );
}
```

### Сохранить прогресс в облако (только для Xsolla)

```typescript
import { saveGameProgress } from "../lib/xsollaApi";
import { XSOLLA_CONFIG } from "../config/xsolla";

async function handleSaveProgress(userData: UserData, gameState: any) {
  if (userData.authType !== 'xsolla' || !userData.xsollaToken) {
    console.log('Cloud save only available for Xsolla users');
    return;
  }

  const result = await saveGameProgress(
    userData.xsollaToken,
    XSOLLA_CONFIG.LOGIN_ID,
    {
      level: gameState.level,
      coins: gameState.coins,
      inventory: gameState.inventory,
      farmProgress: gameState.farmData,
    }
  );

  if (result) {
    console.log('✅ Progress saved to cloud!');
  }
}
```

### Загрузить прогресс из облака

```typescript
import { loadGameProgress } from "../lib/xsollaApi";
import { XSOLLA_CONFIG } from "../config/xsolla";

async function handleLoadProgress(userData: UserData) {
  if (userData.authType !== 'xsolla' || !userData.xsollaToken) {
    return null;
  }

  const progress = await loadGameProgress(
    userData.xsollaToken,
    XSOLLA_CONFIG.LOGIN_ID,
    XSOLLA_CONFIG.PROJECT_ID
  );

  if (progress) {
    console.log('✅ Progress loaded:', progress);
    // Apply progress to game state
    setLevel(progress.level);
    setCoins(progress.coins);
    setInventory(progress.inventory);
  }

  return progress;
}
```

### Проверить токен вручную

```typescript
import { isTokenExpired, verifyXsollaToken } from "../lib/xsollaApi";
import { XSOLLA_CONFIG } from "../config/xsolla";

async function checkToken(token: string) {
  // Check expiration
  if (isTokenExpired(token)) {
    console.log('Token expired!');
    return false;
  }

  // Verify with Xsolla API
  const isValid = await verifyXsollaToken(token, XSOLLA_CONFIG.LOGIN_ID);
  
  if (isValid) {
    console.log('✅ Token is valid');
  } else {
    console.log('❌ Token is invalid');
  }

  return isValid;
}
```

## 📊 Данные в JWT токене

Xsolla возвращает JWT токен со следующими полями:

```json
{
  "sub": "bc62de92-6f4d-482a-805a-b059dccb2742",  // User ID
  "username": "habibullaevmuhamedalidev@gmail.com",
  "email": "habibullaevmuhamedalidev@gmail.com",
  "exp": 1761452800,  // Expiration timestamp
  "iat": 1761366400,  // Issued at timestamp
  "xsolla_login_access_key": "0WM7eevFEBksRV-LsxC1DtMkC1luXFvHSZnHS0r87vM",
  "xsolla_login_project_id": "dc03f347-86a4-4ee6-8cd4-5fda3b5d8574",
  "groups": [
    {
      "id": 61529,
      "name": "default",
      "is_default": true
    }
  ]
}
```

## 🔐 Безопасность

### ✅ Реализовано
- JWT токен хранится в localStorage
- Автоматическая проверка срока действия
- Верификация токена через Xsolla API
- Безопасная передача через postMessage от popup окна

### ⚠️ Рекомендации для продакшена
1. **Храните CLIENT_SECRET только на сервере!**
   - Никогда не используйте в клиентском коде
   - Обмен authorization code на access token делайте на бэкенде

2. **Используйте HTTPS**
   - В продакшене обязательно HTTPS
   - Добавьте в Redirect URI: `https://yourdomain.com`

3. **Проверяйте токен на сервере**
   - Не доверяйте клиенту
   - Проверяйте подпись JWT на бэкенде
   - Используйте публичный ключ Xsolla

4. **Refresh Token**
   - Используйте `scope: 'offline'` для получения refresh token
   - Автоматически обновляйте access token когда истекает

## 🚀 Следующие шаги

### Готово ✅
- [x] Базовая авторизация через Xsolla
- [x] Три метода входа
- [x] Проверка токена
- [x] Профиль пользователя в игре
- [x] API для сохранения/загрузки прогресса

### В разработке 🔄
- [ ] Обмен authorization code на access token (бэкенд)
- [ ] Refresh token механизм
- [ ] Сохранение прогресса автоматически каждые 5 минут
- [ ] Синхронизация инвентаря с Xsolla Store
- [ ] Покупки через Xsolla Payment Station

### Планируется 📋
- [ ] Social login (Google, Steam, Discord)
- [ ] Friends list
- [ ] Leaderboards
- [ ] Achievements

## 📚 Полезные ссылки

- [Xsolla Login Documentation](https://developers.xsolla.com/login-api/)
- [OAuth 2.0 Setup Guide](https://developers.xsolla.com/doc/login/how-to/)
- [JWT Token Reference](https://jwt.io/)
- [Publisher Account](https://publisher.xsolla.com/)

## 🐛 Troubleshooting

### Токен не сохраняется
- Проверьте что `onLogin()` вызывается после получения токена
- Откройте DevTools → Application → Local Storage
- Убедитесь что ключ `game_user_data` присутствует

### Токен истекает сразу
- Проверьте системное время
- JWT содержит `exp` (expiration) в Unix timestamp
- По умолчанию токены Xsolla действуют 24 часа

### API запросы не работают
- Проверьте CORS настройки
- Убедитесь что используете Bearer токен: `Authorization: Bearer {token}`
- Проверьте что LOGIN_ID корректный в `.env.local`

### Cloud save не работает
- Убедитесь что пользователь вошел через Xsolla (не Guest)
- Проверьте что `xsollaToken` присутствует в `userData`
- Откройте Network tab и проверьте статус запросов к Xsolla API
