# Findings: Mascot and Pet Status Port

## Project Locations
- Web frontend: `D:/coding/farmy-fe`
- Backend: `D:/coding/farmy-backend`
- Mobile app: `D:/coding/farmy-mobile/farmy-mobile`

## Web References
- Initial search found pet feature under `farmy-fe/src/features/pet`.
- Web pet status API calls `/pet/status` and `/pet/recalculate`.
- Web pet status contract includes mood, previousMood, streakCount, level, exp, missedDays, moodReason, bubbleMessage, ownedItems, equippedItems, and optional equippedItemsDetails.
- Web mood assets live in `farmy-fe/public/pet/*.svg`: excited, happy, neutral, sad, worried, sleepy, hungry, plus crying.
- Backend `PetService` calculates mood; mobile should not duplicate mood calculation.

## Mobile References
- Existing mobile `src/store/petStore.ts` already fetches `/pet/status` but only typed `happy | neutral | sad` and omitted streak/missed/message fields.
- Home screen uses a sprout icon placeholder instead of mascot art.
- Shop preview uses emoji placeholder plus one separately positioned equipped image.
- Baseline `npm run typecheck` fails before edits: `app/shop.tsx(21,38): error TS2304: Cannot find name 'ShopItem'.`
- Mobile has no test script/test framework in `package.json`; verification available from scripts is typecheck and lint.
- Metro can report stale resolver errors while dev server is running after adding new files; restarting with cache clear may be needed after new feature files are introduced.
