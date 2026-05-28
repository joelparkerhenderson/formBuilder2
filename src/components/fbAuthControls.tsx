import React from 'react';

interface AuthControlsProps {
  username: string;
  setUsername?: (value: string) => void;
  onUsernameChange?: (value: string) => void;
  password?: string;
  setPassword?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  formChanged?: boolean;
  passwordTimeoutRef: React.MutableRefObject<number | null>;
}

export const fbAuthControls: React.FC<AuthControlsProps> = ({
  username,
  setUsername,
  onUsernameChange,
  password = '',
  setPassword,
  onPasswordChange,
  formChanged = true,
  passwordTimeoutRef
}) => {
  const handleUsernameChange = onUsernameChange || setUsername;
  const handlePasswordChange = onPasswordChange || setPassword;

  return (
    <>
      <input
        type="text"
        name="username"
        value={username}
        onChange={(e) => handleUsernameChange && handleUsernameChange(e.target.value)}
        placeholder="Enter username"
        className="bottom-control-username"
        style={{
          display: 'inline-block',
          height: '2.0rem',
          lineHeight: '2rem',
          marginLeft: '0.2rem',
          padding: '0 0.5rem',
          border: '0.1rem solid silver',
          borderRadius: '0.4rem',
          backgroundColor: 'white',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '1rem',
          fontWeight: 400,
          color: 'black'
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = '#ffffcc';
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = 'white';
        }}
      />
      {formChanged && (
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => handlePasswordChange && handlePasswordChange(e.target.value)}
          placeholder="Enter password"
          className="bottom-control-password"
          style={{
            display: 'inline-block',
            height: '2.0rem',
            lineHeight: '2rem',
            marginLeft: '0.2rem',
            padding: '0 0.5rem',
            border: '0.1rem solid silver',
            borderRadius: '0.4rem',
            backgroundColor: 'white',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '1rem',
            fontWeight: 400,
            color: 'black'
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = '#ffffcc';
            // Clear any pending timeout when field is focused
            if (passwordTimeoutRef.current !== null) {
              window.clearTimeout(passwordTimeoutRef.current);
              passwordTimeoutRef.current = null;
            }
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = 'white';
            // Set timeout to clear password after 2 seconds
            if (password && handlePasswordChange) {
              passwordTimeoutRef.current = window.setTimeout(() => {
                handlePasswordChange('');
                passwordTimeoutRef.current = null;
              }, 2000);
            }
          }}
        />
      )}
    </>
  );
};
