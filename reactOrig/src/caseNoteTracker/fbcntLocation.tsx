import React from 'react';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbToolTip as FbToolTip } from '../components/fbToolTip';
import type { CntLocation, CntStore } from './cntStore';
import { locationLabel } from './cntStore';
import { fbGreen, fbOrange } from './cntStyles';

type FbcntLocationProps = {
  label: string;
  store: CntStore;
  value: string;
  onChange: (value: string) => void;
  allowBlank?: boolean;
};

export function FbcntLocation({ label, store, value, onChange, allowBlank = false }: FbcntLocationProps) {
  const selectedLabel = locationLabel(store, value);
  const [searchTerm, setSearchTerm] = React.useState(selectedLabel);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dropdownPlacement, setDropdownPlacement] = React.useState({ openAbove: false, maxHeight: 300 });

  React.useEffect(() => {
    setSearchTerm(selectedLabel);
  }, [selectedLabel]);

  const results = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const ranked = store.locations
      .map((location) => ({ location, label: locationLabel(store, location.uuid) }))
      .filter((item) => !term || item.label.toLowerCase().includes(term) || item.location.code.toLowerCase().includes(term));
    return ranked.slice(0, 50);
  }, [store, searchTerm]);

  const selected = store.locations.find((location) => location.uuid === value);
  const coded = !searchTerm.trim() ? allowBlank : !!selected && searchTerm === selectedLabel;

  const updateDropdownPosition = React.useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const preferredHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 20;
    const spaceAbove = rect.top - 20;
    const maxHeight = Math.min(preferredHeight, Math.max(120, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
    setDropdownPlacement({
      openAbove: !(spaceBelow >= preferredHeight || spaceBelow >= spaceAbove),
      maxHeight,
    });
  }, []);

  React.useEffect(() => {
    if (!showDropdown) return;
    updateDropdownPosition();
    const update = () => updateDropdownPosition();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showDropdown, updateDropdownPosition]);

  const selectLocation = (location: CntLocation) => {
    setSearchTerm(locationLabel(store, location.uuid));
    onChange(location.uuid);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const clear = () => {
    setSearchTerm('');
    if (allowBlank) onChange('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setShowDropdown(false);
      setHighlightedIndex(-1);
      return;
    }
    if (!showDropdown || !results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      selectLocation(results[highlightedIndex].location);
    }
  };

  const content = (
    <div style={styles.controlRow}>
      <div ref={containerRef} style={styles.inputWrap}>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            onChange('');
            updateDropdownPosition();
            setShowDropdown(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            updateDropdownPosition();
            setShowDropdown(true);
          }}
          onBlur={() => window.setTimeout(() => setShowDropdown(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Type to search locations"
          autoComplete="off"
          style={styles.input}
        />
        <div style={styles.inputButtons}>
          {searchTerm && (
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={clear} style={styles.iconButton}>{'\u2715'}</button>
          )}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              updateDropdownPosition();
              setShowDropdown((current) => !current);
            }}
            style={styles.toggleButton}
          >
            {showDropdown ? '\u25b2' : '\u25bc'}
          </button>
        </div>
        {showDropdown && results.length > 0 && (
          <div
            style={{
              ...styles.dropdown,
              maxHeight: dropdownPlacement.maxHeight,
              ...(dropdownPlacement.openAbove
                ? { bottom: 'calc(100% + 0.2rem)' }
                : { top: 'calc(100% + 0.2rem)' }),
            }}
          >
            {results.map((result, index) => (
              <div
                key={result.location.uuid}
                onMouseDown={() => selectLocation(result.location)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  ...styles.result,
                  backgroundColor: highlightedIndex === index ? '#ffffcc' : 'white',
                }}
              >
                <div>{result.label}</div>
                <div style={styles.resultCode}>{result.location.code}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {searchTerm && coded && (
        <TooltipIcon icon="check_circle_outline" text="Coded" style={styles.codedIcon} />
      )}
      {searchTerm && !coded && (
        <TooltipIcon icon="warning" text="Not coded" style={styles.warningIcon} />
      )}
    </div>
  );

  return <FbQuestion label={label}>{content}</FbQuestion>;
}

export function FbcntFromLocation(props: Omit<FbcntLocationProps, 'label'>) {
  return <FbcntLocation {...props} label="From" />;
}

export function FbcntToLocation(props: Omit<FbcntLocationProps, 'label'>) {
  return <FbcntLocation {...props} label="To" />;
}

function TooltipIcon({ icon, text, style }: { icon: string; text: string; style: React.CSSProperties }) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number } | null>(null);
  const showTooltip = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: Math.max(10, rect.left), y: Math.max(10, rect.top - 34) });
  };
  return (
    <>
      <span
        ref={ref}
        className="material-icons"
        style={style}
        tabIndex={0}
        aria-label={text}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltip(null)}
        onFocus={showTooltip}
        onBlur={() => setTooltip(null)}
      >
        {icon}
      </span>
      {tooltip && <FbToolTip x={tooltip.x} y={tooltip.y} text={text} />}
    </>
  );
}

const styles = {
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '0.3rem',
  } as React.CSSProperties,
  inputWrap: {
    position: 'relative',
    flex: 1,
  } as React.CSSProperties,
  input: {
    width: '100%',
    height: '2rem',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.35rem 2.5rem 0.35rem 0.45rem',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    fontFamily: "'Roboto', sans-serif",
  } as React.CSSProperties,
  inputButtons: {
    position: 'absolute',
    right: '0.2rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
  } as React.CSSProperties,
  iconButton: {
    border: 0,
    background: 'transparent',
    color: '#666',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.1rem',
    lineHeight: 1,
  } as React.CSSProperties,
  toggleButton: {
    border: 0,
    background: 'transparent',
    color: '#666',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.1rem',
    lineHeight: 1,
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute',
    left: 0,
    width: '45rem',
    maxWidth: 'calc(100vw - 40px)',
    overflowY: 'auto',
    overflowX: 'auto',
    backgroundColor: 'white',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    zIndex: 10000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  } as React.CSSProperties,
  result: {
    padding: '0.125rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  resultCode: {
    fontSize: '0.75rem',
    color: '#555',
  } as React.CSSProperties,
  codedIcon: {
    color: fbGreen,
    fontSize: '1.2rem',
  } as React.CSSProperties,
  warningIcon: {
    color: fbOrange,
    fontSize: '1.2rem',
  } as React.CSSProperties,
};
