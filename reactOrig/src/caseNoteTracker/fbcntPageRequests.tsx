import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageRequests({
  store,
  userUuid,
  mode,
  cancelRequestRow,
  openRequestLocator,
  sendRequestRow,
  doneRequestRow,
}
: {
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
      return request.status === 'open' && custodianUuidsForLocation(store, request.toLocationUuid).includes(userUuid);
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
                <FbTableCell><FbcntSelectedVolumes store={store} volumes={volumes} /></FbTableCell>
                <FbTableCell>
                  <div>{row.requiredFor}</div>
                  <div><FbDateDisplay value={row.requiredBy} /></div>
                </FbTableCell>
                <FbTableCell><FbcntLocationDisplay store={store} locationUuid={row.fromLocationUuid} compact /></FbTableCell>
                <FbTableCell><FbcntLocationDisplay store={store} locationUuid={row.toLocationUuid} compact /></FbTableCell>
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

