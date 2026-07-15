# Technical Specification - Maintenance Reminders (Reminder Spec)

## 1. Task Reminders List
*   **Route:** `app/reminders.tsx`
*   **Overview:** Provides a daily chore scheduler for agricultural activities (Watering, Fertilizing, Weeding, Spraying).
*   **Key APIs:**
    *   `GET /reminders`: Returns the list of scheduled reminders.
*   **UI Layout:**
    *   Groups reminders by day (Today vs Future). Displays tasks in a checkbox list format, color-coded by the task type (e.g., blue for watering, brown for fertilizing).

## 2. Check-off Chores
*   **Overview:** Allows users to mark a task as completed directly on the UI, which updates their progress and awards them points.
*   **Key APIs:**
    *   `PATCH /reminders/:id/complete`: Updates the status of the reminder to complete.
*   **Workflow:**
    1.  User clicks the checkbox next to a reminder task.
    2.  An API call is dispatched asynchronously.
    3.  On success, the local UI state is updated (strike-through style applied to the text).
    4.  Pet XP is incremented dynamically if a level-up occurs.
