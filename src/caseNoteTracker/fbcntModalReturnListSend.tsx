import React from 'react';
import { fbButton as FbButton } from '../components/fbButton';
import { fbModal as FbModal } from '../components/fbModal';
import type { CntVolume } from './cntStore';
import { FbcntSelectedVolumesReceived } from './fbcntSelectedVolumesReceived';

export function FbcntModalReturnListSend({
  volumes,
  checkedVolumeUuids,
  toggleVolume,
  onSend,
  onCancel,
}: {
  volumes: CntVolume[];
  checkedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
  onSend: () => void;
  onCancel: () => void;
}) {
  return (
    <FbModal
      title="Send"
      footer={
        <div style={styles.popupFooter}>
          <FbButton variant="success" onClick={onSend}>Send</FbButton>
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
