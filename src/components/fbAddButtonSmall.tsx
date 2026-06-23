import React from 'react';
import { fbAddButton as AddButton } from './fbAddButton';

interface SmallAddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const fbAddButtonSmall: React.FC<SmallAddButtonProps> = ({ style, ...props }) => (
  <AddButton
    className="fb-small-add-button"
    style={{
      height: '1.5rem',
      lineHeight: '1.3rem',
      paddingTop: '0',
      paddingBottom: '0',
      fontSize: '0.8rem',
      ...style,
    }}
    {...props}
  />
);
