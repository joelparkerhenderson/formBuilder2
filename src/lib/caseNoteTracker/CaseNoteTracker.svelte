<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { createApiClient } from '$lib/api/client';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbAddButton from '$lib/components/fb/fbAddButton.svelte';
  import FbBoxedInfo from '$lib/components/fb/fbBoxedInfo.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbHBSelector from '$lib/components/fb/fbHBSelector.svelte';
  import FbModal from '$lib/components/fb/fbModal.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbToolTipUser from '$lib/components/fb/fbToolTipUser.svelte';
  import FbUserName from '$lib/components/fb/fbUserName.svelte';
  import FbcntModalBatchSelected from './FbcntModalBatchSelected.svelte';
  import FbcntModalMovement from './FbcntModalMovement.svelte';
  import FbcntPageLocator from './FbcntPageLocator.svelte';
  import FbcntPageManageVolume from './FbcntPageManageVolume.svelte';
  import FbcntPageRegisterVolume from './FbcntPageRegisterVolume.svelte';
  import FbcntPageRequest from './FbcntPageRequest.svelte';
  import FbcntPageSelector from './FbcntPageSelector.svelte';
  import FbcntSelectedVolumes from './FbcntSelectedVolumes.svelte';
  import FbcntSelectedVolumesLocation from './FbcntSelectedVolumesLocation.svelte';
  import FbcntSelectedVolumesReceived from './FbcntSelectedVolumesReceived.svelte';
  import { formDateToIsoDate, formatFormDate } from '$lib/utils/dateFormat';
  import {
    fbcntVolumeHistoryPatchForStatusReversal,
    fbcntVolumePatchFromValue,
    fbcntVolumeValueFromVolume,
    validateFbcntManageVolumeValue,
    type FbcntManageVolumeValue,
    type FbcntVolumeRecordStatus,
  } from './FbcntManageVolume.svelte';
  import SmallButton from './cntSmallButton.svelte';
  import Table from './cntTable.svelte';
  import {
    clearSessionUserUuid,
    defaultCntLoginUserUuid,
    getSessionUserUuid,
    loadCntStore,
    locationLabel,
    loginMaintenance,
    patientName,
    resolveIdentifier,
    saveCntStore,
    setSessionUserUuid,
    uuid,
    type CntAppointment,
    type CntClinicInstance,
    type CntPatient,
    type CntPickListEntry,
    type CntRequest,
    type CntStore,
    type CntUser,
    type CntVolume,
  } from './cntStore';
  import type { Patient } from '$lib/types';
  import { openHrefWithReturn } from '$lib/utils/fbHrefNavigation';

  type View =
    | 'login'
    | 'preferences'
    | 'home'
    | 'patientSearch'
    | 'locator'
    | 'selector'
    | 'history'
    | 'manageVolume'
    | 'registerVolume'
    | 'batches'
    | 'batch'
    | 'findBatch'
    | 'createBatch'
    | 'requests'
    | 'request'
    | 'requestSelector'
    | 'inbox'
    | 'returnList'
    | 'picklist'
    | 'clinics'
    | 'clinicSchedule'
    | 'clinicDates'
    | 'allClinics'
    | 'clinicList'
    | 'selectClinics'
    | 'locations'
    | 'admin';

  export let inline = false;
  export let initialPatientUuid = '';
  export let initialPatient: CntPatient | undefined = undefined;
  export let initialView = '';
  export let onBack: (() => void) | undefined = undefined;

  let store: CntStore = loadCntStore();
  let view: View = 'login';
  let userUuid = '';
  let selectedPatientUuid = initialPatientUuid;
  let selectedVolumeUuid = '';
  let selectedVolumeUuids: string[] = [];
  let selectedBatchUuid = '';
  let selectedClinicUuid = '';
  let selectedClinicInstanceUuid = '';
  let requestPatientUuid = '';
  let requestVolumeUuids: string[] = [];
  let requestRequiredFor = '';
  let requestFromLocationUuid = '';
  let requestToLocationUuid = '';
  let stack: View[] = [];
  let searchQuery = '';
  let preferenceHealthBoard = '';
  let preferenceLocality = '';
  let preferenceFacility = '';
  let addLibraryLocationUuid = '';
  let showAddLibraryPicker = false;
  let selectedClinicInstanceUuids: string[] = [];
  let confirmStopClinicInstanceUuid = '';
  let managedVolumeUuid = '';
  let managedVolumeDraft: FbcntManageVolumeValue | null = null;
  let addVolumeCreatedDate = formatFormDate(new Date());
  let addVolumeHealthBoard = '';
  let addVolumeLocality = '';
  let addVolumeType = 'General';
  let addVolumeStatus: 'Permanent' | 'Temporary' = 'Permanent';
  let addVolumeRecordStatus: FbcntVolumeRecordStatus = 'active';
  let addVolumeNumber = '';
  let addVolumeDateClosed = '';
  let addVolumeDateDestroyed = '';
  let addVolumeReasonDestroyed = '';
  let addVolumeLocationUuid = '';
  let addVolumeBarcode = '';
  let addVolumeRfid = '';
  let addVolumeBatchUuid = '';
  let locationFilterHealthBoard = '';
  let locationFilterLocality = '';
  let locationFilterFacility = '';
  let showHistoricClinics = false;
  let showRescheduledAppointments = false;
  let showCancelledAppointments = false;
  let includeRetrievedPicklistPatients = false;
  let receivePickListVolumeUuids: string[] = [];
  let pickListReceivePopupOpen = false;
  let returnListSendPopup: { patientUuid: string; locationUuid: string; volumeUuids: string[] } | null = null;
  let returnListSendVolumeUuids: string[] = [];
  let requestSendPopup: RequestRow | null = null;
  let sendSourceUuid = '';
  let activeTreeVisualKey = '';
  let sendDestinationUuid = '';
  let movementPopup: '' | 'send' | 'receive' = '';
  let receiveSourceUuid = '';
  let receiveDestinationUuid = '';
  let batchSelectedPopupOpen = false;
  let tagSelectedPopupOpen = false;
  let tagPurpose = '';
  let tagLocationUuid = '';
  let hiddenDoneRequestKeys: string[] = [];
  let removedReturnPatientUuids: string[] = [];
  let returnListRevision = 0;
  let findBatchSearch = '';
  let createBatchPurpose = 'Clinic preparation';
  let createBatchCurrentLocationUuid = '';
  let createBatchDestinationUuid = '';
  let createBatchBarcode = '';
  let modalMessage = '';
  let cntTreeCollapsed: Record<string, boolean> = {};
  let pendingInitialView: View = 'home';
  let scanIdentifier = '';
  let patientSearchResults: CntPatient[] = [];
  let patientSearchLoading = false;
  let patientSearchError = '';
  let patientSearchSerial = 0;

  const api = createApiClient();

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('forceLogin') === '1') {
      clearSessionUserUuid();
      userUuid = '';
      view = 'login';
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    const loginAs = params.get('loginAs');
    const patientUuid = params.get('patientUuid');
    const requestedView = params.get('view') || initialView;
    pendingInitialView = safeInitialView(requestedView);
    if (patientUuid) {
      const sessionPatient = readInitialPatient(patientUuid);
      if (!store.patients.some((patient) => patient.uuid === patientUuid)) {
        store = ensurePatientInStore(store, sessionPatient || fallbackPatient(patientUuid));
        saveCntStore(store);
      }
      selectedPatientUuid = patientUuid;
    }
    const sessionUuid = getSessionUserUuid();
    if (loginAs || sessionUuid || inline) {
      login(loginAs || sessionUuid || defaultCntLoginUserUuid, false, (patientUuid || initialPatientUuid) && !requestedView ? 'locator' : pendingInitialView);
    }
  });

  $: user = store.users.find((item) => item.uuid === userUuid);
  $: selectedPatient = store.patients.find((item) => item.uuid === selectedPatientUuid) || initialPatient;
  $: selectedVolume = store.volumes.find((item) => item.uuid === selectedVolumeUuid);
  $: selectedBatch = store.batches.find((item) => item.uuid === selectedBatchUuid);
  $: selectedClinic = store.clinics.find((item) => item.uuid === selectedClinicUuid);
  $: selectedClinicInstance = store.clinicInstances.find((item) => item.uuid === selectedClinicInstanceUuid);
  $: patientVolumes = selectedPatientUuid ? store.volumes.filter((volume) => volume.patientUuid === selectedPatientUuid).sort(volumeSort) : [];
  $: filteredPatients = searchQuery.trim() ? patientSearchResults : [];
  $: outboxRows = groupedRequestRows(store.requests.filter((request) => request.requestedByUserUuid === userUuid && request.status !== 'cancelled'));
  $: inboxRows = groupedRequestRows(store.requests.filter((request) => request.status === 'open' && custodianUuidsForLocation(request.toLocationUuid).includes(userUuid)));
  $: favouriteBatchUuids = (store.preferences[userUuid]?.batchUuids ?? store.batches.slice(0, 1).map((batch) => batch.uuid))
    .filter((batchUuid) => store.batches.some((batch) => batch.uuid === batchUuid));
  $: favouriteLibraryUuids = store.preferences[userUuid]?.libraryUuids || store.locations.filter((location) => location.acceptsRequests).slice(0, 2).map((location) => location.uuid);
  $: locationFilteredRows = store.locations.filter((location) =>
    (!locationFilterHealthBoard || location.healthBoard === locationFilterHealthBoard)
    && (!locationFilterLocality || location.locality === locationFilterLocality)
    && (!locationFilterFacility || location.facility === locationFilterFacility));

  function login(uuidValue: string, showPreferences = true, target: View = 'home') {
    if (!store.users.some((item) => item.uuid === uuidValue)) {
      clearSessionUserUuid();
      userUuid = '';
      view = 'login';
      return;
    }
    store = loginMaintenance(store, uuidValue);
    userUuid = uuidValue;
    setSessionUserUuid(uuidValue);
    const pref = preferenceSelection(uuidValue);
    preferenceHealthBoard = pref.healthBoard;
    preferenceLocality = pref.locality;
    preferenceFacility = pref.facility;
    locationFilterHealthBoard = pref.healthBoard;
    locationFilterLocality = pref.locality;
    locationFilterFacility = pref.facility;
    stack = [];
    view = showPreferences ? 'preferences' : target;
  }

  function safeInitialView(value: string): View {
    const normalised = value.trim();
    const allowed: Record<string, View> = {
      home: 'home',
      pickList: 'picklist',
      picklist: 'picklist',
      clinics: 'clinics',
      clinicSchedule: 'clinicSchedule',
      allClinics: 'allClinics',
      requests: 'requests',
      inbox: 'inbox',
      returnList: 'returnList',
      locations: 'locations',
      admin: 'admin',
      patientSearch: 'patientSearch',
      selector: 'selector',
      requestSelector: 'requestSelector',
      batches: 'batches',
      batch: 'batch',
      findBatch: 'findBatch',
      createBatch: 'createBatch',
    };
    return allowed[normalised] || 'home';
  }

  function logout() {
    clearSessionUserUuid();
    userUuid = '';
    stack = [];
    view = 'login';
  }

  function navigate(next: View) {
    stack = [...stack, view];
    view = next;
  }

  function back() {
    if (view === 'login') {
      if (onBack) onBack();
      else window.location.href = '/formBuilder2/';
      return;
    }
    if (view === 'home') {
      logout();
      return;
    }
    if (onBack && inline && stack.length === 0) {
      onBack();
      return;
    }
    const previous = stack.at(-1);
    if (previous) {
      stack = stack.slice(0, -1);
      view = previous;
    } else if (view !== 'home') {
      view = 'home';
    }
  }

  function savePreferences() {
    if (!userUuid) return;
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          healthBoard: preferenceHealthBoard,
          locality: preferenceLocality,
          facility: preferenceFacility,
        },
      },
    };
    saveCntStore(store);
    view = 'home';
  }

  function preferenceSelection(uuidValue = userUuid) {
    const pref = store.preferences[uuidValue] || {};
    const userValue = store.users.find((item) => item.uuid === uuidValue);
    const fallback = store.locations.find((location) => location.facility === userValue?.facility) || store.locations[0];
    return {
      healthBoard: pref.healthBoard || fallback?.healthBoard || '',
      locality: pref.locality || fallback?.locality || '',
      facility: pref.facility || fallback?.facility || '',
    };
  }

  function readInitialPatient(patientUuid: string): CntPatient | undefined {
    const raw = sessionStorage.getItem('fbcntInitialPatient');
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as Partial<CntPatient>;
      if (parsed.uuid !== patientUuid) return undefined;
      return {
        uuid: parsed.uuid,
        nhsNumber: parsed.nhsNumber || '',
        hospitalNumber: parsed.hospitalNumber || parsed.uuid.slice(0, 8),
        name: parsed.name || `${parsed.forenames || ''} ${parsed.surname || ''}`.trim() || `Patient ${parsed.uuid.slice(0, 8)}`,
        title: parsed.title || '',
        surname: parsed.surname || 'PATIENT',
        forenames: parsed.forenames || parsed.uuid.slice(0, 8),
        addressLine1: parsed.addressLine1 || '',
        addressLine2: parsed.addressLine2 || '',
        addressLine3: parsed.addressLine3 || '',
        addressLine4: parsed.addressLine4 || '',
        dateOfBirth: parsed.dateOfBirth || '1900-01-01',
        sex: parsed.sex || 'Unknown',
      };
    } catch {
      return undefined;
    }
  }

  function fallbackPatient(patientUuid: string): CntPatient {
    return {
      uuid: patientUuid,
      nhsNumber: '',
      hospitalNumber: patientUuid.slice(0, 8),
      name: `Patient ${patientUuid.slice(0, 8)}`,
      title: '',
      surname: 'PATIENT',
      forenames: patientUuid.slice(0, 8),
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      addressLine4: '',
      dateOfBirth: '1900-01-01',
      sex: 'Unknown',
    };
  }

  function ensurePatientInStore(currentStore: CntStore, patient: CntPatient): CntStore {
    if (currentStore.patients.some((item) => item.uuid === patient.uuid)) return currentStore;
    const seededVolumes = currentStore.locations.slice(0, 4).map((location, index): CntVolume => {
      const volumeUuid = uuid(`external-volume-${patient.uuid}-${index}`);
      return {
        uuid: volumeUuid,
        barcode: `VOL-${patient.hospitalNumber || patient.uuid.slice(0, 8)}-${String(index + 1).padStart(3, '0')}`,
        rfid: `RFID-${patient.uuid.slice(0, 8)}-${index + 1}`,
        patientUuid: patient.uuid,
        patientNhsNumber: patient.nhsNumber,
        patientHospitalNumber: patient.hospitalNumber,
        healthBoard: location.healthBoard,
        locality: location.locality,
        type: index === 3 ? 'Temporary' : 'General',
        volumeNumber: index + 1,
        temporary: index === 3,
        currentLocationUuid: location.uuid,
        events: [{
          uuid: uuid(`${volumeUuid}-event-created`),
          kind: 'created',
          datetime: new Date().toISOString(),
          toLocationUuid: location.uuid,
          userUuid: defaultCntLoginUserUuid,
          note: 'Created simulated external-patient volume',
        }],
      };
    });
    return {
      ...currentStore,
      patients: [...currentStore.patients, patient],
      volumes: [...currentStore.volumes, ...seededVolumes],
    };
  }

  function selectValue(event: Event) {
    return (event.currentTarget as HTMLSelectElement).value;
  }

  function toggleCntTree(key: string) {
    cntTreeCollapsed = { ...cntTreeCollapsed, [key]: !cntTreeCollapsed[key] };
  }

  function cntTreeOpen(key: string) {
    return !cntTreeCollapsed[key];
  }

  function setFilterValue(useLocationFilter: boolean, field: 'healthBoard' | 'locality' | 'facility', value: string) {
    if (useLocationFilter) {
      if (field === 'healthBoard') {
        locationFilterHealthBoard = value;
        locationFilterLocality = '';
        locationFilterFacility = '';
      } else if (field === 'locality') {
        locationFilterLocality = value;
        locationFilterFacility = '';
      } else {
        locationFilterFacility = value;
      }
      return;
    }
    if (field === 'healthBoard') {
      preferenceHealthBoard = value;
      preferenceLocality = '';
      preferenceFacility = '';
    } else if (field === 'locality') {
      preferenceLocality = value;
      preferenceFacility = '';
    } else {
      preferenceFacility = value;
    }
  }

  function openPatient(patientUuid: string) {
    if (stack.at(-1) === 'request') {
      requestPatientUuid = patientUuid;
      selectedPatientUuid = patientUuid;
      stack = stack.slice(0, -1);
      view = 'request';
      return;
    }
    selectedPatientUuid = patientUuid;
    navigate('locator');
  }

  async function runPatientSearch(value: string) {
    searchQuery = value;
    const trimmed = value.trim();
    if (!trimmed) {
      patientSearchResults = [];
      patientSearchLoading = false;
      patientSearchError = '';
      patientSearchSerial += 1;
      return;
    }

    const serial = ++patientSearchSerial;
    patientSearchResults = [];
    patientSearchLoading = true;
    patientSearchError = '';
    try {
      const patients = await api.post<Patient[]>('/patients/search', { searchQuery: trimmed });
      if (serial === patientSearchSerial) patientSearchResults = (patients || []).slice(0, 30).map(toCntPatient);
    } catch (error) {
      if (serial === patientSearchSerial) {
        patientSearchResults = [];
        patientSearchError = error instanceof Error ? error.message : 'Patient search failed.';
      }
    } finally {
      if (serial === patientSearchSerial) patientSearchLoading = false;
    }
  }

  function openPatientSearchResult(patient: CntPatient) {
    store = ensurePatientInStore(store, patient);
    saveCntStore(store);
    openPatient(patient.uuid);
  }

  function openPatientRecord(patientUuid: string) {
    openHrefWithReturn(`${base}/patient-record/${encodeURIComponent(patientUuid)}?username=${encodeURIComponent(user?.username || 'demoUser')}`);
  }

  function openNewRequest() {
    requestPatientUuid = selectedPatientUuid || '';
    requestVolumeUuids = selectedVolumeUuids.length ? selectedVolumeUuids : selectedVolumeUuid ? [selectedVolumeUuid] : [];
    requestRequiredFor = requestRequiredFor || '';
    requestFromLocationUuid = requestFromLocationUuid || store.volumes.find((volume) => requestVolumeUuids.includes(volume.uuid))?.currentLocationUuid || '';
    requestToLocationUuid = requestToLocationUuid || store.locations.find((location) => location.acceptsRequests)?.uuid || '';
    navigate('request');
  }

  function toggleRequestVolume(volumeUuid: string) {
    requestVolumeUuids = requestVolumeUuids.includes(volumeUuid)
      ? requestVolumeUuids.filter((item) => item !== volumeUuid)
      : [...requestVolumeUuids, volumeUuid];
  }

  function chooseSelectedVolumeForRequest() {
    const volumeUuids = selectedVolumeUuids.length ? selectedVolumeUuids : selectedVolumeUuid ? [selectedVolumeUuid] : [];
    if (!volumeUuids.length) {
      modalMessage = 'Select a case-note volume first.';
      return;
    }
    for (const volumeUuid of volumeUuids) {
      if (!requestVolumeUuids.includes(volumeUuid)) toggleRequestVolume(volumeUuid);
    }
    if (!requestPatientUuid) requestPatientUuid = selectedPatientUuid;
    if (!requestFromLocationUuid) {
      requestFromLocationUuid = store.volumes.find((volume) => volume.uuid === volumeUuids[0])?.currentLocationUuid || '';
    }
    if (!requestToLocationUuid) {
      requestToLocationUuid = store.locations.find((location) => location.acceptsRequests)?.uuid || '';
    }
    const requestIndex = stack.lastIndexOf('request');
    if (requestIndex >= 0) {
      stack = stack.slice(0, requestIndex);
      view = 'request';
    } else {
      navigate('request');
    }
  }

  function saveRequestVolumeSelection() {
    requestVolumeUuids = selectedVolumeUuids;
    const firstSelected = store.volumes.find((volume) => selectedVolumeUuids.includes(volume.uuid));
    if (firstSelected && !requestFromLocationUuid) requestFromLocationUuid = firstSelected.currentLocationUuid;
    const requestIndex = stack.lastIndexOf('request');
    if (requestIndex >= 0) {
      stack = stack.slice(0, requestIndex);
      view = 'request';
    } else {
      back();
    }
  }

  function openPickListSelector(clinicInstanceUuid: string, patientUuid: string) {
    const patientVolumeUuids = new Set(store.volumes.filter((volume) => volume.patientUuid === patientUuid).map((volume) => volume.uuid));
    selectedClinicInstanceUuid = clinicInstanceUuid;
    selectedPatientUuid = patientUuid;
    selectedVolumeUuids = store.cntPickList
      .filter((entry) => entry.clinicInstanceUuid === clinicInstanceUuid && patientVolumeUuids.has(entry.volumeUuid))
      .map((entry) => entry.volumeUuid);
    navigate('selector');
  }

  function savePickListSelection() {
    if (!selectedClinicInstanceUuid || !selectedPatientUuid) {
      back();
      return;
    }
    const selected = new Set(selectedVolumeUuids);
    const patientVolumeUuids = new Set(store.volumes
      .filter((volume) => volume.patientUuid === selectedPatientUuid)
      .map((volume) => volume.uuid));
    const retained = store.cntPickList.filter((entry) =>
      entry.clinicInstanceUuid !== selectedClinicInstanceUuid || !patientVolumeUuids.has(entry.volumeUuid));
    const previousReceived = new Map(store.cntPickList.map((entry) => [`${entry.clinicInstanceUuid}:${entry.volumeUuid}`, entry.received]));
    store = {
      ...store,
      cntPickList: [
        ...retained,
        ...Array.from(selected).map((volumeUuid) => ({
          clinicInstanceUuid: selectedClinicInstanceUuid,
          volumeUuid,
          received: previousReceived.get(`${selectedClinicInstanceUuid}:${volumeUuid}`) || false,
        })),
      ],
    };
    saveCntStore(store);
    back();
  }

  function openPickListReceive(clinicInstanceUuid: string, patientUuid: string) {
    const patientVolumeUuids = new Set(store.volumes.filter((volume) => volume.patientUuid === patientUuid).map((volume) => volume.uuid));
    const selection = store.cntPickList.filter((entry) =>
      entry.clinicInstanceUuid === clinicInstanceUuid && patientVolumeUuids.has(entry.volumeUuid));
    selectedClinicInstanceUuid = clinicInstanceUuid;
    selectedPatientUuid = patientUuid;
    receivePickListVolumeUuids = selection.filter((entry) => entry.received).map((entry) => entry.volumeUuid);
    pickListReceivePopupOpen = true;
  }

  function toggleReceivePickListVolume(volumeUuid: string) {
    receivePickListVolumeUuids = receivePickListVolumeUuids.includes(volumeUuid)
      ? receivePickListVolumeUuids.filter((item) => item !== volumeUuid)
      : [...receivePickListVolumeUuids, volumeUuid];
  }

  function receivePickListVolumes() {
    if (!userUuid || !selectedClinicInstanceUuid || !selectedPatientUuid) return;
    const checked = new Set(receivePickListVolumeUuids);
    const rowVolumeUuids = new Set(store.volumes
      .filter((volume) => volume.patientUuid === selectedPatientUuid)
      .filter((volume) => store.cntPickList.some((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid && entry.volumeUuid === volume.uuid))
      .map((volume) => volume.uuid));
    const previouslyReceived = new Set(store.cntPickList
      .filter((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid && rowVolumeUuids.has(entry.volumeUuid) && entry.received)
      .map((entry) => entry.volumeUuid));
    const receiveLocationUuid = clinicHoldingLocationUuid(selectedClinicInstanceUuid);
    const now = new Date().toISOString();
    store = {
      ...store,
      cntPickList: store.cntPickList.map((entry) =>
        entry.clinicInstanceUuid === selectedClinicInstanceUuid && rowVolumeUuids.has(entry.volumeUuid)
          ? { ...entry, received: checked.has(entry.volumeUuid) }
          : entry),
      volumes: store.volumes.map((volume) => {
        if (!rowVolumeUuids.has(volume.uuid)) return volume;
        const isChecked = checked.has(volume.uuid);
        const wasReceived = previouslyReceived.has(volume.uuid);
        if (isChecked && !wasReceived) {
          const toLocationUuid = receiveLocationUuid || volume.currentLocationUuid;
          return {
            ...volume,
            currentLocationUuid: toLocationUuid,
            events: [
              ...volume.events,
              {
                uuid: uuid(`${volume.uuid}-picklist-received-${now}`),
                kind: 'received',
                datetime: now,
                fromLocationUuid: volume.currentLocationUuid,
                toLocationUuid,
                userUuid,
                note: 'Received from Picklist',
              },
            ],
          };
        }
        if (!isChecked && wasReceived) return undoPickListReceived(volume);
        return volume;
      }),
    };
    saveCntStore(store);
    pickListReceivePopupOpen = false;
  }

  function saveRequest() {
    if (!requestPatientUuid) {
      modalMessage = 'Select a patient first.';
      return;
    }
    if (!requestVolumeUuids.length) {
      modalMessage = 'Select at least one case-note volume.';
      return;
    }
    if (!requestRequiredFor.trim()) {
      modalMessage = 'Enter what the case notes are required for.';
      return;
    }
    if (!requestFromLocationUuid || !requestToLocationUuid) {
      modalMessage = 'Select both From and To locations.';
      return;
    }
    const todayIso = new Date().toISOString().slice(0, 10);
    const existing = new Set(store.requests.map((request) => request.uuid));
    const newRequests: CntRequest[] = requestVolumeUuids
      .filter((volumeUuid) => store.volumes.some((volume) => volume.uuid === volumeUuid))
      .map((volumeUuid, index) => {
        let id = uuid(`request-${Date.now()}-${volumeUuid}-${index}`);
        while (existing.has(id)) id = uuid(`${id}-${index}`);
        existing.add(id);
        return {
          uuid: id,
          volumeUuid,
          patientUuid: requestPatientUuid,
          requestedByUserUuid: userUuid,
          requiredBy: todayIso,
          requiredFor: requestRequiredFor.trim(),
          fromLocationUuid: requestFromLocationUuid,
          toLocationUuid: requestToLocationUuid,
          status: 'open',
        };
      });
    store = { ...store, requests: [...store.requests, ...newRequests] };
    saveCntStore(store);
    requestPatientUuid = '';
    requestVolumeUuids = [];
    requestRequiredFor = '';
    requestFromLocationUuid = '';
    requestToLocationUuid = '';
    view = 'requests';
    stack = stack.filter((entry) => entry !== 'request');
  }

  function openHistory(volumeUuid: string) {
    selectedVolumeUuid = volumeUuid;
    if (!selectedVolumeUuids.includes(volumeUuid)) selectedVolumeUuids = [volumeUuid];
    navigate('history');
  }

  function openManageVolume(volumeUuid: string) {
    const volume = store.volumes.find((item) => item.uuid === volumeUuid);
    if (!volume) return;
    selectedVolumeUuid = volumeUuid;
    managedVolumeUuid = volumeUuid;
    managedVolumeDraft = fbcntVolumeValueFromVolume(volume);
    navigate('manageVolume');
  }

  function openMovementPopup(mode: 'send' | 'receive') {
    if (!selectedVolumeUuids.length) return;
    const selectedRecords = selectedVolumes(selectedVolumeUuids);
    if (mode === 'send') {
      sendSourceUuid = selectedRecords[0]?.currentLocationUuid || '';
      sendDestinationUuid = store.preferences[userUuid]?.sendLocationUuid
        || store.locations.find((location) => location.uuid !== sendSourceUuid && location.acceptsRequests)?.uuid
        || store.locations.find((location) => location.uuid !== sendSourceUuid)?.uuid
        || sendSourceUuid;
    } else {
      receiveSourceUuid = inferRecentSendDestination(selectedRecords);
      receiveDestinationUuid = store.locations.find((location) => location.facility === user?.facility)?.uuid
        || selectedRecords[0]?.currentLocationUuid
        || store.locations[0]?.uuid
        || '';
    }
    movementPopup = mode;
  }

  function inferRecentSendDestination(volumes: CntVolume[]) {
    for (const volume of volumes) {
      const latestSend = [...(volume.events || [])].reverse().find((event) => event.kind === 'sent');
      if (!latestSend) continue;
      const latestSendAgeMs = Date.now() - new Date(latestSend.datetime).getTime();
      if (latestSendAgeMs <= 8 * 60 * 60 * 1000 && latestSend.toLocationUuid) return latestSend.toLocationUuid;
    }
    return '';
  }

  function sendSelectedVolumes() {
    if (!user || !selectedVolumeUuids.length || !sendSourceUuid || !sendDestinationUuid) {
      modalMessage = 'Select volumes, source and destination before sending.';
      return;
    }
    const checked = new Set(selectedVolumeUuids);
    const now = new Date().toISOString();
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...(store.preferences[user.uuid] || {}),
          sendLocationUuid: sendSourceUuid,
        },
      },
      volumes: store.volumes.map((volume) => checked.has(volume.uuid) ? {
        ...volume,
        currentLocationUuid: sendDestinationUuid,
        events: [
          ...volume.events,
          {
            uuid: uuid(`${volume.uuid}-sent-${now}`),
            kind: 'sent',
            datetime: now,
            fromLocationUuid: sendSourceUuid,
            toLocationUuid: sendDestinationUuid,
            userUuid: user.uuid,
            note: 'Sent by Case note tracker',
          },
        ],
      } : volume),
    };
    saveCntStore(store);
    movementPopup = '';
  }

  function receiveSelectedVolumes() {
    if (!user || !selectedVolumeUuids.length || !receiveDestinationUuid) {
      modalMessage = 'Select volumes and receiving location before receiving.';
      return;
    }
    const checked = new Set(selectedVolumeUuids);
    const now = new Date().toISOString();
    store = {
      ...store,
      volumes: store.volumes.map((volume) => {
        if (!checked.has(volume.uuid)) return volume;
        const latestSend = [...(volume.events || [])].reverse().find((event) => event.kind === 'sent');
        const latestSendAgeMs = latestSend ? Date.now() - new Date(latestSend.datetime).getTime() : Number.POSITIVE_INFINITY;
        const inferredSource = latestSend && latestSendAgeMs <= 8 * 60 * 60 * 1000 ? latestSend.toLocationUuid : receiveSourceUuid;
        return {
          ...volume,
          currentLocationUuid: receiveDestinationUuid,
          events: [
            ...volume.events,
            {
              uuid: uuid(`${volume.uuid}-received-${now}`),
              kind: 'received',
              datetime: now,
              fromLocationUuid: inferredSource || undefined,
              toLocationUuid: receiveDestinationUuid,
              userUuid: user.uuid,
              note: 'Received by Case note tracker',
            },
          ],
        };
      }),
    };
    saveCntStore(store);
    movementPopup = '';
  }

  function addSelectedVolumesToBatch(batchUuid: string) {
    if (!selectedVolumeUuids.length) {
      batchSelectedPopupOpen = false;
      return;
    }
    const selectedSet = new Set(selectedVolumeUuids);
    store = {
      ...store,
      batches: store.batches.map((batch) => batch.uuid === batchUuid
        ? { ...batch, volumeUuids: Array.from(new Set([...batch.volumeUuids, ...selectedVolumeUuids])) }
        : batch),
      volumes: store.volumes.map((volume) => selectedSet.has(volume.uuid) ? { ...volume, batchUuid } : volume),
    };
    saveCntStore(store);
    batchSelectedPopupOpen = false;
  }

  function openTagSelectedPopup() {
    if (!selectedVolumeUuids.length) return;
    tagPurpose = 'Retrieve request';
    tagLocationUuid = selectedVolumes(selectedVolumeUuids)[0]?.currentLocationUuid || store.locations[0]?.uuid || '';
    tagSelectedPopupOpen = true;
  }

  function createTagForSelected() {
    if (!user || !selectedVolumeUuids.length || !tagLocationUuid) {
      modalMessage = 'Select volumes and a location before tagging.';
      return;
    }
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 28);
    store = {
      ...store,
      tags: [
        ...store.tags,
        ...selectedVolumes(selectedVolumeUuids).map((volume) => ({
          uuid: uuid(`tag-${Date.now()}-${volume.uuid}`),
          volumeUuid: volume.uuid,
          patientUuid: volume.patientUuid,
          purpose: tagPurpose.trim() || 'Retrieve request',
          locationUuid: tagLocationUuid,
          requiredBy: due.toISOString(),
          expiresAt: expiry.toISOString(),
          createdByUserUuid: user.uuid,
          forgetWhenReceivedByMe: true,
          status: 'active' as const,
        })),
      ],
    };
    saveCntStore(store);
    tagSelectedPopupOpen = false;
  }

  function saveManagedVolume() {
    if (!managedVolumeDraft) return;
    const volume = store.volumes.find((item) => item.uuid === managedVolumeUuid);
    if (!volume) return;
    const validationMessage = validateFbcntManageVolumeValue(managedVolumeDraft);
    if (validationMessage) {
      modalMessage = validationMessage;
      return;
    }
    const patch = fbcntVolumePatchFromValue(managedVolumeDraft, volume);
    const historyPatch = fbcntVolumeHistoryPatchForStatusReversal(volume, patch, userUuid, store);
    store = {
      ...store,
      volumes: store.volumes.map((item) => item.uuid === managedVolumeUuid ? { ...item, ...patch, ...historyPatch } : item),
    };
    saveCntStore(store);
    back();
  }

  function openRegisterVolume() {
    if (!user || !selectedPatientUuid) return;
    const recentChoices = store.preferences[user.uuid]?.recentChoices || {};
    const selectedRecords = store.volumes.filter((volume) => selectedVolumeUuids.includes(volume.uuid));
    const preferredLocationUuid = recentChoices.addVolumeInitialLocationUuid?.[0]
      || selectedRecords[0]?.currentLocationUuid
      || store.locations.find((location) => location.facility === user.facility)?.uuid
      || store.locations[0]?.uuid
      || '';
    const preferredLocation = store.locations.find((location) => location.uuid === preferredLocationUuid) || store.locations[0];
    const preferredHealthBoard = recentChoices.addVolumeHealthBoard?.[0] || preferredLocation?.healthBoard || '';
    const preferredLocality = recentChoices.addVolumeLocality?.[0] || preferredLocation?.locality || '';
    const preferredType = recentChoices.addVolumeType?.[0] || 'General';
    addVolumeCreatedDate = formatFormDate(new Date());
    addVolumeHealthBoard = preferredHealthBoard;
    addVolumeLocality = preferredLocality;
    addVolumeType = preferredType;
    addVolumeStatus = 'Permanent';
    addVolumeRecordStatus = 'active';
    addVolumeNumber = String(nextVolumeNumber(selectedPatientUuid, preferredHealthBoard, preferredLocality, preferredType));
    addVolumeDateClosed = '';
    addVolumeDateDestroyed = '';
    addVolumeReasonDestroyed = '';
    addVolumeLocationUuid = preferredLocationUuid;
    addVolumeBarcode = '';
    addVolumeRfid = '';
    addVolumeBatchUuid = '';
    navigate('registerVolume');
  }

  function saveRegisteredVolume() {
    if (!user || !selectedPatientUuid || !addVolumeLocationUuid) {
      modalMessage = 'Select a patient and location before registering a volume.';
      return;
    }
    const validationMessage = validateFbcntManageVolumeValue({
      healthBoard: addVolumeHealthBoard,
      locality: addVolumeLocality,
      volumeType: addVolumeType,
      permanentTemporary: addVolumeStatus,
      recordStatus: addVolumeRecordStatus,
      volumeNumber: addVolumeNumber,
      dateCreated: addVolumeCreatedDate,
      dateClosed: addVolumeDateClosed,
      dateDestroyed: addVolumeDateDestroyed,
      reasonDestroyed: addVolumeReasonDestroyed,
      mergedIntoVolumeUuid: '',
      locationUuid: addVolumeLocationUuid,
      barcode: addVolumeBarcode,
      rfid: addVolumeRfid,
      batchUuid: addVolumeBatchUuid,
    });
    if (validationMessage) {
      modalMessage = validationMessage;
      return;
    }
    const location = store.locations.find((item) => item.uuid === addVolumeLocationUuid) || store.locations[0];
    const patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
    if (!location || !patient) return;
    const healthBoard = addVolumeHealthBoard || location.healthBoard;
    const locality = addVolumeLocality || location.locality;
    const temporary = addVolumeStatus === 'Temporary';
    const requestedVolumeNumber = Number(addVolumeNumber);
    const volumeNumber = !temporary && Number.isFinite(requestedVolumeNumber) && requestedVolumeNumber > 0
      ? requestedVolumeNumber
      : nextVolumeNumber(selectedPatientUuid, healthBoard, locality, addVolumeType);
    const createdIsoDate = formDateToIsoDate(addVolumeCreatedDate);
    const operationStamp = new Date().toISOString();
    const newVolumeUuid = uuid(`volume-${selectedPatientUuid}-${operationStamp}-${addVolumeType}-${Math.random()}`);
    const defaultIdentifierStem = `${patient.hospitalNumber || patient.uuid.slice(0, 8)}-${String(volumeNumber).padStart(3, '0')}${temporary ? '-T' : '-P'}`;
    const newVolume: CntVolume = {
      uuid: newVolumeUuid,
      barcode: addVolumeBarcode.trim() || `VOL-${defaultIdentifierStem}`,
      rfid: addVolumeRfid.trim() || `RFID-${patient.uuid.slice(0, 8)}-${volumeNumber}${temporary ? '-T' : ''}`,
      patientUuid: selectedPatientUuid,
      patientNhsNumber: patient.nhsNumber,
      patientHospitalNumber: patient.hospitalNumber,
      healthBoard,
      locality,
      type: addVolumeType,
      volumeNumber,
      temporary,
      status: addVolumeRecordStatus,
      dateCreated: createdIsoDate || undefined,
      dateClosed: formDateToIsoDate(addVolumeDateClosed) || undefined,
      dateDestroyed: formDateToIsoDate(addVolumeDateDestroyed) || undefined,
      reasonDestroyed: addVolumeReasonDestroyed.trim() || undefined,
      currentLocationUuid: location.uuid,
      batchUuid: addVolumeBatchUuid.trim() || undefined,
      events: [{
        uuid: uuid(`${newVolumeUuid}-created-${operationStamp}`),
        kind: 'created',
        datetime: createdIsoDate ? `${createdIsoDate}T12:00:00.000Z` : operationStamp,
        toLocationUuid: location.uuid,
        userUuid: user.uuid,
        note: 'Added by Case note tracker',
      }],
    };
    const currentPreferences = store.preferences[user.uuid] || {};
    store = {
      ...store,
      volumes: [...store.volumes, newVolume],
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...currentPreferences,
          recentChoices: {
            ...(currentPreferences.recentChoices || {}),
            addVolumeHealthBoard: [healthBoard],
            addVolumeLocality: [locality],
            addVolumeType: [addVolumeType],
            addVolumeInitialLocationUuid: [location.uuid],
          },
        },
      },
    };
    saveCntStore(store);
    selectedVolumeUuid = addVolumeRecordStatus === 'destroyed' ? '' : newVolumeUuid;
    selectedVolumeUuids = addVolumeRecordStatus === 'destroyed' ? [] : [newVolumeUuid];
    view = 'locator';
  }

  function openBatch(batchUuid: string) {
    selectedBatchUuid = batchUuid;
    navigate('batch');
  }

  function removeBatchFavourite(batchUuid: string) {
    if (!userUuid) return;
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          batchUuids: favouriteBatchUuids.filter((uuidValue) => uuidValue !== batchUuid),
        },
      },
    };
    saveCntStore(store);
  }

  function openFindBatch() {
    findBatchSearch = '';
    navigate('findBatch');
  }

  function addBatchFavourite(batchUuid: string) {
    if (!userUuid) return;
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          batchUuids: Array.from(new Set([...favouriteBatchUuids, batchUuid])),
        },
      },
    };
    saveCntStore(store);
    selectedBatchUuid = batchUuid;
    view = 'batches';
  }

  function openCreateBatch() {
    createBatchPurpose = 'Clinic preparation';
    createBatchCurrentLocationUuid = store.locations[0]?.uuid || '';
    createBatchDestinationUuid = store.locations.find((location) => location.acceptsRequests)?.uuid || store.locations[0]?.uuid || '';
    createBatchBarcode = `BATCH-${String(store.batches.length + 2000).padStart(4, '0')}`;
    navigate('createBatch');
  }

  function createBatch() {
    if (!createBatchBarcode.trim()) {
      modalMessage = 'Enter a batch barcode.';
      return;
    }
    if (!createBatchCurrentLocationUuid || !createBatchDestinationUuid) {
      modalMessage = 'Select current and destination locations.';
      return;
    }
    const batchUuid = uuid(`batch-${Date.now()}-${createBatchBarcode}`);
    const batch = {
      uuid: batchUuid,
      barcode: createBatchBarcode.trim(),
      currentLocationUuid: createBatchCurrentLocationUuid,
      intendedPurpose: createBatchPurpose.trim() || 'Clinic preparation',
      intendedDestinationUuid: createBatchDestinationUuid,
      volumeUuids: [],
    };
    store = {
      ...store,
      batches: [...store.batches, batch],
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          batchUuids: Array.from(new Set([...favouriteBatchUuids, batchUuid])),
        },
      },
    };
    saveCntStore(store);
    selectedBatchUuid = batchUuid;
    view = 'batch';
  }

  function removeVolumeFromBatch(batchUuid: string, volumeUuid: string) {
    store = {
      ...store,
      batches: store.batches.map((batch) => batch.uuid === batchUuid
        ? { ...batch, volumeUuids: batch.volumeUuids.filter((uuidValue) => uuidValue !== volumeUuid) }
        : batch),
      volumes: store.volumes.map((volume) => volume.uuid === volumeUuid ? { ...volume, batchUuid: undefined } : volume),
    };
    saveCntStore(store);
  }

  function openClinicDates(clinicUuid: string) {
    selectedClinicUuid = clinicUuid;
    navigate('clinicDates');
  }

  function openClinicList(instanceUuid: string) {
    selectedClinicInstanceUuid = instanceUuid;
    navigate('clinicList');
  }

  function cancelRequest(row: RequestRow) {
    const requestUuids = new Set(row.requestUuids);
    store = { ...store, requests: store.requests.map((request) => requestMatchesRow(request, row, requestUuids) ? { ...request, status: 'cancelled' } : request) };
    saveCntStore(store);
  }

  function doneRequest(row: RequestRow) {
    const requestUuids = new Set(row.requestUuids);
    hiddenDoneRequestKeys = Array.from(new Set([...hiddenDoneRequestKeys, row.key]));
    store = { ...store, requests: store.requests.map((request) => requestMatchesRow(request, row, requestUuids) ? { ...request, status: 'actioned' } : request) };
    saveCntStore(store);
  }

  function requestMatchesRow(request: CntRequest, row: RequestRow, requestUuids = new Set<string>()) {
    return requestUuids.has(request.uuid)
      || (
        row.volumeUuids.includes(request.volumeUuid)
        && request.patientUuid === row.patientUuid
        && request.requiredFor === row.requiredFor
        && request.requiredBy === row.requiredBy
        && request.fromLocationUuid === row.fromLocationUuid
        && request.toLocationUuid === row.toLocationUuid
        && request.status === row.status
      );
  }

  function removeLibrary(locationUuid: string) {
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          libraryUuids: favouriteLibraryUuids.filter((uuid) => uuid !== locationUuid),
        },
      },
    };
    saveCntStore(store);
  }

  function openAddLibrary() {
    addLibraryLocationUuid = store.locations.find((location) => !favouriteLibraryUuids.includes(location.uuid))?.uuid || store.locations[0]?.uuid || '';
    showAddLibraryPicker = true;
  }

  function addLibrary() {
    if (!userUuid || !addLibraryLocationUuid) return;
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          libraryUuids: Array.from(new Set([...favouriteLibraryUuids, addLibraryLocationUuid])),
        },
      },
    };
    showAddLibraryPicker = false;
    saveCntStore(store);
  }

  function openClinicPicker() {
    selectedClinicInstanceUuids = [];
    navigate('selectClinics');
  }

  function addSelectedClinics() {
    if (!userUuid) return;
    const selected = new Set(selectedClinicInstanceUuids);
    store = {
      ...store,
      clinicInstances: store.clinicInstances.map((instance) => selected.has(instance.uuid)
        ? { ...instance, retrieverUserUuids: Array.from(new Set([...instance.retrieverUserUuids, userUuid])) }
        : instance),
    };
    selectedClinicInstanceUuids = [];
    saveCntStore(store);
    back();
  }

  function toggleClinicPickerSelection(instanceUuid: string, checked: boolean) {
    selectedClinicInstanceUuids = checked
      ? Array.from(new Set([...selectedClinicInstanceUuids, instanceUuid]))
      : selectedClinicInstanceUuids.filter((uuidValue) => uuidValue !== instanceUuid);
  }

  function stopRetrievingClinic() {
    if (!userUuid || !confirmStopClinicInstanceUuid) return;
    store = {
      ...store,
      clinicInstances: store.clinicInstances.map((instance) => instance.uuid === confirmStopClinicInstanceUuid
        ? { ...instance, retrieverUserUuids: instance.retrieverUserUuids.filter((uuidValue) => uuidValue !== userUuid) }
        : instance),
    };
    confirmStopClinicInstanceUuid = '';
    saveCntStore(store);
  }

  function userHeader(item?: CntUser) {
    return item ? `${item.surname.toUpperCase()}, ${item.firstNames}, ${item.title} (NADEX:${item.nadexId}), ${item.role}, ${item.facility}` : '';
  }

  function toCntPatient(patient: Patient): CntPatient {
    return {
      uuid: patient.uuid,
      nhsNumber: patient.nhs_number || '',
      hospitalNumber: patient.hospital_number || patient.uuid.slice(0, 8),
      name: `${patient.forenames || ''} ${patient.surname || ''}`.trim(),
      title: patient.title || '',
      surname: patient.surname || '',
      forenames: patient.forenames || '',
      addressLine1: patient.address_line1 || patient.addressLine1 || patient.address_line_1 || '',
      addressLine2: patient.address_line2 || patient.addressLine2 || patient.address_line_2 || '',
      addressLine3: patient.address_line3 || patient.addressLine3 || patient.address_line_3 || '',
      addressLine4: patient.address_line4 || patient.addressLine4 || patient.address_line_4 || '',
      dateOfBirth: patient.date_of_birth || '',
      sex: patient.sex || '',
    };
  }

  function patientProps(patient: CntPatient) {
    return {
      nhsNumber: patient.nhsNumber,
      surname: patient.surname,
      forenames: patient.forenames,
      title: patient.title,
      addressLine1: patient.addressLine1,
      addressLine2: patient.addressLine2,
      addressLine3: patient.addressLine3,
      addressLine4: patient.addressLine4,
      hospitalNumber: patient.hospitalNumber,
      dateOfBirth: patient.dateOfBirth,
      sex: patient.sex,
    };
  }

  function volumeSort(a: CntVolume, b: CntVolume) {
    return a.healthBoard.localeCompare(b.healthBoard)
      || a.locality.localeCompare(b.locality)
      || a.type.localeCompare(b.type)
      || Number(a.temporary) - Number(b.temporary)
      || a.volumeNumber - b.volumeNumber;
  }

  function nextVolumeNumber(patientUuid: string, healthBoard: string, locality: string, type: string) {
    return store.volumes
      .filter((volume) =>
        volume.patientUuid === patientUuid
        && volume.healthBoard === healthBoard
        && volume.locality === locality
        && volume.type === type
      )
      .reduce((max, volume) => Math.max(max, volume.volumeNumber), 0) + 1;
  }

  function openScannedIdentifier() {
    const result = resolveIdentifier(store, scanIdentifier);
    if (result.kind === 'empty') {
      modalMessage = 'Enter or scan an identifier first.';
    } else if (result.kind === 'patient') {
      openPatient(result.patient.uuid);
    } else if (result.kind === 'volume') {
      selectedVolumeUuid = result.volume.uuid;
      selectedVolumeUuids = [result.volume.uuid];
      openPatient(result.volume.patientUuid);
    } else if (result.kind === 'batch') {
      openBatch(result.batch.uuid);
    } else if (result.kind === 'location') {
      locationFilterHealthBoard = result.location.healthBoard;
      locationFilterLocality = result.location.locality;
      locationFilterFacility = result.location.facility;
      navigate('locations');
    } else {
      modalMessage = 'No matching patient, volume, batch, or location was found.';
    }
  }

  function setActiveTreeVisual(key = '') {
    activeTreeVisualKey = key;
  }

  function isActiveTreeVisual(key: string) {
    return activeTreeVisualKey === key;
  }

  function treeHeadingStyle(key: string, level = 0) {
    return [
      'display: flex',
      'align-items: center',
      'gap: 0.35rem',
      'width: 100%',
      'border: 0',
      'border-radius: 0.2rem',
      `background: ${isActiveTreeVisual(key) ? (level === 1 ? '#fee715' : '#ffffcc') : 'transparent'}`,
      'color: #111',
      'font: inherit',
      'text-align: left',
      'cursor: pointer',
      'outline: none',
      `padding-left: ${level * 1.15}rem`
    ].join('; ');
  }

  function treeLeafStyle(key: string, marginLeft = '1rem') {
    return [
      'border-radius: 0.2rem',
      'padding: 0.08rem 0.2rem',
      'margin-top: 0.08rem',
      `margin-left: ${marginLeft}`,
      `background: ${isActiveTreeVisual(key) ? '#fee715' : 'transparent'}`
    ].join('; ');
  }

  function volumeRowStyle(key: string, selected = false, disabled = false) {
    return [
      'display: grid',
      'grid-template-columns: minmax(10rem, 1fr) max-content minmax(16rem, 2fr) 4.8rem',
      'gap: 0.6rem',
      'align-items: center',
      'border-radius: 0.2rem',
      'padding: 0.08rem 0.2rem',
      'margin-top: 0.08rem',
      'padding-left: 4.8rem',
      `background: ${selected || isActiveTreeVisual(key) ? '#fee715' : 'transparent'}`,
      disabled ? 'color: #555' : ''
    ].filter(Boolean).join('; ');
  }

  function selectAllButtonStyle(key: string) {
    return [
      'border: 0.1rem solid #1b6ec2',
      'border-radius: 0.4rem',
      `background: ${isActiveTreeVisual(key) ? '#fee715' : 'white'}`,
      `color: ${isActiveTreeVisual(key) ? 'black' : '#1b6ec2'}`,
      'padding: 0.075rem 0.2rem',
      "font-family: 'Roboto', sans-serif",
      'font-size: 0.6rem',
      'font-weight: 500',
      'line-height: 1.2',
      'cursor: pointer',
      'white-space: nowrap',
      isActiveTreeVisual(key) ? 'outline: 0.1rem solid #111' : 'outline: none',
      isActiveTreeVisual(key) ? 'outline-offset: 0.05rem' : ''
    ].filter(Boolean).join('; ');
  }

  function volumeLabel(volume: CntVolume) {
    return volume.temporary ? `Temporary volume ${volume.volumeNumber}` : `Volume ${volume.volumeNumber}`;
  }

  function volumeStatus(volume: CntVolume) {
    if (volumeIsDestroyed(volume)) return 'Destroyed';
    if (volumeIsClosed(volume)) return 'Closed';
    return 'Active';
  }

  function volumeStatusClass(volume: CntVolume) {
    return volumeIsDestroyed(volume) || volumeIsClosed(volume) ? 'red' : 'green';
  }

  function volumeIsDestroyed(volume: CntVolume) {
    return volume.status === 'destroyed';
  }

  function volumeIsClosed(volume: CntVolume) {
    return volume.status === 'closed';
  }

  function volumeTree(volumes: CntVolume[]) {
    const tree: Record<string, Record<string, Record<string, CntVolume[]>>> = {};
    for (const volume of [...volumes].sort(volumeSort)) {
      tree[volume.healthBoard] ??= {};
      tree[volume.healthBoard][volume.locality] ??= {};
      tree[volume.healthBoard][volume.locality][volume.type] ??= [];
      tree[volume.healthBoard][volume.locality][volume.type].push(volume);
    }
    return tree;
  }

  function toggleSelectedVolume(volumeUuid: string) {
    const selected = selectedVolumeUuids.includes(volumeUuid);
    selectedVolumeUuids = selected
      ? selectedVolumeUuids.filter((item) => item !== volumeUuid)
      : [...selectedVolumeUuids, volumeUuid];
    selectedVolumeUuid = selected ? selectedVolumeUuids.at(-1) || '' : volumeUuid;
  }

  function toggleSelectedVolumes(volumes: CntVolume[]) {
    const selectable = volumes.filter((volume) => !volumeIsDestroyed(volume)).map((volume) => volume.uuid);
    const allSelected = selectable.length > 0 && selectable.every((uuid) => selectedVolumeUuids.includes(uuid));
    selectedVolumeUuids = allSelected
      ? selectedVolumeUuids.filter((uuid) => !selectable.includes(uuid))
      : Array.from(new Set([...selectedVolumeUuids, ...selectable]));
    selectedVolumeUuid = selectedVolumeUuids.at(-1) || '';
  }

  function hasSelectedVolume(volumes: CntVolume[]) {
    return volumes.some((volume) => selectedVolumeUuids.includes(volume.uuid));
  }

  function volumeGroups(volumes: CntVolume[]) {
    const groups: Array<{ healthBoard: string; locality: string; type: string; volumes: CntVolume[] }> = [];
    for (const volume of [...volumes].sort(volumeSort)) {
      const latest = groups.at(-1);
      if (latest && latest.healthBoard === volume.healthBoard && latest.locality === volume.locality && latest.type === volume.type) {
        latest.volumes.push(volume);
      } else {
        groups.push({ healthBoard: volume.healthBoard, locality: volume.locality, type: volume.type, volumes: [volume] });
      }
    }
    return groups;
  }

  function selectedVolumeLocationGroups(volumes: CntVolume[]) {
    const groups: Array<{ healthBoard: string; locality: string; type: string; locationUuid: string; volumes: CntVolume[] }> = [];
    for (const volume of [...volumes].sort(volumeSort)) {
      const latest = groups.at(-1);
      if (
        latest
        && latest.healthBoard === volume.healthBoard
        && latest.locality === volume.locality
        && latest.type === volume.type
        && latest.locationUuid === volume.currentLocationUuid
      ) {
        latest.volumes.push(volume);
      } else {
        groups.push({
          healthBoard: volume.healthBoard,
          locality: volume.locality,
          type: volume.type,
          locationUuid: volume.currentLocationUuid,
          volumes: [volume],
        });
      }
    }
    return groups;
  }

  function volumeRangeLabel(volumes: CntVolume[]) {
    return [...volumes].sort(volumeSort).map(volumeLabel).join(', ');
  }

  function hasOpenRequestAtLocation(volumeUuid: string, locationUuid: string) {
    return store.requests.some((request) =>
      request.volumeUuid === volumeUuid
      && request.toLocationUuid === locationUuid
      && request.status === 'open');
  }

  function locationLines(locationUuid = '') {
    const location = store.locations.find((item) => item.uuid === locationUuid);
    return location ? [location.extra, location.department, location.facility, location.healthBoard].filter(Boolean) : [];
  }

  function formatDate(value = '') {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
  }

  function formatTime(value = '') {
    if (!value) return '';
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [hours, minutes] = value.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function formatDateTime(value = '') {
    return `${formatDate(value)} ${formatTime(value)}`.trim();
  }

  function healthBoards() {
    return Array.from(new Set(store.locations.map((location) => location.healthBoard))).sort();
  }

  function localities(healthBoard = preferenceHealthBoard) {
    return Array.from(new Set(store.locations.filter((location) => !healthBoard || location.healthBoard === healthBoard).map((location) => location.locality))).sort();
  }

  function facilities(healthBoard = preferenceHealthBoard, locality = preferenceLocality) {
    return Array.from(new Set(store.locations.filter((location) =>
      (!healthBoard || location.healthBoard === healthBoard)
      && (!locality || location.locality === locality)
    ).map((location) => location.facility))).sort();
  }

  function custodianUuidsForLocation(locationUuid: string) {
    const location = store.locations.find((item) => item.uuid === locationUuid);
    if (!location) return [];
    const parentMatches = store.locations.filter((item) =>
      item.healthBoard === location.healthBoard
      && item.locality === location.locality
      && item.facility === location.facility
      && item.department === location.department
    );
    return Array.from(new Set(parentMatches.flatMap((item) => item.custodianUserUuids)));
  }

  type RequestRow = {
    key: string;
    requestUuids: string[];
    patientUuid: string;
    volumeUuids: string[];
    requiredFor: string;
    requiredBy: string;
    fromLocationUuid: string;
    toLocationUuid: string;
    status: string;
  };

  function groupedRequestRows(requests: CntRequest[]) {
    const rows = new Map<string, RequestRow>();
    for (const request of requests) {
      const key = [request.patientUuid, request.requiredFor, request.requiredBy, request.fromLocationUuid, request.toLocationUuid, request.status].join('|');
      const row = rows.get(key) || {
        key,
        requestUuids: [],
        patientUuid: request.patientUuid,
        volumeUuids: [],
        requiredFor: request.requiredFor,
        requiredBy: request.requiredBy,
        fromLocationUuid: request.fromLocationUuid,
        toLocationUuid: request.toLocationUuid,
        status: request.status,
      };
      row.requestUuids.push(request.uuid);
      row.volumeUuids.push(request.volumeUuid);
      rows.set(key, row);
    }
    return Array.from(rows.values());
  }

  function outboxRowsForUser() {
    return groupedRequestRows(store.requests.filter((request) => request.requestedByUserUuid === userUuid && request.status !== 'cancelled'));
  }

  function inboxRowsForUser() {
    return groupedRequestRows(store.requests.filter((request) => request.status === 'open' && custodianUuidsForLocation(request.toLocationUuid).includes(userUuid)))
      .filter((row) => !hiddenDoneRequestKeys.includes(row.key));
  }

  function selectedVolumes(volumeUuids: string[]) {
    return store.volumes.filter((volume) => volumeUuids.includes(volume.uuid)).sort(volumeSort);
  }

  function batchPatientGroups(volumeUuids: string[]) {
    const groups = new Map<string, { patient: CntPatient | undefined; volumes: CntVolume[] }>();
    for (const volume of selectedVolumes(volumeUuids)) {
      const group = groups.get(volume.patientUuid) || {
        patient: store.patients.find((patient) => patient.uuid === volume.patientUuid),
        volumes: [],
      };
      group.volumes.push(volume);
      groups.set(volume.patientUuid, group);
    }
    return Array.from(groups.values());
  }

  function findBatchRows() {
    const query = findBatchSearch.trim().toLowerCase();
    return store.batches
      .filter((batch) => !favouriteBatchUuids.includes(batch.uuid))
      .filter((batch) => !query || `${batch.barcode} ${batch.intendedPurpose}`.toLowerCase().includes(query));
  }

  function picklistAppointments() {
    const rows: Array<{ instance: CntClinicInstance; appointment: CntAppointment; entries: CntPickListEntry[] }> = [];
    for (const instance of store.clinicInstances.filter((item) => item.retrieverUserUuids.includes(userUuid))) {
      for (const appointment of instance.appointments) {
        if (!showRescheduledAppointments && appointment.status === 'rescheduled') continue;
        if (!showCancelledAppointments && appointment.status === 'cancelled') continue;
        const patientVolumeUuids = new Set(store.volumes.filter((volume) => volume.patientUuid === appointment.patientUuid).map((volume) => volume.uuid));
        const entries = store.cntPickList.filter((entry) =>
          entry.clinicInstanceUuid === instance.uuid
          && patientVolumeUuids.has(entry.volumeUuid)
        );
        const clinic = clinicForInstance(instance);
        if (!includeRetrievedPicklistPatients && clinic) {
          const selectedVolumesForRow = store.volumes.filter((volume) => patientVolumeUuids.has(volume.uuid) && entries.some((entry) => entry.volumeUuid === volume.uuid));
          if (selectedVolumesForRow.length && selectedVolumesForRow.every((volume) => volume.currentLocationUuid === clinic.holdingLocationUuid)) continue;
        }
        rows.push({ instance, appointment, entries });
      }
    }
    return rows.sort((a, b) => `${a.instance.date} ${a.appointment.time}`.localeCompare(`${b.instance.date} ${b.appointment.time}`));
  }

  function returnListRows() {
    const rows = new Map<string, { patientUuid: string; locationUuid: string; volumeUuids: string[] }>();
    for (const entry of store.cntPickList.filter((item) => item.received)) {
      const volume = store.volumes.find((item) => item.uuid === entry.volumeUuid);
      if (!volume) continue;
      if (removedReturnPatientUuids.includes(volume.patientUuid)) continue;
      const key = `${volume.patientUuid}|${volume.currentLocationUuid}`;
      const row = rows.get(key) || { patientUuid: volume.patientUuid, locationUuid: volume.currentLocationUuid, volumeUuids: [] };
      row.volumeUuids.push(volume.uuid);
      rows.set(key, row);
    }
    return Array.from(rows.values());
  }

  function openReturnListSend(row: { patientUuid: string; locationUuid: string; volumeUuids: string[] }) {
    returnListSendPopup = row;
    returnListSendVolumeUuids = row.volumeUuids;
    sendDestinationUuid = store.preferences[userUuid]?.sendLocationUuid
      || store.locations.find((location) => location.uuid !== row.locationUuid && location.acceptsRequests)?.uuid
      || store.locations.find((location) => location.uuid !== row.locationUuid)?.uuid
      || row.locationUuid;
  }

  function openRequestSend(row: RequestRow) {
    requestSendPopup = row;
    returnListSendVolumeUuids = row.volumeUuids;
    sendSourceUuid = row.fromLocationUuid;
    sendDestinationUuid = row.toLocationUuid;
  }

  function toggleReturnListSendVolume(volumeUuid: string) {
    returnListSendVolumeUuids = returnListSendVolumeUuids.includes(volumeUuid)
      ? returnListSendVolumeUuids.filter((item) => item !== volumeUuid)
      : [...returnListSendVolumeUuids, volumeUuid];
  }

  function sendReturnListVolumes() {
    if (!returnListSendPopup) return;
    if (!returnListSendVolumeUuids.length) {
      modalMessage = 'Select at least one case-note volume.';
      return;
    }
    if (!sendDestinationUuid) {
      modalMessage = 'Select a destination.';
      return;
    }
    const checked = new Set(returnListSendVolumeUuids);
    const now = new Date().toISOString();
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          sendLocationUuid: sendDestinationUuid,
        },
      },
      volumes: store.volumes.map((volume) => {
        if (!checked.has(volume.uuid)) return volume;
        return {
          ...volume,
          currentLocationUuid: sendDestinationUuid,
          events: [
            ...volume.events,
            {
              uuid: uuid(`${volume.uuid}-return-send-${now}`),
              kind: 'sent',
              datetime: now,
              fromLocationUuid: volume.currentLocationUuid,
              toLocationUuid: sendDestinationUuid,
              userUuid,
              note: 'Sent from Return list',
            },
          ],
        };
      }),
    };
    saveCntStore(store);
    returnListSendPopup = null;
    returnListSendVolumeUuids = [];
  }

  function sendRequestVolumes() {
    if (!requestSendPopup) return;
    if (!returnListSendVolumeUuids.length) {
      modalMessage = 'Select at least one case-note volume.';
      return;
    }
    if (!sendSourceUuid || !sendDestinationUuid) {
      modalMessage = 'Select source and destination.';
      return;
    }
    const checked = new Set(returnListSendVolumeUuids);
    const now = new Date().toISOString();
    store = {
      ...store,
      preferences: {
        ...store.preferences,
        [userUuid]: {
          ...(store.preferences[userUuid] || {}),
          sendLocationUuid: sendSourceUuid,
        },
      },
      volumes: store.volumes.map((volume) => {
        if (!checked.has(volume.uuid)) return volume;
        return {
          ...volume,
          currentLocationUuid: sendDestinationUuid,
          events: [
            ...volume.events,
            {
              uuid: uuid(`${volume.uuid}-request-send-${now}`),
              kind: 'sent',
              datetime: now,
              fromLocationUuid: sendSourceUuid,
              toLocationUuid: sendDestinationUuid,
              userUuid,
              note: 'Sent by Case note tracker',
            },
          ],
        };
      }),
    };
    saveCntStore(store);
    requestSendPopup = null;
    returnListSendVolumeUuids = [];
  }

  function removeReturnListRow(patientUuid: string, volumeUuids: string[]) {
    const removedVolumeUuids = new Set(volumeUuids);
    store = {
      ...store,
      cntPickList: store.cntPickList.filter((entry) => !removedVolumeUuids.has(entry.volumeUuid)),
    };
    saveCntStore(store);
    removedReturnPatientUuids = Array.from(new Set([...removedReturnPatientUuids, patientUuid]));
    returnListRevision += 1;
  }

  function clinicForInstance(instance?: CntClinicInstance) {
    return instance ? store.clinics.find((clinic) => clinic.uuid === instance.clinicUuid) : undefined;
  }

  function clinicHoldingLocationUuid(clinicInstanceUuid: string) {
    const instance = store.clinicInstances.find((item) => item.uuid === clinicInstanceUuid);
    const clinic = store.clinics.find((item) => item.uuid === instance?.clinicUuid);
    return clinic?.holdingLocationUuid || '';
  }

  function undoPickListReceived(volume: CntVolume): CntVolume {
    let eventIndex = -1;
    for (let index = volume.events.length - 1; index >= 0; index -= 1) {
      const event = volume.events[index];
      if (event.kind === 'received' && event.note === 'Received from Picklist') {
        eventIndex = index;
        break;
      }
    }
    if (eventIndex < 0) return volume;
    const removedEvent = volume.events[eventIndex];
    const events = volume.events.filter((_, index) => index !== eventIndex);
    return {
      ...volume,
      currentLocationUuid: removedEvent.fromLocationUuid || events.at(-1)?.toLocationUuid || volume.currentLocationUuid,
      events,
    };
  }

  function appointmentStatusLabel(status: string) {
    if (status === 'active') return 'Active';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'rescheduled') return 'Rescheduled';
    return status;
  }

  function requestStatusLabel(status: string) {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function appointmentStatusClass(status: string) {
    if (status === 'active') return 'green';
    if (status === 'rescheduled') return 'orange';
    return 'red';
  }

  function pageTitle() {
    const titles: Record<View, string> = {
      login: 'Login',
      preferences: 'Preferences',
      home: 'Case note tracker',
      patientSearch: 'Patient search',
      locator: 'Case notes locator',
      history: 'Volume history',
      manageVolume: 'Manage volume',
      registerVolume: 'Register volume',
      selector: 'Case notes selector',
      batches: 'Batches',
      batch: 'Batch',
      findBatch: 'Find batch',
      createBatch: 'Create batch',
      requests: 'Outbox',
      request: 'Request',
      requestSelector: 'Case notes selector',
      inbox: 'Inbox',
      returnList: 'Return list',
      picklist: 'Picklist',
      clinics: 'Clinics',
      clinicSchedule: 'Clinic schedule',
      clinicDates: 'Clinic dates',
      allClinics: 'All clinics',
      clinicList: 'Clinic list',
      selectClinics: 'Select clinics',
      locations: 'Locations',
      admin: 'Admin',
    };
    return titles[view];
  }

  function userLine(item: CntUser) {
    return `${item.firstNames} ${item.surname}`;
  }
</script>

{#if view === 'login'}
  <section class="cnt-page">
    <header class="cnt-header">
      <div>
        <div class="cnt-kicker">NHS Wales - Case note tracker</div>
        <h1>Login</h1>
      </div>
    </header>
    <main class="cnt-main">
      <div class="login-panel">
        <FbBoxedInfo text="Simulated login - choose your identity" />
        <div class="login-grid">
          {#each store.users as item}
            <button type="button" class="identity-tile" onclick={() => login(item.uuid, pendingInitialView === 'home', pendingInitialView)}>
              <strong>{userLine(item)}</strong>
              <span>{item.role}</span>
              <span>{item.facility}</span>
              <span>{item.nadexId}</span>
            </button>
          {/each}
        </div>
      </div>
    </main>
    <footer class="login-footer">
      <FbButton variant="blue" onClick={back}>Back</FbButton>
    </footer>
  </section>
{:else}
  <section class="cnt-page">
    {#if view === 'home'}
      <header class="cnt-home-header">
        <div>NHS Wales</div>
        <strong>Case note tracker</strong>
      </header>
    {:else}
      <header class="cnt-header">
        <div>
          <div class="cnt-kicker">NHS Wales - Case note tracker</div>
          {#if ['preferences', 'batches', 'requests', 'inbox', 'returnList', 'picklist'].includes(view) && user}
            <div class="cnt-user-line">{userHeader(user)}</div>
          {/if}
          <h1>{view === 'manageVolume' ? 'Manage volume' : view === 'selectClinics' ? 'Select clinics' : view === 'batch' && selectedBatch ? selectedBatch.barcode : pageTitle()}</h1>
          {#if view === 'picklist'}
            <label class="header-check-line"><input type="checkbox" bind:checked={includeRetrievedPicklistPatients}> Include patients whose case notes have been retrieved</label>
          {/if}
          {#if view === 'history' && selectedVolume}
            <div class="cnt-title-detail">{selectedVolume.healthBoard}<br>{selectedVolume.locality}<br>{selectedVolume.type} {selectedVolume.volumeNumber}</div>
          {/if}
          {#if view === 'batch' && selectedBatch}
            <div class="cnt-title-detail">Purpose: {selectedBatch.intendedPurpose}<br>Current location: {locationLabel(store, selectedBatch.currentLocationUuid)}<br>Destination: {locationLabel(store, selectedBatch.intendedDestinationUuid)}</div>
          {/if}
          {#if view === 'clinicDates' && selectedClinic}
            <div class="cnt-title-detail">{selectedClinic.clinicName}<br>{selectedClinic.speciality}<br>{selectedClinic.clinician}</div>
          {/if}
          {#if view === 'clinicList' && selectedClinicInstance}
            {@const clinic = clinicForInstance(selectedClinicInstance)}
            <div class="cnt-title-detail">{formatDate(selectedClinicInstance.date)} {formatTime(selectedClinicInstance.startTime)}<br>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</div>
          {/if}
        </div>
        {#if view === 'clinicList'}
          <div class="header-check-stack">
            <label><input type="checkbox" bind:checked={showRescheduledAppointments}> Show rescheduled appointments</label>
            <label><input type="checkbox" bind:checked={showCancelledAppointments}> Show cancelled appointments</label>
          </div>
        {/if}
        {#if selectedPatient && ['locator', 'selector', 'requestSelector', 'history', 'manageVolume', 'registerVolume'].includes(view)}
          <div class="addressograph-wrap"><FbAddressograph {...patientProps(selectedPatient)} /></div>
        {/if}
      </header>
    {/if}

    <main class="cnt-main">
      {#if view === 'preferences'}
        <FbBoxedInfo text="In demo versions, this user preferences page is displayed after every login." />
        <section class="form-stack">
          <FbHBSelector label="Health board" value={preferenceHealthBoard} options={healthBoards()} onChange={(value) => (preferenceHealthBoard = value)} />
          <label>Locality<select bind:value={preferenceLocality}>{#each localities(preferenceHealthBoard) as option}<option>{option}</option>{/each}</select></label>
          <label>Facility<select bind:value={preferenceFacility}>{#each facilities(preferenceHealthBoard, preferenceLocality) as option}<option>{option}</option>{/each}</select></label>
        </section>
        <section class="assigned-section">
          <h2>Assigned libraries</h2>
          <Table>
            <thead><tr><th>Library</th><th>Custodians</th><th>Requests</th><th class="right">Action</th></tr></thead>
            <tbody>{#each store.locations.filter((location) => favouriteLibraryUuids.includes(location.uuid)) as location}<tr><td><strong>{location.code}</strong><br>{@render LocationDisplay(location.uuid, false, true)}</td><td><span class="custodian-list">{#each custodianUuidsForLocation(location.uuid) as uuid}<span>{@render UserBadge(uuid)}</span>{/each}</span></td><td>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</td><td class="right"><SmallButton label="Remove" action={() => removeLibrary(location.uuid)} /></td></tr>{/each}</tbody>
          </Table>
          <div class="assigned-actions"><FbAddButton label="Add library" onclick={openAddLibrary} /></div>
        </section>
        <section class="assigned-section">
          <h2>Assigned clinics</h2>
          <Table>
            <thead><tr><th>Clinic instance</th><th>Clinic</th><th>Retrievers</th><th class="right">Action</th></tr></thead>
            <tbody>{#each store.clinicInstances.filter((instance) => instance.retrieverUserUuids.includes(userUuid)) as instance}{@const clinic = clinicForInstance(instance)}<tr><td>{formatDate(instance.date)}<br>{formatTime(instance.startTime)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td class="right"><SmallButton label="Stop retrieving" action={() => (confirmStopClinicInstanceUuid = instance.uuid)} /></td></tr>{/each}</tbody>
          </Table>
          <div class="assigned-actions"><FbAddButton label="Add clinic(s)" onclick={openClinicPicker} /></div>
        </section>
      {:else if view === 'home'}
        <section class="scan-control" aria-label="Scan or enter identifier">
          <input placeholder="Scan NHS number, hospital number, volume barcode, RFID, batch or location" bind:value={scanIdentifier}>
          <button type="button" onclick={openScannedIdentifier}>Open</button>
          <button type="button" onclick={() => { scanIdentifier = store.volumes[0]?.rfid || ''; openScannedIdentifier(); }}>RFID</button>
          <button type="button" onclick={() => modalMessage = 'Typed and wired scanning remain available for review. Camera scanning depends on browser support.'}>Camera scan</button>
        </section>
        <div class="scan-buttons">
          <button type="button" onclick={() => openPatient(store.patients[0]?.uuid || '')}>Simulate NHS number scan</button>
          <button type="button" onclick={() => openPatient(store.patients[1]?.uuid || store.patients[0]?.uuid || '')}>Simulate hospital number scan</button>
          <button type="button" onclick={() => { const volume = store.volumes[0]; selectedVolumeUuid = volume?.uuid || ''; selectedVolumeUuids = volume ? [volume.uuid] : []; openPatient(volume?.patientUuid || ''); }}>Simulate volume number scan</button>
          <button type="button" onclick={() => openBatch(store.batches[0]?.uuid || '')}>Simulate batch number scan</button>
        </div>
        <fieldset class="cnt-fieldset">
          <legend>{user?.firstNames} {user?.surname} ({user?.nadexId})</legend>
          <div class="tile-grid">
            <button type="button" class="tile green-gradient" onclick={() => navigate('patientSearch')}>Patient search</button>
            <button type="button" class="tile blue-gradient" onclick={() => navigate('batches')}>Batches</button>
            <button type="button" class="tile red-gradient" onclick={() => navigate('requests')}>Outbox</button>
            <button type="button" class="tile purple-gradient" onclick={() => navigate('inbox')}>Inbox</button>
            <button type="button" class="tile orange-gradient" onclick={() => navigate('returnList')}>Return list</button>
            <button type="button" class="tile blue-green-gradient" onclick={() => navigate('picklist')}>Picklist</button>
            <button type="button" class="tile light-green-gradient" onclick={() => navigate('preferences')}>Preferences</button>
          </div>
        </fieldset>
        <fieldset class="cnt-fieldset">
          <legend>System</legend>
          <div class="tile-grid">
            <button type="button" class="tile blue-gradient" onclick={() => navigate('clinicSchedule')}>Clinic schedule</button>
            <button type="button" class="tile green-gradient" onclick={() => navigate('allClinics')}>All clinics</button>
            <button type="button" class="tile blue-green-gradient" onclick={() => navigate('locations')}>Locations</button>
            <button type="button" class="tile orange-gradient" onclick={() => navigate('admin')}>Admin<br><small>For records admins</small></button>
            <button type="button" class="tile light-green-gradient" onclick={() => window.location.href = '../docs/cnt-specification.html'}>CNT specification</button>
            <button type="button" class="tile light-orange-gradient" onclick={() => modalMessage = 'Typed and wired scanning remain available for review. Camera scanning depends on browser support.'}>Show offline warning</button>
          </div>
        </fieldset>
      {:else if view === 'patientSearch'}
        <label class="search-row">Search for <input value={searchQuery} placeholder="Type to search patient index" oninput={(event) => runPatientSearch((event.currentTarget as HTMLInputElement).value)}></label>
        {#if patientSearchError}
          <div class="cnt-muted" role="alert">{patientSearchError}</div>
        {:else if patientSearchLoading}
          <div class="cnt-muted">Querying patient registry...</div>
        {:else if searchQuery.trim() && filteredPatients.length === 0}
          <div class="cnt-muted italic">No matches found</div>
        {:else}
          <Table>
            <thead><tr><th>Patient</th><th>NHS number</th><th>Hospital number</th><th class="right">Action</th></tr></thead>
            <tbody>{#each filteredPatients as patient}<tr><td><FbAddressograph {...patientProps(patient)} /></td><td>{patient.nhsNumber}</td><td>{patient.hospitalNumber}</td><td class="right"><SmallButton label="Case notes" action={() => openPatientSearchResult(patient)} /></td></tr>{/each}</tbody>
          </Table>
        {/if}
      {:else if view === 'locator' && selectedPatient}
        <FbcntPageLocator
          {store}
          {selectedPatientUuid}
          {selectedVolumeUuids}
          toggleVolume={toggleSelectedVolume}
          toggleVolumes={toggleSelectedVolumes}
          openHistory={openHistory}
          openManageVolume={openManageVolume}
        />
      {:else if view === 'selector' && selectedPatient}
        <FbcntPageSelector
          {store}
          {selectedPatientUuid}
          {selectedVolumeUuids}
          toggleVolume={toggleSelectedVolume}
          toggleVolumes={toggleSelectedVolumes}
        />
      {:else if view === 'requestSelector' && selectedPatient}
        <FbcntPageSelector
          {store}
          selectedPatientUuid={requestPatientUuid || selectedPatientUuid}
          {selectedVolumeUuids}
          toggleVolume={toggleSelectedVolume}
          toggleVolumes={toggleSelectedVolumes}
        />
      {:else if view === 'history' && selectedVolume}
        <Table>
          <thead><tr><th>Date/time</th><th>Event</th><th>From</th><th>To</th><th>Note</th></tr></thead>
          <tbody>{#each selectedVolume.events as event}<tr><td>{formatDateTime(event.datetime)}</td><td>{event.kind}</td><td>{@render LocationDisplay(event.fromLocationUuid, false, true)}</td><td>{@render LocationDisplay(event.toLocationUuid, false, true)}</td><td>{event.note}</td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'manageVolume' && managedVolumeDraft}
        <FbcntPageManageVolume
          {store}
          volumeUuid={managedVolumeUuid}
          value={managedVolumeDraft}
          setValue={(value) => (managedVolumeDraft = value)}
        />
      {:else if view === 'registerVolume'}
        <FbcntPageRegisterVolume
          {store}
          createdDate={addVolumeCreatedDate}
          setCreatedDate={(value) => (addVolumeCreatedDate = value)}
          healthBoard={addVolumeHealthBoard}
          setHealthBoard={(value) => (addVolumeHealthBoard = value)}
          locality={addVolumeLocality}
          setLocality={(value) => (addVolumeLocality = value)}
          volumeType={addVolumeType}
          setVolumeType={(value) => (addVolumeType = value)}
          status={addVolumeStatus}
          setStatus={(value) => (addVolumeStatus = value)}
          recordStatus={addVolumeRecordStatus}
          setRecordStatus={(value) => (addVolumeRecordStatus = value)}
          volumeNumber={addVolumeNumber}
          setVolumeNumber={(value) => (addVolumeNumber = value)}
          dateClosed={addVolumeDateClosed}
          setDateClosed={(value) => (addVolumeDateClosed = value)}
          dateDestroyed={addVolumeDateDestroyed}
          setDateDestroyed={(value) => (addVolumeDateDestroyed = value)}
          reasonDestroyed={addVolumeReasonDestroyed}
          setReasonDestroyed={(value) => (addVolumeReasonDestroyed = value)}
          initialLocationUuid={addVolumeLocationUuid}
          setInitialLocationUuid={(value) => (addVolumeLocationUuid = value)}
          barcode={addVolumeBarcode}
          setBarcode={(value) => (addVolumeBarcode = value)}
          rfid={addVolumeRfid}
          setRfid={(value) => (addVolumeRfid = value)}
          batchUuid={addVolumeBatchUuid}
          setBatchUuid={(value) => (addVolumeBatchUuid = value)}
        />
      {:else if view === 'batches'}
        <Table>
          <thead><tr><th>Batch</th><th>Purpose</th><th>Current location</th><th>Destination</th><th>Volumes</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.batches.filter((batch) => favouriteBatchUuids.includes(batch.uuid)) as batch}<tr><td>{batch.barcode}</td><td>{batch.intendedPurpose}</td><td>{@render LocationDisplay(batch.currentLocationUuid, false, true)}</td><td>{@render LocationDisplay(batch.intendedDestinationUuid, false, true)}</td><td>{batch.volumeUuids.length}</td><td class="right"><SmallButton label="Open" action={() => openBatch(batch.uuid)} /><SmallButton label="Remove" action={() => removeBatchFavourite(batch.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'batch' && selectedBatch}
        <div class="batch-volume-groups">
          {#each batchPatientGroups(selectedBatch.volumeUuids) as group}
            <section class="batch-patient-group">
              <div>{#if group.patient}<FbAddressograph {...patientProps(group.patient)} />{/if}</div>
              <div class="batch-volume-list">
                {#each group.volumes as volume}
                  <div class="batch-volume-row">
                    <span>{volumeLabel(volume)}</span>
                    <span>{@render LocationDisplay(volume.currentLocationUuid, true, true)}</span>
                    <SmallButton label="Remove" action={() => removeVolumeFromBatch(selectedBatch.uuid, volume.uuid)} />
                  </div>
                {/each}
              </div>
            </section>
          {/each}
          {#if !selectedBatch.volumeUuids.length}<span class="empty">No volumes selected</span>{/if}
        </div>
      {:else if view === 'findBatch'}
        <label class="search-row">Find batch <input bind:value={findBatchSearch} placeholder="Type batch barcode or purpose"></label>
        <Table>
          <thead><tr><th>Batch</th><th>Purpose</th><th>Current location</th><th>Destination</th><th>Volumes</th><th class="right">Action</th></tr></thead>
          <tbody>{#each findBatchRows() as batch}<tr><td>{batch.barcode}</td><td>{batch.intendedPurpose}</td><td>{@render LocationDisplay(batch.currentLocationUuid, false, true)}</td><td>{@render LocationDisplay(batch.intendedDestinationUuid, false, true)}</td><td>{batch.volumeUuids.length}</td><td class="right"><SmallButton label="Add" action={() => addBatchFavourite(batch.uuid)} /><SmallButton label="Open" action={() => openBatch(batch.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'createBatch'}
        <section class="form-stack">
          <label>Barcode<input bind:value={createBatchBarcode}></label>
          <label>Purpose<input bind:value={createBatchPurpose}></label>
          <FbDropdown label="Current location" value={createBatchCurrentLocationUuid} options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))} onChange={(value) => (createBatchCurrentLocationUuid = value)} noWidthConstraint />
          <FbDropdown label="Destination" value={createBatchDestinationUuid} options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))} onChange={(value) => (createBatchDestinationUuid = value)} noWidthConstraint />
        </section>
      {:else if view === 'requests' || view === 'inbox'}
        {@render RequestTable(view === 'inbox' ? inboxRowsForUser() : outboxRowsForUser(), view === 'inbox' ? 'inbox' : 'outbox')}
      {:else if view === 'request'}
        <FbcntPageRequest
          {store}
          patientUuid={requestPatientUuid}
          openPatientSelector={() => navigate('patientSearch')}
          openVolumeSelector={() => {
            if (requestPatientUuid) {
              selectedPatientUuid = requestPatientUuid;
              selectedVolumeUuids = requestVolumeUuids;
              navigate('requestSelector');
            }
          }}
          selectedVolumeUuids={requestVolumeUuids}
          requiredFor={requestRequiredFor}
          setRequiredFor={(value) => requestRequiredFor = value}
          fromLocationUuid={requestFromLocationUuid}
          setFromLocationUuid={(value) => requestFromLocationUuid = value}
          toLocationUuid={requestToLocationUuid}
          setToLocationUuid={(value) => requestToLocationUuid = value}
        />
      {:else if view === 'returnList'}
        {#key returnListRevision}
          <Table>
            <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
            <tbody>{#each returnListRows() as row}<tr><td>Return</td><td>{@render LocationDisplay(row.locationUuid, false, true)}</td><td>{patientName(store, row.patientUuid)}</td><td>{@render SelectedVolumesLocation(selectedVolumes(row.volumeUuids))}</td><td class="right"><SmallButton label="Send" action={() => openReturnListSend(row)} /><SmallButton label="Remove" action={() => removeReturnListRow(row.patientUuid, row.volumeUuids)} /></td></tr>{/each}</tbody>
          </Table>
        {/key}
      {:else if view === 'picklist'}
        <Table>
          <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
          <tbody>
            {#each picklistAppointments() as row}
              {@const clinic = clinicForInstance(row.instance)}
              {@const patient = store.patients.find((item) => item.uuid === row.appointment.patientUuid)}
              <tr>
                <td>
                  {@render StatusBadge(appointmentStatusLabel(row.appointment.status), appointmentStatusClass(row.appointment.status))}
                  <br>
                  {formatDate(row.instance.date)}
                  <br>
                  {formatTime(row.appointment.time)}
                </td>
                <td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td>
                <td>{#if patient}<FbAddressograph {...patientProps(patient)} />{/if}</td>
                <td>
                  <FbcntSelectedVolumesLocation
                    {store}
                    volumes={selectedVolumes(row.entries.map((entry) => entry.volumeUuid))}
                    pickListEntries={row.entries}
                    requestedLocationUuid={clinic?.holdingLocationUuid || ''}
                  />
                </td>
                <td class="right">
                  <div class="picklist-action-stack">
                    <SmallButton label="Select" fullWidth margin="0" action={() => openPickListSelector(row.instance.uuid, row.appointment.patientUuid)} />
                    <SmallButton label="Receive" fullWidth margin="0" action={() => openPickListReceive(row.instance.uuid, row.appointment.patientUuid)} />
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </Table>
      {:else if view === 'clinics'}
        <Table>
          <thead><tr><th>Clinic instance</th><th>Clinic</th><th>Retrievers</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.clinicInstances.slice(0, 50) as instance}{@const clinic = clinicForInstance(instance)}<tr><td>{formatDate(instance.date)}<br>{formatTime(instance.startTime)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td class="right"><SmallButton label="Stop retrieving" action={() => (confirmStopClinicInstanceUuid = instance.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'selectClinics'}
        <Table>
          <thead><tr><th>Date/time</th><th>Clinic</th><th>Retrievers</th><th>Select</th></tr></thead>
          <tbody>{#each store.clinicInstances.filter((instance) => !instance.retrieverUserUuids.includes(userUuid)).slice(0, 80) as instance}{@const clinic = clinicForInstance(instance)}<tr><td>{formatDate(instance.date)}<br>{formatTime(instance.startTime)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td><input type="checkbox" checked={selectedClinicInstanceUuids.includes(instance.uuid)} onchange={(event) => toggleClinicPickerSelection(instance.uuid, event.currentTarget.checked)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'clinicSchedule'}
        {@render FilterPanel()}
        <Table>
          <thead><tr><th>Clinic</th><th>Speciality</th><th>Clinician</th><th>Holding location</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.clinics as clinic}<tr><td>{clinic.clinicName}</td><td>{clinic.speciality}</td><td>{clinic.clinician}</td><td>{@render LocationDisplay(clinic.holdingLocationUuid, false, true)}</td><td class="right"><SmallButton label="Dates" action={() => openClinicDates(clinic.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'clinicDates' && selectedClinic}
        <Table>
          <thead><tr><th>Date/time</th><th>Retrievers</th><th>Appointments</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.clinicInstances.filter((instance) => instance.clinicUuid === selectedClinicUuid) as instance}<tr><td>{formatDate(instance.date)}<br>{formatTime(instance.startTime)}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td>{instance.appointments.length}</td><td class="right"><SmallButton label="Clinic list" action={() => openClinicList(instance.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'allClinics'}
        {@render FilterPanel()}
        <Table>
          <thead><tr><th>Date/time</th><th>Clinic</th><th>Retrievers</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.clinicInstances.filter((instance) => showHistoricClinics || instance.date >= new Date().toISOString().slice(0, 10)).slice(0, 80) as instance}{@const clinic = clinicForInstance(instance)}<tr><td>{formatDate(instance.date)}<br>{formatTime(instance.startTime)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td class="right"><SmallButton label="Clinic list" action={() => openClinicList(instance.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'clinicList' && selectedClinicInstance}
        <Table>
          <thead><tr><th>Appointment</th><th>Patient</th><th>Selected case-note volumes</th><th class="right">Action</th></tr></thead>
          <tbody>{#each selectedClinicInstance.appointments.filter((appointment) => showRescheduledAppointments || appointment.status !== 'rescheduled').filter((appointment) => showCancelledAppointments || appointment.status !== 'cancelled') as appointment}{@const patientVolumeUuids = new Set(store.volumes.filter((volume) => volume.patientUuid === appointment.patientUuid).map((volume) => volume.uuid))}{@const entries = store.cntPickList.filter((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid && patientVolumeUuids.has(entry.volumeUuid))}<tr><td>{formatTime(appointment.time)}<br>{@render StatusBadge(appointment.status)}</td><td>{patientName(store, appointment.patientUuid)}</td><td>{@render SelectedVolumesLocation(selectedVolumes(entries.map((entry) => entry.volumeUuid)), entries)}</td><td class="right"><SmallButton label="Open record" action={() => openPatientRecord(appointment.patientUuid)} /><SmallButton label="Select case notes" action={() => openPickListSelector(selectedClinicInstanceUuid, appointment.patientUuid)} /><SmallButton label="Receive case notes" action={() => openPickListReceive(selectedClinicInstanceUuid, appointment.patientUuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'locations'}
        {@render FilterPanel(true)}
        <Table>
          <thead><tr><th>Code</th><th>Location</th><th>Custodians</th><th>Requests</th></tr></thead>
          <tbody>{#each locationFilteredRows as location}<tr><td>{location.code}</td><td>{@render LocationDisplay(location.uuid, false, true)}</td><td>{#each custodianUuidsForLocation(location.uuid) as uuid}{@render UserBadge(uuid)}{/each}</td><td>{location.acceptsRequests ? 'Accepts requests' : ''}</td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'admin'}
        <FbBoxedInfo text="Admin workflows are represented in this native Svelte surface; all prototype users are administrators." />
      {/if}
    </main>

    <footer class="cnt-footer">
      <div class="footer-left">
        {#if view === 'locator'}
          <FbButton variant="blue" onClick={openRegisterVolume}>Register volume</FbButton>
          <FbButton variant="blue" disabled={!selectedVolumeUuids.length} onClick={() => openMovementPopup('send')}>Send selected</FbButton>
          <FbButton variant="blue" disabled={!selectedVolumeUuids.length} onClick={() => openMovementPopup('receive')}>Receive selected</FbButton>
          <FbButton variant="blue" disabled={!selectedVolumeUuids.length} onClick={() => (batchSelectedPopupOpen = true)}>Batch selected</FbButton>
          <FbButton variant="blue" disabled={!selectedVolumeUuids.length} onClick={openTagSelectedPopup}>Tag selected</FbButton>
          <FbButton variant="blue" disabled={!selectedVolumeUuid && !selectedVolumeUuids.length} onClick={chooseSelectedVolumeForRequest}>Request selected</FbButton>
        {:else if view === 'selector'}
          <FbButton variant="blue" disabled={!selectedVolumeUuids.length} onClick={chooseSelectedVolumeForRequest}>Request selected</FbButton>
        {:else if view === 'batches'}
          <FbButton variant="blue" onClick={openFindBatch}>Find batch</FbButton><FbButton variant="blue" onClick={openCreateBatch}>Create batch</FbButton>
        {:else if view === 'requests'}
          <FbButton variant="blue" onClick={openNewRequest}>New request</FbButton>
        {/if}
      </div>
      <div class="footer-right">
        {#if user}<FbUserName value={user.nadexId} />{/if}
        {#if view === 'preferences'}
          <FbButton variant="success" onClick={savePreferences}>Ok</FbButton>
        {:else if view === 'manageVolume'}
          <FbButton variant="success" onClick={saveManagedVolume}>Ok</FbButton>
          <FbButton variant="danger" onClick={back}>Cancel</FbButton>
        {:else if view === 'registerVolume'}
          <FbButton variant="success" onClick={saveRegisteredVolume}>Register</FbButton>
          <FbButton variant="danger" onClick={back}>Cancel</FbButton>
        {:else if view === 'selectClinics'}
          <FbButton variant="success" onClick={addSelectedClinics}>Ok</FbButton>
          <FbButton variant="danger" onClick={back}>Cancel</FbButton>
        {:else if view === 'request'}
          <FbButton variant="success" onClick={saveRequest}>Ok</FbButton>
          <FbButton variant="blue" onClick={back}>Back</FbButton>
          <FbButton variant="blue" onClick={logout}>Logout</FbButton>
        {:else if view === 'requestSelector'}
          <FbButton variant="success" onClick={saveRequestVolumeSelection}>Ok</FbButton>
          <FbButton variant="danger" onClick={back}>Cancel</FbButton>
        {:else if view === 'createBatch'}
          <FbButton variant="success" onClick={createBatch}>Create</FbButton>
          <FbButton variant="danger" onClick={back}>Cancel</FbButton>
        {:else if view === 'selector'}
          <FbButton variant="success" onClick={savePickListSelection}>Ok</FbButton>
          <FbButton variant="danger" onClick={back}>Cancel</FbButton>
        {:else}
          <FbButton variant="blue" onClick={back}>Back</FbButton>
          <FbButton variant="blue" onClick={logout}>Logout</FbButton>
        {/if}
      </div>
    </footer>
  </section>
{/if}

{#if modalMessage}
  <div class="modal-backdrop">
    <div class="cnt-modal" role="dialog" aria-modal="true" aria-labelledby="cnt-error-title">
      <h2 id="cnt-error-title">Error</h2>
      <p>{modalMessage}</p>
      <div class="modal-footer"><FbButton variant="success" onClick={() => modalMessage = ''}>Ok</FbButton></div>
    </div>
  </div>
{/if}

{#if showAddLibraryPicker}
  <FbModal title="Add library">
    <div class="add-library-modal-body">
      <FbDropdown
        label="Library"
        value={addLibraryLocationUuid}
        options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))}
        onChange={(value) => (addLibraryLocationUuid = value)}
        noWidthConstraint
      />
      <div class="modal-footer">
        <FbButton variant="success" onClick={addLibrary}>Add</FbButton>
        <FbButton variant="danger" onClick={() => (showAddLibraryPicker = false)}>Cancel</FbButton>
      </div>
    </div>
  </FbModal>
{/if}

{#if movementPopup}
  <FbcntModalMovement
    {store}
    volumes={selectedVolumes(selectedVolumeUuids)}
    mode={movementPopup}
    sourceUuid={movementPopup === 'send' ? sendSourceUuid : receiveSourceUuid}
    destinationUuid={movementPopup === 'send' ? sendDestinationUuid : receiveDestinationUuid}
    setSourceUuid={(value) => movementPopup === 'send' ? (sendSourceUuid = value) : (receiveSourceUuid = value)}
    setDestinationUuid={(value) => movementPopup === 'send' ? (sendDestinationUuid = value) : (receiveDestinationUuid = value)}
    confirm={movementPopup === 'send' ? sendSelectedVolumes : receiveSelectedVolumes}
    cancel={() => (movementPopup = '')}
  />
{/if}

{#if batchSelectedPopupOpen}
  <FbcntModalBatchSelected
    {store}
    batches={store.batches.filter((batch) => favouriteBatchUuids.includes(batch.uuid))}
    selectBatch={addSelectedVolumesToBatch}
    cancel={() => (batchSelectedPopupOpen = false)}
  />
{/if}

{#if tagSelectedPopupOpen}
  <FbModal title="Tag selected">
    <div class="tag-selected-stack">
      <FbTextArea label="Purpose" value={tagPurpose} onChange={(value) => (tagPurpose = value)} fullWidth />
      <FbDropdown
        label="Location"
        value={tagLocationUuid}
        options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))}
        onChange={(value) => (tagLocationUuid = value)}
        noWidthConstraint
      />
    </div>
    <div class="modal-footer">
      <FbButton variant="success" onClick={createTagForSelected}>Create tag</FbButton>
      <FbButton variant="danger" onClick={() => (tagSelectedPopupOpen = false)}>Cancel</FbButton>
    </div>
  </FbModal>
{/if}

{#if confirmStopClinicInstanceUuid}
  <FbModal title="Stop retrieving">
    <p>Stop retrieving for this clinic instance?</p>
    <div class="modal-footer">
      <FbButton variant="danger" onClick={stopRetrievingClinic}>Stop retrieving</FbButton>
      <FbButton variant="success" onClick={() => (confirmStopClinicInstanceUuid = '')}>Cancel</FbButton>
    </div>
  </FbModal>
{/if}

{#if pickListReceivePopupOpen}
  <FbModal title="Received">
    <FbcntSelectedVolumesReceived
      volumes={selectedVolumes(store.cntPickList
        .filter((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid)
        .map((entry) => entry.volumeUuid))
        .filter((volume) => volume.patientUuid === selectedPatientUuid)}
      checkedVolumeUuids={receivePickListVolumeUuids}
      toggleVolume={toggleReceivePickListVolume}
    />
    <div class="modal-footer">
      <FbButton variant="success" onClick={receivePickListVolumes}>Ok</FbButton>
      <FbButton variant="danger" onClick={() => (pickListReceivePopupOpen = false)}>Cancel</FbButton>
    </div>
  </FbModal>
{/if}

{#if returnListSendPopup}
  <FbModal title="Send">
    <div class="add-library-modal-body">
      <FbcntSelectedVolumesReceived
        volumes={selectedVolumes(returnListSendPopup.volumeUuids)}
        checkedVolumeUuids={returnListSendVolumeUuids}
        toggleVolume={toggleReturnListSendVolume}
      />
      <FbDropdown
        label="To"
        value={sendDestinationUuid}
        options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))}
        onChange={(value) => (sendDestinationUuid = value)}
        noWidthConstraint
      />
      <div class="modal-footer">
        <FbButton variant="success" onClick={sendReturnListVolumes}>Send</FbButton>
        <FbButton variant="danger" onClick={() => (returnListSendPopup = null)}>Cancel</FbButton>
      </div>
    </div>
  </FbModal>
{/if}

{#if requestSendPopup}
  <FbModal title="Send selected volumes">
    <div class="add-library-modal-body">
      <FbcntSelectedVolumesReceived
        volumes={selectedVolumes(requestSendPopup.volumeUuids)}
        checkedVolumeUuids={returnListSendVolumeUuids}
        toggleVolume={toggleReturnListSendVolume}
      />
      <FbDropdown
        label="From"
        value={sendSourceUuid}
        options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))}
        onChange={(value) => (sendSourceUuid = value)}
        noWidthConstraint
      />
      <FbDropdown
        label="To"
        value={sendDestinationUuid}
        options={store.locations.map((location) => ({ value: location.uuid, label: `${location.code} - ${locationLabel(store, location.uuid)}` }))}
        onChange={(value) => (sendDestinationUuid = value)}
        noWidthConstraint
      />
      <div class="modal-footer">
        <FbButton variant="success" onClick={sendRequestVolumes}>Send</FbButton>
        <FbButton variant="danger" onClick={() => (requestSendPopup = null)}>Cancel</FbButton>
      </div>
    </div>
  </FbModal>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: white;
    color: #111;
    font-family: 'Roboto', sans-serif;
  }
  :global(.material-icons) { font-family: 'Material Icons'; }
  .cnt-page { height: 100vh; display: grid; grid-template-rows: auto 1fr auto; background: white; }
  .cnt-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 4.2rem; padding: 0 0.8rem; border-bottom: 0.2rem solid #1b6ec2; background: white; }
  .cnt-header > div:first-child { padding: 1rem 0; }
  .cnt-kicker { font-size: 1rem; font-weight: 300; line-height: 1.1; }
  .cnt-user-line { font-size: 1rem; font-weight: 500; line-height: 1.1; }
  h1 { margin: 0; font-size: 2rem; line-height: 1.05; font-weight: 500; }
  .cnt-title-detail { font-size: 2rem; line-height: 1.05; font-weight: 500; }
  .header-check-stack { display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-start; justify-content: center; }
  .header-check-stack label { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 1rem; font-weight: 300; }
  .header-check-line { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.4rem; font-size: 1rem; font-weight: 300; }
  .header-check-line input { min-height: 0; }
  .addressograph-wrap { padding: 0.4rem 0; }
  .cnt-home-header { padding: 1rem; background: #1b6ec2; color: white; font-size: 2rem; line-height: 1.05; }
  .cnt-home-header div { font-size: 1rem; font-weight: 300; }
  .cnt-main { overflow: auto; padding: 0.8rem; }
  .cnt-footer { display: flex; justify-content: space-between; gap: 0.4rem; min-height: 2.4rem; padding: 0.2rem 0.4rem; border-top: 0.2rem solid #1b6ec2; background: white; }
  .login-footer { display: flex; justify-content: flex-end; gap: 0.4rem; min-height: 2.4rem; padding: 0.2rem 0.4rem; border-top: 0.2rem solid #1b6ec2; background: white; }
  .footer-left, .footer-right { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
  .login-panel { max-width: 70rem; margin: 0 auto; }
  .login-grid, .tile-grid, .scan-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.8rem; margin-top: 0.8rem; }
  .identity-tile, .tile, .scan-buttons button { min-height: 5rem; border: none; border-radius: 0.4rem; padding: 0.7rem; color: white; font: inherit; font-weight: 500; text-align: left; cursor: pointer; text-decoration: none; }
  .identity-tile { display: grid; gap: 0.15rem; background: linear-gradient(135deg, #1b6ec2, #8cd2e7); }
  .identity-tile:nth-child(2n) { background: linear-gradient(135deg, #008000, #8cd2e7); }
  .identity-tile:nth-child(3n) { background: linear-gradient(135deg, #fd8a10, #d50000); }
  .cnt-fieldset, .filter-panel { margin: 0.8rem 0; border: 0.1rem solid silver; border-radius: 0.4rem; }
  .cnt-fieldset legend, .filter-panel legend { font-weight: 500; }
  .form-stack { display: grid; gap: 0.8rem; max-width: 36rem; margin-top: 0.8rem; }
  .assigned-section { margin-top: 0.9rem; border-top: 0.1rem solid silver; padding-top: 0.45rem; }
  .assigned-section h2 { margin: 0 0 0.4rem; font-size: 1rem; font-weight: 500; }
  .assigned-actions { margin-top: 0.4rem; }
  .custodian-list { display: grid; gap: 0.12rem; justify-items: start; }
  .inline-picker { margin-top: 0.5rem; padding: 0.5rem; border: 0.1rem solid silver; border-radius: 0.4rem; }
  .inline-picker-actions { display: flex; justify-content: flex-end; gap: 0.4rem; margin-top: 0.5rem; }
  label { display: grid; gap: 0.2rem; font-weight: 500; }
  input, select { min-height: 2rem; border: 0.1rem solid silver; border-radius: 0.4rem; padding: 0 0.4rem; font: inherit; }
  .scan-control { display: grid; grid-template-columns: minmax(16rem, 1fr) auto auto auto; gap: 0.4rem; align-items: center; margin-bottom: 0.8rem; }
  .scan-control button, .small-button { border: none; border-radius: 0.3rem; background: #1b6ec2; color: white; font: inherit; font-weight: 500; cursor: pointer; }
  .small-button { min-height: 1.6rem; margin: 0.1rem; padding: 0.2rem 0.44rem; font-size: 0.8rem; line-height: 1.2; white-space: nowrap; }
  .scan-control button { min-height: 2rem; padding: 0 0.8rem; }
  .scan-buttons button { background: #008000; }
  .green-gradient { background: linear-gradient(135deg, #008000, #8cd2e7); }
  .blue-gradient { background: linear-gradient(135deg, #1b6ec2, #8cd2e7); }
  .red-gradient { background: linear-gradient(135deg, #d50000, #fd8a10); }
  .orange-gradient { background: linear-gradient(135deg, #fd8a10, #fee715); color: #111; }
  .purple-gradient { background: linear-gradient(135deg, #7048e8, #8cd2e7); }
  .blue-green-gradient { background: linear-gradient(135deg, #1b6ec2, #008000); }
  .green-blue-gradient { background: linear-gradient(135deg, #008000, #1b6ec2); }
  .light-orange-gradient { background: linear-gradient(135deg, #fee715, #fd8a10); color: #111; }
  .light-green-gradient { background: linear-gradient(135deg, #c5e1a5, #8cd2e7); color: #111; }
  .right { text-align: right; }
  .picklist-action-stack {
    display: inline-grid;
    grid-template-columns: 4.4rem;
    gap: 0.25rem;
    justify-items: stretch;
  }
  .tree-level, .tree-leaf, .volume-row, .select-all-row { border-radius: 0.2rem; padding: 0.08rem 0.2rem; margin-top: 0.08rem; }
  .tree-level > strong { display: block; border-radius: 0.2rem; padding: 0.08rem 0.2rem; }
  .tree-heading[aria-disabled='true'] { cursor: default; }
  .tree-icon { display: inline-block; line-height: 1; }
  .level-1, .level-2, .tree-leaf { margin-left: 1rem; }
    .select-all-row { margin-left: 0; padding: 0.15rem 0 0.15rem 4.8rem; }
    .volume-check { display: inline-grid; grid-template-columns: 0.85rem minmax(0, max-content); gap: 0.35rem; align-items: center; font-weight: 400; line-height: 1.2; min-width: 0; }
    .volume-check input[type='checkbox'] { width: 0.85rem; height: 0.85rem; margin: 0; }
    .volume-label.disabled { text-decoration: line-through; }
    .location-display { display: inline-flex; gap: 0.25rem; align-items: flex-start; width: max-content; max-width: 100%; min-width: 0; }
  .location-lines { display: grid; gap: 0.04rem; min-width: 0; max-width: 100%; }
  .location-lines span { display: block; overflow-wrap: break-word; }
  .location-display.compact .location-lines { gap: 0; }
  .location-icon { flex: 0 0 auto; width: 1rem; margin-top: 0.05rem; color: #1b6ec2; font-family: 'Material Icons'; font-size: 1rem; line-height: 1.15; }
  .request-location-cell { font-size: 0.85rem; line-height: 1.15; }
  .status-badge { display: inline-block; width: fit-content; border-radius: 0.2rem; padding: 0.05rem 0.25rem; color: white; font-size: 0.8rem; font-weight: 500; text-align: center; }
  .status-badge.green { background: #008000; }
  .status-badge.red { background: #d50000; }
  .status-badge.orange { background: #fd8a10; }
  .selected-volume-location-group { margin-left: 1rem; font-size: 0.85rem; line-height: 1.15; }
  .selected-volume-label { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; }
  .received-location { display: grid; grid-template-columns: 1.1rem minmax(0, 1fr); gap: 0.15rem; align-items: start; margin-left: 1rem; font-size: 0.85rem; line-height: 1.1; }
  .received-tick { visibility: hidden; color: #008000; font-size: 1rem; }
  .received-tick.visible { visibility: visible; }
  .check-line { display: inline-flex; align-items: center; gap: 0.4rem; margin: 0 0.8rem 0.8rem 0; }
  .filter-panel { display: flex; flex-wrap: wrap; gap: 0.8rem; padding: 0.6rem; }
  .search-row { margin-bottom: 0.8rem; max-width: 28rem; }
  .cnt-muted { color: #555; padding: 0.8rem 0; }
  .italic { font-style: italic; }
  .empty { color: #555; font-style: italic; }
  .modal-backdrop { position: fixed; inset: 0; display: grid; place-items: center; background: rgb(0 0 0 / 0.35); }
  .cnt-modal { width: min(32rem, 90vw); border: 0.1rem solid silver; border-radius: 0.4rem; padding: 1rem; background: white; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1rem; }
  .add-library-modal-body { display: grid; gap: 0.8rem; }
  .tag-selected-stack { display: grid; gap: 0.8rem; }
  .batch-volume-groups { display: grid; gap: 0.7rem; }
  .batch-patient-group { display: grid; grid-template-columns: minmax(15rem, max-content) minmax(20rem, 1fr); gap: 0.8rem; align-items: start; border-bottom: 0.1rem solid silver; padding-bottom: 0.7rem; }
  .batch-volume-list { display: grid; gap: 0.25rem; }
  .batch-volume-row { display: grid; grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2fr) 4.8rem; gap: 0.6rem; align-items: start; }
  .volume-action-stack { display: grid; grid-template-columns: 1fr; gap: 0.25rem; align-items: stretch; justify-items: stretch; }
  @media (max-width: 800px) {
    .cnt-header, .cnt-footer { display: block; }
    .cnt-header > div:first-child { padding: 1rem 0 0.4rem; }
      .scan-control, .volume-row, .batch-patient-group, .batch-volume-row { grid-template-columns: 1fr; padding-left: 0.2rem; }
      .select-all-row { padding-left: 0.2rem; }
    .footer-right { justify-content: flex-end; margin-top: 0.4rem; }
  }
</style>

{#snippet StatusBadge(label: string, colour = '')}
  <span class={`status-badge ${colour || (label === 'Active' || label === 'active' ? 'green' : label === 'Req' ? 'orange' : 'red')}`}>{label}</span>
{/snippet}

{#snippet UserBadge(uuidValue: string)}
  {@const item = store.users.find((candidate) => candidate.uuid === uuidValue)}
  {#if item}<FbToolTipUser user={item} />{/if}
{/snippet}

{#snippet LocationDisplay(uuidValue = '', withIcon = false, compact = false)}
  {@const lines = locationLines(uuidValue)}
  {#if lines.length}
      <span class="location-display" class:compact>
        {#if withIcon}<span class="material-icons location-icon" aria-hidden="true">view_list</span>{/if}
      <span class="location-lines">{#each lines as line}<span>{line}</span>{/each}</span>
    </span>
  {/if}
{/snippet}

{#snippet TreeHeading(key: string, label: string, level = 0, preventCollapse = false)}
  {@const expanded = cntTreeOpen(key)}
  <button
    type="button"
    class={`tree-heading level-${level}`}
    style={treeHeadingStyle(key, level)}
    onmouseenter={() => setActiveTreeVisual(key)}
    onmouseleave={() => setActiveTreeVisual()}
    onfocus={() => setActiveTreeVisual(key)}
    onblur={() => setActiveTreeVisual()}
    onclick={() => { if (!expanded || !preventCollapse) toggleCntTree(key); }}
    aria-expanded={expanded}
    aria-disabled={expanded && preventCollapse}
  >
    <span class="tree-icon" aria-hidden="true">{expanded ? '\u25bc' : '\u25b6'}</span>
    <strong>{label}</strong>
  </button>
{/snippet}

{#snippet VolumeTree(volumes: CntVolume[], interactive = false)}
  {#if !volumes.length}
    <span class="empty">No volumes selected</span>
  {:else}
    {#each Object.entries(volumeTree(volumes)) as [healthBoard, localities]}
      {@const healthBoardVolumes = Object.values(localities).flatMap((types) => Object.values(types).flat())}
      {@const healthBoardKey = `volume-tree:hb:${healthBoard}`}
      <div class="tree-level level-0">
        {@render TreeHeading(healthBoardKey, healthBoard, 0, interactive && hasSelectedVolume(healthBoardVolumes))}
        {#if cntTreeOpen(healthBoardKey)}
          <div class="tree-level level-1">
            {#each Object.entries(localities) as [locality, types]}
              {@const localityVolumes = Object.values(types).flat()}
              {@const localityKey = `volume-tree:loc:${healthBoard}:${locality}`}
              {@render TreeHeading(localityKey, locality, 1, interactive && hasSelectedVolume(localityVolumes))}
              {#if cntTreeOpen(localityKey)}
                <div class="tree-level level-2">
                  {#each Object.entries(types) as [type, items]}
                    {@const typeKey = `volume-tree:type:${healthBoard}:${locality}:${type}`}
                    {@const selectableItems = items.filter((volume) => !volumeIsDestroyed(volume))}
                    {@render TreeHeading(typeKey, type, 2, interactive && hasSelectedVolume(items))}
                    {#if cntTreeOpen(typeKey)}
                      <div>
                        {#if interactive && selectableItems.length > 1}
                          {@const selectAllKey = `select-all:${typeKey}`}
                          <div class="select-all-row">
                            <button
                              type="button"
                              class="select-all-button"
                              style={selectAllButtonStyle(selectAllKey)}
                              onmouseenter={() => setActiveTreeVisual(selectAllKey)}
                              onmouseleave={() => setActiveTreeVisual()}
                              onfocus={() => setActiveTreeVisual(selectAllKey)}
                              onblur={() => setActiveTreeVisual()}
                              onclick={() => toggleSelectedVolumes(items)}
                            >
                              {selectableItems.every((volume) => selectedVolumeUuids.includes(volume.uuid)) ? 'Clear all' : 'Select all'}
                            </button>
                          </div>
                        {/if}
                        {#each items as volume}
                          {#if interactive}
                            {@const rowKey = `volume-row:${volume.uuid}`}
                            <div
                              class="volume-row"
                              style={volumeRowStyle(rowKey, selectedVolumeUuids.includes(volume.uuid), volumeIsDestroyed(volume))}
                              onmouseenter={() => setActiveTreeVisual(rowKey)}
                              onmouseleave={() => setActiveTreeVisual()}
                              onfocusin={() => setActiveTreeVisual(rowKey)}
                              onfocusout={() => setActiveTreeVisual()}
                            >
                              <label class="volume-check">
                                <input type="checkbox" disabled={volumeIsDestroyed(volume)} checked={selectedVolumeUuids.includes(volume.uuid)} onchange={() => toggleSelectedVolume(volume.uuid)}>
                                <span class="volume-label" class:disabled={volumeIsDestroyed(volume)}>{volumeLabel(volume)}</span>
                              </label>
                              {@render StatusBadge(volumeStatus(volume), volumeStatusClass(volume))}
                              {@render LocationDisplay(volume.currentLocationUuid, true)}
                              <span class="volume-action-stack"><SmallButton label="Manage" fullWidth margin="0" action={() => openManageVolume(volume.uuid)} /><SmallButton label="History" fullWidth margin="0" action={() => openHistory(volume.uuid)} /></span>
                            </div>
                          {:else}
                            {@const leafKey = `volume-leaf:${volume.uuid}`}
                            <div
                              class="tree-leaf"
                              style={treeLeafStyle(leafKey)}
                              onmouseenter={() => setActiveTreeVisual(leafKey)}
                              onmouseleave={() => setActiveTreeVisual()}
                              onfocusin={() => setActiveTreeVisual(leafKey)}
                              onfocusout={() => setActiveTreeVisual()}
                            >{volumeLabel(volume)}</div>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                  {/each}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
{/snippet}

{#snippet SelectedVolumesLocation(volumes: CntVolume[], pickListEntries: CntPickListEntry[] = [])}
  {@const received = new Set(pickListEntries.filter((entry) => entry.received).map((entry) => entry.volumeUuid))}
  {#if !volumes.length}
    <span class="empty">No volumes selected</span>
  {:else}
    {#each selectedVolumeLocationGroups(volumes) as group}
      {@const healthBoardKey = `selected-tree:hb:${group.healthBoard}`}
      {@const localityKey = `selected-tree:loc:${group.healthBoard}:${group.locality}`}
      {@const typeKey = `selected-tree:type:${group.healthBoard}:${group.locality}:${group.type}`}
      {@const requested = group.volumes.some((volume) => hasOpenRequestAtLocation(volume.uuid, group.locationUuid) && !received.has(volume.uuid))}
      <div class="tree-level level-0">
        {@render TreeHeading(healthBoardKey, group.healthBoard, 0)}
        {#if cntTreeOpen(healthBoardKey)}
        <div class="tree-level level-1">
          {@render TreeHeading(localityKey, group.locality, 1)}
          {#if cntTreeOpen(localityKey)}
          <div class="tree-level level-2">
            {@render TreeHeading(typeKey, group.type, 2)}
            {#if cntTreeOpen(typeKey)}
              <div class="selected-volume-location-group">
                <div class="selected-volume-label">
                  <span>{volumeRangeLabel(group.volumes)}</span>
                  {#if requested}{@render StatusBadge('Req', 'orange')}{/if}
                </div>
                <div class="received-location">
                  <span class="received-tick" class:visible={group.volumes.some((volume) => received.has(volume.uuid))} aria-hidden="true">&#10003;</span>
                  {@render LocationDisplay(group.locationUuid, true, true)}
                </div>
              </div>
            {/if}
          </div>
          {/if}
        </div>
        {/if}
      </div>
    {/each}
  {/if}
{/snippet}

{#snippet RequestTable(rows: RequestRow[], mode: 'outbox' | 'inbox')}
  <Table>
    <thead><tr><th>Patient</th><th>Case notes</th><th>Request</th><th>From</th><th>To</th><th>Status</th><th class="right">Action</th></tr></thead>
    <tbody>
      {#each rows as row}
        {@const patient = store.patients.find((item) => item.uuid === row.patientUuid)}
        <tr>
          <td>{#if patient}<FbAddressograph {...patientProps(patient)} />{/if}</td>
          <td><FbcntSelectedVolumes {store} volumes={selectedVolumes(row.volumeUuids)} compact /></td>
          <td>{row.requiredFor}<br>{formatDate(row.requiredBy)}</td>
          <td><div class="request-location-cell">{@render LocationDisplay(row.fromLocationUuid, false, true)}</div></td>
          <td><div class="request-location-cell">{@render LocationDisplay(row.toLocationUuid, false, true)}</div></td>
          <td>{requestStatusLabel(row.status)}</td>
          <td class="right">
            {#if mode === 'outbox'}
              <button type="button" class="small-button" onclick={() => cancelRequest(row)}>Cancel</button>
              <button type="button" class="small-button" onclick={() => { selectedPatientUuid = row.patientUuid; navigate('locator'); }}>Locator</button>
            {:else}
              <button type="button" class="small-button" onclick={() => openRequestSend(row)}>Send</button>
              <button type="button" class="small-button" onclick={() => doneRequest(row)}>Done</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </Table>
{/snippet}

{#snippet FilterPanel(useLocationFilter = false)}
  {@const healthBoardValue = useLocationFilter ? locationFilterHealthBoard : preferenceHealthBoard}
  {@const localityValue = useLocationFilter ? locationFilterLocality : preferenceLocality}
  {@const facilityValue = useLocationFilter ? locationFilterFacility : preferenceFacility}
  <fieldset class="filter-panel">
    <legend>Filter</legend>
    <FbHBSelector label="Health board" value={healthBoardValue} options={healthBoards()} placeholder="All" onChange={(value) => setFilterValue(useLocationFilter, 'healthBoard', value)} />
    <label>Locality<select value={localityValue} onchange={(event) => setFilterValue(useLocationFilter, 'locality', selectValue(event))}><option value="">All</option>{#each localities(healthBoardValue) as option}<option>{option}</option>{/each}</select></label>
    <label>Facility<select value={facilityValue} onchange={(event) => setFilterValue(useLocationFilter, 'facility', selectValue(event))}><option value="">All</option>{#each facilities(healthBoardValue, localityValue) as option}<option>{option}</option>{/each}</select></label>
  </fieldset>
{/snippet}
