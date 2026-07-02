import type { PageLoad } from './$types';
import { createApiClient } from '$lib/api/client';
import type { FormIndexItem, OutpatientAppointment, Patient } from '$lib/types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
  const api = createApiClient({ fetch });
  try {
    const [patient, forms, appointments] = await Promise.all([
      api.get<Patient>(`/patients/${encodeURIComponent(params.uuid)}`),
      api.get<FormIndexItem[]>(`/patients/${encodeURIComponent(params.uuid)}/forms`),
      api.get<OutpatientAppointment[]>(`/patients/${encodeURIComponent(params.uuid)}/appointments`)
    ]);
    return { patient, forms, appointments, loadError: '' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { patient: null, forms: [], appointments: [], loadError: message };
  }
};
