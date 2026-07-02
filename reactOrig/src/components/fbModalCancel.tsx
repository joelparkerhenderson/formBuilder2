import React from 'react';
import { fbButton as FbButton } from './fbButton';
import { fbModal as FbModal } from './fbModal';

interface CancelPopupProps {
  onDiscard: () => void;
  onReturnToForm: () => void;
}

export const fbModalCancel: React.FC<CancelPopupProps> = ({
  onDiscard,
  onReturnToForm
}) => {
  return (
    <FbModal
      title="Confirm cancel"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
      }
    >
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.4', color: '#333333' }}>
        Any changes you have made will be lost
      </p>
    </FbModal>
  );
};
