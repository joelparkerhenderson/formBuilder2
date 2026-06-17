import React from 'react';
import { fbPopup as FbPopup } from '../components/fbPopup';
import type { CntVolume } from './cntStore';
import { FbcntSelectedVolumesReceived } from './fbcntSelectedVolumesReceived';

export function FbcntReturnListSendPopup({
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
    <FbPopup
      title="Send"
      footer={
        <div style={styles.popupFooter}>
          <button type="button" style={styles.sendButton} onClick={onSend}>Send</button>
          <button type="button" style={styles.cancelButton} onClick={onCancel}>Cancel</button>
        </div>
      }
    >
      <FbcntSelectedVolumesReceived
        volumes={volumes}
        checkedVolumeUuids={checkedVolumeUuids}
        toggleVolume={toggleVolume}
      />
    </FbPopup>
  );
}

const styles = {
  popupFooter: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  sendButton: {
    backgroundColor: '#008000',
    color: 'white',
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  cancelButton: {
    backgroundColor: '#d50000',
    color: 'white',
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
  } as React.CSSProperties,
};
