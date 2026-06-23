import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbBottomControlsRow as BottomControlsRow } from './components/fbBottomControlsRow';
import { fbModalCancel as CancelPopup } from './components/fbModalCancel';
import { fbModalDraft as DraftPopup } from './components/fbModalDraft';
import { fbLayout as FbLayout, areAllSectionsComplete } from './components/fbLayout';
import { fbModalPassword as PasswordPopup } from './components/fbModalPassword';
import { fbRoVFooter as FbRoVFooter, fbRoVHeader as FbRoVHeader } from './components/fbRoVShell';
import { GeneratedEditForm, GeneratedReadOnlyForm, defaultFormState, designerSections } from './GeneratedFormRenderer';
import { createClient } from './restClient';
import { treatmentSummarySpec } from './treatmentSummarySpec';
import { formatFormDate } from './utils/dateFormat';
import { loadFormHistory } from './utils/formHistory';
import { assertFormVersionIsLatest } from './utils/formVersion';
import { generateUUID } from './utils/formUtils';
import { useEditFormAutoExpandTextareas, useEditFormLabelEqualization } from './utils/formLayoutEffects';
import { fbFormHistoryItem, fbFormHistoryMenu as FbFormHistoryMenu } from './components/fbFormHistoryMenu';
import { useFormSaveFeedback } from './utils/useFormSaveFeedback';

const restClient = createClient();
type SaveStatus = 'final' | 'draft';

interface Patient {
  uuid: string;
  nhs_number: string;
  surname: string;
  forenames: string;
  title: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_line4: string;
  crn: string;
  date_of_birth: string;
  sex: string;
}

interface InlineProps {
  patientUuid?: string;
  formUuid?: string;
  formVersion?: number;
  openInRoV?: boolean;
  onClose: () => void;
}

export default function TreatmentSummary({ inlineProps }: { inlineProps?: InlineProps } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultState = React.useMemo(() => defaultFormState(treatmentSummarySpec), []);
  const sectionsConfig = React.useMemo(() => designerSections(treatmentSummarySpec), []);

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [formState, setFormState] = React.useState<Record<string, any>>({ ...defaultState, dateCreated: formatFormDate(new Date()) });
  const [initialSnapshot, setInitialSnapshot] = React.useState<Record<string, any>>({ ...defaultState });
  const [formChanged, setFormChanged] = React.useState(false);
  const [finalChecked, setFinalChecked] = React.useState(false);
  const [highlySensitive, setHighlySensitive] = React.useState(false);
  const [username, setUsername] = React.useState('demoUser');
  const [loadingData, setLoadingData] = React.useState(false);
  const [isReadOnlyView, setIsReadOnlyView] = React.useState<boolean>(() => !!inlineProps?.openInRoV || !!((location.state as any)?.openInRoV));
  const [clickedRoVButton, setClickedRoVButton] = React.useState(false);
  const [openedFromPatientRecord, setOpenedFromPatientRecord] = React.useState<boolean>(() => !!inlineProps || !!((location.state as any)?.openInRoV !== undefined));
  const [activeSection, setActiveSection] = React.useState(sectionsConfig[0]?.id || '');
  const [showDraftPopup, setShowDraftPopup] = React.useState(false);
  const [showCancelPopup, setShowCancelPopup] = React.useState(false);
  const [selectedFormVersion, setSelectedFormVersion] = React.useState<number | undefined>(() => inlineProps?.formVersion || (location.state as any)?.formVersion);
  const [currentFormVersion, setCurrentFormVersion] = React.useState<number | null>(null);
  const [latestFormVersion, setLatestFormVersion] = React.useState<number | null>(null);
  const [formHistory, setFormHistory] = React.useState<fbFormHistoryItem[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [historyAnchorRect, setHistoryAnchorRect] = React.useState<DOMRect | null>(null);

  const navigateBack = React.useCallback(() => {
    if (inlineProps) {
      inlineProps.onClose();
      return;
    }
    const prevPage = sessionStorage.getItem('fb_prev_main_page') || '/';
    const prevPatientUuid = sessionStorage.getItem('fb_prev_patient_uuid') || patient?.uuid;
    if (prevPage === '/patient-record' && prevPatientUuid) {
      navigate('/patient-record', { state: { patientUuid: prevPatientUuid } });
    } else {
      navigate(prevPage);
    }
  }, [inlineProps, navigate, patient?.uuid]);

  const saveTreatmentSummary = React.useCallback(async (formStatus: SaveStatus, passwordToSave: string) => {
    let formUuid = formState.uuid;
    let version = 0;

    if (formUuid) {
      const latestVersion = await assertFormVersionIsLatest(restClient, 'treatment_summaries', formUuid, currentFormVersion);
      if (latestVersion !== null) version = latestVersion + 1;
    } else {
      formUuid = generateUUID();
    }

    const patientUuidForSave =
      patient?.uuid ||
      inlineProps?.patientUuid ||
      (location.state as { patientUuid?: string } | null)?.patientUuid ||
      treatmentSummarySpec.patientUuid ||
      null;
    const now = new Date().toISOString();
    const formDataToSave = {
      ...formState,
      uuid: formUuid,
      password: passwordToSave,
      username,
      finalChecked: formStatus === 'final',
      highlySensitive,
    };

    const { error: insertError } = await restClient
      .from('treatment_summaries')
      .insert({
        uuid: formUuid,
        version,
        patient_uuid: patientUuidForSave,
        event_datetime: now,
        form_status: formStatus,
        form_data: formDataToSave,
      });
    if (insertError) throw insertError;

    const { error: indexError } = await restClient.from('forms_index').insert({
      form_uuid: formUuid,
      form_version: version,
      form_type: 'treatment_summary',
      patient_uuid: patientUuidForSave,
      event_datetime: now,
      document_datetime: now,
      form_status: formStatus,
      event_or_document: 'Document',
      details: username,
    });
    if (indexError) throw indexError;

    setFormState((prev) => ({ ...prev, uuid: formUuid }));
    setInitialSnapshot({ ...formDataToSave, uuid: formUuid });
    setFormChanged(false);
  }, [currentFormVersion, formState, highlySensitive, inlineProps?.patientUuid, location.state, patient?.uuid, username]);

  const continueAfterStaleSave = React.useCallback(() => {
    setSelectedFormVersion(undefined);
    setIsReadOnlyView(true);
    setClickedRoVButton(false);
  }, []);

  const {
    password,
    setPassword,
    passwordTimeoutRef,
    showPasswordPopup,
    isSaving,
    requestSave,
    confirmPassword,
    cancelPassword,
    renderSaveFeedbackPopups,
  } = useFormSaveFeedback<SaveStatus>({
    onSave: saveTreatmentSummary,
    onSaved: navigateBack,
    onError: () => setFormChanged(true),
    onStaleSave: continueAfterStaleSave,
  });

  React.useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoadingData(true);
      try {
        const state = location.state as { patientUuid?: string; formUuid?: string; username?: string; openInRoV?: boolean } | null;
        const patientUuid = inlineProps?.patientUuid || state?.patientUuid || treatmentSummarySpec.patientUuid;
        const formUuid = inlineProps?.formUuid || state?.formUuid;
        if (state?.username) setUsername(state.username);

        if (patientUuid) {
          const { data: patientData } = await restClient.from('patients').select('*').eq('uuid', patientUuid).order('version', { ascending: false }).limit(1).single();
          if (!cancelled) setPatient(patientData);
        }

        if (formUuid) {
          const requestedVersion = selectedFormVersion;
          const { data: latestVersionRows } = await restClient.from('treatment_summaries').select('version').eq('uuid', formUuid).order('version', { ascending: false }).limit(1);
          const latestVersion = latestVersionRows?.[0]?.version ?? null;
          const { data: formData, error: formError } = requestedVersion !== undefined
            ? await restClient.from('treatment_summaries').select('*').eq('uuid', formUuid).eq('version', requestedVersion).single()
            : await restClient.from('treatment_summaries').select('*').eq('uuid', formUuid).single();
          if (formError) throw formError;
          const historyState = await loadFormHistory(restClient, 'treatment_summaries', formUuid, formData.version ?? null);
          const loadedState = { ...defaultState, ...(formData.form_data || {}), uuid: formUuid };
          if (!cancelled) {
            setFormState(loadedState);
            setInitialSnapshot(loadedState);
            setFinalChecked(formData.form_status === 'final' || !!formData.form_data?.finalChecked);
            setHighlySensitive(!!formData.form_data?.highlySensitive);
            setCurrentFormVersion(formData.version ?? null);
            setLatestFormVersion(latestVersion);
          setFormHistory(historyState.history);
            setFormChanged(false);
            setIsReadOnlyView(!!inlineProps?.openInRoV || !!state?.openInRoV);
            setOpenedFromPatientRecord(!!inlineProps || !!(state && typeof state.openInRoV !== 'undefined'));
          }
        } else if (!cancelled) {
          const freshState = { ...defaultState, dateCreated: formatFormDate(new Date()) };
          setFormState(freshState);
          setInitialSnapshot(freshState);
          setCurrentFormVersion(null);
          setLatestFormVersion(null);
          setFormHistory([]);
          setFormChanged(false);
        }
      } catch (error) {
        console.error('Error loading treatment summary:', error);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [defaultState, inlineProps, location.state, selectedFormVersion]);

  useEditFormLabelEqualization(isReadOnlyView, [formState]);
  useEditFormAutoExpandTextareas(isReadOnlyView, [formState]);

  const handleFieldChange = (fieldName: string, value: any, coded?: boolean) => {
    setFormState((prev) => {
      const updated = { ...prev, [fieldName]: value };
      if (coded !== undefined) updated[`${fieldName}_coded`] = coded;
      return updated;
    });
    setFormChanged(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!finalChecked) {
      setShowDraftPopup(true);
      return;
    }
    requestSave('final');
  };

  const handleCancel = () => {
    if (formChanged) setShowCancelPopup(true);
    else navigateBack();
  };

  const discardChanges = () => {
    setFormState({ ...initialSnapshot });
    setFormChanged(false);
    setShowCancelPopup(false);
    navigateBack();
  };

  const formStatus = finalChecked ? 'final' : 'draft';
  const superseded = currentFormVersion !== null && latestFormVersion !== null && currentFormVersion < latestFormVersion;

  if (loadingData && !patient) {
    return <div style={{ padding: '1rem', fontFamily: "'Roboto', sans-serif" }}>Loading treatment summary...</div>;
  }

  return (
    <>
      {isReadOnlyView ? (
        <div className="bg-white h-screen max-h-screen overflow-hidden flex flex-col" style={{ height: '100vh', fontFamily: "'Roboto', sans-serif", fontWeight: 300, lineHeight: 1.1 }}>
          <FbRoVHeader title="Treatment summary" patient={patient} formStatus={formStatus} superseded={superseded} />
          <div className="flex-1 flex overflow-hidden">
            <nav className="w-64 overflow-y-auto hidden md:block" style={{ backgroundColor: 'white', padding: '0.4rem' }}>
              <div className="fb-waiting-list-rov-nav-grid">
                {sectionsConfig.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <React.Fragment key={section.id}>
                      <a href={`#${section.id}`} className="fb-waiting-list-rov-nav-section-name" onClick={() => setActiveSection(section.id)}>
                        {section.name}
                      </a>
                      <span className={`fb-waiting-list-rov-nav-indicator ${!isActive ? 'hidden' : ''}`}>◀▶</span>
                    </React.Fragment>
                  );
                })}
              </div>
            </nav>
            <div className="flex-grow flex-shrink flex-1 overflow-y-auto rov-scroll-container" style={{ scrollBehavior: 'smooth', minHeight: 0, padding: '0.4rem' }}>
              <GeneratedReadOnlyForm spec={treatmentSummarySpec} formState={formState} />
            </div>
          </div>
          <FbRoVFooter
            username={username}
            reachedByRoVButton={clickedRoVButton}
            onSwitchToEV={() => {
              setClickedRoVButton(false);
              setIsReadOnlyView(false);
            }}
            onBack={superseded ? () => setSelectedFormVersion(undefined) : navigateBack}
            superseded={superseded}
            onHistory={formHistory.length ? (anchorRect) => {
              setHistoryAnchorRect(anchorRect);
              setShowHistory(true);
            } : undefined}
          />
        </div>
      ) : (
        <FbLayout
          style={{ lineHeight: 1.1 }}
          header={
            <div style={{ borderBottom: '0.2rem solid rgb(27, 110, 194)', marginBottom: '0.2rem', padding: '0.4rem' }}>
              <div className="flex justify-between items-center">
                <h1 style={{ fontSize: '2rem', fontWeight: 500 }}>Treatment summary</h1>
                {patient ? (
                  <Addressograph
                    nhsNumber={patient.nhs_number}
                    surname={patient.surname}
                    forenames={patient.forenames}
                    title={patient.title}
                    addressLine1={patient.address_line1}
                    addressLine2={patient.address_line2}
                    addressLine3={patient.address_line3}
                    addressLine4={patient.address_line4}
                    crn={patient.crn}
                    dateOfBirth={patient.date_of_birth}
                    sex={patient.sex}
                  />
                ) : <Addressograph />}
              </div>
            </div>
          }
          sections={sectionsConfig}
          formState={formState}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isReadOnlyView={false}
          onSubmit={handleSubmit}
          bottomControls={
            <BottomControlsRow
              openedFromPatientRecord={openedFromPatientRecord}
              onRoVClick={() => {
                setClickedRoVButton(true);
                setIsReadOnlyView(true);
              }}
              highlySensitive={highlySensitive}
              onHighlySensitiveChange={setHighlySensitive}
              finalChecked={finalChecked}
              onFinalCheckedChange={setFinalChecked}
              requiredFieldsComplete={areAllSectionsComplete(sectionsConfig, formState)}
              username={username}
              onUsernameChange={setUsername}
              password={password}
              onPasswordChange={setPassword}
              passwordTimeoutRef={passwordTimeoutRef}
              formChanged={formChanged}
              isSaving={isSaving}
              onCancel={handleCancel}
            />
          }
        >
          <GeneratedEditForm spec={treatmentSummarySpec} formState={formState} onChange={handleFieldChange} />
        </FbLayout>
      )}

      {showDraftPopup && <DraftPopup onSaveDraft={() => { setShowDraftPopup(false); requestSave('draft'); }} onCancel={() => setShowDraftPopup(false)} />}
      {showPasswordPopup && <PasswordPopup onConfirm={confirmPassword} onCancel={cancelPassword} />}
      {showCancelPopup && <CancelPopup onDiscard={discardChanges} onReturnToForm={() => setShowCancelPopup(false)} />}
      {showHistory && historyAnchorRect && (
        <FbFormHistoryMenu
          items={formHistory}
          anchorRect={historyAnchorRect}
          onCancel={() => setShowHistory(false)}
          onSelectVersion={(item) => {
            setShowHistory(false);
            setSelectedFormVersion(item.form_version);
            setIsReadOnlyView(true);
          }}
        />
      )}
      {renderSaveFeedbackPopups()}
    </>
  );
}
