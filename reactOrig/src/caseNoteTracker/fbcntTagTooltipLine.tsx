import React from 'react';
import { fbToolTip as FbToolTip } from '../components/fbToolTip';
import { styles } from './fbcntPageComponents';

export function TagTooltipLine({ text, tooltip }: { text: React.ReactNode; tooltip: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const showTooltip = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: Math.max(10, Math.min(rect.left, window.innerWidth - 260)),
      y: Math.max(10, rect.bottom + 4),
    });
  };
  return (
    <>
      <div
        ref={ref}
        style={styles.tagLine}
        tabIndex={0}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setPosition(null)}
      >
        {text}
      </div>
      {position && <FbToolTip x={position.x} y={position.y} text={tooltip} />}
    </>
  );
}
