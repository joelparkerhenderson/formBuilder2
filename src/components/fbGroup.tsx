import React from 'react';
import { fbRequiredForAudit as FbRequiredForAudit } from './fbRequiredForAudit';
import { fbValueError as FbValueError } from './fbValueError';

export const fbGroupRequiredMarkerContext = React.createContext(false);

interface fbGroupProps {
  label?: React.ReactNode;
  direction?: 'row' | 'col';
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  valueError?: string;
  labelStyle?: React.CSSProperties;
  required?: boolean;
  requiredForAudit?: boolean;
  showRequiredMarkers?: boolean;
  subfield?: boolean;
  tooltip?: string;
}

export const fbGroup: React.FC<fbGroupProps> = ({
  label,
  direction = 'col',
  style,
  children,
  className = '',
  valueError,
  labelStyle,
  required = false,
  requiredForAudit = false,
  showRequiredMarkers = true,
  subfield = false,
  tooltip,
}) => {
  const renderLabel = () => {
    if (!label || !showRequiredMarkers || (!required && !requiredForAudit) || typeof label !== 'string') return label;
    const trimmed = label.trim().replace(/\s+/g, ' ');
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    const marker = (
      <>
        {requiredForAudit && <FbRequiredForAudit />}
        {required && <span style={{ color: '#d50000', marginLeft: '0.1rem', fontWeight: 500 }}>*</span>}
      </>
    );

    if (lastSpaceIndex === -1) {
      return <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{trimmed}{marker}</span>;
    }

    return (
      <>
        {trimmed.substring(0, lastSpaceIndex)}{' '}
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{trimmed.substring(lastSpaceIndex + 1)}{marker}</span>
      </>
    );
  };

  return (
    <div
      className={`fb-question-container fb-radio-checkbox-group-container ${className}`}
      title={tooltip}
      aria-label={typeof label === 'string' ? label : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        marginTop: '0.2rem',
        marginBottom: '0.4rem',
        ...style
      }}
    >
      <FbValueError message={valueError} />
      {label && (
        <label
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: subfield ? 300 : 500,
            color: 'black',
            margin: 0,
            display: 'block',
            ...(subfield ? { fontWeight: 300, fontSize: '1rem' } : {}),
            ...labelStyle
          }}
        >
          {renderLabel()}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: direction === 'row' ? 'row' : 'column',
          gap: direction === 'row' ? '1rem' : 0,
        }}
      >
        <fbGroupRequiredMarkerContext.Provider value={showRequiredMarkers && (required || requiredForAudit)}>
          {children}
        </fbGroupRequiredMarkerContext.Provider>
      </div>
    </div>
  );
};
