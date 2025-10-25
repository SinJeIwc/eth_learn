# Важные настройки OAuth 2.0 в Xsolla Publisher Account

## Необходимые действия

### 1. Настройте OAuth 2.0 Client

В **Publisher Account → Players → Login → Security → OAuth 2.0**:

**При создании/редактировании OAuth 2.0 client укажите:**

#### Redirect URIs (обязательно!):
```
http://localhost:3000
https://localhost:3000
```

Для продакшена также добавьте:
```
https://yourdomain.com
```

#### Client Name:
```
Farm Game Client
```

#### Authentication Type:
Выберите **Public** (для web-приложений)

### 2. Проверьте текущие настройки

Ваши текущие данные:
- **Project ID:** 295131
- **Client ID:** 14057

### 3. После настройки Redirect URI

1. Сохраните изменения в Publisher Account
2. Перезапустите dev сервер:
   ```bash
   pnpm dev
   ```
3. Откройте http://localhost:3000
4. Кликните на вкладку "Xsolla Auth"
5. Нажмите кнопку "🔐 Войти через Xsolla"

### 4. Что должно произойти

1. Откроется popup окно Xsolla Login
2. Вы увидите форму входа (email/password или социальные сети)
3. После успешного входа окно закроется
4. Вы будете авторизованы в приложении
5. Появится кнопка "СТАРТ" для начала игры

## Типичные ошибки

### "Invalid redirect_uri"
**Причина:** Redirect URI не добавлен в настройки OAuth 2.0 client

**Решение:** 
1. Зайдите в Publisher Account
2. Players → Login → Security → OAuth 2.0
3. Нажмите на ваш OAuth client
4. Добавьте `http://localhost:3000` в Redirect URIs
5. Сохраните

### Окно не открывается
**Причина:** Браузер блокирует popup

**Решение:**
1. Разрешите popup для localhost:3000
2. Или в Chrome: Settings → Privacy → Pop-ups and redirects → Allow

### "Xsolla SDK не инициализирован"
**Причина:** Скрипт Xsolla не загрузился

**Решение:**
1. Проверьте интернет-соединение
2. Откройте DevTools (F12) → Console
3. Проверьте ошибки загрузки
4. Перезагрузите страницу (Ctrl+R)

## Проверка конфигурации

Откройте DevTools (F12) → Console и проверьте:

```javascript
// Должно показать ваши настройки
console.log('PROJECT_ID:', '295131');
console.log('CLIENT_ID:', '14057');
```

Если всё правильно, на странице будет:
- ✓ "Xsolla SDK готов к работе" (зеленый текст)
- Активная кнопка "🔐 Войти через Xsolla"

## Следующие шаги

После успешной настройки:
1. ✅ Вход через Xsolla работает
2. ✅ Можно начать игру
3. 📝 Данные пользователя сохраняются в localStorage
4. 🔄 При обновлении страницы сессия сохраняется

## Альтернативные методы входа

Если Xsolla Auth не работает, используйте:
- **Xsolla ID** - вход по User ID (симуляция)
- **Гость** - быстрый вход без Xsolla
