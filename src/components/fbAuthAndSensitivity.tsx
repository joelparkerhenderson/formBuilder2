import React from 'react';
import { fbAuthControls as AuthControls } from './fbAuthControls';
import { fbFinalControl as FinalControl } from './fbFinalControl';

interface fbAuthAndSensitivityProps {
  highlySensitive: boolean;
  onHighlySensitiveChange: (checked: boolean) => void;
  finalChecked: boolean;
  onFinalCheckedChange: (checked: boolean) => void;
  requiredFieldsComplete: boolean;
  username: string;
  onUsernameChange: (value: string) => void;
  password?: string;
  onPasswordChange: (value: string) => void;
  formChanged?: boolean;
  passwordTimeoutRef: React.MutableRefObject<number | null>;
}

export const fbAuthAndSensitivity: React.FC<fbAuthAndSensitivityProps> = ({
  highlySensitive,
  onHighlySensitiveChange,
  finalChecked,
  onFinalCheckedChange,
  requiredFieldsComplete,
  username,
  onUsernameChange,
  password = '',
  onPasswordChange,
  formChanged = true,
  passwordTimeoutRef,
}) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
      <label
        className="flex items-center gap-2 fb-bottom-control-item"
        style={{
          border: '0.1rem solid silver',
          borderRadius: '0.4rem',
          display: 'inline-flex',
          alignItems: 'center',
          height: '2.0rem',
          marginLeft: '0.2rem',
          padding: '0 0.5rem',
          backgroundColor: 'white',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 400,
          color: 'black',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <input
          type="checkbox"
          checked={highlySensitive}
          onChange={(e) => onHighlySensitiveChange(e.target.checked)}
          style={{
            margin: 0,
            width: '1rem',
            height: '1rem',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'none',
          }}
        />
        <span style={{ fontWeight: 300 }}>Highly sensitive</span>
      </label>

      <FinalControl
        checked={finalChecked}
        disabled={!requiredFieldsComplete}
        onChange={onFinalCheckedChange}
        className="fb-bottom-control-final"
        style={{
          marginLeft: '0.2rem',
        }}
      />

      <AuthControls
        username={username}
        password={password}
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        formChanged={formChanged}
        passwordTimeoutRef={passwordTimeoutRef}
      />
    </div>
  );
};
