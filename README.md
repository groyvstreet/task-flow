# TaskFlow

Internal productivity tool for field employees — create, plan, track, and review daily work tasks with locations, attachments, status changes, and action history.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Expo SDK 56 + React Native** | Fast development, APK-ready, TypeScript support |
| Architecture | **Feature-Sliced Design (FSD)** | Clear separation: entities → features → screens |
| State | **MobX** | Simple reactive stores, minimal boilerplate for local-first CRUD |
| Local storage | **AsyncStorage** | Lightweight persistence for tasks, history, attachments metadata |
| Sync (dev) | **json-server** | Mock REST API for offline/online sync demo |
| Sync (prod) | **Firebase REST via axios** | HTTP layer ready; uncomment calls in `src/entities/*/api/service.ts` |
| UI | **React Native StyleSheet** | Custom teal/slate theme via `useThemeColors`, light/dark |
| Maps | **react-native-maps** | Task location markers with callout → detail navigation |
| Notifications | **expo-notifications** | Local reminders 30 min before due date + demo mode |

## Features

- **Tasks** — create/edit with title, description, due date, location, attachments, status
- **Validation** — required fields, future due date on create, user-friendly error messages
- **Sorting** — by date added, due date, or status (tap again to reverse)
- **Map** — tasks with coordinates shown as markers; tap callout to open details
- **History** — global activity log (create, edit, status, attachments, sync events)
- **Attachments** — images and PDFs; graceful handling of missing files
- **Notifications** — 30 min before due; fallback to 1 min if due sooner; demo button (~45 s)
- **Offline-first** — all data in AsyncStorage; sync when network returns
- **Sync status** — Pending Sync / Synced / Sync Failed badges on tasks
- **Theme** — light/dark toggle persisted locally

## Project Structure

```
app/                    # Expo Router routes
  (tabs)/               # Tasks | Map | History tabs
  [taskId].tsx          # Task detail screen
src/
  entities/             # task, action, attachment (model + api + ui)
  features/             # task-adding, task-updating, sync, theme, map, sorting
  screens/              # page compositions
  shared/               # api, lib, ui utilities
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start mock REST server (separate terminal)

```bash
npm run mock-server
```

Runs json-server on `http://0.0.0.0:3000`. The app uses `http://10.0.2.2:3000` for Android emulator (configured in `src/shared/api/config.ts`).

For a physical device, change `MOCK_BASE_URL` to your machine's LAN IP, e.g. `http://192.168.1.10:3000`.

### 3. Start the app

```bash
npx expo start
```

Press `a` for Android emulator or scan QR for device.

### 4. Build APK (development build)

```bash
npx expo run:android
```

## Mock Server & Sync

**Conflict resolution: last-write-wins (LWW)**

- Local tasks with `syncStatus: pending` are never overwritten by server pull
- Once synced, the record with the newer `updatedAt` wins
- Deletes are queued in `deletedTaskIds` and propagated on next sync

**Sync flow:**

1. Push pending task updates (`PUT /tasks/:id`)
2. Push deleted task IDs (`DELETE /tasks/:id`)
3. Push unsynced actions (`POST /actions`)
4. Push attachments metadata (`PUT /attachments/:id`)
5. Pull server tasks and merge

Tap **Sync** on the Tasks screen or wait for auto-sync when network reconnects.

## Notifications

Reminders in this app are **local notifications** via `expo-notifications` (scheduled on-device). They do **not** require Firebase.

- **Production:** scheduled 30 minutes before due date/time
- **Fallback:** if due in less than 30 but more than 1 minute → reminder 1 minute before due
- **Too soon:** if due in ≤ 1 minute → no notification; user sees an alert explaining why
- **Demo mode:** on task detail, tap **Demo notify** → fires in ~45 seconds (for video demo)
- **Tap notification:** opens the related task detail screen

> On Android emulator / Expo Go, local notifications can be unreliable. Prefer a **development build** (`npx expo run:android`) and grant notification permission when prompted.

## What you must configure yourself

### 1. Google Maps API key (required for Map tab on Android)

Without a key, Android may crash or show a blank map when opening the Map tab. The app catches crashes and shows a location list fallback, but a real map needs:

1. Create a key in [Google Cloud Console](https://console.cloud.google.com/) with **Maps SDK for Android** (and iOS if needed)
2. Put it in `app.json`:
   - `expo.android.config.googleMaps.apiKey`
   - `expo.ios.config.googleMapsApiKey`
3. Rebuild native app (config plugins are not hot-reloaded):

```bash
npx expo prebuild --clean
npx expo run:android
```

### 2. Mock server / device networking

- Emulator: default `http://10.0.2.2:3000` in `src/shared/api/config.ts` is fine
- Physical device: set `MOCK_BASE_URL` to your PC LAN IP, e.g. `http://192.168.1.10:3000`
- Run `npm run mock-server` before testing Sync

### 3. Firebase Realtime Database (data sync later)

Axios HTTP layer is ready but commented out:

1. Create a Firebase Realtime Database
2. Set `FIREBASE_BASE_URL` in `src/shared/api/config.ts`
3. Set `USE_MOCK_SERVER: false`
4. Uncomment axios calls in:
   - `src/entities/task/api/service.ts`
   - `src/entities/action/api/service.ts`
   - `src/entities/attachment/api/service.ts`

### 4. Firebase Cloud Messaging (only for remote push)

**Not required for this assignment’s local reminders.** Use FCM only if you later want server-triggered pushes:

1. Firebase project → Cloud Messaging
2. Android: add `google-services.json`, configure Expo notifications credentials / EAS
3. iOS: APNs key + Firebase iOS app
4. Rebuild the native binary

Local demo/due reminders already work without FCM.

## Sample Data

`db.json` ships empty. After creating tasks in the app and syncing, it will populate automatically. You can also seed manually:

```json
{
  "tasks": [
    {
      "id": "sample-1",
      "creationDate": 1700000000000,
      "updatedAt": 1700000000000,
      "title": "Inspect HVAC unit",
      "description": "Annual maintenance check",
      "dueDate": 1735689600000,
      "location": { "address": "123 Main St, New York", "latitude": 40.7128, "longitude": -74.006 },
      "status": "new",
      "syncStatus": "synced"
    }
  ],
  "actions": [],
  "attachments": []
}
```

## License

See [LICENSE](LICENSE).
