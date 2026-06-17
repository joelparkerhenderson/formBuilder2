import type React from 'react';

export const fbBlue = '#1b6ec2';
export const fbGreen = '#008000';
export const fbOrange = '#fd8a10';
export const fbRed = '#d50000';
export const fbLightBlue = '#8cd2e7';

export const cntControlStyles = {
  label: {
    display: 'block',
    fontWeight: 500,
  } as React.CSSProperties,
  locationInput: {
    display: 'block',
    width: '100%',
    marginTop: '0.3rem',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
    boxSizing: 'border-box',
  } as React.CSSProperties,
  fbcntSmallButton: {
    border: 0,
    borderRadius: '0.4rem',
    backgroundColor: fbBlue,
    color: 'white',
    padding: '0.2rem 0.44rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  rfidButton: {
    backgroundColor: fbLightBlue,
    color: 'black',
    border: `0.2rem solid ${fbOrange}`,
    borderRadius: '0.4rem',
    padding: '0.35rem 1rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties,
  scanBar: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    marginBottom: '0.8rem',
  } as React.CSSProperties,
  scanInput: {
    flex: 1,
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.45rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
  } as React.CSSProperties,
  groupWithBorder: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.6rem',
    margin: 0,
    backgroundColor: 'white',
  } as React.CSSProperties,
  groupWithBorderLegend: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    padding: '0 0.3rem',
  } as React.CSSProperties,
};
