import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageRequest({
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
}
: {
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
        <FbcntSelectedVolumes store={store} volumes={selectedVolumesForRequest} />
        <div style={styles.inlineActions}>
          <FbcntSmallButton onClick={openVolumeSelector}>Select</FbcntSmallButton>
        </div>
      </FbGroupWithBorder>
    </section>
  );
}

