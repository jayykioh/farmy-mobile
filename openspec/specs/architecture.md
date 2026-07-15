# Technical Specification - App Architecture (Architecture Spec)

## 1. Directory Structure
*   `app/`: File-based Routing pages (Expo Router).
    *   `(auth)/`: Onboarding screens, credentials login/register, and Google OAuth setup.
    *   `(tabs)/`: Layout containing navigation tabs:
        *   `home.tsx`: Mascot interaction and weather metrics.
        *   `diary.tsx`: Crop cycles list.
        *   `chat.tsx`: AI Chat client.
        *   `profile.tsx`: Level overview, badges shelves, settings list.
    *   `diary/`: Subpages for adding activities and view timeline.
    *   `profile/`: Subpages containing personal account info.
*   `src/`: App logical foundations.
    *   `api/`: Network client definitions.
    *   `components/`: Reusable native UI components (Button, Input, PageHeader).
    *   `hooks/`: Hook-based APIs (useDiary, usePet, useChat).
    *   `store/`: Zustand global states (authStore).
    *   `theme/`: Curated HSL colors (`colors.ts`) and typography presets (`typography.ts`).

## 2. State Architecture
*   **Local State:** React `useState` hooks manage transient UI state (e.g., input values, loading status).
*   **Global State:** **Zustand** stores handle cross-page variables. `useAuthStore` manages authentication states and token bindings.
*   **API State:** React Custom Hooks wrap asynchronous endpoints, maintaining request states (loading, success, error, refetch).

## 3. Native Layouts & Navigation
*   **Expo Router:** Leverages file hierarchy to generate routes.
*   **Stack Navigation:** Layered screen transitions (e.g. going from tabs to subpages like `diary/[id]`).
*   **Tab Navigation:** Standardized platform navigation using a bottom tab bar with Lucide icon overlays.
