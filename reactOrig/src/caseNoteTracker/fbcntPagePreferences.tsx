import React from 'react';
import { fbAddButton as FbAddButton } from '../components/fbAddButton';
import { FbcntPageLibraries } from './fbcntPageLibraries';
import { FbcntPageMyClinics } from './fbcntPageMyClinics';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPagePreferences({
  store,
  healthBoard,
  setHealthBoard,
  locality,
  setLocality,
  facility,
  setFacility,
  userUuid,
  removeLibrary,
  confirmStopClinic,
  openAddLibrary,
  openSelectClinics,
}
: {
  store: CntStore;
  healthBoard: string;
  setHealthBoard: (value: string) => void;
  locality: string;
  setLocality: (value: string) => void;
  facility: string;
  setFacility: (value: string) => void;
  userUuid: string;
  removeLibrary: (locationUuid: string) => void;
  confirmStopClinic: (instanceUuid: string) => void;
  openAddLibrary: () => void;
  openSelectClinics: () => void;
}) {
  const healthBoardOptions = uniqueValues(store.locations.map((location) => location.healthBoard));
  const localityOptions = uniqueValues(store.locations
    .filter((location) => !healthBoard || location.healthBoard === healthBoard)
    .map((location) => location.locality));
  const facilityOptions = uniqueValues(store.locations
    .filter((location) => (!healthBoard || location.healthBoard === healthBoard) && (!locality || location.locality === locality))
    .map((location) => location.facility));
  return (
    <section style={styles.preferencesPage}>
      <FbBoxedInfo text="In demo versions, this user preferences page is displayed after every login." />
      <FbDropdown
        label="Health board"
        value={healthBoard}
        onChange={(value) => {
          setHealthBoard(value);
          const nextLocality = store.locations.find((location) => location.healthBoard === value)?.locality || '';
          setLocality(nextLocality);
          const nextFacility = store.locations.find((location) => location.healthBoard === value && location.locality === nextLocality)?.facility || '';
          setFacility(nextFacility);
        }}
        options={healthBoardOptions}
      />
      <FbDropdown
        label="Locality"
        value={locality}
        onChange={(value) => {
          setLocality(value);
          const nextFacility = store.locations.find((location) => (!healthBoard || location.healthBoard === healthBoard) && location.locality === value)?.facility || '';
          setFacility(nextFacility);
        }}
        options={localityOptions}
      />
      <FbDropdown
        label="Facility"
        value={facility}
        onChange={setFacility}
        options={facilityOptions}
      />
      <section>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, margin: '0.8rem 0 0.4rem 0' }}>Assigned libraries</h2>
        <FbcntPageLibraries store={store} userUuid={userUuid} removeLibrary={removeLibrary} />
        <div style={{ marginTop: '0.4rem' }}>
          <FbAddButton label="Add library" onClick={openAddLibrary} />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, margin: '0.8rem 0 0.4rem 0' }}>Assigned clinics</h2>
        <FbcntPageMyClinics store={store} userUuid={userUuid} confirmStopClinic={confirmStopClinic} />
        <div style={{ marginTop: '0.4rem' }}>
          <FbAddButton label="Add clinic(s)" onClick={openSelectClinics} />
        </div>
      </section>
    </section>
  );
}

