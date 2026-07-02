import type { PageLoad } from './$types';
import { createApiClient } from '$lib/api/client';
import type { Patient } from '$lib/types';

export const ssr = false;

const defaultPatientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

export const load: PageLoad = async ({ fetch, url }) => {
  const api = createApiClient({ fetch });
  const patientUuid = url.searchParams.get('patientUuid') || defaultPatientUuid;
  const formUuid = url.searchParams.get('formUuid') || '';
  const openInRoV = url.searchParams.get('openInRoV') === 'true';
  const readOnlyBackOnly = url.searchParams.get('readOnlyBackOnly') === 'true';

  try {
    const [patient, savedForm] = await Promise.all([
      api.get<Patient>(`/patients/${encodeURIComponent(patientUuid)}`),
      formUuid ? api.get<Record<string, any>>(`/forms/waiting_list_card/${encodeURIComponent(formUuid)}`) : Promise.resolve(null)
    ]);
    return { patient, patientUuid, formUuid, savedForm, openInRoV, readOnlyBackOnly, loadError: '' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { patient: null, patientUuid, formUuid, savedForm: null, openInRoV, readOnlyBackOnly, loadError: message };
  }
};
