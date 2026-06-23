import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageAllClinics({
  store,
  filter,
  setFilter,
  openClinicList,
}
: {
  store: CntStore;
  filter: CntClinicFilterState;
  setFilter: (next: CntClinicFilterState) => void;
  openClinicList: (clinicInstanceUuid: string) => void;
}) {
  const instances = clinicInstancesInNextSixWeeks(store)
    .filter((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      return clinic ? clinicMatchesFilter(store, clinic, filter) : false;
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  return (
    <div style={styles.selectClinicsPage}>
      <FbcntClinicFilter store={store} filter={filter} setFilter={setFilter} />
      <div style={styles.selectClinicsTableWrap}>
        <ClinicInstancesTable store={store} instances={instances} openClinicList={openClinicList} />
      </div>
    </div>
  );
}

