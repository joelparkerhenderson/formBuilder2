import { fbDateDisplay as FbDateDisplay } from '../components/fbDateDisplay';
import { fbTimeDisplay as FbTimeDisplay } from '../components/fbTimeDisplay';
import { fbTable as FbTable, fbTableBody as FbTableBody, fbTableHeader as FbTableHeader, fbTableHeaderCell as FbTableHeaderCell, fbTableRow as FbTableRow } from '../components/fbTable';
import { fbTableCell as FbTableCell } from '../components/fbTableCell';
import type { CntClinicInstance, CntStore } from './cntStore';
import { FbcntLocationDisplay } from './fbcntLocationDisplay';
import { FbcntSmallButton } from './fbcntSmallButton';
import { clinicSummary } from './fbcntPageComponents';

export function ClinicInstancesTable({
  store,
  instances,
  openClinicList,
}: {
  store: CntStore;
  instances: CntClinicInstance[];
  openClinicList: (clinicInstanceUuid: string) => void;
}) {
  return (
    <FbTable aria-label="Clinic instances">
      <FbTableHeader>
        <FbTableRow>
          <FbTableHeaderCell style={{ width: '10rem' }}>Clinic instance</FbTableHeaderCell>
          <FbTableHeaderCell>Clinic</FbTableHeaderCell>
          <FbTableHeaderCell>Holding location</FbTableHeaderCell>
          <FbTableHeaderCell style={{ width: '8rem', textAlign: 'right' }}>Action</FbTableHeaderCell>
        </FbTableRow>
      </FbTableHeader>
      <FbTableBody>
        {instances.map((instance) => {
          const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
          return (
            <FbTableRow key={instance.uuid}>
              <FbTableCell>
                <FbDateDisplay value={instance.date} />
                <br />
                <FbTimeDisplay value={instance.startTime} />-<FbTimeDisplay value={instance.endTime} />
              </FbTableCell>
              <FbTableCell>{clinicSummary(clinic)}</FbTableCell>
              <FbTableCell>{clinic ? <FbcntLocationDisplay store={store} locationUuid={clinic.holdingLocationUuid} compact /> : ''}</FbTableCell>
              <FbTableCell style={{ textAlign: 'right' }}>
                <FbcntSmallButton onClick={() => openClinicList(instance.uuid)}>Clinic list</FbcntSmallButton>
              </FbTableCell>
            </FbTableRow>
          );
        })}
      </FbTableBody>
    </FbTable>
  );
}
