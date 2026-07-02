import type { CntStore } from './cntStore';
import { locationLabel } from './cntStore';
import { styles } from './fbcntPageComponents';

export function LocationSelect({ label, store, value, onChange, allowBlank = false }: { label: string; store: CntStore; value: string; onChange: (value: string) => void; allowBlank?: boolean }) {
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
