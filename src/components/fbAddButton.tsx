import React from 'react';

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const fbAddButton: React.FC<AddButtonProps> = ({ label, style, className = '', ...props }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      className={`add-procedure-btn ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#fee715' : 'white',
        color: hovered ? 'black' : '#1b6ec2',
        border: '0.2rem solid #1b6ec2',
        borderRadius: '0.4rem',
        height: '2.0rem',
        lineHeight: '1.6rem',
        padding: '0 0.8rem',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        ...style
      }}
      {...props}
    >
      {label}
    </button>
  );
};
