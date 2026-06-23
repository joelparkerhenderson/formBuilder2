import React from 'react';
import { fbGroupRequiredMarkerContext } from './fbGroup';
import { fbQuestionRequiredMarkerContext } from './fbQuestion';

interface fbCheckProps {
  id?: string;
  name: string;
  value?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  requiredForAudit?: boolean;
  showRequiredMarkers?: boolean;
  disabled?: boolean;
  children?: React.ReactNode; // For subquestions or nested content
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLLabelElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLLabelElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const fbCheck: React.FC<fbCheckProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  required,
  requiredForAudit,
  showRequiredMarkers = true,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}) => {
  const groupOwnsRequiredMarkers = React.useContext(fbGroupRequiredMarkerContext);
  const questionOwnsRequiredMarkers = React.useContext(fbQuestionRequiredMarkerContext);
  const renderRequiredMarkers = showRequiredMarkers && !groupOwnsRequiredMarkers && !questionOwnsRequiredMarkers;

  return (
    <div className="fb-subquestion-wrapper" style={style}>
      <label
        className="flex items-start gap-2 fb-radio-checkbox-item w-full"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
          cursor: 'pointer',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 300,
          userSelect: 'none',
          display: 'flex',
          alignItems: 'flex-start',
          borderRadius: '0.4rem',
          boxSizing: 'border-box'
        }}
      >
        <input
          id={id}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            cursor: 'pointer',
            flexShrink: 0,
            outline: 'none',
            boxShadow: 'none'
          }}
        />
        <span style={{ fontWeight: 300 }}>
          {label}
          {renderRequiredMarkers && requiredForAudit && <span style={{ backgroundColor: '#fd8a10', color: 'white', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1, marginLeft: '0.1rem', padding: '0.05rem 0.2rem', display: 'inline-block', whiteSpace: 'nowrap' }}>RfA</span>}
          {renderRequiredMarkers && required && <span style={{ color: '#d50000', marginLeft: '0.1rem', fontWeight: 500 }}>*</span>}
        </span>
      </label>
      {checked && children && (
        <div className="pl-6 pb-1">
          {children}
        </div>
      )}
    </div>
  );
};
