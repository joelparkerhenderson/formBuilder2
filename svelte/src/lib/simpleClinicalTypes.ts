export interface SimpleOption {
  value: string;
  label: string;
}

export type SimpleFieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'radioGroup'
  | 'urgencyGroup'
  | 'checkGroup'
  | 'number'
  | 'bloodPressure'
  | 'date'
  | 'partialDate'
  | 'time'
  | 'msi'
  | 'sctProcedure'
  | 'sctDiagnosis'
  | 'procedureTable'
  | 'diagnosisTable'
  | 'specimenTable'
  | 'implantTable'
  | 'surgeonGroup'
  | 'anaesthetistGroup'
  | 'boxedInfo'
  | 'boxedWarning'
  | 'boxedAlert';

export interface SimpleField {
  key: string;
  type: SimpleFieldType;
  label: string;
  required?: boolean;
  subfield?: boolean;
  span?: number;
  text?: string;
  tooltip?: string;
  units?: string;
  rows?: number;
  fullWidth?: boolean;
  options?: SimpleOption[];
}

export interface SimpleCell {
  span?: number;
  groupLabel?: string;
  fields?: SimpleField[];
}

export interface SimpleRow {
  cols?: number;
  noGrid?: boolean;
  cells: SimpleCell[];
}

export interface SimpleSection {
  id: string;
  name: string;
  requiredFields?: string[];
  rows: SimpleRow[];
}

export interface SimpleClinicalSpec {
  title: string;
  formType: string;
  filename: string;
  sections: SimpleSection[];
}
