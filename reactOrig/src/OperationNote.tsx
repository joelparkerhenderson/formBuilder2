import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { specialities } from './data/specialities';
import { facilities, healthBoards } from './data/clinicalDestinations';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbAuthControls as AuthControls } from './components/fbAuthControls';
import { fbDateExact as ExactDate } from './components/fbDateExact';
import { fbDatePartial as PartialDate } from './components/fbDatePartial';
import { fbSCTProcedure as FbSCTProcedure } from './components/fbSCTProcedure';
import { fbSCTDiagnosis as SCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbMSISelector as MSISelector } from './components/fbMSISelector';
import { fbModalDraft as DraftPopup } from './components/fbModalDraft';
import { fbModalPassword as PasswordPopup } from './components/fbModalPassword';
import { fbModalCancel as CancelPopup } from './components/fbModalCancel';
import { fbFinalControl as FinalControl } from './components/fbFinalControl';
import { OperationNoteRoV } from './OperationNoteRoV';
import { fbSaveCancelButtons as SaveCancelButtons } from './components/fbSaveCancelButtons';
import { fbBottomControlsRow as BottomControlsRow } from './components/fbBottomControlsRow';
import { fbLayout as FbLayout, SectionSpec, areAllSectionsComplete, getSectionStatus as getSectionStatusHelper } from "./components/fbLayout";
import { fbDropdown as FbDropdown } from "./components/fbDropdown";
import { fbSmartDropdown as FbSmartDropdown } from "./components/fbSmartDropdown";
import { fbAddButton as AddButton } from "./components/fbAddButton";
import { fbTextInput as FbTextInput } from "./components/fbTextInput";
import { fbTime as FbTime } from "./components/fbTime";
import { fbTextArea as FbTextArea } from "./components/fbTextArea";
import { fbNumberInput as FbNumberInput } from "./components/fbNumberInput";
import { fbTableCell as FbTableCell } from "./components/fbTableCell";
import {
  fbTable as FbTable,
  fbTableHeader as FbTableHeader,
  fbTableBody as FbTableBody,
  fbTableRow as FbTableRow,
  fbTableHeaderCell as FbTableHeaderCell
} from "./components/fbTable";
import { fbFormHistoryMenu as FbFormHistoryMenu, fbFormHistoryItem } from "./components/fbFormHistoryMenu";
import { compareFormStatesObj, cleanArrayOfObjects } from "./utils/formStateUtils";
import { generateUUID } from "./utils/formUtils";
import { formDateToIsoDate, formatFormDate } from "./utils/dateFormat";
import { useEditFormAutoExpandTextareas, useEditFormLabelEqualization } from "./utils/formLayoutEffects";
import { appendRow, removeRowIfMultiple, updateRowById } from "./utils/rowState";
import { useFbTooltips } from "./utils/useFbTooltips";
import { useFormSaveFeedback } from "./utils/useFormSaveFeedback";
import { loadFormHistory } from "./utils/formHistory";
import { assertFormVersionIsLatest } from "./utils/formVersion";
import { createClient } from './restClient';

// Create REST client
const restClient = createClient();

const formatDate = formatFormDate;
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
  formVersion?: number;
  openInRoV?: boolean;
  onClose: () => void;
}

export default function OperationNote({ inlineProps }: { inlineProps?: InlineProps } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = React.useState<Patient | null>(null);

  const navigateBack = () => {
    if (inlineProps) {
      inlineProps.onClose();
    } else {
      const prevPage = sessionStorage.getItem('fb_prev_main_page') || '/';
      const prevPatientUuid = sessionStorage.getItem('fb_prev_patient_uuid') || patient?.uuid;
      if (prevPage === '/patient-record' && prevPatientUuid) {
        navigate('/patient-record', { state: { patientUuid: prevPatientUuid } });
      } else {
        navigate(prevPage);
      }
    }
  };
  const [loadingData, setLoadingData] = React.useState<boolean>(false);

  const [formState, setFormState] = React.useState<Record<string, any>>({});
  const [procedures, setProcedures] = React.useState<Array<{id: number, side: string, procedure: string, additionalInfo: string}>>([{id: 1, side: '', procedure: '', additionalInfo: ''}]);
  const [diagnoses, setDiagnoses] = React.useState<Array<{id: number, diagnosis: string}>>([{id: 1, diagnosis: ''}, {id: 2, diagnosis: ''}, {id: 3, diagnosis: ''}]);
  const [specimens, setSpecimens] = React.useState<Array<{id: number, label: string, description: string}>>([{id: 1, label: '', description: ''}, {id: 2, label: '', description: ''}, {id: 3, label: '', description: ''}]);
  const [implants, setImplants] = React.useState<Array<{id: number, uuid?: string, implantId: string, description: string, requiresRemoval: string, removeBy: string}>>([{id: 1, implantId: '', description: '', requiresRemoval: '', removeBy: ''}]);
  const [surgeons, setSurgeons] = React.useState<Array<{id: number, name: string, coded?: boolean, name_text?: string, name_NADEXId?: string}>>([{id: 1, name: ''}]);
  const [anaesthetists, setAnaesthetists] = React.useState<Array<{id: number, name: string, coded?: boolean, name_text?: string, name_NADEXId?: string}>>([{id: 1, name: ''}]);
  const [urgencyType, setUrgencyType] = React.useState<string>('');
  const [electiveUrgency, setElectiveUrgency] = React.useState<string>('');
  const [draggedRow, setDraggedRow] = React.useState<number | null>(null);
  const [formChanged, setFormChanged] = React.useState<boolean>(false);
  const [selectedFormVersion, setSelectedFormVersion] = React.useState<number | undefined>(() => {
    if (inlineProps?.formVersion) return inlineProps.formVersion;
    return (location.state as { formVersion?: number } | null)?.formVersion;
  });
  const [currentFormVersion, setCurrentFormVersion] = React.useState<number | null>(null);
  const [latestFormVersion, setLatestFormVersion] = React.useState<number | null>(null);
  const [formHistory, setFormHistory] = React.useState<fbFormHistoryItem[]>([]);
  const [showHistory, setShowHistory] = React.useState<boolean>(false);
  const [historyAnchorRect, setHistoryAnchorRect] = React.useState<DOMRect | null>(null);
  const [highlySensitive, setHighlySensitive] = React.useState<boolean>(false);
  const [clickedRoVButton, setClickedRoVButton] = React.useState<boolean>(false);
  const [finalChecked, setFinalChecked] = React.useState<boolean>(false);
  const [isReadOnlyView, setIsReadOnlyView] = React.useState<boolean>(() => {
    if (inlineProps) return inlineProps.openInRoV || false;
    const s = location.state as { openInRoV?: boolean } | null;
    return s?.openInRoV || false;
  });
  const [username, setUsername] = React.useState<string>('demoUser');
  const [showDraftPopup, setShowDraftPopup] = React.useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = React.useState<boolean>(false);
  const [openedFromPatientRecord, setOpenedFromPatientRecord] = React.useState<boolean>(() => {
    if (inlineProps) return true;
    const s = location.state as { openInRoV?: boolean } | null;
    return !!(s && typeof s.openInRoV !== 'undefined');
  });
  const [activeSection, setActiveSection] = React.useState<string>('section-basic');
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
    onSave: saveOperationNote,
    onSaved: navigateBack,
    onError: () => setFormChanged(true),
    onStaleSave: continueAfterStaleSave,
  });
  const { showTooltip, showTooltipForControl, hideTooltip, closeTooltip, renderTooltips } = useFbTooltips();
  const [initialSnapshot, setInitialSnapshot] = React.useState<{
    formState: any;
    procedures: any[];
    diagnoses: any[];
    specimens: any[];
    implants: any[];
    surgeons: any[];
    anaesthetists: any[];
    urgencyType: string;
    electiveUrgency: string;
    highlySensitive: boolean;
    finalChecked: boolean;
  } | null>(null);

  const isStateEqual = (stateA: any, stateB: any) => {
    if (!stateA || !stateB) return false;
    return compareFormStatesObj(stateA.formState, stateB.formState) &&
           JSON.stringify(cleanArrayOfObjects(stateA.procedures, ['side', 'procedure', 'additionalInfo'])) === JSON.stringify(cleanArrayOfObjects(stateB.procedures, ['side', 'procedure', 'additionalInfo'])) &&
           JSON.stringify(cleanArrayOfObjects(stateA.diagnoses, ['diagnosis'])) === JSON.stringify(cleanArrayOfObjects(stateB.diagnoses, ['diagnosis'])) &&
           JSON.stringify(cleanArrayOfObjects(stateA.specimens, ['label', 'description'])) === JSON.stringify(cleanArrayOfObjects(stateB.specimens, ['label', 'description'])) &&
           JSON.stringify(cleanArrayOfObjects(stateA.implants, ['implantId', 'description', 'requiresRemoval', 'removeBy'])) === JSON.stringify(cleanArrayOfObjects(stateB.implants, ['implantId', 'description', 'requiresRemoval', 'removeBy'])) &&
           JSON.stringify(cleanArrayOfObjects(stateA.surgeons, ['name'])) === JSON.stringify(cleanArrayOfObjects(stateB.surgeons, ['name'])) &&
           JSON.stringify(cleanArrayOfObjects(stateA.anaesthetists, ['name'])) === JSON.stringify(cleanArrayOfObjects(stateB.anaesthetists, ['name'])) &&
           (stateA.urgencyType || '') === (stateB.urgencyType || '') &&
           (stateA.electiveUrgency || '') === (stateB.electiveUrgency || '') &&
           !!stateA.highlySensitive === !!stateB.highlySensitive &&
           !!stateA.finalChecked === !!stateB.finalChecked;
  };

  React.useEffect(() => {
    if (initialSnapshot) {
      const changed = !isStateEqual(initialSnapshot, {
        formState,
        procedures,
        diagnoses,
        specimens,
        implants,
        surgeons,
        anaesthetists,
        urgencyType,
        electiveUrgency,
        highlySensitive,
        finalChecked,
      });
      setFormChanged(changed);
    }
  }, [initialSnapshot, formState, procedures, diagnoses, specimens, implants, surgeons, anaesthetists, urgencyType, electiveUrgency, highlySensitive, finalChecked]);

  const handleFieldChange = (fieldName: string, value: any, coded?: boolean, nadexId?: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: value,
      ...(coded !== undefined ? {
        [`${fieldName}_coded`]: coded,
        [`${fieldName}_text`]: value,
        [`${fieldName}_NADEXId`]: nadexId || '',
      } : {}),
    }));
  };

  const sectionsConfig: SectionSpec[] = [
    {
      id: "section-basic",
      name: "Basic information",
      requiredFields: ['organisation', 'speciality', 'hospital', 'urgency', 'date']
    }, {
      id: "section-staff",
      name: "Surgeons and anaesthetists",
      requiredFields: ['leadSurgeon', 'surgeonSRC', 'leadAnaesthetist', 'anaesthetistSRC']
    }, {
      id: "section-prophylaxis",
      name: "Prophylaxis",
    }, {
      id: "section-procedures",
      name: "Procedures",
    }, {
      id: "section-detail",
      name: "Detail",
    }, {
      id: "section-specimens",
      name: "Tissue removed",
    }, {
      id: "section-images",
      name: "Images",
    }, {
      id: "section-implants",
      name: "Implants",
      getIncompleteCount: (state) => {
        return (implants || []).filter(impl => impl.requiresRemoval === 'yes' && (!impl.removeBy || impl.removeBy === '')).length;
      }
    }
  ];

  const getSectionStatus = (sectionName: string) => {
    const spec = sectionsConfig.find(s => s.name === sectionName || s.id === sectionName);
    if (!spec) return { incomplete: 0, isComplete: true };
    return getSectionStatusHelper(spec, formState);
  };

  const areRequiredFieldsComplete = () => {
    return areAllSectionsComplete(sectionsConfig, formState);
  };

  const checkIfFormChanged = () => {
    // Simplified - triggers when any field changes
    setFormChanged(true);
  };

  // Load form and patient data when opened from patient record
  React.useEffect(() => {
    const state = inlineProps ? {
      patientUuid: inlineProps.patientUuid,
      formUuid: inlineProps.formUuid,
      formVersion: selectedFormVersion,
      openInRoV: inlineProps.openInRoV,
      username: username
    } : (location.state as { formUuid?: string; formVersion?: number; patientUuid?: string; openInRoV?: boolean; username?: string } | null);

    // Load username from state if provided
    if (state?.username) {
      setUsername(state.username);
    }

    // If patientUuid is provided, load patient data (for both new and existing forms)
    if (!state?.patientUuid) {
      return; // No patient to load, use default state
    }

    // Set these immediately so the UI renders correctly
    setOpenedFromPatientRecord(!!(state && typeof state.openInRoV !== 'undefined'));
    if (state.openInRoV && state.formUuid) {
      setIsReadOnlyView(true);
    }

    const loadData = async () => {
      try {
        setLoadingData(true);

        // Fetch patient data
        const { data: patientData, error: patientError } = await restClient
          .from('patients')
          .select('*')
          .eq('uuid', state.patientUuid)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (patientError) {
          console.error('Error loading patient:', patientError);
        } else {
          setPatient(patientData);
        }

        // Only load form data if formUuid is provided (existing form)
        let loadedFormState: any = {};
        let loadedProcs = [{id: 1, side: '', procedure: '', additionalInfo: ''}];
        let loadedDiags = [{id: 1, diagnosis: ''}, {id: 2, diagnosis: ''}, {id: 3, diagnosis: ''}];
        let loadedSpecs = [{id: 1, label: '', description: ''}, {id: 2, label: '', description: ''}, {id: 3, label: '', description: ''}];
        let loadedImpls = [{id: 1, implantId: '', description: '', requiresRemoval: '', removeBy: ''}];
        let loadedSurgeons = [{id: 1, name: ''}];
        let loadedAnas = [{id: 1, name: ''}];
        let loadedUrgency = '';
        let loadedElectiveUrgency = '';
        let loadedHighlySensitive = false;
        let loadedFinal = false;

        if (state?.formUuid) {
          // Fetch form data
          let formQuery = restClient
            .from('operation_notes')
            .select('*')
            .eq('uuid', state.formUuid)
            .order('version', { ascending: false })
            .limit(1);

          if (state.formVersion !== undefined) {
            formQuery = formQuery.eq('version', state.formVersion);
          }

          const { data: formData, error: formError } = await formQuery.single();

          if (formError) {
            console.error('Error loading form:', formError);
          } else if (formData?.form_data) {
            const historyState = await loadFormHistory(restClient, 'operation_notes', state.formUuid, formData.version ?? null);
            setCurrentFormVersion(historyState.currentVersion);
            setLatestFormVersion(historyState.latestVersion);
            setFormHistory(historyState.history);

            // Load form data into state
            loadedFormState = formData.form_data;
            loadedProcs = formData.form_data.procedures || [{id: 1, side: '', procedure: '', additionalInfo: ''}];
            loadedDiags = formData.form_data.diagnoses || [{id: 1, diagnosis: ''}, {id: 2, diagnosis: ''}, {id: 3, diagnosis: ''}];
            loadedSpecs = formData.form_data.specimens || [{id: 1, label: '', description: ''}, {id: 2, label: '', description: ''}, {id: 3, label: '', description: ''}];
            loadedImpls = formData.form_data.implants || [{id: 1, implantId: '', description: '', requiresRemoval: '', removeBy: ''}];
            loadedSurgeons = formData.form_data.surgeons || [{id: 1, name: ''}];
            loadedAnas = formData.form_data.anaesthetists || [{id: 1, name: ''}];
            loadedUrgency = formData.form_data.urgencyType || '';
            loadedElectiveUrgency = formData.form_data.electiveUrgency || '';
            loadedHighlySensitive = !!(formData.highly_sensitive ?? formData.form_data.highlySensitive);

            setFormState(loadedFormState);
            setProcedures(loadedProcs);
            setDiagnoses(loadedDiags);
            setSpecimens(loadedSpecs);
            setImplants(loadedImpls);
            setSurgeons(loadedSurgeons);
            setAnaesthetists(loadedAnas);
            setUrgencyType(loadedUrgency);
            setElectiveUrgency(loadedElectiveUrgency);
            setHighlySensitive(loadedHighlySensitive);

            loadedFinal = formData.form_status === 'final';
            setFinalChecked(loadedFinal);
          }
        } else {
          setCurrentFormVersion(null);
          setLatestFormVersion(null);
          setFormHistory([]);
          // New form created from patient record
          setOpenedFromPatientRecord(!!(state && typeof state.openInRoV !== 'undefined'));
          const today = formatDate(new Date());
          loadedFormState = {
            organisation: 'bae-glas',
            hospital: 'ysbyty-abermawr',
            date: today
          };
          setFormState(loadedFormState);
        }

        setInitialSnapshot({
          formState: loadedFormState,
          procedures: loadedProcs,
          diagnoses: loadedDiags,
          specimens: loadedSpecs,
          implants: loadedImpls,
          surgeons: loadedSurgeons,
          anaesthetists: loadedAnas,
          urgencyType: loadedUrgency,
          electiveUrgency: loadedElectiveUrgency,
          highlySensitive: loadedHighlySensitive,
          finalChecked: loadedFinal,
        });

      } catch (err) {
        console.error('Exception loading data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [location.state, inlineProps, selectedFormVersion]);

  useEditFormLabelEqualization(isReadOnlyView, [
    procedures,
    diagnoses,
    specimens,
    implants,
    surgeons,
    anaesthetists,
    urgencyType,
    electiveUrgency,
    formState,
  ]);

  useEditFormAutoExpandTextareas(isReadOnlyView, [
    procedures,
    diagnoses,
    specimens,
    implants,
    surgeons,
    anaesthetists,
    formState,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalChecked) {
      setShowDraftPopup(true);
      return;
    }

    requestSave('final');
  };

  function continueAfterStaleSave() {
    setSelectedFormVersion(undefined);
    setIsReadOnlyView(true);
    setClickedRoVButton(false);
  }

  async function saveOperationNote(formStatus: SaveStatus, passwordToSave: string) {
      let formUuid = formState.uuid;
      let version = 0;

      // If editing existing form, get current max version
      if (formUuid) {
        const latestVersion = await assertFormVersionIsLatest(restClient, 'operation_notes', formUuid, currentFormVersion);
        if (latestVersion !== null) {
          version = latestVersion + 1;
        }
      } else {
        // New form - generate UUID
        formUuid = generateUUID();
      }

      const implantsToSave = implants.map((implant) => {
        if (!implant.implantId && !implant.description && !implant.requiresRemoval && !implant.removeBy) return implant;
        return implant.uuid ? implant : { ...implant, uuid: generateUUID() };
      });

      // Prepare form data
      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        procedures,
        diagnoses,
        specimens,
        implants: implantsToSave,
        surgeons,
        anaesthetists,
        urgencyType,
        electiveUrgency,
        highlySensitive,
        password: passwordToSave,
        username: username,
        finalChecked: formStatus === 'final'
      };

      const eventDate = formDateToIsoDate(formState.date) || new Date().toISOString();

      // Insert new version
      const { error: insertError } = await restClient
        .from('operation_notes')
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: eventDate,
          form_status: formStatus,
          highly_sensitive: highlySensitive,
          form_data: formDataToSave,
          organisation: formState.organisation || null,
          hospital: formState.hospital || null,
          senior_responsible_clinician: formState.surgeonSRC || null,
          speciality: formState.speciality || null
        });

      if (insertError) throw insertError;

      // Also insert into forms_index
      const { error: indexError } = await restClient
        .from('forms_index')
        .insert({
          form_uuid: formUuid,
          form_version: version,
          form_type: 'operation_note',
          patient_uuid: patient?.uuid || null,
          event_datetime: eventDate,
          document_datetime: new Date().toISOString(),
          form_status: formStatus,
          highly_sensitive: highlySensitive,
          event_or_document: 'Document',
          organisation: formState.organisation || null,
          hospital: formState.hospital || null,
          speciality: formState.speciality || null,
          senior_responsible_clinician: formState.surgeonSRC || null,
          details: username
        });

      if (indexError) throw indexError;

      setImplants(implantsToSave);
      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        procedures: [...procedures],
        diagnoses: [...diagnoses],
        specimens: [...specimens],
        implants: [...implantsToSave],
        surgeons: [...surgeons],
        anaesthetists: [...anaesthetists],
        urgencyType: urgencyType,
        electiveUrgency: electiveUrgency,
        highlySensitive: highlySensitive,
        finalChecked: formStatus === 'final'
      });

      setFormChanged(false);
  }

  const handleSaveAsDraft = async () => {
    setShowDraftPopup(false);

    requestSave('draft');
  };

  const handlePasswordConfirm = (pwd: string) => {
    confirmPassword(pwd);
  };

  // Set default values and track active section
  React.useEffect(() => {
    const today = formatDate(new Date());
    setFormState(prev => ({
      ...prev,
      organisation: 'bae-glas',
      hospital: 'ysbyty-abermawr',
      date: today
    }));

    // Track active section on scroll and hide tooltips
    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    const handleScroll = () => {
      // Hide tooltips on scroll
      closeTooltip();

      // Determine which section is currently visible
      const sections = [
        'section-basic',
        'section-staff',
        'section-prophylaxis',
        'section-procedures',
        'section-detail',
        'section-specimens',
        'section-images',
        'section-implants'
      ];

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && scrollContainer) {
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          // Check if section is visible in the viewport
          if (rect.top <= containerRect.top + 100 && rect.bottom > containerRect.top) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Procedure table functions
  const addProcedureRow = () => {
    setProcedures(appendRow(procedures, (id) => ({ id, side: '', procedure: '', additionalInfo: '' })));
  };

  const deleteProcedureRow = (id: number) => {
    setProcedures(removeRowIfMultiple(procedures, id));
  };

  const updateProcedure = (id: number, field: string, value: string) => {
    setProcedures(updateRowById(procedures, id, (procedure) => ({ ...procedure, [field]: value })));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRow(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRow === null) return;

    if (draggedRow !== index) {
      const newProcedures = [...procedures];
      const draggedItem = newProcedures[draggedRow];
      newProcedures.splice(draggedRow, 1);
      newProcedures.splice(index, 0, draggedItem);
      setProcedures(newProcedures);
      setDraggedRow(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedRow(null);
  };

  // Diagnosis functions
  const addDiagnosis = () => {
    setDiagnoses(appendRow(diagnoses, (id) => ({ id, diagnosis: '' })));
  };

  const deleteDiagnosis = (id: number) => {
    setDiagnoses(removeRowIfMultiple(diagnoses, id));
  };

  const updateDiagnosis = (id: number, value: string) => {
    setDiagnoses(updateRowById(diagnoses, id, (diagnosis) => ({ ...diagnosis, diagnosis: value })));
  };

  // Specimen functions
  const addSpecimen = () => {
    setSpecimens(appendRow(specimens, (id) => ({ id, label: '', description: '' })));
  };

  const deleteSpecimen = (id: number) => {
    setSpecimens(removeRowIfMultiple(specimens, id));
  };

  const updateSpecimen = (id: number, field: string, value: string) => {
    setSpecimens(updateRowById(specimens, id, (specimen) => ({ ...specimen, [field]: value })));
  };

  // Implant functions
  const addImplant = () => {
    setImplants(appendRow(implants, (id) => ({ id, implantId: '', description: '', requiresRemoval: '', removeBy: '' })));
  };

  const deleteImplant = (id: number) => {
    setImplants(removeRowIfMultiple(implants, id));
  };

  const updateImplant = (id: number, field: string, value: string) => {
    setImplants(updateRowById(implants, id, (implant) => ({ ...implant, [field]: value })));
  };

  // Surgeon functions
  const addSurgeon = () => {
    setSurgeons(appendRow(surgeons, (id) => ({ id, name: '' })));
  };

  const deleteSurgeon = (id: number) => {
    setSurgeons(removeRowIfMultiple(surgeons, id));
  };

  const updateSurgeon = (id: number, value: string, coded?: boolean, nadexId?: string) => {
    setSurgeons(updateRowById(surgeons, id, (surgeon) => ({ ...surgeon, name: value, coded, name_text: value, name_NADEXId: nadexId || '' })));
  };

  // Anaesthetist functions
  const addAnaesthetist = () => {
    setAnaesthetists(appendRow(anaesthetists, (id) => ({ id, name: '', coded: false })));
  };

  const deleteAnaesthetist = (id: number) => {
    setAnaesthetists(removeRowIfMultiple(anaesthetists, id));
  };

  const updateAnaesthetist = (id: number, value: string, coded?: boolean, nadexId?: string) => {
    setAnaesthetists(updateRowById(anaesthetists, id, (anaesthetist) => ({ ...anaesthetist, name: value, coded, name_text: value, name_NADEXId: nadexId || '' })));
  };

  return (
    <>
      {isReadOnlyView ? (
        <OperationNoteRoV
          patient={patient}
          formState={formState}
          procedures={procedures}
          diagnoses={diagnoses}
          specimens={specimens}
          implants={implants}
          surgeons={surgeons}
          anaesthetists={anaesthetists}
          urgencyType={urgencyType}
          electiveUrgency={electiveUrgency}
          finalChecked={finalChecked}
          formStatus={finalChecked ? 'final' : 'draft'}
          openedFromPatientRecord={openedFromPatientRecord}
          username={username}
          onSwitchToEV={() => {
            setClickedRoVButton(false);
            setIsReadOnlyView(false);
          }}
          onBack={currentFormVersion !== null && latestFormVersion !== null && currentFormVersion < latestFormVersion ? () => setSelectedFormVersion(undefined) : navigateBack}
          reachedByRoVButton={clickedRoVButton}
          superseded={currentFormVersion !== null && latestFormVersion !== null && currentFormVersion < latestFormVersion}
          onHistory={(anchorRect) => {
            setHistoryAnchorRect(anchorRect);
            setShowHistory(true);
          }}
        />
      ) : (
        <div className="bg-white flex flex-col" style={{height: '100vh', fontFamily: "'Roboto', sans-serif", fontWeight: 300, lineHeight: 1.2}}>
          <style>{`
            .fb-bottom-control-btn-rov,
            .fb-bottom-control-item,
            .fb-bottom-control-username,
            .fb-bottom-control-password,
            .fb-bottom-control-final,
            .fb-bottom-btn-save,
            .fb-bottom-btn-cancel,
              transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            }

            .fb-bottom-control-btn-rov:hover,
            .fb-bottom-control-btn-rov:focus,
              background-color: #fee715 !important;
              color: black !important;
            }

              transition: background-color 0.2s ease, color 0.2s ease;
            }
              background-color: #fee715 !important;
              color: black !important;
            }

            .fb-bottom-control-username:hover,
            .fb-bottom-control-username:focus,
            .fb-bottom-control-password:hover,
            .fb-bottom-control-password:focus,
              background-color: #fee715 !important;
              color: black !important;
            }

            .fb-bottom-control-final:not(.disabled):focus-within,
              background-color: #fee715 !important;
              color: black !important;
            }

            .fb-bottom-control-final:not(.disabled):hover,
              background-color: #fee715 !important;
              color: black !important;
            }

            .fb-bottom-btn-save:not(:disabled):hover,
            .fb-bottom-btn-save:not(:disabled):focus,
              background-color: #fee715 !important;
              color: black !important;
            }

            .fb-bottom-btn-cancel:hover,
            .fb-bottom-btn-cancel:focus,
              background-color: #fee715 !important;
              color: black !important;
            }

            .fb-add-button,
              transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            }

            .fb-add-button:hover,
            .fb-add-button:focus-visible {
              background-color: #fee715 !important;
              color: black !important;
              border-color: #fee715 !important;
            }

            .fb-layout-edit-view-form input:not([type="radio"]):not([type="checkbox"]),
            .fb-layout-edit-view-form select,
            .fb-layout-edit-view-form textarea,
            .fb-layout-edit-view-form .fb-msi-selector-input,
            .fb-layout-edit-view-form .fb-sct-procedure-selector-input,
            .fb-layout-edit-view-form .fb-date-control-input,
            .fb-layout-edit-view-form input.border {
              border: 0.1rem solid silver !important;
              border-radius: 0.4rem !important;
              background-color: white !important;
              padding-top: 0.2rem !important;
              padding-bottom: 0.2rem !important;
              box-sizing: border-box !important;
            }
            .fb-layout-edit-view-form input:not([type="radio"]):not([type="checkbox"]):hover,
            .fb-layout-edit-view-form select:hover,
            .fb-layout-edit-view-form textarea:hover {
              background-color: white !important;
            }
            .fb-layout-edit-view-form input:not([type="radio"]):not([type="checkbox"]):focus,
            .fb-layout-edit-view-form select:focus,
            .fb-layout-edit-view-form textarea:focus,
            .fb-layout-edit-view-form input.border:focus,
            .fb-layout-edit-view-form .fb-hide-border-in-rov:focus {
              background-color: white !important;
              outline: none !important;
              border-color: silver !important;
              border: 0.1rem solid silver !important;
              border-radius: 0.4rem !important;
              box-shadow: none !important;
            }

            .fb-layout-edit-view-form table th {
              font-family: 'Roboto', sans-serif !important;
              font-size: 0.8rem !important;
              font-style: italic !important;
              font-weight: 300 !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
              box-sizing: border-box !important;
            }

            .fb-layout-edit-view-form .fb-number-input-with-units {
              border: 0.1rem solid silver !important;
              border-radius: 0.4rem !important;
              height: 2.0rem !important;
              overflow: hidden;
            }
            .fb-layout-edit-view-form .fb-number-input-with-units input,
            .fb-layout-edit-view-form .fb-number-input-with-units input:not([type="radio"]):not([type="checkbox"]) {
              border: none !important;
              border-width: 0px !important;
              outline: none !important;
              height: 100% !important;
              padding-top: 0.2rem !important;
              padding-bottom: 0.2rem !important;
            }

            .fb-layout-edit-view-form textarea {
              overflow: hidden !important;
              resize: none !important;
            }

            .fb-subquestion-wrapper,
            .fb-layout-edit-view-form .fb-subquestion-wrapper,
            .fb-layout-edit-view-form .fb-radio-checkbox-item {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
              box-sizing: border-box !important;
            }

            .fb-layout-edit-view-form h3 {
              font-weight: 500 !important;
              font-size: 1rem !important;
              line-height: 1.1rem !important;
              padding: 0.2rem 0.2rem 0.2rem 0.4rem !important;
              margin: 0 !important;
              background-color: rgb(27, 110, 194) !important;
            }
          `}</style>
        <FbLayout
          style={{ lineHeight: 1.1 }}
          header={
            <div style={{borderBottom: '0.2rem solid rgb(27, 110, 194)', marginBottom: '0.2rem', padding: '0.4rem'}}>
              <div className="flex justify-between items-center">
                <h1 style={{fontSize: '2rem', fontWeight: 500}}>Operation note</h1>
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
                    hospitalNumber={patient.hospital_number}
                    dateOfBirth={patient.date_of_birth}
                    sex={patient.sex}
                  />
                ) : (
                  <Addressograph />
                )}
              </div>
            </div>
          }
          sections={sectionsConfig}
          formState={formState}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isReadOnlyView={isReadOnlyView}
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
              requiredFieldsComplete={areRequiredFieldsComplete()}
              username={username}
              onUsernameChange={setUsername}
              password={password}
              onPasswordChange={setPassword}
              passwordTimeoutRef={passwordTimeoutRef}
              formChanged={formChanged}
              isSaving={isSaving}
              onCancel={() => {
                if (formChanged) {
                  setShowCancelPopup(true);
                } else {
                  const s = location.state as { formUuid?: string } | null;
                  const isEditOfExisting = inlineProps ? !!inlineProps.formUuid : !!s?.formUuid;
                  if (isEditOfExisting) {
                    setIsReadOnlyView(true);
                  } else {
                    navigateBack();
                  }
                }
              }}
              saveLabel="Save and close"
            />
          }
        >
          <div className="space-y-4" onChange={checkIfFormChanged}>

            {/* Basic information */}
            <div id="section-basic">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0}}>Basic information</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FbDropdown
                    id="organisation"
                    name="organisation"
                    label="Organisation"
                    required={true}
                    value={formState.organisation || ""}
                    onChange={(val) => handleFieldChange("organisation", val)}
                    options={healthBoards}
                  />

                  <FbSmartDropdown
                    id="speciality"
                    name="speciality"
                    label="Speciality"
                    required={true}
                    placeholder=""
                    value={formState.speciality || ""}
                    onChange={(val) => handleFieldChange("speciality", val)}
                    options={specialities}
                  />

                  <FbDropdown
                    id="hospital"
                    name="hospital"
                    label="Hospital"
                    required={true}
                    placeholder=""
                    value={formState.hospital || ""}
                    onChange={(val) => handleFieldChange("hospital", val)}
                    options={facilities.map(({ value, label }) => ({ value, label }))}
                  />
                  <div className="space-y-2 fb-question-container">
                    {/* Empty cell for grid alignment */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{marginTop: '0.6rem'}}>
                  <div className="space-y-2 fb-question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}}>Urgency <span style={{color: '#d50000'}}>*</span></label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 fb-radio-checkbox-item">
                        <input
                          type="radio"
                          name="urgency"
                          value="elective"
                          checked={urgencyType === 'elective'}
                          onChange={(e) => {
                            setUrgencyType(e.target.value);
                            handleFieldChange('urgency', e.target.value);
                          }}
                        />
                        <span style={{fontWeight: 300}}>Elective</span>
                      </label>
                      {urgencyType === 'elective' && (
                        <div className="fb-subquestion pl-6 space-y-2 mt-1">
                          <label className="flex items-center gap-2 fb-radio-checkbox-item">
                            <input
                              type="radio"
                              name="electiveUrgency"
                              value="routine"
                              checked={electiveUrgency === 'routine'}
                              onChange={(e) => {
                                setElectiveUrgency(e.target.value);
                                handleFieldChange('electiveUrgency', e.target.value);
                              }}
                              required={true}
                            />
                            <span style={{fontWeight: 300}}>Routine</span>
                          </label>
                          <label className="flex items-center gap-2 fb-radio-checkbox-item">
                            <input
                              type="radio"
                              name="electiveUrgency"
                              value="urgent"
                              checked={electiveUrgency === 'urgent'}
                              onChange={(e) => {
                                setElectiveUrgency(e.target.value);
                                handleFieldChange('electiveUrgency', e.target.value);
                              }}
                              required={true}
                            />
                            <span style={{fontWeight: 300}}>Urgent</span>
                          </label>
                          <label
                            className="flex items-center gap-2 fb-radio-checkbox-item"
                            onMouseEnter={(e) => showTooltipForControl('Urgent Suspected Cancer', e.currentTarget, true)}
                            onMouseLeave={hideTooltip}
                          >
                            <input
                              type="radio"
                              name="electiveUrgency"
                              value="usc"
                              checked={electiveUrgency === 'usc'}
                              onChange={(e) => {
                                setElectiveUrgency(e.target.value);
                                handleFieldChange('electiveUrgency', e.target.value);
                              }}
                              required={true}
                              onFocus={(e) => showTooltipForControl('Urgent Suspected Cancer', e.currentTarget, true)}
                              onBlur={hideTooltip}
                            />
                            <span style={{fontWeight: 300}}>USC</span>
                          </label>
                        </div>
                      )}
                      <label className="flex items-center gap-2 fb-radio-checkbox-item">
                        <input
                          type="radio"
                          name="urgency"
                          value="emergency"
                          checked={urgencyType === 'emergency'}
                          onChange={(e) => {
                            setUrgencyType(e.target.value);
                            setElectiveUrgency('');
                            handleFieldChange('urgency', e.target.value);
                            handleFieldChange('electiveUrgency', '');
                          }}
                        />
                        <span style={{fontWeight: 300}}>Emergency</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2 fb-question-container">
                    <label
                      className="font-medium"
                      style={{fontWeight: 500, fontSize: '1rem'}}
                      htmlFor="date"
                      onMouseEnter={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onMouseLeave={hideTooltip}
                    >
                      Date <span style={{color: '#d50000'}}>*</span>
                    </label>
                    <ExactDate
                      name="date"
                      value={formState.date || ''}
                      onChange={(value) => handleFieldChange('date', value)}
                      placeholder="dd-Mmm-yyyy"
                      onMouseEnter={(e) => showTooltipForControl('Knife to skin', e.currentTarget)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e) => showTooltipForControl('Knife to skin', e.currentTarget)}
                      onBlur={hideTooltip}
                      required
                      showRequiredMarkers={false}
                    />
                  </div>
                  <FbTime
                    label="Start"
                    id="startTime"
                    name="startTime"
                    value={formState.startTime || ''}
                    onChange={(value) => handleFieldChange('startTime', value)}
                    onMouseEnter={(e) => showTooltipForControl('Knife to skin', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltipForControl('Knife to skin', e.currentTarget)}
                    onBlur={hideTooltip}
                  />
                  <FbTime
                    label="End"
                    id="endTime"
                    name="endTime"
                    value={formState.endTime || ''}
                    onChange={(value) => handleFieldChange('endTime', value)}
                    onMouseEnter={(e) => showTooltipForControl('Dressings applied', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltipForControl('Dressings applied', e.currentTarget)}
                    onBlur={hideTooltip}
                  />
                </div>
              </div>
            </div>

            {/* Surgeons and anaesthetists */}
            <div id="section-staff">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Surgeons and anaesthetists</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 fb-question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}}>Surgeons</label>
                    <div className="space-y-2">
                      <div className="fb-subquestion" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="fb-msi-selector-label-fb-subquestion">Lead operating surgeon <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="leadSurgeon"
                          value={formState.leadSurgeon || ''}
                          coded={formState.leadSurgeon_coded}
                          onChange={(value, coded, nadexId) => handleFieldChange('leadSurgeon', value, coded, nadexId)}
                          required
                        />
                      </div>
                      {surgeons.map((surgeon, index) => (
                        <div key={surgeon.id} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                          <div style={{flex: 1, padding: '0.2rem', borderRadius: '0.4rem'}} className="fb-subquestion">
                            <div className="fb-msi-selector-label-fb-subquestion">
                              {index === 0 ? 'Second surgeon' : index === 1 ? 'Third surgeon' : `Surgeon ${index + 2}`}
                            </div>
                            <MSISelector
                              name={`surgeon${index}`}
                              value={surgeon.name}
                              coded={surgeon.coded}
                              onChange={(value, coded, nadexId) => updateSurgeon(surgeon.id, value, coded, nadexId)}
                            />
                          </div>
                          {surgeons.length > 1 && (
                            <i
                              className="material-icons"
                              style={{color: '#d50000', fontSize: '1.5rem', cursor: 'pointer', marginTop: '1.5rem'}}
                              onClick={() => deleteSurgeon(surgeon.id)}
                            >
                              highlight_off
                            </i>
                          )}
                        </div>
                      ))}
                      <AddButton
                        label="Add surgeon"
                        onClick={addSurgeon}
                      />
                      <div style={{marginTop: '0.6rem', padding: '0.2rem', borderRadius: '0.4rem'}} className="fb-subquestion">
                        <div className="fb-msi-selector-label-fb-subquestion">Supervising surgeon present</div>
                        <MSISelector
                          name="supervisingSurgeon"
                          value={formState.supervisingSurgeon || ''}
                          coded={formState.supervisingSurgeon_coded}
                          onChange={(value, coded, nadexId) => handleFieldChange('supervisingSurgeon', value, coded, nadexId)}
                        />
                      </div>
                      <div className="fb-subquestion" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="fb-msi-selector-label-fb-subquestion">SRC <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="surgeonSRC"
                          value={formState.surgeonSRC || ''}
                          coded={formState.surgeonSRC_coded}
                          onChange={(value, coded, nadexId) => handleFieldChange('surgeonSRC', value, coded, nadexId)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 fb-question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}}>Anaesthetists</label>
                    <div className="space-y-2">
                      <div className="fb-subquestion" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="fb-msi-selector-label-fb-subquestion">Lead anaesthetist <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="leadAnaesthetist"
                          value={formState.leadAnaesthetist || ''}
                          coded={formState.leadAnaesthetist_coded}
                          onChange={(value, coded, nadexId) => handleFieldChange('leadAnaesthetist', value, coded, nadexId)}
                          required
                        />
                      </div>
                      {anaesthetists.map((anaesthetist, index) => (
                        <div key={anaesthetist.id} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                          <div style={{flex: 1, padding: '0.2rem', borderRadius: '0.4rem'}} className="fb-subquestion">
                            <div className="fb-msi-selector-label-fb-subquestion">
                              {index === 0 ? 'Second anaesthetist' : index === 1 ? 'Third anaesthetist' : `Anaesthetist ${index + 2}`}
                            </div>
                            <MSISelector
                              name={`anaesthetist${index}`}
                              value={anaesthetist.name}
                              coded={anaesthetist.coded}
                              onChange={(value, coded, nadexId) => updateAnaesthetist(anaesthetist.id, value, coded, nadexId)}
                            />
                          </div>
                          {anaesthetists.length > 1 && (
                            <i
                              className="material-icons"
                              style={{color: '#d50000', fontSize: '1.5rem', cursor: 'pointer', marginTop: '1.5rem'}}
                              onClick={() => deleteAnaesthetist(anaesthetist.id)}
                            >
                              highlight_off
                            </i>
                          )}
                        </div>
                      ))}
                      <AddButton
                        label="Add anaesthetist"
                        onClick={addAnaesthetist}
                      />
                      <div style={{marginTop: '0.6rem', padding: '0.2rem', borderRadius: '0.4rem'}} className="fb-subquestion">
                        <div className="fb-msi-selector-label-fb-subquestion">Supervising anaesthetist present</div>
                        <MSISelector
                          name="supervisingAnaesthetist"
                          value={formState.supervisingAnaesthetist || ''}
                          coded={formState.supervisingAnaesthetist_coded}
                          onChange={(value, coded, nadexId) => handleFieldChange('supervisingAnaesthetist', value, coded, nadexId)}
                        />
                      </div>
                      <div className="fb-subquestion" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="fb-msi-selector-label-fb-subquestion">SRC <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="anaesthetistSRC"
                          value={formState.anaesthetistSRC || ''}
                          coded={formState.anaesthetistSRC_coded}
                          onChange={(value, coded, nadexId) => handleFieldChange('anaesthetistSRC', value, coded, nadexId)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prophylaxis */}
            <div id="section-prophylaxis">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Prophylaxis and other specific preop or intraop medication</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 fb-question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="antibioticProphylaxis">Antibiotic prophylaxis</label>
                    <FbTextArea
                      id="antibioticProphylaxis"
                      name="antibioticProphylaxis"
                      value={formState.antibioticProphylaxis || ''}
                      onChange={(value) => handleFieldChange('antibioticProphylaxis', value)}
                      rows={1}
                      fullWidth
                      inputStyle={{minHeight: '2.4rem'}}
                    />
                  </div>
                  <div className="space-y-2 fb-question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="vteProphylaxis">Venous thromboembolism prophylaxis</label>
                    <FbTextArea
                      id="vteProphylaxis"
                      name="vteProphylaxis"
                      value={formState.vteProphylaxis || ''}
                      onChange={(value) => handleFieldChange('vteProphylaxis', value)}
                      rows={1}
                      fullWidth
                      inputStyle={{minHeight: '2.4rem'}}
                    />
                  </div>
                  <div className="space-y-2 fb-question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="otherMedication">Other</label>
                    <FbTextArea
                      id="otherMedication"
                      name="otherMedication"
                      value={formState.otherMedication || ''}
                      onChange={(value) => handleFieldChange('otherMedication', value)}
                      rows={1}
                      fullWidth
                      inputStyle={{minHeight: '2.4rem'}}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Procedure(s) - simplified for now */}
            <div id="section-procedures">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Procedure(s)</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="overflow-x-auto" style={{padding: '0.4rem'}}>
                  <FbTable>
                    <FbTableHeader>
                      <FbTableRow>
                        <FbTableHeaderCell style={{ width: '2rem' }}></FbTableHeaderCell>
                        <FbTableHeaderCell>Side</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '40%' }}>Procedure</FbTableHeaderCell>
                        <FbTableHeaderCell>Additional information</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '2rem' }}></FbTableHeaderCell>
                      </FbTableRow>
                    </FbTableHeader>
                    <FbTableBody id="proceduresTableBody">
                      {(procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === '')) && (
                        <FbTableRow>
                          <td colSpan={5} className="fb-table-required-row p-2" style={{fontSize: '0.8rem', fontWeight: 500, fontStyle: 'italic', color: '#d50000', borderBottom: '1px solid silver'}}>
                            Enter at least one procedure
                          </td>
                        </FbTableRow>
                      )}
                      {procedures.map((proc, index) => (
                        <FbTableRow
                          key={proc.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          style={{backgroundColor: 'white', cursor: 'move'}}
                        >
                          <FbTableCell>
                            <i className="material-icons" style={{color: '#1b6ec2', fontSize: '1.5rem', cursor: 'grab'}}>swap_vertical_circle</i>
                          </FbTableCell>
                          <FbTableCell>
                            <FbDropdown
                              value={proc.side}
                              onChange={(value) => updateProcedure(proc.id, 'side', value)}
                              placeholder="Select side"
                              options={[
                                { value: 'left', label: 'Left' },
                                { value: 'right', label: 'Right' },
                                { value: 'bilateral', label: 'Bilateral' },
                                { value: 'na', label: 'Not applicable' },
                              ]}
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <FbSCTProcedure
                              name={`procedure${proc.id}`}
                              value={proc.procedure}
                              onChange={(value) => updateProcedure(proc.id, 'procedure', value)}
                              placeholder="Enter procedure"
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <FbTextInput
                              placeholder="Additional info"
                              value={proc.additionalInfo}
                              onChange={(value) => updateProcedure(proc.id, 'additionalInfo', value)}
                            />
                          </FbTableCell>
                          <FbTableCell style={{ textAlign: 'center' }}>
                            <i
                              className="material-icons"
                              style={{color: '#d50000', fontSize: '1.5rem', cursor: 'pointer'}}
                              onClick={() => deleteProcedureRow(proc.id)}
                            >
                              highlight_off
                            </i>
                          </FbTableCell>
                        </FbTableRow>
                      ))}
                    </FbTableBody>
                  </FbTable>
                </div>
                <AddButton
                  label="Add another procedure"
                  onClick={addProcedureRow}
                />
              </div>
            </div>

            {/* Detail section - simplified text areas */}
            <div id="section-detail">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Detail</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="indication">Indication</label>
                  <FbTextArea
                    id="indication"
                    name="indication"
                    rows={4}
                    value={formState.indication || ''}
                    onChange={(value) => handleFieldChange('indication', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="incision">Incision</label>
                  <FbTextArea
                    id="incision"
                    name="incision"
                    rows={2}
                    value={formState.incision || ''}
                    onChange={(value) => handleFieldChange('incision', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="findings">Findings</label>
                  <FbTextArea
                    id="findings"
                    name="findings"
                    rows={4}
                    value={formState.findings || ''}
                    onChange={(value) => handleFieldChange('findings', value)}
                    fullWidth
                  />
                </div>

                {/* Operative diagnoses table */}
                <div className="space-y-2 fb-question-container">
                  <label
                    className="font-medium"
                    style={{fontWeight: 500, fontSize: '1rem'}}
                    onMouseEnter={(e) => showTooltip('if different', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                  >
                    Operative diagnoses
                  </label>
                  <div style={{fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.4rem'}}>if different</div>
                  <div className="overflow-x-auto">
                    <FbTable>
                      <FbTableBody>
                        {diagnoses.map((diag, index) => (
                          <FbTableRow
                            key={diag.id}
                            draggable
                            onDragStart={(e) => { setDraggedRow(index); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (draggedRow !== null && draggedRow !== index) {
                                const newDiagnoses = [...diagnoses];
                                const draggedItem = newDiagnoses[draggedRow];
                                newDiagnoses.splice(draggedRow, 1);
                                newDiagnoses.splice(index, 0, draggedItem);
                                setDiagnoses(newDiagnoses);
                                setDraggedRow(index);
                              }
                            }}
                            onDragEnd={() => setDraggedRow(null)}
                            style={{backgroundColor: 'white', cursor: 'move'}}
                          >
                            <FbTableCell style={{ width: '2rem' }}>
                              <i className="material-icons" style={{color: '#1b6ec2', fontSize: '1.5rem', cursor: 'grab'}}>swap_vertical_circle</i>
                            </FbTableCell>
                            <FbTableCell>
                              <SCTDiagnosis
                                name={`diagnosis${diag.id}`}
                                value={diag.diagnosis}
                                onChange={(value) => updateDiagnosis(diag.id, value)}
                                placeholder="Search for diagnosis..."
                              />
                            </FbTableCell>
                            <FbTableCell style={{ width: '2rem', textAlign: 'center' }}>
                              {diagnoses.length > 1 && (
                                <i
                                  className="material-icons"
                                  style={{color: '#d50000', fontSize: '1.5rem', cursor: 'pointer'}}
                                  onClick={() => deleteDiagnosis(diag.id)}
                                >
                                  highlight_off
                                </i>
                              )}
                            </FbTableCell>
                          </FbTableRow>
                        ))}
                      </FbTableBody>
                    </FbTable>
                  </div>
                </div>
                <AddButton
                  label="Add operative diagnosis"
                  onClick={addDiagnosis}
                />

                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="procedureDescription">Procedure description</label>
                  <FbTextArea
                    id="procedureDescription"
                    name="procedureDescription"
                    rows={4}
                    value={formState.procedureDescription || ''}
                    onChange={(value) => handleFieldChange('procedureDescription', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="extraProcedures">Extra procedures undertaken</label>
                  <FbTextArea
                    id="extraProcedures"
                    name="extraProcedures"
                    rows={4}
                    value={formState.extraProcedures || ''}
                    onChange={(value) => handleFieldChange('extraProcedures', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="bloodLoss">Estimated blood loss</label>
                  <div className="fb-number-input-with-units" style={{width: 'auto', maxWidth: '10rem'}}>
                    <input
                      type="number"
                      id="bloodLoss"
                      name="bloodLoss"
                      className="p-2"
                      value={formState.bloodLoss || ''}
                      onChange={(e) => handleFieldChange('bloodLoss', e.target.value)}
                      min="0"
                      style={{width: '7ch'}}
                    />
                    <span className="unit-value-display fb-bold-in-rov" style={{display: 'none', fontWeight: 500}}></span>
                    <span className="unit-label">ml</span>
                  </div>
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="problems">Specific surgical intraoperative problems encountered</label>
                  <FbTextArea
                    id="problems"
                    name="problems"
                    rows={4}
                    value={formState.problems || ''}
                    onChange={(value) => handleFieldChange('problems', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="closure">Closure</label>
                  <FbTextArea
                    id="closure"
                    name="closure"
                    rows={4}
                    value={formState.closure || ''}
                    onChange={(value) => handleFieldChange('closure', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="postOpInstructions">Post-op instructions</label>
                  <FbTextArea
                    id="postOpInstructions"
                    name="postOpInstructions"
                    rows={4}
                    value={formState.postOpInstructions || ''}
                    onChange={(value) => handleFieldChange('postOpInstructions', value)}
                    fullWidth
                  />
                </div>
                <div className="space-y-2 fb-question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="followUp">Follow-up</label>
                  <FbTextArea
                    id="followUp"
                    name="followUp"
                    rows={2}
                    value={formState.followUp || ''}
                    onChange={(value) => handleFieldChange('followUp', value)}
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* Tissue removed */}
            <div id="section-specimens">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Tissue removed and pathological specimens</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="overflow-x-auto">
                  <FbTable>
                    <FbTableHeader>
                      <FbTableRow>
                        <FbTableHeaderCell style={{ width: '2rem' }}></FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '4rem' }}>A, B, C</FbTableHeaderCell>
                        <FbTableHeaderCell>Description</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '2rem' }}></FbTableHeaderCell>
                      </FbTableRow>
                    </FbTableHeader>
                    <FbTableBody>
                      {specimens.map((spec, index) => (
                        <FbTableRow
                          key={spec.id}
                          draggable
                          onDragStart={(e) => { setDraggedRow(index); e.dataTransfer.effectAllowed = 'move'; }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedRow !== null && draggedRow !== index) {
                              const newSpecimens = [...specimens];
                              const draggedItem = newSpecimens[draggedRow];
                              newSpecimens.splice(draggedRow, 1);
                              newSpecimens.splice(index, 0, draggedItem);
                              setSpecimens(newSpecimens);
                              setDraggedRow(index);
                            }
                          }}
                          onDragEnd={() => setDraggedRow(null)}
                          style={{backgroundColor: 'white', cursor: 'move'}}
                        >
                          <FbTableCell style={{ width: '2rem' }}>
                            <i className="material-icons" style={{color: '#1b6ec2', fontSize: '1.5rem', cursor: 'grab'}}>swap_vertical_circle</i>
                          </FbTableCell>
                          <FbTableCell style={{ width: '4rem' }}>
                            <FbTextInput
                              inputStyle={{width: '3rem'}}
                              value={spec.label}
                              onChange={(value) => updateSpecimen(spec.id, 'label', value)}
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <FbTextArea
                              rows={1}
                              value={spec.description}
                              onChange={(value) => updateSpecimen(spec.id, 'description', value)}
                              fullWidth
                              inputStyle={{minHeight: '2rem'}}
                            />
                          </FbTableCell>
                          <FbTableCell style={{ width: '2rem', textAlign: 'center' }}>
                            {specimens.length > 1 && (
                              <i
                                className="material-icons"
                                style={{color: '#d50000', fontSize: '1.5rem', cursor: 'pointer'}}
                                onClick={() => deleteSpecimen(spec.id)}
                              >
                                highlight_off
                              </i>
                            )}
                          </FbTableCell>
                        </FbTableRow>
                      ))}
                    </FbTableBody>
                  </FbTable>
                </div>
                <AddButton
                  label="Add specimen"
                  onClick={addSpecimen}
                />
              </div>
            </div>

            {/* Images */}
            <div id="section-images">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Images</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', padding: '1rem 0'}}>
                  {/* Placeholder image tiles */}
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{
                      width: '150px',
                      height: '150px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      Image {i}
                    </div>
                  ))}
                </div>
                <AddButton
                  label="Upload image"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Implants */}
            <div id="section-implants">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Implants - Scan for safety</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="fb-hide-in-rov" style={{fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.4rem'}}>Include implanted tissue and organs here</div>
                <div className="overflow-x-auto">
                  <FbTable style={{ tableLayout: 'auto' }}>
                    <FbTableHeader>
                      <FbTableRow>
                        <FbTableHeaderCell style={{ width: '9rem', whiteSpace: 'nowrap' }}>Implant Id</FbTableHeaderCell>
                        <FbTableHeaderCell>Type / description</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '1%' }}>Does this implant require exchange or removal?</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '12rem' }}>Remove by</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '2rem' }}></FbTableHeaderCell>
                      </FbTableRow>
                    </FbTableHeader>
                    <FbTableBody>
                      {implants.map((impl) => (
                        <FbTableRow key={impl.id}>
                          <FbTableCell style={{width: '9rem', whiteSpace: 'nowrap'}}>
                            <FbTextInput
                              value={impl.implantId}
                              onChange={(value) => updateImplant(impl.id, 'implantId', value)}
                              inputStyle={{width: '8rem'}}
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <FbTextArea
                              rows={1}
                              value={impl.description}
                              onChange={(value) => updateImplant(impl.id, 'description', value)}
                              fullWidth
                              inputStyle={{minHeight: '2rem'}}
                            />
                          </FbTableCell>
                          <FbTableCell style={{width: '1%'}}>
                            <div className="space-y-2">
                              <label className="fb-radio-checkbox-item flex items-center gap-2" style={{fontSize: '0.9rem', whiteSpace: 'nowrap'}}>
                                <input
                                  type="radio"
                                  name={`implantRemoval-${impl.id}`}
                                  value="yes"
                                  checked={impl.requiresRemoval === 'yes'}
                                  onChange={(e) => updateImplant(impl.id, 'requiresRemoval', e.target.value)}
                                  required
                                />
                                <span>Yes</span>
                              </label>
                              <label className="fb-radio-checkbox-item flex items-center gap-2" style={{fontSize: '0.9rem', whiteSpace: 'nowrap'}}>
                                <input
                                  type="radio"
                                  name={`implantRemoval-${impl.id}`}
                                  value="no"
                                  checked={impl.requiresRemoval === 'no'}
                                  onChange={(e) => updateImplant(impl.id, 'requiresRemoval', e.target.value)}
                                  required
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </FbTableCell>
                          <FbTableCell style={{width: '12rem'}}>
                            {impl.requiresRemoval === 'yes' && (
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.2rem'}}>
                                <PartialDate
                                  name={`removeBy${impl.id}`}
                                  value={impl.removeBy}
                                  onChange={(value) => updateImplant(impl.id, 'removeBy', value)}
                                  placeholder="dd-Mmm-yyyy"
                                  required={impl.requiresRemoval === 'yes'}
                                  showRequiredMarkers={false}
                                />
                                <span style={{color: '#d50000', flexShrink: 0}}>*</span>
                              </div>
                            )}
                          </FbTableCell>
                          <FbTableCell style={{width: '2rem', textAlign: 'center'}}>
                            {implants.length > 1 && (
                              <i
                                className="material-icons"
                                style={{color: '#d50000', fontSize: '1.5rem', cursor: 'pointer'}}
                                onClick={() => deleteImplant(impl.id)}
                              >
                                highlight_off
                              </i>
                            )}
                          </FbTableCell>
                        </FbTableRow>
                      ))}
                    </FbTableBody>
                  </FbTable>
                </div>
                <AddButton
                  label="Add another implant"
                  onClick={addImplant}
                />
              </div>
            </div>



          {/* Draft and Password Popups */}
          {showDraftPopup && (
            <DraftPopup
              onSaveAsDraft={handleSaveAsDraft}
              onReturnToForm={() => setShowDraftPopup(false)}
            />
          )}

          {showPasswordPopup && (
            <PasswordPopup
              onConfirm={handlePasswordConfirm}
              onCancel={cancelPassword}
            />
          )}

          {renderSaveFeedbackPopups()}

          {showCancelPopup && (
            <CancelPopup
              onDiscard={() => {
                setShowCancelPopup(false);
                setFormChanged(false);
                const s = location.state as { formUuid?: string } | null;
                const isEditOfExisting = inlineProps ? !!inlineProps.formUuid : !!s?.formUuid;
                if (isEditOfExisting) {
                  setIsReadOnlyView(true);
                } else {
                  navigateBack();
                }
              }}
              onReturnToForm={() => setShowCancelPopup(false)}
            />
          )}

          {/* Tooltips */}
          {renderTooltips(true)}

        </div>
      </FbLayout>
    </div>
      )}

      {showHistory && (
        <FbFormHistoryMenu
          history={formHistory}
          anchorRect={historyAnchorRect}
          onViewVersion={(version) => {
            setShowHistory(false);
            setSelectedFormVersion(version);
            setIsReadOnlyView(true);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
