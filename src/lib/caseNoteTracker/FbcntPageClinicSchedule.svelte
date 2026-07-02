<script lang="ts">
  import type { CntClinic, CntStore } from './cntStore';
  import FbcntClinicFilter from './FbcntClinicFilter.svelte';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: CntStore;
  export let filter: { healthBoard: string; locality: string; facility: string; speciality: string } = {
    healthBoard: '',
    locality: '',
    facility: '',
    speciality: '',
  };
  export let setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void = () => {};
  export let openClinicDates: (clinicUuid: string) => void = () => {};

  let includeHistoric = false;
  $: today = new Date().toISOString().slice(0, 10);
  $: clinics = store.clinics
    .filter((clinic) => includeHistoric || !clinic.endDate || clinic.endDate >= today)
    .filter((clinic) => clinicMatchesFilter(clinic))
    .sort((a, b) => a.clinicName.localeCompare(b.clinicName));

  function clinicMatchesFilter(clinic: CntClinic) {
    const location = store.locations.find((item) => item.uuid === clinic.holdingLocationUuid || item.facility === clinic.facility);
    return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
      && (!filter.locality || location?.locality === filter.locality)
      && (!filter.facility || clinic.facility === filter.facility)
      && (!filter.speciality || clinic.speciality === filter.speciality);
  }

  function formatDisplayDate(value: string) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }
</script>

<div class="select-page">
  <FbcntClinicFilter {store} {filter} {setFilter} />
  <label class="normal-check"><input type="checkbox" bind:checked={includeHistoric}> Include historic clinics</label>
  <div class="table-wrap">
    <Table>
      <thead><tr><th>Clinic</th><th>Speciality</th><th>Senior responsible clinician</th><th>Holding location</th><th class="right action-col">Action</th></tr></thead>
      <tbody>
        {#each clinics as clinic (clinic.uuid)}
          <tr>
            <td>
              <div>{clinic.clinicName}</div>
              {#if clinic.endDate && clinic.endDate < today}<div class="note">Historic since {formatDisplayDate(clinic.endDate)}</div>{/if}
            </td>
            <td>{clinic.speciality}</td>
            <td>{clinic.clinician}</td>
            <td><FbcntLocationDisplay {store} locationUuid={clinic.holdingLocationUuid} compact /></td>
            <td class="right"><FbcntSmallButton onClick={() => openClinicDates(clinic.uuid)}>Dates</FbcntSmallButton></td>
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>
</div>

<style>
  .select-page { display: grid; gap: 0.8rem; }
  .table-wrap { max-height: min(34rem, 70vh); overflow: auto; }
  .normal-check { display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 300; }
  .note { color: #555; font-size: 0.9rem; font-style: italic; }
  .right { text-align: right; }
  .action-col { width: 7rem; }
</style>
