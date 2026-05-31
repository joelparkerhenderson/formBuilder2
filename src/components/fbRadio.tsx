import React from 'react';

interface fbRadioProps {
  id?: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  children?: React.ReactNode; // For subquestions or nested content
  style?: React.CSSProperties;
}

export const fbRadio: React.FC<fbRadioProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  required,
  children,
  style,
}) => {
  return (
    <div className="fb-subquestion-wrapper" style={style}>
      <label
        className="flex items-start gap-2 fb-radio-checkbox-item w-full"
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
          display: 'inline-flex',
          alignItems: 'flex-start',
          borderRadius: '0.4rem',
          boxSizing: 'border-box'
        }}
      >
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          required={required}
          style={{
            cursor: 'pointer',
            flexShrink: 0,
            outline: 'none',
            boxShadow: 'none'
          }}
        />
        <span style={{ fontWeight: 300 }}>{label}</span>
      </label>
      {checked && children && (
        <div className="pl-6 pb-1">
          {children}
        </div>
      )}
    </div>
  );
};
