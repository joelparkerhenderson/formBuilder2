import React from 'react';
import { fbQuestion as FbQuestion } from './fbQuestion';

interface fbTextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  subfield?: boolean;
}

export const fbTextInput: React.FC<fbTextInputProps> = ({
  label,
  value = '',
  onChange,
  required = false,
  placeholder = '',
  id,
  name,
  className = '',
  style,
  inputStyle,
  subfield = false,
}) => {
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
    if (required) {
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, width: '100%' }}>
            {renderInput()}
          </div>
          <span style={{ color: '#d50000', fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.2rem', marginTop: '0.15rem', display: 'inline-block', userSelect: 'none' }}>*</span>
        </div>
      );
    }
    return renderInput();
  }

  return (
    <FbQuestion
      label={label}
      required={required}
      className={className}
      style={style}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
    >
      {renderInput()}
    </FbQuestion>
  );
};
