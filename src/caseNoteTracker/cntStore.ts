export type CntUser = {
  uuid: string;
  nadexId: string;
  title: string;
  firstNames: string;
  surname: string;
  role: string;
  speciality?: string;
  facility: string;
};

export type CntPatient = {
  uuid: string;
  nhsNumber: string;
  hospitalNumber: string;
  name: string;
  title: string;
  surname: string;
  forenames: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  crn: string;
  dateOfBirth: string;
  sex: string;
};

export type CntLocation = {
  uuid: string;
  code: string;
  healthBoard: string;
  locality: string;
  facility: string;
  department: string;
  extra: string;
  acceptsRequests: boolean;
  custodianUserUuids: string[];
};

export type CntVolumeEvent = {
  uuid: string;
  kind: 'created' | 'sent' | 'received' | 'merged' | 'destroyed';
  datetime: string;
  fromLocationUuid?: string;
  toLocationUuid?: string;
  userUuid: string;
  note: string;
};

export type CntVolume = {
  uuid: string;
  barcode: string;
  rfid: string;
  patientUuid: string;
  patientNhsNumber: string;
  patientHospitalNumber: string;
  healthBoard: string;
  locality: string;
  type: string;
  volumeNumber: number;
  temporary: boolean;
  currentLocationUuid: string;
  batchUuid?: string;
  events: CntVolumeEvent[];
};

export type CntBatch = {
  uuid: string;
  barcode: string;
  currentLocationUuid: string;
  intendedPurpose: string;
  intendedDestinationUuid: string;
  volumeUuids: string[];
};

export type CntTag = {
  uuid: string;
  volumeUuid: string;
  patientUuid: string;
  purpose: string;
  locationUuid: string;
  requiredBy: string;
  expiresAt: string;
  createdByUserUuid: string;
  forgetWhenReceivedByMe: boolean;
  status: 'active' | 'forgotten';
};

export type CntClinic = {
  uuid: string;
  clinicName: string;
  speciality: string;
  facility: string;
  holdingLocationUuid: string;
  clinician: string;
};

export type CntClinicInstance = {
  uuid: string;
  clinicUuid: string;
  date: string;
  startTime: string;
  endTime: string;
  cancelled: boolean;
  retrieverUserUuids: string[];
  appointments: Array<{ uuid: string; time: string; patientUuid: string; cancelled: boolean; notes: string }>;
};

export type CntRequest = {
  uuid: string;
  volumeUuid: string;
  patientUuid: string;
  requestedByUserUuid: string;
  requiredBy: string;
  requiredFor: string;
  fromLocationUuid: string;
  toLocationUuid: string;
  status: 'open' | 'actioned' | 'cancelled';
};

export type CntPickListEntry = {
  clinicInstanceUuid: string;
  volumeUuid: string;
  received: boolean;
};

export type CntUserPreferences = {
  sendLocationUuid?: string;
  batchUuids?: string[];
  libraryUuids?: string[];
  collapsedKeys?: string[];
  healthBoard?: string;
  locality?: string;
  facility?: string;
  recentChoices?: Record<string, string[]>;
};

export type CntStore = {
  storeVersion: number;
  lastClinicWindowEnd: string;
  users: CntUser[];
  patients: CntPatient[];
  locations: CntLocation[];
  volumes: CntVolume[];
  batches: CntBatch[];
  tags: CntTag[];
  clinics: CntClinic[];
  clinicInstances: CntClinicInstance[];
  requests: CntRequest[];
  cntPickList: CntPickListEntry[];
  preferences: Record<string, CntUserPreferences>;
};

export const defaultCntLoginUserUuid = 'bbbbbbbb-0005-4000-8000-000000000005';

const currentStoreVersion = 5;
const storageKey = 'fbcntStore';
const sessionKey = 'fbcntUserUuid';
const selectedBatchSessionKey = 'fbcntSelectedBatchUuid';

const users: CntUser[] = [
  { uuid: 'bbbbbbbb-0001-4000-8000-000000000001', nadexId: 'gw000101', title: 'Mrs', firstNames: 'Gwen', surname: 'Cooper', role: 'Medical secretary', speciality: 'General surgery', facility: 'Ysbyty Abermawr' },
  { uuid: 'bbbbbbbb-0002-4000-8000-000000000002', nadexId: 'io000102', title: 'Mr', firstNames: 'Iolo', surname: 'Jones', role: 'Medical records clerk', speciality: 'Cardiology', facility: 'Llanawel General' },
  { uuid: 'bbbbbbbb-0003-4000-8000-000000000003', nadexId: 'ma000103', title: 'Dr', firstNames: 'Martha', surname: 'Jones', role: 'Medical secretary', speciality: 'Medicine', facility: 'Tref Afon Hospital' },
  { uuid: 'bbbbbbbb-0004-4000-8000-000000000004', nadexId: 'te000104', title: 'Ms', firstNames: 'Tegan', surname: 'Price', role: 'Medical records clerk', speciality: 'Mental health', facility: 'Morfa Wen Infirmary' },
  { uuid: 'bbbbbbbb-0005-4000-8000-000000000005', nadexId: 'ow000105', title: 'Mr', firstNames: 'Owen', surname: 'Harper', role: 'Medical secretary', speciality: 'Endocrine surgery', facility: 'Ysbyty Abermawr' },
  { uuid: 'bbbbbbbb-0006-4000-8000-000000000006', nadexId: 'ri000106', title: 'Mrs', firstNames: 'Rita', surname: 'Sullivan', role: 'Medical records clerk', speciality: 'Maternity', facility: 'Llyn Teg Community' },
  { uuid: 'bbbbbbbb-0007-4000-8000-000000000007', nadexId: 'si000107', title: 'Ms', firstNames: 'Sian', surname: 'James', role: 'Medical secretary', speciality: 'Diabetes', facility: 'Llanawel General' },
  { uuid: 'bbbbbbbb-0008-4000-8000-000000000008', nadexId: 'br000108', title: 'Ms', firstNames: 'Bryn', surname: 'Cartwright', role: 'Medical records clerk', speciality: 'Breast surgery', facility: 'Tref Afon Hospital' },
];

const patients: CntPatient[] = [
  { uuid: 'fd55880a-7ada-47a8-adbb-65850af6f7e2', nhsNumber: '0000000000', hospitalNumber: 'D000001', name: 'Donald Duck', title: 'Mr', surname: 'DUCK', forenames: 'Donald', addressLine1: 'Duck House', addressLine2: '1 Duck Close', addressLine3: 'Fantasyland', addressLine4: 'Disneyworld, FL3 1DC', crn: '012345678', dateOfBirth: '1956-04-12', sex: 'Male' },
  { uuid: 'aaaaaaaa-0001-4000-8000-000000000001', nhsNumber: '9000000001', hospitalNumber: 'BG100001', name: 'Megan Pritchard', title: 'Mrs', surname: 'PRITCHARD', forenames: 'Megan', addressLine1: '10 Cae Glas', addressLine2: 'Abermawr', addressLine3: 'Gwynedd', addressLine4: 'AB1 2CD', crn: 'BG100001', dateOfBirth: '1972-02-18', sex: 'Female' },
  { uuid: 'aaaaaaaa-0002-4000-8000-000000000002', nhsNumber: '9000000002', hospitalNumber: 'CH100002', name: 'Rhys Morgan', title: 'Mr', surname: 'MORGAN', forenames: 'Rhys', addressLine1: '22 Heol Hafan', addressLine2: 'Llanawel', addressLine3: 'Cwm Hafan', addressLine4: 'CH2 3EF', crn: 'CH100002', dateOfBirth: '1964-09-03', sex: 'Male' },
  { uuid: 'aaaaaaaa-0003-4000-8000-000000000003', nhsNumber: '9000000003', hospitalNumber: 'DA100003', name: 'Carys Evans', title: 'Ms', surname: 'EVANS', forenames: 'Carys', addressLine1: '7 Bryn Afon', addressLine2: 'Tref Afon', addressLine3: 'Dyffryn Aur', addressLine4: 'DA3 4GH', crn: 'DA100003', dateOfBirth: '1981-07-21', sex: 'Female' },
  { uuid: 'aaaaaaaa-0004-4000-8000-000000000004', nhsNumber: '9000000004', hospitalNumber: 'MY100004', name: 'Gareth Bowen', title: 'Mr', surname: 'BOWEN', forenames: 'Gareth', addressLine1: 'Ty Mor', addressLine2: 'Morfa Wen', addressLine3: 'Mynydd y Mor', addressLine4: 'MY4 5JK', crn: 'MY100004', dateOfBirth: '1959-11-09', sex: 'Male' },
  { uuid: 'aaaaaaaa-0005-4000-8000-000000000005', nhsNumber: '9000000005', hospitalNumber: 'TA100005', name: 'Eleri Hughes', title: 'Mrs', surname: 'HUGHES', forenames: 'Eleri', addressLine1: '4 Llys Teg', addressLine2: 'Llyn Teg', addressLine3: 'Tir Afon', addressLine4: 'TA5 6LM', crn: 'TA100005', dateOfBirth: '1990-01-16', sex: 'Female' },
  { uuid: 'aaaaaaaa-0006-4000-8000-000000000006', nhsNumber: '9000000006', hospitalNumber: 'BG100006', name: 'Iwan Thomas', title: 'Mr', surname: 'THOMAS', forenames: 'Iwan', addressLine1: 'Flat 2', addressLine2: 'Glyn Derw Road', addressLine3: 'Glyn Derw', addressLine4: 'BG6 7NP', crn: 'BG100006', dateOfBirth: '1977-05-29', sex: 'Male' },
  { uuid: 'aaaaaaaa-0007-4000-8000-000000000007', nhsNumber: '9000000007', hospitalNumber: 'CH100007', name: 'Nia Williams', title: 'Dr', surname: 'WILLIAMS', forenames: 'Nia', addressLine1: 'Cartref Haf', addressLine2: 'Records Lane', addressLine3: 'Llanawel', addressLine4: 'CH7 8QR', crn: 'CH100007', dateOfBirth: '1969-12-14', sex: 'Female' },
];

const locationSeed = [
  ['Bae Glas University Health Board', 'Abermawr', 'Ysbyty Abermawr', 'Main records library', 'Shelf A3', true],
  ['Bae Glas University Health Board', 'Glyn Derw', 'Glyn Derw Clinic', 'Outpatients', 'Blue trolley', false],
  ['Cwm Hafan Health Board', 'Llanawel', 'Llanawel General', 'Records hub', 'Cabinet 4', true],
  ['Dyffryn Aur Teaching Health Board', 'Tref Afon', 'Tref Afon Hospital', 'Surgery corridor', 'Rack 2', false],
  ['Mynydd Y Mor Health Board', 'Morfa Wen', 'Morfa Wen Infirmary', 'Mental health library', 'Secure stack', true],
  ['Tir Afon Integrated Health Board', 'Llyn Teg', 'Llyn Teg Community', 'Clinic reception', 'Behind desk', false],
] as const;

const volumeTypes = ['General', 'Surgery', 'Cardiology', 'Mental health', 'Maternity', 'Diabetes'];
const clinicSeed = [
  ['Rapid access breast clinic', 'Breast surgery', 0, 'Ms Bryn Cartwright'],
  ['Lumps clinic', 'General surgery', 0, 'Mr Owen Harper'],
  ['New endocrine', 'Endocrine surgery', 3, 'Mr Dylan Trotter'],
  ['Breast pain follow-up', 'Breast surgery', 1, 'Ms Bryn Cartwright'],
  ['Endocrine surgery', 'Endocrine surgery', 3, 'Mr Alan Stokes'],
  ['General surgery', 'General surgery', 2, 'Mr Owen Harper'],
  ['Tuesday pm cardiology follow-up', 'Cardiology', 2, 'Dr Martha Jones'],
  ['Diabetes annual review', 'Diabetes', 5, 'Ms Sian James'],
] as const;

export function loadCntStore(): CntStore {
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed?.storeVersion === currentStoreVersion) return parsed;
    } catch {
      // Fall through and rebuild the simulated database.
    }
    localStorage.removeItem(storageKey);
  }
  const store = createInitialCntStore();
  saveCntStore(store);
  return store;
}

export function saveCntStore(store: CntStore) {
  localStorage.setItem(storageKey, JSON.stringify(store));
}

export function getSessionUserUuid() {
  return sessionStorage.getItem(sessionKey) || '';
}

export function setSessionUserUuid(uuidValue: string) {
  sessionStorage.setItem(sessionKey, uuidValue);
}

export function clearSessionUserUuid() {
  sessionStorage.removeItem(sessionKey);
}

export function getSelectedBatchUuid() {
  return sessionStorage.getItem(selectedBatchSessionKey) || '';
}

export function setSelectedBatchUuid(uuidValue: string) {
  sessionStorage.setItem(selectedBatchSessionKey, uuidValue);
}

export function clearSelectedBatchUuid() {
  sessionStorage.removeItem(selectedBatchSessionKey);
}

export function loginMaintenance(store: CntStore, userUuid: string): CntStore {
  const next = { ...store, preferences: { ...store.preferences }, cntPickList: [...(store.cntPickList || [])] };
  next.preferences[userUuid] ||= { recentChoices: {} };
  ensureClinicWindow(next);
  churnAppointments(next);
  prunePastPickList(next);
  saveCntStore(next);
  return next;
}

export function resolveIdentifier(store: CntStore, identifier: string) {
  const value = identifier.trim().toLowerCase();
  if (!value) return { kind: 'empty' as const };
  const volume = store.volumes.find((item) => item.barcode.toLowerCase() === value || item.rfid.toLowerCase() === value);
  if (volume) return { kind: 'volume' as const, volume };
  const batch = store.batches.find((item) => item.barcode.toLowerCase() === value);
  if (batch) return { kind: 'batch' as const, batch };
  const location = store.locations.find((item) => item.code.toLowerCase() === value);
  if (location) return { kind: 'location' as const, location };
  const patient = store.patients.find((item) => item.nhsNumber.toLowerCase() === value || item.hospitalNumber.toLowerCase() === value);
  if (patient) return { kind: 'patient' as const, patient };
  return { kind: 'unknown' as const };
}

export function createInitialCntStore(): CntStore {
  const locations: CntLocation[] = locationSeed.map((item, index) => ({
    uuid: uuid(`loc-${index}`),
    code: `LOC-${1000 + index}`,
    healthBoard: item[0],
    locality: item[1],
    facility: item[2],
    department: item[3],
    extra: item[4],
    acceptsRequests: item[5],
    custodianUserUuids: users
      .filter((user) => user.facility === item[2])
      .map((user) => user.uuid),
  }));
  const volumes = createVolumes(locations);
  const clinics = createClinics(locations);
  const store: CntStore = {
    storeVersion: currentStoreVersion,
    lastClinicWindowEnd: new Date().toISOString().slice(0, 10),
    users,
    patients,
    locations,
    volumes,
    batches: [{
      uuid: uuid('batch-0'),
      barcode: 'BATCH-2000',
      currentLocationUuid: locations[0].uuid,
      intendedPurpose: 'Clinic preparation',
      intendedDestinationUuid: locations[3].uuid,
      volumeUuids: volumes.slice(0, 3).map((volume) => volume.uuid),
    }],
    tags: [{
      uuid: uuid('tag-0'),
      volumeUuid: volumes[0].uuid,
      patientUuid: volumes[0].patientUuid,
      purpose: 'Needed for consultant review',
      locationUuid: locations[3].uuid,
      requiredBy: addDays(3),
      expiresAt: addDays(21),
      createdByUserUuid: users[0].uuid,
      forgetWhenReceivedByMe: true,
      status: 'active',
    }],
    clinics,
    clinicInstances: [],
    requests: [{
      uuid: uuid('request-0'),
      volumeUuid: volumes[1].uuid,
      patientUuid: volumes[1].patientUuid,
      requestedByUserUuid: users[0].uuid,
      requiredBy: addDays(2),
      requiredFor: 'Rapid access breast clinic',
      fromLocationUuid: locations[0].uuid,
      toLocationUuid: locations[3].uuid,
      status: 'open',
    }],
    cntPickList: [],
    preferences: {},
  };
  store.batches[0].volumeUuids.forEach((volumeUuid) => {
    const volume = store.volumes.find((candidate) => candidate.uuid === volumeUuid);
    if (volume) volume.batchUuid = store.batches[0].uuid;
  });
  ensureClinicWindow(store);
  return store;
}

function prunePastPickList(store: CntStore) {
  const today = new Date().toISOString().slice(0, 10);
  const currentClinicInstanceUuids = new Set(
    store.clinicInstances
      .filter((instance) => instance.date >= today)
      .map((instance) => instance.uuid)
  );
  store.cntPickList = (store.cntPickList || []).filter((entry) => currentClinicInstanceUuids.has(entry.clinicInstanceUuid));
}

function createVolumes(locations: CntLocation[]) {
  const volumes: CntVolume[] = [];
  patients.forEach((patient, patientIndex) => {
    const normalCount = 4 + (patientIndex % 9);
    const tempCount = patientIndex % 4;
    const groupCounters: Record<string, number> = {};
    for (let i = 0; i < normalCount + tempCount; i += 1) {
      const temporary = i >= normalCount;
      const location = locations[patientIndex % locations.length];
      const type = volumeTypes[(patientIndex + Math.floor(i / 2)) % volumeTypes.length];
      const groupKey = `${location.healthBoard}|${location.locality}|${type}`;
      const volumeNumber = (groupCounters[groupKey] || 0) + 1;
      groupCounters[groupKey] = volumeNumber;
      const volume: CntVolume = {
        uuid: uuid(`vol-${patientIndex}-${i}`),
        barcode: `VOL-${patientIndex + 1}${String(i + 1).padStart(3, '0')}-${temporary ? 'T' : 'P'}`,
        rfid: `RFID-${patientIndex + 1}-${i + 1}`,
        patientUuid: patient.uuid,
        patientNhsNumber: patient.nhsNumber,
        patientHospitalNumber: patient.hospitalNumber,
        healthBoard: location.healthBoard,
        locality: location.locality,
        type,
        volumeNumber,
        temporary,
        currentLocationUuid: location.uuid,
        events: [],
      };
      volume.events = createHistory(volume, locations, patientIndex + i);
      volumes.push(volume);
    }
  });
  return volumes;
}

function createHistory(volume: CntVolume, locations: CntLocation[], seed: number): CntVolumeEvent[] {
  const count = 1 + (seed % 40);
  const homeLocations = locations.filter((location) => location.healthBoard === volume.healthBoard && location.locality === volume.locality);
  const homeLocation = homeLocations[seed % Math.max(homeLocations.length, 1)] || locations[seed % locations.length];
  const rareRemoteLocation = locations.find((location) => location.healthBoard !== volume.healthBoard || location.locality !== volume.locality) || homeLocation;
  const events: CntVolumeEvent[] = [{
    uuid: uuid(`${volume.uuid}-event-created`),
    kind: 'created',
    datetime: addDays(-120 - seed),
    toLocationUuid: homeLocation.uuid,
    userUuid: users[seed % users.length].uuid,
    note: `Created ${volume.temporary ? 'temporary ' : ''}${volume.type} volume`,
  }];
  for (let i = 1; i < count; i += 1) {
    const fromUuid = events[events.length - 1].toLocationUuid || homeLocation.uuid;
    const from = locations.find((location) => location.uuid === fromUuid) || homeLocation;
    const to = seed % 10 === 0 && i === count - 1 ? rareRemoteLocation : homeLocations[(seed + i) % Math.max(homeLocations.length, 1)] || homeLocation;
    events.push({
      uuid: uuid(`${volume.uuid}-event-${i}`),
      kind: i % 2 ? 'sent' : 'received',
      datetime: addDays(-120 - seed + i * 2),
      fromLocationUuid: from.uuid,
      toLocationUuid: to.uuid,
      userUuid: users[(seed + i) % users.length].uuid,
      note: i % 2 ? `Sent to ${to.department}` : `Received from ${from.department}`,
    });
    volume.currentLocationUuid = to.uuid;
  }
  if (seed % 10 !== 0) {
    volume.currentLocationUuid = homeLocation.uuid;
  }
  return events;
}

function createClinics(locations: CntLocation[]): CntClinic[] {
  return clinicSeed.map((item, index) => {
    const location = locations[item[2]];
    return {
      uuid: uuid(`clinic-${index}`),
      clinicName: item[0],
      speciality: item[1],
      facility: location.facility,
      holdingLocationUuid: location.uuid,
      clinician: item[3],
    };
  });
}

function ensureClinicWindow(store: CntStore) {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 42);
  const previousEnd = new Date(store.lastClinicWindowEnd || today.toISOString().slice(0, 10));
  for (let d = new Date(previousEnd); d <= end; d.setDate(d.getDate() + 7)) {
    store.clinics.forEach((clinic, index) => {
      const date = new Date(d);
      date.setDate(d.getDate() + (index % 5));
      const isoDate = date.toISOString().slice(0, 10);
      const id = uuid(`${clinic.uuid}-${isoDate}`);
      if (!store.clinicInstances.some((instance) => instance.uuid === id)) {
        store.clinicInstances.push({
          uuid: id,
          clinicUuid: clinic.uuid,
          date: isoDate,
          startTime: index % 2 ? '13:30' : '09:00',
          endTime: index % 2 ? '17:00' : '12:30',
          cancelled: false,
          retrieverUserUuids: [users[index % users.length].uuid],
          appointments: patients.slice(0, 8).map((patient, apptIndex) => ({
            uuid: uuid(`${id}-appt-${apptIndex}`),
            time: `${String(index % 2 ? 13 + Math.floor(apptIndex / 2) : 9 + Math.floor(apptIndex / 4)).padStart(2, '0')}:${String((apptIndex % 4) * 15).padStart(2, '0')}`,
            patientUuid: patients[(apptIndex + index) % patients.length].uuid,
            cancelled: false,
            notes: '',
          })),
        });
      }
    });
  }
  store.lastClinicWindowEnd = end.toISOString().slice(0, 10);
}

function churnAppointments(store: CntStore) {
  const today = new Date().toISOString().slice(0, 10);
  store.clinicInstances
    .filter((instance) => instance.date >= today)
    .slice(0, 12)
    .forEach((instance, index) => {
      if (instance.appointments.some((appointment) => appointment.notes === 'Replacement booking from simulated churn')) return;
      const churnCount = 2 + (index % 3);
      instance.appointments.slice(0, churnCount).forEach((appointment, apptIndex) => {
        appointment.cancelled = true;
        appointment.notes = 'Cancelled during simulated login churn';
        const replacement = patients[(index + apptIndex + 3) % patients.length];
        instance.appointments.push({
          uuid: uuid(`${instance.uuid}-replacement-${apptIndex}`),
          time: appointment.time,
          patientUuid: replacement.uuid,
          cancelled: false,
          notes: 'Replacement booking from simulated churn',
        });
      });
    });
}

export function locationLabel(store: CntStore, uuidValue = '') {
  const loc = store.locations.find((item) => item.uuid === uuidValue);
  return loc ? `${loc.healthBoard} / ${loc.locality} / ${loc.facility} / ${loc.department} ${loc.extra}` : '';
}

export function locationLabelForVolume(store: CntStore, volume: CntVolume) {
  const loc = store.locations.find((item) => item.uuid === volume.currentLocationUuid);
  if (!loc) return '';
  const parts = [
    loc.healthBoard === volume.healthBoard ? '' : loc.healthBoard,
    loc.locality === volume.locality ? '' : loc.locality,
    loc.facility,
    loc.department,
    loc.extra,
  ].filter(Boolean);
  return parts.join(' / ');
}

export function patientName(store: CntStore, uuidValue = '') {
  return store.patients.find((item) => item.uuid === uuidValue)?.name || 'Unknown patient';
}

export function uuid(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const tail = hash.toString(16).padStart(12, '0').slice(0, 12);
  return `${tail.slice(0, 8)}-${tail.slice(8, 12)}-4${tail.slice(1, 4)}-8${tail.slice(4, 7)}-${tail}`;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
