import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbAddFormMenu as AddFormMenu } from './components/fbAddFormMenu';
import { fbButton as FbButton } from './components/fbButton';
import { fbUserName as FbUserName } from './components/fbUserName';
import { fbOutpatientAppointmentTile as OutpatientAppointmentTile } from './components/fbOutpatientAppointmentTile';
import { fbFormTile as FormTile } from './components/fbFormTile';
import { fbDraftBadge as DraftBadge } from './components/fbDraftBadge';
import { fbAddButtonForPage as AddButtonForPage } from './components/fbAddButtonForPage';
import WaitingListCard from './WaitingListCard';
import OperationNote from './OperationNote';
import OutpatientOutcome from './OutpatientOutcome';
import { specialities } from './data/specialities';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Create Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

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

interface FormIndexItem {
  form_uuid: string;
  form_version: number;
  form_type: string;
  patient_uuid: string;
  event_datetime: string;
  document_datetime: string | null;
  form_status: string;
  event_or_document?: 'Event' | 'Document';
  details?: string;
  speciality?: string;
  organisation?: string;
  hospital?: string;
  senior_responsible_clinician?: string;
}

interface PatientRecordProps {
  patientUuid?: string;
  username?: string;
  onClose?: () => void;
  inline?: boolean;
}

export default function PatientRecord({
  patientUuid: propPatientUuid,
  username: propUsername,
  onClose,
  inline = false
}: PatientRecordProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [forms, setForms] = React.useState<FormIndexItem[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Search/Registry persistence for username
  const [username, setUsername] = React.useState<string>(() => {
    return localStorage.getItem('fb_username') || propUsername || 'demoUser';
  });

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    localStorage.setItem('fb_username', val);
  };

  // State & Ref for the AddFormMenu dropdown (bottom-left AddButton trigger)
  const [showAddMenu, setShowAddMenu] = React.useState<boolean>(false);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);

  // Local state to keep track of actively opened forms/documents inline
  const [inlineActiveForm, setInlineActiveForm] = React.useState<{
    formType: 'waiting_list_card' | 'operation_note' | 'outpatient_outcome';
    formUuid?: string;
    appointmentUuid?: string;
    openInRoV?: boolean;
  } | null>(null);

  // Parse location state to see if patientUuid was passed
  const state = location.state as { patientUuid?: string; from?: string } | null;
  const patientUuid = inline ? propPatientUuid : (state?.patientUuid || '12345678-1234-1234-1234-123456789012');

  const fetchPatientAndForms = async (options: { showLoading?: boolean } = {}) => {
    const showLoading = options.showLoading !== false;
    try {
      if (showLoading) {
        setLoading(true);
      }

      // Fetch latest version of patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('uuid', patientUuid)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (patientError) {
        console.error('Error fetching patient:', patientError);
      } else {
        setPatient(patientData);
      }

      // Fetch forms for patient_uuid via forms_index
      const { data: formIndexData, error: formIndexError } = await supabase
        .from('forms_index_current')
        .select('*')
        .eq('patient_uuid', patientUuid)
        .order('event_datetime', { ascending: false });

      if (formIndexError) {
        console.error('Error fetching form index:', formIndexError);
      } else {
        setForms(formIndexData || []);

        // Lazy/targeted secondary query: Fetch metadata ONLY for the specific appointments found in the main forms list
        const apptUuids = (formIndexData || [])
          .filter(f => f.form_type === 'outpatient_appointment')
          .map(f => f.form_uuid);

        if (apptUuids.length > 0) {
          const { data: apptsData, error: apptsError } = await supabase
            .from('outpatient_appointments')
            .select('*')
            .in('uuid', apptUuids);

          if (apptsError) {
            console.error('Error fetching targeted appointment details:', apptsError);
          } else {
            setAppointments(apptsData || []);
          }
        } else {
          setAppointments([]);
        }
      }

    } catch (err) {
      console.error('Exception fetching patient record data:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    fetchPatientAndForms();
  }, [patientUuid]);

  React.useEffect(() => {
    sessionStorage.setItem('fb_prev_main_page', '/patient-record');
    if (patientUuid) {
      sessionStorage.setItem('fb_prev_patient_uuid', patientUuid);
    }
  }, [patientUuid]);

  // Translate form type to display name
  const getFormTypeDisplay = (type: string) => {
    if (type === 'waiting_list_card') return 'Waiting list card';
    if (type === 'operation_note') return 'Operation note';
    if (type === 'outpatient_outcome') return 'Outpatient outcome';
    if (type === 'outpatient_appointment') return 'Outpatient appointment';
    return type;
  };

  const handleFormClick = (form: FormIndexItem) => {
    setInlineActiveForm({
      formType: form.form_type as any,
      formUuid: form.form_uuid,
      openInRoV: true // clicking directly on standard record always opens in Read-Only unless otherwise selected
    });
  };

  const handleAppointmentClick = (form: FormIndexItem) => {
    const appt = appointments.find(a => a.uuid === form.form_uuid);
    if (!appt) {
      console.error('Appointment not found:', form.form_uuid);
      return;
    }

    if (appt.outcome_form_uuid) {
      const matchingForm = forms.find(f => f.form_uuid === appt.outcome_form_uuid);
      const isFinal = matchingForm?.form_status === 'final';
      setInlineActiveForm({
        formType: 'outpatient_outcome',
        formUuid: appt.outcome_form_uuid,
        openInRoV: isFinal
      });
    } else {
      setInlineActiveForm({
        formType: 'outpatient_outcome',
        appointmentUuid: appt.uuid,
        openInRoV: false
      });
    }
  };

  const handleAddNewForm = (formType: string) => {
    let resolvedType: any = formType;
    if (formType === 'waiting-list') resolvedType = 'waiting_list_card';
    if (formType === 'operation-note') resolvedType = 'operation_note';
    if (formType === 'outpatient-outcome') resolvedType = 'outpatient_outcome';

    setInlineActiveForm({
      formType: resolvedType,
      openInRoV: false
    });
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };

  const handleClose = () => {
    if (inline && onClose) {
      onClose();
      return;
    }
    const fromPath = (location.state as any)?.from || '/';
    navigate(fromPath);
  };

  const getSpecialityDisplay = (specVal?: string) => {
    if (!specVal) return '';
    const found = specialities.find(s => s.value === specVal || s.value.toLowerCase() === specVal.toLowerCase());
    return found ? found.label : specVal;
  };

  const renderBadge = (form: FormIndexItem) => {
    if (form.form_type === 'outpatient_appointment') {
      const appt = appointments.find(a => a.uuid === form.form_uuid);
      const isFuture = new Date(form.event_datetime) > new Date();

      if (isFuture) {
        return (
          <div style={{
            backgroundColor: '#2e7d32', // green
            color: 'white',
            fontWeight: 700,
            padding: '0.2rem 0.4rem',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            display: 'inline-block',
            lineHeight: 1.2
          }}>
            Future appt
          </div>
        );
      } else {
        const outcomeFormUuid = appt?.outcome_form_uuid;
        const matchingFormStatus = forms.find(f => f.form_uuid === outcomeFormUuid)?.form_status;
        const hasFinalOutcome = matchingFormStatus === 'final';

        if (!hasFinalOutcome) {
          return (
            <div style={{
              backgroundColor: '#d50000', // red
              color: 'white',
              fontWeight: 700,
              padding: '0.2rem 0.4rem',
              fontFamily: "'Roboto', sans-serif",
              fontSize: '1rem',
              display: 'inline-block',
              lineHeight: 1.2
            }}>
              Not outcomed
            </div>
          );
        }
      }
      return null;
    }

    if (form.form_status === 'draft') {
      return <DraftBadge />;
    }

    return null;
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Roboto', sans-serif",
      backgroundColor: 'white'
    }}>

      {/* Main Patient Record Page UI container */}
      <div
        id="patient-record-page-container"
        style={{
          display: inlineActiveForm ? 'none' : 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Top Banner section */}
        <div style={{
          borderBottom: '0.2rem solid rgb(27, 110, 194)',
          padding: '0.4rem',
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center'
        }} className="flex-shrink-0">
          <h1 style={{ fontSize: '2rem', fontWeight: 500, margin: 0, cursor: 'pointer', color: 'black' }} onClick={() => navigate('/')}>
            Patient record
          </h1>
          <div className="flex-1"></div>
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

        {/* List of documents (forms_index) taking full width (no left gray column) */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading forms...</div>
          ) : forms.length === 0 ? (
            <div style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
              No forms recorded for this patient yet. Use the button in the bottom left corner to add a form.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {forms.map((form) => {
                const isAppointment = form.form_type === 'outpatient_appointment';
                const appt = isAppointment ? appointments.find(a => a.uuid === form.form_uuid) : null;
                const clinicName = appt?.clinic_name || '';
                const isFutureAppointment = isAppointment && (new Date(form.event_datetime) > new Date());

                return (
                  <div
                    key={form.form_uuid}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '170px 1fr auto',
                      alignItems: 'start',
                      gap: '1.5rem',
                      borderBottom: '1px solid silver',
                      padding: '0.2rem 0'
                    }}
                  >
                    {/* Column 1: Badge */}
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'flex-start' }}>
                      {renderBadge(form)}
                    </div>

                    {/* Column 2: Custom Tile Component or Form details */}
                    <div>
                      {isAppointment ? (
                        <OutpatientAppointmentTile
                          dateTime={formatDateTime(form.event_datetime)}
                          clinicName={clinicName}
                          speciality={getSpecialityDisplay(form.speciality)}
                          src={form.senior_responsible_clinician || ''}
                        />
                      ) : (
                        <FormTile
                          dateTime={formatDateTime(form.document_datetime || form.event_datetime)}
                          formTypeName={getFormTypeDisplay(form.form_type)}
                          speciality={getSpecialityDisplay(form.speciality)}
                          src={form.senior_responsible_clinician || ''}
                        />
                      )}
                    </div>

                    {/* Column 3: Blue on White Buttons */}
                    <div>
                      {isAppointment ? (
                        !isFutureAppointment && (
                          <FbButton
                            variant="primary"
                            onClick={() => handleAppointmentClick(form)}
                            id={`outcome-btn-${form.form_uuid}`}
                          >
                            Outcome form
                          </FbButton>
                        )
                      ) : (
                        <FbButton
                          variant="primary"
                          onClick={() => handleFormClick(form)}
                          id={`open-btn-${form.form_uuid}`}
                        >
                          Open
                        </FbButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Control bar */}
        <div
          className="bottom-control-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'white',
            borderTop: '0.2rem solid rgb(27, 110, 194)',
            minHeight: '2.8rem',
            boxSizing: 'border-box',
            zIndex: 100 // ensure dropdown fits nicely
          }}
        >
          {/* New form / document button in the bottom left corner */}
          <div style={{ position: 'relative' }}>
            <AddButtonForPage
              ref={addButtonRef as any}
              label="New form or document"
              id="new-form-document-button"
              onClick={() => setShowAddMenu(prev => !prev)}
            />
            {showAddMenu && (
              <AddFormMenu
                buttonRef={addButtonRef}
                onSelectFormType={(type) => {
                  setShowAddMenu(false);
                  const mappedType = type.replace('_', '-');
                  handleAddNewForm(mappedType);
                }}
                onCancel={() => setShowAddMenu(false)}
              />
            )}
          </div>

          {/* User Name input and Close button in the bottom right corner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FbUserName
                value={username}
                onChange={handleUsernameChange}
                style={{ width: '10rem' }}
              />
            </div>

            <FbButton variant="primary" onClick={handleClose} id="patient-record-close-button">
              Close
            </FbButton>
          </div>
        </div>

      </div>

      {/* Render selected active form inline if present and hide parent container */}
      {inlineActiveForm && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {inlineActiveForm.formType === 'waiting_list_card' && (
            <WaitingListCard
              inlineProps={{
                patientUuid: patient?.uuid,
                formUuid: inlineActiveForm.formUuid,
                openInRoV: inlineActiveForm.openInRoV,
                onClose: () => {
                  setInlineActiveForm(null);
                  fetchPatientAndForms({ showLoading: false });
                }
              }}
            />
          )}
          {inlineActiveForm.formType === 'operation_note' && (
            <OperationNote
              inlineProps={{
                patientUuid: patient?.uuid,
                formUuid: inlineActiveForm.formUuid,
                openInRoV: inlineActiveForm.openInRoV,
                onClose: () => {
                  setInlineActiveForm(null);
                  fetchPatientAndForms({ showLoading: false });
                }
              }}
            />
          )}
          {inlineActiveForm.formType === 'outpatient_outcome' && (
            <OutpatientOutcome
              inlineProps={{
                patientUuid: patient?.uuid,
                formUuid: inlineActiveForm.formUuid,
                appointmentUuid: inlineActiveForm.appointmentUuid,
                openInRoV: inlineActiveForm.openInRoV,
                onClose: () => {
                  setInlineActiveForm(null);
                  fetchPatientAndForms({ showLoading: false });
                }
              }}
            />
          )}
        </div>
      )}

    </div>
  );
}
