import React from 'react';
import { fbButton as FbButton } from './fbButton';
import { fbModal as FbModal } from './fbModal';

interface DraftPopupProps {
  onSaveAsDraft?: () => void;
  onSaveDraft?: () => void; // alias for compatibility in WaitingListCard.tsx
  onReturnToForm?: () => void;
  onCancel?: () => void; // alias for compatibility in WaitingListCard.tsx
}

export const fbModalDraft: React.FC<DraftPopupProps> = ({
  onSaveAsDraft,
  onSaveDraft,
  onReturnToForm,
  onCancel
}) => {
  const handleSave = onSaveAsDraft || onSaveDraft;
  const handleCancel = onReturnToForm || onCancel;

  return (
    <FbModal
      title="Saving as draft"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
      }
    >
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.4', color: '#333333' }}>
        The form will be saved as a draft and not processed or sent, because the Final checkbox was not checked.
      </p>
    </FbModal>
  );
};
