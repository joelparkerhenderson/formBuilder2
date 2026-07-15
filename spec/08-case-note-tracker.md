<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: docs/cnt-specification.html
Verified-against: 637f03a
Owns: the distilled index of the Case Note Tracker — purpose, pages, data model, and backend status. On any conflict, the canonical HTML specification wins.

# spec/08 — Case Note Tracker (CNT)

The **canonical specification is `docs/cnt-specification.html`** (features, full user guide, data model, custom controls, seeded table fields, SQL query catalogue, implementation notes). This file is the distilled index. The CNT REST contract (future) is consolidated in [spec/07](07-rest-api-and-data-model.md).

## What CNT is

CNT tracks **physical case-note volumes**: where each volume is (locations with custodians), how it moves (send/receive events, batches), and how it gets to clinics (pick lists driven by clinic instances and appointments, retrieve requests, return lists). Demo: `https://www.shadesOfPale.net/formBuilder2/caseNoteTracker.html`.

- **Code**: `src/lib/caseNoteTracker/` (76 files), mounted by `src/routes/cnt/+page.svelte`; the `?view=` query parameter selects the page.
- **Root component**: `CaseNoteTracker.svelte`; state in `cntStore.ts`; navigation in `cntNavigation.ts`; shared styles in `cntStyles.ts`.
- **Naming**: `Fbcnt*` / `fbcnt*` components (pages, modals, filters, badges — e.g. `FbcntBadgeActive/Closed/Cancelled/Rescheduled/Destroyed/Requested`).

## Backend status

CNT runs on a **browser-local simulated backend** (so it can be reviewed without SWAS Java changes). Two real integration points exist today:

1. **Patient search** uses the real `POST /patients/search`; a selected patient is imported into the local CNT store.
2. **Real-DB review**: `scripts/seed-cnt-real-db.ts` creates/reseeds the 14 `cnt_*` PostgreSQL tables from the simulated-store shape and upserts the CNT fictitious cohort into `patients`.

The simulated store holds user preferences, selected-batch session state, `cntPickList` rows, and volume events. Migration to the server-backed contract is GAP-11 in [spec/10](10-gaps-and-roadmap.md).

## Page inventory

From the canonical spec's "Pages" section (each maps to `fbcntPage*`/`Fbcnt*` files in `src/lib/caseNoteTracker/`):

Login · Home · Preferences · Case notes locator · Case notes selector · Volume history · Register volume · Manage volume · Send selected volumes · Receive selected volumes · Batches · Find batch · Create batch · Batch · Tags · Outbox and Inbox · Request and Select patient · Picklist · Return list · Clinics and Select clinic(s) · System clinic schedule / All clinics / clinic list / locations · Assigned libraries · Admin.

Supported workflows (canonical spec, "User guide"): logging in and preferences; patient search; case-notes locator; requesting a volume/set; Outbox/Inbox; pick lists; system clinic lists; return list; registering, sending, and receiving volumes; batch management and simulated batch scans; tagging; managing libraries; identifier scanning.

## Data model

Entities (mirrored by the `cnt_*` tables listed in [spec/07](07-rest-api-and-data-model.md)): users, patients, **locations** (with custodian user arrays), **volumes** (health board / locality / type / volume number / permanent-or-temporary), **volume events** (created, sent, received, merged with `targetVolumeUuid`, destroyed, unclosed, undestroyed), **batches** (+ batch volumes), **tags**, **clinics** and **clinic instances** (with retriever user arrays), **appointments** (unique per clinic-instance/patient), **requests**, **pick list** (clinic instance × volume, received flag), **preferences** (send location, favourites, recent choices).

Key rules (from the canonical spec and contract):

- Identifiers (barcodes, QR, NHS/hospital numbers, batch codes, RFID) are unique **within their type**; generation is random/UUID-like. Barcode resolution returns the best match across types.
- Send requires a send location (first use saved as preference); receive infers the from-location from a send within 8 hours, else blank — display, allow change, never prompt.
- No offline working: detect offline and show a modal until online.
- Clinic-instance maintenance generates instances newly inside a six-week window, then churns future appointments.

Field-level detail: the "Seeded CNT table fields" table in `docs/cnt-specification.html`; seed shape in `scripts/seed-cnt-real-db.ts`.
