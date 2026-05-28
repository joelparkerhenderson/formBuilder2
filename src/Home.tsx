import React from 'react';
import { Link } from 'react-router';

export default function Home() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Roboto', sans-serif",
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.8rem',
        boxShadow: '0 0.2rem 0.8rem rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
          color: 'rgb(27, 110, 194)'
        }}>
          formBuilder2
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link
            to="/waiting-list"
            state={{ patientUuid: '12345678-1234-1234-1234-123456789012' }}
            style={{
              display: 'block',
              padding: '1rem',
              backgroundColor: 'rgb(27, 110, 194)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.4rem',
              fontSize: '1.1rem',
              fontWeight: 400,
              textAlign: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
          >
            Waiting list card
          </Link>
          <Link
            to="/operation-note"
            state={{ patientUuid: '12345678-1234-1234-1234-123456789012' }}
            style={{
              display: 'block',
              padding: '1rem',
              backgroundColor: 'rgb(27, 110, 194)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.4rem',
              fontSize: '1.1rem',
              fontWeight: 400,
              textAlign: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
          >
            Operation note
          </Link>
          <Link
            to="/outpatient-outcome"
            state={{ patientUuid: '12345678-1234-1234-1234-123456789012' }}
            style={{
              display: 'block',
              padding: '1rem',
              backgroundColor: 'rgb(27, 110, 194)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.4rem',
              fontSize: '1.1rem',
              fontWeight: 400,
              textAlign: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
          >
            Outpatient outcome
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
              fontWeight: 400,
              textAlign: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
          >
            Patient registry
          </Link>
          <Link
            to="/patient-record"
            state={{ patientUuid: '12345678-1234-1234-1234-123456789012' }}
            style={{
              display: 'block',
              padding: '1rem',
              backgroundColor: 'rgb(27, 110, 194)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.4rem',
              fontSize: '1.1rem',
              fontWeight: 400,
              textAlign: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 88, 156)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(27, 110, 194)'}
          >
            Patient record
          </Link>
        </div>
        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center'
        }}>
          Right-click links to open in new tab/window
        </p>
      </div>
    </div>
  );
}
