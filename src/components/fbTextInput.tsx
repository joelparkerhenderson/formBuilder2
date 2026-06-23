import React from 'react';
import { fbQuestion as FbQuestion, fbQuestionRequiredMarkerContext } from './fbQuestion';

interface fbTextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  requiredForAudit?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  subfield?: boolean;
  valueError?: string;
  showRequiredMarkers?: boolean;
}

export const fbTextInput: React.FC<fbTextInputProps> = ({
  label,
  value = '',
  onChange,
  required = false,
  requiredForAudit = false,
  placeholder = '',
  id,
  name,
  className = '',
  style,
  inputStyle,
  subfield = false,
  valueError,
  showRequiredMarkers = true,
}) => {
  const questionOwnsRequiredMarkers = React.useContext(fbQuestionRequiredMarkerContext);
  const renderRequiredMarkers = showRequiredMarkers && !questionOwnsRequiredMarkers;
  const renderInput = () => {
    return (
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full text-black font-sans"
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 400,
          border: '0.1rem solid silver',
          borderRadius: '0.4rem',
          padding: '0.3rem 0.5rem',
          fontSize: '1rem',
          boxSizing: 'border-box',
          height: '2rem',
          backgroundColor: 'white',
          ...inputStyle,
        }}
      />
    );
  };

  if (!label) {
    if (required || requiredForAudit) {
      if (!renderRequiredMarkers) return renderInput();
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, width: '100%' }}>
            {renderInput()}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.1rem', marginTop: '0.15rem' }}>
            {requiredForAudit && <span style={{ backgroundColor: '#fd8a10', color: 'white', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1, padding: '0.05rem 0.2rem', display: 'inline-block', whiteSpace: 'nowrap' }}>RfA</span>}
            {required && <span style={{ color: '#d50000', fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.2rem', display: 'inline-block', userSelect: 'none' }}>*</span>}
          </span>
        </div>
      );
    }
    return renderInput();
  }

  return (
    <FbQuestion
      label={label}
      required={showRequiredMarkers && required}
      requiredForAudit={showRequiredMarkers && requiredForAudit}
      className={className}
      style={style}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
      valueError={valueError}
    >
      {renderInput()}
    </FbQuestion>
  );
};
