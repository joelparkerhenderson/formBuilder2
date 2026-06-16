const configuredBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const apiBase = configuredBase || '/formBuilder2/api';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
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

export function getLatestVersion(formType: string, uuid: string) {
  return request<{ version: number | null }>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}/latest-version`);
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
