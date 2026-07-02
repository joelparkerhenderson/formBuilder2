import React from 'react';
import { fbToolTip as FbToolTip } from './fbToolTip';

export const fbRequiredForAudit: React.FC = () => {
  const markerRef = React.useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const showTooltip = () => {
    const rect = markerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: Math.max(10, Math.min(rect.left, window.innerWidth - 260)),
      y: Math.max(10, rect.bottom + 4),
    });
  };
  return (
    <>
      <span
        ref={markerRef}
        className="fb-required-for-audit"
        tabIndex={0}
        aria-label="Required for audit"
        style={{
          backgroundColor: '#fd8a10',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 500,
          lineHeight: 1,
          marginLeft: '0.1rem',
          padding: '0.05rem 0.2rem',
          display: 'inline-block',
          verticalAlign: 'baseline',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setPosition(null)}
      >
        RfA
      </span>
      {position && <FbToolTip x={position.x} y={position.y} text="Required for audit" />}
    </>
  );
};
