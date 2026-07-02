import React from 'react';

export const fbBadgeSuperseded: React.FC = () => (
  <span
    className="fb-superseded-badge"
    style={{
      backgroundColor: '#d50000',
      color: 'white',
      fontWeight: 700,
      padding: '0.2rem 0.4rem',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '1rem',
      display: 'inline-block',
      lineHeight: 1.2,
      borderRadius: 0,
    }}
  >
    Superseded
  </span>
);
