import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageClinicList({
  store,
  clinicInstanceUuid,
  showRescheduled,
  showCancelled,
  openPatientRecord,
  openPickListSelector,
  openPickListReceive,
}
: {
  store: CntStore;
  clinicInstanceUuid: string;
  showRescheduled: boolean;
  showCancelled: boolean;
  openPatientRecord: (patientUuid: string) => void;
  openPickListSelector: (clinicInstanceUuid: string, patientUuid: string) => void;
  openPickListReceive: (clinicInstanceUuid: string, patientUuid: string) => void;
}) {
  const instance = store.clinicInstances.find((item) => item.uuid === clinicInstanceUuid);
  if (!instance) return <p style={styles.note}>Clinic instance not found.</p>;
  const rows = instance.appointments
    .filter((appointment) => appointment.status === 'active' || (appointment.status === 'rescheduled' && showRescheduled) || (appointment.status === 'cancelled' && showCancelled))
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div style={styles.tablePageStack}>
      <FbTable aria-label="Clinic appointment list">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell style={{ width: '9rem' }}>Status</FbTableHeaderCell>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell>Volumes</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '10rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {rows.map((appointment) => {
            const patient = store.patients.find((item) => item.uuid === appointment.patientUuid);
            const selectedEntries = store.cntPickList.filter((entry) => entry.clinicInstanceUuid === instance.uuid);
            const volumes = store.volumes
              .filter((volume) => volume.patientUuid === appointment.patientUuid && selectedEntries.some((entry) => entry.volumeUuid === volume.uuid))
              .sort(volumeSort);
            return (
              <FbTableRow key={appointment.uuid}>
                <FbTableCell>
                  {appointmentStatusBadge(appointment.status)}
                  <div style={{ marginTop: '0.25rem' }}><FbTimeDisplay value={appointment.time} /></div>
                </FbTableCell>
                <FbTableCell>{patient && <PatientAddressograph patient={patient} />}</FbTableCell>
                <FbTableCell><FbcntSelectedVolumes store={store} volumes={volumes} /></FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <div style={styles.stackedButtons}>
                    <FbcntSmallButton onClick={() => openPatientRecord(appointment.patientUuid)}>Open record</FbcntSmallButton>
                    <FbcntSmallButton onClick={() => openPickListSelector(instance.uuid, appointment.patientUuid)}>Select case notes</FbcntSmallButton>
                    <FbcntSmallButton onClick={() => openPickListReceive(instance.uuid, appointment.patientUuid)}>Receive case notes</FbcntSmallButton>
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

