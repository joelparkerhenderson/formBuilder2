import * as React from 'react';
import { useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbButton as FbButton } from './components/fbButton';
import { fbUserName as FbUserName } from './components/fbUserName';
import { fbSearchInput as FbSearchInput } from './components/fbSearchInput';
import { createClient } from './restClient';
import PatientRecord from './PatientRecord';

const restClient = createClient();

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

export default function PatientSearch() {
  const navigate = useNavigate();

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activePatientUuid, setActivePatientUuid] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const queryRef = React.useRef<number>(0);
  const [username, setUsername] = React.useState<string>('demoUser');

  React.useEffect(() => {
    sessionStorage.setItem('fb_prev_main_page', '/patient-search');
  }, []);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
  };

  React.useEffect(() => {
    // 1. When the page is first opened, or when the search query is empty,
    // the list should be empty and the database should not be queried.
    if (!searchQuery.trim()) {
      setPatients([]);
      setLoading(false);
      return;
    }

    // 2. When query changes, clear results of previous searches immediately,
    // and ignore earlier pending queries
    setPatients([]);
    setLoading(true);

    const currentQueryId = ++queryRef.current;

    const performSearch = async () => {
      try {
        const { data, error } = await restClient.rpc('search_patients_fuzzy', {
          search_term: searchQuery
        });

        // 3. When query returns (and a more recent query has not been sent), display matches
        if (currentQueryId === queryRef.current) {
          if (error) {
            console.error('Fuzzy search query failed:', error);
          } else {
            setPatients(data || []);
          }
          setLoading(false);
        }
      } catch (err) {
        if (currentQueryId === queryRef.current) {
          console.error('Fuzzy search execution failed:', err);
          setLoading(false);
        }
      }
    };

    performSearch();
  }, [searchQuery]);

  const handleOpenRecord = (patientUuid: string) => {
    setActivePatientUuid(patientUuid);
  };

  return (
    <>
      {/* Search UI container - visibility is toggled by setting style.display */}
      <div
        id="patient-search-container"
        style={{
          height: '100vh',
          display: activePatientUuid ? 'none' : 'flex',
          flexDirection: 'column',
          fontFamily: "'Roboto', sans-serif",
          backgroundColor: 'white'
        }}
      >
        {/* Top Banner section with wide full-width Search for input inside the header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '0.2rem solid rgb(27, 110, 194)',
          padding: '0.8rem',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }} className="flex-shrink-0">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
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
              Patient search
            </h1>
          </div>
          
          <div style={{ width: '100%' }}>
            <FbSearchInput
              label="Search for"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Type to search patient index"
              id="patient-search-query-input"
              autoFocus
            />
          </div>
        </div>

        {/* Main content container */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto'
        }}>

          {!searchQuery.trim() ? null : loading ? (
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Querying clinical registry...</div>
          ) : patients.length === 0 ? (
            <div style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '1rem',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#666'
            }}>
              No matches found
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
