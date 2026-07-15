# Technical Specification - Crop Diary Feature (Crop Diary Spec)

## 1. Crop Diary Listing
*   **Route:** `app/(tabs)/diary.tsx`
*   **Overview:** Lists all active and archived agricultural cycles.
*   **Key APIs:**
    *   `GET /diaries`: Retrieves a list of all diaries. Lọc trạng thái (Active vs Archived) is handled client-side or server-side.
*   **UI Layout:** 
    *   Displays cards showing the Crop Type, Plot Name, Start Date, and an indicator badge for active/complete status.

## 2. Start a New Vụ Mùa (Create Diary)
*   **Route:** `app/diary/create.tsx`
*   **Overview:** Configures a new crop cycle for a specific plot.
*   **Key APIs:**
    *   `GET /plots`: Populates the plot dropdown.
    *   `POST /diaries`: Creates the crop cycle.
*   **Parameters:**
    ```json
    {
      "plot_id": "string (MongoId)",
      "crop_type": "string (e.g. Lúa, Cà chua)",
      "start_date": "string (YYYY-MM-DD)"
    }
    ```

## 3. Diary Timeline & History (Diary Detail)
*   **Route:** `app/diary/[id].tsx`
*   **Overview:** Renders a vertical timeline showing all logs recorded during the crop cycle.
*   **Key APIs:**
    *   `GET /diaries/:id`: Gets crop cycle metadata.
    *   `GET /diaries/:id/logs`: Retrieves the historical log list.
    *   `POST /diaries/:id/logs`: Appends a new activity log.
    *   `PATCH /diaries/:id/complete`: Marks the crop cycle as archived/complete.
*   **Timeline Logs:**
    *   Activity logs can be categorized (e.g., watering, fertilizing, weeding, spraying, harvesting) and display specific icon identifiers.
