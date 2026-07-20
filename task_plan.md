# Task Plan: Port Mascot and Pet Status

## Goal
Bring Farmy web mascot, pet status data flow, and related SVG assets into the React Native mobile app with minimal native-specific adaptation.

## Phases
- [x] Locate farmy-fe, farmy-backend, and farmy-mobile.
- [x] Trace web pet status types, API calls, hooks, mascot rendering, and SVG asset usage.
- [x] Inspect mobile app architecture, API client, assets, and existing screens.
- [x] Confirm mobile has no test runner; use available verification commands instead.
- [x] Copy mascot SVG assets and port React Native components/hooks.
- [x] Wire the feature into the mobile UI where it maps naturally.
- [x] Run available verification commands.
- [x] Recheck farmy-backend pet/shop route contracts against farmy-fe and mobile.
- [x] Sync mobile shop routes, response fields, and SVG rendering with backend/web contracts.

## Decisions
- Preserve web business logic names where they match backend contracts.
- Avoid backend changes unless mobile reveals an API mismatch.
- Prefer React Native SVG rendering already supported by the project; otherwise use existing asset patterns.
- Use backend mood directly on mobile; do not duplicate server-side mood calculation.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---|---|
| `ShopItem` type missing in `app/shop.tsx` | Baseline `npm run typecheck` | Will add the narrow type while editing shop preview. |
| `npm run lint` cannot resolve `eslint` | Verification | Left dependencies untouched; package install needs repair before lint can run. |
| PowerShell parsed `app/(tabs)/home.tsx` in `git diff` | Diff inspection | Reran command with quoted path. |
| Mobile called nonexistent `/shop/unequip` | Backend shop controller recheck | Changed unequip to use `/shop/equip` toggle, same as farmy-fe. |
| Mobile expected `requiredLevel` and `img` | Backend shop schema/service recheck | Changed mobile shop to use `required_level` and `image_url`. |
| Backend does not serve copied `/shop/*.svg` assets | Static asset search | Copied shop SVGs from `farmy-fe/public/shop` into mobile SVG XML map and render locally. |
