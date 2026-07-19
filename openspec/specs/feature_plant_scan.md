# Technical Specification - AI Crop Disease Scan (Plant Scan Spec)

## 1. Overview
*   **Route:** `app/scan.tsx`
*   **Overview:** Incorporates real-time camera capture and gallery picking to analyze plant diseases using a backend computer vision model.

## 2. Technical Workflow
*   **Step 1: Capture & Selection:**
    *   Uses `expo-camera` to render a native camera viewfinder. Includes a custom overlay UI directing the user to frame the plant leaf.
    *   Uses `expo-image-picker` as a fallback, opening the local device gallery using:
        `ImagePicker.launchImageLibraryAsync()`
*   **Step 2: Payload Construction & Upload:**
    *   Creates a `FormData` object containing the file URI, type, and name:
        ```typescript
        const formData = new FormData();
        formData.append('image', {
          uri: photoUri,
          name: 'scan.jpg',
          type: 'image/jpeg',
        } as any);
        ```
    *   Submits a multipart request via Axios:
        `POST /plant-scans`
*   **Step 3: AI Diagnosis Presentation:**
    *   The backend responds with analysis data. The UI presents:
        *   Detected disease name.
        *   Confidence percentage badge.
        *   Detailed symptoms listing.
        *   Proposed treatments:
            *   **Organic:** Eco-friendly biological control suggestions.
            *   **Chemical:** Pesticide application guidance for severe infections.
*   **Dependencies:** `expo-camera`, `expo-image-picker`, `axios`
