import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageReturnList({
  store,
  removedPatientUuids,
  sendReturnRow,
  removeReturnRow,
}
: {
  store: CntStore;
  removedPatientUuids: string[];
  sendReturnRow: (patientUuid: string, volumeUuids: string[], locationUuid: string) => void;
  removeReturnRow: (patientUuid: string) => void;
}) {
  const volumes = store.volumes.filter((volume) => latestVolumeEvent(volume)?.kind === 'received');
  const patientUuids = uniqueValues(volumes.map((volume) => volume.patientUuid)).filter((patientUuid) => !removedPatientUuids.includes(patientUuid));
  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="Return list">
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
              .map((volume) => latestVolumeEvent(volume))
              .filter((event) => event?.kind === 'received')
              .sort((a, b) => String(b?.datetime).localeCompare(String(a?.datetime)))[0];
            const receivedDateTime = latestReceived?.datetime || new Date().toISOString();
            const currentLocationUuid = patientVolumes[0]?.currentLocationUuid || '';
            const returnClinicSummary = clinicSummaryForReturnList(store, patientVolumes);
            return (
              <FbTableRow key={patientUuid}>
                <FbTableCell>
                  <FbDateDisplay value={receivedDateTime} />
                  <br />
                  <FbTimeDisplay value={receivedDateTime} />
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

