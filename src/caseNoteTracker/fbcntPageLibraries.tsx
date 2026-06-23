import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageLibraries({ store, userUuid, removeLibrary }
: { store: CntStore; userUuid: string; removeLibrary: (locationUuid: string) => void }) {
  const locations = store.locations.filter((location) => userLibraryUuids(store, userUuid).includes(location.uuid));
  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="Libraries">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Library</FbTableHeaderCell>
            <FbTableHeaderCell>Custodians</FbTableHeaderCell>
            <FbTableHeaderCell>Requests</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '8rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
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
                  return custodian ? <div key={custodian.uuid}><FbcntUserBadge user={custodian} /></div> : null;
                })}
              </FbTableCell>
              <FbTableCell>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</FbTableCell>
              <FbTableCell style={{ textAlign: 'right' }}>
                <FbcntSmallButton onClick={() => removeLibrary(location.uuid)}>Remove</FbcntSmallButton>
              </FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

