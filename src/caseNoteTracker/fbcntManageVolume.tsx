import React from 'react';
import type { CntStore, CntVolume } from './cntStore';
import {
  FbCheck,
  FbDropdown,
  FbExactDate,
  FbGroup,
  FbNumberInput,
  FbQuestion,
  FbRadio,
  FbRoVField,
  FbTextInput,
  FbcntLocation,
  VolumeTagLine,
  styles,
  uniqueValues,
} from './fbcntPageComponents';

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

export function validateFbcntManageVolumeValue(value: FbcntManageVolumeValue) {
  if (value.recordStatus === 'closed' && !value.dateClosed.trim()) {
    return 'Enter a date closed before saving a closed volume.';
  }
  if (value.uuid && value.recordStatus === 'closed' && !value.mergedIntoVolumeUuid.trim()) {
    return 'Select the volume that this volume was merged into before saving a closed volume.';
  }
  if (value.recordStatus === 'destroyed') {
    if (!value.dateDestroyed.trim() && !value.reasonDestroyed.trim()) {
      return 'Enter a date destroyed and reason destroyed before saving a destroyed volume.';
    }
    if (!value.dateDestroyed.trim()) return 'Enter a date destroyed before saving a destroyed volume.';
    if (!value.reasonDestroyed.trim()) return 'Enter a reason destroyed before saving a destroyed volume.';
  }
  return '';
}

export function FbcntManageVolume({
  store,
  value,
  onChange,
  showReadOnlyIdentifiers = false,
}: {
  store: CntStore;
  value: FbcntManageVolumeValue;
  onChange: (next: FbcntManageVolumeValue) => void;
  showReadOnlyIdentifiers?: boolean;
}) {
  const healthBoardOptions = uniqueValues(store.locations.map((location) => location.healthBoard));
  const localityOptions = uniqueValues(store.locations
    .filter((location) => !value.healthBoard || location.healthBoard === value.healthBoard)
    .map((location) => location.locality));
  const typeOptions = uniqueValues(store.volumes.map((volume) => volume.type).concat(['General', 'Surgery', 'Temporary']));
  const mergeTargetOptions = store.volumes
    .filter((volume) => volume.uuid !== value.uuid && volume.patientNhsNumber === value.patientNhsNumber && volume.status !== 'destroyed')
    .map((volume) => ({
      value: volume.uuid,
      label: `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`,
    }));
  const setOne = <K extends keyof FbcntManageVolumeValue>(key: K, nextValue: FbcntManageVolumeValue[K]) => {
    onChange({ ...value, [key]: nextValue });
  };
  const setRecordStatus = (recordStatus: FbcntVolumeRecordStatus) => {
    onChange({ ...value, recordStatus });
  };
  const currentVolume = showReadOnlyIdentifiers && value.uuid
    ? store.volumes.find((volume) => volume.uuid === value.uuid)
    : undefined;
  return (
    <section style={styles.addVolumePage}>
      {showReadOnlyIdentifiers && value.uuid && (
        <div className="fbcnt-manage-volume-summary" style={styles.manageVolumeSummary}>
          <FbRoVField label="Volume UUID" value={value.uuid} />
          {currentVolume && <VolumeTagLine store={store} volume={currentVolume} />}
        </div>
      )}
      <FbDropdown
        label="Health board"
        value={value.healthBoard}
        onChange={(healthBoard) => {
          const stillValidLocality = store.locations.some((location) => location.healthBoard === healthBoard && location.locality === value.locality);
          const locality = stillValidLocality ? value.locality : store.locations.find((location) => location.healthBoard === healthBoard)?.locality || '';
          onChange({ ...value, healthBoard, locality });
        }}
        options={healthBoardOptions}
      />
      <FbDropdown
        label="Locality"
        value={value.locality}
        onChange={(locality) => setOne('locality', locality)}
        options={localityOptions}
      />
      <FbDropdown
        label="Type"
        value={value.volumeType}
        onChange={(volumeType) => setOne('volumeType', volumeType)}
        options={typeOptions}
      />
      <FbGroup label="Permanent/Temporary" labelStyle={{ fontWeight: 500 }}>
        <FbRadio
          name="cnt-volume-permanent-temporary"
          value="Permanent"
          checked={value.permanentTemporary === 'Permanent'}
          onChange={() => setOne('permanentTemporary', 'Permanent')}
          label="Permanent"
        >
          <FbNumberInput label="Volume number" value={value.volumeNumber} onChange={(volumeNumber) => setOne('volumeNumber', volumeNumber)} min={1} subfield />
        </FbRadio>
        <FbRadio
          name="cnt-volume-permanent-temporary"
          value="Temporary"
          checked={value.permanentTemporary === 'Temporary'}
          onChange={() => setOne('permanentTemporary', 'Temporary')}
          label="Temporary"
        />
      </FbGroup>
      <FbGroup label="Status" labelStyle={{ fontWeight: 500 }}>
        <FbCheck name="cnt-volume-record-status" checked={value.recordStatus === 'active'} onChange={() => setRecordStatus('active')} label="Active" />
        <FbCheck name="cnt-volume-record-status" checked={value.recordStatus === 'closed'} onChange={() => setRecordStatus('closed')} label="Closed" />
        <FbCheck name="cnt-volume-record-status" checked={value.recordStatus === 'destroyed'} onChange={() => setRecordStatus('destroyed')} label="Destroyed" />
      </FbGroup>
      <FbQuestion label="Date created" required>
        <FbExactDate name="cnt-volume-date-created" value={value.dateCreated} onChange={(dateCreated) => setOne('dateCreated', dateCreated)} required />
      </FbQuestion>
      <FbQuestion label="Date closed">
        <FbExactDate name="cnt-volume-date-closed" value={value.dateClosed} onChange={(dateClosed) => setOne('dateClosed', dateClosed)} />
      </FbQuestion>
      {value.recordStatus === 'closed' && (
        <FbDropdown
          label="Merged into"
          value={value.mergedIntoVolumeUuid}
          onChange={(mergedIntoVolumeUuid) => setOne('mergedIntoVolumeUuid', mergedIntoVolumeUuid)}
          options={mergeTargetOptions}
          placeholder="Select target volume"
          required
        />
      )}
      <FbQuestion label="Date destroyed">
        <FbExactDate name="cnt-volume-date-destroyed" value={value.dateDestroyed} onChange={(dateDestroyed) => setOne('dateDestroyed', dateDestroyed)} />
      </FbQuestion>
      <FbTextInput label="Reason destroyed" value={value.reasonDestroyed} onChange={(reasonDestroyed) => setOne('reasonDestroyed', reasonDestroyed)} />
      <FbcntLocation label="Location" store={store} value={value.locationUuid} onChange={(locationUuid) => setOne('locationUuid', locationUuid)} />
      <FbTextInput label="Bar code" value={value.barcode} onChange={(barcode) => setOne('barcode', barcode)} />
      <FbTextInput label="RfID" value={value.rfid} onChange={(rfid) => setOne('rfid', rfid)} />
      <FbTextInput label="Batch UUID" value={value.batchUuid} onChange={(batchUuid) => setOne('batchUuid', batchUuid)} />
    </section>
  );
}
