import { fbDropdown as FbDropdown } from '../components/fbDropdown';
import { fbGridCell as FbGridCell } from '../components/fbGridCell';
import { fbGridRow as FbGridRow } from '../components/fbGridRow';
import type { CntStore } from './cntStore';
import { FbGroupWithBorder } from './fbGroupWithBorder';
import type { CntClinicFilterState } from './fbcntPageComponents';
import { uniqueValues } from './fbcntPageComponents';

export function FbcntClinicFilter({
  store,
  filter,
  setFilter,
}: {
  store: CntStore;
  filter: CntClinicFilterState;
  setFilter: (next: CntClinicFilterState) => void;
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
