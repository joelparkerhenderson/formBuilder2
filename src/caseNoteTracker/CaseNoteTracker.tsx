import React from 'react';
import { fbAddressograph as FbAddressograph } from '../components/fbAddressograph';
import { fbBoxedInfo as FbBoxedInfo } from '../components/fbBoxedMessage';
import { fbButton as FbButton } from '../components/fbButton';
import { fbAddButtonForPage as FbAddButtonForPage } from '../components/fbAddButtonForPage';
import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbExactDate as FbExactDate } from '../components/fbExactDate';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import { fbGroup as FbGroup } from '../components/fbGroup';
import { fbNumberInput as FbNumberInput } from '../components/fbNumberInput';
import { fbPopup as FbPopup } from '../components/fbPopup';
import { fbQuestion as FbQuestion } from '../components/fbQuestion';
import { fbRadio as FbRadio } from '../components/fbRadio';
import { fbTextInput as FbTextInput } from '../components/fbTextInput';
import {
  fbTable as FbTable,
  fbTableBody as FbTableBody,
  fbTableHeader as FbTableHeader,
  fbTableHeaderCell as FbTableHeaderCell,
  fbTableRow as FbTableRow,
} from '../components/fbTable';
import { fbTableCell as FbTableCell } from '../components/fbTableCell';
import { fbUserName as FbUserName } from '../components/fbUserName';
import { clinicalDateToIsoDate, formatClinicalDate as formatClinicalInputDate } from '../utils/dateFormat';
import {
  clearSessionUserUuid,
  CntBatch,
  CntClinicInstance,
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
import {
  clearCntNavigationStack,
  cntHomeEntry,
  formBuilderHomeEntry,
  popCntNavigation,
  pushCntNavigation,
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
  | 'returnList'
  | 'clinics'
  | 'myClinics'
  | 'selectClinics'
  | 'locations'
  | 'admin';

type TitleSpec = {
  kicker: string;
  title: string;
  details?: React.ReactNode;
};

const fbBlue = '#1b6ec2';
const fbGreen = '#008000';
const fbOrange = '#fd8a10';
const fbRed = '#d50000';
const fbLightBlue = '#8cd2e7';

const patientSearchUrl = () => {
  return '/formBuilder2/index.html#/patient-search';
};

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
  const [identifier, setIdentifier] = React.useState('');
  const [selectedPatientUuid, setSelectedPatientUuid] = React.useState('');
  const [selectedVolumeUuids, setSelectedVolumeUuids] = React.useState<string[]>([]);
  const [sendSourceUuid, setSendSourceUuid] = React.useState('');
  const [sendDestinationUuid, setSendDestinationUuid] = React.useState('');
  const [receiveSourceUuid, setReceiveSourceUuid] = React.useState('');
  const [receiveDestinationUuid, setReceiveDestinationUuid] = React.useState('');
  const [addVolumePopupOpen, setAddVolumePopupOpen] = React.useState(false);
  const [addVolumeCreatedDate, setAddVolumeCreatedDate] = React.useState(() => formatClinicalInputDate(new Date()));
  const [addVolumeHealthBoard, setAddVolumeHealthBoard] = React.useState('');
  const [addVolumeLocality, setAddVolumeLocality] = React.useState('');
  const [addVolumeType, setAddVolumeType] = React.useState('General');
  const [addVolumeStatus, setAddVolumeStatus] = React.useState<'Permanent' | 'Temporary'>('Permanent');
  const [addVolumeNumber, setAddVolumeNumber] = React.useState('');
  const [addVolumeLocationUuid, setAddVolumeLocationUuid] = React.useState('');
  const [addVolumeBarcode, setAddVolumeBarcode] = React.useState('');
  const [addVolumeRfid, setAddVolumeRfid] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState('');
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
  const mainRef = React.useRef<HTMLElement | null>(null);
  const scrollPositions = React.useRef<Partial<Record<View, number>>>({});

  const user = store.users.find((item) => item.uuid === userUuid) || null;
  const selectedPatient = store.patients.find((patient) => patient.uuid === selectedPatientUuid) || null;
  const selectedVolumes = store.volumes.filter((volume) => selectedVolumeUuids.includes(volume.uuid));

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryReturnTo = query.get('returnTo') || '';
    setReturnTo(queryReturnTo);
    const loginAs = query.get('loginAs');
    if (loginAs && getSessionUserUuid() !== loginAs) {
      handleLogin(loginAs, false);
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

  React.useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    main.scrollTop = scrollPositions.current[view] || 0;
  }, [view]);

  const persist = (next: CntStore) => {
    setStore(next);
    saveCntStore(next);
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
    if (switchToHome) setView('home');
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
    pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
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
      setStatusMessage(`Opened ${result.patient.name}`);
      return;
    }
    if (result.kind === 'volume') {
      pushCntNavigation({ kind: 'cnt-view', label: titleForView(view, store, selectedVolumes).title, view });
      setSelectedPatientUuid(result.volume.patientUuid);
      setSelectedVolumeUuids([result.volume.uuid]);
      setView('history');
      setStatusMessage(`Opened ${result.volume.barcode}`);
      return;
    }
    if (result.kind === 'batch') {
      setSelectedVolumeUuids(result.batch.volumeUuids);
      setView('batch');
      setStatusMessage(`Opened ${result.batch.barcode}`);
      return;
    }
    if (result.kind === 'location') {
      setSendDestinationUuid(result.location.uuid);
      setReceiveDestinationUuid(result.location.uuid);
      setStatusMessage(`Selected ${result.location.code}`);
      return;
    }
    setStatusMessage(result.kind === 'empty' ? 'Enter or scan an identifier' : 'Identifier not found');
  };

  const toggleVolume = (volumeUuid: string) => {
    setSelectedVolumeUuids((current) =>
      current.includes(volumeUuid)
        ? current.filter((item) => item !== volumeUuid)
        : [...current, volumeUuid]
    );
  };

  const sendSelected = () => {
    if (!user || selectedVolumeUuids.length === 0 || !sendSourceUuid || !sendDestinationUuid) {
      setStatusMessage('Select volumes, source and destination before sending.');
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
    setStatusMessage(`Sent ${selectedVolumeUuids.length} volume(s).`);
    setMovementPopup(null);
  };

  const receiveSelected = () => {
    if (!user || selectedVolumeUuids.length === 0 || !receiveDestinationUuid) {
      setStatusMessage('Select volumes and receiving location before receiving.');
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
    setStatusMessage(`Received ${selectedVolumeUuids.length} volume(s).`);
    setMovementPopup(null);
  };

  const addVolume = () => {
    if (!user || !selectedPatientUuid || !addVolumeLocationUuid) {
      setStatusMessage('Select a patient and location before adding a volume.');
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
    const createdIsoDate = clinicalDateToIsoDate(addVolumeCreatedDate);
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
      currentLocationUuid: location.uuid,
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
    setStatusMessage(`Added volume ${volumeNumber}.`);
    setSelectedVolumeUuids([newVolumeUuid]);
    setAddVolumePopupOpen(false);
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
    setAddVolumeCreatedDate(formatClinicalInputDate(new Date()));
    setAddVolumeHealthBoard(preferredHealthBoard);
    setAddVolumeLocality(preferredLocality);
    setAddVolumeType(preferredType);
    setAddVolumeStatus('Permanent');
    setAddVolumeNumber(String(nextNumber));
    setAddVolumeLocationUuid(preferredLocationUuid);
    setAddVolumeBarcode('');
    setAddVolumeRfid('');
    setAddVolumePopupOpen(true);
  };

  const createBatch = () => {
    if (!selectedVolumeUuids.length) {
      setStatusMessage('Select volumes before creating a batch.');
      return;
    }
    const batch: CntBatch = {
      uuid: uuid(`batch-${Date.now()}`),
      barcode: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      currentLocationUuid: selectedVolumes[0]?.currentLocationUuid || store.locations[0].uuid,
      intendedPurpose: 'Ad hoc movement',
      intendedDestinationUuid: sendDestinationUuid || store.locations[0].uuid,
      volumeUuids: selectedVolumeUuids,
    };
    persist({
      ...store,
      batches: [...store.batches, batch],
      volumes: store.volumes.map((volume) =>
        selectedVolumeUuids.includes(volume.uuid) ? { ...volume, batchUuid: batch.uuid } : volume
      ),
    });
    setStatusMessage(`Created ${batch.barcode}.`);
  };

  const addTag = () => {
    if (!user || !selectedVolumes[0]) {
      setStatusMessage('Select a volume before tagging.');
      return;
    }
    const volume = selectedVolumes[0];
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 28);
    persist({
      ...store,
      tags: [
        ...store.tags,
        {
          uuid: uuid(`tag-${Date.now()}`),
          volumeUuid: volume.uuid,
          patientUuid: volume.patientUuid,
          purpose: 'Follow-up tracking tag',
          locationUuid: volume.currentLocationUuid,
          requiredBy: due.toISOString(),
          expiresAt: expiry.toISOString(),
          createdByUserUuid: user.uuid,
          forgetWhenReceivedByMe: true,
          status: 'active',
        },
      ],
    });
    setStatusMessage(`Tagged ${volume.barcode}.`);
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
    setStatusMessage('Stopped retrieving for clinic.');
  };

  const openSelectClinics = () => {
    setSelectedClinicInstanceUuids([]);
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
    setStatusMessage(`Added ${selectedClinicInstanceUuids.length} clinic(s).`);
    goBack();
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

  const title = titleForView(view, store, selectedVolumes);
  const patientHeader = selectedPatient && isPatientView(view) ? <PatientAddressograph patient={selectedPatient} /> : null;
  const showScanBar = view === 'home';

  return (
    <Shell
      title={title}
      right={patientHeader}
      footer={
        view === 'selectClinics'
          ? (
            <>
              <FbUserName value={user.nadexId} onChange={() => {}} id="cnt-username" />
              <button type="button" style={styles.sendButton} onClick={addSelectedClinics}>Ok</button>
              <button type="button" style={styles.cancelButton} onClick={goBack}>Cancel</button>
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
        <FbPopup
          title="No network connection"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <FbButton variant="primary" onClick={() => setOfflineModalOpen(!navigator.onLine)}>Try again</FbButton>
            </div>
          }
        >
          <p>Case note tracker does not work without a network connection.</p>
        </FbPopup>
      )}
      <main ref={mainRef} style={view === 'locator' ? styles.locatorMain : styles.main}>
        {showScanBar && (
          <FbcntScan
            value={identifier}
            onChange={setIdentifier}
            onOpen={openIdentifier}
            onRfid={() => setStatusMessage('RFID button pressed. Prototype RFID reader is simulated only.')}
            onCameraScan={startCameraScan}
          />
        )}
        {scannerMessage && <p style={styles.note}>{scannerMessage}</p>}
        {statusMessage && <p role="status" style={styles.status}>{statusMessage}</p>}
        {view === 'home' && <HomeView setView={navigateToView} showOffline={() => setOfflineModalOpen(true)} />}
        {view === 'locator' && (
          <LocatorView
            store={store}
            selectedPatientUuid={selectedPatientUuid}
            selectedVolumeUuids={selectedVolumeUuids}
            toggleVolume={toggleVolume}
            openHistory={(volumeUuid) => {
              pushCntNavigation({ kind: 'cnt-view', label: 'Case notes locator', view: 'locator' });
              setSelectedVolumeUuids([volumeUuid]);
              setView('history');
            }}
            openSend={() => setMovementPopup('send')}
            openReceive={() => setMovementPopup('receive')}
            openAddVolume={openAddVolumePopup}
          />
        )}
        {view === 'history' && <HistoryView store={store} volumes={selectedVolumes} />}
        {addVolumePopupOpen && (
          <AddVolumePopup
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
            volumeNumber={addVolumeNumber}
            setVolumeNumber={setAddVolumeNumber}
            initialLocationUuid={addVolumeLocationUuid}
            setInitialLocationUuid={setAddVolumeLocationUuid}
            barcode={addVolumeBarcode}
            setBarcode={setAddVolumeBarcode}
            rfid={addVolumeRfid}
            setRfid={setAddVolumeRfid}
            onAdd={addVolume}
            onCancel={() => setAddVolumePopupOpen(false)}
          />
        )}
        {movementPopup === 'send' && (
          <MovementPopup
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
          <MovementPopup
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
        {view === 'batch' && <BatchView store={store} createBatch={createBatch} />}
        {view === 'tags' && <TagsView store={store} addTag={addTag} />}
        {view === 'requests' && <RequestsView store={store} />}
        {view === 'returnList' && <ReturnListView store={store} />}
        {view === 'clinics' && <PicklistView store={store} userUuid={user.uuid} openPatientLocator={(patientUuid) => openPatientLocator(patientUuid, 'clinics')} />}
        {view === 'myClinics' && (
          <MyClinicsView
            store={store}
            userUuid={user.uuid}
            openSelectClinics={openSelectClinics}
            confirmStopClinic={(instanceUuid) => setConfirmStopClinicInstanceUuid(instanceUuid)}
          />
        )}
        {view === 'selectClinics' && (
          <SelectClinicsView
            store={store}
            currentUserUuid={user.uuid}
            filter={clinicFilter}
            setFilter={setClinicFilter}
            selectedInstanceUuids={selectedClinicInstanceUuids}
            toggleSelectedInstance={toggleSelectedClinicInstance}
          />
        )}
        {view === 'locations' && <LocationsView store={store} />}
        {view === 'admin' && <AdminView store={store} />}
      </main>
      {confirmStopClinicInstanceUuid && (
        <FbPopup
          title="Stop retrieving"
          footer={
            <div style={styles.popupFooter}>
              <button type="button" style={styles.sendButton} onClick={stopRetrievingClinic}>Stop retrieving</button>
              <button type="button" style={styles.cancelButton} onClick={() => setConfirmStopClinicInstanceUuid('')}>Cancel</button>
            </div>
          }
        >
          <p>Stop retrieving for this clinic instance?</p>
        </FbPopup>
      )}
    </Shell>
  );
}

function titleForView(view: View, store: CntStore, selectedVolumes: CntVolume[]): TitleSpec {
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
  const titles: Record<View, string> = {
    home: 'Case note tracker',
    locator: 'Case notes locator',
    history: 'Volume history',
    send: 'Send',
    receive: 'Receive',
    batch: 'Batch management',
    tags: 'Tags',
    requests: 'My requests',
    returnList: 'My return list',
    clinics: 'My picklist',
    myClinics: 'My clinics',
    selectClinics: 'Select clinic(s)',
    locations: 'My libraries',
    admin: 'Admin',
  };
  return { kicker: view === 'home' ? 'NHS Wales' : 'NHS Wales - Case note tracker', title: titles[view] || 'Case note tracker' };
}

function isPatientView(view: View) {
  return ['locator', 'history', 'send', 'receive', 'tags'].includes(view);
}

function Shell({ title, right, footer, children }: { title: TitleSpec; right?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>{title.kicker}</div>
          <h1 style={styles.title}>{title.title}</h1>
          {title.details && <div style={styles.titleDetails}>{title.details}</div>}
        </div>
        <div style={styles.headerRight}>{right}</div>
      </header>
      {children}
      <footer style={styles.footer}>{footer}</footer>
    </div>
  );
}

function HomeView({ setView, showOffline }: { setView: (view: View) => void; showOffline: () => void }) {
  const items: Array<{ target?: View; label: string; subtext?: string; href?: string; background: string }> = [
    { label: 'Patient search', href: patientSearchUrl(), background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { target: 'batch', label: 'Batch management', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'requests', label: 'My requests', background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { target: 'returnList', label: 'My return list', background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { target: 'clinics', label: 'My picklist', background: 'linear-gradient(135deg, #1b6ec2, #7048e8)' },
    { target: 'myClinics', label: 'My clinics', background: 'linear-gradient(135deg, #fd8a10, #fee715)' },
    { target: 'locations', label: 'My libraries', background: 'linear-gradient(135deg, #008000, #8cd2e7)' },
    { target: 'admin', label: 'Admin', subtext: 'For medical records admins', background: 'linear-gradient(135deg, #333, #8cd2e7)' },
  ];
  return (
    <section style={styles.grid}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          style={{ ...styles.homeButton, background: item.background, color: item.label === 'My clinics' ? 'black' : 'white' }}
          onClick={() => {
            if (item.href) {
              pushCntNavigation(cntHomeEntry());
              window.location.href = item.href;
            }
            else if (item.target) setView(item.target);
          }}
        >
          <span style={{ display: 'block', fontSize: '1.35rem', fontWeight: 500 }}>{item.label}</span>
          {item.subtext && <span style={{ display: 'block', marginTop: '0.35rem', fontWeight: 300 }}>{item.subtext}</span>}
        </button>
      ))}
      <button type="button" style={{ ...styles.homeButton, background: fbOrange, color: 'black' }} onClick={showOffline}>
        Show offline warning
      </button>
    </section>
  );
}

function LocatorView({
  store,
  selectedPatientUuid,
  selectedVolumeUuids,
  toggleVolume,
  openHistory,
  openSend,
  openReceive,
  openAddVolume,
}: {
  store: CntStore;
  selectedPatientUuid: string;
  selectedVolumeUuids: string[];
  toggleVolume: (volumeUuid: string) => void;
  openHistory: (volumeUuid: string) => void;
  openSend: () => void;
  openReceive: () => void;
  openAddVolume: () => void;
}) {
  const patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
  const volumes = store.volumes
    .filter((volume) => volume.patientUuid === selectedPatientUuid)
    .sort(volumeSort);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  if (!patient) {
    return <PatientChooser store={store} />;
  }

  const toggleCollapsed = (key: string) => setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  const tree = buildVolumeTree(volumes);

  return (
    <section style={styles.locatorShell}>
      <div style={styles.locatorScroll}>
      <div style={styles.tree}>
        {Object.entries(tree).map(([hb, localities]) => (
          <TreeNode
            key={hb}
            label={hb}
            level={0}
            nodeKey={`hb:${hb}`}
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
            preventCollapse={volumes.some((volume) => volume.healthBoard === hb && selectedVolumeUuids.includes(volume.uuid))}
          >
            {Object.entries(localities).map(([locality, types]) => (
              <TreeNode
                key={locality}
                label={locality}
                level={1}
                nodeKey={`loc:${hb}:${locality}`}
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
                preventCollapse={volumes.some((volume) => volume.healthBoard === hb && volume.locality === locality && selectedVolumeUuids.includes(volume.uuid))}
              >
                {Object.entries(types).map(([type, items]) => (
                  <TreeNode
                    key={type}
                    label={type}
                    level={2}
                    nodeKey={`type:${hb}:${locality}:${type}`}
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                    preventCollapse={items.some((volume) => selectedVolumeUuids.includes(volume.uuid))}
                  >
                    {items.map((volume) => (
                      <div key={volume.uuid} style={{ ...styles.volumeRow, paddingLeft: '4.8rem' }}>
                        <label style={styles.volumeLabel}>
                          <input
                            type="checkbox"
                            checked={selectedVolumeUuids.includes(volume.uuid)}
                            onChange={() => toggleVolume(volume.uuid)}
                          />
                          <span>Volume {volume.volumeNumber}{volume.temporary ? ' temporary' : ''}</span>
                        </label>
                        <span style={styles.volumeMeta}>{locationLabel(store, volume.currentLocationUuid)}</span>
                        {volume.batchUuid && <span style={styles.badge}>Batch</span>}
                        {store.tags.some((tag) => tag.volumeUuid === volume.uuid && tag.status === 'active') && <span style={styles.badge}>Tag</span>}
                        <FbcntSmallButton onClick={() => openHistory(volume.uuid)}>History</FbcntSmallButton>
                      </div>
                    ))}
                  </TreeNode>
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        ))}
      </div>
      </div>
      <div style={styles.locatorActions}>
        <button type="button" style={{ ...styles.actionTile, background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' }} onClick={openAddVolume}>
          <strong>Add</strong>
          <span>Add new volume</span>
        </button>
        <button type="button" style={{ ...styles.actionTile, background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)', opacity: selectedVolumeUuids.length ? 1 : 0.45 }} onClick={openSend} disabled={!selectedVolumeUuids.length}>
          <strong>Send</strong>
          <span>Send selected volumes</span>
        </button>
        <button type="button" style={{ ...styles.actionTile, background: 'linear-gradient(135deg, #008000, #c5e1a5)', color: 'black', opacity: selectedVolumeUuids.length ? 1 : 0.45 }} onClick={openReceive} disabled={!selectedVolumeUuids.length}>
          <strong>Receive</strong>
          <span>Receive selected volumes</span>
        </button>
      </div>
    </section>
  );
}

function TreeNode({
  label,
  level,
  nodeKey,
  collapsed,
  toggleCollapsed,
  preventCollapse = false,
  children,
}: {
  key?: React.Key;
  label: string;
  level: number;
  nodeKey: string;
  collapsed: Record<string, boolean>;
  toggleCollapsed: (key: string) => void;
  preventCollapse?: boolean;
  children: React.ReactNode;
}) {
  const isCollapsed = !!collapsed[nodeKey];
  return (
    <div>
      <button
        type="button"
        style={{ ...styles.treeToggle, paddingLeft: `${level * 1.6}rem` }}
        onClick={() => {
          if (!isCollapsed && preventCollapse) return;
          toggleCollapsed(nodeKey);
        }}
        aria-disabled={!isCollapsed && preventCollapse}
      >
        <span aria-hidden="true">{isCollapsed ? '\u25b6' : '\u25bc'}</span>
        <strong>{label}</strong>
      </button>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
}

function PatientChooser({ store }: { store: CntStore }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Patients in simulated index</h2>
      <p>Open a patient from Patient search or Patient registry.</p>
      <div style={styles.grid}>
        {store.patients.map((patient) => (
          <div key={patient.uuid} style={styles.miniCard}>
            <strong>{patient.name}</strong>
            <div>NHS {patient.nhsNumber}</div>
            <div>Hospital {patient.hospitalNumber}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryView({ store, volumes }: { store: CntStore; volumes: CntVolume[] }) {
  const events = volumes
    .flatMap((volume) => volume.events.map((event) => ({ ...event, volume })))
    .sort((a, b) => b.datetime.localeCompare(a.datetime));
  return (
    <div style={styles.fullHeightTableWrap}>
      <FbTable aria-label="Volume history">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell>Date/time</FbTableHeaderCell>
            <FbTableHeaderCell>Event</FbTableHeaderCell>
            <FbTableHeaderCell>From</FbTableHeaderCell>
            <FbTableHeaderCell>To</FbTableHeaderCell>
            <FbTableHeaderCell>Note</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {events.map((event) => (
            <FbTableRow key={event.uuid}>
              <FbTableCell>{new Date(event.datetime).toLocaleString('en-GB')}</FbTableCell>
              <FbTableCell>{event.kind}</FbTableCell>
              <FbTableCell>{locationLabel(store, event.fromLocationUuid)}</FbTableCell>
              <FbTableCell>{locationLabel(store, event.toLocationUuid)}</FbTableCell>
              <FbTableCell>{event.note}</FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

function AddVolumePopup({
  store,
  createdDate,
  setCreatedDate,
  healthBoard,
  setHealthBoard,
  locality,
  setLocality,
  volumeType,
  setVolumeType,
  status,
  setStatus,
  volumeNumber,
  setVolumeNumber,
  initialLocationUuid,
  setInitialLocationUuid,
  barcode,
  setBarcode,
  rfid,
  setRfid,
  onAdd,
  onCancel,
}: {
  store: CntStore;
  createdDate: string;
  setCreatedDate: (value: string) => void;
  healthBoard: string;
  setHealthBoard: (value: string) => void;
  locality: string;
  setLocality: (value: string) => void;
  volumeType: string;
  setVolumeType: (value: string) => void;
  status: 'Permanent' | 'Temporary';
  setStatus: (value: 'Permanent' | 'Temporary') => void;
  volumeNumber: string;
  setVolumeNumber: (value: string) => void;
  initialLocationUuid: string;
  setInitialLocationUuid: (value: string) => void;
  barcode: string;
  setBarcode: (value: string) => void;
  rfid: string;
  setRfid: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const healthBoardOptions = uniqueValues(store.locations.map((location) => location.healthBoard));
  const localityOptions = uniqueValues(store.locations
    .filter((location) => !healthBoard || location.healthBoard === healthBoard)
    .map((location) => location.locality));
  const typeOptions = uniqueValues(store.volumes.map((volume) => volume.type).concat(['General', 'Surgery', 'Temporary']));
  return (
    <FbPopup
      title="Add volume"
      maxWidth="42rem"
      footer={
        <div style={styles.popupFooter}>
          <FbButton variant="success" onClick={onAdd}>Add</FbButton>
          <FbButton variant="danger" onClick={onCancel}>Cancel</FbButton>
        </div>
      }
    >
      <div style={styles.addVolumePanel}>
        <FbQuestion label="Created">
          <FbExactDate name="cnt-add-volume-created" value={createdDate} onChange={setCreatedDate} required />
        </FbQuestion>
        <FbDropdown
          label="Health board"
          value={healthBoard}
          onChange={(value) => {
            setHealthBoard(value);
            const stillValidLocality = store.locations.some((location) => location.healthBoard === value && location.locality === locality);
            if (!stillValidLocality) {
              const firstLocality = store.locations.find((location) => location.healthBoard === value)?.locality || '';
              setLocality(firstLocality);
            }
          }}
          options={healthBoardOptions}
        />
        <FbDropdown
          label="Locality"
          value={locality}
          onChange={setLocality}
          options={localityOptions}
        />
        <FbDropdown
          label="Type"
          value={volumeType}
          onChange={setVolumeType}
          options={typeOptions}
        />
        <FbGroup label="Status" labelStyle={{ fontWeight: 500 }}>
          <FbRadio
            name="cnt-add-volume-status"
            value="Permanent"
            checked={status === 'Permanent'}
            onChange={() => setStatus('Permanent')}
            label="Permanent"
          >
            <FbNumberInput label="Volume number" value={volumeNumber} onChange={setVolumeNumber} min={1} subfield />
          </FbRadio>
          <FbRadio
            name="cnt-add-volume-status"
            value="Temporary"
            checked={status === 'Temporary'}
            onChange={() => setStatus('Temporary')}
            label="Temporary"
          />
        </FbGroup>
        <FbcntLocation label="Initial location" store={store} value={initialLocationUuid} onChange={setInitialLocationUuid} />
        <FbTextInput label="Bar code" value={barcode} onChange={setBarcode} />
        <FbTextInput label="RfID" value={rfid} onChange={setRfid} />
      </div>
    </FbPopup>
  );
}

function MovementPopup({
  title,
  store,
  fromLocationUuid,
  toLocationUuid,
  setFromLocationUuid,
  setToLocationUuid,
  actionLabel,
  onAction,
  onCancel,
}: {
  title: string;
  store: CntStore;
  fromLocationUuid: string;
  toLocationUuid: string;
  setFromLocationUuid: (value: string) => void;
  setToLocationUuid: (value: string) => void;
  actionLabel: string;
  onAction: () => void;
  onCancel: () => void;
}) {
  return (
    <FbPopup
      title={title}
      maxWidth="80vw"
      footer={
        <div style={styles.popupFooter}>
          <button type="button" style={styles.sendButton} onClick={onAction}>{actionLabel}</button>
          <button type="button" style={styles.cancelButton} onClick={onCancel}>Cancel</button>
        </div>
      }
    >
      <div style={styles.locationPopupStack}>
        <FbcntFromLocation store={store} value={fromLocationUuid} onChange={setFromLocationUuid} allowBlank />
        <FbcntToLocation store={store} value={toLocationUuid} onChange={setToLocationUuid} />
      </div>
    </FbPopup>
  );
}

function BatchView({ store, createBatch }: { store: CntStore; createBatch: () => void }) {
  return (
    <div style={styles.tablePageStack}>
      <button type="button" style={styles.actionButton} onClick={createBatch}>Create batch from selected volumes</button>
      <FbTable aria-label="Batch management">
        <FbTableBody>
          {store.batches.map((batch) => (
            <FbTableRow key={batch.uuid}>
              <FbTableCell><strong>{batch.barcode}</strong></FbTableCell>
              <FbTableCell>{batch.intendedPurpose}</FbTableCell>
              <FbTableCell>{batch.volumeUuids.length} volumes</FbTableCell>
              <FbTableCell>{locationLabel(store, batch.intendedDestinationUuid)}</FbTableCell>
            </FbTableRow>
          ))}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

function TagsView({ store, addTag }: { store: CntStore; addTag: () => void }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Tags</h2>
      <button type="button" style={styles.actionButton} onClick={addTag}>Tag selected volume</button>
      <FbTable aria-label="Tags">
        <FbTableBody>
          {store.tags.map((tag) => {
            const volume = store.volumes.find((item) => item.uuid === tag.volumeUuid);
            return (
              <FbTableRow key={tag.uuid}>
                <FbTableCell>{volume ? `Volume ${volume.volumeNumber}` : ''}</FbTableCell>
                <FbTableCell>{patientName(store, tag.patientUuid)}</FbTableCell>
                <FbTableCell>{tag.purpose}</FbTableCell>
                <FbTableCell>{new Date(tag.requiredBy).toLocaleDateString('en-GB')}</FbTableCell>
                <FbTableCell>{tag.status}</FbTableCell>
              </FbTableRow>
            );
          })}
        </FbTableBody>
      </FbTable>
    </section>
  );
}

function RequestsView({ store }: { store: CntStore }) {
  return (
    <FbTable aria-label="My requests">
      <FbTableBody>
        {store.requests.map((request) => {
          const volume = store.volumes.find((item) => item.uuid === request.volumeUuid);
          return (
            <FbTableRow key={request.uuid}>
              <FbTableCell>{volume ? `Volume ${volume.volumeNumber}` : ''}</FbTableCell>
              <FbTableCell>{patientName(store, request.patientUuid)}</FbTableCell>
              <FbTableCell>{request.requiredFor}</FbTableCell>
              <FbTableCell>{locationLabel(store, request.fromLocationUuid)}</FbTableCell>
              <FbTableCell>{locationLabel(store, request.toLocationUuid)}</FbTableCell>
              <FbTableCell>{request.status}</FbTableCell>
            </FbTableRow>
          );
        })}
      </FbTableBody>
    </FbTable>
  );
}

function ReturnListView({ store }: { store: CntStore }) {
  const volumes = store.volumes.filter((volume) => volume.events.at(-1)?.kind === 'received');
  return <SelectedVolumeList store={store} volumes={volumes.slice(0, 20)} ariaLabel="My return list" />;
}

function PicklistView({
  store,
  userUuid,
  openPatientLocator,
}: {
  store: CntStore;
  userUuid: string;
  openPatientLocator: (patientUuid: string) => void;
}) {
  const rows = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
    .flatMap((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      return instance.appointments
        .filter((appointment) => !appointment.cancelled)
        .map((appointment) => ({ instance, clinic, appointment }));
    })
    .sort((a, b) => `${a.instance.date} ${a.appointment.time}`.localeCompare(`${b.instance.date} ${b.appointment.time}`));

  return (
    <div style={styles.fullWidthTableWrap}>
      <FbTable aria-label="My picklist appointments">
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell style={{ width: '9rem' }}>Appointment</FbTableHeaderCell>
            <FbTableHeaderCell>Clinic</FbTableHeaderCell>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell>Locations</FbTableHeaderCell>
            <FbTableHeaderCell style={{ width: '6rem' }}>Action</FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {rows.map(({ instance, clinic, appointment }) => {
            const patient = store.patients.find((item) => item.uuid === appointment.patientUuid);
            const volumes = store.volumes.filter((volume) => volume.patientUuid === appointment.patientUuid).sort(volumeSort);
            const locationCounts = volumeLocationCounts(store, volumes);
            return (
              <FbTableRow key={appointment.uuid}>
                <FbTableCell>
                  {formatClinicalDate(instance.date)}
                  <br />
                  {appointment.time}
                </FbTableCell>
                <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                <FbTableCell>{patient && <PatientAddressograph patient={patient} />}</FbTableCell>
                <FbTableCell>
                  {locationCounts.map(({ label, count }) => (
                    <div key={label}>
                      {label}: ({count})
                    </div>
                  ))}
                </FbTableCell>
                <FbTableCell style={{ textAlign: 'right' }}>
                  <FbcntSmallButton onClick={() => openPatientLocator(appointment.patientUuid)}>Locator</FbcntSmallButton>
                </FbTableCell>
              </FbTableRow>
            );
          })}
        </FbTableBody>
      </FbTable>
    </div>
  );
}

function MyClinicsView({
  store,
  userUuid,
  openSelectClinics,
  confirmStopClinic,
}: {
  store: CntStore;
  userUuid: string;
  openSelectClinics: () => void;
  confirmStopClinic: (instanceUuid: string) => void;
}) {
  const instances = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  return (
    <div style={styles.myClinicsPage}>
      <div style={styles.fullWidthTableWrap}>
        <FbTable aria-label="My clinic retrievals">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '10rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {instances.map((instance) => {
              const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
              return (
                <FbTableRow key={instance.uuid}>
                  <FbTableCell>
                    {formatClinicalDate(instance.date)}
                    <br />
                    {instance.startTime}-{instance.endTime}
                  </FbTableCell>
                  <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                  <FbTableCell style={{ textAlign: 'right' }}>
                    <FbcntSmallButton onClick={() => confirmStopClinic(instance.uuid)}>Stop retrieving</FbcntSmallButton>
                  </FbTableCell>
                </FbTableRow>
              );
            })}
          </FbTableBody>
        </FbTable>
      </div>
      <div style={styles.pageAddButtonRow}>
        <FbAddButtonForPage label="Add clinic(s)" onClick={openSelectClinics} />
      </div>
    </div>
  );
}

function SelectClinicsView({
  store,
  currentUserUuid,
  filter,
  setFilter,
  selectedInstanceUuids,
  toggleSelectedInstance,
}: {
  store: CntStore;
  currentUserUuid: string;
  filter: { healthBoard: string; locality: string; facility: string; speciality: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void;
  selectedInstanceUuids: string[];
  toggleSelectedInstance: (instanceUuid: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const instances = store.clinicInstances
    .filter((instance) => instance.date >= today && !instance.cancelled)
    .filter((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      const location = store.locations.find((item) => item.facility === clinic?.facility);
      return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
        && (!filter.locality || location?.locality === filter.locality)
        && (!filter.facility || clinic?.facility === filter.facility)
        && (!filter.speciality || clinic?.speciality === filter.speciality);
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <div style={styles.selectClinicsPage}>
      <FbcntClinicFilter store={store} filter={filter} setFilter={setFilter} />
      <div style={styles.selectClinicsTableWrap}>
        <FbTable aria-label="Select clinics">
          <FbTableHeader>
            <FbTableRow>
              <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
              <FbTableHeaderCell>Clinic</FbTableHeaderCell>
              <FbTableHeaderCell>Retrievers</FbTableHeaderCell>
              <FbTableHeaderCell style={{ width: '5rem', textAlign: 'center' }}>Select</FbTableHeaderCell>
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
            {instances.map((instance) => {
              const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
              return (
                <FbTableRow key={instance.uuid}>
                  <FbTableCell>
                    {formatClinicalDate(instance.date)}
                    <br />
                    {instance.startTime}-{instance.endTime}
                  </FbTableCell>
                  <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
                  <FbTableCell>
                    {instance.retrieverUserUuids.map((retrieverUuid) => {
                      const retriever = store.users.find((item) => item.uuid === retrieverUuid);
                      return retriever ? <div key={retriever.uuid}>{userInitials(retriever)}: {retriever.nadexId}</div> : null;
                    })}
                  </FbTableCell>
                  <FbTableCell style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedInstanceUuids.includes(instance.uuid) || instance.retrieverUserUuids.includes(currentUserUuid)}
                      disabled={instance.retrieverUserUuids.includes(currentUserUuid)}
                      onChange={() => toggleSelectedInstance(instance.uuid)}
                    />
                  </FbTableCell>
                </FbTableRow>
              );
            })}
          </FbTableBody>
        </FbTable>
      </div>
    </div>
  );
}

function FbGroupWithBorder({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset style={styles.groupWithBorder}>
      <legend style={styles.groupWithBorderLegend}>{label}</legend>
      {children}
    </fieldset>
  );
}

function FbcntClinicFilter({
  store,
  filter,
  setFilter,
}: {
  store: CntStore;
  filter: { healthBoard: string; locality: string; facility: string; speciality: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void;
}) {
  const optionValues = {
    healthBoard: uniqueValues(store.locations.map((location) => location.healthBoard)),
    locality: uniqueValues(store.locations.map((location) => location.locality)),
    facility: uniqueValues(store.clinics.map((clinic) => clinic.facility)),
    speciality: uniqueValues(store.clinics.map((clinic) => clinic.speciality)),
  };
  const setOne = (key: keyof typeof filter, value: string) => setFilter({ ...filter, [key]: value });
  return (
    <FbGroupWithBorder label="Filter">
      <FbGridRow cols={4} style={{ marginBottom: 0 }}>
        <FbGridCell>
          <FbDropdown label="Health board" value={filter.healthBoard} onChange={(value) => setOne('healthBoard', value)} options={optionValues.healthBoard} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Locality" value={filter.locality} onChange={(value) => setOne('locality', value)} options={optionValues.locality} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Facility" value={filter.facility} onChange={(value) => setOne('facility', value)} options={optionValues.facility} placeholder="All" subfield />
        </FbGridCell>
        <FbGridCell>
          <FbDropdown label="Speciality" value={filter.speciality} onChange={(value) => setOne('speciality', value)} options={optionValues.speciality} placeholder="All" subfield />
        </FbGridCell>
      </FbGridRow>
    </FbGroupWithBorder>
  );
}

function LocationsView({ store }: { store: CntStore }) {
  return (
    <div style={styles.grid}>
      {store.locations.map((location) => (
        <div key={location.uuid} style={styles.miniCard}>
          <strong>{location.code}</strong>
          <div>{location.healthBoard}</div>
          <div>{location.locality} / {location.facility}</div>
          <div>{location.department} / {location.extra}</div>
          <div>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</div>
        </div>
      ))}
    </div>
  );
}

function AdminView({ store }: { store: CntStore }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Admin</h2>
      <ul>
        <li>{store.patients.length} patients</li>
        <li>{store.volumes.length} volumes</li>
        <li>{store.clinicInstances.length} clinic instances generated up to {store.lastClinicWindowEnd}</li>
        <li>{store.requests.length} requests</li>
        <li>{store.tags.length} tags</li>
      </ul>
    </section>
  );
}

function FbcntScan({
  value,
  onChange,
  onOpen,
  onRfid,
  onCameraScan,
}: {
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onRfid: () => void;
  onCameraScan: () => void;
}) {
  return (
    <section style={styles.scanBar} aria-label="Scan or enter identifier">
      <input
        style={styles.scanInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onOpen();
        }}
        placeholder="Scan NHS number, hospital number, volume barcode, RFID, batch or location"
      />
      <FbButton variant="primary" onClick={onOpen}>Open</FbButton>
      <button type="button" style={styles.rfidButton} onClick={onRfid}>RFID</button>
      <FbButton variant="primary" onClick={onCameraScan}>Camera scan</FbButton>
    </section>
  );
}

function FbcntSmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" style={styles.fbcntSmallButton} onClick={onClick}>
      {children}
    </button>
  );
}

function FbcntLocation({ label, store, value, onChange, allowBlank = false }: { label: string; store: CntStore; value: string; onChange: (value: string) => void; allowBlank?: boolean }) {
  const inputId = React.useId();
  const selectedLabel = locationLabel(store, value);
  return (
    <label style={styles.label}>
      {label}
      <input
        list={inputId}
        style={styles.locationInput}
        value={selectedLabel}
        onChange={(event) => {
          const typed = event.target.value;
          const location = store.locations.find((item) => locationLabel(store, item.uuid) === typed);
          onChange(location ? location.uuid : allowBlank && typed.trim() === '' ? '' : value);
        }}
        onFocus={(event) => event.currentTarget.select()}
      />
      <datalist id={inputId}>
        {allowBlank && <option value="" />}
        {store.locations.map((location) => (
          <option key={location.uuid} value={locationLabel(store, location.uuid)} />
        ))}
      </datalist>
    </label>
  );
}

function FbcntFromLocation(props: Omit<Parameters<typeof FbcntLocation>[0], 'label'>) {
  return <FbcntLocation {...props} label="From" />;
}

function FbcntToLocation(props: Omit<Parameters<typeof FbcntLocation>[0], 'label'>) {
  return <FbcntLocation {...props} label="To" />;
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
            <FbTableCell>{locationLabel(store, volume.currentLocationUuid)}</FbTableCell>
          </FbTableRow>
        ))}
      </FbTableBody>
    </FbTable>
  );
}

function PatientAddressograph({ patient }: { patient: CntPatient }) {
  return (
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
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function locationHyphenLabel(store: CntStore, locationUuid: string) {
  const location = store.locations.find((item) => item.uuid === locationUuid);
  if (!location) return '';
  return [location.healthBoard, location.locality, location.facility, location.department, location.extra]
    .filter(Boolean)
    .join('-');
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

function formatClinicalDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
  headerRight: {
    fontWeight: 500,
    color: '#333',
  } as React.CSSProperties,
  footer: {
    minHeight: '2.8rem',
    borderTop: `0.2rem solid ${fbBlue}`,
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
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
  status: {
    color: fbGreen,
    fontWeight: 500,
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
  addVolumePanel: {
    width: 'min(48rem, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  inlineCheckLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
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
  sendButton: {
    border: `0.1rem solid ${fbGreen}`,
    borderRadius: '0.4rem',
    backgroundColor: fbGreen,
    color: 'white',
    padding: '0.35rem 0.8rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  cancelButton: {
    border: `0.1rem solid ${fbRed}`,
    borderRadius: '0.4rem',
    backgroundColor: fbRed,
    color: 'white',
    padding: '0.35rem 0.8rem',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
};
