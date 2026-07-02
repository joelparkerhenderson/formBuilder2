export type ClinicalOption = { value: string; label: string };

export const healthBoards: ClinicalOption[] = [
  { value: 'bae-glas', label: 'Bae Glas University Health Board' },
  { value: 'cwm-hafan', label: 'Cwm Hafan Health Board' },
  { value: 'dyffryn-aur', label: 'Dyffryn Aur Teaching Health Board' },
  { value: 'mynydd-y-mor', label: 'Mynydd Y Mor Health Board' },
  { value: 'tir-afon', label: 'Tir Afon Health Board' },
];

export const facilities: Array<ClinicalOption & { healthBoard: string; specialities: string[] }> = [
  { value: 'ysbyty-abermawr', label: 'Ysbyty Abermawr', healthBoard: 'bae-glas', specialities: ['general-surgery', 'breast', 'endocrine-surgery', 'cardiology'] },
  { value: 'glyn-derw-clinic', label: 'Glyn Derw Clinic', healthBoard: 'bae-glas', specialities: ['general-surgery', 'medicine', 'diabetes'] },
  { value: 'llanawel-general', label: 'Llanawel General', healthBoard: 'cwm-hafan', specialities: ['cardiology', 'diabetes', 'general-internal-medicine', 'respiratory-medicine'] },
  { value: 'tref-afon-hospital', label: 'Tref Afon Hospital', healthBoard: 'dyffryn-aur', specialities: ['medicine', 'general-surgery', 'breast', 'cardiology'] },
  { value: 'morfa-wen-infirmary', label: 'Morfa Wen Infirmary', healthBoard: 'mynydd-y-mor', specialities: ['mental-health', 'medicine', 'neurology'] },
  { value: 'llyn-teg-community', label: 'Llyn Teg Community', healthBoard: 'tir-afon', specialities: ['maternity', 'paediatrics', 'general-medical-practice'] },
];

export const patientLocations = [
  'Ambulatory emergency surgery unit',
  'Bridgend clinic',
  'Emergency department',
  'Intensive care unit',
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
  'Ward 9',
  'Ward 10',
];

export function facilitiesForHealthBoard(healthBoard: string) {
  return facilities.filter((facility) => !healthBoard || facility.healthBoard === healthBoard);
}

export function specialityValuesForFacility(facilityValue: string) {
  return facilities.find((facility) => facility.value === facilityValue)?.specialities || [];
}

export function specialityValuesForHealthBoard(healthBoard: string) {
  const values = facilities
    .filter((facility) => !healthBoard || facility.healthBoard === healthBoard)
    .flatMap((facility) => facility.specialities);
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
