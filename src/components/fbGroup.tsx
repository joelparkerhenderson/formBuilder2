import React from 'react';

interface fbGroupProps {
  label?: string;
  direction?: 'row' | 'col';
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
}

export const fbGroup: React.FC<fbGroupProps> = ({
  label,
  direction = 'col',
  style,
  children,
  className = '',
}) => {
  return (
    <div
      className={`fb-radio-checkbox-group-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        marginTop: '0.2rem',
        marginBottom: '0.4rem',
        ...style
      }}
    >
      {label && (
        <label
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 300,
            color: 'black',
            margin: 0,
            display: 'block'
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: direction === 'row' ? 'row' : 'column',
          gap: direction === 'row' ? '1rem' : '0.2rem',
        }}
      >
        {children}
      </div>
    </div>
  );
};
