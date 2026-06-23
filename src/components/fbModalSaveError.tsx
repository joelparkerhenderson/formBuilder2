import React from 'react';
import { fbButton as FbButton } from './fbButton';
import { fbModal as FbModal } from './fbModal';

interface SaveErrorPopupProps {
  error?: unknown;
  onReturnToForm: () => void;
}

const formatError = (error: unknown) => {
  if (!error) return '';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};

export const fbModalSaveError: React.FC<SaveErrorPopupProps> = ({ error, onReturnToForm }) => {
  const errorText = formatError(error);

  return (
    <FbModal
      title="Error"
      maxWidth="450px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FbButton type="button" variant="success" onClick={onReturnToForm}>
            Return to form
          </FbButton>
        </div>
      }
    >
      <p style={{ marginBottom: '1.2rem', lineHeight: '1.4', color: '#333333' }}>
        Changes may not have been saved
      </p>
      <pre
          style={{
            border: '0.1rem solid silver',
            borderRadius: '0.4rem',
            backgroundColor: 'white',
            color: '#333333',
            fontFamily: "'Roboto Mono', Consolas, monospace",
            fontSize: '0.85rem',
            lineHeight: 1.3,
            margin: '0 0 1.5rem 0',
            maxHeight: '12rem',
            overflow: 'auto',
            padding: '0.5rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {errorText}
        </pre>
    </FbModal>
  );
};
