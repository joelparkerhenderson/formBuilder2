import React from 'react';

interface fbButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'yellow';
  children: React.ReactNode;
}

export const fbButton: React.FC<fbButtonProps> = ({
  variant = 'secondary',
  children,
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#1b6ec2', color: 'white' };
      case 'success':
        return { backgroundColor: '#008000', color: 'white' };
      case 'danger':
        return { backgroundColor: '#d50000', color: 'white' };
      case 'yellow':
        return { backgroundColor: '#fee715', color: 'black' };
      case 'secondary':
      default:
        return { backgroundColor: 'white', color: '#1b6ec2', border: '0.1rem solid #1b6ec2' };
    }
  };

  return (
    <button
      className={`form-button ${className}`}
      style={{
        display: 'inline-block',
        height: '2.0rem',
        lineHeight: '2rem',
        padding: '0 0.8rem',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: 500,
        borderRadius: '0.4rem',
        border: 'none',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        opacity: props.disabled ? 0.6 : 1,
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};
