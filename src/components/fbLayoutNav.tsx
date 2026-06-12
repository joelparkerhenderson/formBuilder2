import React from 'react';

export type fbLayoutNavItem = {
  id: string;
  label: string;
  isActive: boolean;
  isComplete?: boolean;
  incomplete?: number;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

interface fbLayoutNavProps {
  items: fbLayoutNavItem[];
  emptyLabel?: string;
}

export const fbLayoutNav: React.FC<fbLayoutNavProps> = ({ items, emptyLabel = 'No sections' }) => (
  <div className="fb-layout-nav-grid">
    {items.length === 0 ? (
      <div style={{ fontWeight: 300, fontSize: '0.85rem' }}>{emptyLabel}</div>
    ) : items.map((item) => {
      const counterIsComplete = Boolean(item.isComplete || !item.incomplete);
      return (
      <React.Fragment key={item.id}>
        <button
          type="button"
          className="fb-layout-nav-section-name"
          id={`nav-${item.id}`}
          onClick={item.onClick}
        >
          {item.label}
        </button>
        <button
          type="button"
          className={`fb-layout-nav-counter-box ${counterIsComplete ? 'complete' : 'incomplete'}`}
          onClick={item.onClick}
        >
          {counterIsComplete ? (
            <span className="material-icons" aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1 }}>check</span>
          ) : item.incomplete}
        </button>
        <span className={`fb-layout-nav-indicator ${!item.isActive ? 'hidden' : ''}`} style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
          {'\u25c0\u25b6'}
        </span>
      </React.Fragment>
      );
    })}
  </div>
);
