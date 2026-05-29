import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { specialities } from './data/specialities';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbAuthControls as AuthControls } from './components/fbAuthControls';
import { fbDateControl as DateControl } from './components/fbDateControl';
import { fbSCTProcedureSelector as SCTProcedureSelector } from './components/fbSCTProcedureSelector';
import { fbSCTDiagnosis as SCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbMSISelector as MSISelector } from './components/fbMSISelector';
import { fbDraftPopup as DraftPopup } from './components/fbDraftPopup';
import { fbPasswordPopup as PasswordPopup } from './components/fbPasswordPopup';
import { fbFinalControl as FinalControl } from './components/fbFinalControl';
import { OperationNoteRoV } from './OperationNoteRoV';
import { fbSaveCancelButtons as SaveCancelButtons } from './components/fbSaveCancelButtons';
import { fbBottomControlsRow as BottomControlsRow } from './components/fbBottomControlsRow';
import { fbLayout as FbLayout, SectionSpec, areAllSectionsComplete, getSectionStatus as getSectionStatusHelper } from "./components/fbLayout";
import { fbDropdown as FbDropdown } from "./components/fbDropdown";
import { fbAddButton as AddButton } from "./components/fbAddButton";
import { fbTextInput as FbTextInput } from "./components/fbTextInput";
import { fbTextArea as FbTextArea } from "./components/fbTextArea";
import { fbNumberInput as FbNumberInput } from "./components/fbNumberInput";
import { fbTableCell as FbTableCell } from "./components/fbTableCell";
import { fbToolTip as FbToolTip } from "./components/fbToolTip";
import { compareFormStatesObj, cleanArrayOfObjects } from "./utils/formStateUtils";
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Create Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Helper function to format date
const formatDate = (date: Date): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day.toString().padStart(2, '0')}-${month}-${year}`;
};

// Parse server response function (for SNOMED CT and MSI Search)
const parseServerResponse = (text: string): any => {
  let pos = 0;

  const skipWhitespace = () => {
    while (pos < text.length && /\s/.test(text[pos])) {
      pos++;
    }
  };

  const skipMetadata = () => {
    // Skip tokens starting with !: or ~ until next space
    while (pos < text.length && (text.substring(pos, pos + 2) === '!:' || text[pos] === '~')) {
      while (pos < text.length && text[pos] !== ' ' && text[pos] !== '\n') {
        pos++;
      }
      skipWhitespace();
    }
  };

  const parseValue = (): any => {
    skipWhitespace();
    skipMetadata();
    skipWhitespace();

    if (pos >= text.length) return null;

    const char = text[pos];

    // Parse array
    if (char === '[') {
      pos++;
      const arr: any[] = [];
      skipWhitespace();
      skipMetadata(); // Skip any metadata after opening bracket
      skipWhitespace();
      while (pos < text.length && text[pos] !== ']') {
        const value = parseValue();
        if (value !== null && value !== '') {
          arr.push(value);
        }
        skipWhitespace();
        if (text[pos] === ',') pos++; // Skip optional comma
        skipWhitespace();
        skipMetadata(); // Skip metadata between items
        skipWhitespace();
      }
      if (text[pos] === ']') pos++;
      return arr;
    }

    // Parse object
    if (char === '{') {
      pos++;
      const obj: any = {};
      skipWhitespace();
      while (pos < text.length && text[pos] !== '}') {
        // Parse key
        const key = parseKey();
        skipWhitespace();
        if (text[pos] === ':') pos++;
        skipWhitespace();
        // Parse value
        obj[key] = parseValue();
        skipWhitespace();
        if (text[pos] === ',') pos++; // Skip optional comma
        skipWhitespace();
      }
      if (text[pos] === '}') pos++;
      return obj;
    }

    // Parse quoted string
    if (char === '"') {
      pos++;
      let str = '';
      while (pos < text.length && text[pos] !== '"') {
        if (text[pos] === '\\' && pos + 1 < text.length) {
          pos++;
          str += text[pos];
        } else {
          str += text[pos];
        }
        pos++;
      }
      if (text[pos] === '"') pos++;
      return str;
    }

    // Parse number or unquoted string
    let value = '';
    while (pos < text.length && text[pos] !== '\n' && text[pos] !== ',' && text[pos] !== '}' && text[pos] !== ']' && text[pos] !== ':') {
      value += text[pos];
      pos++;
    }
    value = value.trim();

    // Skip trailing newline if present
    if (pos < text.length && text[pos] === '\n') {
      pos++;
    }

    // Try to parse as number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }

    return value;
  };

  const parseKey = (): string => {
    skipWhitespace();
    let key = '';

    // Quoted key
    if (text[pos] === '"') {
      pos++;
      while (pos < text.length && text[pos] !== '"') {
        key += text[pos];
        pos++;
      }
      if (text[pos] === '"') pos++;
      return key;
    }

    // Unquoted key (ends at colon)
    while (pos < text.length && text[pos] !== ':') {
      key += text[pos];
      pos++;
    }
    return key.trim();
  };

  return parseValue();
};

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
  const [implants, setImplants] = React.useState<Array<{id: number, implantId: string, description: string, requiresRemoval: string, removeBy: string}>>([{id: 1, implantId: '', description: '', requiresRemoval: '', removeBy: ''}]);
  const [surgeons, setSurgeons] = React.useState<Array<{id: number, name: string}>>([{id: 1, name: ''}]);
  const [anaesthetists, setAnaesthetists] = React.useState<Array<{id: number, name: string}>>([{id: 1, name: ''}]);
  const [urgencyType, setUrgencyType] = React.useState<string>('');
  const [electiveUrgency, setElectiveUrgency] = React.useState<string>('');
  const [draggedRow, setDraggedRow] = React.useState<number | null>(null);
  const [formChanged, setFormChanged] = React.useState<boolean>(false);
  const [highlySensitive, setHighlySensitive] = React.useState<boolean>(false);
  const [clickedRoVButton, setClickedRoVButton] = React.useState<boolean>(false);
  const [finalChecked, setFinalChecked] = React.useState<boolean>(false);
  const [isReadOnlyView, setIsReadOnlyView] = React.useState<boolean>(() => {
    if (inlineProps) return inlineProps.openInRoV || false;
    const s = location.state as { openInRoV?: boolean } | null;
    return s?.openInRoV || false;
  });
  const [password, setPassword] = React.useState<string>('');
  const [username, setUsername] = React.useState<string>('demoUser');
  const [showDraftPopup, setShowDraftPopup] = React.useState<boolean>(false);
  const [showPasswordPopup, setShowPasswordPopup] = React.useState<boolean>(false);
  const [openedFromPatientRecord, setOpenedFromPatientRecord] = React.useState<boolean>(() => {
    if (inlineProps) return true;
    const s = location.state as { openInRoV?: boolean } | null;
    return !!(s && typeof s.openInRoV !== 'undefined');
  });
  const [activeSection, setActiveSection] = React.useState<string>('section-basic');
  const [activeTooltips, setActiveTooltips] = React.useState<{text: string, x: number, y: number, targetElement: HTMLElement, offsetRight: boolean, showClose: boolean}[]>([]);
  const passwordTimeoutRef = React.useRef<number | null>(null);
  const tooltipTimeoutRef = React.useRef<number | null>(null);
  const tooltipRefs = React.useRef<(HTMLDivElement | null)[]>([]);
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

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormState(prev => ({...prev, [fieldName]: value}));
  };

  const sectionsConfig: SectionSpec[] = [
    {
      id: "section-basic",
      name: "Basic information",
      requiredFields: ['organisation', 'speciality', 'hospital', 'urgency', 'date']
    },
    {
      id: "section-staff",
      name: "Surgeons and anaesthetists",
      requiredFields: ['leadSurgeon', 'surgeonSRC', 'leadAnaesthetist', 'anaesthetistSRC']
    },
    {
      id: "section-prophylaxis",
      name: "Prophylaxis",
    },
    {
      id: "section-procedures",
      name: "Procedures",
    },
    {
      id: "section-detail",
      name: "Detail",
    },
    {
      id: "section-specimens",
      name: "Tissue removed",
    },
    {
      id: "section-images",
      name: "Images",
    },
    {
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
      openInRoV: inlineProps.openInRoV,
      username: username
    } : (location.state as { formUuid?: string; patientUuid?: string; openInRoV?: boolean; username?: string } | null);

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
        const { data: patientData, error: patientError } = await supabase
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
          const { data: formData, error: formError } = await supabase
            .from('operation_notes')
            .select('*')
            .eq('uuid', state.formUuid)
            .order('version', { ascending: false })
            .limit(1)
            .single();

          if (formError) {
            console.error('Error loading form:', formError);
          } else if (formData?.form_data) {
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
            loadedHighlySensitive = formData.form_data.highlySensitive || false;

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

            if (formData.form_status === 'final') {
              loadedFinal = true;
              setFinalChecked(true);
            }
          }
        } else {
          // New form created from patient record
          setOpenedFromPatientRecord(!!(state && typeof state.openInRoV !== 'undefined'));
          const today = formatDate(new Date());
          loadedFormState = {
            organisation: 'cwm-taf',
            hospital: 'princess-wales',
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
  }, [location.state, inlineProps]);

  React.useLayoutEffect(() => {
    if (isReadOnlyView) return;

    const adjustLabelHeights = () => {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        const allLabels = document.querySelectorAll(
          ".edit-view-form .question-container > label:not(.radio-checkbox-item)"
        );
        allLabels.forEach((lbl) => {
          const hElement = lbl as HTMLElement;
          hElement.style.height = "auto";
          hElement.style.paddingTop = "0px";
          hElement.style.display = "block";
        });
        return;
      }

      const rows = document.querySelectorAll(".edit-view-form .questions-row, .edit-view-form .grid");
      rows.forEach((row) => {
        if (!row.querySelector(".question-container")) return;

        const labels = Array.from(
          row.querySelectorAll(
            ".question-container > label:not(.radio-checkbox-item)"
          )
        ) as HTMLElement[];

        const rowLabels = labels.filter((lbl) => {
          let parent = lbl.parentElement;
          while (parent && parent !== row) {
            if (
              parent.classList.contains("subfield") ||
              parent.classList.contains("subfield-wrapper")
            ) {
              return false;
            }
            parent = parent.parentElement;
          }
          return true;
        });

        if (rowLabels.length <= 1) return;

        rowLabels.forEach((lbl) => {
          lbl.style.height = "auto";
          lbl.style.paddingTop = "0px";
          lbl.style.display = "block";
        });

        const heights = rowLabels.map((lbl) => lbl.getBoundingClientRect().height);
        const maxHeight = Math.max(...heights);

        if (maxHeight > 0) {
          rowLabels.forEach((lbl, idx) => {
            const naturalHeight = heights[idx];
            const diff = maxHeight - naturalHeight;
            lbl.style.boxSizing = "border-box";
            lbl.style.height = `${maxHeight}px`;
            lbl.style.paddingTop = `${diff}px`;
            lbl.style.display = "block";
          });
        }
      });
    };

    const timer = setTimeout(adjustLabelHeights, 50);
    window.addEventListener("resize", adjustLabelHeights);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustLabelHeights);
    };
  }, [
    procedures,
    diagnoses,
    specimens,
    implants,
    surgeons,
    anaesthetists,
    urgencyType,
    electiveUrgency,
    isReadOnlyView,
    formState,
  ]);

  React.useLayoutEffect(() => {
    if (isReadOnlyView) return;

    const textareas = document.querySelectorAll(".edit-view-form textarea");
    const listeners: Array<{
      element: HTMLTextAreaElement;
      handler: () => void;
    }> = [];

    textareas.forEach((ta) => {
      const textarea = ta as HTMLTextAreaElement;

      const adjustHeight = () => {
        textarea.style.height = "auto";
        const defaultHeight = 44; // Approx 2 lines
        textarea.style.height = `${Math.max(defaultHeight, textarea.scrollHeight)}px`;
      };

      adjustHeight();

      textarea.addEventListener("input", adjustHeight);
      listeners.push({ element: textarea, handler: adjustHeight });
    });

    return () => {
      listeners.forEach(({ element, handler }) => {
        element.removeEventListener("input", handler);
      });
    };
  }, [procedures, diagnoses, specimens, implants, surgeons, anaesthetists, isReadOnlyView, formState]);

  const showTooltip = (text: string, element: HTMLElement, offsetRight: boolean = false, showClose: boolean = true) => {
    setActiveTooltips([{ text, x: 0, y: 0, targetElement: element, offsetRight, showClose }]);
  };

  const showMultipleTooltips = (tooltips: {text: string, element: HTMLElement, offsetRight?: boolean}[]) => {
    const newTooltips = tooltips.map(({text, element, offsetRight = false}) => {
      return { text, x: 0, y: 0, targetElement: element, offsetRight, showClose: true };
    });

    setActiveTooltips(newTooltips);
  };

  React.useLayoutEffect(() => {
    if (activeTooltips.length > 0 && activeTooltips.some(t => t.x === 0 && t.y === 0)) {
      const updatedTooltips = activeTooltips.map((tooltip, index) => {
        const tooltipElement = tooltipRefs.current[index];
        if (!tooltipElement) return tooltip;

        const rect = tooltip.targetElement.getBoundingClientRect();
        const tooltipHeight = tooltipElement.offsetHeight;

        let x = rect.left;
        let y = rect.top - tooltipHeight - 5; // Position bottom of tooltip 5px above top of element

        if (tooltip.offsetRight) {
          x = rect.right + 10;
          y = rect.bottom + 5;
        }

        // For addressograph tooltips (those without Close button), position below and aligned with left edge
        if (!tooltip.showClose) {
          x = rect.left;
          y = rect.bottom + 5;
        }

        return { ...tooltip, x, y };
      });

      setActiveTooltips(updatedTooltips);
    }
  });

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setActiveTooltips([]);
      tooltipRefs.current = [];
    }, 100);
  };

  const closeTooltip = () => {
    setActiveTooltips([]);
    tooltipRefs.current = [];
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalChecked) {
      setShowDraftPopup(true);
      return;
    }

    if (!password) {
      setShowPasswordPopup(true);
      return;
    }

    // Clear password timeout if pending
    if (passwordTimeoutRef.current !== null) {
      window.clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = null;
    }

    try {
      let formUuid = formState.uuid;
      let version = 0;

      // If editing existing form, get current max version
      if (formUuid) {
        const { data: existingVersions, error: versionError } = await supabase
          .from('operation_notes')
          .select('version')
          .eq('uuid', formUuid)
          .order('version', { ascending: false })
          .limit(1);

        if (versionError) throw versionError;

        if (existingVersions && existingVersions.length > 0) {
          version = existingVersions[0].version + 1;
        }
      } else {
        // New form - generate UUID
        formUuid = crypto.randomUUID();
      }

      // Prepare form data
      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        procedures,
        diagnoses,
        specimens,
        implants,
        surgeons,
        anaesthetists,
        urgencyType,
        electiveUrgency,
        highlySensitive,
        password: password,
        username: username,
        finalChecked: finalChecked
      };

      // Insert new version
      const { error: insertError } = await supabase
        .from('operation_notes')
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          form_status: 'final',
          form_data: formDataToSave
        });

      if (insertError) throw insertError;

      // Also insert into forms_index
      const { error: indexError } = await supabase
        .from('forms_index')
        .insert({
          form_uuid: formUuid,
          form_version: version,
          form_type: 'operation_note',
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          document_datetime: new Date().toISOString(),
          form_status: 'final',
          event_or_document: 'Document'
        });

      if (indexError) throw indexError;

      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        procedures: [...procedures],
        diagnoses: [...diagnoses],
        specimens: [...specimens],
        implants: [...implants],
        surgeons: [...surgeons],
        anaesthetists: [...anaesthetists],
        urgencyType: urgencyType,
        electiveUrgency: electiveUrgency,
        highlySensitive: highlySensitive,
        finalChecked: true
      });

      setFormChanged(false);
      setPassword('');

      navigateBack();
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form: ' + (error as Error).message);
    }
  };

  const handleSaveAsDraft = async () => {
    setShowDraftPopup(false);

    if (!password) {
      setShowPasswordPopup(true);
      return;
    }

    // Clear password timeout if pending
    if (passwordTimeoutRef.current !== null) {
      window.clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = null;
    }

    try {
      let formUuid = formState.uuid;
      let version = 0;

      // If editing existing form, get current max version
      if (formUuid) {
        const { data: existingVersions, error: versionError } = await supabase
          .from('operation_notes')
          .select('version')
          .eq('uuid', formUuid)
          .order('version', { ascending: false })
          .limit(1);

        if (versionError) throw versionError;

        if (existingVersions && existingVersions.length > 0) {
          version = existingVersions[0].version + 1;
        }
      } else {
        // New form - generate UUID
        formUuid = crypto.randomUUID();
      }

      // Prepare form data
      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        procedures,
        diagnoses,
        specimens,
        implants,
        surgeons,
        anaesthetists,
        urgencyType,
        electiveUrgency,
        highlySensitive,
        password: password,
        username: username,
        finalChecked: finalChecked
      };

      // Insert new version
      const { error: insertError } = await supabase
        .from('operation_notes')
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          form_status: 'draft',
          form_data: formDataToSave
        });

      if (insertError) throw insertError;

      // Also insert into forms_index
      const { error: indexError } = await supabase
        .from('forms_index')
        .insert({
          form_uuid: formUuid,
          form_version: version,
          form_type: 'operation_note',
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          document_datetime: new Date().toISOString(),
          form_status: 'draft',
          event_or_document: 'Document'
        });

      if (indexError) throw indexError;

      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        procedures: [...procedures],
        diagnoses: [...diagnoses],
        specimens: [...specimens],
        implants: [...implants],
        surgeons: [...surgeons],
        anaesthetists: [...anaesthetists],
        urgencyType: urgencyType,
        electiveUrgency: electiveUrgency,
        highlySensitive: highlySensitive,
        finalChecked: finalChecked
      });

      setFormChanged(false);
      setPassword('');

      navigateBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft: ' + (error as Error).message);
    }
  };

  // Auto-resize textarea
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Set default values and track active section
  React.useEffect(() => {
    const today = formatDate(new Date());
    setFormState(prev => ({
      ...prev,
      organisation: 'cwm-taf',
      hospital: 'princess-wales',
      date: today
    }));

    // Track active section on scroll and hide tooltips
    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    const handleScroll = () => {
      // Hide tooltips on scroll
      setActiveTooltips([]);

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
    const newId = Math.max(...procedures.map(p => p.id)) + 1;
    setProcedures([...procedures, {id: newId, side: '', procedure: '', additionalInfo: ''}]);
  };

  const deleteProcedureRow = (id: number) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter(p => p.id !== id));
    }
  };

  const updateProcedure = (id: number, field: string, value: string) => {
    setProcedures(procedures.map(p => p.id === id ? {...p, [field]: value} : p));
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
    const newId = Math.max(...diagnoses.map(d => d.id)) + 1;
    setDiagnoses([...diagnoses, {id: newId, diagnosis: ''}]);
  };

  const deleteDiagnosis = (id: number) => {
    if (diagnoses.length > 1) {
      setDiagnoses(diagnoses.filter(d => d.id !== id));
    }
  };

  const updateDiagnosis = (id: number, value: string) => {
    setDiagnoses(diagnoses.map(d => d.id === id ? {...d, diagnosis: value} : d));
  };

  // Specimen functions
  const addSpecimen = () => {
    const newId = Math.max(...specimens.map(s => s.id)) + 1;
    setSpecimens([...specimens, {id: newId, label: '', description: ''}]);
  };

  const deleteSpecimen = (id: number) => {
    if (specimens.length > 1) {
      setSpecimens(specimens.filter(s => s.id !== id));
    }
  };

  const updateSpecimen = (id: number, field: string, value: string) => {
    setSpecimens(specimens.map(s => s.id === id ? {...s, [field]: value} : s));
  };

  // Implant functions
  const addImplant = () => {
    const newId = Math.max(...implants.map(i => i.id)) + 1;
    setImplants([...implants, {id: newId, implantId: '', description: '', requiresRemoval: '', removeBy: ''}]);
  };

  const deleteImplant = (id: number) => {
    if (implants.length > 1) {
      setImplants(implants.filter(i => i.id !== id));
    }
  };

  const updateImplant = (id: number, field: string, value: string) => {
    setImplants(implants.map(i => i.id === id ? {...i, [field]: value} : i));
  };

  // Surgeon functions
  const addSurgeon = () => {
    const newId = Math.max(...surgeons.map(s => s.id)) + 1;
    setSurgeons([...surgeons, {id: newId, name: ''}]);
  };

  const deleteSurgeon = (id: number) => {
    if (surgeons.length > 1) {
      setSurgeons(surgeons.filter(s => s.id !== id));
    }
  };

  const updateSurgeon = (id: number, value: string, coded?: boolean) => {
    setSurgeons(surgeons.map(s => s.id === id ? {...s, name: value, coded} : s));
  };

  // Anaesthetist functions
  const addAnaesthetist = () => {
    const newId = Math.max(...anaesthetists.map(a => a.id)) + 1;
    setAnaesthetists([...anaesthetists, {id: newId, name: '', coded: false}]);
  };

  const deleteAnaesthetist = (id: number) => {
    if (anaesthetists.length > 1) {
      setAnaesthetists(anaesthetists.filter(a => a.id !== id));
    }
  };

  const updateAnaesthetist = (id: number, value: string, coded?: boolean) => {
    setAnaesthetists(anaesthetists.map(a => a.id === id ? {...a, name: value, coded} : a));
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
          onSwitchToEV={() => setIsReadOnlyView(false)}
          onBack={navigateBack}
        />
      ) : (
        <div className="bg-white flex flex-col" style={{height: '100vh', fontFamily: "'Roboto', sans-serif", fontWeight: 300, lineHeight: 1.2}}>
          <style>{`
            .bottom-control-btn-rov,
            .bottom-control-item,
            .bottom-control-username,
            .bottom-control-password,
            .bottom-control-final,
            .bottom-control-btn-save,
            .bottom-control-btn-cancel {
              transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            }

            .bottom-control-btn-rov:hover,
            .bottom-control-btn-rov:focus {
              background-color: #fee715 !important;
              color: black !important;
            }

            .bottom-control-item {
              transition: background-color 0.2s ease, color 0.2s ease;
            }

            .bottom-control-item:hover,
            .bottom-control-item:focus-within {
              background-color: #fee715 !important;
              color: black !important;
            }

            .bottom-control-username:hover,
            .bottom-control-username:focus,
            .bottom-control-password:hover,
            .bottom-control-password:focus {
              background-color: #fee715 !important;
              color: black !important;
            }

            .bottom-control-final:not(.disabled):focus-within {
              background-color: #fee715 !important;
              color: black !important;
            }

            .bottom-control-final:not(.disabled):hover {
              background-color: #fee715 !important;
              color: black !important;
            }

            .bottom-control-btn-save:not(:disabled):hover,
            .bottom-control-btn-save:not(:disabled):focus {
              background-color: #fee715 !important;
              color: black !important;
            }

            .bottom-control-btn-cancel:hover,
            .bottom-control-btn-cancel:focus {
              background-color: #fee715 !important;
              color: black !important;
            }

            .add-procedure-btn,
            .add-procedure-button {
              transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            }

            .add-procedure-btn:hover,
            .add-procedure-btn:focus-visible,
            .add-procedure-button:hover,
            .add-procedure-button:focus-visible {
              background-color: #fee715 !important;
              color: black !important;
              border-color: #fee715 !important;
            }

            .edit-view-form input:not([type="radio"]):not([type="checkbox"]),
            .edit-view-form select,
            .edit-view-form textarea,
            .edit-view-form .msi-selector-input,
            .edit-view-form .sct-procedure-selector-input,
            .edit-view-form .date-control-input,
            .edit-view-form input.border {
              border: 0.1rem solid silver !important;
              border-radius: 0.4rem !important;
              background-color: white !important;
              padding-top: 0.2rem !important;
              padding-bottom: 0.2rem !important;
              box-sizing: border-box !important;
            }
            .edit-view-form input:not([type="radio"]):not([type="checkbox"]):hover,
            .edit-view-form select:hover,
            .edit-view-form textarea:hover {
              background-color: white !important;
            }
            .edit-view-form input:not([type="radio"]):not([type="checkbox"]):focus,
            .edit-view-form select:focus,
            .edit-view-form textarea:focus,
            .edit-view-form input.border:focus,
            .edit-view-form .hideBorderInRoV:focus {
              background-color: white !important;
              outline: none !important;
              border-color: silver !important;
              border: 0.1rem solid silver !important;
              box-shadow: none !important;
            }

            .edit-view-form table th {
              font-family: 'Roboto', sans-serif !important;
              font-size: 0.8rem !important;
              font-style: italic !important;
              font-weight: 300 !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
              box-sizing: border-box !important;
            }

            .edit-view-form .input-with-units {
              border: 0.1rem solid silver !important;
              border-radius: 0.4rem !important;
              height: 2.0rem !important;
              overflow: hidden;
            }
            .edit-view-form .input-with-units input,
            .edit-view-form .input-with-units input:not([type="radio"]):not([type="checkbox"]) {
              border: none !important;
              border-width: 0px !important;
              outline: none !important;
              height: 100% !important;
              padding-top: 0.2rem !important;
              padding-bottom: 0.2rem !important;
            }

            .edit-view-form textarea {
              overflow: hidden !important;
              resize: none !important;
            }

            .subfield-wrapper,
            .edit-view-form .subfield-wrapper,
            .edit-view-form .radio-checkbox-item {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
              box-sizing: border-box !important;
            }

            .edit-view-form h3 {
              font-weight: 500 !important;
              font-size: 1rem !important;
              line-height: 1.1rem !important;
              padding: 0.2rem 0.2rem 0.2rem 0.4rem !important;
              margin: 0 !important;
              background-color: rgb(27, 110, 194) !important;
            }
            .nav-section-name {
              font-weight: 500 !important;
              font-size: 1rem !important;
              line-height: 1.1rem !important;
              padding: 0.2rem 0.2rem 0.2rem 0.4rem !important;
              height: auto !important;
            }
            .nav-counter-box {
              font-weight: 500 !important;
              font-size: 1rem !important;
              line-height: 1.1rem !important;
              padding: 0.2rem 0.2rem 0.2rem 0.4rem !important;
              height: auto !important;
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
                    crn={patient.crn}
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
              onCancel={() => {
                const s = location.state as { formUuid?: string } | null;
                const isEditOfExisting = s?.formUuid || inlineProps?.formUuid;
                if (isEditOfExisting) {
                  setIsReadOnlyView(true);
                } else {
                  navigateBack();
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
                    options={[
                      { value: "aneurin-bevan", label: "Aneurin Bevan" },
                      { value: "betsi-cadwaladr", label: "Betsi Cadwaladr" },
                      { value: "cardiff-vale", label: "Cardiff & Vale" },
                      { value: "cwm-taf", label: "Cwm Taf Morgannwg" },
                      { value: "hywel-dda", label: "Hywel Dda" },
                      { value: "powys", label: "Powys" },
                      { value: "swansea-bay", label: "Swansea Bay" },
                      { value: "velindre", label: "Velindre" },
                    ]}
                  />

                  <FbDropdown
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
                    options={[
                      { value: "prince-charles", label: "Prince Charles Hospital, Merthyr Tydfil" },
                      { value: "royal-glamorgan", label: "Royal Glamorgan Hospital, Llantrisant" },
                      { value: "princess-wales", label: "Princess of Wales Hospital, Bridgend" },
                    ]}
                  />
                  <div className="space-y-2 question-container">
                    {/* Empty cell for grid alignment */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{marginTop: '0.6rem'}}>
                  <div className="space-y-2 question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}}>Urgency <span style={{color: '#d50000'}}>*</span></label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 radio-checkbox-item">
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
                        <div className="subfield pl-6 space-y-2 mt-1">
                          <label className="flex items-center gap-2 radio-checkbox-item">
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
                          <label className="flex items-center gap-2 radio-checkbox-item">
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
                            className="flex items-center gap-2 radio-checkbox-item"
                            onMouseEnter={(e) => showMultipleTooltips([{text: 'Urgent Suspected Cancer', element: e.currentTarget, offsetRight: true}])}
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
                              onFocus={(e) => showMultipleTooltips([{text: 'Urgent Suspected Cancer', element: e.currentTarget.parentElement as HTMLElement, offsetRight: true}])}
                              onBlur={hideTooltip}
                            />
                            <span style={{fontWeight: 300}}>USC</span>
                          </label>
                        </div>
                      )}
                      <label className="flex items-center gap-2 radio-checkbox-item">
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
                  <div className="space-y-2 question-container">
                    <label
                      className="font-medium"
                      style={{fontWeight: 500, fontSize: '1rem'}}
                      htmlFor="date"
                      onMouseEnter={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onBlur={hideTooltip}
                      tabIndex={0}
                    >
                      Date <span style={{color: '#d50000'}}>*</span>
                    </label>
                    <DateControl
                      name="date"
                      value={formState.date || ''}
                      onChange={(value) => handleFieldChange('date', value)}
                      placeholder="dd-Mmm-yyyy"
                      onFocus={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onBlur={hideTooltip}
                      required
                    />
                  </div>
                  <div className="space-y-2 question-container">
                    <label
                      className="font-medium"
                      style={{fontWeight: 500, fontSize: '1rem'}}
                      htmlFor="startTime"
                      onMouseEnter={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onBlur={hideTooltip}
                      tabIndex={0}
                    >
                      Start
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      onFocus={(e) => showTooltip('Knife to skin', e.currentTarget)}
                      onBlur={hideTooltip}
                      name="startTime"
                      className="w-full border rounded p-2"
                      value={formState.startTime || ''}
                      onChange={(e) => handleFieldChange('startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 question-container">
                    <label
                      className="font-medium"
                      style={{fontWeight: 500, fontSize: '1rem'}}
                      htmlFor="endTime"
                      onMouseEnter={(e) => showTooltip('Dressings applied', e.currentTarget)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e) => showTooltip('Dressings applied', e.currentTarget)}
                      onBlur={hideTooltip}
                      tabIndex={0}
                    >
                      End
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      className="w-full border rounded p-2"
                      value={formState.endTime || ''}
                      onChange={(e) => handleFieldChange('endTime', e.target.value)}
                      onFocus={(e) => showTooltip('Dressings applied', e.currentTarget)}
                      onBlur={hideTooltip}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Surgeons and anaesthetists */}
            <div id="section-staff">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Surgeons and anaesthetists</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}}>Surgeons</label>
                    <div className="space-y-2">
                      <div className="subfield" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="msi-selector-label-subfield">Lead operating surgeon <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="leadSurgeon"
                          value={formState.leadSurgeon || ''}
                          coded={formState.leadSurgeon_coded}
                          onChange={(value, coded) => {
                            handleFieldChange('leadSurgeon', value);
                            handleFieldChange('leadSurgeon_coded', coded);
                          }}
                          required
                        />
                      </div>
                      {surgeons.map((surgeon, index) => (
                        <div key={surgeon.id} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                          <div style={{flex: 1, padding: '0.2rem', borderRadius: '0.4rem'}} className="subfield">
                            <div className="msi-selector-label-subfield">
                              {index === 0 ? 'Second surgeon' : index === 1 ? 'Third surgeon' : `Surgeon ${index + 2}`}
                            </div>
                            <MSISelector
                              name={`surgeon${index}`}
                              value={surgeon.name}
                              coded={surgeon.coded}
                              onChange={(value, coded) => updateSurgeon(surgeon.id, value, coded)}
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
                      <div style={{marginTop: '0.6rem', padding: '0.2rem', borderRadius: '0.4rem'}} className="subfield">
                        <div className="msi-selector-label-subfield">Supervising surgeon present</div>
                        <MSISelector
                          name="supervisingSurgeon"
                          value={formState.supervisingSurgeon || ''}
                          coded={formState.supervisingSurgeon_coded}
                          onChange={(value, coded) => {
                            handleFieldChange('supervisingSurgeon', value);
                            handleFieldChange('supervisingSurgeon_coded', coded);
                          }}
                        />
                      </div>
                      <div className="subfield" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="msi-selector-label-subfield">SRC <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="surgeonSRC"
                          value={formState.surgeonSRC || ''}
                          coded={formState.surgeonSRC_coded}
                          onChange={(value, coded) => {
                            handleFieldChange('surgeonSRC', value);
                            handleFieldChange('surgeonSRC_coded', coded);
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}}>Anaesthetists</label>
                    <div className="space-y-2">
                      <div className="subfield" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="msi-selector-label-subfield">Lead anaesthetist <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="leadAnaesthetist"
                          value={formState.leadAnaesthetist || ''}
                          coded={formState.leadAnaesthetist_coded}
                          onChange={(value, coded) => {
                            handleFieldChange('leadAnaesthetist', value);
                            handleFieldChange('leadAnaesthetist_coded', coded);
                          }}
                          required
                        />
                      </div>
                      {anaesthetists.map((anaesthetist, index) => (
                        <div key={anaesthetist.id} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                          <div style={{flex: 1, padding: '0.2rem', borderRadius: '0.4rem'}} className="subfield">
                            <div className="msi-selector-label-subfield">
                              {index === 0 ? 'Second anaesthetist' : index === 1 ? 'Third anaesthetist' : `Anaesthetist ${index + 2}`}
                            </div>
                            <MSISelector
                              name={`anaesthetist${index}`}
                              value={anaesthetist.name}
                              coded={anaesthetist.coded}
                              onChange={(value, coded) => updateAnaesthetist(anaesthetist.id, value, coded)}
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
                      <div style={{marginTop: '0.6rem', padding: '0.2rem', borderRadius: '0.4rem'}} className="subfield">
                        <div className="msi-selector-label-subfield">Supervising anaesthetist present</div>
                        <MSISelector
                          name="supervisingAnaesthetist"
                          value={formState.supervisingAnaesthetist || ''}
                          coded={formState.supervisingAnaesthetist_coded}
                          onChange={(value, coded) => {
                            handleFieldChange('supervisingAnaesthetist', value);
                            handleFieldChange('supervisingAnaesthetist_coded', coded);
                          }}
                        />
                      </div>
                      <div className="subfield" style={{padding: '0.2rem', borderRadius: '0.4rem'}}>
                        <div className="msi-selector-label-subfield">SRC <span style={{color: '#d50000'}}>*</span></div>
                        <MSISelector
                          name="anaesthetistSRC"
                          value={formState.anaesthetistSRC || ''}
                          coded={formState.anaesthetistSRC_coded}
                          onChange={(value, coded) => {
                            handleFieldChange('anaesthetistSRC', value);
                            handleFieldChange('anaesthetistSRC_coded', coded);
                          }}
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
                  <div className="space-y-2 question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="antibioticProphylaxis">Antibiotic prophylaxis</label>
                    <textarea
                      id="antibioticProphylaxis"
                      name="antibioticProphylaxis"
                      className="w-full border rounded p-2"
                      value={formState.antibioticProphylaxis || ''}
                      onChange={(e) => handleFieldChange('antibioticProphylaxis', e.target.value)}
                      onInput={handleTextareaInput}
                      rows={1}
                      style={{minHeight: '2.4rem', overflow: 'hidden', resize: 'none'}}
                    />
                  </div>
                  <div className="space-y-2 question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="vteProphylaxis">Venous thromboembolism prophylaxis</label>
                    <textarea
                      id="vteProphylaxis"
                      name="vteProphylaxis"
                      className="w-full border rounded p-2"
                      value={formState.vteProphylaxis || ''}
                      onChange={(e) => handleFieldChange('vteProphylaxis', e.target.value)}
                      onInput={handleTextareaInput}
                      rows={1}
                      style={{minHeight: '2.4rem', overflow: 'hidden', resize: 'none'}}
                    />
                  </div>
                  <div className="space-y-2 question-container">
                    <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="otherMedication">Other</label>
                    <textarea
                      id="otherMedication"
                      name="otherMedication"
                      className="w-full border rounded p-2"
                      value={formState.otherMedication || ''}
                      onChange={(e) => handleFieldChange('otherMedication', e.target.value)}
                      onInput={handleTextareaInput}
                      rows={1}
                      style={{minHeight: '2.4rem', overflow: 'hidden', resize: 'none'}}
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
                  <table className="w-full" style={{backgroundColor: 'white'}}>
                    <thead>
                      <tr style={{backgroundColor: 'white'}}>
                        <th className="p-2 text-left w-8" style={{borderBottom: '1px solid silver', verticalAlign: 'bottom'}}></th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', verticalAlign: 'bottom'}}>Side</th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', verticalAlign: 'bottom'}}>Procedure</th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', verticalAlign: 'bottom'}}>Additional information</th>
                        <th className="p-2 w-8" style={{borderBottom: '1px solid silver', verticalAlign: 'bottom'}}></th>
                      </tr>
                    </thead>
                    <tbody id="proceduresTableBody">
                      {(procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === '')) && (
                        <tr>
                          <td colSpan={5} className="p-2" style={{fontSize: '0.8rem', fontWeight: 500, fontStyle: 'italic', color: '#d50000', borderBottom: '1px solid silver'}}>
                            Enter at least one procedure
                          </td>
                        </tr>
                      )}
                      {procedures.map((proc, index) => (
                        <tr
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
                            <select
                                className="w-full border rounded p-1"
                                value={proc.side}
                                onChange={(e) => updateProcedure(proc.id, 'side', e.target.value)}
                              >
                                <option value="">Select side</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="bilateral">Bilateral</option>
                                <option value="na">Not applicable</option>
                              </select>
                          </FbTableCell>
                          <FbTableCell>
                            <SCTProcedureSelector
                              name={`procedure${proc.id}`}
                              value={proc.procedure}
                              onChange={(value) => updateProcedure(proc.id, 'procedure', value)}
                              placeholder="Enter procedure"
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <input
                              type="text"
                              className="w-full border rounded p-1"
                              placeholder="Additional info"
                              value={proc.additionalInfo}
                              onChange={(e) => updateProcedure(proc.id, 'additionalInfo', e.target.value)}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="indication">Indication</label>
                  <textarea
                    id="indication"
                    name="indication"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.indication || ''}
                    onChange={(e) => handleFieldChange('indication', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="incision">Incision</label>
                  <textarea
                    id="incision"
                    name="incision"
                    rows={2}
                    className="w-full border rounded p-2"
                    value={formState.incision || ''}
                    onChange={(e) => handleFieldChange('incision', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="findings">Findings</label>
                  <textarea
                    id="findings"
                    name="findings"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.findings || ''}
                    onChange={(e) => handleFieldChange('findings', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>

                {/* Operative diagnoses table */}
                <div className="space-y-2 question-container">
                  <label
                    className="font-medium"
                    style={{fontWeight: 500, fontSize: '1rem'}}
                    onMouseEnter={(e) => showTooltip('if different', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip('if different', e.currentTarget)}
                    onBlur={hideTooltip}
                    tabIndex={0}
                  >
                    Operative diagnoses
                  </label>
                  <div style={{fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.4rem'}}>if different</div>
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{backgroundColor: 'white'}}>
                      <tbody>
                        {diagnoses.map((diag, index) => (
                          <tr
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <AddButton
                  label="Add operative diagnosis"
                  onClick={addDiagnosis}
                />

                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="procedureDescription">Procedure description</label>
                  <textarea
                    id="procedureDescription"
                    name="procedureDescription"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.procedureDescription || ''}
                    onChange={(e) => handleFieldChange('procedureDescription', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="extraProcedures">Extra procedures undertaken</label>
                  <textarea
                    id="extraProcedures"
                    name="extraProcedures"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.extraProcedures || ''}
                    onChange={(e) => handleFieldChange('extraProcedures', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="bloodLoss">Estimated blood loss</label>
                  <div className="input-with-units" style={{width: 'auto', maxWidth: '10rem'}}>
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
                    <span className="unit-value-display boldInRoV" style={{display: 'none', fontWeight: 500}}></span>
                    <span className="unit-label">ml</span>
                  </div>
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="problems">Specific surgical intraoperative problems encountered</label>
                  <textarea
                    id="problems"
                    name="problems"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.problems || ''}
                    onChange={(e) => handleFieldChange('problems', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="closure">Closure</label>
                  <textarea
                    id="closure"
                    name="closure"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.closure || ''}
                    onChange={(e) => handleFieldChange('closure', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="postOpInstructions">Post-op instructions</label>
                  <textarea
                    id="postOpInstructions"
                    name="postOpInstructions"
                    rows={4}
                    className="w-full border rounded p-2"
                    value={formState.postOpInstructions || ''}
                    onChange={(e) => handleFieldChange('postOpInstructions', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className="space-y-2 question-container">
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem'}} htmlFor="followUp">Follow-up</label>
                  <textarea
                    id="followUp"
                    name="followUp"
                    rows={2}
                    className="w-full border rounded p-2"
                    value={formState.followUp || ''}
                    onChange={(e) => handleFieldChange('followUp', e.target.value)}
                    onInput={handleTextareaInput}
                    style={{overflow: 'hidden', resize: 'none'}}
                  />
                </div>
              </div>
            </div>

            {/* Tissue removed */}
            <div id="section-specimens">
              <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Tissue removed and pathological specimens</h3>
              <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{backgroundColor: 'white'}}>
                    <thead>
                      <tr>
                        <th className="p-2 w-8" style={{borderBottom: '1px solid silver', verticalAlign: 'bottom'}}></th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', width: '3%', verticalAlign: 'bottom'}}>A, B, C</th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', verticalAlign: 'bottom'}}>Description</th>
                        <th className="p-2 w-8" style={{borderBottom: '1px solid silver', verticalAlign: 'bottom'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {specimens.map((spec, index) => (
                        <tr
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
                            <input
                              type="text"
                              className="border rounded p-1"
                              style={{width: '3rem'}}
                              value={spec.label}
                              onChange={(e) => updateSpecimen(spec.id, 'label', e.target.value)}
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <textarea
                              className="w-full border rounded p-1"
                              rows={1}
                              value={spec.description}
                              onChange={(e) => updateSpecimen(spec.id, 'description', e.target.value)}
                              onInput={handleTextareaInput}
                              style={{minHeight: '2rem', overflow: 'hidden', resize: 'none'}}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="hideInRoV" style={{fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.4rem'}}>Include implanted tissue and organs here</div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{backgroundColor: 'white', tableLayout: 'auto'}}>
                    <thead>
                      <tr>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', width: '1%', whiteSpace: 'nowrap', verticalAlign: 'bottom'}}>Implant Id</th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', verticalAlign: 'bottom'}}>Type / description</th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', width: '1%', verticalAlign: 'bottom'}}>Does this implant require exchange or removal?</th>
                        <th className="p-2 text-left" style={{fontSize: '0.6rem', fontStyle: 'italic', fontWeight: 300, borderBottom: '1px solid silver', width: '12rem', verticalAlign: 'bottom'}}>Remove by</th>
                        <th className="p-2" style={{borderBottom: '1px solid silver', width: '1%', verticalAlign: 'bottom'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {implants.map((impl) => (
                        <tr key={impl.id}>
                          <FbTableCell style={{width: '9rem', whiteSpace: 'nowrap'}}>
                            <input
                              type="text"
                              className="border rounded p-1"
                              value={impl.implantId}
                              onChange={(e) => updateImplant(impl.id, 'implantId', e.target.value)}
                              style={{width: '8rem'}}
                            />
                          </FbTableCell>
                          <FbTableCell>
                            <textarea
                              className="w-full border rounded p-1"
                              rows={1}
                              value={impl.description}
                              onChange={(e) => updateImplant(impl.id, 'description', e.target.value)}
                              onInput={handleTextareaInput}
                              style={{minHeight: '2rem', overflow: 'hidden', resize: 'none'}}
                            />
                          </FbTableCell>
                          <FbTableCell style={{width: '1%'}}>
                            <div className="space-y-2">
                              <label className="radio-checkbox-item flex items-center gap-2" style={{fontSize: '0.9rem', whiteSpace: 'nowrap'}}>
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
                              <label className="radio-checkbox-item flex items-center gap-2" style={{fontSize: '0.9rem', whiteSpace: 'nowrap'}}>
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
                                <DateControl
                                  name={`removeBy${impl.id}`}
                                  value={impl.removeBy}
                                  onChange={(value) => updateImplant(impl.id, 'removeBy', value)}
                                  placeholder="dd-Mmm-yyyy"
                                  required={impl.requiresRemoval === 'yes'}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              onClose={() => setShowPasswordPopup(false)}
            />
          )}

          {/* Tooltips */}
          {activeTooltips.map((tooltip, index) => (
            <FbToolTip
              key={index}
              innerRef={(el) => { tooltipRefs.current[index] = el; }}
              x={tooltip.x}
              y={tooltip.y}
              text={tooltip.text}
              showClose={tooltip.showClose}
              onClose={closeTooltip}
              onMouseEnter={() => {
                if (tooltipTimeoutRef.current) {
                  clearTimeout(tooltipTimeoutRef.current);
                }
              }}
              onMouseLeave={hideTooltip}
            />
          ))}

        </div>
      </FbLayout>
    </div>
  )}
</>
  );
}
