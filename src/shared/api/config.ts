export const API_CONFIG = {
    /** Firebase Realtime Database REST API — configure when ready */
    FIREBASE_BASE_URL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
    /**
     * Mock json-server for development and demo.
     * Android emulator: 10.0.2.2 maps to host localhost.
     * Physical device: use your machine LAN IP.
     */
    MOCK_BASE_URL: 'http://10.0.2.2:3000',
    /** Use mock server for active sync (set false when Firebase is configured) */
    USE_MOCK_SERVER: true,
    TIMEOUT_MS: 10000,
} as const;
