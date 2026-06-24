# formBuilder2 REST API

## Purpose

The React app imports the local `src/restClient.ts` adapter. That adapter is a compatibility layer over this REST API. The server owns validation, sanitisation, parameterised SQL, and static app serving.

The parallel Svelte frontend under `svelte/src/` calls the same REST API directly through its local `svelte/src/lib/api.ts` helper. It should use the same `/api` paths in Node/mock serving and `/formBuilder2/api` paths in SWAS/static deployment.

The Node reference server also serves the project documentation from `/docs/...` and `/formBuilder2/docs/...`, matching the relative links used by the React and Svelte home pages. In SWAS/static deployment the same files are copied under `/formBuilder2/docs/`.

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

Case note tracker currently uses a browser-local simulated backend so it can be reviewed without changing SWAS Java. The React CNT implementation is canonical; the Svelte CNT entry uses Svelte-owned CNT source and the same browser-local simulated store rather than new REST endpoints. The simulated store includes user preferences, selected batch UUID session state, My picklist `cntPickList` rows for selected/received volumes, and volume events whose kinds include created, sent, received, merged, destroyed, unclosed, and undestroyed. Merged events carry `targetVolumeUuid` and put the target volume label in the Note text. For localhost SWAS / real database review, `scripts/seed-cnt-real-db.ts` creates and reseeds `cnt_*` PostgreSQL tables from the same fictitious store shape and upserts CNT patients into the main `patients` table. The intended future server-backed REST contract is documented separately in `docs/cnt.restAPI.md`. A SWAS implementation would be rooted at `/api/cnt` in the Node reference server and `/formBuilder2/api/cnt` in SWAS/static deployment.

## Form Endpoints

`GET /api/health/db`

Checks database connectivity. Response: `{ "ok": true }`.

On development machines where the configured PostgreSQL host is unreachable, this endpoint may time out or return a server error even though the REST route and Node runtime are present. On SGS-TGALappy on 2026-06-03, localhost SWAS health and a direct Node/`pg` probe both timed out because this computer cannot currently connect to the formBuilder2 database.

`POST /api/dev/restart`

Development-only process restart hook. It is disabled unless the server process has `FORMBUILDER2_ALLOW_RESTART=true`. When enabled, the route responds with `202` and exits the Node process with `FORMBUILDER2_RESTART_EXIT_CODE` or `42`. The `startServers.bat` wrapper watches for that exit code and starts `dist/server.js` again. This route is intended for local Codex/mock-server sessions only and should not be enabled in production.

`GET /api/patients`

Returns current/latest patient rows ordered by surname, forenames, and date of birth.

`POST /api/patients/search`

Body: `{ "searchQuery": "duck" }`. Runs `search_patients_fuzzy(search_term)`.

`GET /api/patients/:uuid`

Returns the latest version of one patient.

`GET /api/patients/:uuid/forms`

Returns latest `forms_index_current` rows for a patient, newest first. Rows include `highly_sensitive` so Patient record can show the Highly sensitive badge without opening the form JSON.

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

`GET /api/forms/:formType/:uuid`

Returns the latest version of one form from the mapped form table.

`GET /api/forms/:formType/:uuid/latest-version`

Returns `{ "version": 3 }`; version is `null` if no rows exist.

`GET /api/forms/:formType/:uuid/versions/:version`

Returns one exact historical version of a form.

`GET /api/forms-index/:uuid/history`

Returns saved versions for one form UUID, newest first, with `form_version`, `event_datetime`, `document_datetime`, and `saved_by`.

`POST /api/forms/:formType`

Inserts one form row into the mapped form table. The body includes `uuid`, `version`, `patient_uuid`, `event_datetime`, `form_status`, `form_data`, optional `highly_sensitive`, and form-specific optional fields. `highly_sensitive` is stored in every patient-form table and falls back to `form_data.highlySensitive` where present.

The `treatment_summary` form type maps to the `treatment_summaries` table. It stores the imported Composer form values in `form_data` using component ids from the Treatment summary JSON specification, and writes `forms_index.form_type = "treatment_summary"`.

The `cardiology_test_request` form type maps to the `cardiology_test_requests` table. It stores the Cardiology test request values in `form_data`, stores destination metadata in `organisation`, `hospital`, `senior_responsible_clinician`, and `speciality`, and writes `forms_index.form_type = "cardiology_test_request"`.

`POST /api/forms-index`

Inserts one `forms_index` row for a saved form. The body should include `highly_sensitive` for patient forms so the current-index view exposes the same flag to Patient record.

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

Composer design JSON is treated as an opaque JSON specification by the REST layer. Current client-recognised component fields include common `id`, `key`, `type`, `label`, `required`, `requiredForAudit`, `tooltip`, `databaseColumn`, `placeholder`, `defaultValue`, `valueError`, `notes`, display overrides, and `children`; current component types include the usual structural and question components plus `fbBloodPressure`, `fbBoxedWarning`, `fbBoxedAlert`, and `fbBoxedInfo`; `fbGridCell.colSpan` is clamped client-side to 1..12; `fbTextArea.fullWidth` controls whether the normal 37rem max-width is disabled. Table components may include `useFullWidth`, `includeDragHandles`, `includeRowDeleteButtons`, `requireAtLeastOneRow`, `requireAtLeastOneRowText`, `includeAddButton`, `addButtonLabel`, `tableColumns`, `tableRows`, and `tableCellTemplates`; these are Composer UI fields and should be preserved by the API. The client repairs missing/duplicate component keys and IDs after loading JSON so selection and property edits remain unambiguous. Show JSON edits are saved back through the same `/api/designs` persistence path after client-side validation/normalisation. The API should preserve unknown JSON fields unless a future migration explicitly removes them.

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

The Svelte frontend is intended to be hosted under `/formBuilder2/svelte/`, for example `/formBuilder2/svelte/index.html` and `/formBuilder2/svelte/waitingListCard.html`, while continuing to call the same same-origin API base at `/formBuilder2/api`. The Node reference server aliases `/formBuilder2/api` to `/api`, so the React frontend, Svelte frontend, and API can run from the same local mock server.
