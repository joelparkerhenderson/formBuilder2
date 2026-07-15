# API and data — how persistence works

The normative contract, endpoint tables, and schema are in [spec/07](../spec/07-rest-api-and-data-model.md). This is the operational digest.

## Client bindings

- `src/lib/api/client.ts` — `createApiClient()` factory: picks the API base (`/api` on dev port 3210, `/formBuilder2/api` under the deployed base path, `VITE_API_BASE_URL` override), JSON-only, throws on `{error}` bodies and non-JSON responses. Use it for ad-hoc calls (the form renderers do).
- `src/lib/api/legacy.ts` — typed one-liner functions (`getPatient`, `insertForm`, `getPublicDesign`, …). Prefer these when one exists; add new ones here rather than inlining paths in components.
- Never hand-build fetch URLs or bypass the base-path logic.

## Rules an agent must never violate

Owned by spec/07 ("Domain rules"); the short list:

1. **Append-only**: form saves insert `(uuid, version+1)`; never update a clinical row in place. Actioning an outcome appends a new appointment version.
2. **Cooling-off**: requested `final` is effectively `draft` until expiry (240 min; 30 for cardiology). Never simulate promotion client-side — reads do it server-side.
3. **Every form save writes two things**: the form row (`POST /forms/{type}`) *and* the index row (`POST /forms-index`), both carrying `highly_sensitive`.
4. **`hospital_number`**, not `crn`; `address_line1..4` canonical.
5. **Coded fields** keep their companions (`_text`, `_NADEXId`, `_coded`) — don't strip keys you don't recognise from `form_data`; the same goes for unknown fields in Composer design JSON.
6. Password-before-save is a client-side gate, not authentication ([spec/09](../spec/09-non-functional.md)) — don't build on it as a security boundary.

## Database and seeding (dev/review)

PostgreSQL, `DATABASE_URL`, `pg_trgm`. All scripts are idempotent-ish upserts intended for review databases:

| Script | Creates/seeds |
|---|---|
| `setup-db.ts` | Core schema + 4 named test patients with appointments (note: not yet the full contract schema — GAP-15) |
| `seed-patients.ts` | Bulk deterministic fictional patients with Welsh addresses |
| `scripts/seed-cnt-real-db.ts` | 14 `cnt_*` tables + CNT patient cohort |
| `scripts/seed-implants-real-db.ts` | ~200 implants + 80 patients |
| `scripts/seed-outpatient-outcomes-real-db.ts` | Appointments + final outcomes + user lookups |

All seed data is **fictitious by construction**; never introduce real patient data ([spec/09](../spec/09-non-functional.md)).

The REST **server is not in this repo** — if a change needs a new endpoint, form type, or column, record it in [spec/07](../spec/07-rest-api-and-data-model.md) and flag it as a backend request; don't fake it client-side.
