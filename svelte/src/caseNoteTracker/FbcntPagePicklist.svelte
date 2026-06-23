<script lang="ts">
  import { patientName } from './cntStore';
  import FbcntSelectedVolumesLocation from './FbcntSelectedVolumesLocation.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import FbcntBadgeActive from './FbcntBadgeActive.svelte';
  import FbcntBadgeCancelled from './FbcntBadgeCancelled.svelte';
  import FbcntBadgeRescheduled from './FbcntBadgeRescheduled.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let rows: any[] = [];
  export let includeRetrieved = false;
  export let setIncludeRetrieved: (value: boolean) => void = () => {};
  export let selectCaseNotes: (appointmentUuid: string) => void = () => {};
  export let receiveCaseNotes: (appointmentUuid: string) => void = () => {};

  function badge(status: string) {
    return status;
  }
</script>

<label class="check-line"><input type="checkbox" checked={includeRetrieved} onchange={(event) => setIncludeRetrieved(event.currentTarget.checked)} /> Include patients whose case notes have been retrieved</label>
<Table>
  <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each rows as row (row.appointment.uuid)}
      {@const clinic = store.clinics.find((item) => item.uuid === row.instance.clinicUuid)}
      <tr>
        <td>{row.instance.dateTime || row.instance.date}<br>{#if badge(row.appointment.status) === 'cancelled'}<FbcntBadgeCancelled />{:else if badge(row.appointment.status) === 'rescheduled'}<FbcntBadgeRescheduled />{:else}<FbcntBadgeActive />{/if}</td>
        <td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td>
        <td>{patientName(store, row.appointment.patientUuid)}</td>
        <td><FbcntSelectedVolumesLocation {store} volumes={store.volumes.filter((volume) => row.entries.map((entry) => entry.volumeUuid).includes(volume.uuid))} pickListEntries={row.entries} /></td>
        <td class="right"><FbcntSmallButton onClick={() => selectCaseNotes(row.appointment.uuid)}>Select</FbcntSmallButton> <FbcntSmallButton onClick={() => receiveCaseNotes(row.appointment.uuid)}>Receive</FbcntSmallButton></td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .check-line { display: inline-flex; gap: 0.35rem; align-items: center; margin-bottom: 0.6rem; font-weight: 500; }
  .right { text-align: right; }
</style>
