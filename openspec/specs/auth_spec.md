# Technical Specification - Authentication & Authorization (Auth Spec)

## 1. Credentials-based Authentication
*   **Routes:** `app/(auth)/login.tsx` (Login), `app/(auth)/register.tsx` (Registration)
*   **Overview:** Handles traditional login and registration workflows for farmers.
*   **Key APIs:**
    *   `POST /auth/login`: Validates email/password credentials, returns JWT `accessToken` and `user` object.
    *   `POST /auth/register`: Creates a new farmer account.
    *   `GET /auth/me`: Validates current session token and returns fresh user profile data.
*   **Workflow:**
    1.  User enters credentials into custom `Input` components (with validation for email format and password presence).
    2.  Clicking "Đăng nhập" triggers the `login` function from `useAuthStore` (Zustand).
    3.  On success, the token is written to native storage via `@react-native-async-storage/async-storage` using the key `access_token`.
    4.  The store updates `isAuthenticated = true` and `user` state, causing `_layout.tsx` to automatically redirect the user to `/(tabs)/home` via `router.replace()`.

## 2. Google OAuth 2.0 (Social Authentication)
*   **Route:** `app/(auth)/login.tsx`
*   **Overview:** Secure social login via an in-app Safari/Chrome browser session using `expo-web-browser` and deep linking redirect resolution.
*   **Dynamic Deep Linking Flow:**
    1.  The app generates a dynamic redirect URL using `Linking.createURL('oauth-callback')`.
        *   In Development (Expo Go): `exp://<LOCAL_IP>:8081/--/oauth-callback`
        *   In Production (Standalone): `farmy://oauth-callback`
    2.  The app initiates the OAuth session using:
        `WebBrowser.openAuthSessionAsync(authUrl, redirectUrl)`
        Where `authUrl` is `${api.defaults.baseURL}/auth/google?state=${encodeURIComponent(redirectUrl)}`.
    3.  The backend custom `GoogleAuthGuard` captures the `state` parameter and passes it to Google.
    4.  Google redirects back to the backend callback endpoint `/auth/google/callback?state=...`.
    5.  The backend redirect controller detects the custom mobile scheme in the `state` query parameter and redirects the browser session to:
        `<redirectUrl>?accessToken=<JWT_TOKEN>`
    6.  The OS intercepts this URI scheme, automatically dismisses the in-app browser sheet, and returns the redirect URL directly to the unresolved `openAuthSessionAsync` promise.
    7.  The app parses the `accessToken` query parameter from the returned URL, updates the authorization headers in the Axios client, calls `/auth/me` to retrieve the user's profile, saves the token to storage, and navigates to the dashboard.
*   **Dependencies:** `expo-web-browser`, `expo-linking`, `@react-native-async-storage/async-storage`, `zustand`
