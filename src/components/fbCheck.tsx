import React from 'react';

interface fbCheckProps {
  id?: string;
  name: string;
  value?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
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
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}) => {
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
