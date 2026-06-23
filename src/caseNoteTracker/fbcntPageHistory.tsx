import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageHistory({ store, volumes }
: { store: CntStore; volumes: CntVolume[] }) {
  const events = volumes
    .flatMap((volume) => volume.events.map((event) => ({ ...event, volume })))
    .sort((a, b) => b.datetime.localeCompare(a.datetime));
  return (
    <div style={styles.fullHeightTableWrap}>
      <FbTable aria-label="Volume history">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Date/time</FbTableHeaderCell>
            <FbTableHeaderCell>Event</FbTableHeaderCell>
            <FbTableHeaderCell>From</FbTableHeaderCell>
            <FbTableHeaderCell>To</FbTableHeaderCell>
            <FbTableHeaderCell>Note</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {events.map((event) => (
            <FbTableRow key={event.uuid}>
              <FbTableCell>
                <FbDateDisplay value={event.datetime} />
                <br />
                <FbTimeDisplay value={event.datetime} />
              </FbTableCell>
              <FbTableCell>{event.kind}</FbTableCell>
              <FbTableCell><FbcntLocationDisplay store={store} locationUuid={event.fromLocationUuid} compact /></FbTableCell>
              <FbTableCell><FbcntLocationDisplay store={store} locationUuid={event.toLocationUuid} compact /></FbTableCell>
              <FbTableCell>{event.note}</FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

