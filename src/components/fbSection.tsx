import React from 'react';

interface fbSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const fbSection: React.FC<fbSectionProps> = ({
  id,
  title,
  children,
  style,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`form-section-block ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '0.8rem',
        ...style
      }}
    >
      <h3
        className="font-bold text-white shadow-sm"
        style={{
          backgroundColor: 'rgb(27, 110, 194)',
          color: 'white',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 500,
          lineHeight: '1.2rem',
          padding: '0.2rem 0.2rem 0.2rem 0.4rem',
          margin: 0,
          textTransform: 'none',
          borderRadius: '0.2rem 0.2rem 0 0',
        }}
      >
        {title}
      </h3>
      <div
        className="bg-white"
        style={{
          padding: '0.4rem 0rem',
          marginTop: '0.4rem',
          marginBottom: '0.6rem',
        }}
      >
        {children}
      </div>
    </div>
  );
};
