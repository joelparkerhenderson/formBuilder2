import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from '../components/fbAddressograph';
import { fbBottomControlsRow as BottomControlsRow } from '../components/fbBottomControlsRow';
import { fbBoxedWarning as FbBoxedWarning } from '../components/fbBoxedMessage';
import { fbCheck as FbCheck } from '../components/fbCheck';
import { fbDateExact as FbDateExact } from '../components/fbDateExact';
import { fbDateHeightWeightBMIRow as FbDateHeightWeightBMIRow } from '../components/fbDateHeightWeightBMIRow';
import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import { fbGroup as FbGroup } from '../components/fbGroup';
import { fbHeader as FbHeader } from '../components/fbHeader';
import { fbInverseSubq as FbInverseSubq } from '../components/fbInverseSubq';
import { fbLayout as FbLayout, SectionSpec, areAllSectionsComplete } from '../components/fbLayout';
import { fbModalCancel as CancelPopup } from '../components/fbModalCancel';
import { fbModalDraft as DraftPopup } from '../components/fbModalDraft';
import { fbModalPassword as PasswordPopup } from '../components/fbModalPassword';
import { fbMSISelector as FbMSISelector } from '../components/fbMSISelector';
import { fbNotificationTypeGroup as FbNotificationTypeGroup } from '../components/fbNotificationTypeGroup';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbRadio as FbRadio } from '../components/fbRadio';
import { fbRoVField as FbRoVField } from '../components/fbRoVField';
import { fbRoVFooter as FbRoVFooter, fbRoVHeader as FbRoVHeader } from '../components/fbRoVShell';
import { fbSection as FbSection } from '../components/fbSection';
import { fbSmartDropdown as FbSmartDropdown } from '../components/fbSmartDropdown';
import { fbSubqForOption as FbSubqForOption } from '../components/fbSubqForOption';
import { fbTextArea as FbTextArea } from '../components/fbTextArea';
import { fbTextInput as FbTextInput } from '../components/fbTextInput';
import { createClient } from '../restClient';
import { healthBoards, facilities, facilitiesForHealthBoard, patientLocations, specialityValuesForFacility } from '../data/clinicalDestinations';
import { hospitalLabels, organisationLabels, specialityLabels } from '../data/formLabels';
import { specialities } from '../data/specialities';
import { assertFormVersionIsLatest } from '../utils/formVersion';
import { generateUUID } from '../utils/formUtils';
import { useFormSaveFeedback } from '../utils/useFormSaveFeedback';

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
  openInRoV?: boolean;
  onClose: () => void;
}

type FormState = Record<string, any>;

const sections: SectionSpec[] = [
  { id: 'to', name: 'To', requiredFields: ['organisation', 'hospital'] },
  { id: 'from', name: 'From', requiredFields: ['fromOrganisation', 'fromSpeciality', 'fromHospital'] },
  { id: 'requestType', name: 'Request type', requiredFields: ['requestType', 'capacity'] },
  { id: 'testsRequired', name: 'Tests required', getIncompleteCount: (state) => selectedTests(state).length ? 0 : 1 },
  { id: 'pastMedicalHistory', name: 'Past medical history', requiredFields: ['cardiacDevice', 'previousCardiacSurgery'] },
  { id: 'otherPatientInformation', name: 'Other patient information' },
  { id: 'requestor', name: 'Requestor', requiredFields: ['requestor', 'requestorContact'] },
];

const defaultState: FormState = {
  organisation: '',
  hospital: '',
  forAttentionOf: '',
  fromOrganisation: 'cwm-hafan',
  fromHospital: 'llanawel-general',
  fromSpeciality: 'cardiology',
  seniorResponsibleClinician: '',
  requestType: '',
  urgency: 'routine',
  appointmentType: '',
  capacity: 'unknown',
  deferTests: 'no',
  notificationType: 'routine',
  cardiacDevice: 'unknown',
  previousCardiacSurgery: 'unknown',
  preferredLanguage: 'english',
};

const testFields = [
  ['testAbpm', 'Ambulatory BP monitoring'],
  ['testAecg', 'Ambulatory ECG'],
  ['testEtt', 'Exercise tolerance test'],
  ['testIlrDownload', 'Implantable loop recorder (ILR) download'],
  ['testCiedCheck', 'Cardiac implanted electronic device (CIED) check'],
  ['testTilt', 'Tilt test'],
  ['testTte', 'Transthoracic echocardiogram'],
] as const;

function selectedTests(state: FormState) {
  return testFields.filter(([key]) => !!state[key]).map(([, label]) => label);
}

function cleanState(state: FormState) {
  return Object.fromEntries(Object.entries(state).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function displayValue(value: string, labels?: Record<string, string>) {
  return labels?.[value] || specialities.find((item) => item.value === value)?.label || value;
}

export default function CardiologyTestRequest({ inlineProps }: { inlineProps?: InlineProps } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [formState, setFormState] = React.useState<FormState>(defaultState);
  const [initialSnapshot, setInitialSnapshot] = React.useState<FormState>(defaultState);
  const [formChanged, setFormChanged] = React.useState(false);
  const [finalChecked, setFinalChecked] = React.useState(false);
  const [highlySensitive, setHighlySensitive] = React.useState(false);
  const [username, setUsername] = React.useState('demoUser');
  const [isReadOnlyView, setIsReadOnlyView] = React.useState<boolean>(() => !!inlineProps?.openInRoV || !!((location.state as any)?.openInRoV));
  const [openedFromPatientRecord, setOpenedFromPatientRecord] = React.useState<boolean>(() => !!inlineProps || !!((location.state as any)?.openInRoV !== undefined));
  const [clickedRoVButton, setClickedRoVButton] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('to');
  const [currentFormVersion, setCurrentFormVersion] = React.useState<number | null>(null);
  const [showDraftPopup, setShowDraftPopup] = React.useState(false);
  const [showCancelPopup, setShowCancelPopup] = React.useState(false);

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

  const saveForm = React.useCallback(async (formStatus: SaveStatus, passwordToSave: string) => {
    let formUuid = formState.uuid;
    let version = 0;
    if (formUuid) {
      const latestVersion = await assertFormVersionIsLatest(restClient, 'cardiology_test_requests', formUuid, currentFormVersion);
      if (latestVersion !== null) version = latestVersion + 1;
    } else {
      formUuid = generateUUID();
    }

    const patientUuidForSave = patient?.uuid || inlineProps?.patientUuid || (location.state as any)?.patientUuid || null;
    const now = new Date().toISOString();
    const formDataToSave = {
      ...cleanState(formState),
      uuid: formUuid,
      username,
      password: passwordToSave,
      finalChecked: formStatus === 'final',
      highlySensitive,
    };

    const { error: insertError } = await restClient.from('cardiology_test_requests').insert({
      uuid: formUuid,
      version,
      patient_uuid: patientUuidForSave,
      event_datetime: now,
      form_status: formStatus,
      highly_sensitive: highlySensitive,
      organisation: formState.fromOrganisation || formState.organisation || null,
      hospital: formState.hospital || formState.fromHospital || null,
      senior_responsible_clinician: formState.seniorResponsibleClinician || null,
      speciality: formState.fromSpeciality || 'cardiology',
      form_data: formDataToSave,
    });
    if (insertError) throw insertError;

    const { error: indexError } = await restClient.from('forms_index').insert({
      form_uuid: formUuid,
      form_version: version,
      form_type: 'cardiology_test_request',
      patient_uuid: patientUuidForSave,
      event_datetime: now,
      document_datetime: now,
      form_status: formStatus,
      event_or_document: 'Document',
      organisation: formState.fromOrganisation || formState.organisation || null,
      hospital: formState.hospital || formState.fromHospital || null,
      senior_responsible_clinician: formState.seniorResponsibleClinician || null,
      speciality: formState.fromSpeciality || 'cardiology',
      highly_sensitive: highlySensitive,
      details: selectedTests(formState).join(', ') || 'Cardiology test request',
    });
    if (indexError) throw indexError;

    const savedState = { ...formDataToSave, uuid: formUuid };
    setFormState(savedState);
    setInitialSnapshot(savedState);
    setCurrentFormVersion(version);
    setFormChanged(false);
  }, [currentFormVersion, formState, highlySensitive, inlineProps?.patientUuid, location.state, patient?.uuid, username]);

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
    onSave: saveForm,
    onSaved: navigateBack,
    onError: () => setFormChanged(true),
    onStaleSave: () => setIsReadOnlyView(true),
  });

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const state = location.state as { patientUuid?: string; formUuid?: string; username?: string; openInRoV?: boolean } | null;
      const patientUuid = inlineProps?.patientUuid || state?.patientUuid || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
      const formUuid = inlineProps?.formUuid || state?.formUuid;
      if (state?.username) setUsername(state.username);
      const { data: patientData } = await restClient.from('patients').select('*').eq('uuid', patientUuid).order('version', { ascending: false }).limit(1).single();
      if (!cancelled) setPatient(patientData);
      if (formUuid) {
        const { data: saved, error } = await restClient.from('cardiology_test_requests').select('*').eq('uuid', formUuid).single();
        if (error) throw error;
        const loaded = { ...defaultState, ...(saved.form_data || {}), uuid: formUuid };
        if (!cancelled) {
          setFormState(loaded);
          setInitialSnapshot(loaded);
          setFinalChecked(saved.form_status === 'final' || !!saved.form_data?.finalChecked);
          setHighlySensitive(!!saved.highly_sensitive || !!saved.form_data?.highlySensitive);
          setCurrentFormVersion(saved.version ?? null);
          setIsReadOnlyView(!!inlineProps?.openInRoV || !!state?.openInRoV);
          setOpenedFromPatientRecord(!!inlineProps || !!(state && typeof state.openInRoV !== 'undefined'));
          setFormChanged(false);
        }
      }
    };
    load().catch((error) => console.error('Error loading cardiology test request:', error));
    return () => { cancelled = true; };
  }, [inlineProps, location.state]);

  React.useEffect(() => {
    const live = { ...cleanState(formState), finalChecked, highlySensitive };
    const base = { ...cleanState(initialSnapshot), finalChecked: !!initialSnapshot.finalChecked, highlySensitive: !!initialSnapshot.highlySensitive };
    setFormChanged(JSON.stringify(live) !== JSON.stringify(base));
  }, [finalChecked, formState, highlySensitive, initialSnapshot]);

  const setField = (field: string, value: any) => setFormState((prev) => ({ ...prev, [field]: value }));
  const check = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => setField(field, event.target.checked);
  const radio = (field: string, value: string, label: string, children?: React.ReactNode) => (
    <FbRadio name={field} value={value} checked={formState[field] === value} onChange={() => setField(field, value)} label={label}>
      {children}
    </FbRadio>
  );
  const checkbox = (field: string, label: string, children?: React.ReactNode) => (
    <FbCheck name={field} checked={!!formState[field]} onChange={check(field)} label={label}>{children}</FbCheck>
  );
  const specialityOptions = specialityValuesForFacility(formState.fromHospital || formState.hospital);
  const filteredSpecialities = specialityOptions.length ? specialities.filter((item) => specialityOptions.includes(item.value)) : specialities;
  const formStatus = finalChecked ? 'final' : 'draft';

  const editForm = (
    <>
      <FbSection id="to" title="To">
        <FbGridRow cols={3}>
          <FbGridCell><FbDropdown label="Health board" value={formState.organisation || ''} onChange={(value) => { setField('organisation', value); setField('hospital', ''); }} options={healthBoards} required /></FbGridCell>
          <FbGridCell><FbDropdown label="Hospital / Department" value={formState.hospital || ''} onChange={value => setField('hospital', value)} options={facilitiesForHealthBoard(formState.organisation || '').map(({ value, label }) => ({ value, label }))} placeholder="Select" required /></FbGridCell>
          <FbGridCell><FbTextInput label="For attention of" value={formState.forAttentionOf || ''} onChange={value => setField('forAttentionOf', value)} /></FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="from" title="From (requesting organisation and clinician)">
        <FbGridRow cols={4}>
          <FbGridCell><FbDropdown label="Health board" value={formState.fromOrganisation || ''} onChange={value => { setField('fromOrganisation', value); setField('fromHospital', ''); }} options={healthBoards} required /></FbGridCell>
          <FbGridCell><FbDropdown label="Hospital" value={formState.fromHospital || ''} onChange={value => setField('fromHospital', value)} options={facilitiesForHealthBoard(formState.fromOrganisation || '').map(({ value, label }) => ({ value, label }))} placeholder="Select" required /></FbGridCell>
          <FbGridCell><FbDropdown label="Speciality" value={formState.fromSpeciality || ''} onChange={value => setField('fromSpeciality', value)} options={filteredSpecialities} placeholder="Select" required /></FbGridCell>
          <FbGridCell><FbTextInput label="Senior responsible clinician" value={formState.seniorResponsibleClinician || ''} onChange={value => setField('seniorResponsibleClinician', value)} /></FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="requestType" title="Request type">
        <FbGroup label="Request type" required>
          {radio('requestType', 'inpatient-ed', 'Inpatient / ED', <>
            <FbSmartDropdown label="Patient location" value={formState.patientLocation || ''} onChange={value => setField('patientLocation', value)} options={patientLocations} required subfield />
            {checkbox('uscPathway', 'USC pathway')}
            {checkbox('wardTest', 'Test(s) required on ward')}
            <FbInverseSubq open={!formState.wardTest}>
              <FbGroup label="Transport" required subfield>
                {radio('transport', 'walking', 'Walking')}
                {radio('transport', 'chair', 'Chair')}
                {radio('transport', 'trolley', 'Trolley')}
                {radio('transport', 'bed', 'Bed')}
              </FbGroup>
            </FbInverseSubq>
            <FbGroup label="Additional information" subfield>
              {checkbox('hasDripStand', 'Has drip stand')}
              {checkbox('onOxygen', 'On oxygen')}
              {checkbox('requiresHoist', 'Requires hoist')}
              {checkbox('barrierNursing', 'Barrier nursing')}
            </FbGroup>
            <FbNotificationTypeGroup value={formState.notificationType || ''} onChange={value => setField('notificationType', value)} subfield />
          </>)}
          {radio('requestType', 'outpatient', 'Outpatient', <>
            <FbGroup label="Urgency" required subfield>
              {radio('urgency', 'routine', 'Routine')}
              {radio('urgency', 'urgent', 'Urgent', <FbTextArea label="Why is this request urgent?" value={formState.urgentReason || ''} onChange={value => setField('urgentReason', value)} required subfield />)}
              {radio('urgency', 'usc', 'USC')}
            </FbGroup>
            <FbGroup label="Appointment type" required subfield>
              {radio('appointmentType', 'walk-around', 'Walk around')}
              {radio('appointmentType', 'send-out-appointment', 'Send out appointment')}
            </FbGroup>
            {checkbox('ambulanceRequired', 'Ambulance required')}
            {checkbox('patientContactChecked', 'Patient contact information checked')}
          </>)}
        </FbGroup>
        <FbGridRow cols={4}>
          <FbGridCell><FbGroup label="Patient category" required>{radio('patientCategory', 'nhs', 'NHS')}{radio('patientCategory', 'clinical-trial', 'Clinical trial')}</FbGroup></FbGridCell>
          <FbGridCell><FbGroup label="Does the patient have capacity to consent to the test(s)?" required>{radio('capacity', 'yes', 'Yes')}{radio('capacity', 'no', 'No')}{radio('capacity', 'unknown', 'Unknown or not recorded')}</FbGroup></FbGridCell>
          <FbGridCell><FbGroup label="Defer test(s)?">{radio('deferTests', 'yes', 'Yes', <><FbQuestion label="Defer test(s) until" labelStyle={{ fontWeight: 300, fontSize: '1rem' }}><FbDateExact name="deferTestsUntil" value={formState.deferTestsUntil || ''} onChange={value => setField('deferTestsUntil', value)} /></FbQuestion><FbTextArea label="Reason for deferral" value={formState.deferReason || ''} onChange={value => setField('deferReason', value)} required subfield /></>)}{radio('deferTests', 'no', 'No')}</FbGroup></FbGridCell>
          <FbGridCell><FbQuestion label="Report required by"><FbDateExact name="reportRequiredBy" value={formState.reportRequiredBy || ''} onChange={value => setField('reportRequiredBy', value)}><FbTextArea label="Reason required by" value={formState.reportRequiredByReason || ''} onChange={value => setField('reportRequiredByReason', value)} required subfield /></FbDateExact></FbQuestion></FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="testsRequired" title="Tests required">
        <FbGroup>
          {checkbox('testAbpm', 'Ambulatory BP monitoring', <CardiologyIndications prefix="abpm" formState={formState} setField={setField} />)}
          {checkbox('testAecg', 'Ambulatory ECG', <CardiologyIndications prefix="aecg" formState={formState} setField={setField} />)}
          {checkbox('testEtt', 'Exercise tolerance test', <><FbBoxedWarning text="This test is NOT available in St Elsewhere UHB." /><CardiologyIndications prefix="ett" formState={formState} setField={setField} /></>)}
          {checkbox('testIlrDownload', 'Implantable loop recorder (ILR) download', <CardiologyIndications prefix="ilr" formState={formState} setField={setField} />)}
          {checkbox('testCiedCheck', 'Cardiac implanted electronic device (CIED) check', <CardiologyDeviceDetails formState={formState} setField={setField} />)}
          {checkbox('testTilt', 'Tilt test', <><FbBoxedWarning text="This test is only available in St Elsewhere UHB." /><CardiologyIndications prefix="tilt" formState={formState} setField={setField} /></>)}
          {checkbox('testTte', 'Transthoracic echocardiogram', <CardiologyIndications prefix="tte" formState={formState} setField={setField} />)}
        </FbGroup>
      </FbSection>
      <FbSection id="pastMedicalHistory" title="Past medical history">
        <FbGroup label="Does the patient have a cardiac implanted device?" required>
          {radio('cardiacDevice', 'No', 'No')}
          {radio('cardiacDevice', 'Cardiac resynchronisation therapy (CRT-P)', 'Cardiac resynchronisation therapy (CRT-P)')}
          {radio('cardiacDevice', 'Implantable cardioverter defibrillator (ICD)', 'Implantable cardioverter defibrillator (ICD)', checkbox('cardiacDeviceIcdCrtD', 'with cardiac resynchronisation therapy (CRT-D)'))}
          {radio('cardiacDevice', 'Implantable loop recorder (ILR)', 'Implantable loop recorder (ILR)')}
          {radio('cardiacDevice', 'Pacemaker', 'Pacemaker')}
          {radio('cardiacDevice', 'Unknown or not recorded', 'Unknown or not recorded')}
        </FbGroup>
        <FbGroup label="Has the patient undergone any previous cardiac surgery?" required>
          {radio('previousCardiacSurgery', 'yes', 'Yes', <PreviousCardiacSurgerySubqs formState={formState} setField={setField} />)}
          {radio('previousCardiacSurgery', 'no', 'No')}
          {radio('previousCardiacSurgery', 'unknown', 'Unknown or not recorded')}
        </FbGroup>
        <PastMedicalHistoryChecklist formState={formState} setField={setField} />
      </FbSection>
      <FbSection id="otherPatientInformation" title="Other patient information">
        <FbGridRow cols={3}>
          <FbGridCell><FbGroup label="Special requirements">{checkbox('confusionDementia', 'Confusion / dementia')}{checkbox('requiresInterpreter', 'Interpreter required')}{checkbox('hearingImpairment', 'Hearing impairment')}{checkbox('languageDifficulty', 'Language difficulty')}{checkbox('learningDifficulty', 'Learning difficulty')}{checkbox('visualImpairment', 'Visual impairment')}</FbGroup></FbGridCell>
          <FbGridCell><FbGroup label="Preferred language">{radio('preferredLanguage', 'english', 'English')}{radio('preferredLanguage', 'welsh', 'Welsh')}</FbGroup></FbGridCell>
          <FbGridCell><FbTextArea label="Clinical trial" value={formState.clinicalTrial || ''} onChange={value => setField('clinicalTrial', value)} /></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={2}>
          <FbGridCell><FbTextArea label="Other relevant information" value={formState.otherRelevantInformation || ''} onChange={value => setField('otherRelevantInformation', value)} fullWidth /></FbGridCell>
          <FbGridCell><FbTextArea label="Any infection control issues" value={formState.infectionControlIssues || ''} onChange={value => setField('infectionControlIssues', value)} fullWidth /></FbGridCell>
        </FbGridRow>
        <FbGroup label="Height and weight">
          <FbDateHeightWeightBMIRow dateRecorded={formState.bmiDateRecorded || ''} heightCm={formState.heightCm || ''} weightKg={formState.weightKg || ''} onDateRecordedChange={value => setField('bmiDateRecorded', value)} onHeightCmChange={value => setField('heightCm', value)} onWeightKgChange={value => setField('weightKg', value)} />
        </FbGroup>
      </FbSection>
      <FbSection id="requestor" title="Requestor">
        <FbGridRow cols={1}>
          <FbGridCell><FbMSISelector label="Requestor" name="requestor" value={formState.requestor || ''} coded={!!formState.requestorCoded} onChange={(value, coded) => { setField('requestor', value); setField('requestorCoded', coded); }} required /></FbGridCell>
          <FbGridCell><FbTextInput label="Contact details" value={formState.requestorContact || ''} onChange={value => setField('requestorContact', value)} required /></FbGridCell>
        </FbGridRow>
      </FbSection>
    </>
  );

  const rovFields = (
    <div style={{ padding: '0.4rem' }}>
      {sections.map((section) => (
        <FbSection key={section.id} id={section.id} title={section.name}>
          {section.id === 'to' && <FbGridRow cols={3}><FbGridCell><FbRoVField label="Health board" value={displayValue(formState.organisation, organisationLabels)} /></FbGridCell><FbGridCell><FbRoVField label="Hospital / Department" value={displayValue(formState.hospital, hospitalLabels)} /></FbGridCell><FbGridCell><FbRoVField label="For attention of" value={formState.forAttentionOf} /></FbGridCell></FbGridRow>}
          {section.id === 'from' && <FbGridRow cols={4}><FbGridCell><FbRoVField label="Health board" value={displayValue(formState.fromOrganisation, organisationLabels)} /></FbGridCell><FbGridCell><FbRoVField label="Hospital" value={displayValue(formState.fromHospital, hospitalLabels)} /></FbGridCell><FbGridCell><FbRoVField label="Speciality" value={displayValue(formState.fromSpeciality, specialityLabels)} /></FbGridCell><FbGridCell><FbRoVField label="Senior responsible clinician" value={formState.seniorResponsibleClinician} /></FbGridCell></FbGridRow>}
          {section.id === 'requestType' && <><FbRoVField label="Request type" value={displayValue(formState.requestType)} /><FbRoVField label="Patient location" value={formState.patientLocation} /><FbRoVField label="Transport" value={formState.transport} /><FbRoVField label="Urgency" value={formState.urgency} /><FbRoVField label="Capacity" value={formState.capacity} /><FbRoVField label="Report required by" value={formState.reportRequiredBy} /><FbRoVField label="Reason required by" value={formState.reportRequiredByReason} /></>}
          {section.id === 'testsRequired' && <FbRoVField label="Tests required" value={selectedTests(formState).join(', ')} preserveGridSpace={false} />}
          {section.id === 'pastMedicalHistory' && <><FbRoVField label="Cardiac implanted device" value={formState.cardiacDevice} /><FbRoVField label="Previous cardiac surgery" value={formState.previousCardiacSurgery} /><FbRoVField label="Other relevant history" value={formState.pmhOtherDetails} /></>}
          {section.id === 'otherPatientInformation' && <><FbRoVField label="Preferred language" value={formState.preferredLanguage} /><FbRoVField label="Clinical trial" value={formState.clinicalTrial} /><FbRoVField label="Other relevant information" value={formState.otherRelevantInformation} /><FbRoVField label="Any infection control issues" value={formState.infectionControlIssues} /><FbRoVField label="Height" value={formState.heightCm} units="cm" /><FbRoVField label="Weight" value={formState.weightKg} units="kg" /></>}
          {section.id === 'requestor' && <><FbRoVField label="Requestor" value={formState.requestor} coded={!!formState.requestorCoded} /><FbRoVField label="Contact details" value={formState.requestorContact} /></>}
        </FbSection>
      ))}
    </div>
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!finalChecked) {
      setShowDraftPopup(true);
      return;
    }
    requestSave('final');
  };

  return (
    <>
      {isReadOnlyView ? (
        <div className="bg-white h-screen max-h-screen overflow-hidden flex flex-col" style={{ height: '100vh', fontFamily: "'Roboto', sans-serif", fontWeight: 300, lineHeight: 1.1 }}>
          <FbRoVHeader title="Cardiology test request" patient={patient} formStatus={formStatus} highlySensitive={highlySensitive} />
          <div className="flex-1 overflow-y-auto">{rovFields}</div>
          <FbRoVFooter username={username} reachedByRoVButton={clickedRoVButton} onSwitchToEV={() => { setClickedRoVButton(false); setIsReadOnlyView(false); }} onBack={navigateBack} />
        </div>
      ) : (
        <FbLayout
          header={<FbHeader title="Cardiology test request" patient={patient} formStatus={formStatus} highlySensitive={highlySensitive} />}
          sections={sections}
          formState={formState}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onSubmit={handleSubmit}
          bottomControls={<BottomControlsRow openedFromPatientRecord={openedFromPatientRecord} onRoVClick={() => { setClickedRoVButton(true); setIsReadOnlyView(true); }} highlySensitive={highlySensitive} onHighlySensitiveChange={setHighlySensitive} finalChecked={finalChecked} onFinalCheckedChange={setFinalChecked} requiredFieldsComplete={areAllSectionsComplete(sections, formState)} username={username} onUsernameChange={setUsername} password={password} onPasswordChange={setPassword} passwordTimeoutRef={passwordTimeoutRef} formChanged={formChanged} isSaving={isSaving} onCancel={() => formChanged ? setShowCancelPopup(true) : navigateBack()} />}
        >
          {editForm}
        </FbLayout>
      )}
      {showDraftPopup && <DraftPopup onSaveDraft={() => { setShowDraftPopup(false); requestSave('draft'); }} onCancel={() => setShowDraftPopup(false)} />}
      {showPasswordPopup && <PasswordPopup onConfirm={confirmPassword} onCancel={cancelPassword} />}
      {showCancelPopup && <CancelPopup onDiscard={navigateBack} onReturnToForm={() => setShowCancelPopup(false)} />}
      {renderSaveFeedbackPopups()}
    </>
  );
}

function CardiologyIndications({ prefix, formState, setField }: { prefix: string; formState: FormState; setField: (field: string, value: any) => void }) {
  return (
    <FbGroup label="Indications" subfield>
      {['Symptoms', 'Surveillance', 'Medication review', 'Other'].map((label) => (
        <FbCheck key={label} name={`${prefix}${label}`} checked={!!formState[`${prefix}${label}`]} onChange={(event) => setField(`${prefix}${label}`, event.target.checked)} label={label}>
          {label === 'Other' && <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState[`${prefix}OtherDetails`] || ''} onChange={(value) => setField(`${prefix}OtherDetails`, value)} required subfield />}
        </FbCheck>
      ))}
    </FbGroup>
  );
}

function CardiologyDeviceDetails({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const implantCentreOptions = facilities
    .filter((facility) => ['ysbyty-abermawr', 'llanawel-general', 'tref-afon-hospital'].includes(facility.value))
    .map(({ value, label }) => ({ value, label }));
  return (
    <>
      <FbDropdown label="Implant centre" value={formState.implantCentre || ''} onChange={(value) => setField('implantCentre', value)} options={implantCentreOptions} placeholder="Select" subfield />
      <FbDropdown label="Manufacturer" value={formState.manufacturer || ''} onChange={(value) => setField('manufacturer', value)} options={['Abbott', 'Biotronik', 'Boston Scientific', 'Medtronic', 'MicroPort', 'Other']} placeholder="Select" subfield>
        <FbSubqForOption optionValue="Other">
          <FbTextInput label="Other manufacturer" value={formState.manufacturerOther || ''} onChange={(value) => setField('manufacturerOther', value)} required subfield />
        </FbSubqForOption>
      </FbDropdown>
      <CardiologyIndications prefix="cied" formState={formState} setField={setField} />
    </>
  );
}

function useCardiologyFieldHelpers(formState: FormState, setField: (field: string, value: any) => void) {
  const check = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => setField(field, event.target.checked);
  const checkbox = (field: string, label: string, children?: React.ReactNode) => (
    <FbCheck name={field} checked={!!formState[field]} onChange={check(field)} label={label}>{children}</FbCheck>
  );
  const radio = (field: string, value: string, label: string, children?: React.ReactNode) => (
    <FbRadio name={field} value={value} checked={formState[field] === value} onChange={() => setField(field, value)} label={label}>
      {children}
    </FbRadio>
  );
  const statusRadios = (field: string, children?: React.ReactNode) => (
    <FbGroup subfield>
      {radio(field, 'Confirmed', 'Confirmed')}
      {radio(field, 'Suspected', 'Suspected', children)}
    </FbGroup>
  );
  return { checkbox, radio, statusRadios };
}

function PreviousCardiacSurgerySubqs({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox, radio } = useCardiologyFieldHelpers(formState, setField);
  return (
    <FbGroup subfield>
      {checkbox('previousCabg', 'Coronary artery bypass graft')}
      {checkbox('previousValveSurgery', 'Valve surgery', (
        <FbGroup subfield>
          {checkbox('previousAorticValve', 'Aortic valve', (
            <FbGroup subfield>
              {radio('previousAorticValveProcedure', 'Replacement', 'Replacement', (
                <FbGroup subfield>
                  {radio('previousAorticValveReplacementType', 'Biological', 'Biological')}
                  {radio('previousAorticValveReplacementType', 'Mechanical', 'Mechanical')}
                  {radio('previousAorticValveReplacementType', 'TAVI', 'TAVI')}
                  {radio('previousAorticValveReplacementType', 'Unknown or not recorded', 'Unknown or not recorded')}
                </FbGroup>
              ))}
              {radio('previousAorticValveProcedure', 'Repair', 'Repair')}
            </FbGroup>
          ))}
          {checkbox('previousMitralValve', 'Mitral valve', (
            <FbGroup subfield>
              {radio('previousMitralValveProcedure', 'Replacement', 'Replacement', (
                <FbGroup subfield>
                  {radio('previousMitralValveReplacementType', 'Biological', 'Biological')}
                  {radio('previousMitralValveReplacementType', 'Mechanical', 'Mechanical')}
                  {radio('previousMitralValveReplacementType', 'Unknown or not recorded', 'Unknown or not recorded')}
                </FbGroup>
              ))}
              {radio('previousMitralValveProcedure', 'Repair', 'Repair')}
            </FbGroup>
          ))}
        </FbGroup>
      ))}
      {checkbox('previousOtherSurgery', 'Other', <FbTextInput label="Please specify" value={formState.previousOtherSurgeryDetails || ''} onChange={(value) => setField('previousOtherSurgeryDetails', value)} subfield />)}
    </FbGroup>
  );
}

function PastMedicalHistoryChecklist({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox, radio, statusRadios } = useCardiologyFieldHelpers(formState, setField);
  const familyStatus = (field: string) => statusRadios(field, checkbox(`${field}FamilyHistory`, 'Family history screening'));
  return (
    <FbGroup label="Tick all of the following that apply">
      {checkbox('pmhAortopathy', 'Aortopathy', statusRadios('pmhAortopathyStatus', <FbTextInput label="Diagnosis" value={formState.pmhAortopathyDiagnosis || ''} onChange={(value) => setField('pmhAortopathyDiagnosis', value)} subfield />))}
      {checkbox('pmhArrhythmia', 'Arrhythmia or palpitations', (
        <FbGroup subfield>
          {checkbox('pmhAtrialFibrillation', 'Atrial fibrillation', statusRadios('pmhAtrialFibrillationStatus'))}
          {checkbox('pmhBradyarrhythmia', 'Bradyarrhythmia', statusRadios('pmhBradyarrhythmiaStatus'))}
          {checkbox('pmhSvt', 'Supraventricular tachycardia', statusRadios('pmhSvtStatus'))}
          {checkbox('pmhVentricularTachycardia', 'Ventricular tachycardia', statusRadios('pmhVentricularTachycardiaStatus'))}
        </FbGroup>
      ))}
      {checkbox('pmhCardiomyopathy', 'Cardiomyopathy', (
        <FbGroup subfield>
          {checkbox('pmhArvc', 'Arrythmogenic right ventricular cardiomyopathy (ARVC)', familyStatus('pmhArvcStatus'))}
          {checkbox('pmhDilatedCardiomyopathy', 'Dilated cardiomyopathy', familyStatus('pmhDilatedCardiomyopathyStatus'))}
          {checkbox('pmhHypertrophicCardiomyopathy', 'Hypertrophic cardiomyopathy', familyStatus('pmhHypertrophicCardiomyopathyStatus'))}
          {checkbox('pmhOtherCardiomyopathy', 'Other', (
            <FbGroup subfield>
              <FbTextInput label="Diagnosis" value={formState.pmhOtherCardiomyopathyDiagnosis || ''} onChange={(value) => setField('pmhOtherCardiomyopathyDiagnosis', value)} subfield />
              {familyStatus('pmhOtherCardiomyopathyStatus')}
            </FbGroup>
          ))}
        </FbGroup>
      ))}
      {checkbox('pmhChemotherapy', 'Chemotherapy')}
      {checkbox('pmhCongenitalHeartDisease', 'Congenital heart disease', (
        <FbGroup subfield>
          {radio('pmhCongenitalHeartDiseaseStatus', 'Confirmed', 'Confirmed')}
          {radio('pmhCongenitalHeartDiseaseStatus', 'Suspected', 'Suspected')}
          {checkbox('pmhCongenitalHeartDiseaseOperated', 'Operated')}
          <FbTextInput label="Diagnosis" value={formState.pmhCongenitalHeartDiseaseDiagnosis || ''} onChange={(value) => setField('pmhCongenitalHeartDiseaseDiagnosis', value)} subfield />
        </FbGroup>
      ))}
      {checkbox('pmhCoronaryArteryDisease', 'Coronary artery disease', (
        <FbGroup subfield>
          {checkbox('pmhMyocardialInfarction', 'Myocardial infarction', statusRadios('pmhMyocardialInfarctionStatus'))}
          {checkbox('pmhAcuteCoronarySyndrome', 'Acute coronary syndrome', statusRadios('pmhAcuteCoronarySyndromeStatus'))}
          {checkbox('pmhExerciseInducedAngina', 'Exercise induced angina', statusRadios('pmhExerciseInducedAnginaStatus'))}
        </FbGroup>
      ))}
      {checkbox('pmhEndocarditis', 'Endocarditis', statusRadios('pmhEndocarditisStatus'))}
      {checkbox('pmhHeartFailure', 'Heart failure or breathlessness', (
        <FbGroup subfield>
          {radio('pmhHeartFailureStatus', 'Confirmed', 'Confirmed')}
          {radio('pmhHeartFailureStatus', 'Suspected', 'Suspected', <FbTextInput label="BNP" value={formState.pmhHeartFailureBnp || ''} onChange={(value) => setField('pmhHeartFailureBnp', value)} subfield />)}
          {checkbox('pmhHeartFailureFamilyHistory', 'Family history')}
        </FbGroup>
      ))}
      {checkbox('pmhInheritedCardiacConditions', 'Inherited cardiac conditions', (
        <FbGroup subfield>
          {checkbox('pmhLongQt', 'Long QT syndrome')}
          {checkbox('pmhBrugada', 'Brugada')}
          {checkbox('pmhCpvt', 'Catecholaminergic polymorphic condition (CPVT)')}
        </FbGroup>
      ))}
      {checkbox('pmhStroke', 'Stroke or embolic event', statusRadios('pmhStrokeStatus'))}
      {checkbox('pmhPericardialDisease', 'Pericardial disease', statusRadios('pmhPericardialDiseaseStatus'))}
      {checkbox('pmhPulmonaryEmbolism', 'Pulmonary embolism', statusRadios('pmhPulmonaryEmbolismStatus'))}
      {checkbox('pmhTloc', 'Transient loss of consciousness or syncope')}
      {checkbox('pmhValveDisease', 'Valve disease', (
        <FbGroup subfield>
          {checkbox('pmhAorticRegurgitation', 'Aortic regurgitation', statusRadios('pmhAorticRegurgitationStatus'))}
          {checkbox('pmhAorticStenosis', 'Aortic stenosis', statusRadios('pmhAorticStenosisStatus'))}
          {checkbox('pmhMitralRegurgitation', 'Mitral regurgitation', statusRadios('pmhMitralRegurgitationStatus'))}
          {checkbox('pmhMitralStenosis', 'Mitral stenosis', statusRadios('pmhMitralStenosisStatus'))}
          {checkbox('pmhPulmonaryValveDisease', 'Pulmonary valve disease', statusRadios('pmhPulmonaryValveDiseaseStatus'))}
          {checkbox('pmhTricuspidValveDisease', 'Tricuspid valve disease', statusRadios('pmhTricuspidValveDiseaseStatus'))}
        </FbGroup>
      ))}
      {checkbox('pmhOther', 'Other relevant history', <FbTextArea value={formState.pmhOtherDetails || ''} onChange={(value) => setField('pmhOtherDetails', value)} required subfield />)}
    </FbGroup>
  );
}
