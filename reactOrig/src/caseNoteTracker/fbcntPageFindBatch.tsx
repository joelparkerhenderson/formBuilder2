import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageFindBatch({
  store,
  userUuid,
  filter,
  setFilter,
  addBatchFavourite,
}
: {
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
                <FbTableCell><FbcntLocationDisplay store={store} locationUuid={batch.currentLocationUuid} compact /></FbTableCell>
                <FbTableCell><FbcntLocationDisplay store={store} locationUuid={batch.intendedDestinationUuid} compact /></FbTableCell>
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

