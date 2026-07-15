# Technical Specification - Mascot Pet & Shop (Mascot Pet Spec)

## 1. Mascot Pet Dashboard Widget
*   **Routes:** `app/(tabs)/home.tsx` (Widget), `app/(tabs)/profile.tsx` (Level Progress)
*   **Overview:** Integrates a gamified digital companion "Bé Thóc" to represent the farmer's progress. XP earned from recording logs and completing chores levels up the mascot.
*   **Metrics & Calculations:**
    *   `level` (Cấp độ): Current pet level.
    *   `exp` (Kinh nghiệm): Current XP.
    *   `Max_XP = level * 100`.
    *   `progress` (Thanh tiến trình) = `Math.min((exp / Max_XP) * 100, 100)`.
*   **Key APIs:**
    *   `GET /pets/status`: Returns current level, experience points, and equipped apparel IDs.

## 2. Mascot Clothing Shop
*   **Route:** `app/shop.tsx`
*   **Overview:** Allows users to spend accumulated currency or XP to customize the appearance of their mascot.
*   **Key APIs:**
    *   `GET /shop/items`: Retrieves lists of available apparel items (Hats, Shirts, Glasses) grouped by category.
    *   `POST /shop/purchase`: Deducts currency/XP to unlock an item.
    *   `POST /shop/equip`: Toggles the active status of an owned item on the mascot.
*   **Interactive Shop Preview:**
    *   Selecting an item in the shop updates the local state immediately, allowing users to preview what "Bé Thóc" looks like with the outfit before deciding to buy or equip.
