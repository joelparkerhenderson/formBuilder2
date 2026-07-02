import type { PageLoad } from './$types';
import { createApiClient } from '$lib/api/client';
import { treatmentSummarySpec } from '$lib/data/treatmentSummarySpec';
import type { Patient } from '$lib/types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, url }) => {
  const api = createApiClient({ fetch });
  const patientUuid = url.searchParams.get('patientUuid') || treatmentSummarySpec.patientUuid || '';
  const formUuid = url.searchParams.get('formUuid') || '';
  const openInRoV = url.searchParams.get('openInRoV') === 'true';
  const readOnlyBackOnly = url.searchParams.get('readOnlyBackOnly') === 'true';

  try {
    const [patient, savedForm] = await Promise.all([
      patientUuid ? api.get<Patient>(`/patients/${encodeURIComponent(patientUuid)}`) : Promise.resolve(null),
      formUuid ? api.get<Record<string, any>>(`/forms/treatment_summary/${encodeURIComponent(formUuid)}`) : Promise.resolve(null)
    ]);
    return { patient, patientUuid, formUuid, savedForm, openInRoV, readOnlyBackOnly, loadError: '' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { patient: null, patientUuid, formUuid, savedForm: null, openInRoV, readOnlyBackOnly, loadError: message };
  }
};
