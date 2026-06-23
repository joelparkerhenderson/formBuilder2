import React from 'react';
import type { CntLocation, CntStore, CntVolume } from './cntStore';
import { fbBlue } from './cntStyles';

type LocationDisplayProps = {
  store: CntStore;
  locationUuid?: string;
  volume?: CntVolume;
  withIcon?: boolean;
  compact?: boolean;
};

export function FbcntLocationDisplay({ store, locationUuid, volume, withIcon = false, compact = false }: LocationDisplayProps) {
  const location = store.locations.find((item) => item.uuid === (locationUuid || volume?.currentLocationUuid));
  const lines = location ? locationDisplayLines(location, volume) : [];
  if (!lines.length) return null;
  return (
    <span style={styles.wrapper}>
      {withIcon && (
        <span className="material-icons" style={styles.icon} aria-hidden="true">
          view_list
        </span>
      )}
      <span style={{ ...styles.lines, ...(compact ? styles.compactLines : {}) }}>
        {lines.map((line, index) => (
          <span key={`${line}-${index}`} style={styles.line}>{line}</span>
        ))}
      </span>
    </span>
  );
}

export function locationDisplayText(store: CntStore, locationUuid?: string, volume?: CntVolume) {
  const location = store.locations.find((item) => item.uuid === (locationUuid || volume?.currentLocationUuid));
  return location ? locationDisplayLines(location, volume).join(' / ') : '';
}

export function locationDisplayLines(location: CntLocation, volume?: Pick<CntVolume, 'healthBoard' | 'locality'>) {
  return [
    location.extra,
    location.department,
    location.facility,
    location.healthBoard,
  ].filter(Boolean);
}

const styles = {
  wrapper: {
    display: 'inline-flex',
    gap: '0.25rem',
    alignItems: 'start',
    width: 'max-content',
    maxWidth: '100%',
    minWidth: 0,
  } as React.CSSProperties,
  icon: {
    fontFamily: 'Material Icons',
    color: fbBlue,
    fontSize: '1rem',
    lineHeight: 1.15,
    marginTop: '0.05rem',
  } as React.CSSProperties,
  lines: {
    display: 'grid',
    gap: '0.04rem',
    minWidth: 0,
    maxWidth: '100%',
  } as React.CSSProperties,
  compactLines: {
    gap: 0,
  } as React.CSSProperties,
  line: {
    display: 'block',
    overflowWrap: 'break-word',
  } as React.CSSProperties,
};
