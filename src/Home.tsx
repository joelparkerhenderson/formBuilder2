import React from 'react';
import { Link } from 'react-router';
import { fbUserName as FbUserName } from './components/fbUserName';

const DONALD_DUCK_PATIENT_UUID = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

type HomeRouteTile = {
  kind: 'route';
  label: string;
  to: string;
  background: string;
  color?: string;
  state?: Record<string, unknown>;
};

type HomeHrefTile = {
  kind: 'href';
  label: string;
  href: string;
  background: string;
  color?: string;
};

type HomeTile = HomeRouteTile | HomeHrefTile;

export default function Home() {
  const [username, setUsername] = React.useState<string>('demoUser');
  const underFormBuilder2 = window.location.pathname.startsWith('/formBuilder2/');
  const componentLibraryHref = underFormBuilder2 ? '/formBuilder2/components.html' : '/components.html';
  const composerHref = underFormBuilder2 ? '/formBuilder2/composer.html' : '/composer.html';
  const caseNoteTrackerHref = underFormBuilder2 ? '/formBuilder2/caseNoteTracker.html?forceLogin=1' : '/caseNoteTracker.html?forceLogin=1';

  React.useEffect(() => {
    sessionStorage.setItem('fb_prev_main_page', '/');
  }, []);

  const patientFormTiles: HomeTile[] = [
    { kind: 'route', label: 'Waiting list card', to: '/waiting-list', background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)', state: { patientUuid: DONALD_DUCK_PATIENT_UUID, username } },
    { kind: 'route', label: 'Operation note', to: '/operation-note', background: 'linear-gradient(135deg, #008000, #c5e1a5)', state: { patientUuid: DONALD_DUCK_PATIENT_UUID, username } },
    { kind: 'route', label: 'Outpatient outcome', to: '/outpatient-outcome', background: 'linear-gradient(135deg, #d50000, #fd8a10)', state: { patientUuid: DONALD_DUCK_PATIENT_UUID, username } },
    { kind: 'route', label: 'Treatment summary', to: '/treatment-summary', background: 'linear-gradient(135deg, #fd8a10, #fee715)', color: 'black', state: { patientUuid: DONALD_DUCK_PATIENT_UUID, username } },
  ];
  const systemTiles: HomeTile[] = [
    { kind: 'route', label: 'Patient registry', to: '/patient-registry', background: 'linear-gradient(135deg, #8cd2e7, #c5e1a5)', color: 'black' },
    { kind: 'route', label: 'Patient search', to: '/patient-search', background: 'linear-gradient(135deg, #1b6ec2, #008000)' },
    { kind: 'route', label: 'Patient record', to: '/patient-record', background: 'linear-gradient(135deg, #008000, #8cd2e7)', state: { patientUuid: DONALD_DUCK_PATIENT_UUID, username } },
    { kind: 'href', label: 'Case note tracker', href: caseNoteTrackerHref, background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { kind: 'href', label: 'Composer', href: composerHref, background: 'linear-gradient(135deg, #fd8a10, #fee715)', color: 'black' },
    { kind: 'href', label: 'Component library', href: componentLibraryHref, background: 'linear-gradient(135deg, #8cd2e7, #fee715)', color: 'black' },
  ];

  const tileStyle = (background: string, color = 'white'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    minHeight: '5.5rem',
    padding: '1.2rem',
    background,
    color,
    textDecoration: 'none',
    borderRadius: '0.4rem',
    border: '0.1rem solid silver',
    boxShadow: '0 0.15rem 0.5rem rgba(0,0,0,0.14)',
    fontSize: '1.35rem',
    fontWeight: 500,
    fontFamily: "'Roboto', sans-serif",
    boxSizing: 'border-box',
    textAlign: 'left',
  });

  const fieldsetStyle: React.CSSProperties = {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.8rem',
    margin: '0 0 0.8rem 0',
    backgroundColor: 'white',
  };
  const legendStyle: React.CSSProperties = {
    padding: '0 0.35rem',
    fontSize: '1rem',
    fontWeight: 500,
  };
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
    gap: '0.8rem',
  };
  const renderTile = (tile: HomeTile) => tile.kind === 'route' ? (
    <Link key={tile.label} to={tile.to} state={tile.state} style={tileStyle(tile.background, tile.color)}>
      {tile.label}
    </Link>
  ) : (
    <a key={tile.label} href={tile.href} style={tileStyle(tile.background, tile.color)}>
      {tile.label}
    </a>
  );

  return (
    <div style={{ width: '100vw', minWidth: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Roboto', sans-serif", backgroundColor: 'white' }}>
      <main style={{ flex: 1, width: '100%', padding: '1.5rem', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#1b6ec2', color: 'white', borderRadius: '0.4rem', padding: '1rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 300 }}>NHS Wales</div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 500, margin: 0 }}>formBuilder2</h1>
        </div>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Patient forms</legend>
          <div style={gridStyle}>{patientFormTiles.map(renderTile)}</div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>System</legend>
          <div style={gridStyle}>{systemTiles.map(renderTile)}</div>
        </fieldset>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', textAlign: 'center', fontWeight: 300 }}>
          Right-click links to open in new tab/window
        </p>
      </main>

      <footer className="bottom-control-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0.4rem 0.8rem', backgroundColor: 'white', borderTop: '0.2rem solid #1b6ec2', minHeight: '2.8rem', boxSizing: 'border-box' }}>
        <FbUserName value={username} onChange={setUsername} />
      </footer>
    </div>
  );
}
