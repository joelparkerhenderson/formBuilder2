import React from 'react';
import { Link } from 'react-router';
import { fbUserName as FbUserName } from './components/fbUserName';

const DONALD_DUCK_PATIENT_UUID = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

export default function Home() {
  const [username, setUsername] = React.useState<string>('demoUser');
  const componentLibraryHref = window.location.pathname.startsWith('/formBuilder2/')
    ? '/formBuilder2/components.html'
    : '/components.html';
  const composerHref = window.location.pathname.startsWith('/formBuilder2/')
    ? '/formBuilder2/composer.html'
    : '/composer.html';
  const caseNoteTrackerHref = window.location.pathname.startsWith('/formBuilder2/')
    ? '/formBuilder2/caseNoteTracker.html'
    : '/caseNoteTracker.html';

  const handleUsernameChange = (val: string) => {
    setUsername(val);
  };

  React.useEffect(() => {
    sessionStorage.setItem('fb_prev_main_page', '/');
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: 'white'
      }}
    >
      {/* Top Banner section */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '0.2rem solid rgb(27, 110, 194)',
          padding: '0.4rem 0.8rem',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '2.8rem'
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 500,
            marginTop: '1rem',
            marginBottom: '1rem',
            marginLeft: 0,
            marginRight: 0,
            color: 'rgb(27, 110, 194)'
          }}
        >
          formBuilder2
        </h1>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.8rem',
            boxShadow: '0 0.1rem 0.6rem rgba(0,0,0,0.06)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Link
              to="/waiting-list"
              state={{ patientUuid: DONALD_DUCK_PATIENT_UUID, username }}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Waiting list card
            </Link>
            <Link
              to="/operation-note"
              state={{ patientUuid: DONALD_DUCK_PATIENT_UUID, username }}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Operation note
            </Link>
            <Link
              to="/outpatient-outcome"
              state={{ patientUuid: DONALD_DUCK_PATIENT_UUID, username }}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Outpatient outcome
            </Link>
            <Link
              to="/treatment-summary"
              state={{ patientUuid: DONALD_DUCK_PATIENT_UUID, username }}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Treatment summary
            </Link>
            <Link
              to="/patient-registry"
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Patient registry
            </Link>
            <Link
              to="/patient-search"
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Patient search
            </Link>
            <Link
              to="/patient-record"
              state={{ patientUuid: DONALD_DUCK_PATIENT_UUID, username }}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Patient record
            </Link>
            <a
              href={caseNoteTrackerHref}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Case note tracker
            </a>
            <a
              href={composerHref}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Composer
            </a>
            <a
              href={componentLibraryHref}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: 'rgb(27, 110, 194)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontSize: '1.1rem',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
            >
              Component library
            </a>
          </div>
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '0.85rem',
              color: '#666',
              textAlign: 'center',
              fontWeight: 300
            }}
          >
            Right-click links to open in new tab/window
          </p>
        </div>
      </div>

      {/* Footer Area with right-aligned fbUserName input */}
      <div
        className="bottom-control-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
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
      </div>
    </div>
  );
}
