import React, { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getVariantStyles = (): React.CSSProperties => {
    if ((isHovered || isFocused) && !props.disabled) {
      return {
        backgroundColor: '#fee715',
        color: 'black',
        border: '0.1rem solid #fee715'
      };
    }

    switch (variant) {
      case 'primary':
        return { backgroundColor: '#1b6ec2', color: 'white', border: '0.1rem solid #1b6ec2' };
      case 'success':
        return { backgroundColor: '#008000', color: 'white', border: '0.1rem solid #008000' };
      case 'danger':
        return { backgroundColor: '#d50000', color: 'white', border: '0.1rem solid #d50000' };
      case 'yellow':
        return { backgroundColor: '#fee715', color: 'black', border: '0.1rem solid #fee715' };
      case 'secondary':
      default:
        return { backgroundColor: 'white', color: '#1b6ec2', border: '0.1rem solid #1b6ec2' };
    }
  };

  return (
    <button
      className={`fb-button ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        display: 'inline-block',
        height: '2.0rem',
        lineHeight: '1.8rem',
        minWidth: '8rem',
        padding: '0 0.8rem',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: 500,
        borderRadius: '0.4rem',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        opacity: props.disabled ? 0.6 : 1,
        boxSizing: 'border-box',
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};
