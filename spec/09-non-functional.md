<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: code
Verified-against: 637f03a
Owns: cross-cutting non-functional requirements — accessibility, security/auth, data integrity, runtime constraints, and quality infrastructure — stated as testable requirements with current status.

# spec/09 — Non-functional requirements

Each requirement is stated testably with its current status. Mechanics live with their owners: design rules in [spec/03](03-design-system.md), API/domain rules in [spec/07](07-rest-api-and-data-model.md), gaps in [spec/10](10-gaps-and-roadmap.md).

## Accessibility

Canonical requirements: the Accessibility section of `docs/wcp-eForms-designSystem-specification.html`.

| Requirement | Status |
|---|---|
| Every input reachable and operable by keyboard; focus made visible by the question-container highlight (not browser outlines) | Implemented via `src/styles/global.css` focus-within rules |
| Labels programmatically associated with controls; required and required-for-audit states conveyed in the label rendering | Implemented in `fbQuestion`/`fb*` primitives — verify per component against the HTML spec |
| Save errors announced (`role="alert"` on save-error blocks, e.g. in `SpecDrivenForm.svelte`) | Implemented for Engine A; verify per hand-coded form |
| Colour is never the sole carrier of meaning (badges carry text; errors carry messages) | Convention — no automated check (see Quality infrastructure) |
| Responsive: single-column below 768 px, section nav hidden | Implemented in `global.css` |

## Security and authentication

| Requirement | Status |
|---|---|
| Clinical form save requires username + password entry before submission | **Client-side gate only** — `saveForm` checks the password is non-empty; no server-side verification exists in the contract. This is a prototype boundary: do not present it as authentication. |
| Composer access requires registered, email-verified account; passwords ≥12 chars, PBKDF2-HMAC-SHA256 at rest; sessions rolling 10-min (or long-lived "remember") | Specified in [spec/07](07-rest-api-and-data-model.md); server-side |
| No HTTP Basic Auth; no session/authorisation layer for clinical pages | **By design in the prototype** — the demo site sits behind its own login; the SPA itself has no auth for patient data |
| All patient data is fictitious (seeded fictional characters, fictional NHS/hospital numbers) | Required — never seed or commit real patient data |
| Server owns validation/sanitisation/parameterised SQL; client never builds SQL or trusts table names | Contract rule ([spec/07](07-rest-api-and-data-model.md)) |
| `highly_sensitive` flag stored per form and surfaced without opening form JSON | Implemented |

## Data integrity

Restatements of the [spec/07](07-rest-api-and-data-model.md) domain rules as testable requirements:

- Saving any clinical form twice yields two rows with consecutive `version` values and identical `uuid`; no row is ever updated in place.
- A form saved final is effectively draft until its cooling-off expiry, and reads after expiry return `final` without any client action.
- A final operation note's non-empty implant rows appear in the implant registry after cooling-off, each with a stable row `uuid`; removing a row in a later final marks the registry row `superseded` without losing `date_removed`.
- Every form save writes a matching `forms_index` row; `forms_index_current` returns exactly one row per `form_uuid`.
- `formState` mutations are immutable-update only (`formState = { ...formState, [key]: value }`) so change detection (`compareFormStatesObj`) stays correct.

## Runtime constraints

- **Client-only SPA**: `ssr = false` everywhere; no code may assume server rendering, and browser-only APIs (sessionStorage, DragEvent) are safe in components but not in module scope of `+page.ts` load functions.
- **Base path**: all internal navigation must prepend `base` from `$app/paths`; hard-coded `/formBuilder2/` or root-relative links are defects.
- **API base selection** must go through `createApiClient` (`src/lib/api/client.ts`) — never hand-built fetch URLs.
- **Offline** (CNT): detect and modal-block; no offline queueing.

## Quality infrastructure (required, currently absent)

| Requirement | Status |
|---|---|
| Committed build tooling (package.json, svelte.config.js, adapter config) | **Missing** — GAP-01 |
| Type checking (`svelte-check`) in CI | **Missing** — GAP-05 |
| Unit tests for engine utilities (`generatedForm.ts`, `formStateUtils.ts`, `dateFormat.ts`, `bmi.ts`) and renderer validation logic | **Missing** — GAP-05 |
| Lint/format config | **Missing** — GAP-05 |
| Accessibility checks (axe or equivalent) on the component library page | **Missing** — GAP-05 |
