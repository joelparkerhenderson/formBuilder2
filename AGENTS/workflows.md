# Workflows — task recipes

The operational core of spec-driven development in this repo: **the spec moves first, the code follows, and both land in the same change.** The governing rules (headers, update triggers) are in [spec/00](../spec/00-conventions.md).

## Recipe: create a new form from a specification

Formalises the AI workflow suggested in `README.md`.

1. **Read first**: [spec/03](../spec/03-design-system.md) (+ the canonical `docs/wcp-eForms-designSystem-specification.html` for any component you'll use), [AGENTS/form-engines.md](form-engines.md) to pick the engine, and the reference implementation — `src/routes/operation-note/` + `operationNoteSpec` for Engine A, or `src/routes/waiting-list-card/+page.svelte` if hand-coding is justified.
2. **Author the catalogue entry first**: add the form to [spec/06](../spec/06-forms-catalogue.md) — purpose, sections, fields, required keys, `form_type`, cooling-off. The user's source material (prose, Markdown, legacy `.comp.sjs`, JSON, XML — see `README.md`) gets translated into this entry.
3. **Check the backend**: the `form_type` must be in the allowed list with a mapped table ([spec/07](../spec/07-rest-api-and-data-model.md)); if not, flag a backend request — don't fake it.
4. **Implement**: for Engine A follow the authoring checklist in [spec/04](../spec/04-engine-a-spec-driven.md) (spec object → route → home tile → `requiredFields`).
5. **Verify by driving it**: load with a seeded patient (`?patientUuid=...`), fill required fields, save draft, save final, confirm the RoV, the patient-record index row, and version history. There is no test suite to lean on (GAP-05).
6. **Close the loop**: update the [spec/02](../spec/02-architecture.md) route matrix, bump the touched specs' `Last-updated`/`Verified-against`.

## Recipe: modify an existing form

1. Find it in [spec/06](../spec/06-forms-catalogue.md); identify its engine ([AGENTS/form-engines.md](form-engines.md)).
2. Change the spec entry first (sections/fields/behaviour), then the code.
3. Remember blast radius: renderer edits affect every form on that engine.
4. Re-verify the save lifecycle (draft → final → cooling-off semantics untouched) and update spec headers.

## Recipe: add a design-system component

1. Check `docs/wcp-eForms-designSystem-specification.html` — is there an existing pattern or component that already covers this?
2. Follow the `fb*` conventions ([AGENTS/conventions.md](conventions.md)): runes, callback props, tokens, scoped styles.
3. Add it to the `/component-library` gallery and register it in the [spec/03](../spec/03-design-system.md) inventory.
4. Expose it to the engines only by extending their vocabularies deliberately ([spec/04](../spec/04-engine-a-spec-driven.md) / [spec/05](../spec/05-engine-b-designer.md)) — and note the A↔B mapping consequence (GAP-02).

## Recipe: keep the living docs alive

On any change:

1. Consult the update-trigger table in [spec/00](../spec/00-conventions.md) — it names the spec file(s) your code change obliges you to update.
2. Bump `Last-updated` and `Verified-against` in each spec you touched.
3. If you found a defect/inconsistency you aren't fixing, register it as a `GAP-NN` in [spec/10](../spec/10-gaps-and-roadmap.md); if you resolved one, mark it resolved (never delete/renumber).
4. If you added a document, add its row to `index.md`.

## Recipe: work with the database

Review databases only: set `DATABASE_URL`, run `setup-db.ts`, then the seeds you need ([AGENTS/api-and-data.md](api-and-data.md) has the script table). Seeds upsert deterministically — safe to re-run. Never add real patient data.
