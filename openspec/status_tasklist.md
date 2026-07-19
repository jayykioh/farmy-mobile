# Farmy Mobile - Status & Multi-Dev Tasklist

Last checked: 2026-07-15

## Context Snapshot

- Framework: Expo SDK 57, Expo Router, React Native 0.86, React 19.
- API client: `src/api/client.ts`, Axios base URL from `EXPO_PUBLIC_API_URL`, JWT from `AsyncStorage` key `access_token`.
- Main specs checked: `auth_spec.md`, `api_wiring.md`, `screen_flow.md`, `feature_diary.md`, `farm_snap_spec.md`, `feature_plant_scan.md`, `ai_chat_spec.md`, `feature_pet.md`, `feature_reminder.md`, `xp_gamification_rules.md`.
- Verification run: `npx tsc --noEmit` completed with no TypeScript output/errors.
- Existing worktree notes: `app.json` and `package-lock.json` are modified; multiple `.gitkeep` files under `openspec/changes/*` are deleted. Do not revert unless owner confirms.

## Current Status

| Area | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Google login and deep linking | Mostly implemented | `app/(auth)/login.tsx`, `app/_layout.tsx`, `app.json` | Uses `expo-web-browser`, `expo-linking`, `Linking.createURL('oauth-callback')`, scheme `farmy`, token parse, `/auth/me`, `setSession`. Needs device/Expo Go smoke test. |
| JWT persistence and bootstrapping | Implemented | `src/store/authStore.ts`, `src/api/client.ts`, `app/index.tsx` | `access_token` is stored and attached by interceptor. `checkAuth()` validates `/auth/me`. |
| Profile info screen | Implemented | `app/profile/info.tsx`, `app/(tabs)/profile.tsx`, `openspec/specs/screen_flow.md` | Screen exists and profile item routes to `/profile/info`. Some labels remain English in profile settings/badges. |
| PageHeader compile fix | Implemented | `src/components/PageHeader.tsx` | `rightElement` is optional; TypeScript check passes. |
| Mobile API IP update | Not present in current worktree | `.env` | Current value is `http://192.168.1.203:3000/api/v1`, not `172.20.10.3`. |
| Diary image upload to R2 | Not present in current worktree | `app/diary/create.tsx`, `package.json` | UI still says `Hình ảnh thực tế (Mock URL)` and sets a hardcoded image URL. `expo-image-picker` is not in `package.json`. |
| Plant scan real camera/gallery | Implemented | `app/scan.tsx`, `feature_plant_scan.md`, `farm_snap_spec.md` | Code uses real camera and gallery with endpoint `/plant-scans`. |
| Diary list/detail/log create | Implemented | `src/hooks/useDiary.ts`, `app/(tabs)/diary.tsx`, `app/diary/[id].tsx`, `app/diary/create.tsx` | List/detail/log create wired. Archive uses `PUT /diaries/:id`. |
| Chat SSE | Implemented, needs backend smoke test | `src/hooks/useChat.ts`, `app/(tabs)/chat.tsx` | Matches SSE flow broadly. UI uses `ScrollView` instead of spec's `FlatList`, acceptable unless performance becomes issue. |
| Pet status and shop | Implemented | `src/hooks/usePet.ts`, `app/shop.tsx`, `feature_pet.md` | Code matches backend contract: `/pet/status` and `/shop/buy`. |
| Reminders | Implemented, still prototype UX | `app/reminders.tsx`, `feature_reminder.md` | GET/complete wired. Add button creates a mock watering reminder; should become real create flow or be hidden. |

## Parallel Tasklist

### Dev 1 - Auth & Deep Link Hardening

- [ ] Smoke test Google login in Expo Go using the backend callback flow.
- [ ] Smoke test Google login in a standalone/dev-client build using scheme `farmy://oauth-callback`.
- [ ] Verify backend returns `accessToken` query param exactly as mobile expects.
- [ ] Add clear user feedback when OAuth returns without `accessToken` or user cancels browser flow.
- [ ] Confirm `/auth/me` response shape is consistently `data.data.user` for credentials and Google login.
- [ ] Document required backend Google callback/state behavior in `openspec/specs/auth_spec.md` if backend differs.

### Dev 2 - Environment & Networking

- [ ] Decide canonical local API URL for the team: `172.20.10.3` vs current `192.168.1.203`.
- [ ] Update `.env` or create documented per-developer `.env.example` so IP changes are not committed accidentally.
- [ ] Add a short setup note for Mac/mobile LAN testing, including Expo Go and physical-device requirements.
- [ ] Verify mobile can reach backend over LAN on iOS simulator, Android emulator, and real device if available.
- [ ] Re-check backend CSRF/mobile exclusion behavior with an authenticated POST from the app.

### Dev 3 - Diary R2 Image Upload

- [ ] Install Expo SDK 57 compatible `expo-image-picker` version.
- [ ] Replace hardcoded mock image in `app/diary/create.tsx` with device gallery/camera selection.
- [ ] Upload selected image to `POST /api/v1/snaps/upload` using `multipart/form-data`.
- [ ] Store returned R2 URL/digest in diary log payload instead of the mock URL.
- [ ] Show upload-specific loading state and disable save while upload is in progress.
- [ ] Handle permission denial, upload failure, file type, and file size errors.
- [ ] Verify created diary log renders uploaded image in detail timeline if backend returns it.

### Dev 4 - Plant Scan Contract Fix

- [x] Confirm actual backend endpoint: `/plant-scans` vs `/plant-scan/analyze` (sử dụng `/plant-scans` như code hiện tại).
- [x] Align `app/scan.tsx` with the confirmed endpoint and response schema.
- [x] Add real capture/gallery flow per spec using `expo-camera` and/or `expo-image-picker`.
- [x] Remove fixed Unsplash image from production scan path.
- [x] Normalize diagnosis field names: spec has `disease_name`, code reads `diagnosis.disease`.
- [x] Add empty/non-plant/error states that keep the user in the scan flow.

### Dev 5 - Diary API Contract & UX

- [ ] Confirm diary list/detail response fields: `_id`, `crop_type`, `start_date`, `status`, `health_status`.
- [x] Align archive action with backend/spec: current `PUT /diaries/:id`, spec `PATCH /diaries/:id/complete` (Resolved: `PUT /diaries/:id` is correct).
- [ ] Add image rendering to `app/diary/[id].tsx` for `image_url` or `photo_urls`.
- [ ] Improve create-log validation for empty activity, missing diary, and upload-in-progress.
- [ ] Refetch diary/log list after returning from create screen or use navigation focus refresh.
- [ ] Confirm XP reward after adding log is reflected in pet/profile after refresh.

### Dev 6 - Pet, Shop, XP Contract

- [x] Confirm backend pet endpoint naming: current code `/pet/status`, spec `/pets/status` (Resolved: `/pet/status` is correct).
- [x] Confirm shop purchase endpoint: current code `/shop/buy`, spec `/shop/purchase` (Resolved: `/shop/buy` is correct).
- [ ] Align item fields used by UI: `_id`, `category`, `requiredLevel`, `price`, `owned`, `equipped`, `img`.
- [ ] Ensure buy/equip updates pet status, owned items, and equipped preview without stale UI.
- [ ] Verify XP formulas and reward timing against `xp_gamification_rules.md`.
- [ ] Decide whether XP is spendable currency or separate balance; update spec/UI copy accordingly.

### Dev 7 - Reminders

- [ ] Replace `handleAddMockReminder` with a real create-reminder form or hide the FAB for MVP.
- [ ] Group reminders by today/future as specified.
- [ ] Render icons/colors by reminder type instead of always water styling.
- [ ] Confirm `PATCH /reminders/:id/complete` awards XP and refreshes pet status.
- [ ] Add optimistic or disabled loading state for complete/cancel actions.
- [ ] Verify completed reminders render as completed instead of remaining actionable.

### Dev 8 - QA, Docs, and Release Readiness

- [ ] Create a manual smoke-test checklist for auth, profile, diary, scan, chat, pet/shop, reminders.
- [ ] Run `npx tsc --noEmit` before every merge.
- [ ] Add screenshots or short screen recordings for OAuth, upload, scan, and reminder completion flows.
- [x] Reconcile OpenSpec endpoint mismatches after backend confirmation.
- [ ] Check `app.json` plugins once camera/image picker dependencies are added.
- [ ] Decide whether deleted `openspec/changes/*/.gitkeep` files should stay deleted or be restored by repo owner.

## Suggested Execution Order

1. Stabilize environment/networking so every dev can hit the same backend.
2. Lock backend endpoint contracts for diary upload, plant scan, pet/shop, and reminders.
3. Implement image upload and plant scan real media selection in parallel.
4. Polish diary, reminders, and pet/shop data refresh behavior.
5. Run cross-device smoke tests and update OpenSpec docs to match final backend contracts.

## Open Questions

- Is `172.20.10.3` still the current backend IP, or should `.env` remain developer-local?
- Is the upload endpoint definitely `POST /api/v1/snaps/upload`, and what exact response field contains the R2 URL?

