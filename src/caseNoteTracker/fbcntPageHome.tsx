import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbRoVField, FbTextArea, FbTextInput, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbcntUserBadge, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageHome({
  setView,
  openPreferences,
  showOffline,
  simulateNhsNumberScan,
  simulateHospitalNumberScan,
  simulateVolumeNumberScan,
  simulateBatchNumberScan,
  userDisplayName,
}
: {
  setView: (view: View) => void;
  openPreferences: () => void;
  showOffline: () => void;
  simulateNhsNumberScan: () => void;
  simulateHospitalNumberScan: () => void;
  simulateVolumeNumberScan: () => void;
  simulateBatchNumberScan: () => void;
  userDisplayName: string;
}) {
  const userItems: Array<{ target?: View; label: string; subtext?: string; href?: string; background: string; onClick?: () => void }> = [
    { label: 'Patient search', href: patientSearchUrl(), background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { target: 'batch', label: 'Batches', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'requests', label: 'Outbox', background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { target: 'inbox', label: 'Inbox', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'returnList', label: 'Return list', background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { target: 'clinics', label: 'Picklist', background: 'linear-gradient(135deg, #1b6ec2, #7048e8)' },
    { target: 'myClinics', label: 'Clinics', background: 'linear-gradient(135deg, #fd8a10, #fee715)' },
    { target: 'locations', label: 'Libraries', background: 'linear-gradient(135deg, #008000, #8cd2e7)' },
    { label: 'Preferences', background: 'linear-gradient(135deg, #1b6ec2, #008000)', onClick: openPreferences },
  ];
  const systemItems: Array<{ target?: View; label: string; subtext?: string; href?: string; background: string }> = [
    { target: 'clinicSchedule', label: 'Clinic schedule', background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { target: 'allClinics', label: 'All clinics', background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { target: 'allLocations', label: 'Locations', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'admin', label: 'Admin', subtext: 'For records admins', background: 'linear-gradient(135deg, #333, #8cd2e7)' },
    { label: 'CNT specification', href: 'docs/cnt-specification.html', background: 'linear-gradient(135deg, #fd8a10, #fee715)' },
  ];
  const renderTile = (item: { target?: View; label: string; subtext?: string; href?: string; background: string; onClick?: () => void }) => (
    <button
      key={item.label}
      type="button"
      style={{ ...styles.homeButton, background: item.background, color: item.background.includes('#fee715') ? 'black' : 'white' }}
      onClick={() => {
        if (item.href) {
          pushCntNavigation(cntHomeEntry());
          window.location.href = item.href;
        }
        else if (item.onClick) item.onClick();
        else if (item.target) setView(item.target);
      }}
    >
      <span style={{ display: 'block', fontSize: '1.35rem', fontWeight: 500 }}>{item.label}</span>
      {item.subtext && <span style={{ display: 'block', marginTop: '0.35rem', fontWeight: 300 }}>{item.subtext}</span>}
    </button>
  );
  return (
    <section>
      <div style={styles.scanSimulationRow}>
        {[
          ['Simulate NHS number scan', simulateNhsNumberScan],
          ['Simulate hospital number scan', simulateHospitalNumberScan],
          ['Simulate volume number scan', simulateVolumeNumberScan],
          ['Simulate batch number scan', simulateBatchNumberScan],
        ].map(([label, onClick]) => (
          <button key={label as string} type="button" style={styles.scanSimulationButton} onClick={onClick as () => void}>
            {label as string}
          </button>
        ))}
      </div>
      <fieldset style={styles.homeFieldset}>
        <legend style={styles.homeLegend}>{userDisplayName}</legend>
        <div style={styles.grid}>{userItems.map(renderTile)}</div>
      </fieldset>
      <fieldset style={styles.homeFieldset}>
        <legend style={styles.homeLegend}>System</legend>
        <div style={styles.grid}>{systemItems.map(renderTile)}</div>
        <button type="button" style={{ ...styles.homeButton, background: fbOrange, color: 'black' }} onClick={showOffline}>
          Show offline warning
        </button>
      </fieldset>
    </section>
  );
}

