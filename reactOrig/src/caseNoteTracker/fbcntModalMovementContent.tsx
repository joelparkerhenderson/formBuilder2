import { fbButton as FbButton } from '../components/fbButton';
import { fbModal as FbModal } from '../components/fbModal';
import type { CntStore } from './cntStore';
import { FbcntFromLocation, FbcntToLocation } from './fbcntLocation';
import { styles } from './fbcntPageComponents';

export function MovementModalContent({
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
    <FbModal
      title={title}
      maxWidth="80vw"
      footer={
        <div style={styles.popupFooter}>
          <FbButton variant="success" onClick={onAction}>{actionLabel}</FbButton>
          <FbButton variant="danger" onClick={onCancel}>Cancel</FbButton>
        </div>
      }
    >
      <div style={styles.locationPopupStack}>
        <FbcntFromLocation store={store} value={fromLocationUuid} onChange={setFromLocationUuid} allowBlank />
        <FbcntToLocation store={store} value={toLocationUuid} onChange={setToLocationUuid} />
      </div>
    </FbModal>
  );
}
