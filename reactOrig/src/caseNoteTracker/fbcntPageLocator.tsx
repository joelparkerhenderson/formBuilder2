import React from 'react';
import type { CntAppointmentStatus, CntClinicInstance, CntRequest, CntPatient, CntStore, CntVolume } from './cntStore';
import {
  FbAddressograph, FbBoxedInfo, FbDropdown, FbExactDate, FbGridCell, FbGridRow, FbGroup, FbNumberInput, FbModal, FbQuestion, FbRadio, FbReadOnly, FbTextArea, FbTextInput, FbAddButtonSmall, FbToolTip, FbDateDisplay, FbTimeDisplay, FbTable, FbTableBody, FbTableHeader, FbTableHeaderCell, FbTableRow, FbTableCell, FbGroupWithBorder, FbcntBatchVolumeSet, FbcntFromLocation, FbcntLocation, FbcntToLocation, FbcntSelectedVolumes, FbcntSelectedVolumesLocation, FbcntSmallButton, FbToolTipUser, FbcntBadgeActive, FbcntBadgeClosed, FbcntBadgeDestroyed, FbcntBadgeCancelled, FbcntBadgeRescheduled, FbcntButtonManageVolume, FbcntTag, FbcntLocationDisplay, fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed, formatDisplayDate, formatDisplayTime, locationLabel, patientName, locationDisplayText, cntHomeEntry, pushCntNavigation, styles, patientSearchUrl, TreeNode, HighlightBlock, VolumeTagLine, VolumeTagIcon, volumeTagTooltip, TagTooltipLine, volumeStatusBadge, appointmentStatusBadge, PatientChooser, FbcntBatchFilter, latestVolumeEvent, ClinicInstancesTable, FbcntClinicFilter, FbcntLocationFilter, LocationSelect, SelectedVolumeList, PatientAddressograph, buildVolumeTree, volumeSort, nextVolumeNumber, uniqueValues, addDaysToIso, clinicInstancesInNextSixWeeks, clinicMatchesFilter, custodianUuidsForLocation, requestRows, requestMatchesRow, highlightStyleForLevel, clinicSummaryForReturnList, renderMultiline, volumeLabelForRequest, userBatchUuids, defaultLibraryUuids, userLibraryUuids, locationHyphenLabel, volumeLocationCounts, clinicSummary,
} from './fbcntPageComponents';
import type { View, CntClinicFilterState, CntLocationFilterState, RequestRow } from './fbcntPageComponents';

export function FbcntPageLocator({
  store,
  selectedPatientUuid,
  selectedVolumeUuids,
  toggleVolume,
  openHistory,
  openManageVolume,
}
: {
  store: CntStore;
  selectedPatientUuid: string;
  selectedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
  openHistory: (volumeUuid: string) => void;
  openManageVolume?: (volumeUuid: string) => void;
}) {
  const patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
  const volumes = store.volumes
    .filter((volume) => volume.patientUuid === selectedPatientUuid)
    .sort(volumeSort);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  if (!patient) {
    return <PatientChooser store={store} />;
  }

  const toggleCollapsed = (key: string) => setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  const toggleAllVolumes = (items: CntVolume[]) => {
    const selectable = items.filter((volume) => volume.status !== 'destroyed');
    const allSelected = selectable.every((volume) => selectedVolumeUuids.includes(volume.uuid));
    selectable
      .filter((volume) => allSelected ? selectedVolumeUuids.includes(volume.uuid) : !selectedVolumeUuids.includes(volume.uuid))
      .forEach((volume) => toggleVolume(volume.uuid));
  };
  const tree = buildVolumeTree(volumes);

  return (
    <section style={styles.locatorShell}>
      <div style={styles.locatorScroll}>
      <div style={styles.tree}>
        {Object.entries(tree).map(([hb, localities]) => (
          <TreeNode
            key={hb}
            label={hb}
            level={0}
            nodeKey={`hb:${hb}`}
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
            preventCollapse={volumes.some((volume) => volume.healthBoard === hb && selectedVolumeUuids.includes(volume.uuid))}
          >
            {Object.entries(localities).map(([locality, types]) => (
              <TreeNode
                key={locality}
                label={locality}
                level={1}
                nodeKey={`loc:${hb}:${locality}`}
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
                preventCollapse={volumes.some((volume) => volume.healthBoard === hb && volume.locality === locality && selectedVolumeUuids.includes(volume.uuid))}
              >
                {Object.entries(types).map(([type, items]) => (
                  <TreeNode
                    key={type}
                    label={type}
                    level={2}
                    nodeKey={`type:${hb}:${locality}:${type}`}
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                    preventCollapse={items.some((volume) => selectedVolumeUuids.includes(volume.uuid))}
                  >
                    {items.filter((volume) => volume.status !== 'destroyed').length > 1 && (
                      <div style={styles.selectAllButtonRow}>
                        <FbAddButtonSmall
                          label={items.filter((volume) => volume.status !== 'destroyed').every((volume) => selectedVolumeUuids.includes(volume.uuid)) ? 'Clear all' : 'Select all'}
                          onClick={() => toggleAllVolumes(items)}
                        />
                      </div>
                    )}
                    {items.map((volume) => (
                      (() => {
                        const isDestroyed = volume.status === 'destroyed';
                        return (
                      <HighlightBlock
                        key={volume.uuid}
                        level={3}
                        style={{ ...styles.volumeRow, gridTemplateColumns: 'minmax(10rem, 1fr) max-content minmax(16rem, 2fr) 2rem max-content', paddingLeft: '4.8rem' }}
                      >
                        <label style={{ ...styles.volumeLabel, ...(isDestroyed ? styles.volumeLabelDisabled : {}) }}>
                          <input
                            type="checkbox"
                            checked={!isDestroyed && selectedVolumeUuids.includes(volume.uuid)}
                            disabled={isDestroyed}
                            onChange={() => toggleVolume(volume.uuid)}
                          />
                          <span>Volume {volume.volumeNumber}{volume.temporary ? ' temporary' : ''}</span>
                        </label>
                        <span style={styles.volumeStatusCell}>{volumeStatusBadge(volume)}</span>
                        <span style={styles.volumeMeta}>
                          <FbcntLocationDisplay store={store} volume={volume} withIcon />
                        </span>
                        <VolumeTagIcon store={store} volume={volume} />
                        <span style={styles.volumeActionStack}>
                          {openManageVolume && <FbcntButtonManageVolume onClick={() => openManageVolume(volume.uuid)} />}
                          <FbcntSmallButton onClick={() => openHistory(volume.uuid)}>History</FbcntSmallButton>
                        </span>
                      </HighlightBlock>
                        );
                      })()
                    ))}
                  </TreeNode>
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        ))}
      </div>
      </div>
    </section>
  );
}

