import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageClinicSchedule({
  store,
  filter,
  setFilter,
  openClinicDates,
}
: {
  store: CntStore;
  filter: CntClinicFilterState;
  setFilter: (next: CntClinicFilterState) => void;
  openClinicDates: (clinicUuid: string) => void;
}) {
  const [includeHistoric, setIncludeHistoric] = React.useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const clinics = store.clinics
    .filter((clinic) => includeHistoric || !clinic.endDate || clinic.endDate >= today)
    .filter((clinic) => clinicMatchesFilter(store, clinic, filter))
    .sort((a, b) => a.clinicName.localeCompare(b.clinicName));
  return (
    <div style={styles.selectClinicsPage}>
      <FbcntClinicFilter store={store} filter={filter} setFilter={setFilter} />
      <label style={styles.inlineCheckLabel}>
        <input type="checkbox" checked={includeHistoric} onChange={(event) => setIncludeHistoric(event.currentTarget.checked)} />
        Include historic clinics
      </label>
      <div style={styles.selectClinicsTableWrap}>
        <FbTable aria-label="Clinic schedule">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell>Speciality</FbTableHeaderCell>
              <FbTableHeaderCell>Senior responsible clinician</FbTableHeaderCell>
              <FbTableHeaderCell>Holding location</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '7rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {clinics.map((clinic) => (
              <FbTableRow key={clinic.uuid}>
                <FbTableCell>
                  <div>{clinic.clinicName}</div>
                  {clinic.endDate && clinic.endDate < today && <div style={styles.note}>Historic since <FbDateDisplay value={clinic.endDate} /></div>}
                </FbTableCell>
                <FbTableCell>{clinic.speciality}</FbTableCell>
                <FbTableCell>{clinic.clinician}</FbTableCell>
                <FbTableCell><FbcntLocationDisplay store={store} locationUuid={clinic.holdingLocationUuid} compact /></FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <FbcntSmallButton onClick={() => openClinicDates(clinic.uuid)}>Dates</FbcntSmallButton>
                </FbTableCell>
              </FbTableRow>
            ))}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

