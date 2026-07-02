import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageMyClinics({
  store,
  userUuid,
  confirmStopClinic,
}
: {
  store: CntStore;
  userUuid: string;
  confirmStopClinic: (instanceUuid: string) => void;
}) {
  const instances = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  return (
    <div style={styles.myClinicsPage}>
      <div style={styles.fullWidthTableWrap}>
        <FbTable aria-label="My clinic retrievals">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell>Retrievers</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '10rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
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
                      return retriever ? <div key={retriever.uuid}><FbToolTipUser user={retriever} /></div> : null;
                    })}
                  </FbTableCell>
                  <FbTableCell style={{ textAlign: 'right' }}>
                    <FbcntSmallButton onClick={() => confirmStopClinic(instance.uuid)}>Stop retrieving</FbcntSmallButton>
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

