# Xsolla Login Setup Guide

## 🎯 **Настройка Xsolla Login в Publisher Account**

### **Шаг 1: Создание Login проекта**

1. **Войдите в Xsolla Publisher Account**
   - Перейдите на [publisher.xsolla.com](https://publisher.xsolla.com/)
   - Войдите в свой аккаунт

2. **Создайте новый проект или выберите существующий**
   - Нажмите "Create Project" или выберите существующий
   - Выберите тип проекта: **"Standard Login project"**

3. **Настройте базовую информацию проекта**
   - **Project Name**: "Eth Learn Game" (или любое другое название)
   - **Description**: "Authorization for Eth Learn Game"
   - **Platform**: Web

### **Шаг 2: Настройка Login Widget**

1. **Перейдите в настройки Login Widget**
   - В меню проекта выберите "Login Widget"
   - Нажмите "Configure"

2. **Выберите типы авторизации**

#### **A. Classic Login (Рекомендуется)**
- ✅ **Email/Password**: Пользователи входят по email и паролю
- ✅ **Username/Password**: Пользователи входят по имени и паролю
- ✅ **Phone/Password**: Пользователи входят по телефону и паролю

#### **B. Passwordless Login (Опционально)**
- ✅ **Magic Link**: Вход по ссылке в email
- ✅ **SMS Code**: Вход по SMS коду
- ✅ **Email Code**: Вход по коду из email

#### **C. Social Login (Опционально)**
- ✅ **Google**: Вход через Google
- ✅ **Facebook**: Вход через Facebook
- ✅ **Steam**: Вход через Steam
- ✅ **Discord**: Вход через Discord

### **Шаг 3: Настройка доменов**

1. **Добавьте разрешенные домены**
   - **Development**: `http://localhost:3000`
   - **Production**: `https://yourdomain.com`
   - **Staging**: `https://staging.yourdomain.com`

2. **Настройте Callback URLs**
   - **Success URL**: `http://localhost:3000` (для разработки)
   - **Error URL**: `http://localhost:3000/error`

### **Шаг 4: Получение Project ID**

1. **Найдите Project ID**
   - В настройках проекта найдите "Project ID"
   - Скопируйте этот ID (например: `12345`)

2. **Настройте переменные окружения**
   - Создайте файл `client/.env.local`:
   ```bash
   NEXT_PUBLIC_XSOLLA_PROJECT_ID=ваш_project_id_здесь
   ```

### **Шаг 5: Настройка пользовательских данных**

1. **Выберите данные для сбора**
   - ✅ **Username**: Имя пользователя
   - ✅ **Email**: Email адрес
   - ✅ **Avatar**: Аватар пользователя
   - ✅ **Country**: Страна
   - ✅ **Language**: Язык

2. **Настройте поля профиля**
   - Какие поля обязательны
   - Какие поля опциональны
   - Валидация данных

## 🔧 **Конфигурация для вашего проекта**

### **Рекомендуемые настройки:**

```typescript
// client/.env.local
NEXT_PUBLIC_XSOLLA_PROJECT_ID=ваш_реальный_project_id

// Настройки в Xsolla Publisher Account:
// - Classic Login: Email/Password + Username/Password
// - Social Login: Google, Steam (опционально)
// - Domains: localhost:3000, yourdomain.com
// - User Data: Username, Email, Avatar
```

### **Типы Login проектов:**

#### **Standard Login Project (Рекомендуется)**
- ✅ Полный контроль над пользователями
- ✅ Собственная база данных пользователей
- ✅ Гибкие настройки авторизации
- ✅ Поддержка всех типов входа

#### **Shadow Login Project (Для платформ)**
- Используется если игра распространяется через:
  - Steam
  - Epic Games Store
  - PlayStation Store
  - Xbox Store
- Хранит аккаунты конкретной платформы

## 🚀 **Тестирование интеграции**

### **После настройки:**

1. **Перезапустите приложение**
   ```bash
   cd client
   npm run dev
   ```

2. **Проверьте консоль браузера**
   - Откройте DevTools (F12)
   - Посмотрите на сообщения о загрузке Xsolla

3. **Протестируйте вход**
   - Нажмите "Войти через Xsolla"
   - Должен открыться Xsolla Login Widget
   - Попробуйте зарегистрироваться и войти

### **Если что-то не работает:**

1. **Проверьте Project ID**
   ```typescript
   // В консоли браузера:
   console.log('Xsolla Project ID:', process.env.NEXT_PUBLIC_XSOLLA_PROJECT_ID);
   ```

2. **Проверьте домены в Xsolla**
   - Убедитесь, что `localhost:3000` добавлен в разрешенные домены

3. **Проверьте настройки проекта**
   - Убедитесь, что Login Widget включен
   - Проверьте выбранные типы авторизации

## 📋 **Чек-лист настройки:**

- [ ] Создан проект в Xsolla Publisher Account
- [ ] Выбран тип "Standard Login project"
- [ ] Настроены типы авторизации (Classic Login)
- [ ] Добавлены разрешенные домены
- [ ] Получен Project ID
- [ ] Создан файл `.env.local` с Project ID
- [ ] Перезапущено приложение
- [ ] Протестирован вход через Xsolla

## 🎯 **Следующие шаги:**

1. **Настройте Xsolla Login** по этому руководству
2. **Получите Project ID** из Publisher Account
3. **Обновите `.env.local`** с реальным Project ID
4. **Протестируйте интеграцию**

После настройки Xsolla будет работать вместо fallback системы!
