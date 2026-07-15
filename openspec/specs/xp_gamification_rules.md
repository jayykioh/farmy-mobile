# Technical Specification - Gamification & XP Rules (XP Rules Spec)

## 1. XP Rewarding System
*   XP (Experience Points) are awarded when farmers perform daily husbandry activities to incentivize app engagement:
    *   **Add Activity Log:** +10 XP for recording a chore on a crop timeline (e.g. Watering, Fertilizing).
    *   **Complete Reminder:** +20 XP for checking off a reminder task.
    *   **Harvest / Complete Crop Cycle:** +100 XP for archiving a finished crop diary.

## 2. Mascot Level Scaling Formula
*   The XP required to reach the next level scales linearly:
    *   `Max_XP = Current_Level * 100`
*   Examples:
    *   Level 1: Requires 100 XP to level up.
    *   Level 2: Requires 200 XP to level up.
*   Upon hitting the threshold, the backend calculates the overflow XP and carries it over to the next level.

## 3. Shop Purchase and Equipment Logic
*   **Currency:** Users can use their accumulated experience points or specific points as currency.
*   **Pricing Tiers:**
    *   Glasses: 150 points.
    *   Straw Hats: 100 points.
    *   Shirts: 200 points.
*   Purchased items are permanently bound to the user's inventory. Equipped items update the Mascot Pet status immediately, and the changes are pushed to the backend server.
