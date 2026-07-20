# Progress: Mascot and Pet Status Port

## 2026-07-20
- Located Farmy web, backend, and mobile projects.
- Created persistent planning files in the mobile app root.
- Inspected web pet types, API services, mood constants, transition hook, mascot/status components, backend pet service/controller, and mobile pet store/home/shop/profile usage.
- Fetched Expo v57 `react-native-svg` docs per `AGENTS.md`.
- Ran baseline `npm run typecheck`; it fails because `ShopItem` is undefined in `app/shop.tsx`.
- Added mobile pet feature files for shared pet types, mood metadata, static SVG XML mascot assets, `PetMascot`, `PetMoodBubble`, and `PetStatusCard`.
- Updated `petStore` to use the backend-compatible pet status contract.
- Replaced Home mascot placeholder with `PetStatusCard`; replaced Shop preview placeholder with `PetMascot` and equipped item layers.
- Ran `npm run typecheck`; it passed.
- Ran `npm run lint`; it failed because `eslint` cannot be resolved from the local install.
- A `git diff` command failed once because PowerShell parsed `app/(tabs)/home.tsx`; reran with quoted paths.
- Investigated runtime Metro error `Unable to resolve module ../pet.constants`; file existed and typecheck passed, so likely stale Metro cache or resolver edge around the dotted filename.
- Renamed `src/features/pet/pet.constants.ts` to `src/features/pet/constants.ts` and updated all imports.
- Removed deprecated `pointerEvents` prop from the new mascot equipment layer and replaced new `shadow*` style props with `boxShadow` in the new pet components.
- Re-ran `npm run typecheck`; it passed. Grep confirmed no remaining `pet.constants` imports.
