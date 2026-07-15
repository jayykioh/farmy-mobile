# Technical Specification - System Blueprint (Blueprint Spec)

## 1. Data Flow Architecture
```
[Giao diện Màn hình (UI)] 
    ↓ calls
[React Custom Hooks (src/hooks/)] 
    ↓ calls
[Axios Client (src/api/client.ts)] 
    ↓ sends HTTP Request
[Backend Server (NestJS)]
```

## 2. Core Modules Architecture
*   **Authentication Module:** `login.tsx` -> `authStore` -> `AsyncStorage` -> Navigation routing.
*   **Diary Module:** `diary.tsx` -> `useDiaryDetail` -> `[id].tsx` (Timeline logs display).
*   **AI Scan Module:** `scan.tsx` -> `Camera/Picker` -> `FormData` -> `/plant-scan/analyze`.
*   **AI Chat Module:** `chat.tsx` -> `react-native-sse` -> `chatService.stream`.
*   **Shop Module:** `shop.tsx` -> `usePetStatus` -> Buy/Equip items payload.
