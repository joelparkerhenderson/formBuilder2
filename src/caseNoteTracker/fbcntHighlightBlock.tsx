import React from 'react';
import { highlightStyleForLevel } from './fbcntPageComponents';

export function HighlightBlock({
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
      className={`fbcnt-highlight-level fbcnt-highlight-level-${level}`}
      style={{ ...style, ...highlightStyleForLevel(level, active) }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={() => setActive(false)}
    >
      {children}
    </div>
  );
}
