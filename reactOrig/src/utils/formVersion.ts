export const STALE_FORM_VERSION_ERROR = 'STALE_FORM_VERSION';

export const createStaleFormVersionError = () => {
  const error = new Error('The form has been updated since this version was opened.');
  (error as Error & { code?: string }).code = STALE_FORM_VERSION_ERROR;
  return error;
};

export const isStaleFormVersionError = (error: unknown) => (
  !!error &&
  typeof error === 'object' &&
  (error as { code?: string }).code === STALE_FORM_VERSION_ERROR
);

export const loadLatestFormVersion = async (
  restClient: any,
  table: string,
  formUuid: string,
): Promise<number | null> => {
  const { data, error } = await restClient
    .from(table)
    .select('version')
    .eq('uuid', formUuid)
    .order('version', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.version ?? null;
};

export const assertFormVersionIsLatest = async (
  restClient: any,
  table: string,
  formUuid: string,
  currentFormVersion: number | null,
) => {
  const latestVersion = await loadLatestFormVersion(restClient, table, formUuid);
  if (currentFormVersion !== null && latestVersion !== null && currentFormVersion < latestVersion) {
    throw createStaleFormVersionError();
  }
  return latestVersion;
};
