import React from 'react';
import { fbButton as FbButton } from '../components/fbButton';
import { cntControlStyles } from './cntStyles';

export function FbcntScan({
  value,
  onChange,
  onOpen,
  onRfid,
  onCameraScan,
}: {
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onRfid: () => void;
  onCameraScan: () => void;
}) {
  return (
    <section style={cntControlStyles.scanBar} aria-label="Scan or enter identifier">
      <input
        style={cntControlStyles.scanInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onOpen();
        }}
        placeholder="Scan NHS number, hospital number, volume barcode, RFID, batch or location"
      />
      <FbButton variant="primary" onClick={onOpen}>Open</FbButton>
      <button type="button" style={cntControlStyles.rfidButton} onClick={onRfid}>RFID</button>
      <FbButton variant="primary" onClick={onCameraScan}>Camera scan</FbButton>
    </section>
  );
}
