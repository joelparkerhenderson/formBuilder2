import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';
import { FbcntManageVolume, type FbcntManageVolumeValue, type FbcntVolumeRecordStatus } from './fbcntManageVolume';

export function FbcntPageRegisterVolume({
  store,
  createdDate,
  setCreatedDate,
  healthBoard,
  setHealthBoard,
  locality,
  setLocality,
  volumeType,
  setVolumeType,
  status,
  setStatus,
  recordStatus,
  setRecordStatus,
  volumeNumber,
  setVolumeNumber,
  dateClosed,
  setDateClosed,
  dateDestroyed,
  setDateDestroyed,
  reasonDestroyed,
  setReasonDestroyed,
  initialLocationUuid,
  setInitialLocationUuid,
  barcode,
  setBarcode,
  rfid,
  setRfid,
  batchUuid,
  setBatchUuid,
}
: {
  store: CntStore;
  createdDate: string;
  setCreatedDate: (value: string) => void;
  healthBoard: string;
  setHealthBoard: (value: string) => void;
  locality: string;
  setLocality: (value: string) => void;
  volumeType: string;
  setVolumeType: (value: string) => void;
  status: 'Permanent' | 'Temporary';
  setStatus: (value: 'Permanent' | 'Temporary') => void;
  recordStatus: FbcntVolumeRecordStatus;
  setRecordStatus: (value: FbcntVolumeRecordStatus) => void;
  volumeNumber: string;
  setVolumeNumber: (value: string) => void;
  dateClosed: string;
  setDateClosed: (value: string) => void;
  dateDestroyed: string;
  setDateDestroyed: (value: string) => void;
  reasonDestroyed: string;
  setReasonDestroyed: (value: string) => void;
  initialLocationUuid: string;
  setInitialLocationUuid: (value: string) => void;
  barcode: string;
  setBarcode: (value: string) => void;
  rfid: string;
  setRfid: (value: string) => void;
  batchUuid: string;
  setBatchUuid: (value: string) => void;
}) {
  const value: FbcntManageVolumeValue = {
    healthBoard,
    locality,
    volumeType,
    permanentTemporary: status,
    recordStatus,
    volumeNumber,
    dateCreated: createdDate,
    dateClosed,
    dateDestroyed,
    reasonDestroyed,
    mergedIntoVolumeUuid: '',
    locationUuid: initialLocationUuid,
    barcode,
    rfid,
    batchUuid,
  };
  const updateValue = (next: FbcntManageVolumeValue) => {
    setHealthBoard(next.healthBoard);
    setLocality(next.locality);
    setVolumeType(next.volumeType);
    setStatus(next.permanentTemporary);
    setRecordStatus(next.recordStatus);
    setVolumeNumber(next.volumeNumber);
    setCreatedDate(next.dateCreated);
    setDateClosed(next.dateClosed);
    setDateDestroyed(next.dateDestroyed);
    setReasonDestroyed(next.reasonDestroyed);
    setInitialLocationUuid(next.locationUuid);
    setBarcode(next.barcode);
    setRfid(next.rfid);
    setBatchUuid(next.batchUuid);
  };
  return <FbcntManageVolume store={store} value={value} onChange={updateValue} />;
}

