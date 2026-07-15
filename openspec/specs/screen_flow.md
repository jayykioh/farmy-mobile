# Technical Specification - Screen Navigation Flow (Screen Flow Spec)

## 1. Routing Diagram

```mermaid
graph TD
    Welcome[Welcome Screen] -->|Click Login| Login[Login Screen]
    Welcome -->|Click Register| Register[Register Screen]
    
    Login -->|Login Success| Home[Home Tab]
    Register -->|Register Success| Home
    
    Home -->|Click Tab 2| DiaryList[Diary Tab]
    Home -->|Click Tab 3| Chat[Chat Tab]
    Home -->|Click Tab 4| Profile[Profile Tab]
    
    Home -->|Click Scan| Scan[Scan Screen]
    Home -->|Click Reminders| Reminders[Reminders Screen]
    Home -->|Click Shop| Shop[Shop Screen]
    
    DiaryList -->|Click Create| CreateDiary[Create Diary Screen]
    DiaryList -->|Select a Card| DiaryDetail[Diary Detail Screen]
    
    Profile -->|Click Personal Info| ProfileInfo[Profile Info Screen]
    Profile -->|Click Logout| Welcome
```
