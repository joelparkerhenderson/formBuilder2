import React from 'react';
import { fbButton as FbButton } from './fbButton';
import { fbPassword as FbPassword } from './fbPassword';
import { fbPopup as FbPopup } from './fbPopup';

interface PasswordPopupProps {
  onClose?: () => void;
  onConfirm?: (password: string) => void;
  onCancel?: () => void;
}

export const fbPasswordPopup: React.FC<PasswordPopupProps> = ({ onClose, onConfirm, onCancel }) => {
  const [passwordValue, setPasswordValue] = React.useState('');
  const [error, setError] = React.useState('');

  const handleConfirmClick = () => {
    if (!passwordValue.trim()) {
      setError('Password is required');
      return;
    }
    setError('');
    if (onConfirm) {
      onConfirm(passwordValue);
    }
  };

  const handleCancelClick = onCancel || onClose;

  return (
    <FbPopup
      title="Password re-entry required"
      maxWidth="450px"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {onConfirm && (
            <FbButton
              type="button"
              variant="success"
              onClick={handleConfirmClick}
            >
              Save
            </FbButton>
          )}
          <FbButton
            type="button"
            variant="danger"
            onClick={handleCancelClick}
          >
            Return to form
          </FbButton>
        </div>
      }
    >
      <p style={{ marginBottom: '1.2rem', lineHeight: '1.4', color: '#333333' }}>
          {onConfirm ? 'You must re-enter your password to save the form.' : 'You must re-enter your password to save the form.'}
        </p>

        {onConfirm && (
          <div style={{ marginBottom: '1.5rem' }}>
            <FbPassword
              label="Password"
              placeholder="Enter password..."
              value={passwordValue}
              onChange={(val) => {
                setPasswordValue(val);
                if (val) setError('');
              }}
              id="password-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmClick();
                }
              }}
              inputStyle={{
                border: error ? '1px solid #d50000' : '1px solid silver',
                boxShadow: error ? '0 0 0 2px rgba(213, 0, 0, 0.15)' : 'none',
              }}
            />
            {error && (
              <span style={{ color: '#d50000', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                {error}
              </span>
            )}
          </div>
        )}
    </FbPopup>
  );
};
