import * as React from 'react';
import { fbSCTSelector as FbSCTSelector } from './fbSCTSelector';

interface SCTDiagnosisProps {
  name: string;
  value: string;
  onChange: (value: string, coded: boolean) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  coded?: boolean;
}

export const fbSCTDiagnosis: React.FC<SCTDiagnosisProps> = ({
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Type to search SNOMED CT',
  coded,
}) => (
  <FbSCTSelector
    name={name}
    value={value}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder={placeholder}
    coded={coded}
    searchCommand="findDisorder"
    mode="diagnosis"
  />
);
