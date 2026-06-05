import * as React from 'react';

interface fbSmallerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const fbSmallerButton: React.FC<fbSmallerButtonProps> = ({
  children,
  style,
  ...props
}) => (
  <button
    type="button"
    style={{
      height: 'auto',
      lineHeight: 'normal',
      padding: '0.15rem 0.45rem',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '0.85rem',
      fontWeight: 300,
      border: '0.1rem solid #1b6ec2',
      borderRadius: '0.25rem',
      backgroundColor: '#1b6ec2',
      color: 'white',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.6 : 1,
      ...style,
    }}
    {...props}
  >
    {children}
  </button>
);
