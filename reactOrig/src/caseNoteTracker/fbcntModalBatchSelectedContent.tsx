import { fbButton as FbButton } from '../components/fbButton';
import { fbModal as FbModal } from '../components/fbModal';
import type { CntStore } from './cntStore';
import { styles, userBatchUuids } from './fbcntPageComponents';

export function BatchSelectedModalContent({
  store,
  userUuid,
  onSelectBatch,
  onCancel,
}: {
  store: CntStore;
  userUuid: string;
  onSelectBatch: (batchUuid: string) => void;
  onCancel: () => void;
}) {
  const batches = store.batches.filter((batch) => userBatchUuids(store, userUuid).includes(batch.uuid));
  return (
    <FbModal
      title="Batch selected volumes"
      footer={<div style={styles.popupFooter}><FbButton variant="danger" onClick={onCancel}>Cancel</FbButton></div>}
    >
      <div style={styles.batchPopupList}>
        {batches.map((batch) => (
          <button key={batch.uuid} type="button" style={styles.batchPopupButton} onClick={() => onSelectBatch(batch.uuid)}>
            <strong>{batch.barcode}</strong>
            <span>{batch.intendedPurpose}</span>
            <span>{batch.volumeUuids.length} volumes</span>
          </button>
        ))}
        {!batches.length && <p>No favourite batches.</p>}
      </div>
    </FbModal>
  );
}
