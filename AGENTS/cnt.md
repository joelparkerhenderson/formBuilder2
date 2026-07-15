# Case Note Tracker (CNT) — working notes

The distilled spec is [spec/08](../spec/08-case-note-tracker.md); the canonical document is `docs/cnt-specification.html` (user guide, data model, page inventory, seeded table fields, SQL catalogue). Read the canonical spec before changing CNT behaviour — it encodes workflow rules that aren't obvious from the code.

## Orientation

- Everything lives in `src/lib/caseNoteTracker/` (76 files), mounted by `src/routes/cnt/+page.svelte`; `?view=` selects the page.
- Root: `CaseNoteTracker.svelte`. State: `cntStore.ts` (this sub-app does *not* follow the runes-local-state pattern of the rest of the app). Navigation: `cntNavigation.ts`. Shared styles: `cntStyles.ts`.
- Components are `Fbcnt*` / `fbcnt*` (pages, modals, filters, status badges).

## The backend reality — read this before anything else

CNT runs on a **browser-local simulated backend**. Do not look for CNT REST calls; apart from patient search (which reuses the real `POST /patients/search` and imports the patient into the local store), state lives in the browser.

- The **future** server contract is `docs/cnt.restAPI.md`, consolidated in [spec/07](../spec/07-rest-api-and-data-model.md) (`/api/cnt/...`). When changing simulated behaviour, keep it convergent with that contract — that's the whole point of the contract existing (GAP-11).
- For real-database review, `scripts/seed-cnt-real-db.ts` materialises the same store shape into 14 `cnt_*` PostgreSQL tables.

## Behaviour rules that bite

- Send/receive: send location is remembered as a user preference; receive *infers* the from-location from a send within 8 hours (display, allow change, never prompt).
- Volume events are append-only history: created, sent, received, merged (with `targetVolumeUuid` and target label in the Note), destroyed, unclosed, undestroyed.
- Identifiers are unique only within their type; barcode resolution returns a best match across volume/batch/location/NHS number/hospital number.
- Offline: detect and block with a modal; no offline queueing.
