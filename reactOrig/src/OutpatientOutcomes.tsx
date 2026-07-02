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
import { fbToolTipUser as FbToolTipUser, fbToolTipUserUser } from './components/fbToolTipUser';
import { fbUserName as FbUserName } from './components/fbUserName';
import OutpatientOutcome from './OutpatientOutcome';
import { specialities } from './data/specialities';
import { formatFormDate } from './utils/dateFormat';
import { createInitialCntStore } from './caseNoteTracker/cntStore';

type OutcomeRow = {
  appointment_uuid: string;
  appointment_version?: number;
  patient_uuid: string;
  appointment_datetime?: string | null;
  appointment_date?: string | null;
  appointment_time?: string | null;
  health_board?: string | null;
  facility?: string | null;
  speciality?: string | null;
  senior_responsible_clinician?: string | null;
  clinic_name?: string | null;
  outcome_form_uuid: string;
  outcome_form_status?: string | null;
  outcome_actioned_date?: string | null;
  outcome_actioned_user_id?: string | null;
  nhs_number?: string | null;
  hospital_number?: string | null;
  title?: string | null;
  surname?: string | null;
  forenames?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
};

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function defaultApiBase() {
  if (typeof window !== 'undefined' && window.location.port === '3210') return '/api';
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/formBuilder2/')) return '/formBuilder2/api';
  return '/api';
}

const apiBase = configuredApiBase || defaultApiBase();

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (text && !contentType.toLowerCase().includes('application/json')) {
    const excerpt = text.replace(/\s+/g, ' ').trim().slice(0, 220);
    throw new Error(`The Outpatient outcomes page received a non-JSON response from the server.${excerpt ? ` Response began: ${excerpt}` : ''}`);
  }
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || response.statusText);
  return data as T;
}

function uniqueOptions(rows: OutcomeRow[], key: keyof OutcomeRow) {
  return Array.from(new Set(rows.map((row) => row[key]).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
}

const cntLocations = createInitialCntStore().locations;
const cntHealthBoardOptions = Array.from(new Set(cntLocations.map((location) => location.healthBoard).filter(Boolean))).sort((a, b) => a.localeCompare(b));

function cntFacilityOptions(healthBoard: string) {
  return Array.from(new Set(cntLocations
    .filter((location) => !healthBoard || location.healthBoard === healthBoard)
    .map((location) => location.facility)
    .filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

function displayDate(value?: string | null) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatFormDate(new Date(`${value.slice(0, 10)}T00:00:00`));
  return value;
}

function displayTime(row: OutcomeRow) {
  if (row.appointment_time) return row.appointment_time;
  if (row.appointment_datetime && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(row.appointment_datetime)) return row.appointment_datetime.slice(11, 16);
  return '';
}

function patientProps(row: OutcomeRow) {
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

function clinicianMatches(rowValue: string | null | undefined, filterValue: string, filterNadexId?: string) {
  if (!filterValue && !filterNadexId) return true;
  const text = String(rowValue || '').toLowerCase();
  const value = filterValue.toLowerCase();
  const nadex = (filterNadexId || '').toLowerCase();
  if (nadex && text.includes(nadex)) return true;
  return !!value && text.includes(value);
}

function displayClinicianName(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withoutCodes = raw.replace(/\([^)]*(?:GMC|NADEX|NMC|GDC|HCPC)[^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
  const parts = withoutCodes.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const surname = parts[0].toLocaleUpperCase('en-GB');
    const firstName = parts[1].replace(/\([^)]*\)/g, '').trim().split(/\s+/)[0] || '';
    const titleSource = parts.slice(2).join(' ') || (parts[1].match(/\(([^)]+)\)/)?.[1] || '');
    const title = titleSource.replace(/\([^)]*\)/g, '').trim().split(/\s+/)[0] || '';
    return `${surname}${firstName ? `, ${firstName}` : ''}${title ? ` (${title})` : ''}`;
  }
  return raw;
}

function matchesFilter(row: OutcomeRow, filter: { healthBoard: string; facility: string; speciality: string; src: string; srcNadexId: string; clinicName: string }) {
  const pairs: Array<[keyof OutcomeRow, string]> = [
    ['health_board', filter.healthBoard],
    ['facility', filter.facility],
    ['speciality', filter.speciality],
    ['clinic_name', filter.clinicName],
  ];
  return pairs.every(([key, value]) => !value || String(row[key] || '').toLowerCase() === value.toLowerCase())
    && clinicianMatches(row.senior_responsible_clinician, filter.src, filter.srcNadexId);
}

export default function OutpatientOutcomes() {
  const [rows, setRows] = React.useState<OutcomeRow[]>([]);
  const [visibleRows, setVisibleRows] = React.useState<OutcomeRow[]>([]);
  const [showActioned, setShowActioned] = React.useState(false);
  const [filter, setFilter] = React.useState({ healthBoard: '', facility: '', speciality: '', src: '', srcCoded: false, srcNadexId: '', clinicName: '' });
  const [loading, setLoading] = React.useState(true);
  const [errorModal, setErrorModal] = React.useState('');
  const [username, setUsername] = React.useState('demoUser');
  const [actioning, setActioning] = React.useState<OutcomeRow | null>(null);
  const [dateActioned, setDateActioned] = React.useState(formatFormDate(new Date()));
  const [activeOutcome, setActiveOutcome] = React.useState<OutcomeRow | null>(null);
  const [usersByNadex, setUsersByNadex] = React.useState<Record<string, fbToolTipUserUser>>({});

  const applyFilters = React.useCallback((sourceRows: OutcomeRow[], nextFilter = filter, nextShowActioned = showActioned) => {
    setVisibleRows(sourceRows.filter((row) => (nextShowActioned || !row.outcome_actioned_date) && matchesFilter(row, nextFilter)));
  }, [filter, showActioned]);

  async function loadRows() {
    try {
      setLoading(true);
      const loadedRows = await requestJson<OutcomeRow[]>('/outpatient-outcomes');
      setRows(loadedRows);
      applyFilters(loadedRows);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void loadRows();
  }, []);

  React.useEffect(() => {
    const ids = Array.from(new Set(rows.map((row) => row.outcome_actioned_user_id).filter((id): id is string => Boolean(id))));
    if (!ids.length) return;
    const handle = window.setTimeout(async () => {
      try {
        const users = await requestJson<fbToolTipUserUser[]>('/users/by-nadex-ids', {
          method: 'POST',
          body: JSON.stringify({ nadexIds: ids }),
        });
        setUsersByNadex(Object.fromEntries(users.map((user) => [user.nadexId, user])));
      } catch {
        // Tooltip enrichment is deliberately non-blocking.
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [rows]);

  function updateFilter(next: typeof filter) {
    setFilter(next);
    applyFilters(rows, next, showActioned);
  }

  function updateHealthBoardFilter(healthBoard: string) {
    const facilities = cntFacilityOptions(healthBoard);
    const facility = filter.facility && facilities.includes(filter.facility) ? filter.facility : '';
    updateFilter({ ...filter, healthBoard, facility });
  }

  function updateShowActioned(next: boolean) {
    setShowActioned(next);
    applyFilters(rows, filter, next);
  }

  async function confirmActioned() {
    if (!actioning) return;
    try {
      const updated = await requestJson<OutcomeRow>(`/outpatient-outcomes/${encodeURIComponent(actioning.appointment_uuid)}/actioned`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome_actioned_date: dateActioned, outcome_actioned_user_id: username }),
      });
      setRows((current) => current.map((row) => row.appointment_uuid === updated.appointment_uuid ? { ...row, ...updated } : row));
      setVisibleRows((current) => current.map((row) => row.appointment_uuid === updated.appointment_uuid ? { ...row, ...updated } : row));
      setActioning(null);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : String(err));
    }
  }

  if (activeOutcome) {
    return (
      <OutpatientOutcome
        inlineProps={{
          patientUuid: activeOutcome.patient_uuid,
          formUuid: activeOutcome.outcome_form_uuid,
          openInRoV: true,
          readOnlyBackOnly: true,
          onClose: () => setActiveOutcome(null),
        }}
      />
    );
  }

  const option = (value: string) => ({ value, label: value });
  const actionedUser = actioning?.outcome_actioned_user_id ? usersByNadex[actioning.outcome_actioned_user_id] : null;

  return (
    <div style={{ height: '100vh', background: 'white', fontFamily: "'Roboto', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'white', borderBottom: '0.2rem solid #1b6ec2', padding: '1rem 1rem 0.55rem 1rem', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '1rem', fontWeight: 300, lineHeight: 1.05 }}>NHS Wales</div>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 500, lineHeight: 1.05 }}>Outpatient outcomes</h1>
        <div style={{ marginTop: '0.7rem', fontWeight: 400 }}>
          <label><input type="checkbox" checked={showActioned} onChange={(event) => updateShowActioned(event.target.checked)} /> Show actioned outcomes</label>
        </div>
      </header>
      <main style={{ flex: 1, padding: '0.8rem 1rem', overflowY: 'auto', boxSizing: 'border-box' }}>
        <fieldset style={{ border: '0.1rem solid silver', borderRadius: '0.4rem', padding: '0.65rem', margin: '0 0 0.8rem 0' }}>
          <legend style={{ padding: '0 0.35rem', fontWeight: 500 }}>Filter</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.6rem' }}>
            <FbDropdown label="Health board" value={filter.healthBoard} onChange={updateHealthBoardFilter} options={[{ value: '', label: 'All' }, ...cntHealthBoardOptions.map(option)]} />
            <FbDropdown label="Facility" value={filter.facility} onChange={(value) => updateFilter({ ...filter, facility: value })} options={[{ value: '', label: 'All' }, ...cntFacilityOptions(filter.healthBoard).map(option)]} />
            <FbSmartDropdown label="Speciality" value={filter.speciality} onChange={(value) => updateFilter({ ...filter, speciality: value })} options={[{ value: '', label: 'All' }, ...specialities]} />
            <FbMSISelector
              name="outpatient-outcomes-src-filter"
              label="Senior responsible clinician"
              value={filter.src}
              coded={filter.src ? filter.srcCoded : undefined}
              onChange={(value, coded, nadexId) => updateFilter({ ...filter, src: value, srcCoded: coded, srcNadexId: nadexId || '' })}
            />
            <FbDropdown label="Clinic name" value={filter.clinicName} onChange={(value) => updateFilter({ ...filter, clinicName: value })} options={[{ value: '', label: 'All' }, ...uniqueOptions(rows, 'clinic_name').map(option)]} />
          </div>
        </fieldset>
        {loading ? <div>Loading outcomes...</div> : (
          <>
            <FbTable style={{ tableLayout: 'auto', width: '100%' }}>
              <colgroup>
                <col style={{ width: '1%' }} />
                <col />
                <col style={{ width: '90mm' }} />
                <col style={{ width: '100%' }} />
                <col style={{ width: '1%' }} />
              </colgroup>
              <FbTableHeader>
                <FbTableRow>
                  <FbTableHeaderCell style={{ whiteSpace: 'nowrap' }}>Appointment</FbTableHeaderCell>
                  <FbTableHeaderCell style={{ whiteSpace: 'nowrap' }}>Clinic</FbTableHeaderCell>
                  <FbTableHeaderCell style={{ width: '90mm' }}>Patient</FbTableHeaderCell>
                  <FbTableHeaderCell style={{ width: '100%' }}>Actioned</FbTableHeaderCell>
                  <FbTableHeaderCell style={{ whiteSpace: 'nowrap' }}></FbTableHeaderCell>
                </FbTableRow>
              </FbTableHeader>
              <FbTableBody>
                {visibleRows.map((row) => {
                  const user = row.outcome_actioned_user_id ? usersByNadex[row.outcome_actioned_user_id] : null;
                  return (
                    <FbTableRow key={row.appointment_uuid}>
                      <FbTableCell style={{ whiteSpace: 'nowrap', width: '1%' }}>
                        <div>{displayDate(row.appointment_datetime || row.appointment_date)}</div>
                        <div>{displayTime(row)}</div>
                      </FbTableCell>
                      <FbTableCell style={{ whiteSpace: 'nowrap', overflowWrap: 'normal' }}>
                        <div>{row.clinic_name || ''}</div>
                        <div>{row.speciality || ''}</div>
                        <div>{displayClinicianName(row.senior_responsible_clinician)}</div>
                        <div>{row.facility || ''}</div>
                      </FbTableCell>
                      <FbTableCell style={{ width: '90mm', minWidth: '90mm', maxWidth: '90mm' }}>
                        <Addressograph {...patientProps(row)} />
                      </FbTableCell>
                      <FbTableCell style={{ overflowWrap: 'anywhere', whiteSpace: 'normal', width: '100%' }}>
                        {row.outcome_actioned_date && (
                          <>
                            <div>{displayDate(row.outcome_actioned_date)}</div>
                            {user ? <FbToolTipUser user={user} /> : <div>{row.outcome_actioned_user_id}</div>}
                          </>
                        )}
                      </FbTableCell>
                      <FbTableCell style={{ whiteSpace: 'nowrap', width: '1%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                          <FbButtonSmaller onClick={() => setActiveOutcome(row)}>Outcome form</FbButtonSmaller>
                        <FbButtonSmaller disabled={row.outcome_form_status !== 'final'} onClick={() => { setActioning(row); setDateActioned(formatFormDate(new Date())); }}>Actioned</FbButtonSmaller>
                        </div>
                      </FbTableCell>
                    </FbTableRow>
                  );
                })}
              </FbTableBody>
            </FbTable>
            {!visibleRows.length && <div style={{ padding: '0.8rem' }}>No outpatient outcomes match the current filters.</div>}
          </>
        )}
      </main>
      <footer className="bottom-control-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderTop: '0.2rem solid #1b6ec2', background: 'white', minHeight: '2.8rem', boxSizing: 'border-box' }}>
        <FbUserName value={username} onChange={setUsername} />
        <FbButton variant="primary" onClick={() => { window.location.href = window.location.pathname.startsWith('/formBuilder2/') ? '/formBuilder2/index.html' : '/'; }}>Back</FbButton>
      </footer>
      {errorModal && (
        <FbModal title="Error" footer={<div style={{ display: 'flex', justifyContent: 'flex-end' }}><FbButton variant="success" onClick={() => setErrorModal('')}>Ok</FbButton></div>}>
          <div style={{ maxWidth: '42rem', overflowWrap: 'anywhere' }}>{errorModal}</div>
        </FbModal>
      )}
      {actioning && (
        <FbModal
          title="Confirm actioned"
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <FbButton variant="success" onClick={confirmActioned}>Confirm actioned</FbButton>
              <FbButton variant="danger" onClick={() => setActioning(null)}>Cancel</FbButton>
            </div>
          )}
        >
          <FbReadOnly label="User id" value={username} />
          {actionedUser && <div style={{ margin: '0.4rem 0' }}><FbToolTipUser user={actionedUser} /></div>}
          <FbQuestion label="Date actioned" required>
            <FbDateExact name="dateActioned" value={dateActioned} onChange={setDateActioned} required />
          </FbQuestion>
        </FbModal>
      )}
    </div>
  );
}
