import * as React from 'react';
import { fbSCTSelector as FbSCTSelector } from './fbSCTSelector';

interface fbSCTProcedureProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string, coded: boolean) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  coded?: boolean;
  valueError?: string;
  labelStyle?: React.CSSProperties;
}

export const fbSCTProcedure: React.FC<fbSCTProcedureProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Type to search SNOMED CT',
  required,
  coded,
  valueError,
  labelStyle,
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
    coded={coded}
    valueError={valueError}
    labelStyle={labelStyle}
    searchCommand="findProcedure"
    mode="procedure"
    inputClassName="fb-sct-procedure-selector-input"
  />
);
