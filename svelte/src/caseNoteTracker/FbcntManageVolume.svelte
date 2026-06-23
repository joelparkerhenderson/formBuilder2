<script lang="ts" context="module">
  import type { CntStore, CntVolume } from './cntStore';
  import { uuid } from './cntStore';

  export type FbcntVolumeRecordStatus = 'active' | 'closed' | 'destroyed';

  export type FbcntManageVolumeValue = {
    healthBoard: string;
    locality: string;
    volumeType: string;
    permanentTemporary: 'Permanent' | 'Temporary';
    recordStatus: FbcntVolumeRecordStatus;
    volumeNumber: string;
    dateCreated: string;
    dateClosed: string;
    dateDestroyed: string;
    reasonDestroyed: string;
    mergedIntoVolumeUuid: string;
    locationUuid: string;
    barcode: string;
    rfid: string;
    batchUuid: string;
    uuid?: string;
    patientNhsNumber?: string;
    patientHospitalNumber?: string;
  };

  export function fbcntVolumeValueFromVolume(volume: CntVolume): FbcntManageVolumeValue {
    const createdEvent = volume.events.find((event) => event.kind === 'created');
    return {
      healthBoard: volume.healthBoard,
      locality: volume.locality,
      volumeType: volume.type,
      permanentTemporary: volume.temporary ? 'Temporary' : 'Permanent',
      recordStatus: volume.status || 'active',
      volumeNumber: String(volume.volumeNumber),
      dateCreated: volume.dateCreated || createdEvent?.datetime.slice(0, 10) || '',
      dateClosed: volume.dateClosed || '',
      dateDestroyed: volume.dateDestroyed || '',
      reasonDestroyed: volume.reasonDestroyed || '',
      mergedIntoVolumeUuid: volume.mergedIntoVolumeUuid || [...volume.events].reverse().find((event) => event.kind === 'merged')?.targetVolumeUuid || '',
      locationUuid: volume.currentLocationUuid,
      barcode: volume.barcode,
      rfid: volume.rfid,
      batchUuid: volume.batchUuid || '',
      uuid: volume.uuid,
      patientNhsNumber: volume.patientNhsNumber,
      patientHospitalNumber: volume.patientHospitalNumber,
    };
  }

  export function fbcntVolumePatchFromValue(value: FbcntManageVolumeValue, fallbackVolume: CntVolume): Partial<CntVolume> {
    const volumeNumber = Number(value.volumeNumber);
    return {
      healthBoard: value.healthBoard,
      locality: value.locality,
      type: value.volumeType,
      temporary: value.permanentTemporary === 'Temporary',
      status: value.recordStatus,
      volumeNumber: Number.isFinite(volumeNumber) && volumeNumber > 0 ? volumeNumber : fallbackVolume.volumeNumber,
      dateCreated: value.dateCreated || undefined,
      dateClosed: value.dateClosed || undefined,
      dateDestroyed: value.dateDestroyed || undefined,
      reasonDestroyed: value.reasonDestroyed.trim() || undefined,
      mergedIntoVolumeUuid: value.recordStatus === 'closed' ? value.mergedIntoVolumeUuid || undefined : undefined,
      currentLocationUuid: value.locationUuid,
      barcode: value.barcode,
      rfid: value.rfid,
      batchUuid: value.batchUuid || undefined,
    };
  }

  export function fbcntVolumeHistoryPatchForStatusReversal(volume: CntVolume, patch: Partial<CntVolume>, userUuid: string, store?: CntStore): Partial<CntVolume> {
    const shouldRecordUnclosed = volume.status === 'closed' && patch.status === 'active';
    const shouldRecordUndestroyed = volume.status === 'destroyed' && patch.status === 'active';
    const shouldRecordMerged = volume.status !== 'closed' && patch.status === 'closed';
    if (!shouldRecordUnclosed && !shouldRecordUndestroyed && !shouldRecordMerged) return {};
    if (shouldRecordMerged) {
      const mergeTargetVolume = store?.volumes.find((item) => item.uuid === patch.mergedIntoVolumeUuid);
      const mergeTargetLabel = mergeTargetVolume
        ? `${mergeTargetVolume.temporary ? 'Temporary volume' : 'Volume'} ${mergeTargetVolume.volumeNumber} - ${mergeTargetVolume.healthBoard} / ${mergeTargetVolume.locality} / ${mergeTargetVolume.type}`
        : patch.mergedIntoVolumeUuid;
      return {
        events: [
          ...volume.events,
          {
            uuid: uuid(`${volume.uuid}-merged-${Date.now()}`),
            kind: 'merged',
            datetime: new Date().toISOString(),
            fromLocationUuid: volume.currentLocationUuid,
            toLocationUuid: patch.currentLocationUuid || volume.currentLocationUuid,
            targetVolumeUuid: patch.mergedIntoVolumeUuid,
            userUuid,
            note: `Merged into ${mergeTargetLabel}`,
          },
        ],
      };
    }
    return {
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
    };
  }

  export function validateFbcntManageVolumeValue(value: FbcntManageVolumeValue) {
    if (value.recordStatus === 'closed' && !value.dateClosed.trim()) return 'Enter a date closed before saving a closed volume.';
    if (value.uuid && value.recordStatus === 'closed' && !value.mergedIntoVolumeUuid.trim()) return 'Select the volume that this volume was merged into before saving a closed volume.';
    if (value.recordStatus === 'destroyed') {
      if (!value.dateDestroyed.trim() && !value.reasonDestroyed.trim()) return 'Enter a date destroyed and reason destroyed before saving a destroyed volume.';
      if (!value.dateDestroyed.trim()) return 'Enter a date destroyed before saving a destroyed volume.';
      if (!value.reasonDestroyed.trim()) return 'Enter a reason destroyed before saving a destroyed volume.';
    }
    return '';
  }
</script>

<script lang="ts">
  import FbCheck from '../components/fbCheck.svelte';
  import FbDropdown from '../components/fbDropdown.svelte';
  import FbDateExact from '../components/fbDateExact.svelte';
  import FbGroup from '../components/fbGroup.svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbRoVField from '../components/fbRoVField.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import FbcntLocation from './FbcntLocation.svelte';
  import VolumeTagLine from './fbcntVolumeTagLine.svelte';

  export let store: CntStore;
  export let value: FbcntManageVolumeValue;
  export let onChange: (next: FbcntManageVolumeValue) => void = () => {};
  export let showReadOnlyIdentifiers = false;

  $: currentVolume = showReadOnlyIdentifiers && value?.uuid ? store.volumes.find((volume) => volume.uuid === value.uuid) : undefined;
  $: healthBoardOptions = unique(store.locations.map((location) => location.healthBoard)).map(toOption);
  $: localityOptions = unique(store.locations.filter((location) => !value.healthBoard || location.healthBoard === value.healthBoard).map((location) => location.locality)).map(toOption);
  $: typeOptions = unique(store.volumes.map((volume) => volume.type).concat(['General', 'Surgery', 'Temporary'])).map(toOption);
  $: mergeTargetOptions = store.volumes
    .filter((volume) => volume.uuid !== value.uuid && volume.patientNhsNumber === value.patientNhsNumber && volume.status !== 'destroyed')
    .map((volume) => ({
      value: volume.uuid,
      label: `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`,
    }));

  function unique(values: string[]) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }
  function toOption(value: string) {
    return { value, label: value };
  }
  function setOne<K extends keyof FbcntManageVolumeValue>(key: K, nextValue: FbcntManageVolumeValue[K]) {
    onChange({ ...value, [key]: nextValue });
  }
</script>

<section class="manage-volume">
  {#if showReadOnlyIdentifiers && value.uuid}
    <div class="summary">
      <FbRoVField label="Volume UUID" value={value.uuid} />
      {#if currentVolume}<VolumeTagLine {store} volume={currentVolume} />{/if}
    </div>
  {/if}
  <FbDropdown label="Health board" value={value.healthBoard} options={healthBoardOptions} onChange={(healthBoard) => {
    const stillValidLocality = store.locations.some((location) => location.healthBoard === healthBoard && location.locality === value.locality);
    const locality = stillValidLocality ? value.locality : store.locations.find((location) => location.healthBoard === healthBoard)?.locality || '';
    onChange({ ...value, healthBoard, locality });
  }} />
  <FbDropdown label="Locality" value={value.locality} options={localityOptions} onChange={(locality) => setOne('locality', locality)} />
  <FbDropdown label="Type" value={value.volumeType} options={typeOptions} onChange={(volumeType) => setOne('volumeType', volumeType)} />
  <FbGroup label="Permanent/Temporary">
    <FbCheck name="cnt-volume-permanent" checked={value.permanentTemporary === 'Permanent'} label="Permanent" onChange={() => setOne('permanentTemporary', 'Permanent')} />
    <FbCheck name="cnt-volume-temporary" checked={value.permanentTemporary === 'Temporary'} label="Temporary" onChange={() => setOne('permanentTemporary', 'Temporary')} />
    {#if value.permanentTemporary === 'Permanent'}
      <FbTextInput label="Volume number" value={value.volumeNumber} onChange={(volumeNumber) => setOne('volumeNumber', volumeNumber)} />
    {/if}
  </FbGroup>
  <FbGroup label="Status">
    <FbCheck name="cnt-volume-status-active" checked={value.recordStatus === 'active'} label="Active" onChange={() => setOne('recordStatus', 'active')} />
    <FbCheck name="cnt-volume-status-closed" checked={value.recordStatus === 'closed'} label="Closed" onChange={() => setOne('recordStatus', 'closed')} />
    <FbCheck name="cnt-volume-status-destroyed" checked={value.recordStatus === 'destroyed'} label="Destroyed" onChange={() => setOne('recordStatus', 'destroyed')} />
  </FbGroup>
  <FbQuestion label="Date created" required><FbDateExact name="cnt-volume-date-created" value={value.dateCreated} required onChange={(dateCreated) => setOne('dateCreated', dateCreated)} /></FbQuestion>
  <FbQuestion label="Date closed"><FbDateExact name="cnt-volume-date-closed" value={value.dateClosed} onChange={(dateClosed) => setOne('dateClosed', dateClosed)} /></FbQuestion>
  {#if value.recordStatus === 'closed'}
    <FbDropdown label="Merged into" value={value.mergedIntoVolumeUuid} options={mergeTargetOptions} placeholder="Select target volume" required onChange={(mergedIntoVolumeUuid) => setOne('mergedIntoVolumeUuid', mergedIntoVolumeUuid)} />
  {/if}
  <FbQuestion label="Date destroyed"><FbDateExact name="cnt-volume-date-destroyed" value={value.dateDestroyed} onChange={(dateDestroyed) => setOne('dateDestroyed', dateDestroyed)} /></FbQuestion>
  <FbTextInput label="Reason destroyed" value={value.reasonDestroyed} onChange={(reasonDestroyed) => setOne('reasonDestroyed', reasonDestroyed)} />
  <FbcntLocation label="Location" {store} value={value.locationUuid} onChange={(locationUuid) => setOne('locationUuid', locationUuid)} />
  <FbTextInput label="Bar code" value={value.barcode} onChange={(barcode) => setOne('barcode', barcode)} />
  <FbTextInput label="RfID" value={value.rfid} onChange={(rfid) => setOne('rfid', rfid)} />
  <FbTextInput label="Batch UUID" value={value.batchUuid} onChange={(batchUuid) => setOne('batchUuid', batchUuid)} />
</section>

<style>
  .manage-volume {
    width: min(48rem, 100%);
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .summary {
    display: grid;
    gap: 0.4rem;
  }
</style>
