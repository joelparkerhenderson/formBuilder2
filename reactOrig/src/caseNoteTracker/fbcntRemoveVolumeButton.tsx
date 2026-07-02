import React from 'react';
import type { CntVolume } from './cntStore';
import { fbRed } from './cntStyles';

export function FbcntRemoveVolumeButton({
  volume,
  onClick,
}: {
  volume: CntVolume;
  onClick: () => void;
}) {
  const volumeDescription = `${volume.temporary ? 'temporary volume' : 'volume'} ${volume.volumeNumber}`;
  return (
    <button
      type="button"
      style={styles.button}
      onClick={onClick}
      aria-label={`Remove ${volumeDescription}`}
      title={`Remove ${volumeDescription}`}
    >
      <span className="material-icons" aria-hidden="true" style={styles.icon}>cancel</span>
    </button>
  );
}

const styles = {
  button: {
    backgroundColor: 'white',
    color: fbRed,
    border: '0.1rem solid transparent',
    borderRadius: '50%',
    width: '1.35rem',
    height: '1.35rem',
    padding: 0,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as React.CSSProperties,
  icon: {
    color: fbRed,
    fontSize: '1.15rem',
    lineHeight: 1,
  } as React.CSSProperties,
};
