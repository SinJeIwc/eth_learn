# User ID Authentication

## 🎯 **Аутентификация через User ID**

Этот метод аутентификации основан на официальной документации Xsolla и позволяет пользователям входить в игру, используя их уникальный User ID.

## 🔧 **Как это работает:**

### **1. User ID Authentication Flow**
1. Пользователь вводит свой User ID из игры
2. Система проверяет User ID через webhook
3. При успешной проверке пользователь входит в игру
4. User ID связывается с аккаунтом Xsolla

### **2. Преимущества User ID аутентификации:**
- **Простота**: Пользователи используют знакомый ID из игры
- **Безопасность**: User ID должен быть уникальным
- **Интеграция**: Легко интегрируется с существующими системами
- **Персонализация**: Данные пользователя сохраняются

## 📋 **Настройка в Xsolla Publisher Account:**

### **1. Создание Login проекта**
1. Перейдите в [Publisher Account](https://publisher.xsolla.com/)
2. Создайте новый Login проект
3. Выберите "Login with linked user ID"

### **2. Настройка Webhook**
1. В настройках Login проекта добавьте URL для webhook
2. URL должен начинаться с `https://`
3. Webhook будет получать запросы для проверки User ID

### **3. Реализация Webhook на сервере**
```javascript
// Пример обработки webhook
app.post('/api/validate-user', (req, res) => {
  const { user_id } = req.body;
  
  // Проверяем User ID в базе данных
  const user = findUserById(user_id);
  
  if (user) {
    res.status(200).json({
      user_id: user.id,
      username: user.username,
      email: user.email
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});
```

## 🎮 **В игре:**

### **User Experience:**
1. **Выбор метода входа**: Пользователь видит кнопку "Вход по User ID"
2. **Ввод User ID**: Пользователь вводит свой ID из игры
3. **Проверка**: Система проверяет User ID через webhook
4. **Вход в игру**: При успешной проверке пользователь входит

### **Отображение в игре:**
- **Обычный пользователь**: "Добро пожаловать, username!"
- **User ID пользователь**: "Добро пожаловать, username! (Вход по User ID)"

## 🔒 **Безопасность:**

### **1. JWT Validation**
- Webhook получает JWT с подписью Xsolla
- JWT содержит информацию о запросе
- Время жизни JWT: 7 минут

### **2. User ID Requirements**
- User ID должен быть уникальным
- Минимум 3 символа
- Рекомендуется использовать UUID или числовой ID

### **3. Webhook Security**
- Используйте HTTPS для webhook URL
- Проверяйте JWT подпись
- Валидируйте входящие данные

## 📊 **JWT Claims:**

| Claim | Type | Description |
|-------|------|-------------|
| exp | Unix Timestamp | Время истечения JWT (7 минут) |
| iat | Unix Timestamp | Время создания JWT |
| iss | string | Сервис: https://login.xsolla.com |
| request_type | string | Тип запроса: gateway_request |
| xsolla_login_project_id | string | ID Login проекта |
| social_access_token | string | Токен социальной сети (опционально) |

## 🚀 **Интеграция с игрой:**

### **1. Получение User ID**
```javascript
// В игре получаем User ID пользователя
const userId = getCurrentUserID();
```

### **2. Передача в Web Shop**
```javascript
// Передаем User ID в Web Shop
const webShopUrl = `https://yourshop.com?user_id=${userId}`;
```

### **3. Обработка в Web Shop**
```javascript
// В Web Shop получаем User ID из URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
```

## 📋 **Чек-лист настройки:**

- [ ] Создан Login проект в Publisher Account
- [ ] Настроен "Login with linked user ID"
- [ ] Добавлен webhook URL для проверки User ID
- [ ] Реализован webhook на сервере
- [ ] Настроена проверка JWT подписи
- [ ] Протестирована аутентификация
- [ ] Настроена интеграция с игрой

## 🎯 **Рекомендации:**

1. **Используйте уникальные User ID**: UUID или числовые ID
2. **Настройте HTTPS**: Обязательно для webhook
3. **Валидируйте данные**: Проверяйте входящие User ID
4. **Логируйте запросы**: Для отладки и мониторинга
5. **Тестируйте webhook**: Используйте sandbox режим

## 🔗 **Полезные ссылки:**

- [Xsolla Publisher Account](https://publisher.xsolla.com/)
- [Официальная документация](https://developers.xsolla.com/solutions/web-shop/create-web-shop/set-up-authentication/)
- [JWT Documentation](https://jwt.io/)

User ID аутентификация готова к использованию! 🚀
