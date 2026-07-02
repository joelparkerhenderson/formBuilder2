<script lang="ts">
  import type { CntClinic, CntStore } from './cntStore';
  import FbcntClinicFilter from './FbcntClinicFilter.svelte';
  import FbToolTipUser from '../components/fbToolTipUser.svelte';
  import Table from './cntTable.svelte';

  export let store: CntStore;
  export let currentUserUuid = '';
  export let filter: { healthBoard: string; locality: string; facility: string; speciality: string } = {
    healthBoard: '',
    locality: '',
    facility: '',
    speciality: '',
  };
  export let setFilter: (next: { healthBoard: string; locality: string; facility: string; speciality: string }) => void = () => {};
  export let selectedInstanceUuids: string[] = [];
  export let toggleSelectedInstance: (instanceUuid: string) => void = () => {};

  $: today = new Date().toISOString().slice(0, 10);
  $: instances = store.clinicInstances
    .filter((instance) => instance.date >= today && !instance.cancelled)
    .filter((instance) => {
      const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid);
      const location = store.locations.find((item) => item.facility === clinic?.facility);
      return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
        && (!filter.locality || location?.locality === filter.locality)
        && (!filter.facility || clinic?.facility === filter.facility)
        && (!filter.speciality || clinic?.speciality === filter.speciality);
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  function formatDisplayDate(value: string) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  function formatDisplayTime(value: string) {
    return value?.slice(0, 5) || '';
  }

  function clinicSummary(clinic: CntClinic | undefined) {
    if (!clinic) return '';
    return [clinic.clinicName, clinic.speciality, clinic.clinician, clinic.facility].filter(Boolean).join('\n');
  }
</script>

<div class="select-page">
  <FbcntClinicFilter {store} {filter} {setFilter} />
  <div class="table-wrap">
    <Table>
      <thead>
        <tr>
          <th class="date-col">Clinic instance</th>
          <th>Clinic</th>
          <th>Retrievers</th>
          <th class="select-col">Select</th>
        </tr>
      </thead>
      <tbody>
        {#each instances as instance (instance.uuid)}
          {@const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid)}
          <tr>
            <td>{formatDisplayDate(instance.date)}<br />{formatDisplayTime(instance.startTime)}-{formatDisplayTime(instance.endTime)}</td>
            <td class="pre-line">{clinicSummary(clinic)}</td>
            <td>
              {#each instance.retrieverUserUuids as retrieverUuid (retrieverUuid)}
                {@const retriever = store.users.find((item) => item.uuid === retrieverUuid)}
                {#if retriever}<div><FbToolTipUser user={retriever} /></div>{/if}
              {/each}
            </td>
            <td class="select-col">
              <input
                type="checkbox"
                checked={selectedInstanceUuids.includes(instance.uuid) || instance.retrieverUserUuids.includes(currentUserUuid)}
                disabled={instance.retrieverUserUuids.includes(currentUserUuid)}
                onchange={() => toggleSelectedInstance(instance.uuid)}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>
</div>

<style>
  .select-page {
    display: grid;
    gap: 0.8rem;
  }

  .table-wrap {
    max-height: min(34rem, 70vh);
    overflow: auto;
  }

  .date-col {
    width: 10rem;
  }

  .select-col {
    width: 5rem;
    text-align: center;
  }

  .pre-line {
    white-space: pre-line;
  }
</style>
