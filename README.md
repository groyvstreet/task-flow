# TaskFlow PK-RN-2003

Мобильное приложение для полевых сотрудников: управление задачами offline-first с синхронизацией, картой, вложениями и напоминаниями.

Стек: **Expo SDK 57**, **React Native**, **MobX**, **Expo Router**, **Feature-Sliced Design**.

---

## Возможности

- Создание, редактирование и удаление задач (название, описание, срок, статус, адрес)
- Геокодинг адреса ↔ координаты через `expo-location`
- Карта с маркерами задач (`react-native-maps`)
- Вложения: фото и PDF
- Локальные уведомления за 30 минут до дедлайна
- Offline-first: данные в AsyncStorage, синхронизация при появлении сети и по кнопке Sync
- История действий (создание, правки, статусы, вложения, sync)
- Светлая / тёмная тема
- Сортировка списка задач

---

## Установка

```bash
git clone https://github.com/groyvstreet/task-flow.git
cd task-flow
npm install
```

### Development build (рекомендуется)

Перед сборкой подготовьте окружение по [официальной инструкции Expo](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build) (Android Studio, SDK, эмулятор или устройство).

Затем:

```bash
npx expo run:android
```

### Expo Go

```bash
npx expo start
```

> **Важно:** работа в Expo Go не тестировалась. Для стабильного запуска используйте development build.

---

## APK

Готовый Android-билд:

**[Скачать APK](https://expo.dev/accounts/kraken_born/projects/task-flow/builds/0f78c4d0-df43-4e70-9580-f0e7e7942de4)**

---

## Бэкенд

В качестве сервера используется **Firebase Realtime Database**. Приложение синхронизируется с ним автоматически при появлении сети и по кнопке Sync.

---

## Архитектура (Feature-Sliced Design)

Проект следует [FSD](https://feature-sliced.design/): слои снизу вверх, зависимости только «вниз».

```
task-flow/
├── app/                 # Expo Router — маршруты и layouts
└── src/
    ├── screens/         # Экраны (композиция фич и сущностей)
    ├── features/        # Пользовательские сценарии
    ├── entities/        # Бизнес-сущности
    └── shared/          # Общий код без бизнес-логики
```

### `app/`

Тонкий слой маршрутизации Expo Router:

| Путь | Назначение |
|------|------------|
| `(tabs)/index` | Список задач |
| `(tabs)/map` | Карта |
| `(tabs)/history` | История действий |
| `[taskId]` | Карточка / редактирование задачи |

### `src/screens/`

Готовые экраны: собирают UI из features и entities (`TasksScreen`, `MapScreen`, `HistoryScreen`, `TaskScreen`).

### `src/features/`

Сценарии пользователя:

| Фича | Зачем |
|------|--------|
| `task-adding` | Создание задачи |
| `task-updating` | Редактирование, статусы, удаление |
| `task-map` | Карта с маркерами и callout |
| `task-sorting` | Сортировка списка |
| `sync` | Синхронизация с сервером |
| `attachment-picker` | Выбор фото / PDF |
| `theme-toggle` | Переключение темы |

### `src/entities/`

Доменные сущности (модель, store, UI-карточки, API):

| Сущность | Зачем |
|----------|--------|
| `task` | Задачи, локальное хранилище, merge при sync |
| `action` | Журнал действий |
| `attachment` | Метаданные вложений |

### `src/shared/`

Переиспользуемый код без привязки к фичам:

| Папка | Зачем |
|-------|--------|
| `api/` | HTTP-клиенты, sync-service, конфиг Firebase |
| `lib/` | Геокодинг, уведомления, валидация, форматтеры |
| `ui/` | Общие компоненты (toast, badges, pickers) |
| `theme/` | Цвета и тема |
| `providers/` | Провайдеры приложения |

### Потоки данных

1. UI → feature/entity **MobX store** → AsyncStorage  
2. Мутации ставят `syncStatus: pending` и вызывают auto-sync  
3. `SyncStore` пушит/пуллит данные в Firebase RTDB и мержит локальное состояние  

Нативные папки `android/` / `ios/` в репозиторий не коммитятся: EAS и `expo run` генерируют их через prebuild (CNG).
