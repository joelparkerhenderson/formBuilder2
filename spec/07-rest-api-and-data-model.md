<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: code
Verified-against: 637f03a
Owns: the REST API contract, the inviolable domain rules, and the PostgreSQL data model (including the future CNT contract).

# spec/07 — REST API and data model

> **Supersession notice.** This file consolidates and supersedes `docs/restAPI.md` and `docs/cnt.restAPI.md` as the normative API reference within this documentation suite. The originals are retained unmodified as historical inputs and remain useful for narrative detail; where this file is silent, they still apply.

The **server implementation is not in this repo**. This spec binds three artefacts that are: the client bindings (`src/lib/api/client.ts`, `src/lib/api/legacy.ts`), the schema/seed scripts (`setup-db.ts`, `seed-patients.ts`, `scripts/`), and the contract docs.

## Common behaviour

- Paths root at `/api` (Node reference server) or `/formBuilder2/api` (SWAS/static). `createApiClient` picks the base by port/pathname, overridable with `VITE_API_BASE_URL`; it sends/expects JSON and surfaces `{ "error": "message" }` bodies as thrown `Error`s (non-JSON responses are also thrown, with a snippet).
- The server owns validation, sanitisation, and parameterised SQL; form-type path values map to trusted table names, never interpolated.
- Allowed clinical form types (singular and plural accepted): `waiting_list_card(s)`, `operation_note(s)`, `outpatient_outcome(s)`, `treatment_summary`/`treatment_summaries`, `cardiology_test_request(s)`.
- UUIDs are RFC-4122-style strings. HTTP Basic Auth is not enabled; Composer uses its own token flow.
- Optional mock mode: `FORMBUILDER2_MOCK_DB=true` serves the same paths from a local JSON file (dev only).

## Domain rules (normative — never violate)

1. **Append-only versioning.** Form saves always insert a new `(uuid, version)` row; actioned appointment updates append a new appointment version. No in-place updates of clinical rows.
2. **Cooling-off.** A requested `final` is stored as effective `draft` with `final_requested_at`, `cooling_off_period_minutes`, `cooling_off_expires_at` (in both the form table and `forms_index`). Periods: **240 minutes** for Waiting list card, Operation note, Outpatient outcome, Treatment summary; **30 minutes** for Cardiology test request. Read/list endpoints promote expired rows to `final` server-side.
3. **Operation-note → implants sync.** On true final (post cooling-off), each non-empty `form_data.implants[]` row is upserted into the `implants` registry; rows removed in a later final version are marked `superseded = true` (existing `date_removed` preserved); `operation_notes.implants_synced_at` records the sync. Partial `removeBy` values keep display text in `remove_by_display` and a sortable date in `remove_by_date` (year-only → 1 Jan; month-only → 1st).
4. **`hospital_number` is canonical** (UI may label it CRN; never add new `crn` fields). Addresses are canonical as `address_line1..4`.
5. **Coded staff fields.** `fbMSISelector` values store companions `{field}_text`, `{field}_NADEXId`, `{field}_coded`; repeatable staff rows use `name_text`, `name_NADEXId`, `coded`.
6. **Composer design JSON is opaque** to the REST layer: preserve unknown fields; upsert by `publicId` (`random_hex`).
7. **Actioning requires true final** — cooling-off drafts cannot be actioned.

## Endpoint reference

Client binding functions from `src/lib/api/legacy.ts` are shown where they exist. Endpoints marked ○ have no binding in the current SvelteKit client (verified at `637f03a`) — they exist in the contract and are used by other pages/versions or directly via `createApiClient`.

### Health & dev

| Endpoint | Notes |
|---|---|
| `GET /health/db` ○ | `{ "ok": true }` on DB connectivity |
| `POST /dev/restart` ○ | Dev-only; gated by `FORMBUILDER2_ALLOW_RESTART` |

### Patients & appointments

| Endpoint | Binding | Notes |
|---|---|---|
| `GET /patients` | `getPatients()` | Latest rows, ordered by surname/forenames/DOB |
| `POST /patients/search` | `searchPatients(q)` | Body `{searchQuery}`; runs `search_patients_fuzzy` (pg_trgm) |
| `GET /patients/{uuid}` | `getPatient(uuid)` | Latest version of one patient |
| `GET /patients/{uuid}/forms` | `getPatientForms(uuid)` | Promotes cooling-off, then `forms_index_current` rows incl. `highly_sensitive` |
| `GET /patients/{uuid}/appointments` | `getPatientAppointments(uuid)` | Latest appointment rows |
| `GET /patients/{uuid}/appointments/unlinked` ○ | | Appointments with null `outcome_form_uuid` |
| `POST /appointments/by-uuids` ○ | | Latest rows for a UUID list |
| `GET /appointments/{uuid}` ○ / `PATCH /appointments/{uuid}` ○ | | PATCH updates supported fields (e.g. `outcome_form_uuid`) on every version row |

### Forms & forms-index

| Endpoint | Binding | Notes |
|---|---|---|
| `POST /forms/{formType}` | `insertForm(type, body)` | Insert one versioned row: `uuid`, `version`, `patient_uuid`, `event_datetime`, `form_status`, `form_data`, optional `highly_sensitive` + form-specific columns. Cooling-off conversion applies (rule 2) |
| `GET /forms/{formType}/{uuid}` | `getForm(type, uuid)` | Latest version (after promotion) |
| `GET /forms/{formType}/{uuid}/versions/{v}` | `getFormVersion(...)` | Exact historical version |
| `GET /forms/{formType}/{uuid}/latest-version` | `getLatestVersion(...)` | `{ "version": n \| null }` |
| `POST /forms-index` | `insertFormsIndex(body)` | Companion index row; include `highly_sensitive`; same cooling-off conversion |
| `GET /forms-index/{uuid}/history` | `getFormHistory(uuid)` | Versions newest-first: `form_version`, `event_datetime`, `document_datetime`, `saved_by` |

### Worklists & users

| Endpoint | Binding | Notes |
|---|---|---|
| `GET /outpatient-outcomes` | `getOutpatientOutcomes()` | Promotes cooling-off; appointments with linked outcome forms + actioned fields |
| `PATCH /outpatient-outcomes/{appointmentUuid}/actioned` | `markOutpatientOutcomeActioned(...)` | Body `{outcome_actioned_date, outcome_actioned_user_id}` per binding (contract doc shows `date_actioned`/`user_id` — reconcile with the server; see GAP-14). Appends an appointment version |
| `GET /implants` | `getImplants()` | Promotes cooling-off + implant sync first; excludes superseded; joins patient identity |
| `PATCH /implants/{id}/removed` | `markImplantRemoved(id, date)` | Body `{date_removed}` |
| `POST /users/by-nadex-ids` | `getUsersByNadexIds(ids)` | Display records: `nadexId`, `title`, `firstNames`, `surname`, `role`, `facility` |

### Composer auth & designs

Preferred prefix `/composer-auth` (legacy `/controller-auth`, `/designer-auth` accepted). Binding: `composerAuth(path, body)` plus the design functions.

| Endpoint | Binding | Notes |
|---|---|---|
| `POST /composer-auth/register-start` / `register-resend` / `register-verify` | `composerAuth(...)` | Email + ≥12-char password; six-digit emailed code, 10-min expiry; PBKDF2-HMAC-SHA256 at rest; re-registration preserves `user_uuid` |
| `POST /composer-auth/login` / `session` / `logout` | `composerAuth(...)` | `sessionToken` + `expiresAt` + `prefs`; rolling 10-min expiry, or long-lived with `remember`; token in `formBuilder2ComposerSession` cookie/local storage, sent in JSON bodies |
| `POST /composer-auth/prefs` | `saveComposerPrefs(token, prefs)` | Active design id, breadcrumb/box visibility, scroll positions |
| `POST /designs/session/list` | `listDesignsBySession(token)` | Latest `json_spec` per owned design |
| `POST /designs/list` ○ | | Email/password variant |
| `POST /designs` | `saveDesign(body)` | Upsert by `publicId`; JSON opaque (rule 6) |
| `POST /designs/delete` | `deleteDesign(body)` | By `designId` and/or `publicId` (both must match if both given) |
| `GET /designs/public/{publicId}` | `getPublicDesign(publicId)` | Public — backs `userForm.html#:publicId` |

## PostgreSQL data model (`setup-db.ts`)

PostgreSQL via `pg` and `DATABASE_URL` (SSL auto-enabled for common hosts); `pg_trgm` extension for fuzzy search.

| Table / object | Shape |
|---|---|
| `patients` | `uuid` UNIQUE, `version`, `nhs_number`, `surname`, `forenames`, `title`, `address_line1..4`, `hospital_number`, `date_of_birth`, `sex`, `updated_at` (migration dropped legacy `crn` into `hospital_number`) |
| `search_patients_fuzzy(TEXT)` | Function ordering by trigram `similarity()` over concatenated demographics |
| `forms_index` | `form_uuid`, `form_version`, `form_type`, `patient_uuid` → `patients(uuid)`, `event_datetime`, `document_datetime`, `form_status` (draft/final/scheduled), `speciality`, `organisation`, `hospital`, `senior_responsible_clinician` (renamed from `senior_clinician`), `details`, `event_or_document` |
| `forms_index_current` | VIEW: `DISTINCT ON (form_uuid)` latest version |
| `waiting_list_cards` | `uuid`, `version`, `patient_uuid`, `event_datetime`, `form_status`, `form_data` JSONB; PK `(uuid, version)` |
| `operation_notes` | Same base + `organisation`, `hospital`, `senior_responsible_clinician`, `speciality` (+ `implants_synced_at` per contract) |
| `outpatient_outcomes` | Base + `appointment_uuid` |
| `outpatient_appointments` | `uuid`, `version`, `patient_uuid`, `updated_at/by`, `organisation`, `speciality`, `site`, `senior_clinician`, `clinic_name`, `date`, `time`, `outcome_form_uuid`; PK `(uuid, version)` |
| `treatment_summaries`, `cardiology_test_requests` | Mapped form tables per the contract (created server-side; not in `setup-db.ts` at `637f03a` — see GAP-15) |
| `implants` | Registry rows (see `GET /implants` field list in `docs/restAPI.md`) |

**Seeds**: `setup-db.ts` seeds 4 named test patients (DUCK Donald et al.) with appointments across four Welsh health boards; `seed-patients.ts` bulk-seeds deterministic fictional patients with real Welsh addresses; `scripts/seed-implants-real-db.ts` (~200 implants, 80 patients) and `scripts/seed-outpatient-outcomes-real-db.ts` (appointments + final outcomes) are deterministic review seeds that upsert without truncating user rows.

## CNT API (future contract — Status: draft)

CNT currently runs on a **browser-local simulated backend**; `docs/cnt.restAPI.md` defines the intended server contract, rooted at `/api/cnt` (or `/formBuilder2/api/cnt`), so the mock, future Node routes, and SWAS Java can converge. CNT Patient search already uses the real `POST /patients/search`. Endpoint groups (full detail in the contract doc and [spec/08](08-case-note-tracker.md)):

- **Session/prefs**: `session-users`, `login-simulated`, `home-summary`, `preferences` (GET/PUT), `barcode/resolve` (best match across volume/batch/location/NHS number/hospital number).
- **Volumes**: per-patient list/create, `volumes/{uuid}/history`, `volumes/send`, `volumes/receive` (send location remembered as preference; receive infers from a send within 8 hours).
- **Batches**: create, add/remove volumes, send, receive.
- **Tags**: `tags/mine`, create, PATCH (edit/forget).
- **Pick list**: `pick-list` (GET), per-clinic-instance volume selection (PUT), `receive`.
- **Return list & requests**: `return-list`, `requests/mine`, `requests/custodian`, create, PATCH (cancel/action).
- **Clinics & locations**: facility clinic instances, retriever choose/unchoose, clinic-instance search, location custodians/search/create.
- **Admin/maintenance**: `admin/clinic-retrievers`, `admin/location-custodians`, `maintenance/generate-clinic-instances` (six-week window + appointment churn).

The 14 `cnt_*` PostgreSQL tables seeded by `scripts/seed-cnt-real-db.ts` (`cnt_users`, `cnt_patients`, `cnt_locations`, `cnt_volumes`, `cnt_volume_events`, `cnt_batches`, `cnt_batch_volumes`, `cnt_tags`, `cnt_clinics`, `cnt_clinic_instances`, `cnt_appointments`, `cnt_requests`, `cnt_pick_list`, `cnt_preferences`) mirror the simulated store shape. Volume event kinds: created, sent, received, merged (carries `targetVolumeUuid`), destroyed, unclosed, undestroyed.
