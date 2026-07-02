import { createApiClient } from './client';

const api = createApiClient();

export function getPatients() {
  return api.get<any[]>('/patients');
}

export function searchPatients(searchQuery: string) {
  return api.post<any[]>('/patients/search', { searchQuery });
}

export function getPatient(uuid: string) {
  return api.get<any>(`/patients/${encodeURIComponent(uuid)}`);
}

export function getPatientForms(uuid: string) {
  return api.get<any[]>(`/patients/${encodeURIComponent(uuid)}/forms`);
}

export function getPatientAppointments(uuid: string) {
  return api.get<any[]>(`/patients/${encodeURIComponent(uuid)}/appointments`);
}

export function getForm(formType: string, uuid: string) {
  return api.get<any>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}`);
}

export function getFormVersion(formType: string, uuid: string, version: number) {
  return api.get<any>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}/versions/${encodeURIComponent(version)}`);
}

export function getLatestVersion(formType: string, uuid: string) {
  return api.get<{ version: number | null }>(`/forms/${encodeURIComponent(formType)}/${encodeURIComponent(uuid)}/latest-version`);
}

export function getFormHistory(uuid: string) {
  return api.get<any[]>(`/forms-index/${encodeURIComponent(uuid)}/history`);
}

export function insertForm(formType: string, body: Record<string, any>) {
  return api.post<any>(`/forms/${encodeURIComponent(formType)}`, body);
}

export function insertFormsIndex(body: Record<string, any>) {
  return api.post<any>('/forms-index', body);
}

export function composerAuth(path: string, body: Record<string, any>) {
  return api.post<any>(`/composer-auth/${path}`, body);
}

export function saveComposerPrefs(sessionToken: string, prefs: Record<string, any>) {
  return composerAuth('prefs', { sessionToken, prefs });
}

export function listDesignsBySession(sessionToken: string) {
  return api.post<any[]>('/designs/session/list', { sessionToken });
}

export function saveDesign(body: Record<string, any>) {
  return api.post<any>('/designs', body);
}

export function deleteDesign(body: Record<string, any>) {
  return api.post<any>('/designs/delete', body);
}

export function getPublicDesign(publicId: string) {
  return api.get<any>(`/designs/public/${encodeURIComponent(publicId)}`);
}

export function getImplants() {
  return api.get<any[]>('/implants');
}

export function markImplantRemoved(id: string | number, dateRemoved: string) {
  return api.patch<any>(`/implants/${encodeURIComponent(String(id))}/removed`, { date_removed: dateRemoved });
}

export function getOutpatientOutcomes() {
  return api.get<any[]>('/outpatient-outcomes');
}

export function markOutpatientOutcomeActioned(appointmentUuid: string, dateActioned: string, userId: string) {
  return api.patch<any>(`/outpatient-outcomes/${encodeURIComponent(appointmentUuid)}/actioned`, {
    outcome_actioned_date: dateActioned,
    outcome_actioned_user_id: userId
  });
}

export function getUsersByNadexIds(nadexIds: string[]) {
  return api.post<any[]>('/users/by-nadex-ids', { nadexIds });
}
