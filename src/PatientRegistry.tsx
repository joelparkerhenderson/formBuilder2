import * as React from 'react';
import { useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbButton as FbButton } from './components/fbButton';
import { fbUserName as FbUserName } from './components/fbUserName';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import PatientRecord from './PatientRecord';

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

export default function PatientRegistry() {
  const navigate = useNavigate();

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [activePatientUuid, setActivePatientUuid] = React.useState<string | null>(null);

  // Custom userName control state with localStorage persistence
  const [username, setUsername] = React.useState<string>(() => {
    return localStorage.getItem('fb_username') || 'demoUser';
  });

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    localStorage.setItem('fb_username', val);
  };

  React.useEffect(() => {
    sessionStorage.setItem('fb_prev_main_page', '/patient-registry');
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);

      // Select distinct latest versions of patients using our mock view
      // Ordered by surname (ascending), then forenames (ascending), then date_of_birth (ascending)
      const { data, error } = await supabase
        .from('patients_current')
        .select('*')
        .order('surname', { ascending: true })
        .order('forenames', { ascending: true })
        .order('date_of_birth', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        setPatients(data || []);
      }

    } catch (err) {
      console.error('Exception fetching patient registry data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecord = (patientUuid: string) => {
    setActivePatientUuid(patientUuid);
  };

  return (
    <>
      {/* Registry UI container - visibility is toggled by setting style.display */}
      <div
        id="patient-registry-container"
        style={{
          height: '100vh',
          display: activePatientUuid ? 'none' : 'flex',
          flexDirection: 'column',
          fontFamily: "'Roboto', sans-serif",
          backgroundColor: 'white'
        }}
      >
        {/* Top Banner section */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '0.2rem solid rgb(27, 110, 194)',
          padding: '0.4rem 0.8rem',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }} className="flex-shrink-0">
          <h1
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#333',
              margin: 0,
              lineHeight: '2.2rem',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Patient registry
          </h1>
        </div>

        {/* Main content container */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto'
        }}>

          {loading ? (
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading patients...</div>
          ) : patients.length === 0 ? (
            <div style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
              No patients found.
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <tbody>
                {patients.map((pat) => (
                  <tr
                    key={pat.uuid}
                    style={{
                      borderBottom: '0.1rem solid #e2e8f0'
                    }}
                  >
                    <td style={{ padding: '0.8rem 0' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}>
                        <div
                          className="fb-addressograph-wrapper"
                          onClick={() => handleOpenRecord(pat.uuid)}
                          style={{
                            display: 'inline-block',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            const card = e.currentTarget.querySelector('.fb-addressograph-card');
                            if (card) {
                              (card as HTMLElement).style.transform = 'scale(1.01)';
                              (card as HTMLElement).style.boxShadow = '0 0.2rem 0.5rem rgba(0,0,0,0.08)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const card = e.currentTarget.querySelector('.fb-addressograph-card');
                            if (card) {
                              (card as HTMLElement).style.transform = 'none';
                              (card as HTMLElement).style.boxShadow = 'none';
                            }
                          }}
                        >
                          <Addressograph
                            nhsNumber={pat.nhs_number}
                            surname={pat.surname}
                            forenames={pat.forenames}
                            title={pat.title}
                            addressLine1={pat.address_line1}
                            addressLine2={pat.address_line2}
                            addressLine3={pat.address_line3}
                            addressLine4={pat.address_line4}
                            crn={pat.crn}
                            dateOfBirth={pat.date_of_birth}
                            sex={pat.sex}
                          />
                        </div>
                        <div style={{ paddingRight: '1rem' }}>
                          <FbButton
                            variant="primary"
                            onClick={() => handleOpenRecord(pat.uuid)}
                            id={`open-record-${pat.uuid}`}
                          >
                            Open record
                          </FbButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        {/* Footer Area with right-aligned userName input and blue/white Back button */}
        <div
          className="bottom-control-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.8rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'white',
            borderTop: '0.2rem solid rgb(27, 110, 194)',
            minHeight: '2.8rem',
            boxSizing: 'border-box'
          }}
        >
          <div>
            <FbUserName
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <FbButton variant="primary" onClick={() => navigate('/')}>
              Back
            </FbButton>
          </div>
        </div>
      </div>

      {/* Conditionally render PatientRecord to remove/add it from the DOM */}
      {activePatientUuid && (
        <PatientRecord
          inline
          patientUuid={activePatientUuid}
          username={username}
          onClose={() => setActivePatientUuid(null)}
        />
      )}
    </>
  );
}
