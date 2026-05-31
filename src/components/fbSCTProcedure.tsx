import * as React from 'react';
import { fbSCTSelector as FbSCTSelector } from './fbSCTSelector';

interface fbSCTProcedureProps {
  name: string;
  value: string;
  onChange: (value: string, coded: boolean) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  coded?: boolean;
}

export const fbSCTProcedure: React.FC<fbSCTProcedureProps> = ({
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
    searchCommand="findProcedure"
    mode="procedure"
    inputClassName="fb-sct-procedure-selector-input"
  />
);
