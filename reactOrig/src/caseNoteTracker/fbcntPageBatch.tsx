import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageBatch({
  store,
  batchUuid,
  removeVolumeFromBatch,
}
: {
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

