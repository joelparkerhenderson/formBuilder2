import React from 'react';
import { cntControlStyles } from './cntStyles';

export function FbcntSmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" style={cntControlStyles.fbcntSmallButton} onClick={onClick}>
      {children}
    </button>
  );
}
