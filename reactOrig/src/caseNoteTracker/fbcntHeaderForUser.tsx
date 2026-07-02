import React from 'react';
import type { CntUser } from './cntStore';
import { fbBlue } from './cntStyles';

type TitleSpec = {
  kicker: string;
  title: string;
  details?: React.ReactNode;
  titleStyle?: React.CSSProperties;
  detailsStyle?: React.CSSProperties;
};

export function FbcntHeaderForUser({ title, user, right }: { title: TitleSpec; user: CntUser; right?: React.ReactNode }) {
  return (
    <header style={styles.header}>
      <div style={styles.titleBlock}>
        <div style={styles.kicker}>{title.kicker}</div>
        <div style={styles.userLine}>{formatUserLine(user)}</div>
        <h1 style={{ ...styles.title, ...title.titleStyle }}>{title.title}</h1>
        {title.details && <div style={{ ...styles.titleDetails, ...title.detailsStyle }}>{title.details}</div>}
      </div>
      <div style={styles.headerRight}>{right}</div>
    </header>
  );
}

function formatUserLine(user: CntUser) {
  return `${user.surname.toUpperCase()}, ${user.firstNames}, ${user.title} (NADEX:${user.nadexId}), ${user.role}, ${user.facility}`;
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
  userLine: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  title: {
    fontSize: '2rem',
    fontWeight: 500,
    margin: 0,
    color: '#333',
    lineHeight: 1.05,
  } as React.CSSProperties,
  titleDetails: {
    marginTop: '0.2rem',
    fontSize: '0.9rem',
    fontWeight: 300,
    color: '#333',
    lineHeight: 1.05,
  } as React.CSSProperties,
  headerRight: {
    fontWeight: 500,
    color: '#333',
  } as React.CSSProperties,
};
