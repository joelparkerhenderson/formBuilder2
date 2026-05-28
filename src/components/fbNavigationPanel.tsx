import React from 'react';

interface NavSection {
  id: string;
  label: string;
  isComplete?: boolean;
}

interface fbNavigationPanelProps {
  sections: NavSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
  isReadOnlyView?: boolean;
  style?: React.CSSProperties;
}

export const fbNavigationPanel: React.FC<fbNavigationPanelProps> = ({
  sections,
  activeSection,
  onSectionClick,
  isReadOnlyView = false,
  style,
}) => {
  return (
    <div
      className="form-nav-panel-container h-full w-64 flex flex-col pt-2 select-none select-none overflow-y-auto"
      style={{
        width: '16rem',
        backgroundColor: '#f5f5f5',
        borderRight: '0.1rem solid silver',
        boxSizing: 'border-box',
        flexShrink: 0,
        ...style
      }}
    >
      <div className="flex flex-col gap-1 px-2">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isComplete = section.isComplete;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionClick(section.id)}
              className="form-nav-link text-left w-full rounded transition-all duration-150"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.4rem 0.6rem',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1b6ec2' : '#555',
                backgroundColor: isActive ? '#e6f0fa' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                if (!isActive) {
                  target.style.backgroundColor = '#ffffcc';
                  target.style.color = 'black';
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                if (!isActive) {
                  target.style.backgroundColor = 'transparent';
                  target.style.color = '#555';
                }
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                  {section.label}
                </span>

                {/* Status indicators are rendered ONLY in Edit View (not in Read Only View) */}
                {!isReadOnlyView && (
                  <div className="flex items-center gap-1">
                    {isComplete && (
                      <span style={{ color: '#008000', fontWeight: 'bold', fontSize: '1rem' }} title="Section Complete">
                        ✓
                      </span>
                    )}
                    {isActive && (
                      <span style={{ color: '#1b6ec2', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ◄
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
