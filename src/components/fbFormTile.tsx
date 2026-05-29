import React, { useState } from 'react';

interface FormTileProps {
  dateTime: string;
  formTypeName: string;
  speciality: string;
  src: string;
}

const HoverTooltipField: React.FC<{ tooltipText: string; children: React.ReactNode }> = ({ tooltipText, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      style={{ position: 'relative', display: 'block', width: 'fit-content' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <div style={{
          position: 'absolute',
          left: '0px',
          bottom: '100%',
          marginBottom: '4px',
          border: '1px solid silver',
          borderRadius: '0.4rem',
          color: 'black',
          fontSize: '0.8rem',
          fontWeight: 300,
          lineHeight: '1.0rem',
          padding: '0.25rem 0.4rem',
          textAlign: 'left',
          width: '12rem',
          backgroundColor: '#8cd2e7',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 50,
          pointerEvents: 'none',
          whiteSpace: 'normal'
        }}>
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export const fbFormTile: React.FC<FormTileProps> = ({
  dateTime,
  formTypeName,
  speciality,
  src
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        fontFamily: "'Roboto', sans-serif",
        color: 'black',
        fontSize: '1rem',
        fontWeight: 300,
        lineHeight: '1.15',
        textAlign: 'left'
      }}
    >
      <HoverTooltipField tooltipText="Document Date & Time">
        <div style={{ fontWeight: 300 }}>
          {dateTime}
        </div>
      </HoverTooltipField>
      <div style={{ fontWeight: 500 }}>
        {formTypeName}
      </div>
      {speciality && (
        <HoverTooltipField tooltipText="Speciality">
          <div style={{ fontWeight: 300 }}>
            {speciality}
          </div>
        </HoverTooltipField>
      )}
      {src && (
        <HoverTooltipField tooltipText="Senior Responsible Clinician">
          <div style={{ fontWeight: 300 }}>
            {src}
          </div>
        </HoverTooltipField>
      )}
    </div>
  );
};

