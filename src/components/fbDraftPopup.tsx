import React from 'react';
import { fbButton as FbButton } from './fbButton';

interface DraftPopupProps {
  onSaveAsDraft?: () => void;
  onSaveDraft?: () => void; // alias for compatibility in WaitingListCard.tsx
  onReturnToForm?: () => void;
  onCancel?: () => void; // alias for compatibility in WaitingListCard.tsx
}

export const fbDraftPopup: React.FC<DraftPopupProps> = ({
  onSaveAsDraft,
  onSaveDraft,
  onReturnToForm,
  onCancel
}) => {
  const handleSave = onSaveAsDraft || onSaveDraft;
  const handleCancel = onReturnToForm || onCancel;

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
        <h2 style={{fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem', color: '#1b6ec2'}}>Saving as draft</h2>
        <p style={{marginBottom: '1.5rem', lineHeight: '1.4', color: '#333333'}}>
          The form will be saved as a draft and not processed or sent, because the Final checkbox was not checked.
        </p>
        <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
          <FbButton
            type="button"
            variant="success"
            onClick={handleSave}
          >
            Save as draft
          </FbButton>
          <FbButton
            type="button"
            variant="danger"
            onClick={handleCancel}
          >
            Return to form
          </FbButton>
        </div>
      </div>
    </div>
  );
};
