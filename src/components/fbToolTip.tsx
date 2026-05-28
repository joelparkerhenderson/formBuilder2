import React from 'react';

interface fbToolTipProps {
  x: number;
  y: number;
  text: string;
  showClose?: boolean;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  innerRef?: React.Ref<HTMLDivElement>;
}

export const fbToolTip: React.FC<fbToolTipProps> = ({
  x,
  y,
  text,
  showClose = false,
  onClose,
  onMouseEnter,
  onMouseLeave,
  innerRef,
}) => {
  return (
    <div
      ref={innerRef}
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        border: '1px solid silver',
        borderRadius: '0.4rem',
        color: 'black',
        fontSize: '0.8rem',
        fontWeight: 300,
        lineHeight: '1.0rem',
        padding: '0.2rem',
        textAlign: 'left',
        width: '15rem',
        backgroundColor: '#8cd2e7',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        transition: 'opacity 0.5s ease-out',
        opacity: 1
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={{ paddingBottom: showClose ? '1.5rem' : '0' }}>{text}</div>
      {showClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            bottom: '0.2rem',
            right: '0.2rem',
            borderRadius: '0.2rem',
            backgroundColor: 'transparent',
            fontSize: '0.5rem',
            border: '0.1rem solid black',
            padding: '0rem 0.3rem',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      )}
    </div>
  );
};
