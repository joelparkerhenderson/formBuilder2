import React from 'react';
import { fbAddressograph as FbAddressograph } from '../components/fbAddressograph';
import { fbBoxedInfo as FbBoxedInfo } from '../components/fbBoxedMessage';
import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbDateExact as FbExactDate } from '../components/fbDateExact';
import { fbCheck as FbCheck } from '../components/fbCheck';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import { fbGroup as FbGroup } from '../components/fbGroup';
import { fbNumberInput as FbNumberInput } from '../components/fbNumberInput';
import { fbModal as FbModal } from '../components/fbModal';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbRadio as FbRadio } from '../components/fbRadio';
import { fbRoVField as FbRoVField } from '../components/fbRoVField';
import { fbTextArea as FbTextArea } from '../components/fbTextArea';
import { fbTextInput as FbTextInput } from '../components/fbTextInput';
import { fbToolTip as FbToolTip } from '../components/fbToolTip';
import { fbDateDisplay as FbDateDisplay, formatDisplayDate } from '../components/fbDateDisplay';
import { fbTimeDisplay as FbTimeDisplay, formatDisplayTime } from '../components/fbTimeDisplay';
import {
  fbTable as FbTable,
  fbTableBody as FbTableBody,
  fbTableHeader as FbTableHeader,
  fbTableHeaderCell as FbTableHeaderCell,
  fbTableRow as FbTableRow,
} from '../components/fbTable';
import { fbTableCell as FbTableCell } from '../components/fbTableCell';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import { locationLabel, patientName } from './cntStore';
import { fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed } from './cntStyles';
import { FbGroupWithBorder } from './fbGroupWithBorder';
import { FbcntBatchVolumeSet } from './fbcntBatchVolumeSet';
import { FbcntFromLocation, FbcntLocation, FbcntToLocation } from './fbcntLocation';
import { FbcntSelectedVolumes, FbcntSelectedVolumesLocation } from './fbcntSelectedVolumes';
import { FbcntSmallButton } from './fbcntSmallButton';
import { FbcntUserBadge } from './fbcntUserBadge';
import { FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled } from './fbcntBadge';
import { FbcntButtonManageVolume } from './fbcntButtonManageVolume';
import { FbcntTag } from './fbcntTag';
import { FbcntLocationDisplay, locationDisplayText } from './fbcntLocationDisplay';
import { cntHomeEntry, pushCntNavigation } from './cntNavigation';
import { HighlightBlock } from './fbcntHighlightBlock';
import { TreeNode } from './fbcntTreeNode';
import { TagTooltipLine } from './fbcntTagTooltipLine';
import { VolumeTagLine } from './fbcntVolumeTagLine';
import { VolumeTagIcon } from './fbcntVolumeTagIcon';
import { PatientChooser } from './fbcntPatientChooser';
import { MovementModalContent } from './fbcntModalMovementContent';
import { FbcntBatchFilter } from './fbcntBatchFilter';
import { BatchSelectedModalContent } from './fbcntModalBatchSelectedContent';
import { ClinicInstancesTable } from './fbcntClinicInstancesTable';
import { FbcntClinicFilter } from './fbcntClinicFilter';
import { FbcntLocationFilter } from './fbcntLocationFilter';
import { LocationSelect } from './fbcntLocationSelect';
import { SelectedVolumeList } from './fbcntSelectedVolumeList';
import { PatientAddressograph } from './fbcntPatientAddressograph';

export {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbCheck, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed,
};
export { formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation };
export { HighlightBlock, TreeNode, TagTooltipLine, VolumeTagLine, VolumeTagIcon, PatientChooser, MovementModalContent, FbcntBatchFilter, BatchSelectedModalContent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph };

export type View =
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
  | 'clinicSchedule'
  | 'clinicDates'
  | 'allClinics'
  | 'clinicList'
  | 'allLocations'
  | 'locations'
  | 'admin'
  | 'preferences'
  | 'selector'
  | 'addVolume'
  | 'manageVolume'
  | 'batchDetail'
  | 'findBatch'
  | 'createBatch';

export type CntClinicFilterState = { healthBoard: string; locality: string; facility: string; speciality: string };
export type CntLocationFilterState = { healthBoard: string; locality: string; facility: string };

export const patientSearchUrl = () => '/formBuilder2/index.html#/patient-search';




export function volumeTagTooltip(store: CntStore, volume: CntVolume) {
  const tags = store.tags.filter((tag) => tag.volumeUuid === volume.uuid && tag.status === 'active');
  if (!tags.length) return null;
  return tags.map((tag) => {
    const createdBy = store.users.find((user) => user.uuid === tag.createdByUserUuid);
    return [
      `Purpose: ${tag.purpose}`,
      `Location: ${locationLabel(store, tag.locationUuid)}`,
      `Required by: ${formatDisplayDate(tag.requiredBy)} ${formatDisplayTime(tag.requiredBy)}`,
      `Expires: ${formatDisplayDate(tag.expiresAt)} ${formatDisplayTime(tag.expiresAt)}`,
      `Created by: ${createdBy ? `${createdBy.firstNames} ${createdBy.surname}` : tag.createdByUserUuid}`,
    ].join('\n');
  }).join('\n\n');
}

export function volumeStatusBadge(volume: CntVolume) {
  if (volume.status === 'destroyed') return <FbcntBadgeDestroyed />;
  if (volume.status === 'closed') return <FbcntBadgeClosed />;
  return <FbcntBadgeActive />;
}

export function appointmentStatusBadge(status: CntAppointmentStatus) {
  if (status === 'cancelled') return <FbcntBadgeCancelled />;
  if (status === 'rescheduled') return <FbcntBadgeRescheduled />;
  return <FbcntBadgeActive />;
}

export function latestVolumeEvent(volume: CntVolume) {
  return Array.isArray(volume.events) ? volume.events.at(-1) : undefined;
}









export function buildVolumeTree(volumes: CntVolume[]) {
  return volumes.reduce<Record<string, Record<string, Record<string, CntVolume[]>>>>((tree, volume) => {
    tree[volume.healthBoard] ||= {};
    tree[volume.healthBoard][volume.locality] ||= {};
    tree[volume.healthBoard][volume.locality][volume.type] ||= [];
    tree[volume.healthBoard][volume.locality][volume.type].push(volume);
    return tree;
  }, {});
}

export function volumeSort(a: CntVolume, b: CntVolume) {
  return a.healthBoard.localeCompare(b.healthBoard)
    || a.locality.localeCompare(b.locality)
    || a.type.localeCompare(b.type)
    || Number(a.temporary) - Number(b.temporary)
    || a.volumeNumber - b.volumeNumber;
}

export function nextVolumeNumber(store: CntStore, patientUuid: string, healthBoard: string, locality: string, type: string) {
  return store.volumes
    .filter((volume) =>
      volume.patientUuid === patientUuid
      && volume.healthBoard === healthBoard
      && volume.locality === locality
      && volume.type === type
    )
    .reduce((max, volume) => Math.max(max, volume.volumeNumber), 0) + 1;
}

export function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean).map(String))).sort((a, b) => a.localeCompare(b));
}

export function addDaysToIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function clinicInstancesInNextSixWeeks(store: CntStore) {
  const today = addDaysToIso(0);
  const end = addDaysToIso(42);
  return store.clinicInstances.filter((instance) => instance.date >= today && instance.date <= end && !instance.cancelled);
}

export function clinicMatchesFilter(
  store: CntStore,
  clinic: { speciality: string; facility: string; holdingLocationUuid: string },
  filter: { healthBoard: string; locality: string; facility: string; speciality: string }
) {
  const location = store.locations.find((item) => item.uuid === clinic.holdingLocationUuid)
    || store.locations.find((item) => item.facility === clinic.facility);
  return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
    && (!filter.locality || location?.locality === filter.locality)
    && (!filter.facility || clinic.facility === filter.facility)
    && (!filter.speciality || clinic.speciality === filter.speciality);
}

export function custodianUuidsForLocation(store: CntStore, locationUuid: string) {
  const location = store.locations.find((item) => item.uuid === locationUuid);
  if (!location) return [];
  const parentMatches = store.locations.filter((candidate) =>
    candidate.healthBoard === location.healthBoard
    && candidate.locality === location.locality
    && candidate.facility === location.facility
    && candidate.department === location.department
  );
  return uniqueValues(parentMatches.flatMap((candidate) => candidate.custodianUserUuids));
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

export function requestRows(store: CntStore, requests: CntRequest[]): RequestRow[] {
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

export function requestMatchesRow(request: CntRequest, row: RequestRow) {
  return row.volumeUuids.includes(request.volumeUuid)
    && request.patientUuid === row.patientUuid
    && request.requiredFor === row.requiredFor
    && request.requiredBy === row.requiredBy
    && request.fromLocationUuid === row.fromLocationUuid
    && request.toLocationUuid === row.toLocationUuid
    && request.status === row.status;
}

export function highlightStyleForLevel(level: number, active: boolean): React.CSSProperties {
  return {
    backgroundColor: active ? '#fee715' : 'transparent',
    borderRadius: '0.2rem',
    paddingTop: '0.05rem',
    paddingBottom: '0.05rem',
    marginTop: '0.08rem',
  };
}

export function clinicSummaryForReturnList(store: CntStore, volumes: CntVolume[]) {
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

export function renderMultiline(text: string) {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={`${line}-${index}`}>
      {index > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

export function volumeLabelForRequest(volume: CntVolume) {
  return `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`;
}

export function userBatchUuids(store: CntStore, userUuid: string) {
  const configured = store.preferences[userUuid]?.batchUuids;
  if (configured?.length) return configured.filter((batchUuid) => store.batches.some((batch) => batch.uuid === batchUuid));
  return store.batches.slice(0, 1).map((batch) => batch.uuid);
}

export function defaultLibraryUuids(store: CntStore, userUuid: string) {
  const user = store.users.find((item) => item.uuid === userUuid);
  const matching = store.locations.filter((location) =>
    location.facility === user?.facility || custodianUuidsForLocation(store, location.uuid).includes(userUuid)
  );
  return (matching.length ? matching : store.locations.slice(0, 1)).map((location) => location.uuid);
}

export function userLibraryUuids(store: CntStore, userUuid: string) {
  const configured = store.preferences[userUuid]?.libraryUuids;
  const uuids = configured?.length ? configured : defaultLibraryUuids(store, userUuid);
  return uuids.filter((locationUuid) => store.locations.some((location) => location.uuid === locationUuid));
}

export function locationHyphenLabel(store: CntStore, locationUuid: string) {
  const location = store.locations.find((item) => item.uuid === locationUuid);
  if (!location) return '';
  return [location.extra, location.department, location.facility, location.healthBoard]
    .filter(Boolean)
    .join('-');
}

export function volumeLocationCounts(store: CntStore, volumes: CntVolume[]) {
  const counts = new Map<string, number>();
  volumes.forEach((volume) => {
    const label = locationHyphenLabel(store, volume.currentLocationUuid) || 'Unknown location';
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function clinicSummary(clinic?: { clinicName: string; speciality: string; clinician: string }) {
  if (!clinic) return null;
  return (
    <>
      <div>{clinic.clinicName}</div>
      <div>{clinic.speciality}</div>
      <div>{clinic.clinician}</div>
    </>
  );
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
  homeFieldset: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.8rem',
    margin: '0 0 0.8rem 0',
    backgroundColor: 'white',
  } as React.CSSProperties,
  homeLegend: {
    padding: '0 0.35rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
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
  selectAllButtonRow: {
    paddingLeft: '4.8rem',
    paddingTop: '0.15rem',
    paddingBottom: '0.15rem',
  } as React.CSSProperties,
  selectAllButton: {
    border: 0,
    borderRadius: '0.4rem',
    backgroundColor: fbBlue,
    color: 'white',
    padding: '0.15rem 0.4rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.75rem',
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
  checkboxRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  volumeStatusCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
  } as React.CSSProperties,
  volumeLabelDisabled: {
    color: '#666',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  manageVolumePage: {
    maxWidth: '42rem',
  } as React.CSSProperties,
  manageVolumeSummary: {
    display: 'grid',
    gap: '0.4rem',
  } as React.CSSProperties,
  manageVolumeActions: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '1rem',
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
};
