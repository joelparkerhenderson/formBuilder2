import React from 'react';
import type { CntVolume } from './cntStore';

export function FbcntSelectedVolumesReceived({
  volumes,
  checkedVolumeUuids,
  toggleVolume,
}: {
  volumes: CntVolume[];
  checkedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
}) {
  if (!volumes.length) return <span style={styles.empty}>No volumes selected</span>;
  const tree = volumes.reduce<Record<string, Record<string, Record<string, CntVolume[]>>>>((acc, volume) => {
    acc[volume.healthBoard] ||= {};
    acc[volume.healthBoard][volume.locality] ||= {};
    acc[volume.healthBoard][volume.locality][volume.type] ||= [];
    acc[volume.healthBoard][volume.locality][volume.type].push(volume);
    return acc;
  }, {});
  return (
    <div style={styles.wrap}>
      {Object.entries(tree).map(([hb, localities]) => (
        <HighlightLevel key={hb} level={0}>
          <div>{hb}</div>
          {Object.entries(localities).map(([locality, types]) => (
            <HighlightLevel key={locality} level={1} style={styles.indent}>
              <div>{locality}</div>
              {Object.entries(types).map(([type, items]) => (
                <HighlightLevel key={type} level={2} style={styles.indent}>
                  <div>{type}</div>
                  {sortVolumes(items).map((volume) => (
                    <HighlightLevel key={volume.uuid} level={3} style={styles.volumeLine}>
                      <input
                        type="checkbox"
                        checked={checkedVolumeUuids.includes(volume.uuid)}
                        onChange={() => toggleVolume(volume.uuid)}
                      />
                      <span>{volumeLabel(volume)}</span>
                    </HighlightLevel>
                  ))}
                </HighlightLevel>
              ))}
            </HighlightLevel>
          ))}
        </HighlightLevel>
      ))}
    </div>
  );
}

function HighlightLevel({
  level,
  style,
  children,
}: {
  key?: React.Key;
  level: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState(false);
  return (
    <div
      style={{ ...style, ...highlightLevel(level, active) }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={() => setActive(false)}
    >
      {children}
    </div>
  );
}

function highlightLevel(level: number, active: boolean): React.CSSProperties {
  return {
    backgroundColor: active ? (level % 2 === 0 ? '#ffffcc' : '#fee715') : 'transparent',
    borderRadius: '0.2rem',
    padding: '0.08rem 0.2rem',
    marginTop: '0.08rem',
  };
}

function volumeLabel(volume: CntVolume) {
  return volume.temporary ? `Temporary volume ${volume.volumeNumber}` : `Volume ${volume.volumeNumber}`;
}

function sortVolumes(volumes: CntVolume[]) {
  return [...volumes].sort((a, b) => a.volumeNumber - b.volumeNumber || a.uuid.localeCompare(b.uuid));
}

const styles = {
  wrap: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.95rem',
    lineHeight: 1.35,
  } as React.CSSProperties,
  indent: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  volumeLine: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gap: '0.4rem',
    alignItems: 'center',
    marginLeft: '1rem',
    borderRadius: '0.2rem',
    padding: '0.08rem 0.2rem',
  } as React.CSSProperties,
  empty: {
    color: '#555',
    fontStyle: 'italic',
  } as React.CSSProperties,
};
