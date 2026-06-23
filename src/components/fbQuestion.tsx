import React from 'react';
import { fbRequiredForAudit as FbRequiredForAudit } from './fbRequiredForAudit';
import { fbValueError as FbValueError } from './fbValueError';

export const fbQuestionRequiredMarkerContext = React.createContext(false);

interface fbQuestionProps {
  label: string;
  required?: boolean;
  requiredForAudit?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  labelStyle?: React.CSSProperties;
  valueError?: string;
}

export const fbQuestion: React.FC<fbQuestionProps> = ({
  label,
  required = false,
  requiredForAudit = false,
  children,
  style,
  className = '',
  labelStyle,
  valueError,
}) => {
  const renderRequiredMarkers = () => (
    <>
      {requiredForAudit && <FbRequiredForAudit />}
      {required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
    </>
  );

  // Gracefully parses the label string to group the last word and required markers
  const renderLabelText = () => {
    if (!required && !requiredForAudit) return label;

    const trimmed = label.trim();
    const lastSpaceIndex = trimmed.lastIndexOf(' ');

    if (lastSpaceIndex === -1) {
      // Single word label
      return (
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {trimmed}
          {renderRequiredMarkers()}
        </span>
      );
    }

    const firstPart = trimmed.substring(0, lastSpaceIndex + 1);
    const lastWord = trimmed.substring(lastSpaceIndex + 1);

    return (
      <>
        {firstPart}
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {lastWord}
          {renderRequiredMarkers()}
        </span>
      </>
    );
  };

  return (
    <div
      className={`fb-question-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        padding: '0.2rem',
        borderRadius: '0.4rem',
        boxSizing: 'border-box',
        transition: 'background-color 0.1s ease-out',
        ...style
      }}
    >
      <FbValueError message={valueError} />
      <label
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 500,
          color: 'black',
          margin: 0,
          display: 'block',
          ...labelStyle
        }}
      >
        {renderLabelText()}
      </label>
      <fbQuestionRequiredMarkerContext.Provider value={required || requiredForAudit}>
        <div style={{ width: '100%' }}>
          {children}
        </div>
      </fbQuestionRequiredMarkerContext.Provider>
    </div>
  );
};
