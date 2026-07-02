<script lang="ts">
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbGridCell from '$lib/components/fb/fbGridCell.svelte';
  import FbGridRow from '$lib/components/fb/fbGridRow.svelte';
  import FbHBSelector from '$lib/components/fb/fbHBSelector.svelte';
  import type { CntStore } from './cntStore';
  import FbGroupWithBorder from './FbGroupWithBorder.svelte';

  export let store: CntStore;
  export let filter: { healthBoard: string; locality: string; facility: string; speciality: string } = { healthBoard: '', locality: '', facility: '', speciality: '' };
  export let setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void = () => {};

  $: healthBoardOptions = toOptions(uniqueValues(store.locations.map((location) => location.healthBoard)));
  $: localityOptions = toOptions(uniqueValues(store.locations.map((location) => location.locality)));
  $: facilityOptions = toOptions(uniqueValues(store.clinics.map((clinic) => clinic.facility)));
  $: specialityOptions = toOptions(uniqueValues(store.clinics.map((clinic) => clinic.speciality)));

  function uniqueValues(values: string[]) {
    return Array.from(new Set(values.filter(Boolean).map(String))).sort((a, b) => a.localeCompare(b));
  }

  function toOptions(values: string[]) {
    return values.map((value) => ({ value, label: value }));
  }

  function setOne(key: keyof typeof filter, value: string) {
    setFilter({ ...filter, [key]: value });
  }
</script>

<FbGroupWithBorder label="Filter">
  <FbGridRow cols={4}>
    <FbGridCell><FbHBSelector label="Health board" value={filter.healthBoard} onChange={(value) => setOne('healthBoard', value)} options={healthBoardOptions} placeholder="All" /></FbGridCell>
    <FbGridCell><FbDropdown label="Locality" value={filter.locality} onChange={(value) => setOne('locality', value)} options={localityOptions} placeholder="All" /></FbGridCell>
    <FbGridCell><FbDropdown label="Facility" value={filter.facility} onChange={(value) => setOne('facility', value)} options={facilityOptions} placeholder="All" /></FbGridCell>
    <FbGridCell><FbDropdown label="Speciality" value={filter.speciality} onChange={(value) => setOne('speciality', value)} options={specialityOptions} placeholder="All" /></FbGridCell>
  </FbGridRow>
</FbGroupWithBorder>
