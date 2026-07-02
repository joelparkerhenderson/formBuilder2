<script lang="ts">
  import FbBoxedInfo from '$lib/components/fb/fbBoxedInfo.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbHBSelector from '$lib/components/fb/fbHBSelector.svelte';
  import type { CntStore } from './cntStore';

  export let store: CntStore;
  export let healthBoard = '';
  export let locality = '';
  export let facility = '';
  export let setHealthBoard: (value: string) => void = () => {};
  export let setLocality: (value: string) => void = () => {};
  export let setFacility: (value: string) => void = () => {};

  $: healthBoardOptions = unique((store?.locations || []).map((location) => location.healthBoard));
  $: localityOptions = unique((store?.locations || [])
    .filter((location) => !healthBoard || location.healthBoard === healthBoard)
    .map((location) => location.locality));
  $: facilityOptions = unique((store?.locations || [])
    .filter((location) => (!healthBoard || location.healthBoard === healthBoard) && (!locality || location.locality === locality))
    .map((location) => location.facility));

  function unique(values: string[]) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }
</script>

<section class="preferences-page">
  <FbBoxedInfo text="In demo versions, this user preferences page is displayed after every login." />
  <FbHBSelector label="Health board" value={healthBoard} options={healthBoardOptions} onChange={(value) => {
    setHealthBoard(value);
    const nextLocality = store.locations.find((location) => location.healthBoard === value)?.locality || '';
    setLocality(nextLocality);
    setFacility(store.locations.find((location) => location.healthBoard === value && location.locality === nextLocality)?.facility || '');
  }} />
  <FbDropdown label="Locality" value={locality} options={localityOptions} onChange={(value) => {
    setLocality(value);
    setFacility(store.locations.find((location) => (!healthBoard || location.healthBoard === healthBoard) && location.locality === value)?.facility || '');
  }} />
  <FbDropdown label="Facility" value={facility} options={facilityOptions} onChange={setFacility} />
</section>

<style>
  .preferences-page {
    width: min(48rem, 100%);
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
</style>
