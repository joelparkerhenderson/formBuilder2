import React from 'react';
import { fbButton as FbButton } from '../components/fbButton';
import { fbModal as FbModal } from '../components/fbModal';
import type { CntVolume } from './cntStore';
import { FbcntSelectedVolumesReceived } from './fbcntSelectedVolumesReceived';

export function FbcntModalPicklistReceived({
  volumes,
  checkedVolumeUuids,
  toggleVolume,
  onOk,
  onCancel,
}: {
  volumes: CntVolume[];
  checkedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
  onOk: () => void;
  onCancel: () => void;
}) {
  return (
    <FbModal
      title="Received"
      footer={
        <div style={styles.popupFooter}>
          <FbButton variant="success" onClick={onOk}>Ok</FbButton>
          <FbButton variant="danger" onClick={onCancel}>Cancel</FbButton>
        </div>
      }
    >
      <FbcntSelectedVolumesReceived
        volumes={volumes}
        checkedVolumeUuids={checkedVolumeUuids}
        toggleVolume={toggleVolume}
      />
    </FbModal>
  );
}

const styles = {
  popupFooter: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
};
