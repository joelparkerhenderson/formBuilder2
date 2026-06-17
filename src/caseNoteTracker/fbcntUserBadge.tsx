import React from 'react';
import { fbToolTip as FbToolTip } from '../components/fbToolTip';
import type { CntUser } from './cntStore';
import { fbDarkerYellow } from './cntStyles';

export function FbcntUserBadge({ user }: { user: CntUser }) {
  const [active, setActive] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const showTooltip = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setTooltipPosition({
      x: Math.max(10, Math.min(rect.left, window.innerWidth - 250)),
      y: rect.bottom + 5,
    });
    setActive(true);
  };

  return (
    <>
      <span
        className="fbcntUserBadge"
        style={{ ...styles.badge, backgroundColor: active ? fbDarkerYellow : 'transparent' }}
        onMouseEnter={(event) => showTooltip(event.currentTarget)}
        onMouseLeave={() => setActive(false)}
        onFocus={(event) => showTooltip(event.currentTarget)}
        onBlur={() => setActive(false)}
        tabIndex={0}
      >
        {userInitials(user)}: {user.nadexId}
      </span>
      {active && (
        <FbToolTip
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          text={userTooltipText(user)}
        />
      )}
    </>
  );
}

function userInitials(user: CntUser) {
  return `${user.firstNames.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
}

function userTooltipText(user: CntUser) {
  return [
    `${user.surname.toUpperCase()}, ${user.firstNames}, ${user.title}`,
    user.role,
    user.facility,
    user.nadexId,
  ].join('\n');
}

const styles = {
  badge: {
    display: 'inline-block',
    borderRadius: '0.2rem',
    padding: '0.05rem 0.2rem',
    outlineOffset: '0.1rem',
  } as React.CSSProperties,
};
