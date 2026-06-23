import React from 'react';
import { fbAddressograph as FbAddressograph } from '../components/fbAddressograph';
import { fbBoxedInfo as FbBoxedInfo } from '../components/fbBoxedMessage';
import { fbButton as FbButton } from '../components/fbButton';
import { fbAddButtonForPage as FbAddButtonForPage } from '../components/fbAddButtonForPage';
import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbDateExact as FbExactDate } from '../components/fbDateExact';
import { fbDateDisplay as FbDateDisplay } from '../components/fbDateDisplay';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import { fbGroup as FbGroup } from '../components/fbGroup';
import { fbNumberInput as FbNumberInput } from '../components/fbNumberInput';
import { fbModal as FbModal } from '../components/fbModal';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbRadio as FbRadio } from '../components/fbRadio';
import { fbTextArea as FbTextArea } from '../components/fbTextArea';
import { fbTextInput as FbTextInput } from '../components/fbTextInput';
import { fbTimeDisplay as FbTimeDisplay } from '../components/fbTimeDisplay';
import {
  fbTable as FbTable,
  fbTableBody as FbTableBody,
  fbTableHeader as FbTableHeader,
  fbTableHeaderCell as FbTableHeaderCell,
  fbTableRow as FbTableRow,
} from '../components/fbTable';
import { fbTableCell as FbTableCell } from '../components/fbTableCell';
import { fbUserName as FbUserName } from '../components/fbUserName';
import { formDateToIsoDate, formatFormDate as formatFormInputDate } from '../utils/dateFormat';
import {
  clearSessionUserUuid,
  CntBatch,
  CntClinicInstance,
  CntRequest,
  CntPatient,
  CntStore,
  CntUser,
  CntVolume,
  getSessionUserUuid,
  loadCntStore,
  locationLabel,
  loginMaintenance,
  patientName,
  resolveIdentifier,
  saveCntStore,
  setSessionUserUuid,
  uuid,
} from './cntStore';
import { fbBlue, fbGreen, fbLightBlue, fbOrange, fbRed } from './cntStyles';
import { FbGroupWithBorder } from './fbGroupWithBorder';
import { FbcntHeader } from './fbcntHeader';
import { FbcntHeaderForUser } from './fbcntHeaderForUser';
import { FbcntFromLocation, FbcntLocation, FbcntToLocation } from './fbcntLocation';
import { FbcntScan } from './fbcntScan';
import { FbcntSelectedVolumes, FbcntSelectedVolumesLocation } from './fbcntSelectedVolumes';
import { FbcntModalPicklistReceived } from './fbcntModalPicklistReceived';
import { FbcntModalReturnListSend } from './fbcntModalReturnListSend';
import { FbcntSmallButton } from './fbcntSmallButton';
import { FbcntPageAdmin } from './fbcntPageAdmin';
import { FbcntPageBatch } from './fbcntPageBatch';
import { FbcntModalBatchSelected } from './fbcntModalBatchSelected';
import { FbcntPageCreateBatch } from './fbcntPageCreateBatch';
import { FbcntPageFindBatch } from './fbcntPageFindBatch';
import { FbcntPageHistory } from './fbcntPageHistory';
import { FbcntPageHome } from './fbcntPageHome';
import { FbcntPageLibraries } from './fbcntPageLibraries';
import { FbcntPageLocator } from './fbcntPageLocator';
import { FbcntModalMovement } from './fbcntModalMovement';
import { FbcntPageManageVolume } from './fbcntPageManageVolume';
import { FbcntPageMyBatches } from './fbcntPageMyBatches';
import { FbcntPageMyClinics } from './fbcntPageMyClinics';
import { FbcntPagePicklist } from './fbcntPagePicklist';
import { FbcntPagePreferences } from './fbcntPagePreferences';
import { FbcntPageRegisterVolume } from './fbcntPageRegisterVolume';
import {
  fbcntVolumePatchFromValue,
  fbcntVolumeValueFromVolume,
  validateFbcntManageVolumeValue,
  type FbcntManageVolumeValue,
} from './fbcntManageVolume';
import { FbcntPageRequest } from './fbcntPageRequest';
import { FbcntPageRequestPatient } from './fbcntPageRequestPatient';
import { FbcntPageRequests } from './fbcntPageRequests';
import { FbcntPageReturnList } from './fbcntPageReturnList';
import { FbcntPageSelectClinics } from './fbcntPageSelectClinics';
import { FbcntPageSelector } from './fbcntPageSelector';
import { FbcntPageTags } from './fbcntPageTags';
import { FbcntPageClinicDates } from './fbcntPageClinicDates';
import { FbcntPageAllClinics } from './fbcntPageAllClinics';
import { FbcntPageClinicList } from './fbcntPageClinicList';
import { FbcntPageClinicSchedule } from './fbcntPageClinicSchedule';
import { FbcntPageLocations } from './fbcntPageLocations';
import { FbcntLocationDisplay } from './fbcntLocationDisplay';
import {
  clearCntNavigationStack,
  consumeCntNavigationPopState,
  cntHomeEntry,
  formBuilderHomeEntry,
  popCntNavigation,
  pushCntNavigation,
  readCntNavigationStack,
  writeCntNavigationStack,
} from './cntNavigation';

type View =
  | 'home'
  | 'locator'
  | 'history'
  | 'send'
  | 'receive'
  | 'batch'
  | 'tags'
  | 'requests'
  | 'inbox'
  | 'request'
  | 'requestPatient'
  | 'requestSelector'
  | 'returnList'
  | 'clinics'
  | 'myClinics'
  | 'selectClinics'
  | 'clinicSchedule'
  | 'clinicDates'
  | 'allClinics'
  | 'clinicList'
  | 'allLocations'
  | 'locations'
  | 'admin'
  | 'preferences'
  | 'selector'
  | 'addVolume'
  | 'manageVolume'
  | 'batchDetail'
  | 'findBatch'
  | 'createBatch';

type TitleSpec = {
  kicker: string;
  title: string;
  details?: React.ReactNode;
  titleStyle?: React.CSSProperties;
  detailsStyle?: React.CSSProperties;
};

const patientSearchUrl = () => {
  return '/formBuilder2/index.html#/patient-search';
};

type CntBookmarkRoute =
  | { kind: 'home'; clearHash: boolean }
  | { kind: 'locator'; patientUuid: string; clearHash: false };

function readCntBookmarkRoute(): CntBookmarkRoute | null {
  if (typeof window === 'undefined') return null;
  const rawHash = window.location.hash.replace(/^#\/?/, '');
  if (!rawHash) return null;
  const [rawPath, queryText = ''] = rawHash.split('?');
  const parts = rawPath.split('/').filter(Boolean);
  if (parts[0] !== 'cnt') return null;
  const route = parts[1] || 'home';
  const params = new URLSearchParams(queryText);
  if (route === 'home') return { kind: 'home', clearHash: false };
  if (route === 'locator') {
    const patientUuid = params.get('patientUuid') || '';
    if (patientUuid) return { kind: 'locator', patientUuid, clearHash: false };
  }
  return { kind: 'home', clearHash: true };
}

function clearCntBookmarkHash() {
  const href = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(window.history.state, '', href);
}

type CaseNoteTrackerProps = {
  inline?: boolean;
  initialPatientUuid?: string;
  initialPatient?: CntPatient;
  onBack?: () => void;
};

export default function CaseNoteTracker({ inline = false, initialPatientUuid = '', initialPatient, onBack }: CaseNoteTrackerProps = {}) {
  const [store, setStore] = React.useState<CntStore>(() => loadCntStore());
  const [userUuid, setUserUuid] = React.useState<string>(() => getSessionUserUuid());
  const [view, setView] = React.useState<View>('home');
  const [movementPopup, setMovementPopup] = React.useState<'send' | 'receive' | null>(null);
  const [pickListReceivePopupOpen, setPickListReceivePopupOpen] = React.useState(false);
  const [returnListSendPopup, setReturnListSendPopup] = React.useState<{ patientUuid: string; volumeUuids: string[]; locationUuid: string } | null>(null);
  const [identifier, setIdentifier] = React.useState('');
  const [selectedPatientUuid, setSelectedPatientUuid] = React.useState('');
  const [selectedVolumeUuids, setSelectedVolumeUuids] = React.useState<string[]>([]);
  const [managedVolumeUuid, setManagedVolumeUuid] = React.useState('');
  const [managedVolumeDraft, setManagedVolumeDraft] = React.useState<FbcntManageVolumeValue | null>(null);
  const [selectedClinicInstanceUuid, setSelectedClinicInstanceUuid] = React.useState('');
  const [selectedClinicUuid, setSelectedClinicUuid] = React.useState('');
  const [receivePickListVolumeUuids, setReceivePickListVolumeUuids] = React.useState<string[]>([]);
  const [returnListSendVolumeUuids, setReturnListSendVolumeUuids] = React.useState<string[]>([]);
  const [preferencesReturnView, setPreferencesReturnView] = React.useState<View>('home');
  const [preferenceHealthBoard, setPreferenceHealthBoard] = React.useState('');
  const [preferenceLocality, setPreferenceLocality] = React.useState('');
  const [preferenceFacility, setPreferenceFacility] = React.useState('');
  const [sendSourceUuid, setSendSourceUuid] = React.useState('');
  const [sendDestinationUuid, setSendDestinationUuid] = React.useState('');
  const [receiveSourceUuid, setReceiveSourceUuid] = React.useState('');
  const [receiveDestinationUuid, setReceiveDestinationUuid] = React.useState('');
  const [addVolumeCreatedDate, setAddVolumeCreatedDate] = React.useState(() => formatFormInputDate(new Date()));
  const [addVolumeHealthBoard, setAddVolumeHealthBoard] = React.useState('');
  const [addVolumeLocality, setAddVolumeLocality] = React.useState('');
  const [addVolumeType, setAddVolumeType] = React.useState('General');
  const [addVolumeStatus, setAddVolumeStatus] = React.useState<'Permanent' | 'Temporary'>('Permanent');
  const [addVolumeRecordStatus, setAddVolumeRecordStatus] = React.useState<'active' | 'closed' | 'destroyed'>('active');
  const [addVolumeNumber, setAddVolumeNumber] = React.useState('');
  const [addVolumeDateClosed, setAddVolumeDateClosed] = React.useState('');
  const [addVolumeDateDestroyed, setAddVolumeDateDestroyed] = React.useState('');
  const [addVolumeReasonDestroyed, setAddVolumeReasonDestroyed] = React.useState('');
  const [addVolumeLocationUuid, setAddVolumeLocationUuid] = React.useState('');
  const [addVolumeBarcode, setAddVolumeBarcode] = React.useState('');
  const [addVolumeRfid, setAddVolumeRfid] = React.useState('');
  const [addVolumeBatchUuid, setAddVolumeBatchUuid] = React.useState('');
  const [createBatchPurpose, setCreateBatchPurpose] = React.useState('Clinic preparation');
  const [createBatchCurrentLocationUuid, setCreateBatchCurrentLocationUuid] = React.useState('');
  const [createBatchDestinationUuid, setCreateBatchDestinationUuid] = React.useState('');
  const [createBatchBarcode, setCreateBatchBarcode] = React.useState('');
  const [selectedBatchUuid, setSelectedBatchUuid] = React.useState('');
  const [findBatchFilter, setFindBatchFilter] = React.useState({
    healthBoard: '',
    locality: '',
    facility: '',
    purpose: '',
  });
  const [batchSelectedPopupOpen, setBatchSelectedPopupOpen] = React.useState(false);
  const [batchDetailAddPopupOpen, setBatchDetailAddPopupOpen] = React.useState(false);
  const [requestPatientUuid, setRequestPatientUuid] = React.useState('');
  const [requestVolumeUuids, setRequestVolumeUuids] = React.useState<string[]>([]);
  const [requestRequiredFor, setRequestRequiredFor] = React.useState('');
  const [requestFromLocationUuid, setRequestFromLocationUuid] = React.useState('');
  const [requestToLocationUuid, setRequestToLocationUuid] = React.useState('');
  const [removedReturnPatientUuids, setRemovedReturnPatientUuids] = React.useState<string[]>([]);
  const [tagSelectedPopupOpen, setTagSelectedPopupOpen] = React.useState(false);
  const [tagPurpose, setTagPurpose] = React.useState('');
  const [tagLocationUuid, setTagLocationUuid] = React.useState('');
  const [addLibraryPopupOpen, setAddLibraryPopupOpen] = React.useState(false);
  const [addLibraryLocationUuid, setAddLibraryLocationUuid] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [offlineModalOpen, setOfflineModalOpen] = React.useState(!navigator.onLine);
  const [scannerMessage, setScannerMessage] = React.useState('');
  const [returnTo, setReturnTo] = React.useState('');
  const [confirmStopClinicInstanceUuid, setConfirmStopClinicInstanceUuid] = React.useState('');
  const [selectedClinicInstanceUuids, setSelectedClinicInstanceUuids] = React.useState<string[]>([]);
  const [clinicFilter, setClinicFilter] = React.useState({
    healthBoard: '',
    locality: '',
    facility: '',
    speciality: '',
  });
  const [systemClinicFilter, setSystemClinicFilter] = React.useState({
    healthBoard: '',
    locality: '',
    facility: '',
    speciality: '',
  });
  const [systemLocationFilter, setSystemLocationFilter] = React.useState({
    healthBoard: '',
    locality: '',
    facility: '',
  });
  const [includeRetrievedPicklistPatients, setIncludeRetrievedPicklistPatients] = React.useState(false);
  const [showRescheduledClinicAppointments, setShowRescheduledClinicAppointments] = React.useState(false);
  const [showCancelledClinicAppointments, setShowCancelledClinicAppointments] = React.useState(false);
  const mainRef = React.useRef<HTMLElement | null>(null);
  const scrollPositions = React.useRef<Partial<Record<View, number>>>({});
  const bookmarkRouteAppliedRef = React.useRef(false);

  const user = store.users.find((item) => item.uuid === userUuid) || null;
  const selectedPatient = store.patients.find((patient) => patient.uuid === selectedPatientUuid) || null;
  const selectedVolumes = store.volumes.filter((volume) => selectedVolumeUuids.includes(volume.uuid));

  const showError = React.useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('forceLogin') === '1') {
      clearSessionUserUuid();
      setUserUuid('');
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    const queryReturnTo = query.get('returnTo') || '';
    setReturnTo(queryReturnTo);
    const loginAs = query.get('loginAs');
    if (loginAs && getSessionUserUuid() !== loginAs) {
      handleLogin(loginAs, false);
    }
    const restoreJson = sessionStorage.getItem('fbcntRestoreState');
    if (restoreJson) {
      sessionStorage.removeItem('fbcntRestoreState');
      try {
        const restore = JSON.parse(restoreJson) as { view?: View; selectedClinicInstanceUuid?: string };
        if (restore.selectedClinicInstanceUuid) {
          setSelectedClinicInstanceUuid(restore.selectedClinicInstanceUuid);
        }
        if (restore.view) {
          setView(restore.view);
          return;
        }
      } catch {
        // Ignore stale restore payloads.
      }
    }
    if (!bookmarkRouteAppliedRef.current) {
      bookmarkRouteAppliedRef.current = true;
      const bookmarkRoute = readCntBookmarkRoute();
      if (bookmarkRoute?.clearHash) clearCntBookmarkHash();
      if (bookmarkRoute?.kind === 'home') {
        setView('home');
        return;
      }
      if (bookmarkRoute?.kind === 'locator') {
        const patientExists = store.patients.some((patient) => patient.uuid === bookmarkRoute.patientUuid);
        if (patientExists) {
          setSelectedPatientUuid(bookmarkRoute.patientUuid);
          setSelectedVolumeUuids([]);
          setView('locator');
          return;
        }
        clearCntBookmarkHash();
        setView('home');
        return;
      }
    }
    const patientUuid = initialPatient?.uuid || initialPatientUuid || query.get('patientUuid');
    if (patientUuid && !store.patients.some((patient) => patient.uuid === patientUuid)) {
      const next = ensurePatientInStore(store, initialPatient || fallbackPatient(patientUuid));
      persist(next);
      return;
    }
    if (patientUuid && selectedPatientUuid !== patientUuid && store.patients.some((patient) => patient.uuid === patientUuid)) {
      setSelectedPatientUuid(patientUuid);
      setSelectedVolumeUuids([]);
      setView('locator');
    }
  }, [initialPatientUuid, initialPatient, selectedPatientUuid, store, store.patients, store.volumes]);

  React.useEffect(() => {
    const updateOnline = () => setOfflineModalOpen(!navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      scrollPositions.current[view] = mainRef.current?.scrollTop || 0;
      const entry = consumeCntNavigationPopState(event.state);
      if (entry?.kind === 'cnt-view' && entry.view) {
        setView(entry.view as View);
        return;
      }
      if (inline && onBack && (!entry || entry.kind === 'inline-patient-search' || entry.kind === 'inline-patient-registry')) {
        onBack();
        return;
      }
      if (entry?.kind === 'url' && entry.url) {
        window.location.href = entry.url;
        return;
      }
      if (!inline) setView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inline, onBack, view]);

  React.useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    main.scrollTop = scrollPositions.current[view] || 0;
  }, [view]);

  const persist = (next: CntStore) => {
    setStore(next);
    saveCntStore(next);
  };

  const preferenceSelectionForUser = (nextStore: CntStore, uuidValue: string) => {
    const pref = nextStore.preferences[uuidValue] || {};
    const userForPrefs = nextStore.users.find((candidate) => candidate.uuid === uuidValue);
    const defaultLocation = nextStore.locations.find((location) => location.facility === userForPrefs?.facility) || nextStore.locations[0];
    return {
      healthBoard: pref.healthBoard || defaultLocation?.healthBoard || '',
      locality: pref.locality || defaultLocation?.locality || '',
      facility: pref.facility || defaultLocation?.facility || '',
    };
  };

  const loadPreferenceFields = (nextStore: CntStore, uuidValue: string) => {
    const selection = preferenceSelectionForUser(nextStore, uuidValue);
    setPreferenceHealthBoard(selection.healthBoard);
    setPreferenceLocality(selection.locality);
    setPreferenceFacility(selection.facility);
    setSystemClinicFilter({ ...selection, speciality: '' });
    setSystemLocationFilter(selection);
  };

  const updatePreferredFilter = (nextFilter: { healthBoard: string; locality: string; facility: string }) => {
    if (!user) return;
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...(store.preferences[user.uuid] || {}),
          healthBoard: nextFilter.healthBoard,
          locality: nextFilter.locality,
          facility: nextFilter.facility,
        },
      },
    });
  };

  const setSystemClinicFilterAndPreferences = (nextFilter: typeof systemClinicFilter) => {
    setSystemClinicFilter(nextFilter);
    setSystemLocationFilter({
      healthBoard: nextFilter.healthBoard,
      locality: nextFilter.locality,
      facility: nextFilter.facility,
    });
    updatePreferredFilter(nextFilter);
  };

  const setSystemLocationFilterAndPreferences = (nextFilter: typeof systemLocationFilter) => {
    setSystemLocationFilter(nextFilter);
    setSystemClinicFilter((current) => ({ ...current, ...nextFilter }));
    updatePreferredFilter(nextFilter);
  };

  const initialiseSystemFilters = () => {
    if (!user) return;
    const selection = preferenceSelectionForUser(store, user.uuid);
    setSystemClinicFilter((current) => ({ ...selection, speciality: current.speciality || '' }));
    setSystemLocationFilter(selection);
  };

  const handleLogin = (uuidValue: string, switchToHome = true) => {
    setSessionUserUuid(uuidValue);
    setUserUuid(uuidValue);
    const next = loginMaintenance(store, uuidValue);
    setStore(next);
    const pref = next.preferences[uuidValue] || {};
    const defaultLocation = pref.sendLocationUuid || next.locations[0]?.uuid || '';
    setSendSourceUuid(defaultLocation);
    setReceiveDestinationUuid(defaultLocation);
    loadPreferenceFields(next, uuidValue);
    if (switchToHome) {
      setPreferencesReturnView('home');
      setView('preferences');
    }
  };

  const savePreferences = () => {
    if (!user) return;
    const fallback = preferenceSelectionForUser(store, user.uuid);
    const selectedHealthBoard = preferenceHealthBoard || fallback.healthBoard;
    const selectedLocality = preferenceLocality || fallback.locality;
    const selectedFacility = preferenceFacility || fallback.facility;
    setPreferenceHealthBoard(selectedHealthBoard);
    setPreferenceLocality(selectedLocality);
    setPreferenceFacility(selectedFacility);
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...(store.preferences[user.uuid] || {}),
          healthBoard: selectedHealthBoard,
          locality: selectedLocality,
          facility: selectedFacility,
        },
      },
    });
    setView(preferencesReturnView);
  };

  const handleLogout = () => {
    clearSessionUserUuid();
    clearCntNavigationStack();
    writeCntNavigationStack([formBuilderHomeEntry()]);
    setUserUuid('');
    setView('home');
  };

  const goBack = () => {
    scrollPositions.current[view] = mainRef.current?.scrollTop || 0;
    if (readCntNavigationStack().length > 0) {
      window.history.back();
      return;
    }
    const entry = popCntNavigation();
    if (entry?.kind === 'cnt-view' && entry.view) {
      setView(entry.view as View);
      return;
    }
    if (inline && onBack && (!entry || entry.kind === 'inline-patient-search' || entry.kind === 'inline-patient-registry')) {
      onBack();
      return;
    }
    if (entry?.kind === 'url' && entry.url) {
      window.location.href = entry.url;
      return;
    }
    if (returnTo) {
      window.location.href = returnTo;
      return;
    }
    setView('home');
  };

  const navigateToView = (nextView: View) => {
    scrollPositions.current[view] = mainRef.current?.scrollTop || 0;
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes, selectedBatchUuid).title, view });
    if (nextView === 'clinicSchedule' || nextView === 'allClinics' || nextView === 'allLocations') {
      initialiseSystemFilters();
    }
    setView(nextView);
  };

  const openPatientLocator = (patientUuid: string, originView = view) => {
    scrollPositions.current[originView] = mainRef.current?.scrollTop || 0;
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(originView, store, selectedVolumes).title, view: originView });
    setSelectedPatientUuid(patientUuid);
    setSelectedVolumeUuids([]);
    setView('locator');
  };

  const openIdentifier = () => {
    const result = resolveIdentifier(store, identifier);
    if (result.kind === 'patient') {
      pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
      setSelectedPatientUuid(result.patient.uuid);
      setSelectedVolumeUuids([]);
      setView('locator');
      return;
    }
    if (result.kind === 'volume') {
      pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
      setSelectedPatientUuid(result.volume.patientUuid);
      setSelectedVolumeUuids([result.volume.uuid]);
      setView('history');
      return;
    }
    if (result.kind === 'batch') {
      setSelectedVolumeUuids(result.batch.volumeUuids);
      setSelectedBatchUuid(result.batch.uuid);
      setView('batchDetail');
      return;
    }
    if (result.kind === 'location') {
      setSendDestinationUuid(result.location.uuid);
      setReceiveDestinationUuid(result.location.uuid);
      return;
    }
    showError(result.kind === 'empty' ? 'Enter or scan an identifier' : 'Identifier not found');
  };

  const openRandomPatientLocator = () => {
    const patient = store.patients[Math.floor(Math.random() * store.patients.length)];
    if (!patient) return;
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    setSelectedPatientUuid(patient.uuid);
    setSelectedVolumeUuids([]);
    setView('locator');
  };

  const openRandomVolumeLocator = () => {
    const volume = store.volumes[Math.floor(Math.random() * store.volumes.length)];
    if (!volume) return;
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    setSelectedPatientUuid(volume.patientUuid);
    setSelectedVolumeUuids([volume.uuid]);
    setView('locator');
  };

  const openRandomBatch = () => {
    const shuffledVolumes = [...store.volumes].sort(() => Math.random() - 0.5);
    const volumeUuids = shuffledVolumes.slice(0, Math.min(4, Math.max(1, shuffledVolumes.length))).map((volume) => volume.uuid);
    const firstVolume = store.volumes.find((volume) => volume.uuid === volumeUuids[0]);
    const currentLocationUuid = firstVolume?.currentLocationUuid || store.locations[0]?.uuid || '';
    const intendedDestinationUuid = user
      ? store.locations.find((location) => location.facility === user.facility)?.uuid || currentLocationUuid
      : currentLocationUuid;
    const batch: CntBatch = {
      uuid: uuid(`batch-scan-${Date.now()}-${Math.random()}`),
      barcode: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      currentLocationUuid,
      intendedPurpose: 'Simulated batch scan',
      intendedDestinationUuid,
      volumeUuids,
    };
    const nextStore: CntStore = {
      ...store,
      batches: [...store.batches, batch],
      volumes: store.volumes.map((volume) =>
        volumeUuids.includes(volume.uuid) ? { ...volume, batchUuid: batch.uuid } : volume
      ),
      preferences: user
        ? {
          ...store.preferences,
          [user.uuid]: {
            ...(store.preferences[user.uuid] || {}),
            batchUuids: uniqueValues([...(store.preferences[user.uuid]?.batchUuids || []), batch.uuid]),
          },
        }
        : store.preferences,
    };
    persist(nextStore);
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, nextStore, selectedVolumes).title, view });
    setSelectedBatchUuid(batch.uuid);
    setSelectedVolumeUuids(batch.volumeUuids);
    setView('batchDetail');
  };

  const toggleVolume = (volumeUuid: string) => {
    const volume = store.volumes.find((item) => item.uuid === volumeUuid);
    if (volume?.status === 'destroyed') {
      setSelectedVolumeUuids((current) => current.filter((item) => item !== volumeUuid));
      return;
    }
    setSelectedVolumeUuids((current) =>
      current.includes(volumeUuid)
        ? current.filter((item) => item !== volumeUuid)
        : [...current, volumeUuid]
    );
  };

  const openManageVolume = (volumeUuid: string) => {
    const volume = store.volumes.find((item) => item.uuid === volumeUuid);
    if (!volume) return;
    pushCntNavigation({ kind: 'cnt-view', label: 'Case notes locator', view: 'locator' });
    setManagedVolumeUuid(volumeUuid);
    setManagedVolumeDraft(fbcntVolumeValueFromVolume(volume));
    setView('manageVolume');
  };

  const updateManagedVolume = (volumeUuid: string, patch: Partial<CntVolume>) => {
    persist({
      ...store,
      volumes: store.volumes.map((volume) => volume.uuid === volumeUuid ? { ...volume, ...patch } : volume),
    });
    if (patch.status === 'destroyed') {
      setSelectedVolumeUuids((current) => current.filter((uuidValue) => uuidValue !== volumeUuid));
    }
  };

  const saveManagedVolume = () => {
    if (!managedVolumeUuid || !managedVolumeDraft) return;
    const validationMessage = validateFbcntManageVolumeValue(managedVolumeDraft);
    if (validationMessage) {
      showError(validationMessage);
      return;
    }
    const volume = store.volumes.find((item) => item.uuid === managedVolumeUuid);
    if (!volume) return;
    const patch = fbcntVolumePatchFromValue(managedVolumeDraft, volume);
    const shouldRecordUnclosed = volume.status === 'closed' && patch.status === 'active';
    const shouldRecordUndestroyed = volume.status === 'destroyed' && patch.status === 'active';
    const shouldRecordMerged = volume.status !== 'closed' && patch.status === 'closed';
    const mergeTargetVolume = managedVolumeDraft.mergedIntoVolumeUuid
      ? store.volumes.find((item) => item.uuid === managedVolumeDraft.mergedIntoVolumeUuid)
      : undefined;
    const mergeTargetLabel = mergeTargetVolume
      ? `${mergeTargetVolume.temporary ? 'Temporary volume' : 'Volume'} ${mergeTargetVolume.volumeNumber} - ${mergeTargetVolume.healthBoard} / ${mergeTargetVolume.locality} / ${mergeTargetVolume.type}`
      : managedVolumeDraft.mergedIntoVolumeUuid;
    const historyPatch: Partial<CntVolume> = shouldRecordMerged
      ? {
        events: [
          ...volume.events,
          {
            uuid: uuid(`${volume.uuid}-merged-${Date.now()}`),
            kind: 'merged',
            datetime: new Date().toISOString(),
            fromLocationUuid: volume.currentLocationUuid,
            toLocationUuid: patch.currentLocationUuid || volume.currentLocationUuid,
            targetVolumeUuid: managedVolumeDraft.mergedIntoVolumeUuid,
            userUuid,
            note: `Merged into ${mergeTargetLabel}`,
          },
        ],
      }
      : shouldRecordUnclosed || shouldRecordUndestroyed
      ? {
        events: [
          ...volume.events,
          {
            uuid: uuid(`${volume.uuid}-${shouldRecordUnclosed ? 'unclosed' : 'undestroyed'}-${Date.now()}`),
            kind: shouldRecordUnclosed ? 'unclosed' : 'undestroyed',
            datetime: new Date().toISOString(),
            fromLocationUuid: volume.currentLocationUuid,
            toLocationUuid: patch.currentLocationUuid || volume.currentLocationUuid,
            userUuid,
            note: shouldRecordUnclosed ? 'Volume un-closed in Manage volume' : 'Volume undestroyed in Manage volume',
          },
        ],
      }
      : {};
    updateManagedVolume(managedVolumeUuid, { ...patch, ...historyPatch });
    goBack();
  };

  const sendSelected = () => {
    if (!user || selectedVolumeUuids.length === 0 || !sendSourceUuid || !sendDestinationUuid) {
      showError('Select volumes, source and destination before sending.');
      return;
    }
    const now = new Date().toISOString();
    const next: CntStore = {
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...(store.preferences[user.uuid] || {}),
          sendLocationUuid: sendSourceUuid,
        },
      },
      volumes: store.volumes.map((volume) => {
        if (!selectedVolumeUuids.includes(volume.uuid)) return volume;
        return {
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
        };
      }),
    };
    persist(next);
    setMovementPopup(null);
  };

  const receiveSelected = () => {
    if (!user || selectedVolumeUuids.length === 0 || !receiveDestinationUuid) {
      showError('Select volumes and receiving location before receiving.');
      return;
    }
    const now = new Date().toISOString();
    const next: CntStore = {
      ...store,
      volumes: store.volumes.map((volume) => {
        if (!selectedVolumeUuids.includes(volume.uuid)) return volume;
        const latestSend = [...volume.events].reverse().find((event) => event.kind === 'sent');
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
    persist(next);
    setMovementPopup(null);
  };

  const addVolume = () => {
    if (!user || !selectedPatientUuid || !addVolumeLocationUuid) {
      showError('Select a patient and location before registering a volume.');
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
      showError(validationMessage);
      return;
    }
    const location = store.locations.find((item) => item.uuid === addVolumeLocationUuid) || store.locations[0];
    const patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
    if (!location || !patient) return;
    const healthBoard = addVolumeHealthBoard || location.healthBoard;
    const locality = addVolumeLocality || location.locality;
    const temporary = addVolumeStatus === 'Temporary';
    const matchingVolumes = store.volumes.filter((volume) =>
      volume.patientUuid === selectedPatientUuid
      && volume.healthBoard === healthBoard
      && volume.locality === locality
      && volume.type === addVolumeType
    );
    const nextNumber = matchingVolumes.reduce((max, volume) => Math.max(max, volume.volumeNumber), 0) + 1;
    const requestedVolumeNumber = Number(addVolumeNumber);
    const volumeNumber = !temporary && Number.isFinite(requestedVolumeNumber) && requestedVolumeNumber > 0
      ? requestedVolumeNumber
      : nextNumber;
    const createdIsoDate = formDateToIsoDate(addVolumeCreatedDate);
    const eventDatetime = createdIsoDate ? `${createdIsoDate}T12:00:00.000Z` : new Date().toISOString();
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
      dateClosed: addVolumeDateClosed || undefined,
      dateDestroyed: addVolumeDateDestroyed || undefined,
      reasonDestroyed: addVolumeReasonDestroyed.trim() || undefined,
      currentLocationUuid: location.uuid,
      batchUuid: addVolumeBatchUuid.trim() || undefined,
      events: [{
        uuid: uuid(`${newVolumeUuid}-created-${operationStamp}`),
        kind: 'created',
        datetime: eventDatetime,
        toLocationUuid: location.uuid,
        userUuid: user.uuid,
        note: 'Added by Case note tracker',
      }],
    };
    const currentPreferences = store.preferences[user.uuid] || {};
    persist({
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
    });
    setSelectedVolumeUuids(addVolumeRecordStatus === 'destroyed' ? [] : [newVolumeUuid]);
    setView('locator');
  };

  const openAddVolumePopup = () => {
    if (!user) return;
    const userPreferences = store.preferences[user.uuid]?.recentChoices || {};
    const preferredLocationUuid = userPreferences.addVolumeInitialLocationUuid?.[0]
      || selectedVolumes[0]?.currentLocationUuid
      || store.locations.find((location) => location.facility === user.facility)?.uuid
      || store.locations[0]?.uuid
      || '';
    const preferredLocation = store.locations.find((location) => location.uuid === preferredLocationUuid) || store.locations[0];
    const preferredHealthBoard = userPreferences.addVolumeHealthBoard?.[0] || preferredLocation?.healthBoard || '';
    const preferredLocality = userPreferences.addVolumeLocality?.[0] || preferredLocation?.locality || '';
    const preferredType = userPreferences.addVolumeType?.[0] || 'General';
    const nextNumber = nextVolumeNumber(store, selectedPatientUuid, preferredHealthBoard, preferredLocality, preferredType);
    setAddVolumeCreatedDate(formatFormInputDate(new Date()));
    setAddVolumeHealthBoard(preferredHealthBoard);
    setAddVolumeLocality(preferredLocality);
    setAddVolumeType(preferredType);
    setAddVolumeStatus('Permanent');
    setAddVolumeRecordStatus('active');
    setAddVolumeNumber(String(nextNumber));
    setAddVolumeDateClosed('');
    setAddVolumeDateDestroyed('');
    setAddVolumeReasonDestroyed('');
    setAddVolumeLocationUuid(preferredLocationUuid);
    setAddVolumeBarcode('');
    setAddVolumeRfid('');
    setAddVolumeBatchUuid('');
    pushCntNavigation({ kind: 'cnt-view', label: 'Case notes locator', view: 'locator' });
    setView('addVolume');
  };

  const openCreateBatch = () => {
    const defaultLocation = selectedVolumes[0]?.currentLocationUuid
      || (user ? store.locations.find((location) => location.facility === user.facility)?.uuid : '')
      || store.locations[0]?.uuid
      || '';
    setCreateBatchPurpose('Clinic preparation');
    setCreateBatchCurrentLocationUuid(defaultLocation);
    setCreateBatchDestinationUuid(defaultLocation);
    setCreateBatchBarcode('');
    navigateToView('createBatch');
  };

  const createBatch = () => {
    if (!user || !createBatchCurrentLocationUuid || !createBatchDestinationUuid) {
      showError('Select a current location and intended destination before creating a batch.');
      return;
    }
    const batchUuid = uuid(`batch-${Date.now()}`);
    const batch: CntBatch = {
      uuid: batchUuid,
      barcode: createBatchBarcode.trim() || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      currentLocationUuid: createBatchCurrentLocationUuid,
      intendedPurpose: createBatchPurpose.trim() || 'Clinic preparation',
      intendedDestinationUuid: createBatchDestinationUuid,
      volumeUuids: [],
    };
    const currentPreferences = store.preferences[user.uuid] || {};
    persist({
      ...store,
      batches: [...store.batches, batch],
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...currentPreferences,
          batchUuids: uniqueValues([...(currentPreferences.batchUuids || []), batch.uuid]),
        },
      },
    });
    setSelectedBatchUuid(batch.uuid);
    setView('batchDetail');
  };

  const openFindBatch = () => {
    setFindBatchFilter({ healthBoard: '', locality: '', facility: '', purpose: '' });
    navigateToView('findBatch');
  };

  const openBatch = (batchUuid: string) => {
    setSelectedBatchUuid(batchUuid);
    pushCntNavigation({ kind: 'cnt-view', label: 'Batches', view: 'batch' });
    setView('batchDetail');
  };

  const removeVolumeFromBatch = (batchUuid: string, volumeUuid: string) => {
    const batch = store.batches.find((item) => item.uuid === batchUuid);
    persist({
      ...store,
      batches: store.batches.map((item) =>
        item.uuid === batchUuid
          ? { ...item, volumeUuids: item.volumeUuids.filter((uuidValue) => uuidValue !== volumeUuid) }
          : item
      ),
      volumes: store.volumes.map((volume) =>
        volume.uuid === volumeUuid
          ? { ...volume, batchUuid: undefined, currentLocationUuid: batch?.currentLocationUuid || volume.currentLocationUuid }
          : volume
      ),
    });
  };

  const addBatchFavourite = (batchUuid: string) => {
    if (!user) return;
    const currentPreferences = store.preferences[user.uuid] || {};
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...currentPreferences,
          batchUuids: uniqueValues([...(currentPreferences.batchUuids || []), batchUuid]),
        },
      },
    });
    setView('batch');
  };

  const removeBatchFavourite = (batchUuid: string) => {
    if (!user) return;
    const currentPreferences = store.preferences[user.uuid] || {};
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...currentPreferences,
          batchUuids: (currentPreferences.batchUuids || []).filter((uuidValue) => uuidValue !== batchUuid),
        },
      },
    });
  };

  const addSelectedVolumesToBatch = (batchUuid: string) => {
    if (!selectedVolumeUuids.length) {
      setBatchSelectedPopupOpen(false);
      return;
    }
    const selectedSet = new Set(selectedVolumeUuids);
    persist({
      ...store,
      batches: store.batches.map((batch) =>
        batch.uuid === batchUuid
          ? { ...batch, volumeUuids: uniqueValues([...batch.volumeUuids, ...selectedVolumeUuids]) }
          : batch
      ),
      volumes: store.volumes.map((volume) =>
        selectedSet.has(volume.uuid) ? { ...volume, batchUuid } : volume
      ),
    });
    setBatchSelectedPopupOpen(false);
  };

  const openTagSelectedPopup = () => {
    if (!user || !selectedVolumeUuids.length) return;
    const due = new Date();
    due.setDate(due.getDate() + 7);
    setTagPurpose('Retrieve request');
    setTagLocationUuid(selectedVolumes[0]?.currentLocationUuid || store.locations[0]?.uuid || '');
    setTagSelectedPopupOpen(true);
  };

  const createTagForSelected = () => {
    if (!user || !selectedVolumeUuids.length || !tagLocationUuid) {
      showError('Select volumes and a location before tagging.');
      return;
    }
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 28);
    const selected = store.volumes.filter((volume) => selectedVolumeUuids.includes(volume.uuid));
    persist({
      ...store,
      tags: [
        ...store.tags,
        ...selected.map((volume) => ({
          uuid: uuid(`tag-${Date.now()}-${volume.uuid}`),
          volumeUuid: volume.uuid,
          patientUuid: volume.patientUuid,
          purpose: tagPurpose.trim() || 'Retrieve request',
          locationUuid: tagLocationUuid,
          requiredBy: due.toISOString(),
          expiresAt: expiry.toISOString(),
          createdByUserUuid: user.uuid,
          forgetWhenReceivedByMe: true,
          status: 'active',
        } as const)),
      ],
    });
    setTagSelectedPopupOpen(false);
  };

  const stopRetrievingClinic = () => {
    if (!user || !confirmStopClinicInstanceUuid) return;
    persist({
      ...store,
      clinicInstances: store.clinicInstances.map((instance) =>
        instance.uuid === confirmStopClinicInstanceUuid
          ? { ...instance, retrieverUserUuids: instance.retrieverUserUuids.filter((uuidValue) => uuidValue !== user.uuid) }
          : instance
      ),
    });
    setConfirmStopClinicInstanceUuid('');
  };

  const openSelectClinics = () => {
    setSelectedClinicInstanceUuids([]);
    if (user) {
      const prefs = preferenceSelectionForUser(store, user.uuid);
      setClinicFilter({
        healthBoard: prefs.healthBoard || '',
        locality: prefs.locality || '',
        facility: prefs.facility || '',
        speciality: '',
      });
    }
    navigateToView('selectClinics');
  };

  const toggleSelectedClinicInstance = (instanceUuid: string) => {
    setSelectedClinicInstanceUuids((current) =>
      current.includes(instanceUuid)
        ? current.filter((item) => item !== instanceUuid)
        : [...current, instanceUuid]
    );
  };

  const addSelectedClinics = () => {
    if (!user) return;
    persist({
      ...store,
      clinicInstances: store.clinicInstances.map((instance) =>
        selectedClinicInstanceUuids.includes(instance.uuid) && !instance.retrieverUserUuids.includes(user.uuid)
          ? { ...instance, retrieverUserUuids: [...instance.retrieverUserUuids, user.uuid] }
          : instance
      ),
    });
    goBack();
  };

  const openPickListSelector = (clinicInstanceUuid: string, patientUuid: string) => {
    const current = store.cntPickList
      .filter((entry) => entry.clinicInstanceUuid === clinicInstanceUuid)
      .map((entry) => entry.volumeUuid);
    setSelectedClinicInstanceUuid(clinicInstanceUuid);
    setSelectedPatientUuid(patientUuid);
    setSelectedVolumeUuids(current.filter((volumeUuid) =>
      store.volumes.some((volume) => volume.uuid === volumeUuid && volume.patientUuid === patientUuid)
    ));
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes, selectedBatchUuid, selectedClinicInstanceUuid, managedVolumeUuid).title, view });
    setView('selector');
  };

  const openClinicDates = (clinicUuid: string) => {
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    setSelectedClinicUuid(clinicUuid);
    setView('clinicDates');
  };

  const openClinicList = (clinicInstanceUuid: string) => {
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    setSelectedClinicInstanceUuid(clinicInstanceUuid);
    setView('clinicList');
  };

  const openPatientRecord = (patientUuid: string) => {
    sessionStorage.setItem('fbcntPatientRecordPatientUuid', patientUuid);
    sessionStorage.setItem('fbcntReturnState', JSON.stringify({
      view,
      selectedClinicInstanceUuid,
    }));
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    window.location.href = `/formBuilder2/index.html#/patient-record?patientUuid=${encodeURIComponent(patientUuid)}`;
  };

  const savePickListSelection = () => {
    if (!selectedClinicInstanceUuid) return;
    const selected = new Set(selectedVolumeUuids);
    const patientVolumeUuids = new Set(store.volumes
      .filter((volume) => volume.patientUuid === selectedPatientUuid)
      .map((volume) => volume.uuid));
    const retained = store.cntPickList.filter((entry) =>
      entry.clinicInstanceUuid !== selectedClinicInstanceUuid || !patientVolumeUuids.has(entry.volumeUuid)
    );
    const previousReceived = new Map(store.cntPickList.map((entry) => [`${entry.clinicInstanceUuid}:${entry.volumeUuid}`, entry.received]));
    persist({
      ...store,
      cntPickList: [
        ...retained,
        ...Array.from(selected).map((volumeUuid) => ({
          clinicInstanceUuid: selectedClinicInstanceUuid,
          volumeUuid,
          received: previousReceived.get(`${selectedClinicInstanceUuid}:${volumeUuid}`) || false,
        })),
      ],
    });
    goBack();
  };

  const openPickListReceive = (clinicInstanceUuid: string, patientUuid: string) => {
    const patientVolumeUuids = new Set(store.volumes.filter((volume) => volume.patientUuid === patientUuid).map((volume) => volume.uuid));
    const selection = store.cntPickList.filter((entry) =>
      entry.clinicInstanceUuid === clinicInstanceUuid && patientVolumeUuids.has(entry.volumeUuid)
    );
    setSelectedClinicInstanceUuid(clinicInstanceUuid);
    setSelectedPatientUuid(patientUuid);
    setReceivePickListVolumeUuids(selection.filter((entry) => entry.received).map((entry) => entry.volumeUuid));
    setPickListReceivePopupOpen(true);
  };

  const receivePickListVolumes = () => {
    if (!user || !selectedClinicInstanceUuid) return;
    const checked = new Set(receivePickListVolumeUuids);
    const rowVolumeUuids = new Set(store.volumes
      .filter((volume) => volume.patientUuid === selectedPatientUuid)
      .filter((volume) => store.cntPickList.some((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid && entry.volumeUuid === volume.uuid))
      .map((volume) => volume.uuid));
    const previouslyReceived = new Set(store.cntPickList
      .filter((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid && rowVolumeUuids.has(entry.volumeUuid) && entry.received)
      .map((entry) => entry.volumeUuid));
    const receiveLocationUuid = clinicHoldingLocationUuid(store, selectedClinicInstanceUuid);
    const now = new Date().toISOString();
    persist({
      ...store,
      cntPickList: store.cntPickList.map((entry) =>
        entry.clinicInstanceUuid === selectedClinicInstanceUuid && rowVolumeUuids.has(entry.volumeUuid)
          ? { ...entry, received: checked.has(entry.volumeUuid) }
          : entry
      ),
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
                userUuid: user.uuid,
                note: 'Received from Picklist',
              },
            ],
          };
        }
        if (!isChecked && wasReceived) return undoPickListReceived(volume);
        return volume;
      }),
    });
    setPickListReceivePopupOpen(false);
  };

  const openNewRequest = () => {
    if (!user) return;
    const patientUuid = selectedPatientUuid || store.patients[0]?.uuid || '';
    const patientVolumes = store.volumes.filter((volume) => volume.patientUuid === patientUuid).sort(volumeSort);
    const destination = store.locations.find((location) => location.facility === user.facility)?.uuid || store.locations[0]?.uuid || '';
    setRequestPatientUuid(patientUuid);
    setRequestVolumeUuids(patientVolumes[0] ? [patientVolumes[0].uuid] : []);
    setRequestRequiredFor('');
    setRequestFromLocationUuid(patientVolumes[0]?.currentLocationUuid || store.locations[0]?.uuid || '');
    setRequestToLocationUuid(destination);
    navigateToView('request');
  };

  const openRequestForSelectedVolumes = () => {
    if (!user || !selectedPatientUuid || !selectedVolumeUuids.length) return;
    const selected = store.volumes.filter((volume) => selectedVolumeUuids.includes(volume.uuid));
    const missingCustodian = selected.find((volume) => {
      return !custodianUuidsForLocation(store, volume.currentLocationUuid).length;
    });
    if (missingCustodian) {
      showError('Requesting is only allowed for volumes in a location with a custodian.');
      return;
    }
    const firstSelected = selected[0];
    const destination = store.locations.find((location) => location.facility === user.facility)?.uuid || store.locations[0]?.uuid || '';
    setRequestPatientUuid(selectedPatientUuid);
    setRequestVolumeUuids(selectedVolumeUuids);
    setRequestRequiredFor('');
    setRequestFromLocationUuid(firstSelected?.currentLocationUuid || '');
    setRequestToLocationUuid(destination);
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    setView('request');
  };

  const openRequestPatientSelector = () => {
    pushCntNavigation({ kind: 'cnt-view', label: 'Request', view: 'request' });
    setView('requestPatient');
  };

  const selectRequestPatient = (patientUuid: string) => {
    setRequestPatientUuid(patientUuid);
    const volumes = store.volumes.filter((volume) => volume.patientUuid === patientUuid).sort(volumeSort);
    setRequestVolumeUuids(volumes[0] ? [volumes[0].uuid] : []);
    setRequestFromLocationUuid(volumes[0]?.currentLocationUuid || requestFromLocationUuid);
    setView('request');
  };

  const openRequestVolumeSelector = () => {
    if (!requestPatientUuid) return;
    setSelectedPatientUuid(requestPatientUuid);
    setSelectedVolumeUuids(requestVolumeUuids);
    pushCntNavigation({ kind: 'cnt-view', label: 'Request', view: 'request' });
    setView('requestSelector');
  };

  const saveRequestVolumeSelection = () => {
    setRequestVolumeUuids(selectedVolumeUuids);
    const firstSelected = store.volumes.find((volume) => selectedVolumeUuids.includes(volume.uuid));
    if (firstSelected) setRequestFromLocationUuid(firstSelected.currentLocationUuid);
    setView('request');
  };

  const submitRequest = () => {
    if (!user || !requestPatientUuid || !requestVolumeUuids.length || !requestFromLocationUuid || !requestToLocationUuid) {
      showError('Select patient, volumes, source and destination before creating a request.');
      return;
    }
    const requiredBy = new Date();
    requiredBy.setDate(requiredBy.getDate() + 7);
    const newRequests: CntRequest[] = requestVolumeUuids.map((volumeUuid) => ({
      uuid: uuid(`request-${Date.now()}-${volumeUuid}`),
      volumeUuid,
      patientUuid: requestPatientUuid,
      requestedByUserUuid: user.uuid,
      requiredBy: requiredBy.toISOString(),
      requiredFor: requestRequiredFor.trim() || 'Case note request',
      fromLocationUuid: requestFromLocationUuid,
      toLocationUuid: requestToLocationUuid,
      status: 'open',
    }));
    persist({
      ...store,
      requests: [...store.requests, ...newRequests],
    });
    setView('requests');
  };

  const cancelRequestRow = (row: RequestRow) => {
    persist({
      ...store,
      requests: store.requests.map((request) =>
        requestMatchesRow(request, row) ? { ...request, status: 'cancelled' } : request
      ),
    });
  };

  const doneRequestRow = (row: RequestRow) => {
    persist({
      ...store,
      requests: store.requests.map((request) =>
        requestMatchesRow(request, row) ? { ...request, status: 'actioned' } : request
      ),
    });
  };

  const sendRequestRow = (row: RequestRow) => {
    setSelectedPatientUuid(row.patientUuid);
    setSelectedVolumeUuids(row.volumeUuids);
    setSendSourceUuid(row.fromLocationUuid);
    setSendDestinationUuid(row.toLocationUuid);
    setMovementPopup('send');
  };

  const openRequestLocator = (row: RequestRow) => {
    setSelectedPatientUuid(row.patientUuid);
    setSelectedVolumeUuids(row.volumeUuids);
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
    setView('locator');
  };

  const sendReturnRow = (patientUuid: string, volumeUuids: string[], locationUuid: string) => {
    setReturnListSendPopup({ patientUuid, volumeUuids, locationUuid });
    setReturnListSendVolumeUuids(volumeUuids);
  };

  const confirmReturnListSend = () => {
    if (!returnListSendPopup) return;
    if (!returnListSendVolumeUuids.length) {
      showError('Select at least one volume to send.');
      return;
    }
    setSelectedPatientUuid(returnListSendPopup.patientUuid);
    setSelectedVolumeUuids(returnListSendVolumeUuids);
    setSendSourceUuid(returnListSendPopup.locationUuid || store.locations[0]?.uuid || '');
    setSendDestinationUuid(store.preferences[user?.uuid || '']?.sendLocationUuid || returnListSendPopup.locationUuid || store.locations[0]?.uuid || '');
    setReturnListSendPopup(null);
    setMovementPopup('send');
  };

  const removeReturnRow = (patientUuid: string) => {
    setRemovedReturnPatientUuids((current) => uniqueValues([...current, patientUuid]));
  };

  const openAddLibrary = () => {
    if (!user) return;
    setAddLibraryLocationUuid(store.locations.find((location) => location.facility === user.facility)?.uuid || store.locations[0]?.uuid || '');
    setAddLibraryPopupOpen(true);
  };

  const addLibrary = () => {
    if (!user || !addLibraryLocationUuid) return;
    const currentPreferences = store.preferences[user.uuid] || {};
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...currentPreferences,
          libraryUuids: uniqueValues([...(currentPreferences.libraryUuids || []), addLibraryLocationUuid]),
        },
      },
    });
    setAddLibraryPopupOpen(false);
  };

  const removeLibrary = (locationUuid: string) => {
    if (!user) return;
    const currentPreferences = store.preferences[user.uuid] || {};
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [user.uuid]: {
          ...currentPreferences,
          libraryUuids: (currentPreferences.libraryUuids || defaultLibraryUuids(store, user.uuid)).filter((uuidValue) => uuidValue !== locationUuid),
        },
      },
    });
  };

  const startCameraScan = async () => {
    try {
      if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
        setScannerMessage('Camera barcode scanning is not available in this browser. A wired scanner can type into the scan box.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach((track) => track.stop());
      setScannerMessage('Camera access succeeded. Prototype scanner hook is ready for camera decoding.');
    } catch {
      setScannerMessage('Camera access was not granted. A wired scanner can type into the scan box.');
    }
  };

  if (!user) {
    return (
      <Shell title={{ kicker: 'NHS Wales - Case note tracker', title: 'Login' }}>
        <main style={styles.loginMain}>
          <div style={styles.loginPanel}>
            <FbBoxedInfo text="Simulated login - choose your identity" style={{ marginBottom: '0.8rem' }} />
            <div style={styles.loginGrid}>
              {store.users.map((candidate, index) => (
                <button
                  key={candidate.uuid}
                  type="button"
                  style={{ ...styles.identityTile, background: identityBackgrounds[index % identityBackgrounds.length] }}
                  onClick={() => handleLogin(candidate.uuid)}
                >
                  <strong>{candidate.surname.toUpperCase()}, {candidate.firstNames}, {candidate.title}</strong>
                  <span>{candidate.role}</span>
                  <span>{candidate.facility}</span>
                  <span>{candidate.nadexId}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  const title = titleForView(view, store, selectedVolumes, selectedBatchUuid, selectedClinicInstanceUuid, managedVolumeUuid);
  const shellTitle = view === 'clinics'
    ? {
      ...title,
      details: (
        <label style={styles.headerCheckboxLabel}>
          <input
            type="checkbox"
            checked={includeRetrievedPicklistPatients}
            onChange={(event) => setIncludeRetrievedPicklistPatients(event.currentTarget.checked)}
          />
          Include patients whose case notes have been retrieved
        </label>
      ),
    }
    : title;
  const clinicListHeaderControls = view === 'clinicList' ? (
    <div style={styles.headerCheckboxStack}>
      <label style={styles.headerCheckboxLabel}>
        <input
          type="checkbox"
          checked={showRescheduledClinicAppointments}
          onChange={(event) => setShowRescheduledClinicAppointments(event.currentTarget.checked)}
        />
        Show rescheduled appointments
      </label>
      <label style={styles.headerCheckboxLabel}>
        <input
          type="checkbox"
          checked={showCancelledClinicAppointments}
          onChange={(event) => setShowCancelledClinicAppointments(event.currentTarget.checked)}
        />
        Show cancelled appointments
      </label>
    </div>
  ) : null;
  const patientHeader = selectedPatient && isPatientView(view) ? <PatientAddressograph patient={selectedPatient} /> : null;
  const headerRight = clinicListHeaderControls || patientHeader;
  const showScanBar = view === 'home';
  const footerLeft = view === 'locator'
    ? (
      <div style={styles.footerLeftActions}>
        <FbButton variant="primary" onClick={openAddVolumePopup}>Register volume</FbButton>
        <FbButton variant="primary" onClick={() => setMovementPopup('send')} disabled={!selectedVolumeUuids.length}>Send selected</FbButton>
        <FbButton variant="primary" onClick={() => setMovementPopup('receive')} disabled={!selectedVolumeUuids.length}>Receive selected</FbButton>
        <FbButton variant="primary" onClick={() => setBatchSelectedPopupOpen(true)} disabled={!selectedVolumeUuids.length}>Batch selected</FbButton>
        <FbButton variant="primary" onClick={openTagSelectedPopup} disabled={!selectedVolumeUuids.length}>Tag selected</FbButton>
        <FbButton variant="primary" onClick={openRequestForSelectedVolumes} disabled={!selectedVolumeUuids.length}>Request selected</FbButton>
      </div>
    )
    : view === 'selector'
      ? (
        <div style={styles.footerLeftActions}>
          <FbButton variant="primary" onClick={openRequestForSelectedVolumes} disabled={!selectedVolumeUuids.length}>Request selected</FbButton>
        </div>
      )
    : view === 'batch'
      ? (
        <div style={styles.footerLeftActions}>
          <FbButton variant="primary" onClick={openFindBatch}>Find batch</FbButton>
          <FbButton variant="primary" onClick={openCreateBatch}>Create batch</FbButton>
        </div>
      )
    : view === 'myClinics'
      ? <FbAddButtonForPage label="Add clinic(s)" onClick={openSelectClinics} />
      : view === 'requests'
        ? <FbAddButtonForPage label="New request" onClick={openNewRequest} />
      : view === 'locations'
        ? <FbAddButtonForPage label="Add library" onClick={openAddLibrary} />
      : view === 'batchDetail'
        ? <FbAddButtonForPage label="Add volume" onClick={() => setBatchDetailAddPopupOpen(true)} />
      : null;

  return (
    <Shell
      title={shellTitle}
      user={isUserSpecificView(view) ? user : undefined}
      right={headerRight}
      headerOverride={view === 'home' ? <CntHomeHeaderTile /> : undefined}
      footerLeft={footerLeft}
      footer={
        view === 'selectClinics'
          ? (
            <>
              <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
              <FbButton variant="success" onClick={addSelectedClinics}>Ok</FbButton>
              <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
            </>
          )
          : view === 'preferences'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={savePreferences}>Ok</FbButton>
              </>
            )
          : view === 'manageVolume'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={saveManagedVolume}>Ok</FbButton>
                <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
              </>
            )
          : view === 'addVolume'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={addVolume}>Register</FbButton>
                <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
              </>
            )
          : view === 'createBatch'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={createBatch}>Create</FbButton>
                <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
              </>
            )
          : view === 'request'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={submitRequest}>Request</FbButton>
                <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
              </>
            )
          : view === 'requestSelector'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={saveRequestVolumeSelection}>Ok</FbButton>
                <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
              </>
            )
          : view === 'selector'
            ? (
              <>
                <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
                <FbButton variant="success" onClick={savePickListSelection}>Ok</FbButton>
                <FbButton variant="danger" onClick={goBack}>Cancel</FbButton>
              </>
            )
          : (
            <>
              <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
              <FbButton variant="primary" onClick={goBack}>Back</FbButton>
              <FbButton variant="primary" onClick={handleLogout}>Logout</FbButton>
            </>
          )
      }
    >
      {offlineModalOpen && (
        <FbModal
          title="No network connection"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <FbButton variant="primary" onClick={() => setOfflineModalOpen(!navigator.onLine)}>Try again</FbButton>
            </div>
          }
        >
          <p>Case note tracker does not work without a network connection.</p>
        </FbModal>
      )}
      <main ref={mainRef} style={view === 'locator' ? styles.locatorMain : ['addVolume', 'createBatch'].includes(view) ? styles.formMain : styles.main}>
        {showScanBar && (
          <FbcntScan
            value={identifier}
            onChange={setIdentifier}
            onOpen={openIdentifier}
            onRfid={() => showError('RFID button pressed. Prototype RFID reader is simulated only.')}
            onCameraScan={startCameraScan}
          />
        )}
        {scannerMessage && <p style={styles.note}>{scannerMessage}</p>}
        {view === 'home' && <FbcntPageHome setView={navigateToView} openPreferences={() => {
          setPreferencesReturnView('home');
          loadPreferenceFields(store, user.uuid);
          setView('preferences');
        }} showOffline={() => setOfflineModalOpen(true)}
          simulateNhsNumberScan={openRandomPatientLocator}
          simulateHospitalNumberScan={openRandomPatientLocator}
          simulateVolumeNumberScan={openRandomVolumeLocator}
          simulateBatchNumberScan={openRandomBatch}
          userDisplayName={`${user.firstNames} ${user.surname} (${user.nadexId})`}
        />}
        {view === 'preferences' && (
          <FbcntPagePreferences
            store={store}
            healthBoard={preferenceHealthBoard}
            setHealthBoard={setPreferenceHealthBoard}
            locality={preferenceLocality}
            setLocality={setPreferenceLocality}
            facility={preferenceFacility}
            setFacility={setPreferenceFacility}
          />
        )}
        {view === 'locator' && (
          <FbcntPageLocator
            store={store}
            selectedPatientUuid={selectedPatientUuid}
            selectedVolumeUuids={selectedVolumeUuids}
            toggleVolume={toggleVolume}
            openHistory={(volumeUuid) => {
              pushCntNavigation({ kind: 'cnt-view', label: 'Case notes locator', view: 'locator' });
              setSelectedVolumeUuids([volumeUuid]);
              setView('history');
            }}
            openManageVolume={openManageVolume}
          />
        )}
        {view === 'selector' && (
          <FbcntPageSelector
            store={store}
            selectedPatientUuid={selectedPatientUuid}
            selectedVolumeUuids={selectedVolumeUuids}
            toggleVolume={toggleVolume}
          />
        )}
        {view === 'requestSelector' && (
          <FbcntPageSelector
            store={store}
            selectedPatientUuid={requestPatientUuid}
            selectedVolumeUuids={selectedVolumeUuids}
            toggleVolume={toggleVolume}
          />
        )}
        {view === 'history' && <FbcntPageHistory store={store} volumes={selectedVolumes} />}
        {view === 'manageVolume' && (
          <FbcntPageManageVolume
            store={store}
            volumeUuid={managedVolumeUuid}
            value={managedVolumeDraft}
            setValue={setManagedVolumeDraft}
          />
        )}
        {view === 'addVolume' && (
          <FbcntPageRegisterVolume
            store={store}
            createdDate={addVolumeCreatedDate}
            setCreatedDate={setAddVolumeCreatedDate}
            healthBoard={addVolumeHealthBoard}
            setHealthBoard={setAddVolumeHealthBoard}
            locality={addVolumeLocality}
            setLocality={setAddVolumeLocality}
            volumeType={addVolumeType}
            setVolumeType={setAddVolumeType}
            status={addVolumeStatus}
            setStatus={setAddVolumeStatus}
            recordStatus={addVolumeRecordStatus}
            setRecordStatus={setAddVolumeRecordStatus}
            volumeNumber={addVolumeNumber}
            setVolumeNumber={setAddVolumeNumber}
            dateClosed={addVolumeDateClosed}
            setDateClosed={setAddVolumeDateClosed}
            dateDestroyed={addVolumeDateDestroyed}
            setDateDestroyed={setAddVolumeDateDestroyed}
            reasonDestroyed={addVolumeReasonDestroyed}
            setReasonDestroyed={setAddVolumeReasonDestroyed}
            initialLocationUuid={addVolumeLocationUuid}
            setInitialLocationUuid={setAddVolumeLocationUuid}
            barcode={addVolumeBarcode}
            setBarcode={setAddVolumeBarcode}
            rfid={addVolumeRfid}
            setRfid={setAddVolumeRfid}
            batchUuid={addVolumeBatchUuid}
            setBatchUuid={setAddVolumeBatchUuid}
          />
        )}
        {view === 'createBatch' && (
          <FbcntPageCreateBatch
            store={store}
            purpose={createBatchPurpose}
            setPurpose={setCreateBatchPurpose}
            currentLocationUuid={createBatchCurrentLocationUuid}
            setCurrentLocationUuid={setCreateBatchCurrentLocationUuid}
            destinationUuid={createBatchDestinationUuid}
            setDestinationUuid={setCreateBatchDestinationUuid}
            barcode={createBatchBarcode}
            setBarcode={setCreateBatchBarcode}
          />
        )}
        {movementPopup === 'send' && (
          <FbcntModalMovement
            title="Send selected volumes"
            store={store}
            fromLocationUuid={sendSourceUuid}
            toLocationUuid={sendDestinationUuid}
            setFromLocationUuid={setSendSourceUuid}
            setToLocationUuid={setSendDestinationUuid}
            actionLabel="Send"
            onAction={sendSelected}
            onCancel={() => setMovementPopup(null)}
          />
        )}
        {movementPopup === 'receive' && (
          <FbcntModalMovement
            title="Receive selected volumes"
            store={store}
            fromLocationUuid={receiveSourceUuid}
            toLocationUuid={receiveDestinationUuid}
            setFromLocationUuid={setReceiveSourceUuid}
            setToLocationUuid={setReceiveDestinationUuid}
            actionLabel="Receive"
            onAction={receiveSelected}
            onCancel={() => setMovementPopup(null)}
          />
        )}
        {batchSelectedPopupOpen && user && (
          <FbcntModalBatchSelected
            store={store}
            userUuid={user.uuid}
            onSelectBatch={addSelectedVolumesToBatch}
            onCancel={() => setBatchSelectedPopupOpen(false)}
          />
        )}
        {view === 'batch' && user && (
          <FbcntPageMyBatches
            store={store}
            userUuid={user.uuid}
            openBatch={openBatch}
            removeBatchFavourite={removeBatchFavourite}
          />
        )}
        {view === 'findBatch' && user && (
          <FbcntPageFindBatch
            store={store}
            userUuid={user.uuid}
            filter={findBatchFilter}
            setFilter={setFindBatchFilter}
            addBatchFavourite={addBatchFavourite}
          />
        )}
        {view === 'batchDetail' && <FbcntPageBatch store={store} batchUuid={selectedBatchUuid} removeVolumeFromBatch={removeVolumeFromBatch} />}
        {view === 'tags' && <FbcntPageTags store={store} />}
        {view === 'requests' && (
          <FbcntPageRequests
            store={store}
            userUuid={user.uuid}
            mode="outbox"
            cancelRequestRow={cancelRequestRow}
            openRequestLocator={openRequestLocator}
          />
        )}
        {view === 'inbox' && (
          <FbcntPageRequests
            store={store}
            userUuid={user.uuid}
            mode="inbox"
            sendRequestRow={sendRequestRow}
            doneRequestRow={doneRequestRow}
          />
        )}
        {view === 'request' && (
          <FbcntPageRequest
            store={store}
            patientUuid={requestPatientUuid}
            openPatientSelector={openRequestPatientSelector}
            openVolumeSelector={openRequestVolumeSelector}
            selectedVolumeUuids={requestVolumeUuids}
            requiredFor={requestRequiredFor}
            setRequiredFor={setRequestRequiredFor}
            fromLocationUuid={requestFromLocationUuid}
            setFromLocationUuid={setRequestFromLocationUuid}
            toLocationUuid={requestToLocationUuid}
            setToLocationUuid={setRequestToLocationUuid}
          />
        )}
        {view === 'requestPatient' && <FbcntPageRequestPatient store={store} selectPatient={selectRequestPatient} />}
        {view === 'returnList' && (
          <FbcntPageReturnList
            store={store}
            removedPatientUuids={removedReturnPatientUuids}
            sendReturnRow={sendReturnRow}
            removeReturnRow={removeReturnRow}
          />
        )}
        {view === 'clinics' && (
          <FbcntPagePicklist
            store={store}
            userUuid={user.uuid}
            includeRetrieved={includeRetrievedPicklistPatients}
            openPickListSelector={openPickListSelector}
            openPickListReceive={openPickListReceive}
          />
        )}
        {view === 'myClinics' && (
          <FbcntPageMyClinics
            store={store}
            userUuid={user.uuid}
            confirmStopClinic={(instanceUuid) => setConfirmStopClinicInstanceUuid(instanceUuid)}
          />
        )}
        {view === 'selectClinics' && (
          <FbcntPageSelectClinics
            store={store}
            currentUserUuid={user.uuid}
            filter={clinicFilter}
            setFilter={setClinicFilter}
            selectedInstanceUuids={selectedClinicInstanceUuids}
            toggleSelectedInstance={toggleSelectedClinicInstance}
          />
        )}
        {view === 'clinicSchedule' && (
          <FbcntPageClinicSchedule
            store={store}
            filter={systemClinicFilter}
            setFilter={setSystemClinicFilterAndPreferences}
            openClinicDates={openClinicDates}
          />
        )}
        {view === 'clinicDates' && <FbcntPageClinicDates store={store} clinicUuid={selectedClinicUuid} openClinicList={openClinicList} />}
        {view === 'allClinics' && (
          <FbcntPageAllClinics
            store={store}
            filter={systemClinicFilter}
            setFilter={setSystemClinicFilterAndPreferences}
            openClinicList={openClinicList}
          />
        )}
        {view === 'clinicList' && (
          <FbcntPageClinicList
            store={store}
            clinicInstanceUuid={selectedClinicInstanceUuid}
            showRescheduled={showRescheduledClinicAppointments}
            showCancelled={showCancelledClinicAppointments}
            openPatientRecord={openPatientRecord}
            openPickListSelector={openPickListSelector}
            openPickListReceive={openPickListReceive}
          />
        )}
        {view === 'allLocations' && (
          <FbcntPageLocations
            store={store}
            filter={systemLocationFilter}
            setFilter={setSystemLocationFilterAndPreferences}
          />
        )}
        {view === 'locations' && <FbcntPageLibraries store={store} userUuid={user.uuid} removeLibrary={removeLibrary} />}
        {view === 'admin' && <FbcntPageAdmin store={store} />}
      </main>
      {addLibraryPopupOpen && (
        <FbModal
          title="Add library"
          footer={
            <div style={styles.popupFooter}>
              <FbButton variant="success" onClick={addLibrary}>Add</FbButton>
              <FbButton variant="danger" onClick={() => setAddLibraryPopupOpen(false)}>Cancel</FbButton>
            </div>
          }
        >
          <FbcntLocation label="Library" store={store} value={addLibraryLocationUuid} onChange={setAddLibraryLocationUuid} />
        </FbModal>
      )}
      {errorMessage && (
        <FbModal
          title="Error"
          footer={
            <div style={styles.popupFooter}>
              <FbButton variant="success" onClick={() => setErrorMessage('')}>Ok</FbButton>
            </div>
          }
        >
          <p>{errorMessage}</p>
        </FbModal>
      )}
      {batchDetailAddPopupOpen && (
        <FbModal
          title="Not implemented yet"
          footer={
            <div style={styles.popupFooter}>
              <FbButton variant="danger" onClick={() => setBatchDetailAddPopupOpen(false)}>Close</FbButton>
            </div>
          }
        >
          <p>Adding volumes directly from the batch page is not implemented yet.</p>
        </FbModal>
      )}
      {tagSelectedPopupOpen && (
        <FbModal
          title="Tag selected"
          maxWidth="80vw"
          footer={
            <div style={styles.popupFooter}>
              <FbButton variant="success" onClick={createTagForSelected}>Create tag</FbButton>
              <FbButton variant="danger" onClick={() => setTagSelectedPopupOpen(false)}>Cancel</FbButton>
            </div>
          }
        >
          <div style={styles.locationPopupStack}>
            <FbTextArea label="Purpose" value={tagPurpose} onChange={setTagPurpose} fullWidth />
            <FbcntLocation label="Location" store={store} value={tagLocationUuid} onChange={setTagLocationUuid} />
          </div>
        </FbModal>
      )}
      {confirmStopClinicInstanceUuid && (
        <FbModal
          title="Stop retrieving"
          footer={
            <div style={styles.popupFooter}>
              <FbButton variant="danger" onClick={stopRetrievingClinic}>Stop retrieving</FbButton>
              <FbButton variant="success" onClick={() => setConfirmStopClinicInstanceUuid('')}>Cancel</FbButton>
            </div>
          }
        >
          <p>Stop retrieving for this clinic instance?</p>
        </FbModal>
      )}
      {pickListReceivePopupOpen && (
        <FbcntModalPicklistReceived
          volumes={store.volumes.filter((volume) =>
            volume.patientUuid === selectedPatientUuid
            && store.cntPickList.some((entry) => entry.clinicInstanceUuid === selectedClinicInstanceUuid && entry.volumeUuid === volume.uuid)
          ).sort(volumeSort)}
          checkedVolumeUuids={receivePickListVolumeUuids}
          toggleVolume={(volumeUuid) => setReceivePickListVolumeUuids((current) =>
            current.includes(volumeUuid) ? current.filter((item) => item !== volumeUuid) : [...current, volumeUuid]
          )}
          onOk={receivePickListVolumes}
          onCancel={() => setPickListReceivePopupOpen(false)}
        />
      )}
      {returnListSendPopup && (
        <FbcntModalReturnListSend
          volumes={store.volumes.filter((volume) => returnListSendPopup.volumeUuids.includes(volume.uuid)).sort(volumeSort)}
          checkedVolumeUuids={returnListSendVolumeUuids}
          toggleVolume={(volumeUuid) => setReturnListSendVolumeUuids((current) =>
            current.includes(volumeUuid) ? current.filter((item) => item !== volumeUuid) : [...current, volumeUuid]
          )}
          onSend={confirmReturnListSend}
          onCancel={() => setReturnListSendPopup(null)}
        />
      )}
    </Shell>
  );
}

function titleForView(view: View, store: CntStore, selectedVolumes: CntVolume[], selectedBatchUuid = '', selectedClinicInstanceUuid = '', managedVolumeUuid = ''): TitleSpec {
  if (view === 'history' && selectedVolumes[0]) {
    const volume = selectedVolumes[0];
    return {
      kicker: 'NHS Wales - Case note tracker',
      title: 'Volume history',
      details: (
        <>
          <div>{volume.healthBoard} - {volume.locality} - {volume.type} - volume {volume.volumeNumber}</div>
          <div>{volume.uuid}</div>
        </>
      ),
    };
  }
  if (view === 'locator') return { kicker: 'NHS Wales - Case note tracker', title: 'Case notes locator' };
  if (view === 'manageVolume') {
    const volume = store.volumes.find((item) => item.uuid === managedVolumeUuid);
    return {
      kicker: 'NHS Wales - Case note tracker',
      title: 'Manage volume',
      details: volumeIdentityText(volume),
      titleStyle: { fontSize: '1rem', fontWeight: 500 },
      detailsStyle: { fontSize: '2rem', fontWeight: 500, color: '#333' },
    };
  }
  if (view === 'clinicList') {
    const instance = store.clinicInstances.find((item) => item.uuid === selectedClinicInstanceUuid);
    const clinic = store.clinics.find((item) => item.uuid === instance?.clinicUuid);
    if (instance && clinic) {
      return {
        kicker: 'NHS Wales - Case note tracker',
        title: 'Clinic list',
        details: (
          <div>
            <div><FbDateDisplay value={instance.date} /> <FbTimeDisplay value={instance.startTime} />-{<FbTimeDisplay value={instance.endTime} />}</div>
            <div>{clinic.clinicName} - {clinic.speciality} - {clinic.clinician}</div>
          </div>
        ),
      };
    }
  }
  const titles: Record<View, string> = {
    home: 'Case note tracker',
    locator: 'Case notes locator',
    history: 'Volume history',
    send: 'Send',
    receive: 'Receive',
    batch: 'Batches',
    tags: 'Tags',
    requests: 'Outbox',
    inbox: 'Inbox',
    request: 'Request',
    requestPatient: 'Select patient',
    requestSelector: 'Case notes selector',
    returnList: 'Return list',
    clinics: 'Picklist',
    myClinics: 'Clinics',
    selectClinics: 'Select clinic(s)',
    clinicSchedule: 'Clinic schedule',
    clinicDates: 'Clinic dates',
    allClinics: 'All clinics',
    clinicList: 'Clinic list',
    allLocations: 'Locations',
    locations: 'Libraries',
    admin: 'Admin',
    preferences: 'Preferences',
    selector: 'Case notes selector',
    addVolume: 'Register volume',
    manageVolume: 'Manage volume',
    batchDetail: '',
    findBatch: 'Find batch',
    createBatch: 'Create batch',
  };
  if (view === 'batchDetail') {
    const batch = store.batches.find((item) => item.uuid === selectedBatchUuid);
    if (batch) {
      return {
        kicker: 'NHS Wales - Case note tracker',
        title: batch.barcode,
        details: (
          <div>
            <div>Purpose: {batch.intendedPurpose}</div>
            <div>Current location: <FbcntLocationDisplay store={store} locationUuid={batch.currentLocationUuid} compact /></div>
            <div>Destination: <FbcntLocationDisplay store={store} locationUuid={batch.intendedDestinationUuid} compact /></div>
            <div>Volumes: {batch.volumeUuids.length}</div>
          </div>
        ),
      };
    }
  }
  return { kicker: view === 'home' ? 'NHS Wales' : 'NHS Wales - Case note tracker', title: titles[view] || 'Case note tracker' };
}

function volumeIdentityText(volume?: CntVolume) {
  if (!volume) return 'Unknown volume';
  return `${volume.healthBoard} - ${volume.locality} - ${volume.type} - ${volume.temporary ? 'temporary volume' : 'volume'} ${volume.volumeNumber}`;
}

function isPatientView(view: View) {
  return ['locator', 'history', 'send', 'receive', 'tags', 'selector', 'addVolume', 'manageVolume'].includes(view);
}

function clinicHoldingLocationUuid(store: CntStore, clinicInstanceUuid: string) {
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

function isUserSpecificView(view: View) {
  return ['batch', 'requests', 'request', 'inbox', 'returnList', 'clinics', 'myClinics', 'locations', 'preferences'].includes(view);
}

function CntHomeHeaderTile() {
  return (
    <header style={styles.homeHeaderTile}>
      <div style={styles.homeHeaderKicker}>NHS Wales</div>
      <div style={styles.homeHeaderTitle}>Case note tracker</div>
    </header>
  );
}

function Shell({ title, user, right, footerLeft, footer, children, headerOverride }: { title: TitleSpec; user?: CntUser; right?: React.ReactNode; footerLeft?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode; headerOverride?: React.ReactNode }) {
  return (
    <div style={styles.shell}>
      {headerOverride || (user ? <FbcntHeaderForUser title={title} user={user} right={right} /> : <FbcntHeader title={title} right={right} />)}
      {children}
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>{footerLeft}</div>
        <div style={styles.footerRight}>{footer}</div>
      </footer>
    </div>
  );
}

function LocationSelect({ label, store, value, onChange, allowBlank = false }: { label: string; store: CntStore; value: string; onChange: (value: string) => void; allowBlank?: boolean }) {
  return (
    <label style={styles.label}>
      {label}
      <select style={styles.select} value={value} onChange={(event) => onChange(event.target.value)}>
        {allowBlank && <option value="">Not specified</option>}
        {store.locations.map((location) => (
          <option key={location.uuid} value={location.uuid}>{locationLabel(store, location.uuid)}</option>
        ))}
      </select>
    </label>
  );
}

function SelectedVolumeList({ store, volumes, ariaLabel = 'Selected volumes' }: { store: CntStore; volumes: CntVolume[]; ariaLabel?: string }) {
  return (
    <FbTable aria-label={ariaLabel}>
      <FbTableBody>
        {volumes.map((volume) => (
          <FbTableRow key={volume.uuid}>
            <FbTableCell><strong>Volume {volume.volumeNumber}</strong></FbTableCell>
            <FbTableCell>{volume.healthBoard} / {volume.locality} / {volume.type}</FbTableCell>
            <FbTableCell>{patientName(store, volume.patientUuid)}</FbTableCell>
            <FbTableCell><FbcntLocationDisplay store={store} locationUuid={volume.currentLocationUuid} compact /></FbTableCell>
          </FbTableRow>
        ))}
      </FbTableBody>
    </FbTable>
  );
}

function PatientAddressograph({ patient }: { patient: CntPatient }) {
  return (
    <div style={styles.cntAddressographWrap}>
      <FbAddressograph
        nhsNumber={patient.nhsNumber}
        surname={patient.surname}
        forenames={patient.forenames}
        title={patient.title}
        addressLine1={patient.addressLine1}
        addressLine2={patient.addressLine2}
        addressLine3={patient.addressLine3}
        addressLine4={patient.addressLine4}
        crn={patient.crn}
        dateOfBirth={patient.dateOfBirth}
        sex={patient.sex}
      />
    </div>
  );
}

function buildVolumeTree(volumes: CntVolume[]) {
  return volumes.reduce<Record<string, Record<string, Record<string, CntVolume[]>>>>((tree, volume) => {
    tree[volume.healthBoard] ||= {};
    tree[volume.healthBoard][volume.locality] ||= {};
    tree[volume.healthBoard][volume.locality][volume.type] ||= [];
    tree[volume.healthBoard][volume.locality][volume.type].push(volume);
    return tree;
  }, {});
}

function volumeSort(a: CntVolume, b: CntVolume) {
  return a.healthBoard.localeCompare(b.healthBoard)
    || a.locality.localeCompare(b.locality)
    || a.type.localeCompare(b.type)
    || Number(a.temporary) - Number(b.temporary)
    || a.volumeNumber - b.volumeNumber;
}

function nextVolumeNumber(store: CntStore, patientUuid: string, healthBoard: string, locality: string, type: string) {
  return store.volumes
    .filter((volume) =>
      volume.patientUuid === patientUuid
      && volume.healthBoard === healthBoard
      && volume.locality === locality
      && volume.type === type
    )
    .reduce((max, volume) => Math.max(max, volume.volumeNumber), 0) + 1;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean).map(String))).sort((a, b) => a.localeCompare(b));
}

function randomItem<T>(items: readonly T[]): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

type RequestRow = {
  key: string;
  patientUuid: string;
  volumeUuids: string[];
  requiredFor: string;
  requiredBy: string;
  fromLocationUuid: string;
  toLocationUuid: string;
  status: CntRequest['status'];
};

function requestRows(store: CntStore, requests: CntRequest[]): RequestRow[] {
  const rows = new Map<string, RequestRow>();
  requests.forEach((request) => {
    const key = [
      request.patientUuid,
      request.requiredFor,
      request.requiredBy,
      request.fromLocationUuid,
      request.toLocationUuid,
      request.status,
    ].join('|');
    const existing = rows.get(key);
    if (existing) {
      existing.volumeUuids = uniqueValues([...existing.volumeUuids, request.volumeUuid]);
      return;
    }
    rows.set(key, {
      key,
      patientUuid: request.patientUuid,
      volumeUuids: [request.volumeUuid],
      requiredFor: request.requiredFor,
      requiredBy: request.requiredBy,
      fromLocationUuid: request.fromLocationUuid,
      toLocationUuid: request.toLocationUuid,
      status: request.status,
    });
  });
  return Array.from(rows.values()).sort((a, b) => a.requiredBy.localeCompare(b.requiredBy));
}

function requestMatchesRow(request: CntRequest, row: RequestRow) {
  return row.volumeUuids.includes(request.volumeUuid)
    && request.patientUuid === row.patientUuid
    && request.requiredFor === row.requiredFor
    && request.requiredBy === row.requiredBy
    && request.fromLocationUuid === row.fromLocationUuid
    && request.toLocationUuid === row.toLocationUuid
    && request.status === row.status;
}

function volumeLabelForRequest(volume: CntVolume) {
  return `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`;
}

function userBatchUuids(store: CntStore, userUuid: string) {
  const configured = store.preferences[userUuid]?.batchUuids;
  if (configured?.length) return configured.filter((batchUuid) => store.batches.some((batch) => batch.uuid === batchUuid));
  return store.batches.slice(0, 1).map((batch) => batch.uuid);
}

function defaultLibraryUuids(store: CntStore, userUuid: string) {
  const user = store.users.find((item) => item.uuid === userUuid);
  const matching = store.locations.filter((location) =>
    location.facility === user?.facility || custodianUuidsForLocation(store, location.uuid).includes(userUuid)
  );
  return (matching.length ? matching : store.locations.slice(0, 1)).map((location) => location.uuid);
}

function userLibraryUuids(store: CntStore, userUuid: string) {
  const configured = store.preferences[userUuid]?.libraryUuids;
  const uuids = configured?.length ? configured : defaultLibraryUuids(store, userUuid);
  return uuids.filter((locationUuid) => store.locations.some((location) => location.uuid === locationUuid));
}

function locationHyphenLabel(store: CntStore, locationUuid: string) {
  const location = store.locations.find((item) => item.uuid === locationUuid);
  if (!location) return '';
  return [location.extra, location.department, location.facility, location.healthBoard]
    .filter(Boolean)
    .join('-');
}

function custodianUuidsForLocation(store: CntStore, locationUuid: string) {
  const location = store.locations.find((item) => item.uuid === locationUuid);
  if (!location) return [];
  return uniqueValues(store.locations
    .filter((candidate) =>
      candidate.healthBoard === location.healthBoard
      && candidate.locality === location.locality
      && candidate.facility === location.facility
      && candidate.department === location.department
    )
    .flatMap((candidate) => candidate.custodianUserUuids));
}

function volumeLocationCounts(store: CntStore, volumes: CntVolume[]) {
  const counts = new Map<string, number>();
  volumes.forEach((volume) => {
    const label = locationHyphenLabel(store, volume.currentLocationUuid) || 'Unknown location';
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function clinicSummary(clinic?: { clinicName: string; speciality: string; clinician: string }) {
  if (!clinic) return null;
  return (
    <>
      <div>{clinic.clinicName}</div>
      <div>{clinic.speciality}</div>
      <div>{clinic.clinician}</div>
    </>
  );
}

function userInitials(user: CntUser) {
  return `${user.firstNames.slice(0, 1)}${user.surname.slice(0, 1)}`.toUpperCase();
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
    crn: patientUuid.slice(0, 8),
    dateOfBirth: '1900-01-01',
    sex: 'Unknown',
  };
}

function ensurePatientInStore(store: CntStore, patient: CntPatient): CntStore {
  if (store.patients.some((item) => item.uuid === patient.uuid)) return store;
  const seededVolumes = store.locations.slice(0, 4).map((location, index): CntVolume => {
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
        userUuid: 'bbbbbbbb-0005-4000-8000-000000000005',
        note: 'Created simulated external-patient volume',
      }],
    };
  });
  return {
    ...store,
    patients: [...store.patients, patient],
    volumes: [...store.volumes, ...seededVolumes],
  };
}

const identityBackgrounds = [
  'linear-gradient(135deg, #1b6ec2, #8cd2e7)',
  'linear-gradient(135deg, #008000, #c5e1a5)',
  'linear-gradient(135deg, #7048e8, #8cd2e7)',
  'linear-gradient(135deg, #fd8a10, #fee715)',
  'linear-gradient(135deg, #d50000, #fd8a10)',
  'linear-gradient(135deg, #333333, #8cd2e7)',
];

const styles = {
  shell: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: 'white',
    position: 'relative',
  } as React.CSSProperties,
  header: {
    backgroundColor: 'white',
    borderBottom: `0.2rem solid ${fbBlue}`,
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '4.2rem',
    gap: '1rem',
  } as React.CSSProperties,
  kicker: {
    fontSize: '1rem',
    fontWeight: 300,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  title: {
    fontSize: '2rem',
    fontWeight: 500,
    margin: 0,
    color: '#333',
    lineHeight: 1.1,
  } as React.CSSProperties,
  titleDetails: {
    marginTop: '0.2rem',
    fontSize: '0.9rem',
    fontWeight: 300,
    color: '#333',
  } as React.CSSProperties,
  headerCheckboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '1rem',
    fontWeight: 300,
  } as React.CSSProperties,
  headerCheckboxStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  headerRight: {
    fontWeight: 500,
    color: '#333',
  } as React.CSSProperties,
  homeHeaderTile: {
    boxSizing: 'border-box',
    backgroundColor: fbBlue,
    color: 'white',
    borderRadius: '0.4rem',
    padding: '1rem',
    margin: '1.5rem 1.5rem 0.8rem 1.5rem',
    fontFamily: "'Roboto', sans-serif",
  } as React.CSSProperties,
  homeHeaderKicker: {
    fontSize: '1rem',
    fontWeight: 300,
    lineHeight: 1.1,
  } as React.CSSProperties,
  homeHeaderTitle: {
    fontSize: '2.1rem',
    fontWeight: 500,
    lineHeight: 1.1,
  } as React.CSSProperties,
  footer: {
    minHeight: '2.8rem',
    borderTop: `0.2rem solid ${fbBlue}`,
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.6rem',
    minWidth: 0,
  } as React.CSSProperties,
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    minWidth: 0,
  } as React.CSSProperties,
  footerLeftActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.6rem',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  } as React.CSSProperties,
  formMain: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 0 1rem',
  } as React.CSSProperties,
  locatorMain: {
    flex: 1,
    minHeight: 0,
    overflowY: 'hidden',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  loginMain: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.8rem 1rem 1rem',
  } as React.CSSProperties,
  loginPanel: {
    width: 'min(76rem, 100%)',
    margin: '0 auto',
    backgroundColor: 'white',
  } as React.CSSProperties,
  loginGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))',
    gap: '0.8rem',
  } as React.CSSProperties,
  identityTile: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    minHeight: '8rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '0.25rem',
    boxShadow: '0 0.15rem 0.5rem rgba(0,0,0,0.16)',
  } as React.CSSProperties,
  panelTitle: {
    margin: '0 0 0.8rem 0',
    fontSize: '1.25rem',
    fontWeight: 500,
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
    gap: '0.8rem',
  } as React.CSSProperties,
  homeButton: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1.2rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    minHeight: '5.5rem',
    boxShadow: '0 0.15rem 0.5rem rgba(0,0,0,0.14)',
  } as React.CSSProperties,
  actionButton: {
    backgroundColor: fbGreen,
    color: 'black',
    border: `0.1rem solid ${fbGreen}`,
    borderRadius: '0.4rem',
    padding: '0.45rem 0.8rem',
    marginTop: '0.8rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  rfidButton: {
    backgroundColor: fbLightBlue,
    color: 'black',
    border: `0.2rem solid ${fbOrange}`,
    borderRadius: '0.4rem',
    padding: '0.35rem 1rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties,
  scanBar: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    marginBottom: '0.8rem',
  } as React.CSSProperties,
  scanInput: {
    flex: 1,
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.45rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
  } as React.CSSProperties,
  card: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  locatorShell: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  } as React.CSSProperties,
  locatorScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBottom: '0.8rem',
  } as React.CSSProperties,
  miniCard: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  tree: {
    border: 0,
    borderRadius: 0,
    padding: '0.4rem',
  } as React.CSSProperties,
  treeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    width: '100%',
    border: 0,
    backgroundColor: 'white',
    color: '#111',
    fontFamily: "'Roboto', sans-serif",
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    textAlign: 'left',
    cursor: 'pointer',
  } as React.CSSProperties,
  volumeRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(10rem, 1fr) 2fr auto auto auto',
    gap: '0.6rem',
    alignItems: 'center',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    borderTop: '0.1rem solid #eee',
  } as React.CSSProperties,
  volumeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  } as React.CSSProperties,
  volumeMeta: {
    fontSize: '0.85rem',
    color: '#555',
  } as React.CSSProperties,
  badge: {
    borderRadius: '0.4rem',
    backgroundColor: fbBlue,
    color: 'white',
    padding: '0.1rem 0.4rem',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  fbcntSmallButton: {
    border: 0,
    borderRadius: '0.4rem',
    backgroundColor: fbBlue,
    color: 'white',
    padding: '0.2rem 0.44rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  locatorActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.8rem',
    paddingTop: '0.8rem',
    borderTop: `0.2rem solid ${fbBlue}`,
    backgroundColor: 'white',
    flex: '0 0 auto',
  } as React.CSSProperties,
  actionTile: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1rem',
    minWidth: '16rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  } as React.CSSProperties,
  actionTileSmall: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    color: 'white',
    padding: '1rem',
    minWidth: '10rem',
    textAlign: 'left',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  } as React.CSSProperties,
  th: {
    textAlign: 'left',
    padding: '0.4rem',
    border: '0.1rem solid silver',
    backgroundColor: '#f4f7fb',
    fontWeight: 500,
  } as React.CSSProperties,
  td: {
    padding: '0.4rem',
    border: '0.1rem solid silver',
    verticalAlign: 'top',
  } as React.CSSProperties,
  linkButton: {
    border: 0,
    backgroundColor: 'transparent',
    color: fbBlue,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
    fontFamily: "'Roboto', sans-serif",
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontWeight: 500,
  } as React.CSSProperties,
  select: {
    display: 'block',
    width: '100%',
    marginTop: '0.3rem',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
  } as React.CSSProperties,
  locationInput: {
    display: 'block',
    width: '100%',
    marginTop: '0.3rem',
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
    boxSizing: 'border-box',
  } as React.CSSProperties,
  locationPopupStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    width: '100%',
  } as React.CSSProperties,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
    gap: '0.8rem',
  } as React.CSSProperties,
  note: {
    color: fbOrange,
    fontWeight: 500,
  } as React.CSSProperties,
  popupFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  fullWidthTableWrap: {
    width: '100%',
    backgroundColor: 'white',
  } as React.CSSProperties,
  fullHeightTableWrap: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'white',
  } as React.CSSProperties,
  tablePageStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  addVolumePage: {
    width: 'min(48rem, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  cntAddressographWrap: {
    paddingTop: '0.4rem',
    paddingBottom: '0.4rem',
  } as React.CSSProperties,
  batchPatientGroup: {
    display: 'grid',
    gridTemplateColumns: 'minmax(18rem, 22rem) 1fr',
    gap: '0.8rem',
    alignItems: 'start',
    borderTop: '0.1rem solid silver',
    paddingTop: '0.8rem',
  } as React.CSSProperties,
  batchPopupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as React.CSSProperties,
  batchPopupButton: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    backgroundColor: 'white',
    color: '#111',
    padding: '0.6rem',
    fontFamily: "'Roboto', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.15rem',
  } as React.CSSProperties,
  preferencesPage: {
    width: 'min(48rem, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  stackedButtons: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.35rem',
    alignItems: 'stretch',
  } as React.CSSProperties,
  inlineCheckLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
  } as React.CSSProperties,
  requestVolumeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  } as React.CSSProperties,
  inlineActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.4rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  tagLine: {
    display: 'block',
    marginTop: '0.15rem',
    color: fbBlue,
    fontSize: '0.85rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  myClinicsPage: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  } as React.CSSProperties,
  pageAddButtonRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: '0.4rem',
  } as React.CSSProperties,
  selectClinicsPage: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  } as React.CSSProperties,
  selectClinicsTableWrap: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBottom: '3.4rem',
  } as React.CSSProperties,
  selectClinicsFooterActions: {
    position: 'absolute',
    right: '0.8rem',
    bottom: '3.25rem',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    backgroundColor: 'white',
    padding: '0.2rem 0',
  } as React.CSSProperties,
  groupWithBorder: {
    border: '0.1rem solid silver',
    borderRadius: '0.4rem',
    padding: '0.6rem',
    margin: 0,
    backgroundColor: 'white',
  } as React.CSSProperties,
  groupWithBorderLegend: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    padding: '0 0.3rem',
  } as React.CSSProperties,
};
