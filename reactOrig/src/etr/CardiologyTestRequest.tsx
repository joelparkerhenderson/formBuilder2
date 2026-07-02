import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from '../components/fbAddressograph';
import { fbBottomControlsRow as BottomControlsRow } from '../components/fbBottomControlsRow';
import { fbBoxedWarning as FbBoxedWarning } from '../components/fbBoxedMessage';
import { fbBloodPressure as FbBloodPressure } from '../components/fbBloodPressure';
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
import { fbNumberInput as FbNumberInput } from '../components/fbNumberInput';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbRadio as FbRadio } from '../components/fbRadio';
import { fbReadOnly as FbReadOnly } from '../components/fbReadOnly';
import { fbRoVFooter as FbRoVFooter, fbRoVHeader as FbRoVHeader } from '../components/fbRoVShell';
import { fbSCTDiagnosis as FbSCTDiagnosis } from '../components/fbSCTDiagnosis';
import { fbSection as FbSection } from '../components/fbSection';
import { fbSmartDropdown as FbSmartDropdown } from '../components/fbSmartDropdown';
import { fbSubqForOption as FbSubqForOption } from '../components/fbSubqForOption';
import { fbTextArea as FbTextArea } from '../components/fbTextArea';
import { fbTextInput as FbTextInput } from '../components/fbTextInput';
import { fbTime as FbTime } from '../components/fbTime';
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
  hospital_number: string;
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
  { id: 'from', name: 'From', requiredFields: ['fromOrganisation', 'fromSpeciality', 'fromHospital', 'seniorResponsibleClinician'] },
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
  notificationType: 'inpatient-ed-non-specialist',
  patientCategory: 'nhs',
  implantCentre: 'Unknown or not recorded',
  manufacturer: 'Unknown or not recorded',
  ettStopMedication: 'No',
  ettGtnContraindications: 'Unknown or not recorded',
  tiltSwallowingReflex: 'Unknown or not recorded',
  tiltCarotidSinusMassage: 'Unknown or not recorded',
  tiltGtnContraindications: 'Unknown or not recorded',
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
          setFinalChecked(saved.form_status === 'final');
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
  const setMsiField = (field: string, value: string, coded: boolean, nadexId?: string) => setFormState((prev) => ({
    ...prev,
    [field]: value,
    [`${field}Coded`]: coded,
    [`${field}_coded`]: coded,
    [`${field}_text`]: value,
    [`${field}_NADEXId`]: nadexId || '',
  }));
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
          <FbGridCell><FbMSISelector label="Senior responsible clinician" name="seniorResponsibleClinician" value={formState.seniorResponsibleClinician || ''} coded={!!formState.seniorResponsibleClinicianCoded} onChange={(value, coded, nadexId) => setMsiField('seniorResponsibleClinician', value, coded, nadexId)} required /></FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="requestType" title="Request type">
        <FbGroup label="Request type" required>
          {radio('requestType', 'inpatient-ed', 'Inpatient / ED', <>
            <FbSmartDropdown label="Patient location" value={formState.patientLocation || ''} onChange={value => setField('patientLocation', value)} options={patientLocations} required subfield />
            {checkbox('uscPathway', 'USC pathway', <FbDropdown label="Cancer pathway" value={formState.inpatientCancerPathway || ''} onChange={value => setField('inpatientCancerPathway', value)} options={['', 'Suspected cancer', 'Confirmed cancer', 'Cancer follow-up']} subfield />)}
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
              {radio('urgency', 'usc', 'USC', <FbDropdown label="Cancer pathway" value={formState.outpatientCancerPathway || ''} onChange={value => setField('outpatientCancerPathway', value)} options={['', 'Suspected cancer', 'Confirmed cancer', 'Cancer follow-up']} subfield />)}
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
          <FbGridCell><FbGroup label="Patient category" required>{radio('patientCategory', 'nhs', 'NHS')}{radio('patientCategory', 'fee-paying-nhs', 'Fee-paying NHS (cat II)')}{radio('patientCategory', 'private', 'Private (cat III)')}{radio('patientCategory', 'clinical-trial', 'Clinical trial', <FbTextArea label="Trial name" value={formState.trialName || ''} onChange={value => setField('trialName', value)} required subfield />)}</FbGroup></FbGridCell>
          <FbGridCell><FbGroup label="Does the patient have capacity to consent to the test(s)?" required>{radio('capacity', 'yes', 'Yes')}{radio('capacity', 'no', 'No')}{radio('capacity', 'unknown', 'Unknown or not recorded')}</FbGroup></FbGridCell>
          <FbGridCell><FbGroup label="Defer test(s)?">{radio('deferTests', 'yes', 'Yes', <><FbQuestion label="Defer test(s) until" labelStyle={{ fontWeight: 300, fontSize: '1rem' }}><FbDateExact name="deferTestsUntil" value={formState.deferTestsUntil || ''} onChange={value => setField('deferTestsUntil', value)} /></FbQuestion><FbTextArea label="Reason for deferral" value={formState.deferReason || ''} onChange={value => setField('deferReason', value)} required subfield /></>)}{radio('deferTests', 'no', 'No')}</FbGroup></FbGridCell>
          <FbGridCell><FbQuestion label="Report required by"><FbDateExact name="reportRequiredBy" value={formState.reportRequiredBy || ''} onChange={value => setField('reportRequiredBy', value)}><FbTextArea label="Reason required by" value={formState.reportRequiredByReason || ''} onChange={value => setField('reportRequiredByReason', value)} required subfield /></FbDateExact></FbQuestion></FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="testsRequired" title="Tests required">
        <FbGroup>
          {checkbox('testAbpm', 'Ambulatory BP monitoring', <AbpmIndications formState={formState} setField={setField} />)}
          {checkbox('testAecg', 'Ambulatory ECG', <AecgIndications formState={formState} setField={setField} />)}
          {checkbox('testEtt', 'Exercise tolerance test', <><FbBoxedWarning text="This test is NOT available in St Elsewhere UHB." /><EttIndications formState={formState} setField={setField} /></>)}
          {checkbox('testIlrDownload', 'Implantable loop recorder (ILR) download', <IlrIndications formState={formState} setField={setField} />)}
          {checkbox('testCiedCheck', 'Cardiac implanted electronic device (CIED) check', <CardiologyDeviceDetails formState={formState} setField={setField} />)}
          {checkbox('testTilt', 'Tilt test', <><FbBoxedWarning text="This test is only available in St Elsewhere UHB." /><TiltIndications formState={formState} setField={setField} /></>)}
          {checkbox('testTte', 'Transthoracic echocardiogram', <TteIndications formState={formState} setField={setField} />)}
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
          <FbGridCell><FbMSISelector label="Requestor" name="requestor" value={formState.requestor || ''} coded={!!formState.requestorCoded} onChange={(value, coded, nadexId) => setMsiField('requestor', value, coded, nadexId)} required /></FbGridCell>
          <FbGridCell><FbTextInput label="Contact details" value={formState.requestorContact || ''} onChange={value => setField('requestorContact', value)} required /></FbGridCell>
        </FbGridRow>
      </FbSection>
    </>
  );

  const rovFields = (
    <div style={{ padding: '0.4rem' }}>
      {sections.map((section) => (
        <FbSection key={section.id} id={section.id} title={section.name}>
          {section.id === 'to' && <FbGridRow cols={3}><FbGridCell><FbReadOnly label="Health board" value={displayValue(formState.organisation, organisationLabels)} /></FbGridCell><FbGridCell><FbReadOnly label="Hospital / Department" value={displayValue(formState.hospital, hospitalLabels)} /></FbGridCell><FbGridCell><FbReadOnly label="For attention of" value={formState.forAttentionOf} /></FbGridCell></FbGridRow>}
          {section.id === 'from' && <FbGridRow cols={4}><FbGridCell><FbReadOnly label="Health board" value={displayValue(formState.fromOrganisation, organisationLabels)} /></FbGridCell><FbGridCell><FbReadOnly label="Hospital" value={displayValue(formState.fromHospital, hospitalLabels)} /></FbGridCell><FbGridCell><FbReadOnly label="Speciality" value={displayValue(formState.fromSpeciality, specialityLabels)} /></FbGridCell><FbGridCell><FbReadOnly label="Senior responsible clinician" value={formState.seniorResponsibleClinician} /></FbGridCell></FbGridRow>}
          {section.id === 'requestType' && <><FbReadOnly label="Request type" value={displayValue(formState.requestType)} /><FbReadOnly label="Patient location" value={formState.patientLocation} /><FbReadOnly label="Transport" value={formState.transport} /><FbReadOnly label="Urgency" value={formState.urgency} /><FbReadOnly label="Capacity" value={formState.capacity} /><FbReadOnly label="Report required by" value={formState.reportRequiredBy} /><FbReadOnly label="Reason required by" value={formState.reportRequiredByReason} /></>}
          {section.id === 'testsRequired' && <FbReadOnly label="Tests required" value={selectedTests(formState).join(', ')} preserveGridSpace={false} />}
          {section.id === 'pastMedicalHistory' && <><FbReadOnly label="Cardiac implanted device" value={formState.cardiacDevice} /><FbReadOnly label="Previous cardiac surgery" value={formState.previousCardiacSurgery} /><FbReadOnly label="Other relevant history" value={formState.pmhOtherDetails} /></>}
          {section.id === 'otherPatientInformation' && <><FbReadOnly label="Preferred language" value={formState.preferredLanguage} /><FbReadOnly label="Clinical trial" value={formState.clinicalTrial} /><FbReadOnly label="Other relevant information" value={formState.otherRelevantInformation} /><FbReadOnly label="Any infection control issues" value={formState.infectionControlIssues} /><FbReadOnly label="Height" value={formState.heightCm} units="cm" /><FbReadOnly label="Weight" value={formState.weightKg} units="kg" /></>}
          {section.id === 'requestor' && <><FbReadOnly label="Requestor" value={formState.requestor} coded={!!formState.requestorCoded} /><FbReadOnly label="Contact details" value={formState.requestorContact} /></>}
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
          <FbRoVFooter username={username} formStatus={formStatus} reachedByRoVButton={clickedRoVButton} onSwitchToEV={() => { setClickedRoVButton(false); setIsReadOnlyView(false); }} onBack={navigateBack} hideModeControls={openedFromPatientRecord} />
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

function DateTimeOfLastEpisode({ prefix, formState, setField }: { prefix: string; formState: FormState; setField: (field: string, value: any) => void }) {
  return (
    <FbGroup label="Date and time of last episode (if known)" subfield>
      <FbGridRow cols={4}>
        <FbGridCell><FbDateExact name={`${prefix}Date`} value={formState[`${prefix}Date`] || ''} onChange={(value) => setField(`${prefix}Date`, value)} /></FbGridCell>
        <FbGridCell><FbTime name={`${prefix}Time`} value={formState[`${prefix}Time`] || ''} onChange={(value) => setField(`${prefix}Time`, value)} /></FbGridCell>
        <FbGridCell><div aria-hidden="true" /></FbGridCell>
        <FbGridCell><div aria-hidden="true" /></FbGridCell>
      </FbGridRow>
    </FbGroup>
  );
}

function AbpmIndications({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox } = useCardiologyFieldHelpers(formState, setField);
  const bp = (prefix: string) => (
    <FbBloodPressure
      systolic={formState[`${prefix}Systolic`] || ''}
      diastolic={formState[`${prefix}Diastolic`] || ''}
      onChange={({ systolic, diastolic }) => {
        setField(`${prefix}Systolic`, systolic);
        setField(`${prefix}Diastolic`, diastolic);
      }}
      subfield
    />
  );
  return (
    <FbGroup label="Indication" required subfield>
      {checkbox('abpmBpControl', 'Blood pressure (BP) control', (
        <FbGroup subfield>
          {checkbox('abpmBpLying', 'Lying', bp('abpmLyingBp'))}
          {checkbox('abpmBpSitting', 'Sitting', bp('abpmSittingBp'))}
          {checkbox('abpmBpStanding', 'Standing', bp('abpmStandingBp'))}
        </FbGroup>
      ))}
      {checkbox('abpmHypertension', 'Hypertension', <FbBoxedWarning text="Patients with excessive palpitations and hypertension may find this test uncomfortable or intolerable" />)}
      {checkbox('abpmHypotension', 'Hypotension')}
      {checkbox('abpmOther', 'Other', <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.abpmOtherDetails || ''} onChange={(value) => setField('abpmOtherDetails', value)} required subfield />)}
    </FbGroup>
  );
}

function AecgIndications({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox, radio } = useCardiologyFieldHelpers(formState, setField);
  const frequency = (field: string, required = true) => (
    <FbGroup label="Frequency of symptoms" required={required} subfield>
      {radio(field, 'Daily', 'Daily')}
      {radio(field, 'Weekly', 'Weekly')}
      {radio(field, 'Monthly', 'Monthly')}
    </FbGroup>
  );
  return (
    <FbGroup label="Indication" required subfield>
      {checkbox('aecgQtc', 'Assessment of QTc')}
      {checkbox('aecgAfRate', 'Atrial fibrillation (AF) rate', <FbGroup subfield>{radio('aecgAfRatePurpose', 'Burden', 'Burden')}{radio('aecgAfRatePurpose', 'Control', 'Control')}</FbGroup>)}
      {checkbox('aecgBradyarrhythmia', 'Bradyarrhythmia')}
      {checkbox('aecgEctopicBurden', 'Ectopic burden')}
      {checkbox('aecgIrregularRhythm', 'Irregular rhythm', frequency('aecgIrregularRhythmFrequency', false))}
      {checkbox('aecgPalpitations', 'Palpitations', frequency('aecgPalpitationsFrequency'))}
      {checkbox('aecgPreSyncope', 'Pre-syncope', frequency('aecgPreSyncopeFrequency'))}
      {checkbox('aecgStAnalysis', 'ST analysis')}
      {checkbox('aecgSyncope', 'Syncope', frequency('aecgSyncopeFrequency'))}
      {checkbox('aecgTachyarrhythmia', 'Tachyarrhythmia')}
      {checkbox('aecgClinicianRequestedMonitor', 'Clinician requested monitor (Cardiology use only)', (
        <FbGroup subfield>
          {radio('aecgMonitorDuration', '24-hour', '24-hour')}
          {radio('aecgMonitorDuration', 'Prolonged heart rhythm monitor', 'Prolonged heart rhythm monitor', (
            <FbGroup subfield>
              {radio('aecgProlongedMonitorDuration', 'Weekly', 'Weekly')}
              {radio('aecgProlongedMonitorDuration', 'Fortnightly', 'Fortnightly')}
              {radio('aecgProlongedMonitorDuration', 'Monthly', 'Monthly')}
            </FbGroup>
          ))}
        </FbGroup>
      ))}
      {checkbox('aecgOther', 'Other', <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.aecgOtherDetails || ''} onChange={(value) => setField('aecgOtherDetails', value)} required subfield />)}
    </FbGroup>
  );
}

function EttIndications({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox, radio } = useCardiologyFieldHelpers(formState, setField);
  return (
    <>
      <FbGroup label="Exercise type protocol" required subfield>
        {radio('ettProtocol', 'Ergometer', 'Ergometer')}
        {radio('ettProtocol', 'Treadmill', 'Treadmill', (
          <FbGroup subfield>
            {radio('ettTreadmillProtocol', 'Bruce protocol', 'Bruce protocol')}
            {radio('ettTreadmillProtocol', 'Modified Bruce', 'Modified Bruce')}
            {radio('ettTreadmillProtocol', 'Modified Naughton', 'Modified Naughton')}
            {radio('ettTreadmillProtocol', 'Naughton', 'Naughton')}
            {radio('ettTreadmillProtocol', 'Weber', 'Weber')}
          </FbGroup>
        ))}
      </FbGroup>
      <FbGroup label="Reason for test" required subfield>
        {checkbox('ettBpResponse', 'Blood pressure (BP) response')}
        {checkbox('ettChestDiscomfort', 'Chest discomfort on exertion')}
        {checkbox('ettChronotropicIncompetence', 'Chronotropic incompetence')}
        {checkbox('ettInducibleIschaemia', 'Evaluation of inducible ischaemia')}
        {checkbox('ettExerciseInducedArrhythmia', 'Exercised induced arrhythmia', <FbGroup subfield>{checkbox('ettAtrial', 'Atrial')}{checkbox('ettEctopy', 'Ectopy')}{checkbox('ettVentricular', 'Ventricular')}</FbGroup>)}
        {checkbox('ettExerciseCapacity', 'Exercise capacity')}
        {checkbox('ettInheritedCardiacConditions', 'Inherited cardiac conditions', <FbGroup subfield>{checkbox('ettBrugada', 'Brugada')}{checkbox('ettCpvt', 'Catecholaminergic polymorphic condition (CPVT)')}{checkbox('ettHcm', 'Hypertrophic cardiomyopathy (HCM)')}{checkbox('ettLongQt', 'Long QT syndrome')}</FbGroup>)}
        {checkbox('ettOther', 'Other', <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.ettOtherDetails || ''} onChange={(value) => setField('ettOtherDetails', value)} required subfield />)}
      </FbGroup>
      <FbGroup label="Does the patient need to stop any medication?" required subfield>
        {radio('ettStopMedication', 'Yes', 'Yes', (
          <>
            <FbTextArea label="What medication?" value={formState.ettMedicationToStop || ''} onChange={(value) => setField('ettMedicationToStop', value)} subfield />
            <FbGroup label="How long should it be stopped for?" subfield>
              {radio('ettMedicationStopDuration', '24 hours', '24 hours')}
              {radio('ettMedicationStopDuration', '48 hours', '48 hours')}
              {radio('ettMedicationStopDuration', 'Other', 'Other', <FbTextInput value={formState.ettMedicationStopDurationOther || ''} onChange={(value) => setField('ettMedicationStopDurationOther', value)} subfield />)}
            </FbGroup>
          </>
        ))}
        {radio('ettStopMedication', 'No', 'No')}
      </FbGroup>
      <FbGroup label="Does the patient have any of the contraindications for using glyceryl trinitrate (GTN) spray?" subfield>
        {radio('ettGtnContraindications', 'Yes', 'Yes')}
        {radio('ettGtnContraindications', 'No', 'No')}
        {radio('ettGtnContraindications', 'Unknown or not recorded', 'Unknown or not recorded')}
      </FbGroup>
    </>
  );
}

function IlrIndications({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox } = useCardiologyFieldHelpers(formState, setField);
  return (
    <FbGroup label="Reason for test" required subfield>
      {checkbox('ilrClinicalSymptoms', 'Clinical symptoms', <FbTextArea value={formState.ilrClinicalSymptomsDetails || ''} onChange={(value) => setField('ilrClinicalSymptomsDetails', value)} subfield />)}
      {checkbox('ilrPalpitations', 'Palpitations', <DateTimeOfLastEpisode prefix="ilrPalpitationsLastEpisode" formState={formState} setField={setField} />)}
      {checkbox('ilrPreMri', 'Pre-MRI')}
      {checkbox('ilrPreSyncope', 'Pre-syncope', <DateTimeOfLastEpisode prefix="ilrPreSyncopeLastEpisode" formState={formState} setField={setField} />)}
      {checkbox('ilrSyncope', 'Syncope', <DateTimeOfLastEpisode prefix="ilrSyncopeLastEpisode" formState={formState} setField={setField} />)}
    </FbGroup>
  );
}

function CardiologyDeviceDetails({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox } = useCardiologyFieldHelpers(formState, setField);
  const implantCentreOptions = [
    'AB - Cardiac device clinic Neville Hall',
    'AB - Cardiac device clinic Royal Gwent',
    'BCU - Cardiac device clinic Ysbyty Glan Clwyd',
    'BCU - Cardiac device clinic Ysbyty Gwynedd',
    'BCU - Cardiac device clinic Ysbyty Wrexham Maelor',
    'CAV - Cardiac device clinic University Hospital of Wales',
    'CTM - Cardiac device clinic Prince Charles',
    'CTM - Cardiac device clinic Royal Glamorgan',
    'HDD - Cardiac device clinic Bronglais',
    'HDD - Cardiac device clinic Glangwili',
    'SB - Cardiac device clinic Morriston',
    'Other',
    'Unknown or not recorded',
  ];
  const manufacturerOptions = ['Abbott', 'Biotronik', 'Boston Scientific', 'Medtronic', 'Microport', 'Sorin', 'St. Jude Medical', 'Vitatron', 'Other', 'Unknown or not recorded'];
  return (
    <>
      <FbDropdown label="Follow-up implant centre" value={formState.implantCentre || 'Unknown or not recorded'} onChange={(value) => setField('implantCentre', value)} options={implantCentreOptions} placeholder="Select" subfield>
        <FbSubqForOption optionValue="Other">
          <FbTextArea label="Please specify" value={formState.implantCentreOther || ''} onChange={(value) => setField('implantCentreOther', value)} required subfield />
        </FbSubqForOption>
      </FbDropdown>
      <FbDropdown label="Manufacturer" value={formState.manufacturer || 'Unknown or not recorded'} onChange={(value) => setField('manufacturer', value)} options={manufacturerOptions} placeholder="Select" subfield>
        <FbSubqForOption optionValue="Other">
          <FbTextArea label="Please specify" value={formState.manufacturerOther || ''} onChange={(value) => setField('manufacturerOther', value)} required subfield />
        </FbSubqForOption>
      </FbDropdown>
      <FbGroup label="Reason for test" required subfield>
        {checkbox('ciedAfBurden', 'Atrial fibrillation (AF) burden')}
        {checkbox('ciedPacemakerMalfunction', 'Evidence of pacemaker malfunction (ECG recording)', <FbTextArea value={formState.ciedPacemakerMalfunctionDetails || ''} onChange={(value) => setField('ciedPacemakerMalfunctionDetails', value)} subfield />)}
        {checkbox('ciedPalpitations', 'Palpitations', <DateTimeOfLastEpisode prefix="ciedPalpitationsLastEpisode" formState={formState} setField={setField} />)}
        {checkbox('ciedIcdDeactivation', 'Patient end of life ICD deactivation', <FbBoxedWarning text="You MUST print and complete the departmental policy deactivation form, receive approval from a cardiologist and discuss directly with the department to arrange." />)}
        {checkbox('ciedPostChemotherapy', 'Post chemotherapy', <FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPostChemotherapyContact || ''} onChange={(value) => setField('ciedPostChemotherapyContact', value)} subfield />)}
        {checkbox('ciedPrePostMri', 'Pre or post MRI', <FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPrePostMriContact || ''} onChange={(value) => setField('ciedPrePostMriContact', value)} subfield />)}
        {checkbox('ciedPrePostSurgery', 'Pre or post surgery', <FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPrePostSurgeryContact || ''} onChange={(value) => setField('ciedPrePostSurgeryContact', value)} subfield />)}
        {checkbox('ciedPrePostRadiotherapy', 'Pre or post radiotherapy', <FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPrePostRadiotherapyContact || ''} onChange={(value) => setField('ciedPrePostRadiotherapyContact', value)} subfield />)}
        {checkbox('ciedPreSyncope', 'Pre-syncope', <><DateTimeOfLastEpisode prefix="ciedPreSyncopeLastEpisode" formState={formState} setField={setField} /><FbBoxedWarning text="Not appropriate if there has been a pacemaker check within six months" /></>)}
        {checkbox('ciedShockTherapyDelivered', 'Shock therapy delivered', <FbGroup label="Date and time" subfield><FbGridRow cols={4}><FbGridCell><FbDateExact name="ciedShockDate" value={formState.ciedShockDate || ''} onChange={(value) => setField('ciedShockDate', value)} /></FbGridCell><FbGridCell><FbTime name="ciedShockTime" value={formState.ciedShockTime || ''} onChange={(value) => setField('ciedShockTime', value)} /></FbGridCell><FbGridCell><div aria-hidden="true" /></FbGridCell><FbGridCell><div aria-hidden="true" /></FbGridCell></FbGridRow></FbGroup>)}
        {checkbox('ciedSymptomReview', 'Symptom review')}
        {checkbox('ciedSyncope', 'Syncope', <DateTimeOfLastEpisode prefix="ciedSyncopeLastEpisode" formState={formState} setField={setField} />)}
        {checkbox('ciedBiventricularPacing', '% of biventricular pacing')}
        {checkbox('ciedOther', 'Other', <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.ciedOtherDetails || ''} onChange={(value) => setField('ciedOtherDetails', value)} subfield />)}
      </FbGroup>
    </>
  );
}

function TiltIndications({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox, radio } = useCardiologyFieldHelpers(formState, setField);
  return (
    <>
      <FbGroup label="Reason for test" required subfield>
        {checkbox('tiltPots', 'Postural orthostatic tachycardia syndrome (PoTS)')}
        {checkbox('tiltSyncope', 'Syncope')}
        {checkbox('tiltBpResponse', 'Blood pressure (BP) response')}
        {checkbox('tiltOther', 'Other', <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.tiltOtherDetails || ''} onChange={(value) => setField('tiltOtherDetails', value)} required subfield />)}
      </FbGroup>
      {checkbox('tiltCanStand45Minutes', 'The patient can stand for 45 minutes')}
      <FbGroup label="Is swallowing reflex required?" subfield>
        {radio('tiltSwallowingReflex', 'Yes', 'Yes')}
        {radio('tiltSwallowingReflex', 'No', 'No')}
        {radio('tiltSwallowingReflex', 'Unknown or not recorded', 'Unknown or not recorded')}
      </FbGroup>
      <FbGroup label="Is carotid sinus massage required?" subfield>
        {radio('tiltCarotidSinusMassage', 'Yes', 'Yes')}
        {radio('tiltCarotidSinusMassage', 'No', 'No')}
        {radio('tiltCarotidSinusMassage', 'Unknown or not recorded', 'Unknown or not recorded')}
      </FbGroup>
      <FbGroup label="Are there any contraindications to GTN spray?" subfield>
        {radio('tiltGtnContraindications', 'Yes', 'Yes')}
        {radio('tiltGtnContraindications', 'No', 'No')}
        {radio('tiltGtnContraindications', 'Unknown or not recorded', 'Unknown or not recorded')}
      </FbGroup>
    </>
  );
}

function TteIndications({ formState, setField }: { formState: FormState; setField: (field: string, value: any) => void }) {
  const { checkbox, radio } = useCardiologyFieldHelpers(formState, setField);
  return (
    <>
      <FbGroup subfield>
        {radio('tteStudyKind', 'New study', 'New study')}
        {radio('tteStudyKind', 'Re-assessment', 'Re-assessment')}
      </FbGroup>
      <FbGroup subfield>
        {radio('tteStudyScope', 'Full study', 'Full study')}
        {radio('tteStudyScope', 'Focussed study', 'Focussed study', (
          <FbGroup subfield>
            {checkbox('tteLeftVentricle', 'Left ventricle', checkbox('tteLeftVentricleDesynchrony', 'Desynchrony'))}
            {checkbox('tteRightVentricle', 'Right ventricle')}
            {checkbox('tteValveDisease', 'Valve disease')}
            {checkbox('ttePulmonaryArteryPressure', 'Pulmonary artery pressure')}
            {checkbox('ttePericardium', 'Pericardium')}
            {checkbox('tteStructuralHeartDisease', 'Structural heart disease')}
          </FbGroup>
        ))}
      </FbGroup>
      <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.tteClinicalQuestion || ''} onChange={(value) => setField('tteClinicalQuestion', value)} required subfield />
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
  const familyStatus = (field: string) => (
    <FbGroup subfield>
      {radio(field, 'Confirmed', 'Confirmed')}
      {radio(field, 'Suspected', 'Suspected')}
      {checkbox(`${field}FamilyHistory`, 'Family history screening')}
    </FbGroup>
  );
  return (
    <FbGroup label="Tick all of the following that apply">
      {checkbox('pmhAortopathy', 'Aortopathy', (
        <FbGroup subfield>
          {radio('pmhAortopathyStatus', 'Confirmed', 'Confirmed')}
          {radio('pmhAortopathyStatus', 'Suspected', 'Suspected')}
          <FbSCTDiagnosis label="Diagnosis" name="pmhAortopathyDiagnosis" value={formState.pmhAortopathyDiagnosis || ''} coded={!!formState.pmhAortopathyDiagnosisCoded} onChange={(value, coded) => { setField('pmhAortopathyDiagnosis', value); setField('pmhAortopathyDiagnosisCoded', coded); }} subfield />
        </FbGroup>
      ))}
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
              <FbSCTDiagnosis label="Diagnosis" name="pmhOtherCardiomyopathyDiagnosis" value={formState.pmhOtherCardiomyopathyDiagnosis || ''} coded={!!formState.pmhOtherCardiomyopathyDiagnosisCoded} onChange={(value, coded) => { setField('pmhOtherCardiomyopathyDiagnosis', value); setField('pmhOtherCardiomyopathyDiagnosisCoded', coded); }} subfield />
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
          <FbSCTDiagnosis label="Diagnosis" name="pmhCongenitalHeartDiseaseDiagnosis" value={formState.pmhCongenitalHeartDiseaseDiagnosis || ''} coded={!!formState.pmhCongenitalHeartDiseaseDiagnosisCoded} onChange={(value, coded) => { setField('pmhCongenitalHeartDiseaseDiagnosis', value); setField('pmhCongenitalHeartDiseaseDiagnosisCoded', coded); }} subfield />
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
          {radio('pmhHeartFailureStatus', 'Suspected', 'Suspected', <FbNumberInput label="BNP" units="pg/ml" value={formState.pmhHeartFailureBnp || ''} onChange={(value) => setField('pmhHeartFailureBnp', value)} subfield />)}
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
