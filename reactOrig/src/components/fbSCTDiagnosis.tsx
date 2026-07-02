import * as React from 'react';
import { fbSCTSelector as FbSCTSelector } from './fbSCTSelector';

interface SCTDiagnosisProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string, coded: boolean) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  requiredForAudit?: boolean;
  coded?: boolean;
  valueError?: string;
  labelStyle?: React.CSSProperties;
  subfield?: boolean;
}

export const fbSCTDiagnosis: React.FC<SCTDiagnosisProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Type to search SNOMED CT',
  required,
  requiredForAudit,
  coded,
  valueError,
  labelStyle,
  subfield,
}) => (
  <FbSCTSelector
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder={placeholder}
    required={required}
    requiredForAudit={requiredForAudit}
    coded={coded}
    valueError={valueError}
    labelStyle={labelStyle}
    subfield={subfield}
    searchCommand="findDisorder"
    mode="diagnosis"
  />
);
