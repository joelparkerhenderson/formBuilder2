import React from 'react';

interface fbPopupProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  titleMarginBottom?: string;
}

export const fbPopup: React.FC<fbPopupProps> = ({
  title,
  children,
  footer,
  maxWidth = '500px',
  titleMarginBottom = '1rem',
}) => {
  const titleId = React.useId();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '0.2rem solid rgb(27, 110, 194)',
          borderRadius: '0.4rem',
          padding: '1.5rem',
          maxWidth,
          width: '90%',
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        <h2 id={titleId} style={{ fontSize: '1.5rem', fontWeight: 500, margin: `0 0 ${titleMarginBottom} 0`, color: '#1b6ec2' }}>
          {title}
        </h2>
        {children}
        {footer}
      </div>
    </div>
  );
};
