export interface SimpleOption {
  value: string;
  label: string;
}

export type SimpleFieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'smartDropdown'
  | 'radioGroup'
  | 'urgencyGroup'
  | 'checkGroup'
  | 'number'
  | 'bloodPressure'
  | 'dateHeightWeightBMIRow'
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
  | 'boxedAlert'
  | 'notificationTypeGroup';

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
  noWidthConstraint?: boolean;
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

export interface SpecDrivenFormSpec {
  title: string;
  formType: string;
  filename: string;
  sections: SimpleSection[];
}
