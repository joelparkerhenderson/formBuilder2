import React from 'react';

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  editable?: boolean;
  onLabelChange?: (label: string) => void;
}

export const fbAddButton: React.FC<AddButtonProps> = ({ label, editable = false, onLabelChange, style, className = '', ...props }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      className={`fb-add-button ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#fee715' : 'white',
        color: hovered ? 'black' : '#1b6ec2',
        border: hovered ? '0.1rem solid black' : '0.1rem solid #1b6ec2',
        borderRadius: '0.4rem',
        height: '2.0rem',
        lineHeight: '1.8rem',
        padding: '0 0.8rem',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: 300,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        ...style
      }}
      {...props}
    >
      {editable ? (
        <span
          contentEditable
          suppressContentEditableWarning
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onBlur={(event) => onLabelChange?.(event.currentTarget.textContent?.trim() || label)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          style={{ outline: 'none' }}
        >
          {label}
        </span>
      ) : label}
    </button>
  );
};
