import React from 'react';
import { fbButton as FbButton } from './fbButton';

interface PasswordPopupProps {
  onClose?: () => void;
  onConfirm?: (password: string) => void;
  onCancel?: () => void;
}

export const fbPasswordPopup: React.FC<PasswordPopupProps> = ({ onClose, onConfirm, onCancel }) => {
  const [passwordValue, setPasswordValue] = React.useState('');
  const [error, setError] = React.useState('');
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmClick();
    }
  };

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
          {onConfirm ? 'You must re-enter your password to complete this action.' : 'You must re-enter your password to save.'}
        </p>

        {onConfirm && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: '#444' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                if (e.target.value) setError('');
              }}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
              style={{
                width: '100%',
                border: error ? '1px solid #d50000' : '1px solid silver',
                borderRadius: '0.4rem',
                padding: '0 0.5rem',
                height: '2.0rem',
                lineHeight: '2rem',
                fontSize: '1rem',
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 400,
                color: 'black',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: isFocused || isHovered ? '#ffffcc' : 'white',
                boxShadow: error ? '0 0 0 2px rgba(213, 0, 0, 0.15)' : 'none',
                transition: 'background-color 0.2s',
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
