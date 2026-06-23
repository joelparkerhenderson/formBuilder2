<script lang="ts">
  import type { CntClinicInstance, CntStore } from './cntStore';
  import FbcntUserBadge from './FbcntUserBadge.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: CntStore;
  export let instances: CntClinicInstance[] = [];
  export let openClinicList: (instanceUuid: string) => void = () => {};

  function dateTime(value = '') {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
</script>

<Table>
  <thead><tr><th>Date/time</th><th>Clinic</th><th>Retrievers</th><th>Appointments</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each instances as instance (instance.uuid)}
      {@const clinic = store.clinics.find((item) => item.uuid === instance.clinicUuid)}
      <tr>
        <td>{dateTime(instance.dateTime || `${instance.date}T${instance.startTime || '00:00'}`)}</td>
        <td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td>
        <td>
          {#each instance.retrieverUserUuids || [] as uuid}
            {@const retriever = store.users.find((user) => user.uuid === uuid)}
            {#if retriever}<div><FbcntUserBadge user={retriever} /></div>{/if}
          {/each}
        </td>
        <td>{instance.appointments.length}</td>
        <td class="right"><FbcntSmallButton onClick={() => openClinicList(instance.uuid)}>Clinic list</FbcntSmallButton></td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .right { text-align: right; }
</style>
