import React from 'react';
import { fbButton as FbButton } from './fbButton';

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

export const fbSaveErrorPopup: React.FC<SaveErrorPopupProps> = ({ error, onReturnToForm }) => {
  const errorText = formatError(error);

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
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '0.2rem solid rgb(27, 110, 194)',
          borderRadius: '0.4rem',
          padding: '1.5rem',
          maxWidth: '450px',
          width: '90%',
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem', color: '#1b6ec2' }}>
          Error
        </h2>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FbButton type="button" variant="success" onClick={onReturnToForm}>
            Return to form
          </FbButton>
        </div>
      </div>
    </div>
  );
};
