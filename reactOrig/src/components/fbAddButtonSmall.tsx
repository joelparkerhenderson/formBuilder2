import React from 'react';
import { fbAddButton as FbAddButton } from './fbAddButton';

interface AddButtonSmallProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const fbAddButtonSmall: React.FC<AddButtonSmallProps> = ({ label, style, ...props }) => (
  <FbAddButton
    label={label}
    style={{
      height: '1.5rem',
      lineHeight: '1.3rem',
      padding: '0 0.225rem',
      fontSize: '0.6rem',
      ...style,
    }}
    {...props}
  />
);
