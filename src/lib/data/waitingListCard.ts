export const organisationOptions = [
  { value: 'aneurin-bevan', label: 'Aneurin Bevan' },
  { value: 'betsi-cadwaladr', label: 'Betsi Cadwaladr' },
  { value: 'cardiff-vale', label: 'Cardiff & Vale' },
  { value: 'cwm-taf', label: 'Cwm Taf Morgannwg' },
  { value: 'hywel-dda', label: 'Hywel Dda' },
  { value: 'powys', label: 'Powys' },
  { value: 'swansea-bay', label: 'Swansea Bay' },
  { value: 'velindre', label: 'Velindre' }
];

export const waitingListHospitalOptions = [
  { value: 'prince-charles', label: 'Prince Charles Hospital, Merthyr Tydfil' },
  { value: 'royal-glamorgan', label: 'Royal Glamorgan Hospital, Llantrisant' },
  { value: 'princess-wales', label: 'Princess of Wales Hospital, Bridgend' }
];

export const urgencyOptions = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'usc', label: 'USC (Urgent Suspected Cancer)' }
];

export const operatingSurgeonOptions = [
  { value: 'supervision', label: 'Any grade with supervision' },
  { value: 'discuss', label: 'Discuss with consultant' },
  { value: 'consultant', label: 'Consultant only' },
  { value: 'named_clinician', label: 'Named clinician' },
  { value: 'unknown', label: 'Unknown or not recorded' }
];

export const rcsPriorityOptions = [
  { value: 'p2', label: '2: Within 4 weeks' },
  { value: 'p3', label: '3: Within 3 months' },
  { value: 'p4', label: '4: Can be delayed more than 3 months' },
  { value: 'unknown', label: 'Unknown or not recorded' }
];

export const yesNoUnknownOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown or not recorded' }
];

export const thromboembolismIndicationOptions = [
  { value: 'dvt-pe-acute', label: 'DVT/PE (acute)' },
  { value: 'dvt-pe-prev', label: 'DVT/PE (prevention)' },
  { value: 'af', label: 'Atrial fibrillation' },
  { value: 'other', label: 'Other' }
];

export const aspirinIndicationOptions = [
  { value: 'pain', label: 'Pain' },
  { value: 'stroke', label: 'Stroke prevention' },
  { value: 'other', label: 'Other' }
];

export const aspirinDoseOptions = [
  { value: '75mg', label: '75mg' },
  { value: '300mg', label: '300mg' },
  { value: 'other', label: 'Other' }
];

export const sideOptions = [
  { value: '', label: 'Select side' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'na', label: 'Not applicable' }
];

export const organisationLabels = Object.fromEntries(organisationOptions.map((item) => [item.value, item.label]));
export const hospitalLabels = Object.fromEntries(waitingListHospitalOptions.map((item) => [item.value, item.label]));
export const sideLabels: Record<string, string> = Object.fromEntries(sideOptions.map((item) => [item.value, item.label]));
export const yesNoUnknownLabels: Record<string, string> = Object.fromEntries(yesNoUnknownOptions.map((item) => [item.value, item.label]));

export const optionLabels = (options: Array<{ value: string; label: string }>) => Object.fromEntries(options.map((item) => [item.value, item.label]));

export const riskOptions = [
  ['diabetic', 'Diabetic'],
  ['latex', 'Latex allergy'],
  ['mrsa', 'MRSA'],
  ['pacemaker', 'Pacemaker/implant'],
  ['blood', 'Blood transfusion refusal'],
  ['reactions', 'Previous anaesthetic reactions'],
  ['other', 'Other']
] as const;

export const intendedManagementOptions = [
  ['outpatient', 'Outpatient'],
  ['daycase', 'Daycase'],
  ['inpatient', 'Inpatient'],
  ['unknown', 'Unknown or not recorded']
] as const;

export const anaestheticTypeOptions = [
  ['general', 'General'],
  ['regional', 'Regional'],
  ['local', 'Local'],
  ['none', 'None'],
  ['unknown', 'Unknown or not recorded']
] as const;

export const bedRequirementOptions = [
  ['itu', 'ITU: Intensive care bed'],
  ['hdu', 'HDU: High dependency bed'],
  ['pacu', 'PACU: Post-anaesthetic care unit bed'],
  ['ward', 'Ward bed'],
  ['unknown', 'Unknown or not recorded']
] as const;
