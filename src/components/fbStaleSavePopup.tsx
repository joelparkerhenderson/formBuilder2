import React from 'react';
import { fbButton as FbButton } from './fbButton';
import { fbPopup as FbPopup } from './fbPopup';

interface fbStaleSavePopupProps {
  onContinue: () => void;
}

export const fbStaleSavePopup: React.FC<fbStaleSavePopupProps> = ({ onContinue }) => (
  <FbPopup
    title="Changes NOT saved"
    footer={
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <FbButton type="button" variant="success" onClick={onContinue}>
          Continue
        </FbButton>
      </div>
    }
  >
    <p style={{ marginBottom: '1.5rem', lineHeight: '1.4', color: '#333333' }}>
      Your changes were not saved, because the document or form was updated by another user (or possibly by yourself in a different window). When you click "Continue", the read-only view of the current version will be displayed.
    </p>
  </FbPopup>
);
