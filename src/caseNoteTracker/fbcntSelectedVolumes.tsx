import React from 'react';
import type { CntPickListEntry, CntStore, CntVolume } from './cntStore';
import { fbGreen } from './cntStyles';
import { locationLabelForVolume } from './cntStore';

type LocationVolumeTree = Record<string, Record<string, Record<string, Record<string, CntVolume[]>>>>;

export function FbcntSelectedVolumes({ volumes }: { volumes: CntVolume[] }) {
  return <VolumeGroups volumes={volumes} />;
}

export function FbcntSelectedVolumesLocation({
  store,
  volumes,
  pickListEntries,
}: {
  store: CntStore;
  volumes: CntVolume[];
  pickListEntries: CntPickListEntry[];
}) {
  const received = new Set(pickListEntries.filter((entry) => entry.received).map((entry) => entry.volumeUuid));
  if (!volumes.length) return <span style={styles.empty}>No volumes selected</span>;
  const tree = volumes.reduce<LocationVolumeTree>((acc, volume) => {
    acc[volume.healthBoard] ||= {};
    acc[volume.healthBoard][volume.locality] ||= {};
    acc[volume.healthBoard][volume.locality][volume.type] ||= {};
    const location = locationLabelForVolume(store, volume);
    acc[volume.healthBoard][volume.locality][volume.type][location] ||= [];
    acc[volume.healthBoard][volume.locality][volume.type][location].push(volume);
    return acc;
  }, {});
  return (
    <div style={styles.wrap}>
      {Object.entries(tree).map(([hb, localities]) => (
        <HighlightLevel key={hb} level={0}>
          <div>{hb}</div>
          {Object.entries(localities).map(([locality, types]) => (
            <HighlightLevel key={locality} level={1} style={styles.level1}>
              <div>{locality}</div>
              {Object.entries(types).map(([type, locations]) => (
                <HighlightLevel key={type} level={2} style={styles.level2}>
                  <div>{type}</div>
                  {Object.entries(locations).map(([location, items]) => {
                    const sortedItems = sortVolumes(items);
                    const receivedClass = sortedItems.every((volume) => received.has(volume.uuid)) ? 'visible' : 'hidden';
                    return (
                      <React.Fragment key={location}>
                        <HighlightLevel level={3} style={styles.level3} tabIndex={0}>
                          {volumeRangeLabel(sortedItems)}
                        </HighlightLevel>
                        <HighlightLevel level={4} style={styles.level4UnderVolume}>
                          <span
                            className="material-icons"
                            style={{ ...styles.tick, visibility: receivedClass }}
                            aria-hidden="true"
                          >
                            check_circle
                          </span>
                          <span>{location}</span>
                        </HighlightLevel>
                      </React.Fragment>
                    );
                  })}
                </HighlightLevel>
              ))}
            </HighlightLevel>
          ))}
        </HighlightLevel>
      ))}
    </div>
  );
}

export function FbcntSelectedVolumesReceived({
  volumes,
  checkedVolumeUuids,
  toggleVolume,
}: {
  store: CntStore;
  volumes: CntVolume[];
  checkedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
}) {
  if (!volumes.length) return <span style={styles.empty}>No volumes selected</span>;
  return (
    <VolumeGroups
      volumes={volumes}
      renderVolumeDetail={(volume) => (
        <label style={styles.checkLine}>
          <input
            type="checkbox"
            checked={checkedVolumeUuids.includes(volume.uuid)}
            onChange={() => toggleVolume(volume.uuid)}
          />
          <span>Received</span>
        </label>
      )}
    />
  );
}

function VolumeGroups({
  volumes,
  renderVolumeDetail,
}: {
  volumes: CntVolume[];
  renderVolumeDetail?: (volume: CntVolume) => React.ReactNode;
}) {
  const tree = volumes.reduce<Record<string, Record<string, Record<string, CntVolume[]>>>>((acc, volume) => {
    acc[volume.healthBoard] ||= {};
    acc[volume.healthBoard][volume.locality] ||= {};
    acc[volume.healthBoard][volume.locality][volume.type] ||= [];
    acc[volume.healthBoard][volume.locality][volume.type].push(volume);
    return acc;
  }, {});
  if (!volumes.length) return <span style={styles.empty}>No volumes selected</span>;
  return (
    <div style={styles.wrap}>
      {Object.entries(tree).map(([hb, localities]) => (
        <HighlightLevel key={hb} level={0}>
          <div>{hb}</div>
          {Object.entries(localities).map(([locality, types]) => (
            <HighlightLevel key={locality} level={1} style={styles.locality}>
              <div>{locality}</div>
              {Object.entries(types).map(([type, items]) => (
                <HighlightLevel key={type} level={2} style={styles.type}>
                  <div>{type}</div>
                  {sortVolumes(items).map((volume) => (
                    <HighlightLevel
                      key={volume.uuid}
                      level={3}
                      style={renderVolumeDetail ? styles.volumeDetailWithAction : styles.volumeDetail}
                      tabIndex={0}
                    >
                      <span>{volumeLabel(volume)}</span>
                      {renderVolumeDetail?.(volume)}
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
  tabIndex,
  children,
}: {
  key?: React.Key;
  level: number;
  style?: React.CSSProperties;
  tabIndex?: number;
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState(false);
  return (
    <div
      className={`fbcnt-highlight-level fbcnt-highlight-level-${level}`}
      style={{ ...style, ...highlightLevel(level, active) }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={() => setActive(false)}
      tabIndex={tabIndex}
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

function volumeRangeLabel(volumes: CntVolume[]) {
  if (volumes.length === 1) return volumeLabel(volumes[0]);
  const prefix = volumes.every((volume) => volume.temporary) ? 'Temporary volumes' : 'Volumes';
  return `${prefix} ${summariseNumberRanges(volumes.map((volume) => volume.volumeNumber))}`;
}

function summariseNumberRanges(numbers: number[]) {
  const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);
  const ranges: string[] = [];
  for (let index = 0; index < uniqueNumbers.length; index += 1) {
    const start = uniqueNumbers[index];
    let end = start;
    while (index + 1 < uniqueNumbers.length && uniqueNumbers[index + 1] === end + 1) {
      index += 1;
      end = uniqueNumbers[index];
    }
    ranges.push(start === end ? String(start) : `${start}-${end}`);
  }
  return ranges.join(', ');
}

const styles = {
  wrap: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.95rem',
    lineHeight: 1.35,
  } as React.CSSProperties,
  locality: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  type: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  volumeDetail: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  volumeDetailWithAction: {
    marginLeft: '1rem',
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gap: '0.5rem',
    alignItems: 'start',
  } as React.CSSProperties,
  level1: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  level2: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  level3: {
    marginLeft: '1rem',
  } as React.CSSProperties,
  level4: {
    marginLeft: '1rem',
    display: 'grid',
    gridTemplateColumns: '1.1rem 1fr',
    columnGap: '0.25rem',
    alignItems: 'start',
  } as React.CSSProperties,
  level4UnderVolume: {
    marginLeft: '2rem',
    display: 'grid',
    gridTemplateColumns: '1.1rem 1fr',
    columnGap: '0.25rem',
    alignItems: 'start',
  } as React.CSSProperties,
  locationLine: {
    display: 'inline-flex',
    gap: '0.35rem',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  tick: {
    fontFamily: 'Material Icons',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    color: fbGreen,
    fontSize: '1rem',
    lineHeight: 1.2,
  } as React.CSSProperties,
  checkLine: {
    display: 'inline-flex',
    gap: '0.35rem',
    alignItems: 'center',
    fontWeight: 400,
  } as React.CSSProperties,
  empty: {
    color: '#555',
    fontStyle: 'italic',
  } as React.CSSProperties,
};
