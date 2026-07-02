import type { PageLoad } from './$types';

export const ssr = false;

const defaultPatientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

export const load: PageLoad = ({ url }) => ({
  patientUuid: url.searchParams.get('patientUuid') || defaultPatientUuid,
  formUuid: url.searchParams.get('formUuid') || '',
  formVersion: Number(url.searchParams.get('formVersion') || '') || null,
  openInRoV: url.searchParams.get('openInRoV') === 'true',
  readOnlyBackOnly: url.searchParams.get('readOnlyBackOnly') === 'true'
});
