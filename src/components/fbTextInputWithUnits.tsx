import React from 'react';

interface fbTextInputWithUnitsProps {
  value: string | number;
  onChange: (value: string) => void;
  units: string;
  type?: 'number' | 'text';
  placeholder?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  min?: number;
  max?: number;
}

export const fbTextInputWithUnits: React.FC<fbTextInputWithUnitsProps> = ({
  value = '',
  onChange,
  units,
  type = 'number',
  placeholder = '',
  style,
  inputStyle,
  min,
  max,
}) => {
  return (
    <div
      className="fb-input-with-units"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '0.1rem solid silver',
        borderRadius: '0.4rem',
        height: '2.0rem',
        width: '100%',
        backgroundColor: 'white',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{
          border: 'none',
          borderWidth: '0px',
          outline: 'none',
          boxShadow: 'none',
          height: '100%',
          flex: 1,
          padding: '0 0.5rem',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 400,
          backgroundColor: 'transparent',
          ...inputStyle
        }}
      />
      <span
        style={{
          padding: '0 0.6rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '1rem',
          fontWeight: 400,
          color: '#555',
          borderLeft: '0.1rem solid silver',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          userSelect: 'none'
        }}
      >
        {units}
      </span>
    </div>
  );
};
