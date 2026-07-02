<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import FbAddressograph from '../components/fbAddressograph.svelte';
  import FbBoxedInfo from '../components/fbBoxedInfo.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbToolTipUser from '../components/fbToolTipUser.svelte';
  import FbUserName from '../components/fbUserName.svelte';
  import FbcntPageRequest from './FbcntPageRequest.svelte';
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

  type View =
    | 'login'
    | 'preferences'
    | 'home'
    | 'patientSearch'
    | 'locator'
    | 'history'
    | 'batches'
    | 'batch'
    | 'requests'
    | 'request'
    | 'inbox'
    | 'returnList'
    | 'picklist'
    | 'clinics'
    | 'clinicSchedule'
    | 'clinicDates'
    | 'allClinics'
    | 'clinicList'
    | 'libraries'
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
  let locationFilterHealthBoard = '';
  let locationFilterLocality = '';
  let locationFilterFacility = '';
  let showHistoricClinics = false;
  let showRescheduledAppointments = false;
  let showCancelledAppointments = false;
  let modalMessage = '';
  let cntTreeCollapsed: Record<string, boolean> = {};
  let pendingInitialView: View = 'home';

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const loginAs = params.get('loginAs');
    const patientUuid = params.get('patientUuid');
    pendingInitialView = safeInitialView(params.get('view') || initialView);
    if (patientUuid) selectedPatientUuid = patientUuid;
    const sessionUuid = getSessionUserUuid();
    if (loginAs || sessionUuid || inline) {
      login(loginAs || sessionUuid || defaultCntLoginUserUuid, false, patientUuid || initialPatientUuid ? 'locator' : pendingInitialView);
    }
  });

  $: user = store.users.find((item) => item.uuid === userUuid);
  $: selectedPatient = store.patients.find((item) => item.uuid === selectedPatientUuid) || initialPatient;
  $: selectedVolume = store.volumes.find((item) => item.uuid === selectedVolumeUuid);
  $: selectedBatch = store.batches.find((item) => item.uuid === selectedBatchUuid);
  $: selectedClinic = store.clinics.find((item) => item.uuid === selectedClinicUuid);
  $: selectedClinicInstance = store.clinicInstances.find((item) => item.uuid === selectedClinicInstanceUuid);
  $: patientVolumes = selectedPatientUuid ? store.volumes.filter((volume) => volume.patientUuid === selectedPatientUuid).sort(volumeSort) : [];
  $: filteredPatients = searchQuery.trim()
    ? store.patients.filter((patient) => patientSearchText(patient).includes(searchQuery.trim().toLowerCase())).slice(0, 30)
    : store.patients.slice(0, 12);
  $: outboxRows = groupedRequestRows(store.requests.filter((request) => request.requestedByUserUuid === userUuid && request.status !== 'cancelled'));
  $: inboxRows = groupedRequestRows(store.requests.filter((request) => request.status === 'open' && custodianUuidsForLocation(request.toLocationUuid).includes(userUuid)));
  $: favouriteBatchUuids = store.preferences[userUuid]?.batchUuids || store.batches.slice(0, 3).map((batch) => batch.uuid);
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
      libraries: 'libraries',
      locations: 'locations',
      admin: 'admin',
      patientSearch: 'patientSearch',
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
      else window.location.href = '../index.html';
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
    }
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

  function openBatch(batchUuid: string) {
    selectedBatchUuid = batchUuid;
    navigate('batch');
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
    store = { ...store, requests: store.requests.map((request) => requestUuids.has(request.uuid) ? { ...request, status: 'cancelled' } : request) };
    saveCntStore(store);
  }

  function doneRequest(row: RequestRow) {
    const requestUuids = new Set(row.requestUuids);
    store = { ...store, requests: store.requests.map((request) => requestUuids.has(request.uuid) ? { ...request, status: 'actioned' } : request) };
    saveCntStore(store);
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

  function patientSearchText(patient: CntPatient) {
    return `${patient.surname} ${patient.forenames} ${patient.nhsNumber} ${patient.hospitalNumber}`.toLowerCase();
  }

  function userHeader(item?: CntUser) {
    return item ? `${item.surname.toUpperCase()}, ${item.firstNames}, ${item.title} (NADEX:${item.nadexId}), ${item.role}, ${item.facility}` : '';
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
    return volume.status === 'destroyed' || volume.destroyed;
  }

  function volumeIsClosed(volume: CntVolume) {
    return volume.status === 'closed' || volume.closed;
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
    const parent = store.locations.find((item) =>
      item.healthBoard === location.healthBoard
      && item.locality === location.locality
      && item.facility === location.facility
      && item.department === location.department
      && !item.extra);
    return parent?.custodianUuids?.length ? parent.custodianUuids : location.custodianUuids || [];
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

  function selectedVolumes(volumeUuids: string[]) {
    return store.volumes.filter((volume) => volumeUuids.includes(volume.uuid)).sort(volumeSort);
  }

  function picklistAppointments() {
    const rows: Array<{ instance: CntClinicInstance; appointment: CntAppointment; entries: CntPickListEntry[] }> = [];
    const appointmentUuids = new Set(store.cntPickList.map((entry) => entry.appointmentUuid));
    for (const appointmentUuid of appointmentUuids) {
      const appointment = store.appointments.find((item) => item.uuid === appointmentUuid);
      if (!appointment) continue;
      if (!showRescheduledAppointments && appointment.status === 'rescheduled') continue;
      if (!showCancelledAppointments && appointment.status === 'cancelled') continue;
      const instance = store.clinicInstances.find((item) => item.uuid === appointment.clinicInstanceUuid);
      if (!instance) continue;
      rows.push({ instance, appointment, entries: store.cntPickList.filter((entry) => entry.appointmentUuid === appointmentUuid) });
    }
    return rows.sort((a, b) => a.instance.dateTime.localeCompare(b.instance.dateTime));
  }

  function returnListRows() {
    const rows = new Map<string, { patientUuid: string; locationUuid: string; volumeUuids: string[] }>();
    for (const entry of store.cntPickList.filter((item) => item.received)) {
      const volume = store.volumes.find((item) => item.uuid === entry.volumeUuid);
      if (!volume) continue;
      const key = `${volume.patientUuid}|${volume.currentLocationUuid}`;
      const row = rows.get(key) || { patientUuid: volume.patientUuid, locationUuid: volume.currentLocationUuid, volumeUuids: [] };
      row.volumeUuids.push(volume.uuid);
      rows.set(key, row);
    }
    return Array.from(rows.values());
  }

  function clinicForInstance(instance?: CntClinicInstance) {
    return instance ? store.clinics.find((clinic) => clinic.uuid === instance.clinicUuid) : undefined;
  }

  function pageTitle() {
    const titles: Record<View, string> = {
      login: 'Login',
      preferences: 'Preferences',
      home: 'Case note tracker',
      patientSearch: 'Patient search',
      locator: 'Case notes locator',
      history: 'Volume history',
      batches: 'Batches',
      batch: 'Batch',
      requests: 'Outbox',
      request: 'Request',
      inbox: 'Inbox',
      returnList: 'Return list',
      picklist: 'Picklist',
      clinics: 'Clinics',
      clinicSchedule: 'Clinic schedule',
      clinicDates: 'Clinic dates',
      allClinics: 'All clinics',
      clinicList: 'Clinic list',
      libraries: 'Libraries',
      locations: 'Locations',
      admin: 'Admin',
    };
    return titles[view];
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
            <button type="button" class="identity-tile" on:click={() => login(item.uuid, pendingInitialView === 'home', pendingInitialView)}>
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
          {#if ['preferences', 'batches', 'requests', 'inbox', 'returnList', 'picklist', 'libraries'].includes(view) && user}
            <div class="cnt-user-line">{userHeader(user)}</div>
          {/if}
          <h1>{pageTitle()}</h1>
          {#if view === 'history' && selectedVolume}
            <div class="cnt-title-detail">{selectedVolume.healthBoard}<br>{selectedVolume.locality}<br>{selectedVolume.type} {selectedVolume.volumeNumber}</div>
          {/if}
          {#if view === 'batch' && selectedBatch}
            <div class="cnt-title-detail">Purpose: {selectedBatch.purpose}<br>Current location: {locationLabel(store, selectedBatch.currentLocationUuid)}<br>Destination: {locationLabel(store, selectedBatch.intendedDestinationUuid)}</div>
          {/if}
          {#if view === 'clinicDates' && selectedClinic}
            <div class="cnt-title-detail">{selectedClinic.clinicName}<br>{selectedClinic.speciality}<br>{selectedClinic.clinician}</div>
          {/if}
          {#if view === 'clinicList' && selectedClinicInstance}
            {@const clinic = clinicForInstance(selectedClinicInstance)}
            <div class="cnt-title-detail">{formatDateTime(selectedClinicInstance.dateTime)}<br>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</div>
          {/if}
        </div>
        {#if view === 'clinicList'}
          <div class="header-check-stack">
            <label><input type="checkbox" bind:checked={showRescheduledAppointments}> Show rescheduled appointments</label>
            <label><input type="checkbox" bind:checked={showCancelledAppointments}> Show cancelled appointments</label>
          </div>
        {/if}
        {#if selectedPatient && ['locator', 'history'].includes(view)}
          <div class="addressograph-wrap"><FbAddressograph {...patientProps(selectedPatient)} /></div>
        {/if}
      </header>
    {/if}

    <main class="cnt-main">
      {#if view === 'preferences'}
        <FbBoxedInfo text="In demo versions, this user preferences page is displayed after every login." />
        <section class="form-stack">
          <label>Health board<select bind:value={preferenceHealthBoard}>{#each healthBoards() as option}<option>{option}</option>{/each}</select></label>
          <label>Locality<select bind:value={preferenceLocality}>{#each localities(preferenceHealthBoard) as option}<option>{option}</option>{/each}</select></label>
          <label>Facility<select bind:value={preferenceFacility}>{#each facilities(preferenceHealthBoard, preferenceLocality) as option}<option>{option}</option>{/each}</select></label>
        </section>
      {:else if view === 'home'}
        <section class="scan-control" aria-label="Scan or enter identifier">
          <input placeholder="Scan NHS number, hospital number, volume barcode, RFID, batch or location">
          <button type="button">Open</button>
          <button type="button">RFID</button>
          <button type="button">Camera scan</button>
        </section>
        <div class="scan-buttons">
          <button type="button" on:click={() => openPatient(store.patients[0]?.uuid || '')}>Simulate NHS number scan</button>
          <button type="button" on:click={() => openPatient(store.patients[1]?.uuid || store.patients[0]?.uuid || '')}>Simulate hospital number scan</button>
          <button type="button" on:click={() => { const volume = store.volumes[0]; selectedVolumeUuid = volume?.uuid || ''; selectedVolumeUuids = volume ? [volume.uuid] : []; openPatient(volume?.patientUuid || ''); }}>Simulate volume number scan</button>
          <button type="button" on:click={() => openBatch(store.batches[0]?.uuid || '')}>Simulate batch number scan</button>
        </div>
        <fieldset class="cnt-fieldset">
          <legend>{user?.firstNames} {user?.surname} ({user?.nadexId})</legend>
          <div class="tile-grid">
            <button type="button" class="tile green-gradient" on:click={() => navigate('patientSearch')}>Patient search</button>
            <button type="button" class="tile blue-gradient" on:click={() => navigate('batches')}>Batches</button>
            <button type="button" class="tile red-gradient" on:click={() => navigate('requests')}>Outbox</button>
            <button type="button" class="tile purple-gradient" on:click={() => navigate('inbox')}>Inbox</button>
            <button type="button" class="tile orange-gradient" on:click={() => navigate('returnList')}>Return list</button>
            <button type="button" class="tile blue-green-gradient" on:click={() => navigate('picklist')}>Picklist</button>
            <button type="button" class="tile green-blue-gradient" on:click={() => navigate('clinics')}>Clinics</button>
            <button type="button" class="tile light-orange-gradient" on:click={() => navigate('libraries')}>Libraries</button>
            <button type="button" class="tile light-green-gradient" on:click={() => navigate('preferences')}>Preferences</button>
          </div>
        </fieldset>
        <fieldset class="cnt-fieldset">
          <legend>System</legend>
          <div class="tile-grid">
            <button type="button" class="tile blue-gradient" on:click={() => navigate('clinicSchedule')}>Clinic schedule</button>
            <button type="button" class="tile green-gradient" on:click={() => navigate('allClinics')}>All clinics</button>
            <button type="button" class="tile blue-green-gradient" on:click={() => navigate('locations')}>Locations</button>
            <button type="button" class="tile orange-gradient" on:click={() => navigate('admin')}>Admin<br><small>For records admins</small></button>
            <button type="button" class="tile light-green-gradient" on:click={() => window.location.href = '../docs/cnt-specification.html'}>CNT specification</button>
            <button type="button" class="tile light-orange-gradient" on:click={() => modalMessage = 'Typed and wired scanning remain available for review. Camera scanning depends on browser support.'}>Show offline warning</button>
          </div>
        </fieldset>
      {:else if view === 'patientSearch'}
        <label class="search-row">Search for <input bind:value={searchQuery} placeholder="Type to search patient index"></label>
        <Table>
          <thead><tr><th>Patient</th><th>NHS number</th><th>Hospital number</th><th class="right">Action</th></tr></thead>
          <tbody>{#each filteredPatients as patient}<tr><td><FbAddressograph {...patientProps(patient)} /></td><td>{patient.nhsNumber}</td><td>{patient.hospitalNumber}</td><td class="right"><SmallButton label="Case notes" action={() => openPatient(patient.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'locator' && selectedPatient}
        {@render VolumeTree(patientVolumes, true)}
      {:else if view === 'history' && selectedVolume}
        <Table>
          <thead><tr><th>Date/time</th><th>Event</th><th>From</th><th>To</th><th>Note</th></tr></thead>
          <tbody>{#each selectedVolume.events as event}<tr><td>{formatDateTime(event.dateTime)}</td><td>{event.eventType}</td><td>{@render LocationDisplay(event.fromLocationUuid, false, true)}</td><td>{@render LocationDisplay(event.toLocationUuid, false, true)}</td><td>{event.note}</td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'batches'}
        <Table>
          <thead><tr><th>Batch</th><th>Purpose</th><th>Current location</th><th>Destination</th><th>Volumes</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.batches.filter((batch) => favouriteBatchUuids.includes(batch.uuid)) as batch}<tr><td>{batch.barcode}</td><td>{batch.purpose}</td><td>{@render LocationDisplay(batch.currentLocationUuid, false, true)}</td><td>{@render LocationDisplay(batch.intendedDestinationUuid, false, true)}</td><td>{batch.volumeUuids.length}</td><td class="right"><SmallButton label="Open" action={() => openBatch(batch.uuid)} /><SmallButton label="Remove" /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'batch' && selectedBatch}
        {@render VolumeTree(selectedVolumes(selectedBatch.volumeUuids))}
      {:else if view === 'requests' || view === 'inbox'}
        {@render RequestTable(view === 'inbox' ? inboxRows : outboxRows, view === 'inbox' ? 'inbox' : 'outbox')}
      {:else if view === 'request'}
        <FbcntPageRequest
          {store}
          patientUuid={requestPatientUuid}
          openPatientSelector={() => navigate('patientSearch')}
          openVolumeSelector={() => {
            if (requestPatientUuid) {
              selectedPatientUuid = requestPatientUuid;
              navigate('locator');
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
        <Table>
          <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
          <tbody>{#each returnListRows() as row}<tr><td>Return</td><td>{@render LocationDisplay(row.locationUuid, false, true)}</td><td>{patientName(store, row.patientUuid)}</td><td>{@render SelectedVolumesLocation(selectedVolumes(row.volumeUuids))}</td><td class="right"><SmallButton label="Send" /><SmallButton label="Remove" /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'picklist'}
        <label class="check-line"><input type="checkbox"> Include patients whose case notes have been retrieved</label>
        <Table>
          <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
          <tbody>{#each picklistAppointments() as row}{@const clinic = clinicForInstance(row.instance)}<tr><td>{formatDate(row.instance.dateTime)}<br>{formatTime(row.instance.dateTime)}<br>{@render StatusBadge(row.appointment.status)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{patientName(store, row.appointment.patientUuid)}</td><td>{@render SelectedVolumesLocation(selectedVolumes(row.entries.map((entry) => entry.volumeUuid)), row.entries)}</td><td class="right"><SmallButton label="Select" /><SmallButton label="Receive" /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'clinics'}
        <Table>
          <thead><tr><th>Clinic instance</th><th>Clinic</th><th>Retrievers</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.clinicInstances.slice(0, 50) as instance}{@const clinic = clinicForInstance(instance)}<tr><td>{formatDate(instance.dateTime)}<br>{formatTime(instance.dateTime)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td class="right"><SmallButton label="Stop retrieving" /></td></tr>{/each}</tbody>
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
          <tbody>{#each store.clinicInstances.filter((instance) => instance.clinicUuid === selectedClinicUuid) as instance}<tr><td>{formatDate(instance.dateTime)}<br>{formatTime(instance.dateTime)}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td>{store.appointments.filter((appointment) => appointment.clinicInstanceUuid === instance.uuid).length}</td><td class="right"><SmallButton label="Clinic list" action={() => openClinicList(instance.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'allClinics'}
        {@render FilterPanel()}
        <Table>
          <thead><tr><th>Date/time</th><th>Clinic</th><th>Retrievers</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.clinicInstances.filter((instance) => showHistoricClinics || new Date(instance.dateTime) >= new Date()).slice(0, 80) as instance}{@const clinic = clinicForInstance(instance)}<tr><td>{formatDate(instance.dateTime)}<br>{formatTime(instance.dateTime)}</td><td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td><td>{#each instance.retrieverUserUuids as uuid}{@render UserBadge(uuid)}{/each}</td><td class="right"><SmallButton label="Clinic list" action={() => openClinicList(instance.uuid)} /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'clinicList' && selectedClinicInstance}
        <Table>
          <thead><tr><th>Appointment</th><th>Patient</th><th>Selected case-note volumes</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.appointments.filter((appointment) => appointment.clinicInstanceUuid === selectedClinicInstanceUuid).filter((appointment) => showRescheduledAppointments || appointment.status !== 'rescheduled').filter((appointment) => showCancelledAppointments || appointment.status !== 'cancelled') as appointment}{@const entries = store.cntPickList.filter((entry) => entry.appointmentUuid === appointment.uuid)}<tr><td>{formatTime(selectedClinicInstance.dateTime)}<br>{@render StatusBadge(appointment.status)}</td><td>{patientName(store, appointment.patientUuid)}</td><td>{@render SelectedVolumesLocation(selectedVolumes(entries.map((entry) => entry.volumeUuid)), entries)}</td><td class="right"><SmallButton label="Open record" /><SmallButton label="Select case notes" /><SmallButton label="Receive case notes" /></td></tr>{/each}</tbody>
        </Table>
      {:else if view === 'libraries'}
        <Table>
          <thead><tr><th>Library</th><th>Custodians</th><th>Requests</th><th class="right">Action</th></tr></thead>
          <tbody>{#each store.locations.filter((location) => favouriteLibraryUuids.includes(location.uuid)) as location}<tr><td><strong>{location.code}</strong><br>{@render LocationDisplay(location.uuid, false, true)}</td><td>{#each custodianUuidsForLocation(location.uuid) as uuid}{@render UserBadge(uuid)}{/each}</td><td>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</td><td class="right"><SmallButton label="Remove" action={() => removeLibrary(location.uuid)} /></td></tr>{/each}</tbody>
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
          <FbButton variant="blue">Register volume</FbButton>
          <FbButton variant="blue" disabled>Send selected</FbButton>
          <FbButton variant="blue" disabled>Receive selected</FbButton>
          <FbButton variant="blue" disabled>Batch selected</FbButton>
          <FbButton variant="blue" disabled>Tag selected</FbButton>
          <FbButton variant="blue" disabled={!selectedVolumeUuid && !selectedVolumeUuids.length} onClick={chooseSelectedVolumeForRequest}>Request selected</FbButton>
        {:else if view === 'batches'}
          <FbButton variant="blue">Find batch</FbButton><FbButton variant="blue">Create batch</FbButton>
        {:else if view === 'requests'}
          <FbButton variant="blue" onClick={openNewRequest}>New request</FbButton>
        {:else if view === 'libraries'}
          <FbButton variant="blue">Add library</FbButton>
        {/if}
      </div>
      <div class="footer-right">
        {#if user}<FbUserName value={user.nadexId} />{/if}
        {#if view === 'preferences'}
          <FbButton variant="success" onClick={savePreferences}>Ok</FbButton>
        {:else if view === 'request'}
          <FbButton variant="success" onClick={saveRequest}>Ok</FbButton>
          <FbButton variant="blue" onClick={back}>Back</FbButton>
          <FbButton variant="blue" onClick={logout}>Logout</FbButton>
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

<style>
  :global(body) {
    margin: 0;
    background: white;
    color: #111;
    font-family: 'Roboto', sans-serif;
  }
  :global(.material-icons) { font-family: 'Material Icons'; }
  .cnt-page { height: 100vh; display: grid; grid-template-rows: auto 1fr auto; background: white; }
  .cnt-header { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 0.8rem; border-bottom: 0.2rem solid #1b6ec2; background: white; }
  .cnt-kicker { font-size: 1rem; font-weight: 300; }
  .cnt-user-line { font-size: 1rem; font-weight: 500; }
  h1 { margin: 0; font-size: 2rem; line-height: 1.05; font-weight: 500; }
  .cnt-title-detail { font-size: 2rem; line-height: 1.05; font-weight: 500; }
  .header-check-stack { display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-start; justify-content: center; }
  .header-check-stack label { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 1rem; font-weight: 300; }
  .addressograph-wrap { padding: 0.4rem 0; }
  .cnt-home-header { padding: 1rem; background: #1b6ec2; color: white; font-size: 2rem; line-height: 1.05; }
  .cnt-home-header div { font-size: 1rem; font-weight: 300; }
  .cnt-main { overflow: auto; padding: 0.8rem; }
  .cnt-footer { display: flex; justify-content: space-between; gap: 0.4rem; min-height: 2.4rem; padding: 0.2rem 0.4rem; border-top: 0.2rem solid #1b6ec2; background: white; }
  .login-footer { display: flex; justify-content: flex-end; gap: 0.4rem; min-height: 2.4rem; padding: 0.2rem 0.4rem; background: white; }
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
  label { display: grid; gap: 0.2rem; font-weight: 500; }
  input, select { min-height: 2rem; border: 0.1rem solid silver; border-radius: 0.4rem; padding: 0 0.4rem; font: inherit; }
  .scan-control { display: grid; grid-template-columns: minmax(16rem, 1fr) auto auto auto; gap: 0.4rem; align-items: center; margin-bottom: 0.8rem; }
  .scan-control button, .small-button { border: none; border-radius: 0.3rem; background: #1b6ec2; color: white; font: inherit; font-weight: 500; cursor: pointer; }
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
  .tree-level, .tree-leaf, .volume-row, .select-all-row { border-radius: 0.2rem; padding: 0.08rem 0.2rem; margin-top: 0.08rem; }
  .tree-level > strong { display: block; border-radius: 0.2rem; padding: 0.08rem 0.2rem; }
  .tree-heading { display: flex; align-items: center; gap: 0.2rem; width: 100%; border: 0; border-radius: 0.2rem; background: transparent; color: #111; font: inherit; text-align: left; cursor: pointer; }
  .tree-heading:hover, .tree-heading:focus-visible { background: #ffffcc; outline: none; }
  .tree-heading.level-1:hover, .tree-heading.level-1:focus-visible { background: #fee715; }
  .tree-heading[aria-disabled='true'] { cursor: default; }
  .tree-icon { width: 1rem; color: #1b6ec2; font-size: 0.85rem; line-height: 1; text-align: center; }
  .level-0 > strong:hover, .level-2 > strong:hover { background: #ffffcc; }
  .level-1 > strong:hover, .tree-leaf:hover, .volume-row:hover, .volume-row:focus-within, .volume-row.selected { background: #fee715; }
  .level-1, .level-2, .tree-leaf { margin-left: 1rem; }
  .select-all-row { margin-left: 3.45rem; }
  .select-all-button { min-height: 1.7rem; border: 0.08rem solid #1b6ec2; border-radius: 0.2rem; background: white; color: #1b6ec2; font: inherit; font-weight: 500; cursor: pointer; }
  .select-all-button:hover, .select-all-button:focus-visible { background: #ffffcc; outline: none; }
  .volume-row { display: grid; grid-template-columns: minmax(10rem, 1fr) 5.5rem minmax(14rem, 2fr) auto; gap: 0.45rem; align-items: start; padding-left: 3.45rem; }
  .volume-row.disabled { color: #555; }
  .volume-check { display: inline-grid; grid-template-columns: 1rem minmax(0, max-content); gap: 0.4rem; align-items: start; font-weight: 400; }
  .volume-label.disabled { text-decoration: line-through; }
  .location-display { display: inline-flex; gap: 0.25rem; align-items: flex-start; width: max-content; max-width: 100%; min-width: 0; }
  .location-lines { display: grid; gap: 0.04rem; min-width: 0; max-width: 100%; }
  .location-lines span { display: block; overflow-wrap: break-word; }
  .location-display.compact .location-lines { gap: 0; }
  .location-icon { color: #1b6ec2; font-size: 1rem; line-height: 1.15; }
  .status-badge { display: inline-block; min-width: 2.2rem; border-radius: 0.2rem; padding: 0.05rem 0.25rem; color: white; font-size: 0.8rem; font-weight: 500; text-align: center; }
  .status-badge.green { background: #008000; }
  .status-badge.red { background: #d50000; }
  .status-badge.orange { background: #fd8a10; }
  .received-location { display: grid; grid-template-columns: 1.1rem minmax(0, 1fr); gap: 0.25rem; align-items: start; margin-left: 1rem; }
  .received-tick { visibility: hidden; color: #008000; font-size: 1rem; }
  .received-tick.visible { visibility: visible; }
  .check-line { display: inline-flex; align-items: center; gap: 0.4rem; margin: 0 0.8rem 0.8rem 0; }
  .filter-panel { display: flex; flex-wrap: wrap; gap: 0.8rem; padding: 0.6rem; }
  .search-row { margin-bottom: 0.8rem; max-width: 28rem; }
  .empty { color: #555; font-style: italic; }
  .modal-backdrop { position: fixed; inset: 0; display: grid; place-items: center; background: rgb(0 0 0 / 0.35); }
  .cnt-modal { width: min(32rem, 90vw); border: 0.1rem solid silver; border-radius: 0.4rem; padding: 1rem; background: white; }
  .modal-footer { display: flex; justify-content: flex-end; }
  @media (max-width: 800px) {
    .cnt-header, .cnt-footer { display: block; }
    .scan-control, .volume-row { grid-template-columns: 1fr; }
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
      {#if withIcon}<span class="location-icon" aria-hidden="true">&#9776;</span>{/if}
      <span class="location-lines">{#each lines as line}<span>{line}</span>{/each}</span>
    </span>
  {/if}
{/snippet}

{#snippet TreeHeading(key: string, label: string, level = 0, preventCollapse = false)}
  {@const expanded = cntTreeOpen(key)}
  <button
    type="button"
    class={`tree-heading level-${level}`}
    style={`padding-left: ${level * 1.15}rem`}
    on:click={() => { if (!expanded || !preventCollapse) toggleCntTree(key); }}
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
          <div class="tree-level level-1" transition:slide={{ duration: 500 }}>
            {#each Object.entries(localities) as [locality, types]}
              {@const localityVolumes = Object.values(types).flat()}
              {@const localityKey = `volume-tree:loc:${healthBoard}:${locality}`}
              {@render TreeHeading(localityKey, locality, 1, interactive && hasSelectedVolume(localityVolumes))}
              {#if cntTreeOpen(localityKey)}
                <div class="tree-level level-2" transition:slide={{ duration: 500 }}>
                  {#each Object.entries(types) as [type, items]}
                    {@const typeKey = `volume-tree:type:${healthBoard}:${locality}:${type}`}
                    {@const selectableItems = items.filter((volume) => !volumeIsDestroyed(volume))}
                    {@render TreeHeading(typeKey, type, 2, interactive && hasSelectedVolume(items))}
                    {#if cntTreeOpen(typeKey)}
                      <div transition:slide={{ duration: 500 }}>
                        {#if interactive && selectableItems.length > 1}
                          <div class="select-all-row">
                            <button type="button" class="select-all-button" on:click={() => toggleSelectedVolumes(items)}>
                              {selectableItems.every((volume) => selectedVolumeUuids.includes(volume.uuid)) ? 'Clear all' : 'Select all'}
                            </button>
                          </div>
                        {/if}
                        {#each items as volume}
                          {#if interactive}
                            <div class="volume-row" class:selected={selectedVolumeUuids.includes(volume.uuid)} class:disabled={volumeIsDestroyed(volume)}>
                              <label class="volume-check">
                                <input type="checkbox" disabled={volumeIsDestroyed(volume)} checked={selectedVolumeUuids.includes(volume.uuid)} on:change={() => toggleSelectedVolume(volume.uuid)}>
                                <span class="volume-label" class:disabled={volumeIsDestroyed(volume)}>{volumeLabel(volume)}</span>
                              </label>
                              {@render StatusBadge(volumeStatus(volume), volumeStatusClass(volume))}
                              {@render LocationDisplay(volume.currentLocationUuid, true)}
                              <span class="right"><SmallButton label="Manage" /><SmallButton label="History" action={() => openHistory(volume.uuid)} /></span>
                            </div>
                          {:else}
                            <div class="tree-leaf">{volumeLabel(volume)}</div>
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
    {#each volumeGroups(volumes) as group}
      {@const healthBoardKey = `selected-tree:hb:${group.healthBoard}`}
      {@const localityKey = `selected-tree:loc:${group.healthBoard}:${group.locality}`}
      {@const typeKey = `selected-tree:type:${group.healthBoard}:${group.locality}:${group.type}`}
      <div class="tree-level level-0">
        {@render TreeHeading(healthBoardKey, group.healthBoard, 0)}
        {#if cntTreeOpen(healthBoardKey)}
        <div class="tree-level level-1" transition:slide={{ duration: 500 }}>
          {@render TreeHeading(localityKey, group.locality, 1)}
          {#if cntTreeOpen(localityKey)}
          <div class="tree-level level-2" transition:slide={{ duration: 500 }}>
            {@render TreeHeading(typeKey, group.type, 2)}
            {#if cntTreeOpen(typeKey)}
            <div transition:slide={{ duration: 500 }}>
            {#each group.volumes as volume}
              <div class="tree-leaf">
                <div>{volumeLabel(volume)}</div>
                <div class="received-location">
                  <span class="received-tick" class:visible={received.has(volume.uuid)} aria-hidden="true">&#10003;</span>
                  {@render LocationDisplay(volume.currentLocationUuid, true, true)}
                </div>
              </div>
            {/each}
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
          <td>{@render VolumeTree(selectedVolumes(row.volumeUuids))}</td>
          <td>{row.requiredFor}<br>{formatDate(row.requiredBy)}</td>
          <td>{@render LocationDisplay(row.fromLocationUuid, false, true)}</td>
          <td>{@render LocationDisplay(row.toLocationUuid, false, true)}</td>
          <td>{row.status}</td>
          <td class="right">
            {#if mode === 'outbox'}
              <SmallButton label="Cancel" action={() => cancelRequest(row)} /><SmallButton label="Locator" action={() => { selectedPatientUuid = row.patientUuid; navigate('locator'); }} />
            {:else}
              <SmallButton label="Send" /><SmallButton label="Done" action={() => doneRequest(row)} />
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
    <label>Health board<select value={healthBoardValue} on:change={(event) => setFilterValue(useLocationFilter, 'healthBoard', selectValue(event))}><option value="">All</option>{#each healthBoards() as option}<option>{option}</option>{/each}</select></label>
    <label>Locality<select value={localityValue} on:change={(event) => setFilterValue(useLocationFilter, 'locality', selectValue(event))}><option value="">All</option>{#each localities(healthBoardValue) as option}<option>{option}</option>{/each}</select></label>
    <label>Facility<select value={facilityValue} on:change={(event) => setFilterValue(useLocationFilter, 'facility', selectValue(event))}><option value="">All</option>{#each facilities(healthBoardValue, localityValue) as option}<option>{option}</option>{/each}</select></label>
  </fieldset>
{/snippet}
