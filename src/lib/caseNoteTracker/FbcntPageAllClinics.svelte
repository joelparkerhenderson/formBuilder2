<script lang="ts">
  import type { CntClinic, CntStore } from './cntStore';
  import FbcntClinicFilter from './FbcntClinicFilter.svelte';
  import ClinicInstancesTable from './fbcntClinicInstancesTable.svelte';

  export let store: CntStore;
  export let filter: { healthBoard: string; locality: string; facility: string; speciality: string } = {
    healthBoard: '',
    locality: '',
    facility: '',
    speciality: '',
  };
  export let setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void = () => {};
  export let openClinicList: (clinicInstanceUuid: string) => void = () => {};

  $: today = new Date();
  $: sixWeeks = new Date(today.getTime() + 42 * 24 * 60 * 60 * 1000);
  $: instances = store.clinicInstances
    .filter((instance) => {
      const date = new Date(instance.date);
      return !Number.isNaN(date.valueOf()) && date >= startOfDay(today) && date <= sixWeeks;
    })
    .filter((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      return clinic ? clinicMatchesFilter(clinic) : false;
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function clinicMatchesFilter(clinic: CntClinic) {
    const location = store.locations.find((item) => item.uuid === clinic.holdingLocationUuid || item.facility === clinic.facility);
    return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
      && (!filter.locality || location?.locality === filter.locality)
      && (!filter.facility || clinic.facility === filter.facility)
      && (!filter.speciality || clinic.speciality === filter.speciality);
  }
</script>

<div class="select-page">
  <FbcntClinicFilter {store} {filter} {setFilter} />
  <div class="table-wrap">
    <ClinicInstancesTable {store} {instances} {openClinicList} />
  </div>
</div>

<style>
  .select-page { display: grid; gap: 0.8rem; }
  .table-wrap { max-height: min(34rem, 70vh); overflow: auto; }
</style>
