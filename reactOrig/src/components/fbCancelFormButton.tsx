import React from 'react';
import { fbButton as FbButton } from './fbButton';

interface fbCancelFormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const fbCancelFormButton: React.FC<fbCancelFormButtonProps> = ({
  style,
  ...props
}) => {
  return (
    <FbButton
      type="button"
      variant="danger"
      style={style}
      {...props}
    >
      Cancel
    </FbButton>
  );
};
