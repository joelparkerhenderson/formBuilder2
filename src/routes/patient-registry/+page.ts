import { createApiClient } from '$lib/api/client';
import type { Patient } from '$lib/types';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
  const api = createApiClient({ fetch });
  try {
    const patients = await api.get<Patient[]>('/patients');
    return { patients, loadError: '' };
  } catch (error) {
    return {
      patients: [],
      loadError: error instanceof Error ? error.message : 'Unable to load patients.'
    };
  }
};
