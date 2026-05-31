import React from 'react';
import { fbButton as FbButton } from './fbButton';
import { fbPassword as FbPassword } from './fbPassword';

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
          maxWidth: '450px',
          width: '90%',
          fontFamily: "'Roboto', sans-serif"
        }}
      >
        <h2 style={{fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem', color: '#1b6ec2'}}>Password re-entry required</h2>
        <p style={{marginBottom: '1.2rem', lineHeight: '1.4', color: '#333333'}}>
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

        <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
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
      </div>
    </div>
  );
};
