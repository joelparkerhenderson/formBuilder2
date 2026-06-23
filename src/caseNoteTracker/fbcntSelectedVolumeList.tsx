import { fbTable as FbTable, fbTableBody as FbTableBody, fbTableRow as FbTableRow } from '../components/fbTable';
import { fbTableCell as FbTableCell } from '../components/fbTableCell';
import type { CntStore, CntVolume } from './cntStore';
import { patientName } from './cntStore';
import { FbcntLocationDisplay } from './fbcntLocationDisplay';

export function SelectedVolumeList({ store, volumes, ariaLabel = 'Selected volumes' }: { store: CntStore; volumes: CntVolume[]; ariaLabel?: string }) {
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
