import React from 'react';

interface fbSubquestionProps {
  active: boolean;
  parentControl: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const fbSubquestion: React.FC<fbSubquestionProps> = ({
  active,
  parentControl,
  children,
  style,
}) => {
  return (
    <div
      className="subfield-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Parent checkbox/radio */}
      <div style={{ margin: 0, padding: 0 }}>
        {parentControl}
      </div>

      {/* Collapsible details container */}
      {active && (
        <div
          className="subfield pl-6 transition-all duration-150 ease-out"
          style={{
            marginTop: '0.2rem',
            marginBottom: '0.4rem',
            paddingTop: '0.2rem',
            paddingBottom: '0.2rem',
            borderRadius: '0.4rem',
            fontFamily: "'Roboto', sans-serif"
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
