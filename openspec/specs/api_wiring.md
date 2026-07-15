# Technical Specification - API Integration & Middleware (API Wiring)

## 1. Network Client Configuration
*   **Source File:** `src/api/client.ts`
*   **Description:** Configures an `axios` instance for managing connections to the NestJS backend.
*   **Dynamic Base URL Configuration:**
    *   Reads `EXPO_PUBLIC_API_URL` dynamically from the environment.
    *   `const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.203:3000/api/v1';`

## 2. Authentication Middleware (Interceptors)
*   **Request Interceptor:** Dynamically attaches JWT credentials to outbound requests:
    ```typescript
    api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    ```
*   **Token Persistence:** Leverages `@react-native-async-storage/async-storage` for offline session persistence.

## 3. Session Bootstrapping
*   **Location:** `app/_layout.tsx`
*   **Process:** On app load, `checkAuth()` checks if a token is present in AsyncStorage. If present, it validates the token by calling `GET /auth/me`. If successful, the store updates state, and the app routes to `/(tabs)/home`. If the token is invalid or missing, the session is cleared, and the user is redirected to `/(auth)/welcome`.
