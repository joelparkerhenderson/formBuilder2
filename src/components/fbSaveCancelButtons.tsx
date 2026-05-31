import React from 'react';
import { fbCancelFormButton as FbCancelFormButton } from './fbCancelFormButton';
import { fbButton as FbButton } from './fbButton';

interface SaveCancelButtonsProps {
  formChanged: boolean;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
}

export const fbSaveCancelButtons: React.FC<SaveCancelButtonsProps> = ({
  formChanged,
  onCancel,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  isSaving = false,
}) => {
  return (
    <>
      <FbButton
        type="submit"
        disabled={!formChanged || isSaving}
        variant={formChanged ? 'success' : 'secondary'}
        className="fb-bottom-btn-save"
        style={{
          marginLeft: '0.2rem',
          ...(formChanged ? {} : {
            backgroundColor: '#c0c0c0',
            borderColor: '#c0c0c0',
            color: 'white',
          })
        }}
      >
        {isSaving ? 'Saving...' : saveLabel}
      </FbButton>

      <FbCancelFormButton
        className="fb-bottom-btn-cancel"
        onClick={onCancel}
        style={{
          marginLeft: '0.2rem',
        }}
      />
    </>
  );
};
