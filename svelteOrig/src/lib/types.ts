export interface Patient {
  uuid: string;
  nhs_number?: string;
  surname?: string;
  forenames?: string;
  title?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  address_line4?: string;
  hospital_number?: string;
  date_of_birth?: string;
  sex?: string;
}

export interface ProcedureRow {
  id: number;
  side: string;
  procedure: string;
  additionalInfo: string;
  procedure_coded?: boolean;
}

export interface SectionSpec {
  id: string;
  name: string;
  requiredFields?: string[];
  getIncompleteCount?: (formState: Record<string, any>) => number;
}
