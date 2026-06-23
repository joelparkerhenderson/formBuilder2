<script lang="ts">
  import type { CntStore } from './cntStore';
  import ClinicInstancesTable from './fbcntClinicInstancesTable.svelte';

  export let store: CntStore;
  export let clinicUuid = '';
  export let openClinicList: (clinicInstanceUuid: string) => void = () => {};

  $: today = new Date();
  $: sixWeeks = new Date(today.getTime() + 42 * 24 * 60 * 60 * 1000);
  $: instances = store.clinicInstances
    .filter((instance) => instance.clinicUuid === clinicUuid)
    .filter((instance) => {
      const date = new Date(instance.date);
      return !Number.isNaN(date.valueOf()) && date >= startOfDay(today) && date <= sixWeeks;
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
</script>

<div class="table-wrap">
  <ClinicInstancesTable {store} {instances} {openClinicList} />
</div>

<style>
  .table-wrap { max-height: min(34rem, 70vh); overflow: auto; }
</style>
