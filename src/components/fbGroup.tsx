import React from 'react';
import { fbValueError as FbValueError } from './fbValueError';

interface fbGroupProps {
  label?: React.ReactNode;
  direction?: 'row' | 'col';
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  valueError?: string;
  labelStyle?: React.CSSProperties;
}

export const fbGroup: React.FC<fbGroupProps> = ({
  label,
  direction = 'col',
  style,
  children,
  className = '',
  valueError,
  labelStyle,
}) => {
  return (
    <div
      className={`fb-question-container fb-radio-checkbox-group-container ${className}`}
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
            fontWeight: 300,
            color: 'black',
            margin: 0,
            display: 'block',
            ...labelStyle
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: direction === 'row' ? 'row' : 'column',
          gap: direction === 'row' ? '1rem' : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
