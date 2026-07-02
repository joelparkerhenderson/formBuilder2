import React from 'react';
import { cntControlStyles } from './cntStyles';

export function FbGroupWithBorder({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset style={cntControlStyles.groupWithBorder}>
      <legend style={cntControlStyles.groupWithBorderLegend}>{label}</legend>
      {children}
    </fieldset>
  );
}
