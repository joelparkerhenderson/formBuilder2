import * as React from 'react';
import { fbSavingPopup as SavingPopup } from '../components/fbSavingPopup';
import { fbSavedPopup as SavedPopup } from '../components/fbSavedPopup';
import { fbSaveErrorPopup as SaveErrorPopup } from '../components/fbSaveErrorPopup';
import { fbStaleSavePopup as StaleSavePopup } from '../components/fbStaleSavePopup';
import { isStaleFormVersionError } from './formVersion';

const SAVE_SUCCESS_DISPLAY_MS = 1000;

interface UseFormSaveFeedbackOptions<SaveStatus extends string> {
  onSave: (status: SaveStatus, password: string) => Promise<void>;
  onSaved: () => void;
  onError?: () => void;
  onStaleSave?: () => void;
}

export const useFormSaveFeedback = <SaveStatus extends string>({
  onSave,
  onSaved,
  onError,
  onStaleSave,
}: UseFormSaveFeedbackOptions<SaveStatus>) => {
  const [password, setPasswordState] = React.useState<string>('');
  const passwordRef = React.useRef<string>('');
  const passwordTimeoutRef = React.useRef<number | null>(null);
  const pendingSaveStatusRef = React.useRef<SaveStatus | null>(null);

  const [showPasswordPopup, setShowPasswordPopup] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [showSavedPopup, setShowSavedPopup] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<unknown>(null);
  const [showStaleSavePopup, setShowStaleSavePopup] = React.useState<boolean>(false);

  const clearPasswordTimeout = React.useCallback(() => {
    if (passwordTimeoutRef.current !== null) {
      window.clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = null;
    }
  }, []);

  const setPassword = React.useCallback((value: string) => {
    passwordRef.current = value;
    setPasswordState(value);
  }, []);

  const clearPassword = React.useCallback(() => {
    clearPasswordTimeout();
    setPassword('');
  }, [clearPasswordTimeout, setPassword]);

  const runSave = React.useCallback(async (status: SaveStatus, passwordToSave: string) => {
    clearPasswordTimeout();
    setIsSaving(true);
    setShowSavedPopup(false);
    setSaveError(null);

    try {
      await onSave(status, passwordToSave);
      clearPassword();
      setIsSaving(false);
      setShowSavedPopup(true);
      await new Promise((resolve) => window.setTimeout(resolve, SAVE_SUCCESS_DISPLAY_MS));
      onSaved();
    } catch (error) {
      console.error(`Error saving ${status}:`, error);
      setIsSaving(false);
      setShowSavedPopup(false);
      if (isStaleFormVersionError(error)) {
        setShowStaleSavePopup(true);
        return;
      }
      setSaveError(error);
      onError?.();
    }
  }, [clearPassword, clearPasswordTimeout, onError, onSave, onSaved]);

  const requestSave = React.useCallback((status: SaveStatus) => {
    const passwordToSave = passwordRef.current;
    if (!passwordToSave) {
      pendingSaveStatusRef.current = status;
      setShowPasswordPopup(true);
      return;
    }
    void runSave(status, passwordToSave);
  }, [runSave]);

  const confirmPassword = React.useCallback((passwordValue: string) => {
    setPassword(passwordValue);
    setShowPasswordPopup(false);
    clearPasswordTimeout();

    const pendingSaveStatus = pendingSaveStatusRef.current;
    pendingSaveStatusRef.current = null;
    if (pendingSaveStatus) {
      void runSave(pendingSaveStatus, passwordValue);
    }
  }, [clearPasswordTimeout, runSave, setPassword]);

  const cancelPassword = React.useCallback(() => {
    pendingSaveStatusRef.current = null;
    setShowPasswordPopup(false);
  }, []);

  const returnToFormAfterError = React.useCallback(() => {
    setSaveError(null);
    setIsSaving(false);
    setShowSavedPopup(false);
  }, []);

  const continueAfterStaleSave = React.useCallback(() => {
    setShowStaleSavePopup(false);
    setIsSaving(false);
    setShowSavedPopup(false);
    setSaveError(null);
    onStaleSave?.();
  }, [onStaleSave]);

  const renderSaveFeedbackPopups = React.useCallback(() => (
    <>
      {isSaving && <SavingPopup />}
      {showSavedPopup && <SavedPopup />}
      {showStaleSavePopup && <StaleSavePopup onContinue={continueAfterStaleSave} />}
      {saveError && (
        <SaveErrorPopup
          error={saveError}
          onReturnToForm={returnToFormAfterError}
        />
      )}
    </>
  ), [continueAfterStaleSave, isSaving, returnToFormAfterError, saveError, showSavedPopup, showStaleSavePopup]);

  React.useEffect(() => clearPasswordTimeout, [clearPasswordTimeout]);

  return {
    password,
    setPassword,
    passwordTimeoutRef,
    showPasswordPopup,
    isSaving,
    requestSave,
    confirmPassword,
    cancelPassword,
    renderSaveFeedbackPopups,
  };
};
