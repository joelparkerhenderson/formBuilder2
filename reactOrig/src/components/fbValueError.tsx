import React from 'react';

interface fbValueErrorProps {
  message?: string;
}

export const fbValueError: React.FC<fbValueErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <span
      className="fb-value-error"
      style={{
        color: '#d50000',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '0.8rem',
        fontWeight: 500,
        lineHeight: 1.2,
      }}
    >
      <span
        className="material-icons"
        aria-hidden="true"
        style={{
          color: '#d50000',
          fontSize: '1rem',
        }}
      >
        error
      </span>
      <span>{message}</span>
    </span>
  );
};
