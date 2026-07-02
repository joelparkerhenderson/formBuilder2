import * as React from 'react';
import { fbButtonSmaller as FbSmallerButton } from './fbButtonSmaller';

interface fbViewOldVersionProps {
  onClick: () => void;
}

export const fbViewOldVersion: React.FC<fbViewOldVersionProps> = ({ onClick }) => (
  <FbSmallerButton onClick={onClick}>
    View
  </FbSmallerButton>
);
