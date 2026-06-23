import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageCreateBatch({
  store,
  purpose,
  setPurpose,
  currentLocationUuid,
  setCurrentLocationUuid,
  destinationUuid,
  setDestinationUuid,
  barcode,
  setBarcode,
}
: {
  store: CntStore;
  purpose: string;
  setPurpose: (value: string) => void;
  currentLocationUuid: string;
  setCurrentLocationUuid: (value: string) => void;
  destinationUuid: string;
  setDestinationUuid: (value: string) => void;
  barcode: string;
  setBarcode: (value: string) => void;
}) {
  return (
    <section style={styles.addVolumePage}>
      <FbTextArea label="Purpose" value={purpose} onChange={setPurpose} fullWidth />
      <FbcntLocation label="Current location" store={store} value={currentLocationUuid} onChange={setCurrentLocationUuid} />
      <FbcntLocation label="Intended destination" store={store} value={destinationUuid} onChange={setDestinationUuid} />
      <FbTextInput label="Bar code" value={barcode} onChange={setBarcode} />
    </section>
  );
}

