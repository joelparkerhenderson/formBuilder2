import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageLocations({ store, filter, setFilter }
: { store: CntStore; filter: CntLocationFilterState; setFilter: (next: CntLocationFilterState) => void }) {
  const locations = store.locations
    .filter((location) => (!filter.healthBoard || location.healthBoard === filter.healthBoard)
      && (!filter.locality || location.locality === filter.locality)
      && (!filter.facility || location.facility === filter.facility))
    .sort((a, b) => locationLabel(store, a.uuid).localeCompare(locationLabel(store, b.uuid)));
  return (
    <div style={styles.selectClinicsPage}>
      <FbcntLocationFilter store={store} filter={filter} setFilter={setFilter} />
      <div style={styles.selectClinicsTableWrap}>
        <FbTable aria-label="Locations">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell>Location</FbTableHeaderCell>
              <FbTableHeaderCell>Custodians</FbTableHeaderCell>
              <FbTableHeaderCell>Requests</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {locations.map((location) => (
              <FbTableRow key={location.uuid}>
                <FbTableCell>
                  <strong>{location.code}</strong>
                  <div><FbcntLocationDisplay store={store} locationUuid={location.uuid} compact /></div>
                </FbTableCell>
                <FbTableCell>
                  {custodianUuidsForLocation(store, location.uuid).map((custodianUuid) => {
                    const custodian = store.users.find((item) => item.uuid === custodianUuid);
                    return custodian ? <div key={custodian.uuid}><FbToolTipUser user={custodian} /></div> : null;
                  })}
                </FbTableCell>
                <FbTableCell>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</FbTableCell>
              </FbTableRow>
            ))}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

