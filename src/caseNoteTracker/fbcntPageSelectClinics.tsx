import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageSelectClinics({
  store,
  currentUserUuid,
  filter,
  setFilter,
  selectedInstanceUuids,
  toggleSelectedInstance,
}
: {
  store: CntStore;
  currentUserUuid: string;
  filter: CntClinicFilterState;
  setFilter: (next: CntClinicFilterState) => void;
  selectedInstanceUuids: string[];
  toggleSelectedInstance: (instanceUuid: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const instances = store.clinicInstances
    .filter((instance) => instance.date >= today && !instance.cancelled)
    .filter((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      const location = store.locations.find((item) => item.facility === clinic?.facility);
      return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
        && (!filter.locality || location?.locality === filter.locality)
        && (!filter.facility || clinic?.facility === filter.facility)
        && (!filter.speciality || clinic?.speciality === filter.speciality);
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <div style={styles.selectClinicsPage}>
      <FbcntClinicFilter store={store} filter={filter} setFilter={setFilter} />
      <div style={styles.selectClinicsTableWrap}>
        <FbTable aria-label="Select clinics">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell>Retrievers</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '5rem', textAlign: 'center' }}>Select</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {instances.map((instance) => {
              const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
              return (
                <FbTableRow key={instance.uuid}>
                  <FbTableCell>
                    <FbDateDisplay value={instance.date} />
                    <br />
                    <FbTimeDisplay value={instance.startTime} />-<FbTimeDisplay value={instance.endTime} />
                  </FbTableCell>
                  <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                  <FbTableCell>
                    {instance.retrieverUserUuids.map((retrieverUuid) => {
                      const retriever = store.users.find((item) => item.uuid === retrieverUuid);
                      return retriever ? <div key={retriever.uuid}><FbcntUserBadge user={retriever} /></div> : null;
                    })}
                  </FbTableCell>
                  <FbTableCell style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedInstanceUuids.includes(instance.uuid) || instance.retrieverUserUuids.includes(currentUserUuid)}
                      disabled={instance.retrieverUserUuids.includes(currentUserUuid)}
                      onChange={() => toggleSelectedInstance(instance.uuid)}
                    />
                  </FbTableCell>
                </FbTableRow>
              );
            })}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

