# Настройка Xsolla Auth

## Быстрый старт

### 1. Регистрация в Xsolla

1. Перейдите на https://publisher.xsolla.com/
2. Зарегистрируйтесь или войдите в аккаунт
3. Создайте новый проект

### 2. Настройка Login Project

1. В Publisher Account перейдите в **Players > Login**
2. Нажмите **Create Project** (если еще не создан)
3. Скопируйте **Login Project ID** из Dashboard

### 3. Получение OAuth 2.0 Client ID

1. Перейдите в **Players > Login > Security > OAuth 2.0**
2. Нажмите **Add client** или используйте существующий
3. Скопируйте **Client ID**

### 4. Настройка Redirect URLs

В настройках OAuth 2.0 Client добавьте:

**Callback URLs:**
- `http://localhost:3000` (для разработки)
- `https://yourdomain.com` (для продакшена)

**Allowed Origins (CORS):**
- `http://localhost:3000`
- `https://yourdomain.com`

### 5. Настройка проекта

1. Скопируйте `.env.example` в `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Откройте `.env.local` и вставьте ваши данные:
   ```env
   NEXT_PUBLIC_XSOLLA_PROJECT_ID=ваш_project_id
   NEXT_PUBLIC_XSOLLA_CLIENT_ID=ваш_client_id
   ```

3. Перезапустите dev сервер:
   ```bash
   pnpm dev
   ```

## Проверка работы

1. Откройте http://localhost:3000
2. На вкладке **Xsolla Auth** должно появиться:
   - ✓ "Xsolla SDK готов к работе"
   - Активная кнопка "🔐 Войти через Xsolla"
3. При клике откроется окно входа Xsolla
4. После успешного входа данные пользователя сохранятся

## Без настройки Xsolla

Если Xsolla не настроен, вы всё равно можете использовать:
- **Xsolla ID** - вход по ID (симуляция)
- **Гость** - простой вход без регистрации

## Типы аутентификации

### 1. Xsolla Auth (официальный)
- Полная интеграция с Xsolla Login
- Требует PROJECT_ID и CLIENT_ID
- Безопасный OAuth 2.0 flow
- Данные пользователя: username, email, token

### 2. Xsolla ID (упрощенный)
- Вход по Xsolla User ID
- Не требует PROJECT_ID
- Подходит для тестирования
- TODO: добавить проверку ID через API

### 3. Guest (гостевой)
- Вход только с именем
- Данные хранятся локально в браузере
- Быстрый старт без регистрации

## Структура UserData

```typescript
interface UserData {
  username: string;      // Имя пользователя
  email: string;         // Email
  authType: AuthType;    // 'xsolla' | 'xsolla-id' | 'guest'
  xsollaToken?: string;  // Токен (только для xsolla)
}
```

## Troubleshooting

### Xsolla SDK не загружается

**Проблема:** Кнопка остается неактивной

**Решение:**
1. Проверьте консоль браузера (F12)
2. Убедитесь, что нет блокировки CORS
3. Проверьте подключение к интернету
4. Попробуйте другой браузер

### Ошибка "Invalid redirect URI"

**Проблема:** После входа возникает ошибка redirect

**Решение:**
1. В Xsolla Publisher Account проверьте Callback URLs
2. Добавьте `http://localhost:3000` в список разрешенных
3. Убедитесь, что URL совпадает полностью (с/без trailing slash)

### Окно входа не открывается

**Проблема:** При клике ничего не происходит

**Решение:**
1. Проверьте, что PROJECT_ID и CLIENT_ID указаны правильно
2. Убедитесь, что popup не блокируется браузером
3. Проверьте настройки безопасности браузера

## Полезные ссылки

- [Xsolla Publisher Account](https://publisher.xsolla.com/)
- [Xsolla Login Documentation](https://developers.xsolla.com/doc/login/)
- [Xsolla API Reference](https://developers.xsolla.com/api/login/)

## Поддержка

Если возникли проблемы:
1. Проверьте логи в консоли браузера
2. Используйте альтернативный вход (Guest)
3. Обратитесь в поддержку Xsolla
