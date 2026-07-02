import React from 'react';
import { fbcButton as FbcButton } from './fbcButton';

export const fbcModal: React.FC<{
  title: string;
  visible: boolean;
  onBack: () => void;
  backLabel?: string;
  children: React.ReactNode;
}> = ({ title, visible, onBack, backLabel = 'Back', children }) => {
  if (!visible) return null;
  return (
    <div className="fbc-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fbc-modal-title">{title}</div>
      <div className="fbc-modal-content">{children}</div>
      <div className="fbc-modal-footer">
        <FbcButton onClick={onBack}>{backLabel}</FbcButton>
      </div>
    </div>
  );
};
