# formBuilder2 REST API

## Purpose

The archived React app imports `reactOrig/src/restClient.ts`. The active SvelteKit app calls this REST API through `src/lib/api/client.ts`. The server owns validation, sanitisation, parameterised SQL, and static app serving.

The archived original Svelte frontend under `svelteOrig/src/` calls the same REST API directly through its local `svelteOrig/src/lib/api.ts` helper. Active SvelteKit should use the same `/api` paths in Node/mock serving and `/formBuilder2/api` paths in SWAS/static deployment.

The Node reference server also serves the project documentation from `/docs/...` and `/formBuilder2/docs/...`, matching the relative links used by the active SvelteKit app and archived development routes. In SWAS/static deployment the same files are copied under `/formBuilder2/docs/`.

## Common Behaviour

- All API paths are rooted at `/api` in the Node server and `/formBuilder2/api` in SWAS/static deployment.
- Request and response bodies are JSON.
- HTTP Basic Auth is not currently enabled. Composer authentication and design persistence continue to use the built-in Composer auth flow.
- Composer email addresses are normalized to lower case by the client and backend.
- Composer stores the returned `sessionToken` in a same-path `formBuilder2ComposerSession` browser cookie and local storage so reloads can resume with `POST /api/composer-auth/session`. Legacy `formBuilder2ControllerSession` and `formBuilder2DesignerSession` values may still be read for migration. The cookie is client-side token storage; API requests still send the token in JSON request bodies.
- In restricted local development, the Node server can run with `FORMBUILDER2_MOCK_DB=true`. In that mode the same `/api/...` paths are served from a local JSON file for prototyping without PostgreSQL access. The default mock file is `D:\formBuilder2MockDB\formbuilder2-mock-db.json`; it may contain plain local-dev passwords and must not be treated as production data. Ad hoc in-app preview servers may use in-memory mocks, so they are not evidence that the file-backed mock DB is failing unless `server.ts` is the server actually running.
- UUID path/body fields must be RFC-4122-style UUID strings.
- Clinical form type path values are restricted to `waiting_list_card`, `waiting_list_cards`, `operation_note`, `operation_notes`, `outpatient_outcome`, `outpatient_outcomes`, `treatment_summary`, `treatment_summaries`, `cardiology_test_request`, and `cardiology_test_requests`.
- The server maps form type values to trusted database table names. Client-supplied table names are never interpolated directly into SQL.
- Errors return `{ "error": "message" }` and an appropriate 4xx/5xx status.

## Case Note Tracker Endpoints

Case note tracker currently uses a browser-local simulated backend so it can be reviewed without changing SWAS Java. The active SvelteKit CNT Patient search uses the ordinary `POST /api/patients/search` endpoint so it searches the same patient registry as the app home Patient search, then imports the selected patient into the local CNT store when case-note volumes are needed. The simulated store includes user preferences, selected batch UUID session state, My picklist `cntPickList` rows for selected/received volumes, and volume events whose kinds include created, sent, received, merged, destroyed, unclosed, and undestroyed. Merged events carry `targetVolumeUuid` and put the target volume label in the Note text. For localhost SWAS / real database review, `scripts/seed-cnt-real-db.ts` creates and reseeds `cnt_*` PostgreSQL tables from the same fictitious store shape and upserts the expanded CNT fictitious patient cohort into the main `patients` table, giving `/api/patients/search` enough review data for CNT demos. The intended future server-backed REST contract is documented separately in `docs/cnt.restAPI.md`. A SWAS implementation would be rooted at `/api/cnt` in the Node reference server and `/formBuilder2/api/cnt` in SWAS/static deployment.

## Form Endpoints

`GET /api/health/db`

Checks database connectivity. Response: `{ "ok": true }`.

On development machines where the configured PostgreSQL host is unreachable, this endpoint may time out or return a server error even though the REST route and Node runtime are present. On SGS-TGALappy on 2026-06-03, localhost SWAS health and a direct Node/`pg` probe both timed out because this computer cannot currently connect to the formBuilder2 database.

`POST /api/dev/restart`

Development-only process restart hook. It is disabled unless the server process has `FORMBUILDER2_ALLOW_RESTART=true`. When enabled, the route responds with `202` and exits the Node process with `FORMBUILDER2_RESTART_EXIT_CODE` or `42`. The `startServers.bat` wrapper watches for that exit code and starts `dist/server.js` again. This route is intended for local Codex/mock-server sessions only and should not be enabled in production.

`GET /api/patients`

Returns current/latest patient rows ordered by surname, forenames, and date of birth.

Patient identity rows use `hospital_number` for the hospital number. UI components may display this value with the user-facing label `CRN`, but REST and database-facing code should not introduce new `crn` fields. Address fields are canonical as `address_line1`, `address_line2`, `address_line3`, and `address_line4`; compatibility code may read older camel-case or extra-underscore aliases during transition, but API responses and new writes should use the canonical names.

`POST /api/patients/search`

Body: `{ "searchQuery": "duck" }`. Runs `search_patients_fuzzy(search_term)`.

`GET /api/patients/:uuid`

Returns the latest version of one patient.

`GET /api/patients/:uuid/forms`

Promotes expired cooling-off forms, then returns latest `forms_index_current` rows for a patient, newest first. Rows include `highly_sensitive` so Patient record can show the Highly sensitive badge without opening the form JSON.

`GET /api/patients/:uuid/appointments`

Returns latest outpatient appointment rows for a patient.

`GET /api/patients/:uuid/appointments/unlinked`

Returns latest outpatient appointment rows for a patient where `outcome_form_uuid` is null.

`POST /api/appointments/by-uuids`

Body: `{ "uuids": ["..."] }`. Returns latest outpatient appointment rows for those UUIDs.

`GET /api/appointments/:uuid`

Returns the latest version of one outpatient appointment.

`PATCH /api/appointments/:uuid`

Body: `{ "outcome_form_uuid": "..." }`. Updates supported appointment fields on every version row with that UUID.

`GET /api/outpatient-outcomes`

Promotes expired cooling-off forms, then returns the current appointment rows for the operational Outpatient outcomes list page. Rows are restricted to appointments with linked Outpatient outcome forms and include appointment details, current patient identity fields, the linked outcome form UUID/status, and any `outcome_actioned_date` / `outcome_actioned_user_id` values.

`PATCH /api/outpatient-outcomes/:appointmentUuid/actioned`

Body: `{ "date_actioned": "26-Jun-2026", "user_id": "ow000105" }` or an ISO date string for `date_actioned`. The linked Outpatient outcome must be truly `final`; cooling-off drafts cannot be actioned. The API appends a new version of the appointment row with the actioned fields populated rather than updating the previous version in place, preserving an appointment audit trail.

`POST /api/users/by-nadex-ids`

Body: `{ "nadexIds": ["ow000105", "em000410"] }`. Returns user display records keyed by NADEX Id for tooltip enrichment. Response rows include `nadexId`, `title`, `firstNames`, `surname`, `role`, and `facility`.

`GET /api/implants`

Promotes any expired cooling-off forms before returning rows. Operation notes that become final during this promotion are synchronised into the Implant registry before the query runs.

Returns rows from the Implant registry, excluding superseded rows, with current patient identity fields joined from `patients`, including `hospital_number`. Rows include `id`, `operation_note_uuid`, `operation_note_version`, `operation_note_implant_row_uuid`, `health_board`, `health_board_text`, `facility_code`, `facility_text`, `surgeon_src_text`, `surgeon_src_nadex_id`, `speciality`, `patient_uuid`, `date_inserted`, `implant_id`, `implant_description`, `remove_by_date`, `remove_by_display`, and `date_removed`. The browser registry displays `health_board`/`health_board_text`, `speciality`, and `surgeon_src_text`/`surgeon_src_nadex_id` in a visible Clinical context column immediately after Patient. Errors should return JSON `{ "error": "message" }`; the browser page displays API and non-JSON response failures in an `fbModal` titled `Error`.

`PATCH /api/implants/:id/removed`

Body: `{ "date_removed": "26-Jun-2026" }` or an ISO date string. Sets `implants.date_removed` for the selected implant row.

`GET /api/forms/:formType/:uuid`

Promotes expired cooling-off forms, then returns the latest version of one form from the mapped form table.

`GET /api/forms/:formType/:uuid/latest-version`

Promotes expired cooling-off forms, then returns `{ "version": 3 }`; version is `null` if no rows exist.

`GET /api/forms/:formType/:uuid/versions/:version`

Promotes expired cooling-off forms, then returns one exact historical version of a form.

`GET /api/forms-index/:uuid/history`

Promotes expired cooling-off forms, then returns saved versions for one form UUID, newest first, with `form_version`, `event_datetime`, `document_datetime`, and `saved_by`.

`POST /api/forms/:formType`

Inserts one form row into the mapped form table. The body includes `uuid`, `version`, `patient_uuid`, `event_datetime`, `form_status`, `form_data`, optional `highly_sensitive`, and form-specific optional fields. `highly_sensitive` is stored in every patient-form table and falls back to `form_data.highlySensitive` where present.

When `form_status = "final"` is requested for a patient form, the API stores the row as effective `draft` until the form-specific cooling-off period expires. It writes `final_requested_at`, `cooling_off_period_minutes`, and `cooling_off_expires_at` to both the patient-form table and `forms_index`. Waiting list card, Operation note, Outpatient outcome, and Treatment summary use 240 minutes; Cardiology test request uses 30 minutes. If a draft is saved, those cooling-off fields are null. Read/list endpoints promote expired cooling-off rows to `final` server-side so browser reloads and Patient record lists agree.

The `treatment_summary` form type maps to the `treatment_summaries` table. It stores the imported Composer form values in `form_data` using component ids from the Treatment summary JSON specification, and writes `forms_index.form_type = "treatment_summary"`.

The `cardiology_test_request` form type maps to the `cardiology_test_requests` table. It stores the Cardiology test request values in `form_data`, stores destination metadata in `organisation`, `hospital`, `senior_responsible_clinician`, and `speciality`, and writes `forms_index.form_type = "cardiology_test_request"`.

When an `operation_note`/`operation_notes` row is saved with Final checked, the API normalises any non-empty `form_data.implants[]` rows so each row has a persistent `uuid`, stores the normalised JSON in `operation_notes.form_data`, and waits until the operation-note cooling-off period has expired before upserting implant rows. On promotion to true final, it writes one `implants` row for each implant and sets `operation_notes.implants_synced_at`. Partial `removeBy` values are preserved in `remove_by_display`; `remove_by_date` stores the exact sort date, using 1 January for year-only values and the first day of the month for month-only values. Rows removed from a later final version of the same operation note are marked `superseded = true`, while `date_removed` is preserved on existing register rows.

`scripts/seed-implants-real-db.ts` is a real-database review seed for the Implant registry. It creates about 200 deterministic fictitious implant rows and 80 deterministic fictitious patients, upserting by operation-note UUID and implant-row UUID without truncating user-entered implant rows.

`scripts/seed-outpatient-outcomes-real-db.ts` is a real-database review seed for the Outpatient outcomes system page. It creates deterministic fictitious patients, appointments, final Outpatient outcome forms, `forms_index` rows, user lookup rows, and a mixture of actioned/not-actioned outcomes. The seed uses deterministic UUIDs so it can refresh its own fictitious rows for prototyping.

Staff selected through `fbMSISelector` stores the visible value in the original field and additionally stores `fieldName_text`, `fieldName_NADEXId`, and `fieldName_coded` when the selector reports coded metadata. Repeatable staff rows use `name_text`, `name_NADEXId`, and `coded` alongside the existing `name` field.

`POST /api/forms-index`

Inserts one `forms_index` row for a saved form. The body should include `highly_sensitive` for patient forms so the current-index view exposes the same flag to Patient record. For patient forms, a requested `final` status follows the same cooling-off conversion as `POST /api/forms/:formType`: `forms_index.form_status` remains `draft` until promotion.

## Composer Endpoints

The preferred auth route prefix is `/api/composer-auth`. The Node reference server and the SWAS Java API also accept the older `/api/controller-auth` and `/api/designer-auth` prefixes for compatibility.

`POST /api/composer-auth/register-start`

Starts Composer registration by validating the email/password, generating a six-digit code, storing it in `"emailVerificationsInProgress"`, and sending the code by email. Body:

```json
{
  "email": "designer@wales.nhs.uk",
  "password": "at least 12 characters"
}
```

The SWAS Java API does not create the `"designAuth"` row until email verification succeeds.

`POST /api/composer-auth/register-resend`

Body matches registration start. Generates and emails a fresh six-digit code.

`POST /api/composer-auth/register-verify`

Verifies the code. Body includes `email`, `password`, and `code`. Codes older than ten minutes return `{ "code": "expired" }`; wrong codes return `{ "code": "incorrect" }`. On success the SWAS Java API stores a random salt and PBKDF2-HMAC-SHA256 password hash in `"designAuth"`, sets `email_verified`, deletes the in-progress verification row, and the client logs the user in. Re-registering an existing email address is allowed: the API updates that email's password hash and verification timestamp while preserving its existing `user_uuid`, so saved designs remain attached to the account.

`POST /api/composer-auth/login`

Authenticates a Composer user against `"designAuth"`. Body matches registration and may include `"remember": true`. Login fails if `email_verified` is null. On success the response includes `sessionToken`, `expiresAt`, and `prefs`. Non-remembered sessions use a rolling ten-minute expiry; remembered sessions use a long-lived expiry intended to behave like "remember me" until explicit logout.

`POST /api/composer-auth/session`

Body: `{ "sessionToken": "..." }`. Validates and refreshes a Composer session. Non-remembered sessions are extended by ten minutes on use; remembered sessions are extended with the long-lived remembered expiry. Response includes the lower-case email, saved `prefs`, and `expiresAt`.

`POST /api/composer-auth/logout`

Body: `{ "sessionToken": "..." }`. Ends the session, including remembered sessions.

`POST /api/composer-auth/prefs`

Body: `{ "sessionToken": "...", "prefs": { ... } }`. Saves Composer user preferences to `"designAuth".prefs`, including the active design id, row/cell breadcrumb visibility, purple/green box display states, and panel scroll positions.

`POST /api/designs/list`

Returns the most recent saved JSON spec for each design owned by the authenticated Composer user. Body:

```json
{
  "email": "designer@wales.nhs.uk",
  "password": "at least 12 characters"
}
```

Response rows contain `json_spec`.

`POST /api/designs/session/list`

Returns the most recent saved JSON spec for each design owned by the user identified by a valid session token. Body:

```json
{
  "sessionToken": "..."
}
```

`POST /api/designs`

Saves one Composer JSON spec for the authenticated Composer user. The request may authenticate with email/password or with a valid `sessionToken`. The SWAS Java API uses `"designData".random_hex` as the public URL key and upserts on that value.

Composer design JSON is treated as an opaque JSON specification by the REST layer. Current client-recognised component fields include common `id`, `key`, `type`, `label`, `required`, `requiredForAudit`, `tooltip`, `databaseColumn`, `placeholder`, `defaultValue`, `valueError`, `notes`, display overrides, and `children`; component-specific fields include `units`, `bigLabel`, `boldLabel`, `optionValue`, `fullWidth`, and `noWidthConstraint`. Current component types include the usual structural and question components plus `fbBloodPressure`, `fbBoxedWarning`, `fbBoxedAlert`, `fbBoxedInfo`, `fbReadOnly`, `fbDateHeightWeightBMIRow`, `fbNotificationTypeGroup`, `fbSmartDropdown`, `fbInverseSubq`, and `fbSubqForOption`; `fbGridCell.colSpan` is clamped client-side to 1..12. Dropdown-like components store options as ordered `{ "value": string, "label": string }` objects; `fbSubqForOption.optionValue` binds to one of those stored values. `fbTextArea.fullWidth`, `fbDropdown.fullWidth`, `fbDropdown.noWidthConstraint`, `fbSmartDropdown.fullWidth`, and `fbSmartDropdown.noWidthConstraint` control rendered width constraints. Table components may include `useFullWidth`, `includeDragHandles`, `includeRowDeleteButtons`, `requireAtLeastOneRow`, `requireAtLeastOneRowText`, `includeAddButton`, `addButtonLabel`, `tableColumns`, `tableRows`, and `tableCellTemplates`; these are Composer UI fields and should be preserved by the API. The client repairs missing/duplicate component keys and IDs after loading JSON so selection and property edits remain unambiguous. Show JSON edits are saved back through the same `/api/designs` persistence path after client-side validation/normalisation. The API should preserve unknown JSON fields unless a future migration explicitly removes them.

```json
{
  "email": "designer@wales.nhs.uk",
  "password": "at least 12 characters",
  "design": {
    "id": "designed form UUID",
    "publicId": "random hexadecimal public id",
    "title": "My first form",
    "patientUuid": "fd55880a-7ada-47a8-adbb-65850af6f7e2",
    "components": []
  }
}
```

`POST /api/designs/delete`

Deletes saved versions of one Composer design owned by the authenticated user. The request may authenticate with email/password or with a valid `sessionToken`. Body includes `designId` and/or `publicId`; when both are supplied, both must match.

```json
{
  "sessionToken": "...",
  "designId": "designed form UUID",
  "publicId": "random hexadecimal public id"
}
```

`GET /api/designs/public/:publicId`

Returns the latest JSON spec for a public Composer form. This endpoint is public because it is used by public review URLs such as `/formBuilder2/userForm.html#:publicId`.

## Static Application Serving

In production, the Node/Express server serves `dist/` as static files and falls back to `dist/index.html` for non-API routes. In SWAS, the static bundle is served from `/formBuilder2/index.html`, Composer can be reached at `/formBuilder2/Composer.html`, public user forms can be reached at `/formBuilder2/userForm.html#:publicId`, and API calls use same-origin `/formBuilder2/api`.

The active SvelteKit frontend is hosted under `/formBuilder2/`, with the home page available at both `/formBuilder2/` and `/formBuilder2/index.html`, and generated public forms available at `/formBuilder2/userForm.html#:publicId`. It calls the same same-origin API base at `/formBuilder2/api` in SWAS/static deployment. Development archive routes may serve rebuilt React under `/formBuilder2/reactOrig/` and original Svelte under `/formBuilder2/svelteOrig/`. The Node reference server aliases `/formBuilder2/api` to `/api`, so the active frontend, archive routes, and API can run from the same local mock/internal server.
