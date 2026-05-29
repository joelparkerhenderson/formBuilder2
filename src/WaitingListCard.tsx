import * as React from "react";
import { useNavigate, useLocation } from "react-router";
import { specialities } from "./data/specialities";
import { fbAddressograph as Addressograph } from "./components/fbAddressograph";
import { fbAuthControls as AuthControls } from "./components/fbAuthControls";
import { fbDateControl as DateControl } from "./components/fbDateControl";
import { fbSCTProcedureSelector as SCTProcedureSelector } from "./components/fbSCTProcedureSelector";
import { fbMSISelector as MSISelector } from "./components/fbMSISelector";
import { fbDraftPopup as DraftPopup } from "./components/fbDraftPopup";
import { fbPasswordPopup as PasswordPopup } from "./components/fbPasswordPopup";
import { fbFinalControl as FinalControl } from "./components/fbFinalControl";
import { WaitingListCardRoV } from "./WaitingListCardRoV";
import { fbSaveCancelButtons as SaveCancelButtons } from "./components/fbSaveCancelButtons";
import { fbBottomControlsRow as BottomControlsRow } from "./components/fbBottomControlsRow";
import { fbAddButton as AddButton } from "./components/fbAddButton";
import { fbDropdown as FbDropdown } from "./components/fbDropdown";
import { fbTextInput as FbTextInput } from "./components/fbTextInput";
import { fbTextArea as FbTextArea } from "./components/fbTextArea";
import { fbNumberInput as FbNumberInput } from "./components/fbNumberInput";
import { fbSection as FbSection } from "./components/fbSection";
import { fbQuestionRow as FbQuestionRow } from "./components/fbQuestionRow";
import { fbQuestion as FbQuestion } from "./components/fbQuestion";
import { fbRadio as FbRadio } from "./components/fbRadio";
import { fbCheck as FbCheck } from "./components/fbCheck";
import { fbGroup as FbGroup } from "./components/fbGroup";
import { fbTableCell as FbTableCell } from "./components/fbTableCell";
import { fbLayout as FbLayout, SectionSpec, areAllSectionsComplete, getSectionStatus as getSectionStatusHelper } from "./components/fbLayout";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { compareFormStatesObj, cleanArrayOfObjects } from "./utils/formStateUtils";

// Create Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

// Helper function to format date
const formatDate = (date: Date): string => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day.toString().padStart(2, "0")}-${month}-${year}`;
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

export default function WaitingListCard({ inlineProps }: { inlineProps?: InlineProps } = {}) {
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
    organisation: "cwm-taf",
    hospital: "princess-wales",
    dateListed: formatDate(new Date()),
    urgency: "",
    operatingSurgeon: "",
    shortNotice: "unknown",
    rcsPriority: "unknown",
    intendedManagement: "unknown",
    admitBefore: 0,
    imagingRequired: "unknown",
    anaestheticType: "unknown",
    bedRequirement: "unknown",
    outsourcing: "unknown",
    risks: [],
    namedClinicianName: "",
    clinicalNotes: "",
  });

  const [procedures, setProcedures] = React.useState<
    Array<{
      id: number;
      side: string;
      procedure: string;
      additionalInfo: string;
    }>
  >([{ id: 1, side: "", procedure: "", additionalInfo: "" }]);

  const [anticoagChecked, setAnticoagChecked] = React.useState<{
    doac: boolean;
    warfarin: boolean;
    aspirin: boolean;
    clopidogrel: boolean;
    other: boolean;
  }>({
    doac: false,
    warfarin: false,
    aspirin: false,
    clopidogrel: false,
    other: false,
  });

  const defaultFormStateValues = React.useMemo(() => ({
    organisation: "cwm-taf",
    hospital: "princess-wales",
    dateListed: formatDate(new Date()),
    urgency: "",
    operatingSurgeon: "",
    shortNotice: "unknown",
    rcsPriority: "unknown",
    intendedManagement: "unknown",
    admitBefore: 0,
    imagingRequired: "unknown",
    anaestheticType: "unknown",
    bedRequirement: "unknown",
    outsourcing: "unknown",
    risks: [],
    namedClinicianName: "",
    clinicalNotes: "",
  }), []);

  const [initialSnapshot, setInitialSnapshot] = React.useState<{
    formState: any;
    procedures: any[];
    anticoagChecked: any;
    highlySensitive: boolean;
    finalChecked: boolean;
  }>(() => ({
    formState: { ...defaultFormStateValues },
    procedures: [{ id: 1, side: "", procedure: "", additionalInfo: "" }],
    anticoagChecked: {
      doac: false,
      warfarin: false,
      aspirin: false,
      clopidogrel: false,
      other: false,
    },
    highlySensitive: false,
    finalChecked: false,
  }));

  const isStateEqual = (stateA: any, stateB: any) => {
    if (!stateA || !stateB) return false;

    const formStatesMatch = compareFormStatesObj(stateA.formState, stateB.formState);
    const proceduresMatch = JSON.stringify(cleanArrayOfObjects(stateA.procedures, ["side", "procedure", "additionalInfo"])) ===
                            JSON.stringify(cleanArrayOfObjects(stateB.procedures, ["side", "procedure", "additionalInfo"]));
    const anticoagMatch = JSON.stringify(cleanArrayOfObjects([stateA.anticoagChecked], ["doac", "warfarin", "aspirin", "clopidogrel", "other"])) ===
                          JSON.stringify(cleanArrayOfObjects([stateB.anticoagChecked], ["doac", "warfarin", "aspirin", "clopidogrel", "other"]));

    return formStatesMatch &&
           proceduresMatch &&
           anticoagMatch &&
           !!stateA.highlySensitive === !!stateB.highlySensitive &&
           !!stateA.finalChecked === !!stateB.finalChecked;
  };

  const [draggedRow, setDraggedRow] = React.useState<number | null>(null);
  const [formChanged, setFormChanged] = React.useState<boolean>(false);
  const [finalChecked, setFinalChecked] = React.useState<boolean>(false);
  const [highlySensitive, setHighlySensitive] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (initialSnapshot) {
      const changed = !isStateEqual(initialSnapshot, {
        formState,
        procedures,
        anticoagChecked,
        highlySensitive,
        finalChecked,
      });
      setFormChanged(changed);
    }
  }, [initialSnapshot, formState, procedures, anticoagChecked, highlySensitive, finalChecked]);
  const [isReadOnlyView, setIsReadOnlyView] = React.useState<boolean>(() => {
    if (inlineProps) return inlineProps.openInRoV || false;
    const state = location.state as { openInRoV?: boolean } | null;
    return state?.openInRoV || false;
  });
  const [clickedRoVButton, setClickedRoVButton] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("demoUser");
  const [showDraftPopup, setShowDraftPopup] = React.useState<boolean>(false);
  const [showPasswordPopup, setShowPasswordPopup] =
    React.useState<boolean>(false);
  const [openedFromPatientRecord, setOpenedFromPatientRecord] =
    React.useState<boolean>(() => {
      if (inlineProps) return true;
      const state = location.state as { openInRoV?: boolean } | null;
      return !!(state && typeof state.openInRoV !== "undefined");
    });

  const [activeSection, setActiveSection] =
    React.useState<string>("section-from");
  const viewChangeCounter = React.useRef<number>(0);
  const passwordTimeoutRef = React.useRef<number | null>(null);

  const handleFieldChange = (fieldName: string, value: any, coded?: boolean) => {
    setFormState((prev) => {
      const updated = { ...prev, [fieldName]: value };
      if (coded !== undefined) {
        updated[`${fieldName}_coded`] = coded;
      }
      return updated;
    });
    setFormChanged(true);
  };

  const handleRiskChange = (riskValue: string, checked: boolean) => {
    const currentRisks = formState.risks || [];
    let updatedRisks;
    if (checked) {
      updatedRisks = [...currentRisks, riskValue];
    } else {
      updatedRisks = currentRisks.filter((r: string) => r !== riskValue);
    }
    handleFieldChange("risks", updatedRisks);
  };

  const sectionsConfig: SectionSpec[] = [
    {
      id: "section-from",
      name: "From",
      requiredFields: ["organisation", "speciality", "hospital", "seniorClinician"]
    },
    {
      id: "section-listing",
      name: "Listing & priority",
      requiredFields: ["dateListed", "urgency"],
      getIncompleteCount: (state) => {
        if (state.operatingSurgeon === "named_clinician") {
          return (!state.namedClinicianName || state.namedClinicianName === "") ? 1 : 0;
        }
        return 0;
      }
    },
    {
      id: "section-procedure",
      name: "Planned procedure(s)",
    },
    {
      id: "section-risks",
      name: "Specific operative risks",
      getIncompleteCount: (state) => {
        let count = 0;
        if ((state.risks || []).includes("other")) {
          if (!state.riskOtherDetail || state.riskOtherDetail === "") {
            count += 1;
          }
        }
        if (anticoagChecked.doac) {
          if (!state["doac-name"] || state["doac-name"] === "") {
            count += 1;
          }
        }
        if (anticoagChecked.other) {
          if (!state["anticoag-other-med"] || state["anticoag-other-med"] === "") {
            count += 1;
          }
          if (!state["anticoag-other-indication"] || state["anticoag-other-indication"] === "") {
            count += 1;
          }
        }
        return count;
      }
    },
    {
      id: "section-preop",
      name: "Pre-operative",
      requiredFields: ["intendedManagement"]
    },
    {
      id: "section-anaesthesia",
      name: "Anaesthesia",
    },
    {
      id: "section-postop",
      name: "Post-op",
    },
    {
      id: "section-other",
      name: "Other",
    }
  ];

  const getSectionStatus = (sectionId: string) => {
    const spec = sectionsConfig.find(s => s.id === sectionId);
    if (!spec) return { incomplete: 0, isComplete: true };
    return getSectionStatusHelper(spec, formState);
  };

  const areRequiredFieldsComplete = () => {
    return areAllSectionsComplete(sectionsConfig, formState);
  };

  // Load form and patient data when opened from patient record
  React.useEffect(() => {
    const state = inlineProps ? {
      patientUuid: inlineProps.patientUuid,
      formUuid: inlineProps.formUuid,
      openInRoV: inlineProps.openInRoV,
      username: username
    } : (location.state as {
      formUuid?: string;
      patientUuid?: string;
      openInRoV?: boolean;
      username?: string;
    } | null);

    if (state?.username) {
      setUsername(state.username);
    }

    if (!state?.patientUuid) {
      return;
    }

    if (state.openInRoV && state.formUuid) {
      setIsReadOnlyView(true);
    }
    if (state && typeof state.openInRoV !== "undefined") {
      setOpenedFromPatientRecord(true);
    }

    const loadData = async () => {
      try {
        setLoadingData(true);

        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("*")
          .eq("uuid", state.patientUuid)
          .order("version", { ascending: false })
          .limit(1)
          .single();

        if (patientError) {
          console.error("Error loading patient:", patientError);
        } else {
          setPatient(patientData);
        }

        if (state.formUuid) {
          const { data: formData, error: formError } = await supabase
            .from("waiting_list_cards")
            .select("*")
            .eq("uuid", state.formUuid)
            .order("version", { ascending: false })
            .limit(1)
            .single();

          if (formError) {
            console.error("Error loading form:", formError);
          } else if (formData?.form_data) {
            const fState = { ...formData.form_data };
            const procs = (formData.form_data.procedures || [
              { id: 1, side: "", procedure: "", additionalInfo: "" },
            ]).map((p: any) => ({
              ...p,
              procedure_coded: p.procedure_coded !== undefined ? p.procedure_coded : (p.procedure ? true : false)
            }));

            if (fState.seniorClinician && fState.seniorClinician_coded === undefined) {
              fState.seniorClinician_coded = true;
            }
            if (fState.listedBy && fState.listedBy_coded === undefined) {
              fState.listedBy_coded = true;
            }

            const anticoag = formData.form_data.anticoagChecked || {
              doac: false,
              warfarin: false,
              aspirin: false,
              clopidogrel: false,
              other: false,
            };
            const hSensitive = !!formData.form_data.highlySensitive;
            const fChecked = formData.form_status === "final";

            setFormState(fState);
            setProcedures(procs);
            setAnticoagChecked(anticoag);
            setHighlySensitive(hSensitive);
            setFinalChecked(fChecked);

            setInitialSnapshot({
              formState: fState,
              procedures: procs,
              anticoagChecked: anticoag,
              highlySensitive: hSensitive,
              finalChecked: fChecked,
            });
          }
        } else {
          setOpenedFromPatientRecord(!!(state && typeof state.openInRoV !== "undefined"));
          const fState = {
            ...defaultFormStateValues,
            dateListed: formatDate(new Date())
          };
          const procs = [{ id: 1, side: "", procedure: "", additionalInfo: "" }];
          const anticoag = {
            doac: false,
            warfarin: false,
            aspirin: false,
            clopidogrel: false,
            other: false,
          };
          const hSensitive = false;
          const fChecked = false;

          setFormState(fState);
          setProcedures(procs);
          setAnticoagChecked(anticoag);
          setHighlySensitive(hSensitive);
          setFinalChecked(fChecked);

          setInitialSnapshot({
            formState: fState,
            procedures: procs,
            anticoagChecked: anticoag,
            highlySensitive: hSensitive,
            finalChecked: fChecked,
          });
        }
      } catch (err) {
        console.error("Exception loading data:", err);
      } finally {
        setLoadingData(false);
        setFormChanged(false);
      }
    };

    loadData();
  }, [location.state, inlineProps]);



  React.useLayoutEffect(() => {
    if (isReadOnlyView) return;

    const adjustLabelHeights = () => {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // On mobile/narrow screens where columns stack vertically,
        // reset all label styles to auto height and zero top padding.
        // This avoids creating unwanted big vertical whitespace gaps.
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

      // Find all question rows inside the edit view form to avoid targeting outer page containers
      const rows = document.querySelectorAll(".edit-view-form .questions-row, .edit-view-form .grid");
      rows.forEach((row) => {
        // Ensure this grid/row actually has at least one direct question-container
        if (!row.querySelector(".question-container")) return;

        // Query all question container labels under this row
        const labels = Array.from(
          row.querySelectorAll(
            ".question-container > label:not(.radio-checkbox-item)"
          )
        ) as HTMLElement[];

        // Filter labels to only include top-level field labels for this row.
        // If a label has an ancestor of class "subfield" or "subfield-wrapper" before reaching the row,
        // it is a subfield label and should not be aligned with standard top-row fields.
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

        // 1. Reset heights to auto and top-padding to 0 to safely measure the natural word-wrap height
        rowLabels.forEach((lbl) => {
          lbl.style.height = "auto";
          lbl.style.paddingTop = "0px";
          lbl.style.display = "block";
        });

        // 2. Measure actual natural heights
        const heights = rowLabels.map((lbl) => lbl.getBoundingClientRect().height);
        const maxHeight = Math.max(...heights);

        // 3. Apply the max height and adjust paddingTop to align label texts to the bottom edge.
        // This keeps upper borders of actual controls aligned without turning the labels
        // into flex column containers (which breaks natural line wrap with nested elements/spans!).
        if (maxHeight > 0) {
          rowLabels.forEach((lbl, idx) => {
            const naturalHeight = heights[idx];
            const diff = maxHeight - naturalHeight;
            lbl.style.boxSizing = "border-box";
            lbl.style.height = `${maxHeight}px`;
            lbl.style.paddingTop = `${diff}px`;
            lbl.style.display = "block"; // Keep standard block formatting context for reliable word wrap
          });
        }
      });
    };

    // Run initially using a small safe deferral to make sure the view is fully mounted and styled
    const timer = setTimeout(adjustLabelHeights, 50);

    // Recheck on window resize (especially handles switching between mobile and desktop dynamically!)
    window.addEventListener("resize", adjustLabelHeights);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustLabelHeights);
    };
  }, [
    procedures,
    isReadOnlyView,
    formState.operatingSurgeon,
    formState.imagingRequired,
    formState.risks,
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
  }, [procedures, isReadOnlyView, formState]);

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

    if (passwordTimeoutRef.current !== null) {
      window.clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = null;
    }

    try {
      let formUuid = formState.uuid;
      let version = 0;

      if (formUuid) {
        const { data: existingVersions, error: versionError } = await supabase
          .from("waiting_list_cards")
          .select("version")
          .eq("uuid", formUuid)
          .order("version", { ascending: false })
          .limit(1);

        if (versionError) throw versionError;

        if (existingVersions && existingVersions.length > 0) {
          version = existingVersions[0].version + 1;
        }
      } else {
        formUuid = crypto.randomUUID();
      }

      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        procedures,
        anticoagChecked,
        password: password,
        username: username,
        finalChecked: finalChecked,
        highlySensitive: highlySensitive,
      };

      const eventDate =
        formState.dateListed || formState.date || new Date().toISOString();

      const { error: insertError } = await supabase
        .from("waiting_list_cards")
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: eventDate,
          form_status: "final",
          form_data: formDataToSave,
        });

      if (insertError) throw insertError;

      const { error: indexError } = await supabase.from("forms_index").insert({
        form_uuid: formUuid,
        form_version: version,
        form_type: "waiting_list_card",
        patient_uuid: patient?.uuid || null,
        event_datetime: eventDate,
        document_datetime: new Date().toISOString(),
        form_status: "final",
        event_or_document: "Document",
      });

      if (indexError) throw indexError;

      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        procedures: [...procedures],
        anticoagChecked: { ...anticoagChecked },
        highlySensitive: highlySensitive,
        finalChecked: true,
      });

      setFormChanged(false);
      setPassword("");

      navigateBack();
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form: " + (error as Error).message);
    }
  };

  const handleSaveAsDraft = async () => {
    setShowDraftPopup(false);

    if (!password) {
      setShowPasswordPopup(true);
      return;
    }

    if (passwordTimeoutRef.current !== null) {
      window.clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = null;
    }

    try {
      let formUuid = formState.uuid;
      let version = 0;

      if (formUuid) {
        const { data: existingVersions, error: versionError } = await supabase
          .from("waiting_list_cards")
          .select("version")
          .eq("uuid", formUuid)
          .order("version", { ascending: false })
          .limit(1);

        if (versionError) throw versionError;

        if (existingVersions && existingVersions.length > 0) {
          version = existingVersions[0].version + 1;
        }
      } else {
        formUuid = crypto.randomUUID();
      }

      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        procedures,
        anticoagChecked,
        password: password,
        username: username,
        finalChecked: finalChecked,
        highlySensitive: highlySensitive,
      };

      const eventDate =
        formState.dateListed || formState.date || new Date().toISOString();

      const { error: insertError } = await supabase
        .from("waiting_list_cards")
        .insert({
          uuid: formUuid,
          version: version,
          patient_uuid: patient?.uuid || null,
          event_datetime: eventDate,
          form_status: "draft",
          form_data: formDataToSave,
        });

      if (insertError) throw insertError;

      const { error: indexError } = await supabase.from("forms_index").insert({
        form_uuid: formUuid,
        form_version: version,
        form_type: "waiting_list_card",
        patient_uuid: patient?.uuid || null,
        event_datetime: eventDate,
        document_datetime: new Date().toISOString(),
        form_status: "draft",
        event_or_document: "Document",
      });

      if (indexError) throw indexError;

      setInitialSnapshot({
        formState: { ...formState, uuid: formUuid },
        procedures: [...procedures],
        anticoagChecked: { ...anticoagChecked },
        highlySensitive: highlySensitive,
        finalChecked: finalChecked,
      });

      setFormChanged(false);
      setPassword("");

      navigateBack();
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft: " + (error as Error).message);
    }
  };

  const handlePasswordConfirm = (pwd: string) => {
    setPassword(pwd);
    setShowPasswordPopup(false);

    if (passwordTimeoutRef.current !== null) {
      window.clearTimeout(passwordTimeoutRef.current);
    }

    passwordTimeoutRef.current = window.setTimeout(
      () => {
        setPassword("");
      },
      10 * 60 * 1000,
    ); // 10 minutes timeout
  };

  // Procedure table functions
  const addProcedureRow = () => {
    const newId = Math.max(...procedures.map((p) => p.id)) + 1;
    setProcedures([
      ...procedures,
      { id: newId, side: "", procedure: "", additionalInfo: "", procedure_coded: false },
    ]);
    setFormChanged(true);
  };

  const deleteProcedureRow = (id: number) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((p) => p.id !== id));
      setFormChanged(true);
    }
  };

  const updateProcedure = (id: number, field: string, value: string, coded?: boolean) => {
    setProcedures(
      procedures.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          if (coded !== undefined) {
            updated[`${field}_coded`] = coded;
          }
          return updated;
        }
        return p;
      }),
    );
    setFormChanged(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRow(index);
    e.dataTransfer.effectAllowed = "move";
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
      setFormChanged(true);
    }
  };

  const handleDragEnd = () => {
    setDraggedRow(null);
  };

  return (
    <>
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
        /* Handle hover unless the required fields are incomplete and it's silver, but wait, the prompt says */
        /* "when hovered or focussed, their background color should change to the standard yellow" so yes, hover always triggers yellow */
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

        .add-procedure-btn {
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .add-procedure-btn:hover,
        .add-procedure-btn:focus-visible {
          background-color: #fee715 !important;
          color: black !important;
          border-color: #fee715 !important;
        }

        .edit-view-form .questions-row, .edit-view-form .grid {
          column-gap: 1.0rem !important;
          row-gap: 0.4rem !important;
          margin-bottom: 0.4rem !important;
          margin-top: 0 !important;
        }
        .edit-view-form .question-container {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
          box-sizing: border-box !important;
        }
        .edit-view-form .subfield {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
          box-sizing: border-box !important;
          border-radius: 0.4rem !important;
          transition: background-color 0.5s ease-out !important;
          padding-left: 0.4rem !important;
          padding-right: 0.4rem !important;
        }
        .edit-view-form .subfield.pl-6 {
          padding-left: 1.5rem !important;
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
        .edit-view-form .subfield-wrapper,
        .edit-view-form .radio-checkbox-item {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          box-sizing: border-box !important;
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
      `}</style>
      {isReadOnlyView ? (
        <WaitingListCardRoV
          patient={patient}
          formState={{ ...formState, anticoagChecked }}
          procedures={procedures}
          finalChecked={finalChecked}
          formStatus={finalChecked ? "final" : "draft"}
          openedFromPatientRecord={openedFromPatientRecord}
          username={username}
          onSwitchToEV={() => {
            setClickedRoVButton(false);
            setIsReadOnlyView(false);
          }}
          onBack={navigateBack}
          reachedByRoVButton={clickedRoVButton}
        />
      ) : (
        <FbLayout
          style={{ lineHeight: 1.1 }}
          header={
            <div
              style={{
                borderBottom: "0.2rem solid rgb(27, 110, 194)",
                marginBottom: "0.2rem",
                padding: "0.4rem",
              }}
            >
              <div className="flex justify-between items-center">
                <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>
                  Waiting list card
                </h1>
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
          <div className="space-y-4" onChange={() => setFormChanged(true)}>
                  {/* Section 1: From */}
                  <FbSection id="section-from" title="From">
                    <FbQuestionRow cols={4}>
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

                      <FbQuestion label="Senior responsible clinician" required={true}>
                        <MSISelector
                          key={`seniorClinician-${viewChangeCounter.current}`}
                          name="seniorClinician"
                          value={formState.seniorClinician || ""}
                          coded={formState.seniorClinician_coded}
                          onChange={(value, coded) =>
                            handleFieldChange("seniorClinician", value, coded)
                          }
                          required
                          hasLabel={false}
                        />
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>

                  {/* Section 2: Listing and priority */}
                  <FbSection id="section-listing" title="Listing and priority">
                    {/* Row 1 */}
                    <FbQuestionRow cols={3}>
                      <FbQuestion label="Date listed" required={true}>
                        <DateControl
                          key={`dateListed-${viewChangeCounter.current}`}
                          name="dateListed"
                          value={formState.dateListed || ""}
                          onChange={(value) =>
                            handleFieldChange("dateListed", value)
                          }
                          required
                        />
                      </FbQuestion>

                      <div className="md:col-span-2">
                        <FbQuestion label="Listed by">
                          <MSISelector
                            key={`listedBy-${viewChangeCounter.current}`}
                            name="listedBy"
                            value={formState.listedBy || ""}
                            coded={formState.listedBy_coded}
                            onChange={(value, coded) =>
                              handleFieldChange("listedBy", value, coded)
                            }
                            hasLabel={false}
                          />
                        </FbQuestion>
                      </div>
                    </FbQuestionRow>

                    {/* Row 2 - 4-column row containing Urgency, Operating surgeon, Patient available at short notice, and Royal College of Surgeons priority */}
                    <FbQuestionRow cols={4}>
                      <FbQuestion label="Urgency" required={true}>
                        <div className="flex flex-col">
                          {["routine", "urgent", "usc"].map((val) => (
                            <FbRadio
                              key={val}
                              name="urgency"
                              value={val}
                              checked={formState.urgency === val}
                              onChange={(e) =>
                                handleFieldChange("urgency", e.target.value)
                              }
                              label={
                                val === "routine"
                                  ? "Routine"
                                  : val === "urgent"
                                    ? "Urgent"
                                    : "USC (Urgent Suspected Cancer)"
                              }
                              required
                            />
                          ))}
                        </div>
                      </FbQuestion>

                      <FbQuestion label="Operating surgeon">
                        <div className="flex flex-col">
                          {[
                            {
                              label: "Any grade with supervision",
                              value: "supervision",
                            },
                            {
                              label: "Discuss with consultant",
                              value: "discuss",
                            },
                            { label: "Consultant only", value: "consultant" },
                            {
                              label: "Named clinician",
                              value: "named_clinician",
                            },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="operatingSurgeon"
                              value={opt.value}
                              checked={formState.operatingSurgeon === opt.value}
                              onChange={(e) =>
                                handleFieldChange(
                                  "operatingSurgeon",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            >
                              {opt.value === "named_clinician" && (
                                <MSISelector
                                  name="namedClinicianName"
                                  required={true}
                                  hasLabel={false}
                                  placeholder="Type to search staff index"
                                  value={formState.namedClinicianName || ""}
                                  onChange={(value) =>
                                    handleFieldChange("namedClinicianName", value)
                                  }
                                />
                              )}
                            </FbRadio>
                          ))}
                        </div>
                      </FbQuestion>

                      <FbQuestion label="Patient available at short notice">
                        <div className="flex flex-col">
                          {[
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="shortNotice"
                              value={opt.value}
                              checked={formState.shortNotice === opt.value}
                              onChange={(e) =>
                                handleFieldChange(
                                  "shortNotice",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </FbQuestion>

                      <FbQuestion label="Royal College of Surgeons priority">
                        <div className="flex flex-col">
                          {[
                            { label: "2: Within 4 weeks", value: "p2" },
                            { label: "3: Within 3 months", value: "p3" },
                            {
                              label: "4: Can be delayed more than 3 months",
                              value: "p4",
                            },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="rcsPriority"
                              value={opt.value}
                              checked={formState.rcsPriority === opt.value}
                              onChange={(e) =>
                                handleFieldChange(
                                  "rcsPriority",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>

                  {/* Section 3: Planned procedure(s) */}
                  <FbSection id="section-procedure" title="Planned procedure(s)">
                    <div
                      style={{ marginTop: "0.4rem", marginBottom: "0.6rem" }}
                      className="space-y-4"
                    >
                      <table
                        className="min-w-full text-left font-sans font-light"
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr style={{ borderBottom: "1px solid silver" }}>
                            <th style={{ width: "5%", padding: "0px 0.4rem" }}></th>
                            <th
                              style={{
                                width: "20%",
                                padding: "0px 0.4rem",
                                fontFamily: "'Roboto', sans-serif",
                                fontSize: "0.8rem",
                                fontStyle: "italic",
                                fontWeight: 300,
                                color: "#555555",
                              }}
                            >
                              Side
                            </th>
                            <th
                              style={{
                                width: "65%",
                                padding: "0px 0.4rem",
                                fontFamily: "'Roboto', sans-serif",
                                fontSize: "0.8rem",
                                fontStyle: "italic",
                                fontWeight: 300,
                                color: "#555555",
                              }}
                            >
                              Procedure
                            </th>
                            <th
                              style={{ width: "10%", padding: "0px 0.4rem" }}
                            ></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === '')) && (
                            <tr>
                              <td colSpan={4} className="p-2" style={{fontSize: '0.8rem', fontWeight: 500, fontStyle: 'italic', color: '#d50000', borderBottom: '1px solid silver'}}>
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
                              className={`border-b border-gray-100 ${draggedRow === index ? "bg-blue-50" : ""}`}
                            >
                              <FbTableCell
                                title="Drag up or down to order list"
                                style={{
                                  cursor: "grab",
                                  textAlign: "center",
                                  borderBottom: "none",
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{
                                    fontSize: "1.2rem",
                                    color: "#1b6ec2",
                                    verticalAlign: "middle",
                                    border: "none",
                                  }}
                                >
                                  swap_vertical_circle
                                </span>
                              </FbTableCell>
                              <FbTableCell>
                                <FbDropdown
                                  name={`side-${proc.id}`}
                                  value={proc.side}
                                  onChange={(value) =>
                                    updateProcedure(
                                      proc.id,
                                      "side",
                                      value,
                                    )
                                  }
                                  placeholder="Select side"
                                  options={[
                                    { value: "left", label: "Left" },
                                    { value: "right", label: "Right" },
                                    { value: "bilateral", label: "Bilateral" },
                                    { value: "na", label: "Not applicable" },
                                  ]}
                                  selectStyle={{ height: "auto" }}
                                />
                              </FbTableCell>
                              <FbTableCell>
                                <SCTProcedureSelector
                                  value={proc.procedure || ""}
                                  coded={proc.procedure_coded}
                                  onChange={(val, coded) =>
                                    updateProcedure(proc.id, "procedure", val, coded)
                                  }
                                />
                              </FbTableCell>
                              <FbTableCell
                                style={{
                                  textAlign: "center",
                                }}
                              >
                                {procedures.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => deleteProcedureRow(proc.id)}
                                    title="Delete row"
                                    className="text-red-600 hover:text-red-800 inline-flex items-center justify-center align-middle"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      outline: "none",
                                    }}
                                  >
                                    <span
                                      className="material-icons"
                                      style={{ fontSize: "1.2rem" }}
                                    >
                                      highlight_off
                                    </span>
                                  </button>
                                )}
                              </FbTableCell>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <AddButton
                        label="Add procedure"
                        onClick={addProcedureRow}
                      />
                    </div>
                  </FbSection>

                  {/* Section 4: Specific operative risks */}
                  <FbSection id="section-risks" title="Specific operative risks">
                    <FbQuestionRow cols={3}>
                      {/* Column 1: Risks */}
                      <FbQuestion label="Risks">
                        <div className="flex flex-col">
                          {[
                            { label: "Diabetic", value: "diabetic" },
                            { label: "Latex allergy", value: "latex" },
                            { label: "MRSA", value: "mrsa" },
                            {
                              label: "Pacemaker/implant",
                              value: "pacemaker",
                            },
                            {
                              label: "Blood transfusion refusal",
                              value: "blood",
                            },
                          ].map((opt) => (
                            <FbCheck
                              key={opt.value}
                              name="risk"
                              value={opt.value}
                              checked={(formState.risks || []).includes(opt.value)}
                              onChange={(e) =>
                                handleRiskChange(
                                  opt.value,
                                  e.target.checked,
                                )
                              }
                              label={opt.label}
                            />
                          ))}

                          {/* Reactions */}
                          <FbCheck
                            name="risk"
                            value="reactions"
                            checked={(formState.risks || []).includes("reactions")}
                            onChange={(e) =>
                              handleRiskChange(
                                "reactions",
                                e.target.checked,
                              )
                            }
                            label="Previous anaesthetic reactions"
                          >
                            <div className="subfield">
                              <FbTextArea
                                id="riskReactionsDetail"
                                name="riskReactionsDetail"
                                label="Details"
                                subfield={true}
                                value={formState.riskReactionsDetail || ""}
                                onChange={(value) =>
                                  handleFieldChange("riskReactionsDetail", value)
                                }
                                rows={2}
                              />
                            </div>
                          </FbCheck>

                          {/* Other */}
                          <FbCheck
                            name="risk"
                            value="other"
                            checked={(formState.risks || []).includes("other")}
                            onChange={(e) =>
                              handleRiskChange("other", e.target.checked)
                            }
                            label="Other"
                          >
                            <div className="subfield">
                              <FbTextArea
                                id="riskOtherDetail"
                                name="riskOtherDetail"
                                required={true}
                                placeholder="Other risks"
                                subfield={true}
                                value={formState.riskOtherDetail || ""}
                                onChange={(value) =>
                                  handleFieldChange("riskOtherDetail", value)
                                }
                              />
                            </div>
                          </FbCheck>
                        </div>
                      </FbQuestion>

                      {/* Column 2: Anticoagulants */}
                      <FbQuestion label="Anticoagulants and antiplatelet agents">
                        <div className="flex flex-col">
                          {/* DOAC */}
                          <FbCheck
                            name="anticoag-doac"
                            checked={anticoagChecked.doac}
                            onChange={(e) => {
                              setAnticoagChecked((prev) => ({
                                ...prev,
                                doac: e.target.checked,
                              }));
                              setFormChanged(true);
                            }}
                            label="DOAC"
                          >
                            <div className="flex flex-col">
                              <FbTextInput
                                id="doac-name"
                                name="doac-name"
                                label="Drug name"
                                required={true}
                                subfield={true}
                                value={formState["doac-name"] || ""}
                                onChange={(value) =>
                                  handleFieldChange("doac-name", value)
                                }
                              />
                              <div className="subfield">
                                <label className="block" style={{ fontWeight: 300, fontSize: "1rem" }}>
                                  Indication
                                </label>
                                <div className="space-y-1">
                                  {[
                                    {
                                      label: "DVT/PE (acute)",
                                      value: "dvt-pe-acute",
                                    },
                                    {
                                      label: "DVT/PE (prevention)",
                                      value: "dvt-pe-prev",
                                    },
                                    {
                                      label: "Atrial fibrillation",
                                      value: "af",
                                    },
                                    { label: "Other", value: "other" },
                                  ].map((ind) => (
                                    <FbRadio
                                      key={ind.value}
                                      name="doac-indication"
                                      value={ind.value}
                                      checked={
                                        formState["doac-indication"] ===
                                        ind.value
                                      }
                                      onChange={(e) =>
                                        handleFieldChange(
                                          "doac-indication",
                                          e.target.value,
                                        )
                                      }
                                      label={ind.label}
                                    />
                                  ))}
                                </div>
                                {formState["doac-indication"] === "other" && (
                                  <div className="mt-1">
                                    <FbTextInput
                                      id="doac-indication-other"
                                      name="doac-indication-other"
                                      placeholder="Specify"
                                      value={formState["doac-indication-other"] || ""}
                                      onChange={(value) =>
                                        handleFieldChange(
                                          "doac-indication-other",
                                          value,
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </FbCheck>

                          {/* Warfarin */}
                          <FbCheck
                            name="anticoag-warfarin"
                            checked={anticoagChecked.warfarin}
                            onChange={(e) => {
                              setAnticoagChecked((prev) => ({
                                ...prev,
                                warfarin: e.target.checked,
                              }));
                              setFormChanged(true);
                            }}
                            label="Warfarin"
                          >
                            <div className="flex flex-col">
                              <div>
                                <label className="block" style={{ fontWeight: 300, fontSize: "1rem" }}>
                                  Indication
                                </label>
                                <div className="space-y-1">
                                  {[
                                    {
                                      label: "DVT/PE (acute)",
                                      value: "dvt-pe-acute",
                                    },
                                    {
                                      label: "DVT/PE (prevention)",
                                      value: "dvt-pe-prev",
                                    },
                                    {
                                      label: "Atrial fibrillation",
                                      value: "af",
                                    },
                                    { label: "Other", value: "other" },
                                  ].map((ind) => (
                                    <FbRadio
                                      key={ind.value}
                                      name="warfarin-indication"
                                      value={ind.value}
                                      checked={
                                        formState["warfarin-indication"] === ind.value
                                      }
                                      onChange={(e) =>
                                        handleFieldChange(
                                          "warfarin-indication",
                                          e.target.value,
                                        )
                                      }
                                      label={ind.label}
                                    />
                                  ))}
                                </div>
                                {formState["warfarin-indication"] === "other" && (
                                  <div className="mt-1">
                                    <FbTextInput
                                      id="warfarin-indication-other"
                                      name="warfarin-indication-other"
                                      placeholder="Specify"
                                      value={formState["warfarin-indication-other"] || ""}
                                      onChange={(value) =>
                                        handleFieldChange(
                                          "warfarin-indication-other",
                                          value,
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </FbCheck>

                          {/* Aspirin */}
                          <FbCheck
                            name="anticoag-aspirin"
                            checked={anticoagChecked.aspirin}
                            onChange={(e) => {
                              setAnticoagChecked((prev) => ({
                                ...prev,
                                aspirin: e.target.checked,
                              }));
                              setFormChanged(true);
                            }}
                            label="Aspirin"
                          >
                            <div className="flex flex-col">
                              <div className="subfield">
                                <label className="block" style={{ fontWeight: 300, fontSize: "1rem" }}>
                                  Indication
                                </label>
                                <div className="space-y-1">
                                  {[
                                    { label: "Pain", value: "pain" },
                                    {
                                      label: "Stroke prevention",
                                      value: "stroke",
                                    },
                                    { label: "Other", value: "other" },
                                  ].map((ind) => (
                                    <FbRadio
                                      key={ind.value}
                                      name="aspirin-indication"
                                      value={ind.value}
                                      checked={
                                        formState["aspirin-indication"] === ind.value
                                      }
                                      onChange={(e) =>
                                        handleFieldChange(
                                          "aspirin-indication",
                                          e.target.value,
                                        )
                                      }
                                      label={ind.label}
                                    />
                                  ))}
                                </div>
                                {formState["aspirin-indication"] === "other" && (
                                  <div className="mt-1">
                                    <FbTextInput
                                      id="aspirin-indication-other"
                                      name="aspirin-indication-other"
                                      placeholder="Specify"
                                      value={formState["aspirin-indication-other"] || ""}
                                      onChange={(value) =>
                                        handleFieldChange(
                                          "aspirin-indication-other",
                                          value,
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="subfield">
                                <label className="block" style={{ fontWeight: 300, fontSize: "1rem" }}>
                                  Dose
                                </label>
                                <div className="space-y-1">
                                  {[
                                    { label: "75mg", value: "75mg" },
                                    { label: "300mg", value: "300mg" },
                                    { label: "Other", value: "other" },
                                  ].map((d) => (
                                    <FbRadio
                                      key={d.value}
                                      name="aspirin-dose"
                                      value={d.value}
                                      checked={
                                        formState["aspirin-dose"] === d.value
                                      }
                                      onChange={(e) =>
                                        handleFieldChange(
                                          "aspirin-dose",
                                          e.target.value,
                                        )
                                      }
                                      label={d.label}
                                    />
                                  ))}
                                </div>
                                {formState["aspirin-dose"] === "other" && (
                                  <div className="mt-1">
                                    <FbTextInput
                                      id="aspirin-dose-other"
                                      name="aspirin-dose-other"
                                      placeholder="Specify"
                                      value={formState["aspirin-dose-other"] || ""}
                                      onChange={(value) =>
                                        handleFieldChange(
                                          "aspirin-dose-other",
                                          value,
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </FbCheck>

                          {/* Clopidogrel */}
                          <FbCheck
                            name="anticoag-clopidogrel"
                            checked={anticoagChecked.clopidogrel}
                            onChange={(e) => {
                              setAnticoagChecked((prev) => ({
                                ...prev,
                                clopidogrel: e.target.checked,
                              }));
                              setFormChanged(true);
                            }}
                            label="Clopidogrel"
                          />

                          {/* Other anticoagulant */}
                          <FbCheck
                            name="anticoag-other"
                            checked={anticoagChecked.other}
                            onChange={(e) => {
                              setAnticoagChecked((prev) => ({
                                ...prev,
                                other: e.target.checked,
                              }));
                              setFormChanged(true);
                            }}
                            label="Other anticoagulant or antiplatelet"
                          >
                            <div className="flex flex-col">
                              <FbTextInput
                                id="anticoag-other-med"
                                name="anticoag-other-med"
                                label="Medication and dose"
                                required={true}
                                subfield={true}
                                value={formState["anticoag-other-med"] || ""}
                                onChange={(value) =>
                                  handleFieldChange("anticoag-other-med", value)
                                }
                              />
                              <FbTextInput
                                id="anticoag-other-indication"
                                name="anticoag-other-indication"
                                label="Indication"
                                required={true}
                                subfield={true}
                                value={formState["anticoag-other-indication"] || ""}
                                onChange={(value) =>
                                  handleFieldChange("anticoag-other-indication", value)
                                }
                              />
                            </div>
                          </FbCheck>
                        </div>
                      </FbQuestion>

                      {/* Column 3: Intructions text */}
                      <FbQuestion label="Surgeon's specific anticoagulant instructions">
                        <FbTextArea
                          id="anticoagInstructions"
                          name="anticoagInstructions"
                          value={formState.anticoagInstructions || ""}
                          onChange={(value) =>
                            handleFieldChange("anticoagInstructions", value)
                          }
                        />
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>

                  {/* Section 5: Pre-operative */}
                  <FbSection id="section-preop" title="Pre-operative">
                    <FbQuestionRow cols={4}>
                      <FbQuestion label="Intended management" required={true}>
                        <div className="flex flex-col">
                          {[
                            { label: "Outpatient", value: "outpatient" },
                            { label: "Daycase", value: "daycase" },
                            { label: "Inpatient", value: "inpatient" },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="intendedManagement"
                              value={opt.value}
                              checked={
                                formState.intendedManagement === opt.value
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "intendedManagement",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </FbQuestion>

                      <FbNumberInput
                        id="admitBefore"
                        name="admitBefore"
                        label="Admit before surgery"
                        value={formState.admitBefore !== undefined ? formState.admitBefore : 0}
                        onChange={(value) => handleFieldChange("admitBefore", parseInt(value) || 0)}
                        units="days"
                        min={0}
                      />

                      <FbQuestion label="Estimated date of admission">
                        <DateControl
                          key={`estimatedAdmission-${viewChangeCounter.current}`}
                          name="estimatedAdmission"
                          value={formState.estimatedAdmission || ""}
                          onChange={(value) =>
                            handleFieldChange("estimatedAdmission", value)
                          }
                        />
                      </FbQuestion>

                      <FbQuestion label="Pre-operative imaging required">
                        <div className="flex flex-col">
                          <FbRadio
                            name="imagingRequired"
                            value="yes"
                            checked={formState.imagingRequired === "yes"}
                            onChange={(e) =>
                              handleFieldChange(
                                "imagingRequired",
                                e.target.value,
                              )
                            }
                            label="Yes"
                          >
                            <div className="subfield">
                              <FbTextArea
                                id="imagingDetails"
                                name="imagingDetails"
                                label="Details"
                                subfield={true}
                                value={formState.imagingDetails || ""}
                                onChange={(value) =>
                                  handleFieldChange("imagingDetails", value)
                                }
                                rows={2}
                              />
                            </div>
                          </FbRadio>
                          <FbRadio
                            name="imagingRequired"
                            value="no"
                            checked={formState.imagingRequired === "no"}
                            onChange={(e) =>
                              handleFieldChange(
                                "imagingRequired",
                                e.target.value,
                              )
                            }
                            label="No"
                          />
                          <FbRadio
                            name="imagingRequired"
                            value="unknown"
                            checked={formState.imagingRequired === "unknown"}
                            onChange={(e) =>
                              handleFieldChange(
                                "imagingRequired",
                                e.target.value,
                              )
                            }
                            label="Unknown or not recorded"
                          />
                        </div>
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>

                  {/* Section 6: Anaesthesia */}
                  <FbSection id="section-anaesthesia" title="Anaesthesia">
                    <FbQuestionRow cols={3}>
                      <FbQuestion label="Planned anaesthetic type">
                        <div className="flex flex-col">
                          {[
                            { label: "General", value: "general" },
                            { label: "Regional", value: "regional" },
                            { label: "Local", value: "local" },
                            { label: "None", value: "none" },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="anaestheticType"
                              value={opt.value}
                              checked={
                                formState.anaestheticType === opt.value
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "anaestheticType",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </FbQuestion>
                      <FbQuestion
                        label="Anaesthesia special requirements or issues"
                        className="md:col-span-2"
                      >
                        <FbTextArea
                          id="anaesthesiaRequirements"
                          name="anaesthesiaRequirements"
                          value={formState.anaesthesiaRequirements || ""}
                          onChange={(value) =>
                            handleFieldChange("anaesthesiaRequirements", value)
                          }
                        />
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>

                  {/* Section 7: Post-op */}
                  <FbSection id="section-postop" title="Post-op">
                    <FbQuestionRow cols={3}>
                      <FbNumberInput
                        id="postopStay"
                        name="postopStay"
                        label="Planned length of post-op stay"
                        value={formState.postopStay !== undefined ? formState.postopStay : ""}
                        onChange={(value) => handleFieldChange("postopStay", parseInt(value) || 0)}
                        units="days"
                        min={0}
                      />
                      <FbQuestion label="Bed requirement">
                        <div className="flex flex-col justify-start">
                          {[
                            { label: "ITU: Intensive care bed", value: "itu" },
                            { label: "HDU: High dependency bed", value: "hdu" },
                            { label: "PACU: Post-anaesthetic care unit bed", value: "pacu" },
                            { label: "Ward bed", value: "ward" },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="bedRequirement"
                              value={opt.value}
                              checked={
                                formState.bedRequirement === opt.value
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "bedRequirement",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </FbQuestion>
                      <FbQuestion label="Special post-op requirements">
                        <FbTextArea
                          id="postopRequirements"
                          name="postopRequirements"
                          value={formState.postopRequirements || ""}
                          onChange={(value) =>
                            handleFieldChange("postopRequirements", value)
                          }
                        />
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>

                  {/* Section 8: Other */}
                  <FbSection id="section-other" title="Other">
                    <FbQuestionRow cols={3}>
                      <FbQuestion label="Could this case be outsourced?">
                        <div className="flex flex-col">
                          {[
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                            {
                              label: "Unknown or not recorded",
                              value: "unknown",
                            },
                          ].map((opt) => (
                            <FbRadio
                              key={opt.value}
                              name="outsourcing"
                              value={opt.value}
                              checked={formState.outsourcing === opt.value}
                              onChange={(e) =>
                                handleFieldChange(
                                  "outsourcing",
                                  e.target.value,
                                )
                              }
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </FbQuestion>
                      <FbQuestion label="Any other information" className="md:col-span-2">
                        <FbTextArea
                          id="otherInfo"
                          name="otherInfo"
                          value={formState.otherInfo || ""}
                          onChange={(value) =>
                            handleFieldChange("otherInfo", value)
                          }
                        />
                      </FbQuestion>
                    </FbQuestionRow>
                  </FbSection>
                </div>
        </FbLayout>
      )}

      {/* Popups */}
      {showDraftPopup && (
        <DraftPopup
          onSaveDraft={handleSaveAsDraft}
          onCancel={() => setShowDraftPopup(false)}
        />
      )}

      {showPasswordPopup && (
        <PasswordPopup
          onConfirm={handlePasswordConfirm}
          onCancel={() => setShowPasswordPopup(false)}
        />
      )}
    </>
  );
}
