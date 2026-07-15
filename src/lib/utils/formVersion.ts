import { getLatestVersion } from '$lib/api/legacy';

export const STALE_FORM_VERSION_ERROR = 'STALE_FORM_VERSION';

export function createStaleFormVersionError() {
  const error = new Error('The form has been updated since this version was opened.');
  (error as Error & { code?: string }).code = STALE_FORM_VERSION_ERROR;
  return error;
}

export function isStaleFormVersionError(error: unknown) {
  return !!error && typeof error === 'object' && (error as { code?: string }).code === STALE_FORM_VERSION_ERROR;
}

export async function assertFormVersionIsLatest(formType: string, formUuid: string, currentFormVersion: number | null) {
  const latest = await getLatestVersion(formType, formUuid);
  const latestVersion = latest?.version ?? null;
  if (currentFormVersion !== null && latestVersion !== null && currentFormVersion < latestVersion) {
    throw createStaleFormVersionError();
  }
  return latestVersion;
}
