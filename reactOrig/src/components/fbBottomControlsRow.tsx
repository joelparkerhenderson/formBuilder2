import React from 'react';
import { fbAuthAndSensitivity as FbAuthAndSensitivity } from './fbAuthAndSensitivity';
import { fbSaveCancelButtons as FbSaveCancelButtons } from './fbSaveCancelButtons';
import { fbButton as FbButton } from './fbButton';

interface BottomControlsRowProps {
  openedFromPatientRecord: boolean;
  onRoVClick: () => void;
  highlySensitive: boolean;
  onHighlySensitiveChange: (checked: boolean) => void;
  finalChecked: boolean;
  onFinalCheckedChange: (checked: boolean) => void;
  requiredFieldsComplete: boolean;
  username: string;
  onUsernameChange: (value: string) => void;
  password?: string;
  onPasswordChange: (value: string) => void;
  passwordTimeoutRef: React.MutableRefObject<number | null>;
  formChanged: boolean;
  onCancel: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

export const fbBottomControlsRow: React.FC<BottomControlsRowProps> = ({
  openedFromPatientRecord,
  onRoVClick,
  highlySensitive,
  onHighlySensitiveChange,
  finalChecked,
  onFinalCheckedChange,
  requiredFieldsComplete,
  username,
  onUsernameChange,
  password = '',
  onPasswordChange,
  passwordTimeoutRef,
  formChanged,
  onCancel,
  isSaving = false,
  saveLabel,
}) => {
  return (
    <div
      className="fb-bottom-control-bar"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '0.4rem',
        backgroundColor: 'white',
        borderTop: '0.2rem solid rgb(27, 110, 194)',
        minHeight: '2.8rem',
        boxSizing: 'border-box'
      }}
    >
      {!openedFromPatientRecord && (
        <FbButton
          type="button"
          variant="primary"
          className="fb-bottom-control-btn-rov"
          onClick={onRoVClick}
          style={{
            marginLeft: '0.2rem',
            padding: '0 0.5rem',
          }}
        >
          RoV
        </FbButton>
      )}

      {/* Spacing element */}
      <div style={{ flex: 1 }}></div>

      {/* Nested Security, Final, Username & Password controls */}
      <FbAuthAndSensitivity
        highlySensitive={highlySensitive}
        onHighlySensitiveChange={onHighlySensitiveChange}
        finalChecked={finalChecked}
        onFinalCheckedChange={onFinalCheckedChange}
        requiredFieldsComplete={requiredFieldsComplete}
        username={username}
        onUsernameChange={onUsernameChange}
        password={password}
        onPasswordChange={onPasswordChange}
        formChanged={formChanged}
        passwordTimeoutRef={passwordTimeoutRef}
      />

      {/* Save and Cancel buttons */}
      <FbSaveCancelButtons
        formChanged={formChanged}
        onCancel={onCancel}
        isSaving={isSaving}
        saveLabel={saveLabel}
      />
    </div>
  );
};
