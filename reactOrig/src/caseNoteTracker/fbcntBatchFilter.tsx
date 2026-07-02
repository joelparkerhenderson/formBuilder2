import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import type { CntStore } from './cntStore';
import { FbGroupWithBorder } from './fbGroupWithBorder';
import { uniqueValues } from './fbcntPageComponents';

export function FbcntBatchFilter({
  store,
  filter,
  setFilter,
}: {
  store: CntStore;
  filter: { healthBoard: string; locality: string; facility: string; purpose: string };
  setFilter: (next: { healthBoard: string; locality: string; facility: string; purpose: string }) => void;
}) {
  const optionValues = {
    healthBoard: uniqueValues(store.locations.map((location) => location.healthBoard)),
    locality: uniqueValues(store.locations.map((location) => location.locality)),
    facility: uniqueValues(store.locations.map((location) => location.facility)),
    purpose: uniqueValues(store.batches.map((batch) => batch.intendedPurpose)),
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
          <FbDropdown label="Purpose" value={filter.purpose} onChange={(value) => setOne('purpose', value)} options={optionValues.purpose} placeholder="All" subfield />
        </FbGridCell>
      </FbGridRow>
    </FbGroupWithBorder>
  );
}
