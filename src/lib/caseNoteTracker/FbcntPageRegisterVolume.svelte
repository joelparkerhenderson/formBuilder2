<script lang="ts">
  import type { CntStore } from './cntStore';
  import FbcntManageVolume, { type FbcntManageVolumeValue, type FbcntVolumeRecordStatus } from './FbcntManageVolume.svelte';

  export let store: CntStore;
  export let createdDate = '';
  export let setCreatedDate: (value: string) => void = () => {};
  export let healthBoard = '';
  export let setHealthBoard: (value: string) => void = () => {};
  export let locality = '';
  export let setLocality: (value: string) => void = () => {};
  export let volumeType = '';
  export let setVolumeType: (value: string) => void = () => {};
  export let status: 'Permanent' | 'Temporary' = 'Permanent';
  export let setStatus: (value: 'Permanent' | 'Temporary') => void = () => {};
  export let recordStatus: FbcntVolumeRecordStatus = 'active';
  export let setRecordStatus: (value: FbcntVolumeRecordStatus) => void = () => {};
  export let volumeNumber = '';
  export let setVolumeNumber: (value: string) => void = () => {};
  export let dateClosed = '';
  export let setDateClosed: (value: string) => void = () => {};
  export let dateDestroyed = '';
  export let setDateDestroyed: (value: string) => void = () => {};
  export let reasonDestroyed = '';
  export let setReasonDestroyed: (value: string) => void = () => {};
  export let initialLocationUuid = '';
  export let setInitialLocationUuid: (value: string) => void = () => {};
  export let barcode = '';
  export let setBarcode: (value: string) => void = () => {};
  export let rfid = '';
  export let setRfid: (value: string) => void = () => {};
  export let batchUuid = '';
  export let setBatchUuid: (value: string) => void = () => {};

  $: value = {
    healthBoard,
    locality,
    volumeType,
    permanentTemporary: status,
    recordStatus,
    volumeNumber,
    dateCreated: createdDate,
    dateClosed,
    dateDestroyed,
    reasonDestroyed,
    mergedIntoVolumeUuid: '',
    locationUuid: initialLocationUuid,
    barcode,
    rfid,
    batchUuid,
  } satisfies FbcntManageVolumeValue;

  function updateValue(next: FbcntManageVolumeValue) {
    setHealthBoard(next.healthBoard);
    setLocality(next.locality);
    setVolumeType(next.volumeType);
    setStatus(next.permanentTemporary);
    setRecordStatus(next.recordStatus);
    setVolumeNumber(next.volumeNumber);
    setCreatedDate(next.dateCreated);
    setDateClosed(next.dateClosed);
    setDateDestroyed(next.dateDestroyed);
    setReasonDestroyed(next.reasonDestroyed);
    setInitialLocationUuid(next.locationUuid);
    setBarcode(next.barcode);
    setRfid(next.rfid);
    setBatchUuid(next.batchUuid);
  }
</script>

<FbcntManageVolume {store} {value} onChange={updateValue} />
