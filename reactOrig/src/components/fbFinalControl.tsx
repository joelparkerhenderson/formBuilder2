import React from 'react';

interface FinalControlProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export const fbFinalControl: React.FC<FinalControlProps> = ({
  checked,
  onChange,
  label = 'Final',
  style,
  className = '',
  disabled = false
}) => {
  return (
    <div
      className={`${className} ${disabled ? 'disabled' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '2.0rem',
        marginLeft: '0.2rem',
        padding: '0 0.5rem',
        border: '0.1rem solid silver',
        borderRadius: '0.4rem',
        backgroundColor: disabled ? '#c0c0c0' : 'white',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: 400,
        color: disabled ? 'white' : 'black',
        userSelect: 'none',
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: 1,
        ...style
      }}
    >
      <label className="flex items-center gap-2" style={{ margin: 0, padding: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            margin: 0,
            width: '1rem',
            height: '1rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            boxShadow: 'none'
          }}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};
