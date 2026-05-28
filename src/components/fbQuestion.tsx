import React from 'react';

interface fbQuestionProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  labelStyle?: React.CSSProperties;
}

export const fbQuestion: React.FC<fbQuestionProps> = ({
  label,
  required = false,
  children,
  style,
  className = '',
  labelStyle,
}) => {
  // Gracefully parses the label string to group the last word and required asterisk
  const renderLabelText = () => {
    if (!required) return label;

    const trimmed = label.trim();
    const lastSpaceIndex = trimmed.lastIndexOf(' ');

    if (lastSpaceIndex === -1) {
      // Single word label
      return (
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {trimmed}
          <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>
        </span>
      );
    }

    const firstPart = trimmed.substring(0, lastSpaceIndex + 1);
    const lastWord = trimmed.substring(lastSpaceIndex + 1);

    return (
      <>
        {firstPart}
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {lastWord}
          <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>
        </span>
      </>
    );
  };

  return (
    <div
      className={`question-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        padding: '0.2rem',
        borderRadius: '0.4rem',
        boxSizing: 'border-box',
        transition: 'background-color 0.1s ease-out',
        ...style
      }}
    >
      <label
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 500,
          color: 'black',
          margin: 0,
          display: 'block',
          ...labelStyle
        }}
      >
        {renderLabelText()}
      </label>
      <div style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
