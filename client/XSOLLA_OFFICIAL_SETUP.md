# Xsolla Login Widget - Official SDK Integration

## 🎯 **Официальная интеграция Xsolla Login Widget**

Это руководство основано на официальной документации Xsolla Login SDK для Next.js и Phaser.

## 📦 **Установка и настройка**

### **1. Настройка в Xsolla Publisher Account**

1. **Создайте Login проект**
   - Перейдите на [publisher.xsolla.com](https://publisher.xsolla.com/)
   - Войдите в Publisher Account
   - Перейдите в **Players > Login > Dashboard**
   - Создайте новый Login проект

2. **Настройте OAuth 2.0**
   - Перейдите в **Players > Login > Security > OAuth 2.0**
   - Создайте OAuth 2.0 клиент
   - Скопируйте **Client ID**

3. **Настройте Callback URLs**
   - Добавьте `http://localhost:3000` в **Callback URLs**
   - Добавьте `http://localhost:3000` в **Allowed origins (CORS)**
   - Для продакшена добавьте ваш домен

### **2. Настройка переменных окружения**

Создайте файл `client/.env.local`:

```bash
# Login Project ID from Players > Login > Dashboard
NEXT_PUBLIC_XSOLLA_PROJECT_ID=ваш_project_id

# OAuth 2.0 Client ID from Players > Login > Security > OAuth 2.0
NEXT_PUBLIC_XSOLLA_CLIENT_ID=ваш_client_id
```

### **3. Конфигурация виджета**

Наша реализация использует следующие параметры:

```typescript
const xl = new Widget({
  projectId: 'LOGIN_PROJECT_ID',        // Из Players > Login > Dashboard
  clientId: 'CLIENT_ID',                // Из Players > Login > Security > OAuth 2.0
  responseType: 'code',                 // OAuth 2.0 response type
  state: 'game_auth',                   // Custom state
  redirectUri: 'http://localhost:3000', // Redirect URI
  scope: 'openid profile email',        // OAuth scope
  preferredLocale: 'ru_RU'              // Локаль виджета
});
```

## 🔧 **Технические детали**

### **OAuth 2.0 Flow**
1. **Authorization Code Flow**: Используется `responseType: 'code'`
2. **State Parameter**: Защита от CSRF атак
3. **Scope**: Запрашиваемые разрешения (`openid profile email`)

### **Поддерживаемые локали**
- `ru_RU` - Русский
- `en_US` - Английский
- `de_DE` - Немецкий
- `fr_FR` - Французский
- `es_ES` - Испанский

### **Callback URLs**
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`
- **Staging**: `https://staging.yourdomain.com`

## 🚀 **Тестирование интеграции**

### **1. Проверьте конфигурацию**
```typescript
// В консоли браузера:
console.log('Project ID:', process.env.NEXT_PUBLIC_XSOLLA_PROJECT_ID);
console.log('Client ID:', process.env.NEXT_PUBLIC_XSOLLA_CLIENT_ID);
```

### **2. Протестируйте виджет**
1. Запустите приложение: `npm run dev`
2. Откройте `http://localhost:3000`
3. Нажмите "Войти через Xsolla"
4. Должен открыться Xsolla Login Widget

### **3. Проверьте авторизацию**
1. Зарегистрируйтесь в виджете
2. Войдите в систему
3. Проверьте, что данные пользователя сохраняются
4. Перейдите в игру

## 🔍 **Диагностика проблем**

### **Частые ошибки:**

1. **"Invalid Project ID"**
   - Проверьте правильность Project ID
   - Убедитесь, что проект активен в Publisher Account

2. **"Invalid Client ID"**
   - Проверьте правильность Client ID
   - Убедитесь, что OAuth 2.0 клиент активен

3. **"CORS Error"**
   - Добавьте `localhost:3000` в Allowed origins (CORS)
   - Проверьте настройки в Publisher Account

4. **"Invalid Redirect URI"**
   - Добавьте `http://localhost:3000` в Callback URLs
   - Проверьте точное соответствие URL

### **Проверка настроек:**
```bash
# Проверьте переменные окружения
echo $NEXT_PUBLIC_XSOLLA_PROJECT_ID
echo $NEXT_PUBLIC_XSOLLA_CLIENT_ID
```

## 📋 **Чек-лист настройки**

- [ ] Создан Login проект в Publisher Account
- [ ] Настроен OAuth 2.0 клиент
- [ ] Получены Project ID и Client ID
- [ ] Добавлены Callback URLs и CORS настройки
- [ ] Создан файл `.env.local` с правильными значениями
- [ ] Перезапущено приложение
- [ ] Протестирован вход через Xsolla

## 🎮 **Интеграция с игрой**

После успешной авторизации:
- Пользовательские данные сохраняются в localStorage
- Токен используется для API запросов
- Игра получает персонализированные данные
- Поддерживается сессия между перезагрузками

## 🔒 **Безопасность**

- **State Parameter**: Защита от CSRF
- **HTTPS Only**: В продакшене используйте HTTPS
- **Token Validation**: Автоматическая валидация токенов
- **Session Management**: Безопасное хранение сессий

## 📚 **Дополнительные ресурсы**

- [Xsolla Publisher Account](https://publisher.xsolla.com/)
- [Xsolla Login Widget Documentation](https://developers.xsolla.com/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

Интеграция готова к использованию! 🚀
