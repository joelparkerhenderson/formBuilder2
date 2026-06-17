import React from 'react';
import type { CntVolume } from './cntStore';
import { FbcntRemoveVolumeButton } from './fbcntRemoveVolumeButton';

export function FbcntBatchVolumeSet({
  volumes,
  onRemoveVolume,
}: {
  volumes: CntVolume[];
  onRemoveVolume: (volumeUuid: string) => void;
}) {
  return (
    <div style={styles.list}>
      {volumes.map((volume) => (
        <div key={volume.uuid} style={styles.row}>
          <span>{volumeLabel(volume)}</span>
          <FbcntRemoveVolumeButton volume={volume} onClick={() => onRemoveVolume(volume.uuid)} />
        </div>
      ))}
    </div>
  );
}

function volumeLabel(volume: CntVolume) {
  return `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`;
}

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  } as React.CSSProperties,
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '0.4rem',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: '0.2rem',
    padding: '0.08rem 0.2rem',
  } as React.CSSProperties,
};
