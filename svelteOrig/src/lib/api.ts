const configuredBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

function defaultApiBase() {
  if (typeof window !== 'undefined' && window.location.port === '3210') return '/api';
  return '/formBuilder2/api';
}

export const apiBase = configuredBase || defaultApiBase();

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (text) {
    if (!contentType.toLowerCase().includes('application/json')) {
      const excerpt = text.replace(/\s+/g, ' ').trim().slice(0, 220);
      throw new Error(`The server returned a non-JSON response.${excerpt ? ` Response began: ${excerpt}` : ''}`);
    }
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'The server returned invalid JSON.');
    }
  }
  if (!response.ok) {
    throw new Error(data?.error || response.statusText);
  }
  return data as T;
}

export function getPatients() {
  return request<any[]>('/patients');
}

export function searchPatients(searchQuery: string) {
  return request<any[]>('/patients/search', {
    method: 'POST',
    body: JSON.stringify({ searchQuery }),
  });
}

export function getPatient(uuid: string) {
  return request<any>(`/patients/${encodeURIComponent(uuid)}`);
}

export function getPatientForms(uuid: string) {
  return request<any[]>(`/patients/${encodeURIComponent(uuid)}/forms`);
}

export function getPatientAppointments(uuid: string) {
  return request<any[]>(`/patients/${encodeURIComponent(uuid)}/appointments`);
}

export function getForm(formType: string, uuid: string) {
  return request<any>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}`);
}

export function getFormVersion(formType: string, uuid: string, version: number) {
  return request<any>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}/versions/${encodeURIComponent(version)}`);
}

export function getLatestVersion(formType: string, uuid: string) {
  return request<{ version: number | null }>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}/latest-version`);
}

export function getFormHistory(uuid: string) {
  return request<any[]>(`/forms-index/${encodeURIComponent(uuid)}/history`);
}

export function insertForm(formType: string, body: Record<string, any>) {
  return request<any>(`/forms/${encodeURIComponent(formType)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function insertFormsIndex(body: Record<string, any>) {
  return request<any>('/forms-index', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function composerAuth(path: string, body: Record<string, any>) {
  return request<any>(`/composer-auth/${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function saveComposerPrefs(sessionToken: string, prefs: Record<string, any>) {
  return composerAuth('prefs', { sessionToken, prefs });
}

export function listDesignsBySession(sessionToken: string) {
  return request<any[]>('/designs/session/list', {
    method: 'POST',
    body: JSON.stringify({ sessionToken }),
  });
}

export function saveDesign(body: Record<string, any>) {
  return request<any>('/designs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteDesign(body: Record<string, any>) {
  return request<any>('/designs/delete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getImplants() {
  return request<any[]>('/implants');
}

export function markImplantRemoved(id: string | number, dateRemoved: string) {
  return request<any>(`/implants/${encodeURIComponent(String(id))}/removed`, {
    method: 'PATCH',
    body: JSON.stringify({ date_removed: dateRemoved }),
  });
}

export function getOutpatientOutcomes() {
  return request<any[]>('/outpatient-outcomes');
}

export function markOutpatientOutcomeActioned(appointmentUuid: string, dateActioned: string, userId: string) {
  return request<any>(`/outpatient-outcomes/${encodeURIComponent(appointmentUuid)}/actioned`, {
    method: 'PATCH',
    body: JSON.stringify({ outcome_actioned_date: dateActioned, outcome_actioned_user_id: userId }),
  });
}

export function getUsersByNadexIds(nadexIds: string[]) {
  return request<any[]>('/users/by-nadex-ids', {
    method: 'POST',
    body: JSON.stringify({ nadexIds }),
  });
}
