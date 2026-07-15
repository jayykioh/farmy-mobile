# Technical Specification - AI Assistant Chat (AI Chat Spec)

## 1. Overview
*   **Route:** `app/(tabs)/chat.tsx`
*   **Overview:** Provides a real-time conversational interface with "Bé Thóc", the AI agricultural assistant, leveraging Server-Sent Events (SSE) for streaming message delivery.

## 2. Real-time Streaming Integration (SSE)
*   **Workflow:**
    1.  User enters a query (e.g., "Trồng lúa như thế nào?") and taps send.
    2.  The client immediately appends the user's message to the UI state and generates a unique client-side message ID using the format:
        `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
    3.  A connection is established using `EventSource` from `react-native-sse` to:
        `GET /chat/stream/events?message=<Encoded_Query>&client_message_id=<Client_Message_ID>&session_id=<Session_ID>`
        *   `Authorization: Bearer <token>` is added in connection headers.
    4.  The system listens for streamed events:
        *   `meta`: Contains session metadata. Saves `session_id` to local state for maintaining chat context.
        *   `token`: Contains incremental token chunks (`delta`). Appends incoming text to the current bot message in the UI, creating a typing typewriter effect.
        *   `done`: Closes the SSE connection and hides the typing indicator.
        *   `error`: Triggered during network disruptions; closes the connection and displays an alert.
*   **UI Components:**
    *   `KeyboardAvoidingView` with `Platform.OS === 'ios' ? 'padding' : 'height'` for smooth keyboard input handling.
    *   `FlatList` of messages with automatic scrolling.
    *   Message bubble components styled with background colors based on the sender: assistant (green tint `#f1fcf1`) vs user (solid primary `#08a855`).
*   **Dependencies:** `react-native-sse`, `lucide-react-native`
