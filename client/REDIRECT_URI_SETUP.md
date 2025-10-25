# 🔧 Настройка Redirect URI в Xsolla Publisher Account

## ⚠️ ВАЖНО! Без этой настройки авторизация не будет работать!

После входа пользователь должен вернуться на вашу callback страницу. Для этого нужно добавить Redirect URI в Publisher Account.

## 📝 Пошаговая инструкция

### 1. Откройте Publisher Account
Перейдите по ссылке:
```
https://publisher.xsolla.com/846471/projects/295131/login/dc03f347-86a4-4ee6-8cd4-5fda3b5d8574/settings/oauth2
```

Или вручную:
1. Зайдите на [publisher.xsolla.com](https://publisher.xsolla.com/)
2. Выберите ваш проект "I was reincarnated in another world..."
3. Перейдите в **Players → Login**
4. Выберите **Security → OAuth 2.0**

### 2. Найдите OAuth 2.0 Client с ID: 14057

### 3. Добавьте Redirect URI

В поле **Redirect URIs** добавьте:

**Для разработки (localhost):**
```
http://localhost:3000/xsolla-callback.html
```

**Для продакшена (после деплоя):**
```
https://yourdomain.com/xsolla-callback.html
```

### 4. Сохраните изменения

Нажмите **Save** или **Сохранить**.

## ✅ Проверка настройки

После добавления Redirect URI:

1. Откройте ваше приложение: `http://localhost:3000`
2. Нажмите **"Войти через Xsolla OAuth 2.0"**
3. Откроется popup окно с формой входа
4. Введите email и код подтверждения
5. После успешного входа popup автоматически закроется
6. Вы увидите профиль пользователя в правом верхнем углу

## 🔍 Troubleshooting

### Ошибка "Redirect URI mismatch"
- Убедитесь что URL точно совпадает (включая http/https)
- Проверьте отсутствие лишних слешей в конце
- Callback URL должен быть: `http://localhost:3000/xsolla-callback.html`

### Popup окно не закрывается
1. Откройте DevTools в popup окне (F12)
2. Посмотрите консоль на ошибки
3. Проверьте что URL содержит `?token=...`
4. Проверьте что `window.opener` доступен

### Токен не передается в главное окно
1. Откройте DevTools в главном окне
2. Должно быть сообщение: "Message from popup: ..."
3. Проверьте что origin разрешен в `handleMessage`

### Fallback не работает
- Проверьте localStorage: Application → Local Storage → `xsolla_temp_token`
- Проверьте консоль на ошибки декодирования токена

## 📚 Дополнительные Redirect URIs

Если вы используете разные порты для разработки:

```
http://localhost:3000/xsolla-callback.html
http://localhost:3001/xsolla-callback.html
http://127.0.0.1:3000/xsolla-callback.html
```

## 🚀 Production Setup

Перед деплоем на продакшен:

1. **Добавьте production URL:**
   ```
   https://yourdomain.com/xsolla-callback.html
   ```

2. **Обновите .env.production:**
   ```bash
   NEXT_PUBLIC_XSOLLA_PROJECT_ID=295131
   NEXT_PUBLIC_XSOLLA_LOGIN_ID=dc03f347-86a4-4ee6-8cd4-5fda3b5d8574
   NEXT_PUBLIC_XSOLLA_CLIENT_ID=14057
   ```

3. **НЕ добавляйте CLIENT_SECRET в frontend!**
   - Используйте только на backend для обмена code на token

## 📞 Поддержка

Если проблема не решается:
- [Xsolla Support](https://xsolla.com/support)
- [Developer Documentation](https://developers.xsolla.com/)
- [Community Forum](https://community.xsolla.com/)
