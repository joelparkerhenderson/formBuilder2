<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntSelectedVolumes from './FbcntSelectedVolumes.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import PatientAddressograph from './fbcntPatientAddressograph.svelte';
  import Table from './cntTable.svelte';
  import FbcntBadgeActive from './FbcntBadgeActive.svelte';
  import FbcntBadgeCancelled from './FbcntBadgeCancelled.svelte';
  import FbcntBadgeRescheduled from './FbcntBadgeRescheduled.svelte';

  export let store: CntStore;
  export let clinicInstanceUuid = '';
  export let showRescheduled = false;
  export let showCancelled = false;
  export let openPatientRecord: (patientUuid: string) => void = () => {};
  export let openPickListSelector: (clinicInstanceUuid: string, patientUuid: string) => void = () => {};
  export let openPickListReceive: (clinicInstanceUuid: string, patientUuid: string) => void = () => {};

  $: instance = store.clinicInstances.find((item) => item.uuid === clinicInstanceUuid);
  $: rows = (instance?.appointments || [])
    .filter((appointment) => appointment.status === 'active' || (appointment.status === 'rescheduled' && showRescheduled) || (appointment.status === 'cancelled' && showCancelled))
    .sort((a, b) => a.time.localeCompare(b.time));

  function volumeSort(a: CntVolume, b: CntVolume) {
    return a.healthBoard.localeCompare(b.healthBoard)
      || a.locality.localeCompare(b.locality)
      || a.type.localeCompare(b.type)
      || Number(a.temporary) - Number(b.temporary)
      || a.volumeNumber - b.volumeNumber;
  }

  function formatDisplayTime(value: string) {
    return value?.slice(0, 5) || '';
  }
</script>

{#if !instance}
  <p class="note">Clinic instance not found.</p>
{:else}
  <div class="table-page-stack">
    <Table>
      <thead><tr><th class="status-col">Status</th><th>Patient</th><th>Volumes</th><th class="right action-col">Action</th></tr></thead>
      <tbody>
        {#each rows as appointment (appointment.uuid)}
          {@const patient = store.patients.find((item) => item.uuid === appointment.patientUuid)}
          {@const selectedEntries = store.cntPickList.filter((entry) => entry.clinicInstanceUuid === instance.uuid)}
          {@const volumes = store.volumes.filter((volume) => volume.patientUuid === appointment.patientUuid && selectedEntries.some((entry) => entry.volumeUuid === volume.uuid)).sort(volumeSort)}
          <tr>
            <td>
              {#if appointment.status === 'cancelled'}
                <FbcntBadgeCancelled />
              {:else if appointment.status === 'rescheduled'}
                <FbcntBadgeRescheduled />
              {:else}
                <FbcntBadgeActive />
              {/if}
              <div class="time">{formatDisplayTime(appointment.time)}</div>
            </td>
            <td>{#if patient}<PatientAddressograph {patient} />{/if}</td>
            <td><FbcntSelectedVolumes {store} {volumes} /></td>
            <td class="right">
              <div class="stacked-buttons">
                <FbcntSmallButton onClick={() => openPatientRecord(appointment.patientUuid)}>Open record</FbcntSmallButton>
                <FbcntSmallButton onClick={() => openPickListSelector(instance.uuid, appointment.patientUuid)}>Select case notes</FbcntSmallButton>
                <FbcntSmallButton onClick={() => openPickListReceive(instance.uuid, appointment.patientUuid)}>Receive case notes</FbcntSmallButton>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>
{/if}

<style>
  .table-page-stack { display: grid; gap: 0.8rem; }
  .status-col { width: 9rem; }
  .action-col { width: 10rem; }
  .right { text-align: right; }
  .time { margin-top: 0.25rem; }
  .stacked-buttons { display: grid; gap: 0.25rem; justify-items: end; }
  .note { color: #555; font-style: italic; }
</style>
