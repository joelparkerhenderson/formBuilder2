import React from 'react';
import { fbBlue } from './cntStyles';

type TitleSpec = {
  kicker: string;
  title: string;
  details?: React.ReactNode;
};

export function FbcntHeader({ title, right }: { title: TitleSpec; right?: React.ReactNode }) {
  return (
    <header style={styles.header}>
      <div style={styles.titleBlock}>
        <div style={styles.kicker}>{title.kicker}</div>
        <h1 style={styles.title}>{title.title}</h1>
        {title.details && <div style={styles.titleDetails}>{title.details}</div>}
      </div>
      <div style={styles.headerRight}>{right}</div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'white',
    borderBottom: `0.2rem solid ${fbBlue}`,
    padding: '0 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '4.2rem',
    gap: '1rem',
  } as React.CSSProperties,
  titleBlock: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
  } as React.CSSProperties,
  kicker: {
    fontSize: '1rem',
    fontWeight: 300,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  title: {
    fontSize: '2rem',
    fontWeight: 500,
    margin: 0,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  titleDetails: {
    marginTop: '0.2rem',
    fontSize: '0.9rem',
    fontWeight: 300,
    color: '#333',
  } as React.CSSProperties,
  headerRight: {
    fontWeight: 500,
    color: '#333',
  } as React.CSSProperties,
};
