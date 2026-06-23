<script lang="ts">
  import type { CntClinic, CntStore } from './cntStore';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import FbcntUserBadge from './FbcntUserBadge.svelte';
  import Table from './cntTable.svelte';

  export let store: CntStore;
  export let userUuid = '';
  export let confirmStopClinic: (instanceUuid: string) => void = () => {};

  $: instances = store.clinicInstances
    .filter((instance) => instance.retrieverUserUuids.includes(userUuid))
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

<div class="page">
  <div class="table-wrap">
    <Table>
      <thead>
        <tr>
          <th class="date-col">Clinic instance</th>
          <th>Clinic</th>
          <th>Retrievers</th>
          <th class="right action-col">Action</th>
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
                {#if retriever}<div><FbcntUserBadge user={retriever} /></div>{/if}
              {/each}
            </td>
            <td class="right"><FbcntSmallButton onClick={() => confirmStopClinic(instance.uuid)}>Stop retrieving</FbcntSmallButton></td>
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>
</div>

<style>
  .page { width: 100%; }
  .table-wrap { max-height: min(34rem, 70vh); overflow: auto; }
  .date-col { width: 10rem; }
  .action-col { width: 10rem; }
  .right { text-align: right; }
  .pre-line { white-space: pre-line; }
</style>
