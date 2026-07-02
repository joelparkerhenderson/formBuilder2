import React from 'react';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbButton as FbButton } from './components/fbButton';
import { fbButtonSmaller as FbButtonSmaller } from './components/fbButtonSmaller';
import { fbDateExact as FbDateExact } from './components/fbDateExact';
import { fbDropdown as FbDropdown } from './components/fbDropdown';
import { fbMSISelector as FbMSISelector } from './components/fbMSISelector';
import { fbModal as FbModal } from './components/fbModal';
import { fbQuestion as FbQuestion } from './components/fbQuestion';
import { fbReadOnly as FbReadOnly } from './components/fbReadOnly';
import { fbSmartDropdown as FbSmartDropdown } from './components/fbSmartDropdown';
import {
  fbTable as FbTable,
  fbTableBody as FbTableBody,
  fbTableHeader as FbTableHeader,
  fbTableHeaderCell as FbTableHeaderCell,
  fbTableRow as FbTableRow,
} from './components/fbTable';
import { fbTableCell as FbTableCell } from './components/fbTableCell';
import { healthBoards, specialityValuesForHealthBoard } from './data/clinicalDestinations';
import { specialityLabels, organisationLabels } from './data/formLabels';
import { specialities } from './data/specialities';
import { formatFormDate } from './utils/dateFormat';

type ImplantRow = {
  id: number | string;
  operation_note_uuid: string;
  operation_note_version: number;
  operation_note_implant_row_uuid: string;
  health_board?: string | null;
  health_board_text?: string | null;
  facility_code?: string | null;
  facility_text?: string | null;
  surgeon_src_text?: string | null;
  surgeon_src_nadex_id?: string | null;
  speciality?: string | null;
  patient_uuid?: string | null;
  date_inserted?: string | null;
  implant_id?: string | null;
  implant_description?: string | null;
  remove_by_date?: string | null;
  remove_by_display?: string | null;
  date_removed?: string | null;
  nhs_number?: string | null;
  hospital_number?: string | null;
  title?: string | null;
  surname?: string | null;
  forenames?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
};

function defaultApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.port === '3210') return '/api';
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/formBuilder2/')) return '/formBuilder2/api';
  return '/api';
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl()).replace(/\/$/, '');

function apiUrl(path: string) {
  if (apiBaseUrl.endsWith('/api') && path.startsWith('/api/')) return `${apiBaseUrl}${path.slice(4)}`;
  return `${apiBaseUrl}${path}`;
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
}

function displayDate(value?: string | null) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatFormDate(new Date(`${value.slice(0, 10)}T00:00:00`));
  return value;
}

function srcDisplay(value?: string | null) {
  return String(value || '').replace(/\s*-\s*NADEX\s*:\s*[A-Za-z0-9._-]+\s*$/i, '').trim();
}

function patientProps(row: ImplantRow) {
  return {
    nhsNumber: row.nhs_number || '',
    surname: row.surname || '',
    forenames: row.forenames || '',
    title: row.title || '',
    hospitalNumber: row.hospital_number || '',
    dateOfBirth: row.date_of_birth || '',
    sex: row.sex || '',
  };
}

function clinicalContextLines(row: ImplantRow) {
  const healthBoard = row.health_board_text || organisationLabels[row.health_board || ''] || row.health_board || '';
  const speciality = specialityLabels[row.speciality || ''] || row.speciality || '';
  const src = srcDisplay(row.surgeon_src_text);
  return { healthBoard, speciality, src };
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (!text) return null;
  if (!contentType.toLowerCase().includes('application/json')) {
    const excerpt = text.replace(/\s+/g, ' ').trim().slice(0, 220);
    throw new Error(`The Implant registry received a non-JSON response from the server. ${excerpt ? `Response began: ${excerpt}` : ''}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'The Implant registry received invalid JSON from the server.');
  }
}

export default function Implants() {
  const [rows, setRows] = React.useState<ImplantRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorModal, setErrorModal] = React.useState('');
  const [showRemoved, setShowRemoved] = React.useState(false);
  const [showNoRemoval, setShowNoRemoval] = React.useState(false);
  const [filter, setFilter] = React.useState({ healthBoard: '', speciality: '', src: '', srcCoded: false, srcNadexId: '' });
  const [removing, setRemoving] = React.useState<ImplantRow | null>(null);
  const [dateRemoved, setDateRemoved] = React.useState(formatFormDate(new Date()));

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/implants'));
      const payload = await readJsonResponse(response);
      if (!response.ok) throw new Error(payload?.error || response.statusText);
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const specialityFilterOptions = React.useMemo(() => {
    const allowedValues = new Set(specialityValuesForHealthBoard(filter.healthBoard));
    return specialities.filter((option) => allowedValues.has(option.value));
  }, [filter.healthBoard]);

  function updateHealthBoardFilter(value: string) {
    const allowedValues = new Set(specialityValuesForHealthBoard(value));
    setFilter((current) => ({
      ...current,
      healthBoard: value,
      speciality: !current.speciality || allowedValues.has(current.speciality) ? current.speciality : '',
    }));
  }

  const visibleRows = rows.filter((row) => {
    if (!showRemoved && row.date_removed) return false;
    if (!showNoRemoval && !row.remove_by_date && !row.remove_by_display) return false;
    if (filter.healthBoard && row.health_board !== filter.healthBoard) return false;
    if (filter.speciality && row.speciality !== filter.speciality) return false;
    if (filter.src || filter.srcNadexId) {
      const rowText = String(row.surgeon_src_text || '').toLowerCase();
      const rowId = String(row.surgeon_src_nadex_id || '').toLowerCase();
      const filterText = filter.src.toLowerCase();
      const filterId = filter.srcNadexId.toLowerCase();
      if (filterId ? rowId !== filterId : !(rowText.includes(filterText) || rowId.includes(filterText))) return false;
    }
    return true;
  });

  async function confirmRemoved() {
    if (!removing) return;
    const response = await fetch(apiUrl(`/api/implants/${encodeURIComponent(String(removing.id))}/removed`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date_removed: dateRemoved }),
    });
    let payload: any = null;
    try {
      payload = await readJsonResponse(response);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : String(err));
      return;
    }
    if (!response.ok) {
      setErrorModal(payload?.error || response.statusText);
      return;
    }
    setRows((currentRows) => currentRows.map((row) => row.id === removing.id ? { ...row, date_removed: dateRemoved } : row));
    setRemoving(null);
    await loadRows();
  }

  return (
    <div style={{ height: '100vh', background: 'white', fontFamily: "'Roboto', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'white', borderBottom: '0.2rem solid #1b6ec2', padding: '1rem 1rem 0.55rem 1rem', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '1rem', fontWeight: 300, lineHeight: 1.05 }}>NHS Wales</div>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 500, lineHeight: 1.05 }}>Implant registry</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', marginTop: '0.7rem', fontWeight: 400 }}>
          <label><input type="checkbox" checked={showRemoved} onChange={(event) => setShowRemoved(event.target.checked)} /> Show removed implants</label>
          <label><input type="checkbox" checked={showNoRemoval} onChange={(event) => setShowNoRemoval(event.target.checked)} /> Show implants that do not need to be removed</label>
        </div>
      </header>
      <main style={{ flex: 1, padding: '0.8rem 1rem', overflowY: 'auto', boxSizing: 'border-box' }}>
        <fieldset style={{ border: '0.1rem solid silver', borderRadius: '0.4rem', padding: '0.65rem', margin: '0 0 0.8rem 0' }}>
          <legend style={{ padding: '0 0.35rem', fontWeight: 500 }}>Filter</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.6rem' }}>
            <FbDropdown label="Health board" value={filter.healthBoard} onChange={updateHealthBoardFilter} options={[{ value: '', label: 'All' }, ...healthBoards.map((item) => ({ value: item.value, label: item.label }))]} />
            <FbSmartDropdown label="Speciality" value={filter.speciality} onChange={(value) => setFilter((current) => ({ ...current, speciality: value }))} options={[{ value: '', label: 'All' }, ...specialityFilterOptions]} />
            <FbMSISelector
              name="implant-registry-src-filter"
              label="Senior responsible clinician"
              value={filter.src}
              coded={filter.src ? filter.srcCoded : undefined}
              onChange={(value, coded, nadexId) => setFilter((current) => ({ ...current, src: value, srcCoded: coded, srcNadexId: nadexId || '' }))}
            />
          </div>
        </fieldset>
        {loading ? (
          <div>Loading implants...</div>
        ) : (
          <div>
            <FbTable style={{ tableLayout: 'auto', width: '100%' }}>
              <FbTableHeader>
                <FbTableRow>
                  <FbTableHeaderCell style={{ whiteSpace: 'nowrap' }}>Inserted</FbTableHeaderCell>
                  <FbTableHeaderCell>Patient</FbTableHeaderCell>
                  <FbTableHeaderCell>Clinical context</FbTableHeaderCell>
                  <FbTableHeaderCell>Implant</FbTableHeaderCell>
                  <FbTableHeaderCell>Removal</FbTableHeaderCell>
                  <FbTableHeaderCell style={{ whiteSpace: 'nowrap' }}></FbTableHeaderCell>
                </FbTableRow>
              </FbTableHeader>
              <FbTableBody>
                {visibleRows.map((row) => (
                  <FbTableRow key={`${row.operation_note_uuid}-${row.operation_note_implant_row_uuid}`}>
                    <FbTableCell style={{ whiteSpace: 'nowrap', width: '1%' }}>{displayDate(row.date_inserted)}</FbTableCell>
                    <FbTableCell style={{ width: '63.6mm', minWidth: '63.6mm' }}>
                      <Addressograph {...patientProps(row)} />
                    </FbTableCell>
                    <FbTableCell style={{ overflowWrap: 'anywhere' }}>
                      {(() => {
                        const context = clinicalContextLines(row);
                        return (
                          <>
                            <div>{context.healthBoard}</div>
                            <div>{context.speciality}</div>
                            <div>{context.src}</div>
                          </>
                        );
                      })()}
                    </FbTableCell>
                    <FbTableCell style={{ overflowWrap: 'anywhere' }}>
                      <div style={{ fontWeight: 500 }}>{row.implant_id || ''}</div>
                      <div>{row.implant_description || ''}</div>
                      <details style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: '#555' }}>
                        <summary>Traceability</summary>
                        <div>Operation note {row.operation_note_uuid}</div>
                        <div>Version {row.operation_note_version}</div>
                        <div>Implant row {row.operation_note_implant_row_uuid}</div>
                      </details>
                    </FbTableCell>
                    <FbTableCell style={{ overflowWrap: 'anywhere' }}>
                      <div>{row.remove_by_display || displayDate(row.remove_by_date) || 'Not required'}</div>
                      {row.remove_by_display && row.remove_by_date && row.remove_by_display !== row.remove_by_date && <div style={{ fontSize: '0.8rem', color: '#555' }}>Sorts as {displayDate(row.remove_by_date)}</div>}
                      {row.date_removed && <div style={{ marginTop: '0.25rem' }}>Removed {displayDate(row.date_removed)}</div>}
                    </FbTableCell>
                    <FbTableCell style={{ whiteSpace: 'nowrap', width: '1%' }}>
                      <FbButtonSmaller disabled={!!row.date_removed} onClick={() => { setRemoving(row); setDateRemoved(formatFormDate(new Date())); }}>Remove</FbButtonSmaller>
                    </FbTableCell>
                  </FbTableRow>
                ))}
              </FbTableBody>
            </FbTable>
            {!visibleRows.length && <div style={{ padding: '0.8rem' }}>No implants match the current filters.</div>}
          </div>
        )}
      </main>
      <footer className="bottom-control-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0.4rem 0.8rem', borderTop: '0.2rem solid #1b6ec2', background: 'white', minHeight: '2.8rem', boxSizing: 'border-box' }}>
        <FbButton variant="primary" onClick={() => { window.location.href = window.location.pathname.startsWith('/formBuilder2/') ? '/formBuilder2/index.html' : '/'; }}>Back</FbButton>
      </footer>
      {errorModal && (
        <FbModal
          title="Error"
          footer={<div style={{ display: 'flex', justifyContent: 'flex-end' }}><FbButton variant="success" onClick={() => setErrorModal('')}>Ok</FbButton></div>}
        >
          <div style={{ maxWidth: '42rem', overflowWrap: 'anywhere' }}>{errorModal}</div>
        </FbModal>
      )}
      {removing && (
        <FbModal
          title="Confirm removed"
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <FbButton variant="success" onClick={confirmRemoved}>Confirm removed</FbButton>
              <FbButton variant="danger" onClick={() => setRemoving(null)}>Cancel</FbButton>
            </div>
          )}
        >
          <FbReadOnly label="Implant" value={`${removing.implant_id || ''} ${removing.implant_description || ''}`.trim()} />
          <FbQuestion label="Date implant removed" required>
            <FbDateExact name="dateRemoved" value={dateRemoved} onChange={setDateRemoved} required />
          </FbQuestion>
        </FbModal>
      )}
    </div>
  );
}
