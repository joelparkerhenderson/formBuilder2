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
  address_line_1?: string;
  address_line_2?: string;
  address_line_3?: string;
  address_line_4?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  hospital_number?: string;
  date_of_birth?: string;
  sex?: string;
}

export interface FormIndexItem {
  form_uuid: string;
  form_version: number;
  form_type: string;
  patient_uuid: string;
  event_datetime: string;
  document_datetime?: string | null;
  form_status: string;
  event_or_document?: 'Event' | 'Document';
  details?: string;
  speciality?: string;
  organisation?: string;
  hospital?: string;
  senior_responsible_clinician?: string;
  highly_sensitive?: boolean;
}

export interface OutpatientAppointment {
  uuid: string;
  version?: number;
  patient_uuid?: string;
  appointment_datetime?: string;
  clinic_name?: string;
  speciality?: string;
  senior_responsible_clinician?: string;
  outcome_form_uuid?: string | null;
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
  getIncompleteCount?: (formState: Record<string, unknown>) => number;
}
