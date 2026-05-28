import React from 'react';

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
      <button
        type="submit"
        disabled={!formChanged || isSaving}
        className="bottom-control-btn-save"
        style={{
          backgroundColor: formChanged ? '#008000' : '#c0c0c0',
          color: 'white',
          border: 'none',
          borderRadius: '0.4rem',
          display: 'inline-block',
          height: '2.0rem',
          lineHeight: '2rem',
          marginLeft: '0.2rem',
          padding: '0 0.8rem',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 500,
          cursor: formChanged ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.2s ease, color 0.2s ease',
          opacity: 1,
        }}
      >
        {isSaving ? 'Saving...' : saveLabel}
      </button>

      <button
        type="button"
        className="bottom-control-btn-cancel"
        onClick={onCancel}
        style={{
          backgroundColor: '#d50000',
          color: 'white',
          border: 'none',
          borderRadius: '0.4rem',
          display: 'inline-block',
          height: '2.0rem',
          lineHeight: '2rem',
          marginLeft: '0.2rem',
          padding: '0 0.8rem',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease, color 0.2s ease',
        }}
      >
        {cancelLabel}
      </button>
    </>
  );
};
