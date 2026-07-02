import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageMyBatches({
  store,
  userUuid,
  openBatch,
  removeBatchFavourite,
}
: {
  store: CntStore;
  userUuid: string;
  openBatch: (batchUuid: string) => void;
  removeBatchFavourite: (batchUuid: string) => void;
}) {
  const favouriteUuids = userBatchUuids(store, userUuid);
  const batches = store.batches.filter((batch) => favouriteUuids.includes(batch.uuid));
  return (
    <div style={styles.tablePageStack}>
      <FbTable aria-label="Batches">
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
              <FbTableCell><FbcntLocationDisplay store={store} locationUuid={batch.intendedDestinationUuid} compact /></FbTableCell>
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

