import * as React from 'react';
import { useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

  // Search filter states
  const [nhsFilter, setNhsFilter] = React.useState<string>('');
  const [surnameFilter, setSurnameFilter] = React.useState<string>('');
  const [forenamesFilter, setForenamesFilter] = React.useState<string>('');
  const [crnFilter, setCrnFilter] = React.useState<string>('');

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);

      // Select distinct latest versions of patients using our mock view
      const { data, error } = await supabase
        .from('patients_current')
        .select('*')
        .order('surname', { ascending: true })
        .order('forenames', { ascending: true });

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

  // Run dynamic search query using parameters
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      let query = supabase.from('patients_current').select('*');

      if (nhsFilter.trim()) {
        query = query.ilike('nhs_number', `%${nhsFilter.trim()}%`);
      }
      if (surnameFilter.trim()) {
        query = query.ilike('surname', `%${surnameFilter.trim()}%`);
      }
      if (forenamesFilter.trim()) {
        query = query.ilike('forenames', `%${forenamesFilter.trim()}%`);
      }
      if (crnFilter.trim()) {
        query = query.ilike('crn', `%${crnFilter.trim()}%`);
      }

      const { data, error } = await query
        .order('surname', { ascending: true })
        .order('forenames', { ascending: true });

      if (error) {
        console.error('Search error:', error);
      } else {
        setPatients(data || []);
      }

    } catch (err) {
      console.error('Exception doing patient registry search:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNhsFilter('');
    setSurnameFilter('');
    setForenamesFilter('');
    setCrnFilter('');
    fetchPatients();
  };

  const handlePatientClick = (patientUuid: string) => {
    navigate('/patient-record', { state: { patientUuid } });
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
        alignItems: 'center',
        justifyContent: 'between'
      }} className="flex-shrink-0">
        <h1 style={{ fontSize: '2rem', fontWeight: 500, margin: 0, cursor: 'pointer', color: 'black' }} onClick={() => navigate('/')}>
          Patient registry
        </h1>
        <div className="flex-1"></div>
        <Addressograph />
      </div>

      {/* Main search and content container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        overflowY: 'auto'
      }}>

        {/* Search query fields */}
        <form onSubmit={handleSearch} style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.6rem',
          marginBottom: '1.5rem',
          border: '0.1rem solid silver'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label htmlFor="nhsFilter" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>NHS Number</label>
              <input
                type="text"
                id="nhsFilter"
                value={nhsFilter}
                onChange={(e) => setNhsFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '0.1rem solid silver',
                  borderRadius: '0.4rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label htmlFor="surnameFilter" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>Surname</label>
              <input
                type="text"
                id="surnameFilter"
                value={surnameFilter}
                onChange={(e) => setSurnameFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '0.1rem solid silver',
                  borderRadius: '0.4rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label htmlFor="forenamesFilter" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>Forename(s)</label>
              <input
                type="text"
                id="forenamesFilter"
                value={forenamesFilter}
                onChange={(e) => setForenamesFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '0.1rem solid silver',
                  borderRadius: '0.4rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label htmlFor="crnFilter" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>CRN</label>
              <input
                type="text"
                id="crnFilter"
                value={crnFilter}
                onChange={(e) => setCrnFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '0.1rem solid silver',
                  borderRadius: '0.4rem',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '0.5rem 1rem',
                border: '0.1rem solid silver',
                borderRadius: '0.4rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.4rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Results table list */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem', color: '#333' }}>
            Patients
          </h2>

          {loading ? (
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading patients...</div>
          ) : patients.length === 0 ? (
            <div style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
              No matches found.
            </div>
          ) : (
            <div style={{
              border: '0.1rem solid silver',
              borderRadius: '0.6rem',
              overflow: 'hidden',
              boxShadow: '0 0.1rem 0.3rem rgba(0,0,0,0.05)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                textAlign: 'left'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#e6f2ff',
                    borderBottom: '0.15rem solid rgb(27, 110, 194)',
                    color: '#333',
                    fontWeight: 500
                  }}>
                    <th style={{ padding: '0.8rem' }}>NHS Number</th>
                    <th style={{ padding: '0.8rem' }}>Surname</th>
                    <th style={{ padding: '0.8rem' }}>Forename(s)</th>
                    <th style={{ padding: '0.8rem' }}>CRN</th>
                    <th style={{ padding: '0.8rem' }}>Date of Birth</th>
                    <th style={{ padding: '0.8rem' }}>Sex</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((pat) => (
                    <tr
                      key={pat.uuid}
                      onClick={() => handlePatientClick(pat.uuid)}
                      style={{
                        borderBottom: '0.15rem solid rgb(27, 110, 194)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f8ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={{ padding: '0.8rem', fontWeight: 500 }}>{pat.nhs_number}</td>
                      <td style={{ padding: '0.8rem' }}>{pat.surname}</td>
                      <td style={{ padding: '0.8rem' }}>{pat.forenames}</td>
                      <td style={{ padding: '0.8rem' }}>{pat.crn}</td>
                      <td style={{ padding: '0.8rem' }}>{pat.date_of_birth}</td>
                      <td style={{ padding: '0.8rem' }}>{pat.sex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
