import React from 'react';
import { fbAddressograph as FbAddressograph } from '../components/fbAddressograph';
import { fbBoxedInfo as FbBoxedInfo } from '../components/fbBoxedMessage';
import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbExactDate as FbExactDate } from '../components/fbExactDate';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import { fbGroup as FbGroup } from '../components/fbGroup';
import { fbNumberInput as FbNumberInput } from '../components/fbNumberInput';
import { fbPopup as FbPopup } from '../components/fbPopup';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbRadio as FbRadio } from '../components/fbRadio';
import { fbTextArea as FbTextArea } from '../components/fbTextArea';
import { fbTextInput as FbTextInput } from '../components/fbTextInput';
import { fbToolTip as FbToolTip } from '../components/fbToolTip';
import {
  fbTable as FbTable,
  fbTableBody as FbTableBody,
  fbTableHeader as FbTableHeader,
  fbTableHeaderCell as FbTableHeaderCell,
  fbTableRow as FbTableRow,
} from '../components/fbTable';
import { fbTableCell as FbTableCell } from '../components/fbTableCell';
import type { CntClinicInstance, CntRequest, CntPatient, CntStore, CntUser, CntVolume } from './cntStore';
import { locationLabel, locationLabelForVolume, patientName } from './cntStore';
import { fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed } from './cntStyles';
import { FbGroupWithBorder } from './fbGroupWithBorder';
import { FbcntBatchVolumeSet } from './fbcntBatchVolumeSet';
import { FbcntFromLocation, FbcntLocation, FbcntToLocation } from './fbcntLocation';
import { FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSelectedVolumesReceived } from './fbcntSelectedVolumes';
import { FbcntSmallButton } from './fbcntSmallButton';
import { cntHomeEntry, pushCntNavigation } from './cntNavigation';

type View =
  | 'home'
  | 'locator'
  | 'history'
  | 'send'
  | 'receive'
  | 'batch'
  | 'tags'
  | 'requests'
  | 'inbox'
  | 'request'
  | 'requestPatient'
  | 'requestSelector'
  | 'returnList'
  | 'clinics'
  | 'myClinics'
  | 'selectClinics'
  | 'locations'
  | 'admin'
  | 'preferences'
  | 'selector'
  | 'addVolume'
  | 'batchDetail'
  | 'findBatch'
  | 'createBatch';

const patientSearchUrl = () => '/formBuilder2/index.html#/patient-search';

export function HomeView({
  setView,
  openPreferences,
  showOffline,
  simulateNhsNumberScan,
  simulateHospitalNumberScan,
  simulateVolumeNumberScan,
  simulateBatchNumberScan,
}: {
  setView: (view: View) => void;
  openPreferences: () => void;
  showOffline: () => void;
  simulateNhsNumberScan: () => void;
  simulateHospitalNumberScan: () => void;
  simulateVolumeNumberScan: () => void;
  simulateBatchNumberScan: () => void;
}) {
  const items: Array<{ target?: View; label: string; subtext?: string; href?: string; background: string; onClick?: () => void }> = [
    { label: 'Patient search', href: patientSearchUrl(), background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { target: 'batch', label: 'My batches', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'requests', label: 'Outbox', background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { target: 'inbox', label: 'Inbox', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'returnList', label: 'My return list', background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { target: 'clinics', label: 'My picklist', background: 'linear-gradient(135deg, #1b6ec2, #7048e8)' },
    { target: 'myClinics', label: 'My clinics', background: 'linear-gradient(135deg, #fd8a10, #fee715)' },
    { target: 'locations', label: 'My libraries', background: 'linear-gradient(135deg, #008000, #8cd2e7)' },
    { label: 'My preferences', background: 'linear-gradient(135deg, #1b6ec2, #008000)', onClick: openPreferences },
    { target: 'admin', label: 'Admin', subtext: 'For medical records admins', background: 'linear-gradient(135deg, #333, #8cd2e7)' },
  ];
  return (
    <section>
      <div style={styles.scanSimulationRow}>
        {[
          ['Simulate NHS number scan', simulateNhsNumberScan],
          ['Simulate hospital number scan', simulateHospitalNumberScan],
          ['Simulate volume number scan', simulateVolumeNumberScan],
          ['Simulate batch number scan', simulateBatchNumberScan],
        ].map(([label, onClick]) => (
          <button key={label as string} type="button" style={styles.scanSimulationButton} onClick={onClick as () => void}>
            {label as string}
          </button>
        ))}
      </div>
      <div style={styles.grid}>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            style={{ ...styles.homeButton, background: item.background, color: item.label === 'My clinics' ? 'black' : 'white' }}
            onClick={() => {
              if (item.href) {
                pushCntNavigation(cntHomeEntry());
                window.location.href = item.href;
              }
              else if (item.onClick) item.onClick();
              else if (item.target) setView(item.target);
            }}
          >
            <span style={{ display: 'block', fontSize: '1.35rem', fontWeight: 500 }}>{item.label}</span>
            {item.subtext && <span style={{ display: 'block', marginTop: '0.35rem', fontWeight: 300 }}>{item.subtext}</span>}
          </button>
        ))}
        <button type="button" style={{ ...styles.homeButton, background: fbOrange, color: 'black' }} onClick={showOffline}>
          Show offline warning
        </button>
      </div>
    </section>
  );
}

export function PreferencesView({
  store,
  healthBoard,
  setHealthBoard,
  locality,
  setLocality,
  facility,
  setFacility,
}: {
  store: CntStore;
  healthBoard: string;
  setHealthBoard: (value: string) => void;
  locality: string;
  setLocality: (value: string) => void;
  facility: string;
  setFacility: (value: string) => void;
}) {
  const healthBoardOptions = uniqueValues(store.locations.map((location) => location.healthBoard));
  const localityOptions = uniqueValues(store.locations
    .filter((location) => !healthBoard || location.healthBoard === healthBoard)
    .map((location) => location.locality));
  const facilityOptions = uniqueValues(store.locations
    .filter((location) => (!healthBoard || location.healthBoard === healthBoard) && (!locality || location.locality === locality))
    .map((location) => location.facility));
  return (
    <section style={styles.preferencesPage}>
      <FbBoxedInfo text="In demo versions, this user preferences page is displayed after every login." />
      <FbDropdown
        label="Health board"
        value={healthBoard}
        onChange={(value) => {
          setHealthBoard(value);
          const nextLocality = store.locations.find((location) => location.healthBoard === value)?.locality || '';
          setLocality(nextLocality);
          const nextFacility = store.locations.find((location) => location.healthBoard === value && location.locality === nextLocality)?.facility || '';
          setFacility(nextFacility);
        }}
        options={healthBoardOptions}
      />
      <FbDropdown
        label="Locality"
        value={locality}
        onChange={(value) => {
          setLocality(value);
          const nextFacility = store.locations.find((location) => (!healthBoard || location.healthBoard === healthBoard) && location.locality === value)?.facility || '';
          setFacility(nextFacility);
        }}
        options={localityOptions}
      />
      <FbDropdown
        label="Facility"
        value={facility}
        onChange={setFacility}
        options={facilityOptions}
      />
    </section>
  );
}

export function LocatorView({
  store,
  selectedPatientUuid,
  selectedVolumeUuids,
  toggleVolume,
  openHistory,
}: {
  store: CntStore;
  selectedPatientUuid: string;
  selectedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
  openHistory: (volumeUuid: string) => void;
}) {
  const patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
  const volumes = store.volumes
    .filter((volume) => volume.patientUuid === selectedPatientUuid)
    .sort(volumeSort);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  if (!patient) {
    return <PatientChooser store={store} />;
  }

  const toggleCollapsed = (key: string) => setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  const tree = buildVolumeTree(volumes);

  return (
    <section style={styles.locatorShell}>
      <div style={styles.locatorScroll}>
      <div style={styles.tree}>
        {Object.entries(tree).map(([hb, localities]) => (
          <TreeNode
            key={hb}
            label={hb}
            level={0}
            nodeKey={`hb:${hb}`}
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
            preventCollapse={volumes.some((volume) => volume.healthBoard === hb && selectedVolumeUuids.includes(volume.uuid))}
          >
            {Object.entries(localities).map(([locality, types]) => (
              <TreeNode
                key={locality}
                label={locality}
                level={1}
                nodeKey={`loc:${hb}:${locality}`}
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
                preventCollapse={volumes.some((volume) => volume.healthBoard === hb && volume.locality === locality && selectedVolumeUuids.includes(volume.uuid))}
              >
                {Object.entries(types).map(([type, items]) => (
                  <TreeNode
                    key={type}
                    label={type}
                    level={2}
                    nodeKey={`type:${hb}:${locality}:${type}`}
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                    preventCollapse={items.some((volume) => selectedVolumeUuids.includes(volume.uuid))}
                  >
                    {items.map((volume) => (
                      <HighlightBlock
                        key={volume.uuid}
                        level={3}
                        style={{ ...styles.volumeRow, gridTemplateColumns: 'minmax(10rem, 1fr) 2fr auto', paddingLeft: '4.8rem' }}
                        tabIndex={0}
                      >
                        <label style={styles.volumeLabel}>
                          <input
                            type="checkbox"
                            checked={selectedVolumeUuids.includes(volume.uuid)}
                            onChange={() => toggleVolume(volume.uuid)}
                          />
                          <span>Volume {volume.volumeNumber}{volume.temporary ? ' temporary' : ''}</span>
                        </label>
                        <span style={styles.volumeMeta}>
                          {locationLabelForVolume(store, volume)}
                          <VolumeTagLine store={store} volume={volume} />
                        </span>
                        <FbcntSmallButton onClick={() => openHistory(volume.uuid)}>History</FbcntSmallButton>
                      </HighlightBlock>
                    ))}
                  </TreeNode>
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        ))}
      </div>
      </div>
    </section>
  );
}

function TreeNode({
  label,
  level,
  nodeKey,
  collapsed,
  toggleCollapsed,
  preventCollapse = false,
  children,
}: {
  key?: React.Key;
  label: string;
  level: number;
  nodeKey: string;
  collapsed: Record<string, boolean>;
  toggleCollapsed: (key: string) => void;
  preventCollapse?: boolean;
  children: React.ReactNode;
}) {
  const isCollapsed = !!collapsed[nodeKey];
  return (
    <HighlightBlock level={level}>
      <button
        type="button"
        style={{ ...styles.treeToggle, paddingLeft: `${level * 1.6}rem`, backgroundColor: 'transparent' }}
        onClick={() => {
          if (!isCollapsed && preventCollapse) return;
          toggleCollapsed(nodeKey);
        }}
        aria-disabled={!isCollapsed && preventCollapse}
      >
        <span aria-hidden="true">{isCollapsed ? '\u25b6' : '\u25bc'}</span>
        <strong>{label}</strong>
      </button>
      {!isCollapsed && <div>{children}</div>}
    </HighlightBlock>
  );
}

function HighlightBlock({
  level,
  style,
  tabIndex,
  children,
}: {
  key?: React.Key;
  level: number;
  style?: React.CSSProperties;
  tabIndex?: number;
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState(false);
  return (
    <div
      className={`fbcnt-highlight-level fbcnt-highlight-level-${level}`}
      style={{ ...style, ...highlightStyleForLevel(level, active) }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={() => setActive(false)}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
}

function VolumeTagLine({ store, volume }: { store: CntStore; volume: CntVolume }) {
  const tags = store.tags.filter((tag) => tag.volumeUuid === volume.uuid && tag.status === 'active');
  if (!tags.length) return null;
  const abbreviated = tags.map((tag) => tag.purpose.slice(0, 18)).join('; ');
  const full = tags.map((tag) => {
    const createdBy = store.users.find((user) => user.uuid === tag.createdByUserUuid);
    return [
      `Purpose: ${tag.purpose}`,
      `Location: ${locationLabel(store, tag.locationUuid)}`,
      `Required by: ${new Date(tag.requiredBy).toLocaleString('en-GB')}`,
      `Expires: ${new Date(tag.expiresAt).toLocaleString('en-GB')}`,
      `Created by: ${createdBy ? `${createdBy.firstNames} ${createdBy.surname}` : tag.createdByUserUuid}`,
    ].join('\n');
  }).join('\n\n');
  return <TagTooltipLine text={`Tags: ${abbreviated}`} tooltip={full} />;
}

function TagTooltipLine({ text, tooltip }: { text: string; tooltip: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const showTooltip = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: Math.max(10, Math.min(rect.left, window.innerWidth - 260)),
      y: Math.max(10, rect.bottom + 4),
    });
  };
  return (
    <>
      <div
        ref={ref}
        style={styles.tagLine}
        tabIndex={0}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setPosition(null)}
      >
        {text}
      </div>
      {position && <FbToolTip x={position.x} y={position.y} text={tooltip} />}
    </>
  );
}

function PatientChooser({ store }: { store: CntStore }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Patients in simulated index</h2>
      <p>Open a patient from Patient search or Patient registry.</p>
      <div style={styles.grid}>
        {store.patients.map((patient) => (
          <div key={patient.uuid} style={styles.miniCard}>
            <strong>{patient.name}</strong>
            <div>NHS {patient.nhsNumber}</div>
            <div>Hospital {patient.hospitalNumber}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SelectorView({
  store,
  selectedPatientUuid,
  selectedVolumeUuids,
  toggleVolume,
}: {
  store: CntStore;
  selectedPatientUuid: string;
  selectedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
}) {
  const patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
  const volumes = store.volumes
    .filter((volume) => volume.patientUuid === selectedPatientUuid)
    .sort(volumeSort);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  if (!patient) return <PatientChooser store={store} />;
  const toggleCollapsed = (key: string) => setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  const tree = buildVolumeTree(volumes);
  return (
    <section style={styles.locatorShell}>
      <div style={styles.locatorScroll}>
        <div style={styles.tree}>
          {Object.entries(tree).map(([hb, localities]) => (
            <TreeNode
              key={hb}
              label={hb}
              level={0}
              nodeKey={`selector-hb:${hb}`}
              collapsed={collapsed}
              toggleCollapsed={toggleCollapsed}
              preventCollapse={volumes.some((volume) => volume.healthBoard === hb && selectedVolumeUuids.includes(volume.uuid))}
            >
              {Object.entries(localities).map(([locality, types]) => (
                <TreeNode
                  key={locality}
                  label={locality}
                  level={1}
                  nodeKey={`selector-loc:${hb}:${locality}`}
                  collapsed={collapsed}
                  toggleCollapsed={toggleCollapsed}
                  preventCollapse={volumes.some((volume) => volume.healthBoard === hb && volume.locality === locality && selectedVolumeUuids.includes(volume.uuid))}
                >
                  {Object.entries(types).map(([type, items]) => (
                    <TreeNode
                      key={type}
                      label={type}
                      level={2}
                      nodeKey={`selector-type:${hb}:${locality}:${type}`}
                      collapsed={collapsed}
                      toggleCollapsed={toggleCollapsed}
                      preventCollapse={items.some((volume) => selectedVolumeUuids.includes(volume.uuid))}
                    >
                      {items.map((volume) => (
                        <HighlightBlock
                          key={volume.uuid}
                          level={3}
                          style={{ ...styles.volumeRow, gridTemplateColumns: 'minmax(10rem, 1fr) 2fr auto', paddingLeft: '4.8rem' }}
                          tabIndex={0}
                        >
                          <label style={styles.volumeLabel}>
                            <input
                              type="checkbox"
                              checked={selectedVolumeUuids.includes(volume.uuid)}
                              onChange={() => toggleVolume(volume.uuid)}
                            />
                            <span>Volume {volume.volumeNumber}{volume.temporary ? ' temporary' : ''}</span>
                          </label>
                          <span style={styles.volumeMeta}>{locationLabelForVolume(store, volume)}</span>
                        </HighlightBlock>
                      ))}
                    </TreeNode>
                  ))}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HistoryView({ store, volumes }: { store: CntStore; volumes: CntVolume[] }) {
  const events = volumes
    .flatMap((volume) => volume.events.map((event) => ({ ...event, volume })))
    .sort((a, b) => b.datetime.localeCompare(a.datetime));
  return (
    <div style={styles.fullHeightTableWrap}>
      <FbTable aria-label="Volume history">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Date/time</FbTableHeaderCell>
            <FbTableHeaderCell>Event</FbTableHeaderCell>
            <FbTableHeaderCell>From</FbTableHeaderCell>
            <FbTableHeaderCell>To</FbTableHeaderCell>
            <FbTableHeaderCell>Note</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {events.map((event) => (
            <FbTableRow key={event.uuid}>
              <FbTableCell>{new Date(event.datetime).toLocaleString('en-GB')}</FbTableCell>
              <FbTableCell>{event.kind}</FbTableCell>
              <FbTableCell>{locationLabel(store, event.fromLocationUuid)}</FbTableCell>
              <FbTableCell>{locationLabel(store, event.toLocationUuid)}</FbTableCell>
              <FbTableCell>{event.note}</FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

export function AddVolumePage({
  store,
  createdDate,
  setCreatedDate,
  healthBoard,
  setHealthBoard,
  locality,
  setLocality,
  volumeType,
  setVolumeType,
  status,
  setStatus,
  volumeNumber,
  setVolumeNumber,
  initialLocationUuid,
  setInitialLocationUuid,
  barcode,
  setBarcode,
  rfid,
  setRfid,
}: {
  store: CntStore;
  createdDate: string;
  setCreatedDate: (value: string) => void;
  healthBoard: string;
  setHealthBoard: (value: string) => void;
  locality: string;
  setLocality: (value: string) => void;
  volumeType: string;
  setVolumeType: (value: string) => void;
  status: 'Permanent' | 'Temporary';
  setStatus: (value: 'Permanent' | 'Temporary') => void;
  volumeNumber: string;
  setVolumeNumber: (value: string) => void;
  initialLocationUuid: string;
  setInitialLocationUuid: (value: string) => void;
  barcode: string;
  setBarcode: (value: string) => void;
  rfid: string;
  setRfid: (value: string) => void;
}) {
  const healthBoardOptions = uniqueValues(store.locations.map((location) => location.healthBoard));
  const localityOptions = uniqueValues(store.locations
    .filter((location) => !healthBoard || location.healthBoard === healthBoard)
    .map((location) => location.locality));
  const typeOptions = uniqueValues(store.volumes.map((volume) => volume.type).concat(['General', 'Surgery', 'Temporary']));
  return (
    <section style={styles.addVolumePage}>
      <FbQuestion label="Created">
        <FbExactDate name="cnt-add-volume-created" value={createdDate} onChange={setCreatedDate} required />
      </FbQuestion>
      <FbDropdown
        label="Health board"
        value={healthBoard}
        onChange={(value) => {
          setHealthBoard(value);
          const stillValidLocality = store.locations.some((location) => location.healthBoard === value && location.locality === locality);
          if (!stillValidLocality) {
            const firstLocality = store.locations.find((location) => location.healthBoard === value)?.locality || '';
            setLocality(firstLocality);
          }
        }}
        options={healthBoardOptions}
      />
      <FbDropdown
        label="Locality"
        value={locality}
        onChange={setLocality}
        options={localityOptions}
      />
      <FbDropdown
        label="Type"
        value={volumeType}
        onChange={setVolumeType}
        options={typeOptions}
      />
      <FbGroup label="Status" labelStyle={{ fontWeight: 500 }}>
        <FbRadio
          name="cnt-add-volume-status"
          value="Permanent"
          checked={status === 'Permanent'}
          onChange={() => setStatus('Permanent')}
          label="Permanent"
        >
          <FbNumberInput label="Volume number" value={volumeNumber} onChange={setVolumeNumber} min={1} subfield />
        </FbRadio>
        <FbRadio
          name="cnt-add-volume-status"
          value="Temporary"
          checked={status === 'Temporary'}
          onChange={() => setStatus('Temporary')}
          label="Temporary"
        />
      </FbGroup>
      <FbcntLocation label="Initial location" store={store} value={initialLocationUuid} onChange={setInitialLocationUuid} />
      <FbTextInput label="Bar code" value={barcode} onChange={setBarcode} />
      <FbTextInput label="RfID" value={rfid} onChange={setRfid} />
    </section>
  );
}

export function MovementPopup({
  title,
  store,
  fromLocationUuid,
  toLocationUuid,
  setFromLocationUuid,
  setToLocationUuid,
  actionLabel,
  onAction,
  onCancel,
}: {
  title: string;
  store: CntStore;
  fromLocationUuid: string;
  toLocationUuid: string;
  setFromLocationUuid: (value: string) => void;
  setToLocationUuid: (value: string) => void;
  actionLabel: string;
  onAction: () => void;
  onCancel: () => void;
}) {
  return (
    <FbPopup
      title={title}
      maxWidth="80vw"
      footer={
        <div style={styles.popupFooter}>
          <button type="button" style={styles.sendButton} onClick={onAction}>{actionLabel}</button>
          <button type="button" style={styles.cancelButton} onClick={onCancel}>Cancel</button>
        </div>
      }
    >
      <div style={styles.locationPopupStack}>
        <FbcntFromLocation store={store} value={fromLocationUuid} onChange={setFromLocationUuid} allowBlank />
        <FbcntToLocation store={store} value={toLocationUuid} onChange={setToLocationUuid} />
      </div>
    </FbPopup>
  );
}

export function CreateBatchPage({
  store,
  purpose,
  setPurpose,
  currentLocationUuid,
  setCurrentLocationUuid,
  destinationUuid,
  setDestinationUuid,
  barcode,
  setBarcode,
}: {
  store: CntStore;
  purpose: string;
  setPurpose: (value: string) => void;
  currentLocationUuid: string;
  setCurrentLocationUuid: (value: string) => void;
  destinationUuid: string;
  setDestinationUuid: (value: string) => void;
  barcode: string;
  setBarcode: (value: string) => void;
}) {
  return (
    <section style={styles.addVolumePage}>
      <FbTextArea label="Purpose" value={purpose} onChange={setPurpose} fullWidth />
      <FbcntLocation label="Current location" store={store} value={currentLocationUuid} onChange={setCurrentLocationUuid} />
      <FbcntLocation label="Intended destination" store={store} value={destinationUuid} onChange={setDestinationUuid} />
      <FbTextInput label="Bar code" value={barcode} onChange={setBarcode} />
    </section>
  );
}

export function BatchView({
  store,
  userUuid,
  openBatch,
  removeBatchFavourite,
}: {
  store: CntStore;
  userUuid: string;
  openBatch: (batchUuid: string) => void;
  removeBatchFavourite: (batchUuid: string) => void;
}) {
  const favouriteUuids = userBatchUuids(store, userUuid);
  const batches = store.batches.filter((batch) => favouriteUuids.includes(batch.uuid));
  return (
    <div style={styles.tablePageStack}>
      <FbTable aria-label="My batches">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Batch</FbTableHeaderCell>
            <FbTableHeaderCell>Purpose</FbTableHeaderCell>
            <FbTableHeaderCell>Volumes</FbTableHeaderCell>
            <FbTableHeaderCell>Destination</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '8rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {batches.map((batch) => (
            <FbTableRow key={batch.uuid}>
              <FbTableCell><strong>{batch.barcode}</strong></FbTableCell>
              <FbTableCell>{batch.intendedPurpose}</FbTableCell>
              <FbTableCell>{batch.volumeUuids.length} volumes</FbTableCell>
              <FbTableCell>{locationLabel(store, batch.intendedDestinationUuid)}</FbTableCell>
              <FbTableCell style={{ textAlign: 'right' }}>
                <div style={styles.stackedButtons}>
                  <FbcntSmallButton onClick={() => openBatch(batch.uuid)}>Open</FbcntSmallButton>
                  <FbcntSmallButton onClick={() => removeBatchFavourite(batch.uuid)}>Remove</FbcntSmallButton>
                </div>
              </FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
      {!batches.length && <p style={styles.note}>No favourite batches.</p>}
    </div>
  );
}

export function FindBatchView({
  store,
  userUuid,
  filter,
  setFilter,
  addBatchFavourite,
}: {
  store: CntStore;
  userUuid: string;
  filter: { healthBoard: string; locality: string; facility: string; purpose: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; purpose: string }) => void;
  addBatchFavourite: (batchUuid: string) => void;
}) {
  const favouriteUuids = new Set(userBatchUuids(store, userUuid));
  const batches = store.batches
    .filter((batch) => !favouriteUuids.has(batch.uuid))
    .filter((batch) => {
      const location = store.locations.find((item) => item.uuid === batch.currentLocationUuid);
      return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
        && (!filter.locality || location?.locality === filter.locality)
        && (!filter.facility || location?.facility === filter.facility)
        && (!filter.purpose || batch.intendedPurpose === filter.purpose);
    });
  return (
    <div style={styles.selectClinicsPage}>
      <FbcntBatchFilter store={store} filter={filter} setFilter={setFilter} />
      <div style={styles.selectClinicsTableWrap}>
        <FbTable aria-label="Find batch">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell>Batch</FbTableHeaderCell>
              <FbTableHeaderCell>Purpose</FbTableHeaderCell>
              <FbTableHeaderCell>Current location</FbTableHeaderCell>
              <FbTableHeaderCell>Destination</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '5rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {batches.map((batch) => (
              <FbTableRow key={batch.uuid}>
                <FbTableCell><strong>{batch.barcode}</strong></FbTableCell>
                <FbTableCell>{batch.intendedPurpose}</FbTableCell>
                <FbTableCell>{locationLabel(store, batch.currentLocationUuid)}</FbTableCell>
                <FbTableCell>{locationLabel(store, batch.intendedDestinationUuid)}</FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <FbcntSmallButton onClick={() => addBatchFavourite(batch.uuid)}>Select</FbcntSmallButton>
                </FbTableCell>
              </FbTableRow>
            ))}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

function FbcntBatchFilter({
  store,
  filter,
  setFilter,
}: {
  store: CntStore;
  filter: { healthBoard: string; locality: string; facility: string; purpose: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; purpose: string }) => void;
}) {
  const optionValues = {
    healthBoard: uniqueValues(store.locations.map((location) => location.healthBoard)),
    locality: uniqueValues(store.locations.map((location) => location.locality)),
    facility: uniqueValues(store.locations.map((location) => location.facility)),
    purpose: uniqueValues(store.batches.map((batch) => batch.intendedPurpose)),
  };
  const setOne = (key: keyof typeof filter, value: string) => setFilter({ ...filter, [key]: value });
  return (
    <FbGroupWithBorder label="Filter">
      <FbGridRow cols={4} style={{ marginBottom: 0 }}>
        <FbGridCell>
          <FbDropdown label="Health board" value={filter.healthBoard} onChange={(value) => setOne('healthBoard', value)} options={optionValues.healthBoard} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Locality" value={filter.locality} onChange={(value) => setOne('locality', value)} options={optionValues.locality} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Facility" value={filter.facility} onChange={(value) => setOne('facility', value)} options={optionValues.facility} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Purpose" value={filter.purpose} onChange={(value) => setOne('purpose', value)} options={optionValues.purpose} placeholder="All" subfield />
        </FbGridCell>
      </FbGridRow>
    </FbGroupWithBorder>
  );
}

export function BatchDetailView({
  store,
  batchUuid,
  removeVolumeFromBatch,
}: {
  store: CntStore;
  batchUuid: string;
  removeVolumeFromBatch: (batchUuid: string, volumeUuid: string) => void;
}) {
  const batch = store.batches.find((item) => item.uuid === batchUuid);
  if (!batch) return <p style={styles.note}>Batch not found.</p>;
  const volumes = store.volumes.filter((volume) => batch.volumeUuids.includes(volume.uuid)).sort(volumeSort);
  const patientGroups = uniqueValues(volumes.map((volume) => volume.patientUuid));
  return (
    <div style={styles.tablePageStack}>
      {patientGroups.map((patientUuid) => {
        const patient = store.patients.find((item) => item.uuid === patientUuid);
        const patientVolumes = volumes.filter((volume) => volume.patientUuid === patientUuid);
        return (
          <section key={patientUuid} style={styles.batchPatientGroup}>
            {patient && <PatientAddressograph patient={patient} />}
            <FbcntBatchVolumeSet
              volumes={patientVolumes}
              onRemoveVolume={(volumeUuid) => removeVolumeFromBatch(batch.uuid, volumeUuid)}
            />
          </section>
        );
      })}
      {!volumes.length && <p style={styles.note}>No volumes in this batch.</p>}
    </div>
  );
}

export function BatchSelectedPopup({
  store,
  userUuid,
  onSelectBatch,
  onCancel,
}: {
  store: CntStore;
  userUuid: string;
  onSelectBatch: (batchUuid: string) => void;
  onCancel: () => void;
}) {
  const batches = store.batches.filter((batch) => userBatchUuids(store, userUuid).includes(batch.uuid));
  return (
    <FbPopup
      title="Batch selected volumes"
      footer={<div style={styles.popupFooter}><button type="button" style={styles.cancelButton} onClick={onCancel}>Cancel</button></div>}
    >
      <div style={styles.batchPopupList}>
        {batches.map((batch) => (
          <button key={batch.uuid} type="button" style={styles.batchPopupButton} onClick={() => onSelectBatch(batch.uuid)}>
            <strong>{batch.barcode}</strong>
            <span>{batch.intendedPurpose}</span>
            <span>{batch.volumeUuids.length} volumes</span>
          </button>
        ))}
        {!batches.length && <p>No favourite batches.</p>}
      </div>
    </FbPopup>
  );
}

export function TagsView({ store }: { store: CntStore }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Tags</h2>
      <FbTable aria-label="Tags">
        <FbTableBody>
          {store.tags.map((tag) => {
            const volume = store.volumes.find((item) => item.uuid === tag.volumeUuid);
            return (
              <FbTableRow key={tag.uuid}>
                <FbTableCell>{volume ? `Volume ${volume.volumeNumber}` : ''}</FbTableCell>
                <FbTableCell>{patientName(store, tag.patientUuid)}</FbTableCell>
                <FbTableCell>{tag.purpose}</FbTableCell>
                <FbTableCell>{new Date(tag.requiredBy).toLocaleDateString('en-GB')}</FbTableCell>
                <FbTableCell>{tag.status}</FbTableCell>
              </FbTableRow>
            );
          })}
        </FbTableBody>
      </FbTable>
    </section>
  );
}

export function RequestsView({
  store,
  userUuid,
  mode,
  cancelRequestRow,
  openRequestLocator,
  sendRequestRow,
  doneRequestRow,
}: {
  store: CntStore;
  userUuid: string;
  mode: 'outbox' | 'inbox';
  cancelRequestRow?: (row: RequestRow) => void;
  openRequestLocator?: (row: RequestRow) => void;
  sendRequestRow?: (row: RequestRow) => void;
  doneRequestRow?: (row: RequestRow) => void;
}) {
  const rows = requestRows(store, mode === 'outbox'
    ? store.requests.filter((request) => request.requestedByUserUuid === userUuid && request.status !== 'cancelled')
    : store.requests.filter((request) => {
      const destination = store.locations.find((location) => location.uuid === request.toLocationUuid);
      return request.status === 'open' && !!destination?.custodianUserUuids.includes(userUuid);
    }));
  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label={mode === 'outbox' ? 'Outbox' : 'Inbox'}>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell>Case notes</FbTableHeaderCell>
            <FbTableHeaderCell>Request</FbTableHeaderCell>
            <FbTableHeaderCell>From</FbTableHeaderCell>
            <FbTableHeaderCell>To</FbTableHeaderCell>
            <FbTableHeaderCell>Status</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '8rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {rows.map((row) => {
            const patient = store.patients.find((item) => item.uuid === row.patientUuid);
            const volumes = store.volumes.filter((volume) => row.volumeUuids.includes(volume.uuid)).sort(volumeSort);
            return (
              <FbTableRow key={row.key}>
                <FbTableCell>{patient && <PatientAddressograph patient={patient} />}</FbTableCell>
                <FbTableCell><FbcntSelectedVolumes volumes={volumes} /></FbTableCell>
                <FbTableCell>
                  <div>{row.requiredFor}</div>
                  <div>{formatClinicalDate(row.requiredBy.slice(0, 10))}</div>
                </FbTableCell>
                <FbTableCell>{locationLabel(store, row.fromLocationUuid)}</FbTableCell>
                <FbTableCell>{locationLabel(store, row.toLocationUuid)}</FbTableCell>
                <FbTableCell>{row.status}</FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <div style={styles.stackedButtons}>
                    {mode === 'outbox' && (
                      <>
                        <FbcntSmallButton onClick={() => cancelRequestRow?.(row)}>Cancel</FbcntSmallButton>
                        <FbcntSmallButton onClick={() => openRequestLocator?.(row)}>Locator</FbcntSmallButton>
                      </>
                    )}
                    {mode === 'inbox' && (
                      <>
                        <FbcntSmallButton onClick={() => sendRequestRow?.(row)}>Send</FbcntSmallButton>
                        <FbcntSmallButton onClick={() => doneRequestRow?.(row)}>Done</FbcntSmallButton>
                      </>
                    )}
                  </div>
                </FbTableCell>
              </FbTableRow>
            );
          })}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

export function ReturnListView({
  store,
  removedPatientUuids,
  sendReturnRow,
  removeReturnRow,
}: {
  store: CntStore;
  removedPatientUuids: string[];
  sendReturnRow: (patientUuid: string, volumeUuids: string[], locationUuid: string) => void;
  removeReturnRow: (patientUuid: string) => void;
}) {
  const volumes = store.volumes.filter((volume) => volume.events.at(-1)?.kind === 'received');
  const patientUuids = uniqueValues(volumes.map((volume) => volume.patientUuid)).filter((patientUuid) => !removedPatientUuids.includes(patientUuid));
  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="My return list">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell style={{ width: '9rem' }}>Appointment</FbTableHeaderCell>
            <FbTableHeaderCell>Clinic</FbTableHeaderCell>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell>Volumes required</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '6rem' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {patientUuids.map((patientUuid) => {
            const patient = store.patients.find((item) => item.uuid === patientUuid);
            const patientVolumes = volumes.filter((volume) => volume.patientUuid === patientUuid).sort(volumeSort);
            const latestReceived = patientVolumes
              .map((volume) => volume.events.at(-1))
              .filter((event) => event?.kind === 'received')
              .sort((a, b) => String(b?.datetime).localeCompare(String(a?.datetime)))[0];
            const receivedDate = latestReceived?.datetime?.slice(0, 10) || new Date().toISOString().slice(0, 10);
            const receivedTime = latestReceived?.datetime?.slice(11, 16) || '';
            const currentLocationUuid = patientVolumes[0]?.currentLocationUuid || '';
            const returnClinicSummary = clinicSummaryForReturnList(store, patientVolumes);
            return (
              <FbTableRow key={patientUuid}>
                <FbTableCell>
                  {formatClinicalDate(receivedDate)}
                  {receivedTime && (
                    <>
                      <br />
                      {receivedTime}
                    </>
                  )}
                </FbTableCell>
                <FbTableCell>{returnClinicSummary ? renderMultiline(returnClinicSummary) : 'Return list'}</FbTableCell>
                <FbTableCell>{patient && <PatientAddressograph patient={patient} />}</FbTableCell>
                <FbTableCell>
                  <FbcntSelectedVolumesLocation store={store} volumes={patientVolumes} pickListEntries={[]} />
                </FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <div style={styles.stackedButtons}>
                    <FbcntSmallButton onClick={() => sendReturnRow(patientUuid, patientVolumes.map((volume) => volume.uuid), currentLocationUuid)}>Send</FbcntSmallButton>
                    <FbcntSmallButton onClick={() => removeReturnRow(patientUuid)}>Remove</FbcntSmallButton>
                  </div>
                </FbTableCell>
              </FbTableRow>
            );
          })}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

export function RequestPage({
  store,
  patientUuid,
  openPatientSelector,
  openVolumeSelector,
  selectedVolumeUuids,
  requiredFor,
  setRequiredFor,
  fromLocationUuid,
  setFromLocationUuid,
  toLocationUuid,
  setToLocationUuid,
}: {
  store: CntStore;
  patientUuid: string;
  openPatientSelector: () => void;
  openVolumeSelector: () => void;
  selectedVolumeUuids: string[];
  requiredFor: string;
  setRequiredFor: (value: string) => void;
  fromLocationUuid: string;
  setFromLocationUuid: (value: string) => void;
  toLocationUuid: string;
  setToLocationUuid: (value: string) => void;
}) {
  const patient = store.patients.find((item) => item.uuid === patientUuid);
  const selectedVolumesForRequest = store.volumes.filter((volume) => selectedVolumeUuids.includes(volume.uuid)).sort(volumeSort);
  return (
    <section style={styles.addVolumePage}>
      <div style={styles.patientRequestBlock}>
        {patient ? <PatientAddressograph patient={patient} /> : <p style={styles.note}>No patient selected.</p>}
        <div style={styles.inlineActions}>
          <FbcntSmallButton onClick={openPatientSelector}>Select patient</FbcntSmallButton>
        </div>
      </div>
      <FbTextInput label="Required for" value={requiredFor} onChange={setRequiredFor} />
      <FbcntLocation label="From" store={store} value={fromLocationUuid} onChange={setFromLocationUuid} />
      <FbcntLocation label="To" store={store} value={toLocationUuid} onChange={setToLocationUuid} />
      <FbGroupWithBorder label="Case notes">
        <FbcntSelectedVolumes volumes={selectedVolumesForRequest} />
        <div style={styles.inlineActions}>
          <FbcntSmallButton onClick={openVolumeSelector}>Select</FbcntSmallButton>
        </div>
      </FbGroupWithBorder>
    </section>
  );
}

export function RequestPatientSelectPage({ store, selectPatient }: { store: CntStore; selectPatient: (patientUuid: string) => void }) {
  const patients = [...store.patients].sort((a, b) => patientName(store, a.uuid).localeCompare(patientName(store, b.uuid)));
  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="Select patient">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '6rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {patients.map((patient) => (
            <FbTableRow key={patient.uuid}>
              <FbTableCell><PatientAddressograph patient={patient} /></FbTableCell>
              <FbTableCell style={{ textAlign: 'right' }}>
                <FbcntSmallButton onClick={() => selectPatient(patient.uuid)}>Select</FbcntSmallButton>
              </FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

export function PicklistView({
  store,
  userUuid,
  openPickListSelector,
  openPickListReceive,
}: {
  store: CntStore;
  userUuid: string;
  openPickListSelector: (clinicInstanceUuid: string, patientUuid: string) => void;
  openPickListReceive: (clinicInstanceUuid: string, patientUuid: string) => void;
}) {
  const rows = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
    .flatMap((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      const seenAppointmentKeys = new Set<string>();
      return instance.appointments
        .filter((appointment) => !appointment.cancelled)
        .filter((appointment) => {
          const key = `${instance.uuid}:${appointment.time}:${appointment.patientUuid}`;
          if (seenAppointmentKeys.has(key)) return false;
          seenAppointmentKeys.add(key);
          return true;
        })
        .map((appointment) => ({ instance, clinic, appointment }));
    })
    .sort((a, b) => `${a.instance.date} ${a.appointment.time}`.localeCompare(`${b.instance.date} ${b.appointment.time}`));

  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="My picklist appointments">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell style={{ width: '9rem' }}>Appointment</FbTableHeaderCell>
            <FbTableHeaderCell>Clinic</FbTableHeaderCell>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell>Volumes required</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '6rem' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {rows.map(({ instance, clinic, appointment }) => {
            const patient = store.patients.find((item) => item.uuid === appointment.patientUuid);
            const volumes = store.volumes.filter((volume) => volume.patientUuid === appointment.patientUuid).sort(volumeSort);
            const selectedEntries = store.cntPickList.filter((entry) =>
              entry.clinicInstanceUuid === instance.uuid
              && volumes.some((volume) => volume.uuid === entry.volumeUuid)
            );
            const selectedVolumesForRow = volumes.filter((volume) => selectedEntries.some((entry) => entry.volumeUuid === volume.uuid));
            return (
              <FbTableRow key={appointment.uuid}>
                <FbTableCell>
                  {formatClinicalDate(instance.date)}
                  <br />
                  {appointment.time}
                </FbTableCell>
                <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                <FbTableCell>{patient && <PatientAddressograph patient={patient} />}</FbTableCell>
                <FbTableCell style={{ verticalAlign: 'top' }}>
                  <FbcntSelectedVolumesLocation
                    store={store}
                    volumes={selectedVolumesForRow}
                    pickListEntries={selectedEntries}
                  />
                </FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <div style={styles.stackedButtons}>
                    <FbcntSmallButton onClick={() => openPickListSelector(instance.uuid, appointment.patientUuid)}>Select</FbcntSmallButton>
                    <FbcntSmallButton onClick={() => openPickListReceive(instance.uuid, appointment.patientUuid)}>Receive</FbcntSmallButton>
                  </div>
                </FbTableCell>
              </FbTableRow>
            );
          })}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

export function MyClinicsView({
  store,
  userUuid,
  confirmStopClinic,
}: {
  store: CntStore;
  userUuid: string;
  confirmStopClinic: (instanceUuid: string) => void;
}) {
  const instances = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  return (
    <div style={styles.myClinicsPage}>
      <div style={styles.fullWidthTableWrap}>
        <FbTable aria-label="My clinic retrievals">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell>Retrievers</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '10rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {instances.map((instance) => {
              const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
              return (
                <FbTableRow key={instance.uuid}>
                  <FbTableCell>
                    {formatClinicalDate(instance.date)}
                    <br />
                    {instance.startTime}-{instance.endTime}
                  </FbTableCell>
                  <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                  <FbTableCell>
                    {instance.retrieverUserUuids.map((retrieverUuid) => {
                      const retriever = store.users.find((item) => item.uuid === retrieverUuid);
                      return retriever ? <div key={retriever.uuid}>{userInitials(retriever)}: {retriever.nadexId}</div> : null;
                    })}
                  </FbTableCell>
                  <FbTableCell style={{ textAlign: 'right' }}>
                    <FbcntSmallButton onClick={() => confirmStopClinic(instance.uuid)}>Stop retrieving</FbcntSmallButton>
                  </FbTableCell>
                </FbTableRow>
              );
            })}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

export function SelectClinicsView({
  store,
  currentUserUuid,
  filter,
  setFilter,
  selectedInstanceUuids,
  toggleSelectedInstance,
}: {
  store: CntStore;
  currentUserUuid: string;
  filter: { healthBoard: string; locality: string; facility: string; speciality: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void;
  selectedInstanceUuids: string[];
  toggleSelectedInstance: (instanceUuid: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const instances = store.clinicInstances
    .filter((instance) => instance.date >= today && !instance.cancelled)
    .filter((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      const location = store.locations.find((item) => item.facility === clinic?.facility);
      return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
        && (!filter.locality || location?.locality === filter.locality)
        && (!filter.facility || clinic?.facility === filter.facility)
        && (!filter.speciality || clinic?.speciality === filter.speciality);
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <div style={styles.selectClinicsPage}>
      <FbcntClinicFilter store={store} filter={filter} setFilter={setFilter} />
      <div style={styles.selectClinicsTableWrap}>
        <FbTable aria-label="Select clinics">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell>Retrievers</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '5rem', textAlign: 'center' }}>Select</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {instances.map((instance) => {
              const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
              return (
                <FbTableRow key={instance.uuid}>
                  <FbTableCell>
                    {formatClinicalDate(instance.date)}
                    <br />
                    {instance.startTime}-{instance.endTime}
                  </FbTableCell>
                  <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                  <FbTableCell>
                    {instance.retrieverUserUuids.map((retrieverUuid) => {
                      const retriever = store.users.find((item) => item.uuid === retrieverUuid);
                      return retriever ? <div key={retriever.uuid}>{userInitials(retriever)}: {retriever.nadexId}</div> : null;
                    })}
                  </FbTableCell>
                  <FbTableCell style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedInstanceUuids.includes(instance.uuid) || instance.retrieverUserUuids.includes(currentUserUuid)}
                      disabled={instance.retrieverUserUuids.includes(currentUserUuid)}
                      onChange={() => toggleSelectedInstance(instance.uuid)}
                    />
                  </FbTableCell>
                </FbTableRow>
              );
            })}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

function FbcntClinicFilter({
  store,
  filter,
  setFilter,
}: {
  store: CntStore;
  filter: { healthBoard: string; locality: string; facility: string; speciality: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void;
}) {
  const optionValues = {
    healthBoard: uniqueValues(store.locations.map((location) => location.healthBoard)),
    locality: uniqueValues(store.locations.map((location) => location.locality)),
    facility: uniqueValues(store.clinics.map((clinic) => clinic.facility)),
    speciality: uniqueValues(store.clinics.map((clinic) => clinic.speciality)),
  };
  const setOne = (key: keyof typeof filter, value: string) => setFilter({ ...filter, [key]: value });
  return (
    <FbGroupWithBorder label="Filter">
      <FbGridRow cols={4} style={{ marginBottom: 0 }}>
        <FbGridCell>
          <FbDropdown label="Health board" value={filter.healthBoard} onChange={(value) => setOne('healthBoard', value)} options={optionValues.healthBoard} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Locality" value={filter.locality} onChange={(value) => setOne('locality', value)} options={optionValues.locality} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Facility" value={filter.facility} onChange={(value) => setOne('facility', value)} options={optionValues.facility} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Speciality" value={filter.speciality} onChange={(value) => setOne('speciality', value)} options={optionValues.speciality} placeholder="All" subfield />
        </FbGridCell>
      </FbGridRow>
    </FbGroupWithBorder>
  );
}

export function LocationsView({ store, userUuid, removeLibrary }: { store: CntStore; userUuid: string; removeLibrary: (locationUuid: string) => void }) {
  const locations = store.locations.filter((location) => userLibraryUuids(store, userUuid).includes(location.uuid));
  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="My libraries">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Library</FbTableHeaderCell>
            <FbTableHeaderCell>Custodians</FbTableHeaderCell>
            <FbTableHeaderCell>Requests</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '8rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {locations.map((location) => (
            <FbTableRow key={location.uuid}>
              <FbTableCell>
                <strong>{location.code}</strong>
                <div>{location.healthBoard}</div>
                <div>{location.locality} / {location.facility}</div>
                <div>{location.department} / {location.extra}</div>
              </FbTableCell>
              <FbTableCell>
                {location.custodianUserUuids.map((custodianUuid) => {
                  const custodian = store.users.find((item) => item.uuid === custodianUuid);
                  return custodian ? <div key={custodian.uuid}>{userInitials(custodian)}: {custodian.nadexId}</div> : null;
                })}
              </FbTableCell>
              <FbTableCell>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</FbTableCell>
              <FbTableCell style={{ textAlign: 'right' }}>
                <FbcntSmallButton onClick={() => removeLibrary(location.uuid)}>Remove</FbcntSmallButton>
              </FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

export function AdminView({ store }: { store: CntStore }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Admin</h2>
      <ul>
        <li>{store.patients.length} patients</li>
        <li>{store.volumes.length} volumes</li>
        <li>{store.clinicInstances.length} clinic instances generated up to {store.lastClinicWindowEnd}</li>
        <li>{store.requests.length} requests</li>
        <li>{store.tags.length} tags</li>
      </ul>
    </section>
  );
}

function LocationSelect({ label, store, value, onChange, allowBlank = false }: { label: string; store: CntStore; value: string; onChange: (value: string) => void; allowBlank?: boolean }) {
  return (
    <label style={styles.label}>
      {label}
      <select style={styles.select} value={value} onChange={(event) => onChange(event.target.value)}>
        {allowBlank && <option value="">Not specified</option>}
        {store.locations.map((location) => (
          <option key={location.uuid} value={location.uuid}>{locationLabel(store, location.uuid)}</option>
        ))}
      </select>
    </label>
  );
}

function SelectedVolumeList({ store, volumes, ariaLabel = 'Selected volumes' }: { store: CntStore; volumes: CntVolume[]; ariaLabel?: string }) {
  return (
    <FbTable aria-label={ariaLabel}>
      <FbTableBody>
        {volumes.map((volume) => (
          <FbTableRow key={volume.uuid}>
            <FbTableCell><strong>Volume {volume.volumeNumber}</strong></FbTableCell>
            <FbTableCell>{volume.healthBoard} / {volume.locality} / {volume.type}</FbTableCell>
            <FbTableCell>{patientName(store, volume.patientUuid)}</FbTableCell>
            <FbTableCell>{locationLabel(store, volume.currentLocationUuid)}</FbTableCell>
          </FbTableRow>
        ))}
      </FbTableBody>
    </FbTable>
  );
}

function PatientAddressograph({ patient }: { patient: CntPatient }) {
  return (
    <div style={styles.cntAddressographWrap}>
      <FbAddressograph
        nhsNumber={patient.nhsNumber}
        surname={patient.surname}
        forenames={patient.forenames}
        title={patient.title}
        addressLine1={patient.addressLine1}
        addressLine2={patient.addressLine2}
        addressLine3={patient.addressLine3}
        addressLine4={patient.addressLine4}
        crn={patient.crn}
        dateOfBirth={patient.dateOfBirth}
        sex={patient.sex}
      />
    </div>
  );
}

function buildVolumeTree(volumes: CntVolume[]) {
  return volumes.reduce<Record<string, Record<string, Record<string, CntVolume[]>>>>((tree, volume) => {
    tree[volume.healthBoard] ||= {};
    tree[volume.healthBoard][volume.locality] ||= {};
    tree[volume.healthBoard][volume.locality][volume.type] ||= [];
    tree[volume.healthBoard][volume.locality][volume.type].push(volume);
    return tree;
  }, {});
}

function volumeSort(a: CntVolume, b: CntVolume) {
  return a.healthBoard.localeCompare(b.healthBoard)
    || a.locality.localeCompare(b.locality)
    || a.type.localeCompare(b.type)
    || Number(a.temporary) - Number(b.temporary)
    || a.volumeNumber - b.volumeNumber;
}

function nextVolumeNumber(store: CntStore, patientUuid: string, healthBoard: string, locality: string, type: string) {
  return store.volumes
    .filter((volume) =>
      volume.patientUuid === patientUuid
      && volume.healthBoard === healthBoard
      && volume.locality === locality
      && volume.type === type
    )
    .reduce((max, volume) => Math.max(max, volume.volumeNumber), 0) + 1;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export type RequestRow = {
  key: string;
  patientUuid: string;
  volumeUuids: string[];
  requiredFor: string;
  requiredBy: string;
  fromLocationUuid: string;
  toLocationUuid: string;
  status: CntRequest['status'];
};

function requestRows(store: CntStore, requests: CntRequest[]): RequestRow[] {
  const rows = new Map<string, RequestRow>();
  requests.forEach((request) => {
    const key = [
      request.patientUuid,
      request.requiredFor,
      request.requiredBy,
      request.fromLocationUuid,
      request.toLocationUuid,
      request.status,
    ].join('|');
    const existing = rows.get(key);
    if (existing) {
      existing.volumeUuids = uniqueValues([...existing.volumeUuids, request.volumeUuid]);
      return;
    }
    rows.set(key, {
      key,
      patientUuid: request.patientUuid,
      volumeUuids: [request.volumeUuid],
      requiredFor: request.requiredFor,
      requiredBy: request.requiredBy,
      fromLocationUuid: request.fromLocationUuid,
      toLocationUuid: request.toLocationUuid,
      status: request.status,
    });
  });
  return Array.from(rows.values()).sort((a, b) => a.requiredBy.localeCompare(b.requiredBy));
}

function requestMatchesRow(request: CntRequest, row: RequestRow) {
  return row.volumeUuids.includes(request.volumeUuid)
    && request.patientUuid === row.patientUuid
    && request.requiredFor === row.requiredFor
    && request.requiredBy === row.requiredBy
    && request.fromLocationUuid === row.fromLocationUuid
    && request.toLocationUuid === row.toLocationUuid
    && request.status === row.status;
}

function highlightStyleForLevel(level: number, active: boolean): React.CSSProperties {
  return {
    backgroundColor: active ? (level % 2 === 0 ? '#ffffcc' : '#fee715') : 'transparent',
    borderRadius: '0.2rem',
    paddingTop: '0.05rem',
    paddingBottom: '0.05rem',
    marginTop: '0.08rem',
  };
}

function clinicSummaryForReturnList(store: CntStore, volumes: CntVolume[]) {
  const clinicSummaries = uniqueValues(volumes.flatMap((volume) => {
    const entries = store.cntPickList.filter((entry) => entry.volumeUuid === volume.uuid);
    return entries.map((entry) => {
      const instance = store.clinicInstances.find((item) => item.uuid === entry.clinicInstanceUuid);
      const clinic = instance ? store.clinics.find((item) => item.uuid === instance.clinicUuid) : undefined;
      return clinic ? clinicSummary(clinic) : '';
    }).filter(Boolean);
  }));
  return clinicSummaries.join('\n');
}

function renderMultiline(text: string) {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={`${line}-${index}`}>
      {index > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

function volumeLabelForRequest(volume: CntVolume) {
  return `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`;
}

function userBatchUuids(store: CntStore, userUuid: string) {
  const configured = store.preferences[userUuid]?.batchUuids;
  if (configured?.length) return configured.filter((batchUuid) => store.batches.some((batch) => batch.uuid === batchUuid));
  return store.batches.slice(0, 1).map((batch) => batch.uuid);
}

function defaultLibraryUuids(store: CntStore, userUuid: string) {
  const user = store.users.find((item) => item.uuid === userUuid);
  const matching = store.locations.filter((location) =>
    location.facility === user?.facility || location.custodianUserUuids.includes(userUuid)
  );
  return (matching.length ? matching : store.locations.slice(0, 1)).map((location) => location.uuid);
}

function userLibraryUuids(store: CntStore, userUuid: string) {
  const configured = store.preferences[userUuid]?.libraryUuids;
  const uuids = configured?.length ? configured : defaultLibraryUuids(store, userUuid);
  return uuids.filter((locationUuid) => store.locations.some((location) => location.uuid === locationUuid));
}

function locationHyphenLabel(store: CntStore, locationUuid: string) {
  const location = store.locations.find((item) => item.uuid === locationUuid);
  if (!location) return '';
  return [location.healthBoard, location.locality, location.facility, location.department, location.extra]
    .filter(Boolean)
    .join('-');
}

function volumeLocationCounts(store: CntStore, volumes: CntVolume[]) {
  const counts = new Map<string, number>();
  volumes.forEach((volume) => {
    const label = locationHyphenLabel(store, volume.currentLocationUuid) || 'Unknown location';
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function formatClinicalDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function clinicSummary(clinic?: { clinicName: string; speciality: string; clinician: string }) {
  if (!clinic) return null;
  return (
    <>
      <div>{clinic.clinicName}</div>
      <div>{clinic.speciality}</div>
      <div>{clinic.clinician}</div>
    </>
  );
}

function userInitials(user: CntUser) {
  return `${user.firstNames.slice(0, 1)}${user.surname.slice(0, 1)}`.toUpperCase();
}


export const styles = {
  shell: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: 'white',
    position: 'relative',
  } as React.CSSProperties,
  header: {
    backgroundColor: 'white',
    borderBottom: `0.2rem solid ${fbBlue}`,
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '4.2rem',
    gap: '1rem',
  } as React.CSSProperties,
  kicker: {
    fontSize: '1rem',
    fontWeight: 300,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  title: {
    fontSize: '2rem',
    fontWeight: 500,
    margin: 0,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  titleDetails: {
    marginTop: '0.2rem',
    fontSize: '0.9rem',
    fontWeight: 300,
    color: '#333',
  } as React.CSSProperties,
  headerRight: {
    fontWeight: 500,
    color: '#333',
  } as React.CSSProperties,
  footer: {
    minHeight: '2.8rem',
    borderTop: `0.2rem solid ${fbBlue}`,
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.6rem',
    minWidth: 0,
  } as React.CSSProperties,
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    minWidth: 0,
  } as React.CSSProperties,
  footerLeftActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.6rem',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  } as React.CSSProperties,
  formMain: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 0 1rem',
  } as React.CSSProperties,
  locatorMain: {
    flex: 1,
    minHeight: 0,
    overflowY: 'hidden',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  loginMain: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.8rem 1rem 1rem',
  } as React.CSSProperties,
  loginPanel: {
    width: 'min(76rem, 100%)',
    margin: '0 auto',
    backgroundColor: 'white',
  } as React.CSSProperties,
  loginGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))',
    gap: '0.8rem',
  } as React.CSSProperties,
  identityTile: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    minHeight: '8rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '0.25rem',
    boxShadow: '0 0.15rem 0.5rem rgba(0,0,0,0.16)',
  } as React.CSSProperties,
  panelTitle: {
    margin: '0 0 0.8rem 0',
    fontSize: '1.25rem',
    fontWeight: 500,
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
    gap: '0.8rem',
  } as React.CSSProperties,
  scanSimulationRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
    gap: '0.8rem',
    marginBottom: '0.8rem',
  } as React.CSSProperties,
  scanSimulationButton: {
    backgroundColor: fbGreen,
    color: 'white',
    border: `0.1rem solid ${fbGreen}`,
    borderRadius: '0.4rem',
    padding: '1rem',
    minHeight: '4.5rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1.05rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'center',
  } as React.CSSProperties,
  homeButton: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1.2rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    minHeight: '5.5rem',
    boxShadow: '0 0.15rem 0.5rem rgba(0,0,0,0.14)',
  } as React.CSSProperties,
  actionButton: {
    backgroundColor: fbGreen,
    color: 'black',
    border: `0.1rem solid ${fbGreen}`,
    borderRadius: '0.4rem',
    padding: '0.45rem 0.8rem',
    marginTop: '0.8rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  rfidButton: {
    backgroundColor: fbLightBlue,
    color: 'black',
    border: `0.2rem solid ${fbOrange}`,
    borderRadius: '0.4rem',
    padding: '0.35rem 1rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties,
  scanBar: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    marginBottom: '0.8rem',
  } as React.CSSProperties,
  scanInput: {
    flex: 1,
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.45rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
  } as React.CSSProperties,
  card: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  locatorShell: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  } as React.CSSProperties,
  locatorScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBottom: '0.8rem',
  } as React.CSSProperties,
  miniCard: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  tree: {
    border: 0,
    borderRadius: 0,
    padding: '0.4rem',
  } as React.CSSProperties,
  treeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    width: '100%',
    border: 0,
    backgroundColor: 'white',
    color: '#111',
    fontFamily: "'Roboto', sans-serif",
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    textAlign: 'left',
    cursor: 'pointer',
  } as React.CSSProperties,
  volumeRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(10rem, 1fr) 2fr auto auto auto',
    gap: '0.6rem',
    alignItems: 'center',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    borderTop: '0.1rem solid #eee',
  } as React.CSSProperties,
  volumeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  } as React.CSSProperties,
  volumeMeta: {
    fontSize: '0.85rem',
    color: '#555',
  } as React.CSSProperties,
  badge: {
    borderRadius: '0.4rem',
    backgroundColor: fbBlue,
    color: 'white',
    padding: '0.1rem 0.4rem',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  fbcntSmallButton: {
    border: 0,
    borderRadius: '0.4rem',
    backgroundColor: fbBlue,
    color: 'white',
    padding: '0.2rem 0.44rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  locatorActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.8rem',
    paddingTop: '0.8rem',
    borderTop: `0.2rem solid ${fbBlue}`,
    backgroundColor: 'white',
    flex: '0 0 auto',
  } as React.CSSProperties,
  actionTile: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1rem',
    minWidth: '16rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  } as React.CSSProperties,
  actionTileSmall: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1rem',
    minWidth: '10rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  } as React.CSSProperties,
  th: {
    textAlign: 'left',
    padding: '0.4rem',
    border: '0.1rem solid silver',
    backgroundColor: '#f4f7fb',
    fontWeight: 500,
  } as React.CSSProperties,
  td: {
    padding: '0.4rem',
    border: '0.1rem solid silver',
    verticalAlign: 'top',
  } as React.CSSProperties,
  linkButton: {
    border: 0,
    backgroundColor: 'transparent',
    color: fbBlue,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
    fontFamily: "'Roboto', sans-serif",
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontWeight: 500,
  } as React.CSSProperties,
  select: {
    display: 'block',
    width: '100%',
    marginTop: '0.3rem',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
  } as React.CSSProperties,
  locationInput: {
    display: 'block',
    width: '100%',
    marginTop: '0.3rem',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
    boxSizing: 'border-box',
  } as React.CSSProperties,
  locationPopupStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    width: '100%',
  } as React.CSSProperties,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
    gap: '0.8rem',
  } as React.CSSProperties,
  status: {
    color: fbGreen,
    fontWeight: 500,
  } as React.CSSProperties,
  note: {
    color: fbOrange,
    fontWeight: 500,
  } as React.CSSProperties,
  popupFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  fullWidthTableWrap: {
    width: '100%',
    backgroundColor: 'white',
  } as React.CSSProperties,
  fullHeightTableWrap: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'white',
  } as React.CSSProperties,
  tablePageStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  addVolumePage: {
    width: 'min(48rem, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  patientRequestBlock: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.8rem',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  cntAddressographWrap: {
    paddingTop: '0.4rem',
    paddingBottom: '0.4rem',
  } as React.CSSProperties,
  batchPatientGroup: {
    display: 'grid',
    gridTemplateColumns: 'minmax(18rem, 22rem) 1fr',
    gap: '0.8rem',
    alignItems: 'start',
    borderTop: '0.1rem solid silver',
    paddingTop: '0.8rem',
  } as React.CSSProperties,
  batchPopupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as React.CSSProperties,
  batchPopupButton: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    backgroundColor: 'white',
    color: '#111',
    padding: '0.6rem',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.15rem',
  } as React.CSSProperties,
  preferencesPage: {
    width: 'min(48rem, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  stackedButtons: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.35rem',
    alignItems: 'stretch',
  } as React.CSSProperties,
  inlineCheckLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
  } as React.CSSProperties,
  requestVolumeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  } as React.CSSProperties,
  inlineActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.4rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  tagLine: {
    display: 'block',
    marginTop: '0.15rem',
    color: fbBlue,
    fontSize: '0.85rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  myClinicsPage: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  } as React.CSSProperties,
  pageAddButtonRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: '0.4rem',
  } as React.CSSProperties,
  selectClinicsPage: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  } as React.CSSProperties,
  selectClinicsTableWrap: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBottom: '3.4rem',
  } as React.CSSProperties,
  selectClinicsFooterActions: {
    position: 'absolute',
    right: '0.8rem',
    bottom: '3.25rem',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    backgroundColor: 'white',
    padding: '0.2rem 0',
  } as React.CSSProperties,
  groupWithBorder: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.6rem',
    margin: 0,
    backgroundColor: 'white',
  } as React.CSSProperties,
  groupWithBorderLegend: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    padding: '0 0.3rem',
  } as React.CSSProperties,
  sendButton: {
    border: `0.1rem solid ${fbGreen}`,
    borderRadius: '0.4rem',
    backgroundColor: fbGreen,
    color: 'white',
    padding: '0.35rem 0.8rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  cancelButton: {
    border: `0.1rem solid ${fbRed}`,
    borderRadius: '0.4rem',
    backgroundColor: fbRed,
    color: 'white',
    padding: '0.35rem 0.8rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
};
