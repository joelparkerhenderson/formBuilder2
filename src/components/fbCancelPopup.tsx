import React from 'react';
import { fbButton as FbButton } from './fbButton';

interface CancelPopupProps {
  onDiscard: () => void;
  onReturnToForm: () => void;
}

export const fbCancelPopup: React.FC<CancelPopupProps> = ({
  onDiscard,
  onReturnToForm
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '0.2rem solid rgb(27, 110, 194)',
          borderRadius: '0.4rem',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '90%',
          fontFamily: "'Roboto', sans-serif"
        }}
      >
        <h2 style={{fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem', color: '#1b6ec2'}}>Confirm cancel</h2>
        <p style={{marginBottom: '1.5rem', lineHeight: '1.4', color: '#333333'}}>
          Any changes you have made will be lost
        </p>
        <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
          <FbButton
            type="button"
            variant="danger"
            onClick={onDiscard}
          >
            Discard changes
          </FbButton>
          <FbButton
            type="button"
            variant="success"
            onClick={onReturnToForm}
          >
            Return to form
          </FbButton>
        </div>
      </div>
    </div>
  );
};
