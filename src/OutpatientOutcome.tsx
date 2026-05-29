import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbAuthControls as AuthControls } from './components/fbAuthControls';
import { fbDateControl as DateControl } from './components/fbDateControl';
import { fbSCTDiagnosis as SCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbDraftPopup as DraftPopup } from './components/fbDraftPopup';
import { fbPasswordPopup as PasswordPopup } from './components/fbPasswordPopup';
import { fbFinalControl as FinalControl } from './components/fbFinalControl';
import { OutpatientOutcomeRoV } from './OutpatientOutcomeRoV';
import { fbSaveCancelButtons as SaveCancelButtons } from './components/fbSaveCancelButtons';
import { fbBottomControlsRow as BottomControlsRow } from './components/fbBottomControlsRow';
import { fbDropdown as FbDropdown } from './components/fbDropdown';
import { fbTextInput as FbTextInput } from './components/fbTextInput';
import { fbTextArea as FbTextArea } from './components/fbTextArea';
import { fbNumberInput as FbNumberInput } from './components/fbNumberInput';
import { fbLayout as FbLayout } from './components/fbLayout';
import { fbToolTip as FbToolTip } from './components/fbToolTip';
import { compareFormStatesObj } from './utils/formStateUtils';
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
  appointmentUuid?: string;
  openInRoV?: boolean;
  onClose: () => void;
}

export default function OutpatientOutcome({ inlineProps }: { inlineProps?: InlineProps } = {}) {
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

  const [formState, setFormState] = React.useState<Record<string, any>>({
    organisation: 'Cwm Taf Morgannwg',
    speciality: 'Urology',
    site: 'Princess of Wales Hospital',
    seniorClinician: 'HURLE, Rhidian A, Mr (GMC:567890)',
    clinicName: 'General urology',
    date: '12-Jul-2024',
    time: '09:45',
    attendedOption: 'attended'
  });

  // Outcome checkbox states
  const [discharged, setDischarged] = React.useState<boolean>(false);
  const [sos, setSos] = React.useState<boolean>(false);
  const [pifu, setPifu] = React.useState<boolean>(false);
  const [remoteMonitoring, setRemoteMonitoring] = React.useState<boolean>(false);
  const [testsReq, setTestsReq] = React.useState<boolean>(false);
  const [waitListed, setWaitListed] = React.useState<boolean>(false);
  const [oprxPlanned, setOprxPlanned] = React.useState<boolean>(false);
  const [admitted, setAdmitted] = React.useState<boolean>(false);
  const [mdtReview, setMdtReview] = React.useState<boolean>(false);
  const [rxGiven, setRxGiven] = React.useState<boolean>(false);
  const [refToTherapies, setRefToTherapies] = React.useState<boolean>(false);
  const [refToConsultant, setRefToConsultant] = React.useState<boolean>(false);
  const [fuOPA, setFuOPA] = React.useState<boolean>(false);

  const [formChanged, setFormChanged] = React.useState<boolean>(false);
  const [finalChecked, setFinalChecked] = React.useState<boolean>(false);
  const [isReadOnlyView, setIsReadOnlyView] = React.useState<boolean>(() => {
    if (inlineProps) return inlineProps.openInRoV || false;
    const s = location.state as { openInRoV?: boolean } | null;
    return s?.openInRoV || false;
  });
  const [highlySensitive, setHighlySensitive] = React.useState<boolean>(false);
  const [clickedRoVButton, setClickedRoVButton] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>('demoUser');
  const [password, setPassword] = React.useState<string>('');
  const [appointmentUuid, setAppointmentUuid] = React.useState<string | null>(null);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [showDraftPopup, setShowDraftPopup] = React.useState<boolean>(false);
  const [showPasswordPopup, setShowPasswordPopup] = React.useState<boolean>(false);
  const [openedFromPatientRecord, setOpenedFromPatientRecord] = React.useState<boolean>(() => {
    if (inlineProps) return true;
    const s = location.state as { openInRoV?: boolean } | null;
    return !!(s && typeof s.openInRoV !== 'undefined');
  });
  const [activeTooltips, setActiveTooltips] = React.useState<{text: string, x: number, y: number, targetElement: HTMLElement, offsetRight: boolean, showClose: boolean}[]>([]);
  const passwordTimeoutRef = React.useRef<number | null>(null);
  const tooltipTimeoutRef = React.useRef<number | null>(null);
  const tooltipRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const [initialSnapshot, setInitialSnapshot] = React.useState<{
    formState: any;
    discharged: boolean;
    sos: boolean;
    pifu: boolean;
    remoteMonitoring: boolean;
    testsReq: boolean;
    waitListed: boolean;
    oprxPlanned: boolean;
    admitted: boolean;
    mdtReview: boolean;
    rxGiven: boolean;
    refToTherapies: boolean;
    refToConsultant: boolean;
    fuOPA: boolean;
    highlySensitive: boolean;
    finalChecked: boolean;
  } | null>(null);

  const isStateEqual = (stateA: any, stateB: any) => {
    if (!stateA || !stateB) return false;
    return compareFormStatesObj(stateA.formState, stateB.formState) &&
           !!stateA.discharged === !!stateB.discharged &&
           !!stateA.sos === !!stateB.sos &&
           !!stateA.pifu === !!stateB.pifu &&
           !!stateA.remoteMonitoring === !!stateB.remoteMonitoring &&
           !!stateA.testsReq === !!stateB.testsReq &&
           !!stateA.waitListed === !!stateB.waitListed &&
           !!stateA.oprxPlanned === !!stateB.oprxPlanned &&
           !!stateA.admitted === !!stateB.admitted &&
           !!stateA.mdtReview === !!stateB.mdtReview &&
           !!stateA.rxGiven === !!stateB.rxGiven &&
           !!stateA.refToTherapies === !!stateB.refToTherapies &&
           !!stateA.refToConsultant === !!stateB.refToConsultant &&
           !!stateA.fuOPA === !!stateB.fuOPA &&
           !!stateA.highlySensitive === !!stateB.highlySensitive &&
           !!stateA.finalChecked === !!stateB.finalChecked;
  };

  React.useEffect(() => {
    if (initialSnapshot) {
      const changed = !isStateEqual(initialSnapshot, {
        formState,
        discharged,
        sos,
        pifu,
        remoteMonitoring,
        testsReq,
        waitListed,
        oprxPlanned,
        admitted,
        mdtReview,
        rxGiven,
        refToTherapies,
        refToConsultant,
        fuOPA,
        highlySensitive,
        finalChecked,
      });
      setFormChanged(changed);
    }
  }, [
    initialSnapshot,
    formState,
    discharged,
    sos,
    pifu,
    remoteMonitoring,
    testsReq,
    waitListed,
    oprxPlanned,
    admitted,
    mdtReview,
    rxGiven,
    refToTherapies,
    refToConsultant,
    fuOPA,
    highlySensitive,
    finalChecked,
  ]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormState(prev => ({...prev, [fieldName]: value}));
    setFormChanged(true);
  };

  const areRequiredFieldsComplete = () => {
    // Check attended option is selected
    if (!formState.attendedOption) return false;

    // If attended, check USC is selected
    if (formState.attendedOption === 'attended' && !formState.usc) return false;

    // Check outcome has at least one option selected
    const hasOutcome = discharged || sos || pifu || formState.remoteMonitoring || testsReq ||
                       waitListed || oprxPlanned || admitted || formState.mdtReview || rxGiven ||
                       formState.stopRefClock || refToTherapies || refToConsultant || fuOPA;

    return formState.attendedOption === 'attended' ? hasOutcome : true;
  };

  // Outcome checkbox enable/disable logic
  const isOutcomeCheckboxDisabled = (checkboxName: string): boolean => {
    // Tier 1: discharged, sos, pifu
    const tier1Checked = discharged || sos || pifu;

    // Tier 2: remoteMonitoring, testsReq, waitListed, oprxPlanned, admitted, mdtReview, fuOPA
    const tier2Checked = formState.remoteMonitoring || testsReq || waitListed || oprxPlanned ||
                         admitted || formState.mdtReview || fuOPA;

    // Tier 1 checkboxes: each is disabled if any OTHER Tier 1 is checked OR if any Tier 2 is checked
    if (checkboxName === 'discharge') return sos || pifu || tier2Checked;
    if (checkboxName === 'sos') return discharged || pifu || tier2Checked;
    if (checkboxName === 'pifu') return discharged || sos || tier2Checked;

    // Tier 2 checkboxes: disabled if any Tier 1 is checked
    if (['remoteMonitoring', 'testsReq', 'waitingList', 'oprxPlanned', 'admitted', 'mdtReview', 'fuOPA'].includes(checkboxName)) {
      return tier1Checked;
    }

    // Always enabled: rxGiven, stopRefClock, refToTherapies, refToConsultant
    return false;
  };

  // Load form and patient data when opened from patient record
  React.useEffect(() => {
    const state = inlineProps ? {
      patientUuid: inlineProps.patientUuid,
      formUuid: inlineProps.formUuid,
      appointmentUuid: inlineProps.appointmentUuid,
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

    setOpenedFromPatientRecord(!!inlineProps || !!(state && typeof state.openInRoV !== 'undefined'));

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

        let loadedFormState = formState;
        let loadedDischarged = false;
        let loadedSos = false;

        // Fetch patient's appointments first so we can use them to list
        const { data: appsData } = await supabase
          .from('outpatient_appointments')
          .select('*')
          .eq('patient_uuid', state.patientUuid);
        setAppointments(appsData || []);

        let currentAppUuid = state && 'appointmentUuid' in state ? (state as any).appointmentUuid : null;
        let loadedPifu = false;
        let loadedRemote = false;
        let loadedTests = false;
        let loadedWait = false;
        let loadedOprx = false;
        let loadedAdmitted = false;
        let loadedMdt = false;
        let loadedRx = false;
        let loadedTherapies = false;
        let loadedConsultant = false;
        let loadedFu = false;
        let loadedHighlySensitive = false;
        let loadedFinal = false;

        // Only load form data if formUuid is provided (existing form)
        if (state.formUuid) {
          // Fetch form data
          const { data: formData, error: formError } = await supabase
            .from('outpatient_outcomes')
            .select('*')
            .eq('uuid', state.formUuid)
            .order('version', { ascending: false })
            .limit(1)
            .single();

          if (formError) {
            console.error('Error loading form:', formError);
          } else if (formData) {
            if (formData.appointment_uuid) {
              currentAppUuid = formData.appointment_uuid;
            }
            if (formData.form_data) {
              // Load form data into state
              loadedFormState = formData.form_data;
              setFormState(loadedFormState);

              // Set checkbox states from form_data
              loadedDischarged = formData.form_data.discharged || false;
              loadedSos = formData.form_data.sos || false;
              loadedPifu = formData.form_data.pifu || false;
            loadedRemote = formData.form_data.remoteMonitoring || false;
            loadedTests = formData.form_data.testsReq || false;
            loadedWait = formData.form_data.waitListed || false;
            loadedOprx = formData.form_data.oprxPlanned || false;
            loadedAdmitted = formData.form_data.admitted || false;
            loadedMdt = formData.form_data.mdtReview || false;
            loadedRx = formData.form_data.rxGiven || false;
            loadedTherapies = formData.form_data.refToTherapies || false;
            loadedConsultant = formData.form_data.refToConsultant || false;
            loadedFu = formData.form_data.fuOPA || false;
            loadedHighlySensitive = formData.form_data.highlySensitive || false;

            setDischarged(loadedDischarged);
            setSos(loadedSos);
            setPifu(loadedPifu);
            setRemoteMonitoring(loadedRemote);
            setTestsReq(loadedTests);
            setWaitListed(loadedWait);
            setOprxPlanned(loadedOprx);
            setAdmitted(loadedAdmitted);
            setMdtReview(loadedMdt);
            setRxGiven(loadedRx);
            setRefToTherapies(loadedTherapies);
            setRefToConsultant(loadedConsultant);
            setFuOPA(loadedFu);
            setHighlySensitive(loadedHighlySensitive);

            // Set form status
            if (formData.form_status === 'final') {
              loadedFinal = true;
              setFinalChecked(true);
            }
          }
        }
      } else {
        // New form created
          setOpenedFromPatientRecord(!!(state && typeof state.openInRoV !== 'undefined'));
          const today = formatDate(new Date());
          loadedFormState = {
            organisation: 'Cwm Taf Morgannwg',
            speciality: 'Urology',
            site: 'Princess of Wales Hospital',
            seniorClinician: 'HURLE, Rhidian A, Mr (GMC:567890)',
            clinicName: 'General urology',
            date: today,
            time: '09:45',
            attendedOption: 'attended'
          };
          setFormState(loadedFormState);
        }

        if (currentAppUuid) {
          setAppointmentUuid(currentAppUuid);
          const { data: appData } = await supabase
            .from('outpatient_appointments')
            .select('*')
            .eq('uuid', currentAppUuid)
            .single();

          if (appData) {
            loadedFormState = {
              ...loadedFormState,
              organisation: appData.organisation,
              speciality: appData.speciality,
              site: appData.site,
              seniorClinician: appData.senior_clinician,
              clinicName: appData.clinic_name,
              date: appData.date,
              time: appData.time
            };
            setFormState(loadedFormState);
          }
        }

        setInitialSnapshot({
          formState: loadedFormState,
          discharged: loadedDischarged,
          sos: loadedSos,
          pifu: loadedPifu,
          remoteMonitoring: loadedRemote,
          testsReq: loadedTests,
          waitListed: loadedWait,
          oprxPlanned: loadedOprx,
          admitted: loadedAdmitted,
          mdtReview: loadedMdt,
          rxGiven: loadedRx,
          refToTherapies: loadedTherapies,
          refToConsultant: loadedConsultant,
          fuOPA: loadedFu,
          highlySensitive: loadedHighlySensitive,
          finalChecked: loadedFinal
        });

      } catch (err) {
        console.error('Exception loading data:', err);
      } finally {
        setLoadingData(false);

        // After data loads, apply RoV if opened from patient record for existing form
        if (state.openInRoV && state.formUuid) {
          setOpenedFromPatientRecord(!!(state && typeof state.openInRoV !== 'undefined'));
          // Set RoV on next tick to ensure DOM is updated with loaded data
          setTimeout(() => setIsReadOnlyView(true), 0);
        }
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
    isReadOnlyView,
    formState,
    discharged,
    sos,
    pifu,
    remoteMonitoring,
    testsReq,
    waitListed,
    oprxPlanned,
    admitted,
    mdtReview,
    rxGiven,
    refToTherapies,
    refToConsultant,
    fuOPA,
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
  }, [isReadOnlyView, formState]);

  const showTooltip = (text: string, element: HTMLElement, offsetRight: boolean = false, showClose: boolean = true) => {
    setActiveTooltips([{ text, x: 0, y: 0, targetElement: element, offsetRight, showClose }]);
  };

  React.useLayoutEffect(() => {
    if (activeTooltips.length > 0 && activeTooltips.some(t => t.x === 0 && t.y === 0)) {
      const updatedTooltips = activeTooltips.map((tooltip, index) => {
        const tooltipElement = tooltipRefs.current[index];
        if (!tooltipElement) return tooltip;

        const rect = tooltip.targetElement.getBoundingClientRect();
        const tooltipHeight = tooltipElement.offsetHeight;

        let x = rect.left;
        let y = rect.top - tooltipHeight - 5;

        if (tooltip.offsetRight) {
          x = rect.right + 10;
          y = rect.bottom + 5;
        }

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

  // Nested highlighting with alternating colors
  React.useEffect(() => {
    const lighterYellow = '#ffffcc';
    const yellow = '#fee715';

    const getNestingLevel = (element: HTMLElement): number => {
      let level = 0;
      let current = element.parentElement;

      while (current) {
        if (current.classList.contains('question-container') ||
            current.classList.contains('radio-checkbox-item')) {
          level++;
        }
        current = current.parentElement;
      }

      return level;
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const level = getNestingLevel(target);
      const color = level % 2 === 0 ? lighterYellow : yellow;
      target.style.backgroundColor = color;
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      target.style.backgroundColor = '';
    };

    const handleFocusIn = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const level = getNestingLevel(target);
      const color = level % 2 === 0 ? lighterYellow : yellow;
      target.style.backgroundColor = color;
    };

    const handleFocusOut = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      target.style.backgroundColor = '';
    };

    const addListeners = () => {
      const elements = document.querySelectorAll('.question-container, .radio-checkbox-item');
      elements.forEach(element => {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('focusin', handleFocusIn);
        element.addEventListener('focusout', handleFocusOut);
      });
    };

    const removeListeners = () => {
      const elements = document.querySelectorAll('.question-container, .radio-checkbox-item');
      elements.forEach(element => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('focusin', handleFocusIn);
        element.removeEventListener('focusout', handleFocusOut);
      });
    };

    addListeners();

    return () => {
      removeListeners();
    };
  }, [discharged, sos, pifu, testsReq, waitListed, oprxPlanned, admitted, rxGiven, refToTherapies, refToConsultant, fuOPA]);

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
          .from('outpatient_outcomes')
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

      // Prepare form data - include all checkbox states and uuid
      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        discharged,
        sos,
        pifu,
        remoteMonitoring,
        testsReq,
        waitListed,
        oprxPlanned,
        admitted,
        mdtReview,
        rxGiven,
        refToTherapies,
        refToConsultant,
        fuOPA,
        highlySensitive,
        password: password,
        username: username,
        finalChecked: finalChecked
      };

      // Insert new version
      const { error: insertError } = await supabase
        .from('outpatient_outcomes')
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          form_status: 'final',
          form_data: formDataToSave,
          appointment_uuid: appointmentUuid || null
        });

      if (insertError) throw insertError;

      // Update outpatient appointment with outcome form uuid if saved for the first time
      if (!formState.uuid && appointmentUuid) {
        await supabase
          .from('outpatient_appointments')
          .update({ outcome_form_uuid: formUuid })
          .eq('uuid', appointmentUuid);
      }

      // Also insert into forms_index
      const { error: indexError } = await supabase
        .from('forms_index')
        .insert({
          form_uuid: formUuid,
          form_version: version,
          form_type: 'outpatient_outcome',
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          document_datetime: new Date().toISOString(),
          form_status: 'final',
          event_or_document: 'Document'
        });

      if (indexError) throw indexError;

      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        discharged,
        sos,
        pifu,
        remoteMonitoring,
        testsReq,
        waitListed,
        oprxPlanned,
        admitted,
        mdtReview,
        rxGiven,
        refToTherapies,
        refToConsultant,
        fuOPA,
        highlySensitive,
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
          .from('outpatient_outcomes')
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

      // Prepare form data - include all checkbox states and uuid
      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        discharged,
        sos,
        pifu,
        remoteMonitoring,
        testsReq,
        waitListed,
        oprxPlanned,
        admitted,
        mdtReview,
        rxGiven,
        refToTherapies,
        refToConsultant,
        fuOPA,
        highlySensitive,
        password: password,
        username: username,
        finalChecked: finalChecked
      };

      // Insert new version
      const { error: insertError } = await supabase
        .from('outpatient_outcomes')
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          form_status: 'draft',
          form_data: formDataToSave,
          appointment_uuid: appointmentUuid || null
        });

      if (insertError) throw insertError;

      // Update outpatient appointment with outcome form uuid if saved for the first time
      if (!formState.uuid && appointmentUuid) {
        await supabase
          .from('outpatient_appointments')
          .update({ outcome_form_uuid: formUuid })
          .eq('uuid', appointmentUuid);
      }

      // Also insert into forms_index
      const { error: indexError } = await supabase
        .from('forms_index')
        .insert({
          form_uuid: formUuid,
          form_version: version,
          form_type: 'outpatient_outcome',
          patient_uuid: patient?.uuid || null,
          event_datetime: formState.date || new Date().toISOString(),
          document_datetime: new Date().toISOString(),
          form_status: 'draft',
          event_or_document: 'Document'
        });

      if (indexError) throw indexError;

      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        discharged,
        sos,
        pifu,
        remoteMonitoring,
        testsReq,
        waitListed,
        oprxPlanned,
        admitted,
        mdtReview,
        rxGiven,
        refToTherapies,
        refToConsultant,
        fuOPA,
        highlySensitive,
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

  const handleReturnToForm = () => {
    setShowDraftPopup(false);
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <>
      {isReadOnlyView ? (
        <OutpatientOutcomeRoV
          patient={patient}
          formState={formState}
          discharged={discharged}
          sos={sos}
          pifu={pifu}
          remoteMonitoring={remoteMonitoring}
          testsReq={testsReq}
          waitListed={waitListed}
          oprxPlanned={oprxPlanned}
          admitted={admitted}
          mdtReview={mdtReview}
          rxGiven={rxGiven}
          refToTherapies={refToTherapies}
          refToConsultant={refToConsultant}
          fuOPA={fuOPA}
          finalChecked={finalChecked}
          formStatus={finalChecked ? 'final' : 'draft'}
          openedFromPatientRecord={openedFromPatientRecord}
          username={username}
          onSwitchToEV={() => {
            setIsReadOnlyView(false);
            setClickedRoVButton(false);
          }}
          onBack={navigateBack}
        />
      ) : (
        <div className="min-h-screen bg-white" style={{fontFamily: "'Roboto', sans-serif", fontWeight: 300, lineHeight: 1.2}}>
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
            onSubmit={handleSubmit}
            header={
              <div style={{borderBottom: '0.2rem solid rgb(27, 110, 194)', marginBottom: '0.2rem', padding: '0.4rem'}}>
                <div className="flex justify-between items-center">
                  <h1 style={{fontSize: '2rem', fontWeight: 500}}>Outpatient outcome</h1>

                  {/* Addressograph */}
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

            {/* Appointment */}
            <div className="question-container" style={{padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem'}}>
              <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0}}>Appointment</label>
              <div className="grid grid-cols-1 md:grid-cols-4" style={{columnGap: '1rem', rowGap: '0.4rem'}}>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'}}>Organisation</label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.organisation}</div>
                </div>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'}}>Speciality</label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.speciality}</div>
                </div>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'}}>Site</label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.site}</div>
                </div>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'}}>Senior responsible clinician</label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.seniorClinician}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4" style={{columnGap: '1rem', rowGap: '0.4rem', marginTop: '0.4rem'}}>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'}}>Clinic name</label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.clinicName}</div>
                </div>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'} }
                    onMouseEnter={(e) => showTooltip('Date of consultation', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip('Date of consultation', e.currentTarget)}
                    onBlur={hideTooltip}
                    tabIndex={0}>
                    Date
                  </label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.date}</div>
                </div>
                <div className="question-container" style={{padding: '0.4rem 0.4rem 0 0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 300, fontSize: '0.8rem'}}
                    onMouseEnter={(e) => showTooltip('Time of consultation', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip('Time of consultation', e.currentTarget)}
                    onBlur={hideTooltip}
                    tabIndex={0}>
                    Time
                  </label>
                  <div style={{fontSize: '1rem', fontWeight: 500, marginLeft: '0.4rem'}}>{formState.time}</div>
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="question-container" style={{padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem'}}>
              <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0}}>Attendance <span className="hideInRoV" style={{color: '#d50000'}}>*</span></label>
              <div className="space-y-2" style={{marginLeft: '0.4rem'}}>
                <label className="flex items-start gap-2 radio-checkbox-item">
                  <input
                    type="radio"
                    name="attendedOption"
                    value="attended"
                    checked={formState.attendedOption === 'attended'}
                    onChange={(e) => handleFieldChange('attendedOption', e.target.value)}
                    required
                  />
                  <span className="boldInRoV" style={{fontWeight: 300}}>Attended</span>
                </label>
                <label className="flex items-start gap-2 radio-checkbox-item">
                  <input
                    type="radio"
                    name="attendedOption"
                    value="unableToAttend"
                    checked={formState.attendedOption === 'unableToAttend'}
                    onChange={(e) => handleFieldChange('attendedOption', e.target.value)}
                    required
                  />
                  <span className="boldInRoV" style={{fontWeight: 300}}>Unable to attend</span>
                </label>
                {formState.attendedOption === 'unableToAttend' && (
                  <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                    <FbTextInput
                      id="unableReason"
                      name="unableReason"
                      label="Reason"
                      subfield={true}
                      value={formState.unableReason || ''}
                      onChange={(val) => handleFieldChange('unableReason', val)}
                    />
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="radio"
                        name="unableAction"
                        value="anotherMade"
                        checked={formState.unableAction === 'anotherMade'}
                        onChange={(e) => handleFieldChange('unableAction', e.target.value)}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Another appointment already made</span>
                    </label>
                    {formState.unableAction === 'anotherMade' && (
                      <div style={{marginLeft: '1.5rem'}}>
                        <div className="question-container subfield">
                          <label className="subfieldlabel" style={{fontWeight: 300, fontSize: '1rem'}}>Date</label>
                          <DateControl
                            name="anotherApptDate"
                            value={formState.anotherApptDate || ''}
                            onChange={(value) => handleFieldChange('anotherApptDate', value)}
                          />
                        </div>
                      </div>
                    )}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="radio"
                        name="unableAction"
                        value="sendAnother"
                        checked={formState.unableAction === 'sendAnother'}
                        onChange={(e) => handleFieldChange('unableAction', e.target.value)}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Send another appointment</span>
                    </label>
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="radio"
                        name="unableAction"
                        value="noFurther"
                        checked={formState.unableAction === 'noFurther'}
                        onChange={(e) => handleFieldChange('unableAction', e.target.value)}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>No further appointment</span>
                    </label>
                    {formState.unableAction === 'noFurther' && (
                      <div style={{marginLeft: '1.5rem'}}>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="radio"
                            name="letterAction"
                            value="sendLetter"
                            checked={formState.letterAction === 'sendLetter'}
                            onChange={(e) => handleFieldChange('letterAction', e.target.value)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Send system-generated letter to GP and patient</span>
                        </label>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="radio"
                            name="letterAction"
                            value="letterDone"
                            checked={formState.letterAction === 'letterDone'}
                            onChange={(e) => handleFieldChange('letterAction', e.target.value)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Letter to GP and patient done</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
                <label className="flex items-start gap-2 radio-checkbox-item">
                  <input
                    type="radio"
                    name="attendedOption"
                    value="didNotAttend"
                    checked={formState.attendedOption === 'didNotAttend'}
                    onChange={(e) => handleFieldChange('attendedOption', e.target.value)}
                    required
                  />
                  <span className="boldInRoV" style={{fontWeight: 300}}>Did not attend</span>
                </label>
                {formState.attendedOption === 'didNotAttend' && (
                  <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="wasNotBrought"
                        checked={formState.wasNotBrought || false}
                        onChange={(e) => handleFieldChange('wasNotBrought', e.target.checked)}
                        onMouseEnter={(e) => showTooltip('Check if the patient is aged less than 18 years or depends on another adult to attend. This check box does not fulfil safeguarding obligations.', e.currentTarget)}
                        onMouseLeave={hideTooltip}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Was not brought</span>
                    </label>
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="radio"
                        name="dnaAction"
                        value="sendAnother"
                        checked={formState.dnaAction === 'sendAnother'}
                        onChange={(e) => handleFieldChange('dnaAction', e.target.value)}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Send another appointment</span>
                    </label>
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="radio"
                        name="dnaAction"
                        value="noFurther"
                        checked={formState.dnaAction === 'noFurther'}
                        onChange={(e) => handleFieldChange('dnaAction', e.target.value)}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>No further appointment</span>
                    </label>
                    {formState.dnaAction === 'noFurther' && (
                      <div style={{marginLeft: '1.5rem'}}>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="radio"
                            name="dnaLetterAction"
                            value="sendLetter"
                            checked={formState.dnaLetterAction === 'sendLetter'}
                            onChange={(e) => handleFieldChange('dnaLetterAction', e.target.value)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Send system-generated letter to GP and patient</span>
                        </label>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="radio"
                            name="dnaLetterAction"
                            value="letterDone"
                            checked={formState.dnaLetterAction === 'letterDone'}
                            onChange={(e) => handleFieldChange('dnaLetterAction', e.target.value)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Letter to GP and patient done</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* USC and Working Diagnosis - shown when attended */}
            {formState.attendedOption === 'attended' && (
              <>
                {/* Urgent suspected cancer */}
                <div className="question-container" style={{padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0}}
                    onMouseEnter={(e) => showTooltip('Required for monitoring performance against cancer targets', e.currentTarget)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip('Required for monitoring performance against cancer targets', e.currentTarget)}
                    onBlur={hideTooltip}
                    tabIndex={0}>
                    Urgent suspected cancer <span className="hideInRoV" style={{color: '#d50000'}}>*</span>
                  </label>
                  <div className="space-y-2" style={{marginLeft: '0.4rem'}}>
                      <label className="flex items-start gap-2 radio-checkbox-item">
                        <input
                          type="radio"
                          name="usc"
                          value="yes"
                          checked={formState.usc === 'yes'}
                          onChange={(e) => handleFieldChange('usc', e.target.value)}
                          required
                        />
                        <span className="boldInRoV" style={{fontWeight: 300}}>Yes</span>
                      </label>
                      <label className="flex items-start gap-2 radio-checkbox-item">
                        <input
                          type="radio"
                          name="usc"
                          value="no"
                          checked={formState.usc === 'no'}
                          onChange={(e) => handleFieldChange('usc', e.target.value)}
                          required
                        />
                        <span className="boldInRoV" style={{fontWeight: 300}}>No</span>
                      </label>
                    </div>
                </div>

                {/* Working diagnosis */}
                <div className="question-container" style={{padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0}}>Working diagnosis</label>
                  <div style={{marginLeft: '0.4rem'}}>
                    <SCTDiagnosis
                      name="workingDiagnosis"
                      value={formState.workingDiagnosis || ''}
                      onChange={(value) => handleFieldChange('workingDiagnosis', value)}
                      placeholder="Search for diagnosis..."
                    />
                  </div>
                </div>
                {/* Outcome */}
                <div className="question-container" style={{padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem'}}>
                  <label className="font-medium" style={{fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0}}>Outcome <span className="hideInRoV" style={{color: '#d50000'}}>*</span></label>
                  <div className="space-y-2" style={{marginLeft: '0.4rem'}}>

                    {/* Discharge */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="discharge"
                        checked={discharged}
                        onChange={(e) => {
                          setDischarged(e.target.checked);
                          handleFieldChange('discharge', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('discharge')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Discharge</span>
                    </label>

                    {/* See on symptom */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="sos"
                        checked={sos}
                        onChange={(e) => {
                          setSos(e.target.checked);
                          handleFieldChange('sos', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('sos')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>See on symptom</span>
                    </label>
                    {sos && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="radio"
                            name="sosInterval"
                            value="sixMonths"
                            checked={formState.sosInterval === 'sixMonths' || !formState.sosInterval}
                            onChange={(e) => handleFieldChange('sosInterval', e.target.value)}
                            required={sos}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Six months</span>
                        </label>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="radio"
                            name="sosInterval"
                            value="twelveMonths"
                            checked={formState.sosInterval === 'twelveMonths'}
                            onChange={(e) => handleFieldChange('sosInterval', e.target.value)}
                            required={sos}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Twelve months</span>
                        </label>
                      </div>
                    )}

                    {/* Patient initiated follow-up */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="pifu"
                        checked={pifu}
                        onChange={(e) => {
                          setPifu(e.target.checked);
                          handleFieldChange('pifu', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('pifu')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Patient initiated follow-up</span>
                    </label>

                    {/* Remote monitoring */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="remoteMonitoring"
                        checked={formState.remoteMonitoring || false}
                        onChange={(e) => handleFieldChange('remoteMonitoring', e.target.checked)}
                        disabled={isOutcomeCheckboxDisabled('remoteMonitoring')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Remote monitoring</span>
                    </label>

                    {/* Tests requested */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="testsReq"
                        checked={testsReq}
                        onChange={(e) => {
                          setTestsReq(e.target.checked);
                          handleFieldChange('testsReq', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('testsReq')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Tests requested</span>
                    </label>
                    {testsReq && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <div className="question-container subfield">
                          <div className="space-y-2">
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="testsReason"
                                value="beforeTreatment"
                                checked={formState.testsReason === 'beforeTreatment' || !formState.testsReason}
                                onChange={(e) => handleFieldChange('testsReason', e.target.value)}
                                required={testsReq}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Result required before deciding treatment</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="testsReason"
                                value="afterTreatment"
                                checked={formState.testsReason === 'afterTreatment'}
                                onChange={(e) => handleFieldChange('testsReason', e.target.value)}
                                required={testsReq}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Result required for monitoring or after treatment</span>
                            </label>
                          </div>
                        </div>
                        <FbTextArea
                          id="testsRequested"
                          name="testsRequested"
                          label="Tests requested"
                          subfield={true}
                          value={formState.testsRequested || ''}
                          onChange={(val) => handleFieldChange('testsRequested', val)}
                        />
                      </div>
                    )}

                    {/* Add to waiting list */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="waitingList"
                        checked={waitListed}
                        onChange={(e) => {
                          setWaitListed(e.target.checked);
                          handleFieldChange('waitingList', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('waitingList')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Add to waiting list for surgery or other treatment</span>
                    </label>
                    {waitListed && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <div className="question-container subfield">
                          <label className="subfieldlabel" style={{fontWeight: 300, fontSize: '1rem'}}>Waiting list <span className="hideInRoV" style={{color: '#d50000'}}>*</span></label>
                          <div className="space-y-2" style={{marginTop: '0.2rem'}}>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="wlOptions"
                                value="dayCase"
                                checked={formState.wlOptions === 'dayCase'}
                                onChange={(e) => handleFieldChange('wlOptions', e.target.value)}
                                required={waitListed}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Day case</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="wlOptions"
                                value="inpatient"
                                checked={formState.wlOptions === 'inpatient'}
                                onChange={(e) => handleFieldChange('wlOptions', e.target.value)}
                                required={waitListed}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Inpatient</span>
                            </label>
                          </div>
                        </div>
                        <FbTextArea
                          id="treatmentPlanned"
                          name="treatmentPlanned"
                          label="Treatment planned"
                          required={true}
                          subfield={true}
                          value={formState.treatmentPlanned || ''}
                          onChange={(val) => handleFieldChange('treatmentPlanned', val)}
                        />
                      </div>
                    )}

                    {/* Outpatient treatment planned */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="oprxPlanned"
                        checked={oprxPlanned}
                        onChange={(e) => {
                          setOprxPlanned(e.target.checked);
                          handleFieldChange('oprxPlanned', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('oprxPlanned')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Outpatient treatment planned</span>
                    </label>
                    {oprxPlanned && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <FbTextArea
                          id="oprxTreatmentPlanned"
                          name="oprxTreatmentPlanned"
                          label="Treatment planned"
                          required={true}
                          subfield={true}
                          value={formState.oprxTreatmentPlanned || ''}
                          onChange={(val) => handleFieldChange('oprxTreatmentPlanned', val)}
                        />
                        <div className="question-container subfield" style={{marginTop: '0.4rem'}}>
                          <label className="subfieldlabel" style={{fontWeight: 300, fontSize: '1rem'}}>Priority <span className="hideInRoV" style={{color: '#d50000'}}>*</span></label>
                          <div className="space-y-2" style={{marginTop: '0.2rem'}}>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="rxPriority"
                                value="routine"
                                checked={formState.rxPriority === 'routine'}
                                onChange={(e) => handleFieldChange('rxPriority', e.target.value)}
                                required={oprxPlanned}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Routine</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="rxPriority"
                                value="urgent"
                                checked={formState.rxPriority === 'urgent'}
                                onChange={(e) => handleFieldChange('rxPriority', e.target.value)}
                                required={oprxPlanned}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Urgent</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="rxPriority"
                                value="usc"
                                checked={formState.rxPriority === 'usc'}
                                onChange={(e) => handleFieldChange('rxPriority', e.target.value)}
                                required={oprxPlanned}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Urgent suspected cancer</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admitted from clinic */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="admitted"
                        checked={admitted}
                        onChange={(e) => {
                          setAdmitted(e.target.checked);
                          handleFieldChange('admitted', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('admitted')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Admitted from clinic to ward or department</span>
                    </label>

                    {/* MDT review */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="mdtReview"
                        checked={formState.mdtReview || false}
                        onChange={(e) => handleFieldChange('mdtReview', e.target.checked)}
                        disabled={isOutcomeCheckboxDisabled('mdtReview')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>MDT review</span>
                    </label>

                    {/* Treatment given */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="rxGiven"
                        checked={rxGiven}
                        onChange={(e) => {
                          setRxGiven(e.target.checked);
                          handleFieldChange('rxGiven', e.target.checked);
                        }}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Treatment given in clinic today</span>
                    </label>
                    {rxGiven && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <FbTextArea
                          id="treatmentGiven"
                          name="treatmentGiven"
                          label="Treatment given"
                          required={true}
                          subfield={true}
                          value={formState.treatmentGiven || ''}
                          onChange={(val) => handleFieldChange('treatmentGiven', val)}
                        />
                      </div>
                    )}

                    {/* Stop referral to treatment clock */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="stopRefClock"
                        checked={formState.stopRefClock || false}
                        onChange={(e) => handleFieldChange('stopRefClock', e.target.checked)}
                        onMouseEnter={(e) => showTooltip('Checking this indicates that the patient should not be offered an active treatment. Treatment here means: surgery, chemotherapy, radiotherapy, biological therapy and transplant', e.currentTarget)}
                        onMouseLeave={hideTooltip}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Stop referral to treatment clock</span>
                    </label>

                    {/* Referred to therapies */}
                    <label className="flex items-start gap-2 radio-checkbox-item"
                      onMouseEnter={(e) => showTooltip('Checking this does not generate a referral', e.currentTarget)}
                      onMouseLeave={hideTooltip}>
                      <input
                        type="checkbox"
                        name="refToTherapies"
                        checked={refToTherapies}
                        onChange={(e) => {
                          setRefToTherapies(e.target.checked);
                          handleFieldChange('refToTherapies', e.target.checked);
                        }}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Referred to therapies</span>
                    </label>
                    {refToTherapies && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <FbTextArea
                          id="therapyDetails"
                          name="therapyDetails"
                          label="Therapy or department (for example physiotherapy)"
                          required={true}
                          subfield={true}
                          value={formState.therapyDetails || ''}
                          onChange={(val) => handleFieldChange('therapyDetails', val)}
                        />
                      </div>
                    )}

                    {/* Referred to another consultant */}
                    <label className="flex items-start gap-2 radio-checkbox-item"
                      onMouseEnter={(e) => showTooltip('Checking this does not generate a referral', e.currentTarget)}
                      onMouseLeave={hideTooltip}>
                      <input
                        type="checkbox"
                        name="refToConsultant"
                        checked={refToConsultant}
                        onChange={(e) => {
                          setRefToConsultant(e.target.checked);
                          handleFieldChange('refToConsultant', e.target.checked);
                        }}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Referred to another consultant, speciality or hospital</span>
                    </label>
                    {refToConsultant && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <FbTextInput
                          id="consultantDetails"
                          name="consultantDetails"
                          label="Consultant, speciality or hospital"
                          required={true}
                          subfield={true}
                          value={formState.consultantDetails || ''}
                          onChange={(val) => handleFieldChange('consultantDetails', val)}
                        />
                      </div>
                    )}

                    {/* Follow up appointment */}
                    <label className="flex items-start gap-2 radio-checkbox-item">
                      <input
                        type="checkbox"
                        name="fuOPA"
                        checked={fuOPA}
                        onChange={(e) => {
                          setFuOPA(e.target.checked);
                          handleFieldChange('fuOPA', e.target.checked);
                        }}
                        disabled={isOutcomeCheckboxDisabled('fuOPA')}
                      />
                      <span className="boldInRoV" style={{fontWeight: 300}}>Follow up appointment</span>
                    </label>
                    {fuOPA && (
                      <div style={{marginLeft: '1.5rem', marginTop: '0.4rem'}}>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="checkbox"
                            name="cancerPathway"
                            checked={formState.cancerPathway || false}
                            onChange={(e) => handleFieldChange('cancerPathway', e.target.checked)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Patient to remain on cancer pathway</span>
                        </label>
                        <FbTextInput
                          id="interval"
                          name="interval"
                          label="Interval"
                          required={true}
                          subfield={true}
                          placeholder="Specify days, weeks or months"
                          value={formState.interval || ''}
                          onChange={(val) => handleFieldChange('interval', val)}
                        />
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="checkbox"
                            name="sameClinic"
                            checked={formState.sameClinic || false}
                            onChange={(e) => handleFieldChange('sameClinic', e.target.checked)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Must be seen in the same clinic</span>
                        </label>
                        <label className="flex items-start gap-2 radio-checkbox-item">
                          <input
                            type="checkbox"
                            name="sameClinician"
                            checked={formState.sameClinician || false}
                            onChange={(e) => handleFieldChange('sameClinician', e.target.checked)}
                          />
                          <span className="boldInRoV" style={{fontWeight: 300}}>Must be seen by the same senior responsible clinician</span>
                        </label>
                        <div className="question-container subfield" style={{marginTop: '0.4rem'}}>
                          <label className="subfieldlabel" style={{fontWeight: 300, fontSize: '1rem'}}>Consultation type <span style={{color: '#d50000'}}>*</span></label>
                          <div className="space-y-2" style={{marginTop: '0.2rem'}}>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="consultationType"
                                value="faceToFace"
                                checked={formState.consultationType === 'faceToFace' || !formState.consultationType}
                                onChange={(e) => handleFieldChange('consultationType', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Face to face</span>
                            </label>
                            {(formState.consultationType === 'faceToFace' || !formState.consultationType) && fuOPA && (
                              <div style={{marginLeft: '1.5rem'}}>
                                <FbTextInput
                                  id="hospitalDifferent"
                                  name="hospitalDifferent"
                                  label="Hospital (if different)"
                                  subfield={true}
                                  value={formState.hospitalDifferent || ''}
                                  onChange={(val) => handleFieldChange('hospitalDifferent', val)}
                                />
                              </div>
                            )}
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="consultationType"
                                value="telephone"
                                checked={formState.consultationType === 'telephone'}
                                onChange={(e) => handleFieldChange('consultationType', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Telephone consultation</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="consultationType"
                                value="videoCall"
                                checked={formState.consultationType === 'videoCall'}
                                onChange={(e) => handleFieldChange('consultationType', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Video call</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="consultationType"
                                value="caseReview"
                                checked={formState.consultationType === 'caseReview'}
                                onChange={(e) => handleFieldChange('consultationType', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>Case review (patient not required to attend)</span>
                            </label>
                          </div>
                        </div>
                        <div className="question-container subfield" style={{marginTop: '0.4rem'}}>
                          <label className="subfieldlabel" style={{fontWeight: 300, fontSize: '1rem'}}>Priority (appointment directive) <span style={{color: '#d50000'}}>*</span></label>
                          <div className="space-y-2" style={{marginTop: '0.2rem'}}>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="fuApptPriority"
                                value="overbook"
                                checked={formState.fuApptPriority === 'overbook'}
                                onChange={(e) => handleFieldChange('fuApptPriority', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>A* : Overbook</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="fuApptPriority"
                                value="doNotPostpone"
                                checked={formState.fuApptPriority === 'doNotPostpone'}
                                onChange={(e) => handleFieldChange('fuApptPriority', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>A : Do not postpone appointment</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="fuApptPriority"
                                value="fourWeeks"
                                checked={formState.fuApptPriority === 'fourWeeks'}
                                onChange={(e) => handleFieldChange('fuApptPriority', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>B : Do not postpone appointment for more than four weeks</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="fuApptPriority"
                                value="afterTests"
                                checked={formState.fuApptPriority === 'afterTests'}
                                onChange={(e) => handleFieldChange('fuApptPriority', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>D : After test results</span>
                            </label>
                            <label className="flex items-start gap-2 radio-checkbox-item">
                              <input
                                type="radio"
                                name="fuApptPriority"
                                value="treatmentWL"
                                checked={formState.fuApptPriority === 'treatmentWL'}
                                onChange={(e) => handleFieldChange('fuApptPriority', e.target.value)}
                                required={fuOPA}
                              />
                              <span className="boldInRoV" style={{fontWeight: 300}}>T : Add to outpatient treatment waiting list</span>
                            </label>
                          </div>
                        </div>
                        <FbTextInput
                          id="testsOnArrival"
                          name="testsOnArrival"
                          label="Tests to be done on arrival"
                          subfield={true}
                          placeholder="Filling in this box does not generate a test request"
                          value={formState.testsOnArrival || ''}
                          onChange={(val) => handleFieldChange('testsOnArrival', val)}
                        />
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            <div style={{padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem'}}>
              <FbTextArea
                id="notes"
                name="notes"
                label="Notes"
                rows={4}
                value={formState.notes || ''}
                onChange={(val) => handleFieldChange('notes', val)}
              />
            </div>

            {/* Draft popup */}
            {showDraftPopup && (
              <DraftPopup
                onSaveAsDraft={handleSaveAsDraft}
                onReturnToForm={handleReturnToForm}
              />
            )}

            {/* Password re-entry popup */}
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
              />
            ))}
          </FbLayout>
        </div>
      )}
    </>
  );
}
