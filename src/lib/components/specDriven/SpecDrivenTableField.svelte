<script lang="ts">
  import FbDatePartial from '$lib/components/fb/fbDatePartial.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbGroup from '$lib/components/fb/fbGroup.svelte';
  import FbMSISelector from '$lib/components/fb/fbMSISelector.svelte';
  import FbRadio from '$lib/components/fb/fbRadio.svelte';
  import FbSCTDiagnosis from '$lib/components/fb/fbSCTDiagnosis.svelte';
  import FbSCTProcedure from '$lib/components/fb/fbSCTProcedure.svelte';
  import FbTable from '$lib/components/fb/fbTable.svelte';
  import FbTableBody from '$lib/components/fb/fbTableBody.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableHeader from '$lib/components/fb/fbTableHeader.svelte';
  import FbTableHeaderCell from '$lib/components/fb/fbTableHeaderCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import type { SimpleField } from '$lib/data/specDrivenFormTypes';

  type Row = Record<string, any>;
  type StaffKind = 'surgeon' | 'anaesthetist';

  let {
    field,
    formState,
    rows = [],
    setCodedValue,
    updateTableRow,
    addTableRow,
    removeTableRow,
    tableRowDragStart,
    tableRowDragOver,
    tableRowDrop
  }: {
    field: SimpleField;
    formState: Record<string, any>;
    rows?: Row[];
    setCodedValue: (key: string, value: string, coded: boolean, nadexId?: string) => void;
    updateTableRow: (key: string, id: number, patch: Row) => void;
    addTableRow: (key: string, row: Row) => void;
    removeTableRow: (key: string, id: number) => void;
    tableRowDragStart: (event: DragEvent, key: string, id: number) => void;
    tableRowDragOver: (event: DragEvent, key: string) => void;
    tableRowDrop: (event: DragEvent, key: string, id: number) => void;
  } = $props();

  function staffLabel(kind: StaffKind, index: number) {
    if (kind === 'surgeon') return index === 0 ? 'Second surgeon' : `Surgeon ${index + 2}`;
    return index === 0 ? 'Second anaesthetist' : `Anaesthetist ${index + 2}`;
  }

  function updateStaffRow(key: string, id: number, value: string, coded: boolean, nadexId?: string) {
    updateTableRow(key, id, { name: value, coded, name_text: value, name_NADEXId: nadexId || '' });
  }

  function leadKey(kind: StaffKind) {
    return kind === 'surgeon' ? 'leadSurgeon' : 'leadAnaesthetist';
  }

  function srcKey(kind: StaffKind) {
    return kind === 'surgeon' ? 'surgeonSRC' : 'anaesthetistSRC';
  }
</script>

{#snippet deleteButton(id: number, label: string)}
  {#if rows.length > 1}
    <button type="button" class="simple-table-icon-button" onclick={() => removeTableRow(field.key, id)} aria-label={label}>
      <span class="material-icons" aria-hidden="true">highlight_off</span>
    </button>
  {/if}
{/snippet}

{#snippet staffGroup(kind: StaffKind)}
  <div class="simple-staff-group fb-question-container">
    <div class="simple-staff-group-label">{field.label}</div>
    <FbMSISelector label={kind === 'surgeon' ? 'Lead surgeon' : 'Lead anaesthetist'} name={leadKey(kind)} value={formState[leadKey(kind)] || ''} coded={formState[`${leadKey(kind)}_coded`]} required subfield onChange={(value, coded, nadexId) => setCodedValue(leadKey(kind), value, coded, nadexId)} />
    <FbMSISelector label={kind === 'surgeon' ? 'Surgeon SRC' : 'Anaesthetist SRC'} name={srcKey(kind)} value={formState[srcKey(kind)] || ''} coded={formState[`${srcKey(kind)}_coded`]} required subfield onChange={(value, coded, nadexId) => setCodedValue(srcKey(kind), value, coded, nadexId)} />
    {#each rows as row, index (row.id)}
      <div class="simple-staff-row">
        <FbMSISelector label={staffLabel(kind, index)} name={`${field.key}-${row.id}`} value={row.name || ''} coded={row.coded} subfield onChange={(value, coded, nadexId) => updateStaffRow(field.key, row.id, value, coded, nadexId)} />
        {#if rows.length > 1}
          <button type="button" class="simple-table-icon-button simple-staff-delete" onclick={() => removeTableRow(field.key, row.id)} aria-label={`Delete ${staffLabel(kind, index)}`}>
            <span class="material-icons" aria-hidden="true">highlight_off</span>
          </button>
        {/if}
      </div>
    {/each}
    <button type="button" class="fb-add-button simple-table-add-button simple-staff-after-add" onclick={() => addTableRow(field.key, { name: '', coded: false })}>Add {kind}</button>
  </div>
{/snippet}

{#if field.type === 'surgeonGroup'}
  {@render staffGroup('surgeon')}
{:else if field.type === 'anaesthetistGroup'}
  {@render staffGroup('anaesthetist')}
{:else if field.type === 'procedureTable'}
  <div class="simple-table-wrap">
    <FbTable>
      <FbTableHeader><FbTableRow><FbTableHeaderCell width="2rem"></FbTableHeaderCell><FbTableHeaderCell width="12rem">Side</FbTableHeaderCell><FbTableHeaderCell>Procedure</FbTableHeaderCell><FbTableHeaderCell>Additional info</FbTableHeaderCell><FbTableHeaderCell width="2rem"></FbTableHeaderCell></FbTableRow></FbTableHeader>
      <FbTableBody>
        {#each rows as row (row.id)}
          <FbTableRow draggable={true} ondragstart={(event) => tableRowDragStart(event, field.key, row.id)} ondragover={(event) => tableRowDragOver(event, field.key)} ondrop={(event) => tableRowDrop(event, field.key, row.id)}>
            <FbTableCell><span class="material-icons simple-table-drag" aria-hidden="true">swap_vertical_circle</span></FbTableCell>
            <FbTableCell><FbDropdown value={row.side || ''} options={[{ value: '', label: '' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'bilateral', label: 'Bilateral' }, { value: 'not_applicable', label: 'Not applicable' }]} onChange={(value) => updateTableRow(field.key, row.id, { side: value })} /></FbTableCell>
            <FbTableCell><FbSCTProcedure name={`${field.key}-procedure-${row.id}`} value={row.procedure || ''} coded={row.procedure_coded} onChange={(value, coded) => updateTableRow(field.key, row.id, { procedure: value, procedure_coded: coded })} /></FbTableCell>
            <FbTableCell><FbTextInput value={row.additionalInfo || ''} placeholder="Additional info" onChange={(value) => updateTableRow(field.key, row.id, { additionalInfo: value })} /></FbTableCell>
            <FbTableCell>{@render deleteButton(row.id, 'Delete procedure')}</FbTableCell>
          </FbTableRow>
        {/each}
      </FbTableBody>
    </FbTable>
  </div>
  <button type="button" class="fb-add-button simple-table-add-button" onclick={() => addTableRow(field.key, { side: '', procedure: '', additionalInfo: '' })}>Add another procedure</button>
{:else if field.type === 'diagnosisTable'}
  <div class="simple-table-label">{field.label}</div>
  <div class="simple-table-note">if different</div>
  <div class="simple-table-wrap">
    <FbTable>
      <FbTableBody>
        {#each rows as row (row.id)}
          <FbTableRow draggable={true} ondragstart={(event) => tableRowDragStart(event, field.key, row.id)} ondragover={(event) => tableRowDragOver(event, field.key)} ondrop={(event) => tableRowDrop(event, field.key, row.id)}>
            <FbTableCell><span class="material-icons simple-table-drag" aria-hidden="true">swap_vertical_circle</span></FbTableCell>
            <FbTableCell><FbSCTDiagnosis name={`${field.key}-diagnosis-${row.id}`} value={row.diagnosis || ''} coded={row.diagnosis_coded} onChange={(value, coded) => updateTableRow(field.key, row.id, { diagnosis: value, diagnosis_coded: coded })} /></FbTableCell>
            <FbTableCell>{@render deleteButton(row.id, 'Delete operative diagnosis')}</FbTableCell>
          </FbTableRow>
        {/each}
      </FbTableBody>
    </FbTable>
  </div>
  <button type="button" class="fb-add-button simple-table-add-button" onclick={() => addTableRow(field.key, { diagnosis: '', diagnosis_coded: false })}>Add operative diagnosis</button>
{:else if field.type === 'specimenTable'}
  <div class="simple-table-wrap">
    <FbTable>
      <FbTableHeader><FbTableRow><FbTableHeaderCell width="2rem"></FbTableHeaderCell><FbTableHeaderCell width="5rem">A, B, C</FbTableHeaderCell><FbTableHeaderCell>Description</FbTableHeaderCell><FbTableHeaderCell width="2rem"></FbTableHeaderCell></FbTableRow></FbTableHeader>
      <FbTableBody>
        {#each rows as row (row.id)}
          <FbTableRow draggable={true} ondragstart={(event) => tableRowDragStart(event, field.key, row.id)} ondragover={(event) => tableRowDragOver(event, field.key)} ondrop={(event) => tableRowDrop(event, field.key, row.id)}>
            <FbTableCell><span class="material-icons simple-table-drag" aria-hidden="true">swap_vertical_circle</span></FbTableCell>
            <FbTableCell><FbTextInput value={row.label || ''} onChange={(value) => updateTableRow(field.key, row.id, { label: value })} /></FbTableCell>
            <FbTableCell><FbTextArea value={row.description || ''} rows={1} fullWidth onChange={(value) => updateTableRow(field.key, row.id, { description: value })} /></FbTableCell>
            <FbTableCell>{@render deleteButton(row.id, 'Delete specimen')}</FbTableCell>
          </FbTableRow>
        {/each}
      </FbTableBody>
    </FbTable>
  </div>
  <button type="button" class="fb-add-button simple-table-add-button" onclick={() => addTableRow(field.key, { label: '', description: '' })}>Add specimen</button>
{:else if field.type === 'implantTable'}
  <div class="simple-table-note">Include implanted tissue and organs here</div>
  <div class="simple-table-wrap">
    <FbTable>
      <FbTableHeader><FbTableRow><FbTableHeaderCell width="9rem">Implant Id</FbTableHeaderCell><FbTableHeaderCell>Type / description</FbTableHeaderCell><FbTableHeaderCell width="1%">Does this implant require exchange or removal?</FbTableHeaderCell><FbTableHeaderCell width="12rem">Remove by</FbTableHeaderCell><FbTableHeaderCell width="2rem"></FbTableHeaderCell></FbTableRow></FbTableHeader>
      <FbTableBody>
        {#each rows as row (row.id)}
          <FbTableRow draggable={true} ondragstart={(event) => tableRowDragStart(event, field.key, row.id)} ondragover={(event) => tableRowDragOver(event, field.key)} ondrop={(event) => tableRowDrop(event, field.key, row.id)}>
            <FbTableCell><FbTextInput value={row.implantId || ''} onChange={(value) => updateTableRow(field.key, row.id, { implantId: value })} /></FbTableCell>
            <FbTableCell><FbTextArea value={row.description || ''} rows={1} fullWidth onChange={(value) => updateTableRow(field.key, row.id, { description: value })} /></FbTableCell>
            <FbTableCell>
              <FbGroup label="">
                <FbRadio name={`${field.key}-removal-${row.id}`} value="yes" label="Yes" checked={row.requiresRemoval === 'yes'} onChange={() => updateTableRow(field.key, row.id, { requiresRemoval: 'yes' })} />
                <FbRadio name={`${field.key}-removal-${row.id}`} value="no" label="No" checked={row.requiresRemoval === 'no'} onChange={() => updateTableRow(field.key, row.id, { requiresRemoval: 'no', removeBy: '' })} />
              </FbGroup>
            </FbTableCell>
            <FbTableCell>
              {#if row.requiresRemoval === 'yes'}
                <div class="simple-table-required-date">
                  <FbDatePartial name={`${field.key}-remove-by-${row.id}`} value={row.removeBy || ''} onChange={(value) => updateTableRow(field.key, row.id, { removeBy: value })} />
                  <span class="simple-table-required-star">*</span>
                </div>
              {/if}
            </FbTableCell>
            <FbTableCell>{@render deleteButton(row.id, 'Delete implant')}</FbTableCell>
          </FbTableRow>
        {/each}
      </FbTableBody>
    </FbTable>
  </div>
  <button type="button" class="fb-add-button simple-table-add-button" onclick={() => addTableRow(field.key, { implantId: '', description: '', requiresRemoval: '', removeBy: '' })}>Add another implant</button>
{/if}

<style>
  .simple-table-wrap {
    width: 100%;
    overflow-x: auto;
    padding: 0.2rem 0;
  }

  .simple-table-label,
  .simple-staff-group-label {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .simple-table-note {
    font-size: 0.9rem;
    font-style: italic;
    margin-bottom: 0.4rem;
  }

  .simple-table-drag {
    color: #1b6ec2;
    cursor: grab;
    font-size: 1.5rem;
  }

  .simple-table-icon-button {
    border: none;
    background: transparent;
    color: #d50000;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .simple-table-icon-button .material-icons {
    font-size: 1.5rem;
  }

  .simple-table-add-button {
    height: 2rem;
    line-height: 1.8rem;
    padding: 0 0.8rem;
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.4rem;
    background: white;
    color: #1b6ec2;
    font-size: 1rem;
    font-weight: 300;
    cursor: pointer;
  }

  .simple-table-required-date,
  .simple-staff-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .simple-table-required-star {
    color: #d50000;
    flex: 0 0 auto;
    font-weight: 500;
    line-height: 1.8rem;
  }

  .simple-staff-group {
    padding: 0.2rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  .simple-staff-delete {
    flex: 0 0 auto;
    margin-top: 1.5rem;
  }

  .simple-staff-after-add {
    margin-top: 0.6rem;
  }
</style>
