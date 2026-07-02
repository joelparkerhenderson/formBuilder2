import type { fbFormHistoryItem } from '../components/fbFormHistoryMenu';

interface RestClientLike {
  from: (table: string) => any;
}

export async function loadFormHistory(
  restClient: RestClientLike,
  formTable: string,
  formUuid: string,
  currentVersion?: number | null,
): Promise<{
  history: fbFormHistoryItem[];
  latestVersion: number | null;
  currentVersion: number | null;
}> {
  const { data: latestVersionRows } = await restClient
    .from(formTable)
    .select('version')
    .eq('uuid', formUuid)
    .order('version', { ascending: false })
    .limit(1);

  const { data: historyRows } = await restClient
    .from('forms_index')
    .select('*')
    .eq('form_uuid', formUuid)
    .order('form_version', { ascending: false });

  const latestVersion = latestVersionRows?.[0]?.version ?? currentVersion ?? null;

  return {
    history: historyRows || [],
    latestVersion,
    currentVersion: currentVersion ?? latestVersion,
  };
}
