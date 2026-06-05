import * as React from 'react';
import { fbSmallerButton as FbSmallerButton } from './fbSmallerButton';

interface fbViewOldVersionProps {
  onClick: () => void;
}

export const fbViewOldVersion: React.FC<fbViewOldVersionProps> = ({ onClick }) => (
  <FbSmallerButton onClick={onClick}>
    View
  </FbSmallerButton>
);
