export const fbRed = '#d50000';
export const fbGreen = '#008000';
export const fbBlue = '#1b6ec2';
export const fbActiveLighterYellow = '#ffffcc';
export const fbActiveDarkerYellow = '#fee715';
export const fbSilver = '#c0c0c0';
export const fbOrange = '#fd8a10';
export const fbWhite = '#ffffff';
export const fbBlack = '#000000';

export const organisationOptions = [
  { value: 'aneurin-bevan', label: 'Aneurin Bevan' },
  { value: 'betsi-cadwaladr', label: 'Betsi Cadwaladr' },
  { value: 'cardiff-vale', label: 'Cardiff & Vale' },
  { value: 'cwm-taf', label: 'Cwm Taf Morgannwg' },
  { value: 'hywel-dda', label: 'Hywel Dda' },
  { value: 'powys', label: 'Powys' },
  { value: 'swansea-bay', label: 'Swansea Bay' },
  { value: 'velindre', label: 'Velindre' },
];

export const specialities = [
  { value: 'general-surgery', label: 'General Surgery' },
  { value: 'orthopaedics', label: 'Orthopaedics' },
  { value: 'cardiothoracic', label: 'Cardiothoracic Surgery' },
  { value: 'neurosurgery', label: 'Neurosurgery' },
  { value: 'urology', label: 'Urology' },
  { value: 'ent', label: 'ENT Surgery' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'vascular', label: 'Vascular Surgery' },
  { value: 'colorectal', label: 'Colorectal Surgery' },
  { value: 'breast', label: 'Breast Surgery' },
  { value: 'plastic', label: 'Plastic Surgery' },
  { value: 'oral-maxillofacial', label: 'Oral & Maxillofacial Surgery' },
];

export const hospitalOptions = [
  { value: 'prince-charles', label: 'Prince Charles Hospital, Merthyr Tydfil' },
  { value: 'royal-glamorgan', label: 'Royal Glamorgan Hospital, Llantrisant' },
  { value: 'princess-wales', label: 'Princess of Wales Hospital, Bridgend' },
];

export const organisationLabels = Object.fromEntries(organisationOptions.map((item) => [item.value, item.label]));
export const specialityLabels = Object.fromEntries(specialities.map((item) => [item.value, item.label]));
export const hospitalLabels = Object.fromEntries(hospitalOptions.map((item) => [item.value, item.label]));

export const sideLabels: Record<string, string> = {
  left: 'Left',
  right: 'Right',
  bilateral: 'Bilateral',
  na: 'Not applicable',
};

export const yesNoUnknownLabels: Record<string, string> = {
  yes: 'Yes',
  no: 'No',
  unknown: 'Unknown or not recorded',
};
