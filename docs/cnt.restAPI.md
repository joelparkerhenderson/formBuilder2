# Case note tracker REST API

## Purpose

Case note tracker uses a client-side simulated backend in the first implementation pass. The intended server-backed REST API is documented here so the mock implementation, future Node routes, and future SWAS Java routes can converge on the same contract.

All paths are rooted at `/api/cnt` in the Node reference server and `/formBuilder2/api/cnt` in SWAS/static deployment.

## Common behaviour

- Request and response bodies are JSON.
- UUID path/body fields use RFC-4122-style strings.
- Identifiers such as barcodes, QR values, NHS numbers, hospital numbers, batch codes, and RFID values only need to be unique within their identifier type.
- Identifier generation should still use a UUID-like/random mechanism because users may create identifiers without central coordination.
- Barcode resolution accepts a mixed scanned value and returns the best match: volume, batch, location, NHS number, hospital number, or unknown.
- The prototype permits gaps in send/receive history.
- The prototype displays all movement history in a scrolling list.
- No offline working is required. Clients should detect offline state and show a modal warning until online.
- A future server-backed implementation should include a `cntPickList` table keyed by clinic instance UUID and volume UUID, with a received status flag. Maintenance should periodically delete rows whose clinic instances are in the past.

## Endpoints

`GET /api/cnt/session-users`

Returns simulated login users.

`POST /api/cnt/login-simulated`

Body: `{ "userUuid": "..." }`. Starts a simulated session and triggers clinic-window maintenance plus appointment churn.

`GET /api/cnt/home-summary`

Returns action counts for the logged-in user: pick-list count, return-list count, tag count, custodian request count, clinic count, custodian location count.

`GET /api/cnt/preferences`

Returns the logged-in user's CNT preferences, including Health board, Locality, Facility, and recent workflow defaults.

`PUT /api/cnt/preferences`

Saves the logged-in user's CNT preferences. Body may include `healthBoard`, `locality`, `facility`, `sendLocationUuid`, and recent workflow choices.

`POST /api/cnt/barcode/resolve`

Body: `{ "identifier": "..." }`. Resolves a scanned barcode, QR value, NHS number, hospital number, volume code, batch code, location code, or simulated RFID code.

`GET /api/cnt/patients/:patientUuid/volumes`

Returns patient details plus volumes grouped by health board, locality, type, volume number, and temporary status.

`POST /api/cnt/patients/:patientUuid/volumes`

Body includes `createdDate`, `healthBoard`, `locality`, `type`, `status` (`Permanent` or `Temporary`), optional `volumeNumber`, `initialLocationUuid`, optional `barcode`, optional `rfid`, and `userUuid`. Creates a new case-note volume for the patient, generates blank identifiers where needed, allocates a fallback volume number within the same patient/health-board/locality/type group when appropriate, persists a create history event, saves user Add volume preferences, and returns the updated volume summary needed by the locator.

`GET /api/cnt/volumes/:volumeUuid/history`

Returns all movement/create/merge/destroy/unclose/undestroy history for a volume. Merge history rows include the target volume UUID and the Note column records the target volume label that the source volume was merged into.

`POST /api/cnt/volumes/send`

Body includes `volumeUuids`, `fromLocationUuid`, `toLocationUuid`, `purpose`, and `userUuid`.

For send, require a send location on first use for a user. Save it as a preference. Thereafter use the saved value as the default while displaying and allowing the user to change it.

This endpoint backs the Send selected volumes popup. A successful response updates each selected volume's current location, appends a movement event, and returns the updated volume summary needed by the locator.

`POST /api/cnt/volumes/receive`

Body includes `volumeUuids`, optional `fromLocationUuid`, `toLocationUuid`, and `userUuid`.

For receive, infer the send location from the most recent send if it was within 8 hours. Otherwise leave it blank. Display the inferred/blank value and allow the user to change it, but do not prompt.

This endpoint backs the Receive selected volumes popup. A successful response updates each selected volume's current location, appends a movement event, and returns the updated volume summary needed by the locator.

`POST /api/cnt/batches`

Creates a batch with location, purpose, intended destination, and generated barcode.

`POST /api/cnt/batches/:batchUuid/volumes`

Adds volumes to a batch.

`DELETE /api/cnt/batches/:batchUuid/volumes/:volumeUuid`

Removes a volume from a batch. The removed volume takes the batch's current location.

`POST /api/cnt/batches/:batchUuid/send`

Records batch sent.

`POST /api/cnt/batches/:batchUuid/receive`

Records batch received.

`GET /api/cnt/tags/mine`

Returns active tags created by the current user, grouped by patient.

`POST /api/cnt/tags`

Creates a tag for one or more volumes.

`PATCH /api/cnt/tags/:tagUuid`

Edits or forgets a tag.

`GET /api/cnt/pick-list`

Returns the appointment-level pick list for clinic instances the user is retrieving for, ordered by appointment date/time. Each row should include appointment date/time, clinic summary, patient demographics/addressograph fields, and selected required volumes with current locations and received status from `cntPickList`.

`PUT /api/cnt/pick-list/:clinicInstanceUuid/patients/:patientUuid/volumes`

Replaces the selected volume UUIDs in `cntPickList` for one patient in one clinic instance. Existing received flags should be preserved for volume UUIDs that remain selected.

`POST /api/cnt/pick-list/:clinicInstanceUuid/receive`

Body includes `volumeUuids` and `userUuid`. Marks the matching `cntPickList` rows received, appends received movement history for those volumes, and returns the refreshed pick-list row data.

`GET /api/cnt/return-list`

Returns volumes that should be returned because appointments or clinic instances were cancelled.

`GET /api/cnt/requests/mine`

Returns requests made by the user or for clinics the user retrieves.

`GET /api/cnt/requests/custodian`

Returns requests for locations for which the user is a custodian.

`POST /api/cnt/requests`

Creates a retrieve request.

`PATCH /api/cnt/requests/:requestUuid`

Cancels or actions a request.

`GET /api/cnt/clinics/facility/:facilityUuid`

Returns planned clinic instances for a facility.

`POST /api/cnt/clinic-instances/:uuid/retrievers`

Chooses/unchooses a user as retriever for a clinic instance. The client uses this for My clinics Stop retrieving and Select clinic(s) Ok actions.

`GET /api/cnt/clinic-instances/search`

Returns future, non-cancelled clinic instances filterable by health board, locality, facility, and speciality. Rows include date/time, clinic name, speciality, senior responsible clinician, existing retrievers, and clinic instance UUID.

`POST /api/cnt/locations/:uuid/custodians`

Chooses/unchooses a user as custodian for a location.

`GET /api/cnt/locations/search?query=...`

Fuzzy-searches the case-note location table for `fbcntLocation`, `fbcntFromLocation`, and `fbcntToLocation`. The display/search string is the concatenation of health board, locality, facility, department/office, and additional location information. Implementations may include abbreviation fields in the search index, but the visible selected value should use the full concatenated label.

`POST /api/cnt/locations`

Creates a new department/office and additional-location-info location under an existing health board/facility after fuzzy "Did you mean..." checks.

`POST /api/cnt/admin/clinic-retrievers`

Admin assignment route for clinic retrievers.

`POST /api/cnt/admin/location-custodians`

Admin assignment route for custodians.

`POST /api/cnt/maintenance/generate-clinic-instances`

Internal/login-triggered route. Creates only clinic instances that have newly fallen into the six-week window since the last populated window end, then performs appointment churn for future instances.
