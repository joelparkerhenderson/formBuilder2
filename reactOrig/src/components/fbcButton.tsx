import React from 'react';

export const fbcButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  danger?: boolean;
  fullWidth?: boolean;
}> = ({ danger, fullWidth, className = '', type = 'button', ...props }) => (
  <button
    type={type}
    className={`fbc-button ${danger ? 'fbc-button-danger' : ''} ${fullWidth ? 'fbc-button-full-width' : ''} ${className}`.trim()}
    {...props}
  />
);
