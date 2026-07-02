import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPagePicklist({
  store,
  userUuid,
  includeRetrieved,
  openPickListSelector,
  openPickListReceive,
}
: {
  store: CntStore;
  userUuid: string;
  includeRetrieved: boolean;
  openPickListSelector: (clinicInstanceUuid: string, patientUuid: string) => void;
  openPickListReceive: (clinicInstanceUuid: string, patientUuid: string) => void;
}) {
  const rows = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
    .flatMap((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      const seenAppointmentKeys = new Set<string>();
      return instance.appointments
        .filter((appointment) => appointment.status === 'active' && !appointment.cancelled)
        .filter((appointment) => {
          const key = `${instance.uuid}:${appointment.time}:${appointment.patientUuid}`;
          if (seenAppointmentKeys.has(key)) return false;
          seenAppointmentKeys.add(key);
          return true;
        })
        .map((appointment) => ({ instance, clinic, appointment }));
    })
    .filter(({ instance, clinic, appointment }) => {
      if (includeRetrieved || !clinic) return true;
      const selectedEntries = store.cntPickList.filter((entry) => entry.clinicInstanceUuid === instance.uuid);
      const patientVolumes = store.volumes.filter((volume) => volume.patientUuid === appointment.patientUuid);
      const selectedVolumesForRow = patientVolumes.filter((volume) => selectedEntries.some((entry) => entry.volumeUuid === volume.uuid));
      return !selectedVolumesForRow.length || selectedVolumesForRow.some((volume) => volume.currentLocationUuid !== clinic.holdingLocationUuid);
    })
    .sort((a, b) => `${a.instance.date} ${a.appointment.time}`.localeCompare(`${b.instance.date} ${b.appointment.time}`));

  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="Picklist appointments">
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
                  <FbDateDisplay value={instance.date} />
                  <br />
                  <FbTimeDisplay value={appointment.time} />
                </FbTableCell>
                <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                <FbTableCell>{patient && <PatientAddressograph patient={patient} />}</FbTableCell>
                <FbTableCell style={{ verticalAlign: 'top' }}>
                  <FbcntSelectedVolumesLocation
                    store={store}
                    volumes={selectedVolumesForRow}
                    pickListEntries={selectedEntries}
                    requestedLocationUuid={clinic?.holdingLocationUuid}
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

