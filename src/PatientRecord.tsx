import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbAddFormMenu as AddFormMenu } from './components/fbAddFormMenu';
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
  document_datetime: string;
  form_status: 'draft' | 'final';
}

export default function PatientRecord() {
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [forms, setForms] = React.useState<FormIndexItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  // State & Ref for the AddFormMenu dropdown
  const [showAddMenu, setShowAddMenu] = React.useState<boolean>(false);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);

  // Parse location state to see if patientUuid was passed
  const state = location.state as { patientUuid?: string } | null;
  const patientUuid = state?.patientUuid || '12345678-1234-1234-1234-123456789012'; // Default demo patient

  React.useEffect(() => {
    const fetchPatientAndForms = async () => {
      try {
        setLoading(true);

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
        }

      } catch (err) {
        console.error('Exception fetching patient record data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAndForms();
  }, [patientUuid]);

  // Translate form type to display name
  const getFormTypeDisplay = (type: string) => {
    if (type === 'waiting_list_card') return 'Waiting list card';
    if (type === 'operation_note') return 'Operation note';
    if (type === 'outpatient_outcome') return 'Outpatient outcome';
    return type;
  };

  // Navigate to corresponding form view
  const handleFormClick = (form: FormIndexItem) => {
    let route = '';
    if (form.form_type === 'waiting_list_card') route = '/waiting-list';
    else if (form.form_type === 'operation_note') route = '/operation-note';
    else if (form.form_type === 'outpatient_outcome') route = '/outpatient-outcome';

    if (route) {
      if (form.form_status === 'final') {
        // Read-only view (RoV)
        navigate(route, { state: { formUuid: form.form_uuid, patientUuid: patient?.uuid, openInRoV: true } });
      } else {
        // Edit view (EV)
        navigate(route, { state: { formUuid: form.form_uuid, patientUuid: patient?.uuid, openInRoV: false } });
      }
    }
  };

  const handleAddNewForm = (formType: string) => {
    let route = '';
    if (formType === 'waiting-list') route = '/waiting-list';
    else if (formType === 'operation-note') route = '/operation-note';
    else if (formType === 'outpatient-outcome') route = '/outpatient-outcome';

    if (route) {
      navigate(route, { state: { patientUuid: patient?.uuid, openInRoV: false } });
    }
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

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Roboto', sans-serif",
      backgroundColor: 'white'
    }}>

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

      {/* Main content grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        overflow: 'hidden'
      }}>

        {/* Left column menu panel */}
        <div style={{
          borderRight: '0.1rem solid silver',
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{ position: 'relative' }}>
            <button
              ref={addButtonRef}
              type="button"
              onClick={() => setShowAddMenu(prev => !prev)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                border: '0.1rem solid silver',
                borderRadius: '0.4rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              <span>Add form</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
            </button>
            {showAddMenu && (
              <AddFormMenu
                buttonRef={addButtonRef}
                onSelectFormType={(type) => {
                  setShowAddMenu(false);
                  // Map types: outpatient_outcome -> outpatient-outcome, etc.
                  const mappedType = type.replace('_', '-');
                  handleAddNewForm(mappedType);
                }}
                onCancel={() => setShowAddMenu(false)}
              />
            )}
          </div>
          <button
            onClick={() => navigate('/patient-registry')}
            style={{
              padding: '0.6rem 1rem',
              border: '0.1rem solid silver',
              borderRadius: '0.4rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: 400,
              fontSize: '1rem',
              color: 'rgb(27, 110, 194)',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            ● Patient registry
          </button>
        </div>

        {/* Right column content list */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem', color: '#333' }}>
            Forms index
          </h2>

          {loading ? (
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading forms...</div>
          ) : forms.length === 0 ? (
            <div style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
              No forms recorded for this patient yet. Use the dropdown menu on the left to add a form.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {forms.map((form) => {
                const isDraft = form.form_status === 'draft';
                return (
                  <div
                    key={form.form_uuid}
                    onClick={() => handleFormClick(form)}
                    style={{
                      border: '0.1rem solid silver',
                      borderRadius: '0.6rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      boxShadow: '0 0.1rem 0.3rem rgba(0,0,0,0.05)',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgb(27, 110, 194)';
                      e.currentTarget.style.boxShadow = '0 0.2rem 0.6rem rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'silver';
                      e.currentTarget.style.boxShadow = '0 0.1rem 0.3rem rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 500, color: 'rgb(27, 110, 194)' }}>
                        {getFormTypeDisplay(form.form_type)}
                      </span>
                      {isDraft ? (
                        <span style={{
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          border: '0.1rem solid #ffeeba',
                          borderRadius: '0.3rem',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textTransform: 'uppercase'
                        }}>
                          Draft
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#d4edda',
                          color: '#155724',
                          border: '0.1rem solid #c3e6cb',
                          borderRadius: '0.3rem',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textTransform: 'uppercase'
                        }}>
                          Final
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                      <span>
                        <strong>Event date:</strong> {formatDateTime(form.event_datetime)}
                      </span>
                      <span>
                        <strong>Documented:</strong> {formatDateTime(form.document_datetime)}
                      </span>
                      <span>
                        <strong>Version:</strong> {form.form_version}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
