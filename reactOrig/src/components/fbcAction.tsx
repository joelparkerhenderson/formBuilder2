import React from 'react';

export const fbcAction: React.FC<React.LiHTMLAttributes<HTMLLIElement> & { danger?: boolean }> = ({ danger, className = '', ...props }) => (
  <li className={`fb-designer-action-item ${danger ? 'fb-designer-action-danger' : ''} ${className}`} {...props} />
);

