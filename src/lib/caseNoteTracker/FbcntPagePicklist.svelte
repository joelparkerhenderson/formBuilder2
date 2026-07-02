<script lang="ts">
  import FbcntSelectedVolumesLocation from './FbcntSelectedVolumesLocation.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import FbcntBadgeActive from './FbcntBadgeActive.svelte';
  import FbcntBadgeCancelled from './FbcntBadgeCancelled.svelte';
  import FbcntBadgeRescheduled from './FbcntBadgeRescheduled.svelte';
  import PatientAddressograph from './fbcntPatientAddressograph.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let rows: any[] = [];
  export let includeRetrieved = false;
  export let setIncludeRetrieved: (value: boolean) => void = () => {};
  export let selectCaseNotes: (appointmentUuid: string) => void = () => {};
  export let receiveCaseNotes: (appointmentUuid: string) => void = () => {};

  function statusBadge(status: string) {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'rescheduled') return 'rescheduled';
    return 'active';
  }

  function formatDate(value = '') {
    if (!value) return '';
    const [datePart] = value.split('T');
    const date = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  }

  function formatTime(value = '') {
    if (!value) return '';
    if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
</script>

<label class="check-line"><input type="checkbox" checked={includeRetrieved} onchange={(event) => setIncludeRetrieved(event.currentTarget.checked)} /> Include patients whose case notes have been retrieved</label>
<Table>
  <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each rows as row (row.appointment.uuid)}
      {@const clinic = store.clinics.find((item) => item.uuid === row.instance.clinicUuid)}
      {@const patient = store.patients.find((item) => item.uuid === row.appointment.patientUuid)}
      <tr>
        <td>
          {#if statusBadge(row.appointment.status) === 'cancelled'}<FbcntBadgeCancelled />{:else if statusBadge(row.appointment.status) === 'rescheduled'}<FbcntBadgeRescheduled />{:else}<FbcntBadgeActive />{/if}
          <br>{formatDate(row.instance.date)}
          <br>{formatTime(row.appointment.time)}
        </td>
        <td>{clinic?.clinicName}<br>{clinic?.speciality}<br>{clinic?.clinician}</td>
        <td>{#if patient}<PatientAddressograph {patient} />{/if}</td>
        <td><FbcntSelectedVolumesLocation {store} volumes={store.volumes.filter((volume) => row.entries.map((entry) => entry.volumeUuid).includes(volume.uuid))} pickListEntries={row.entries} /></td>
        <td class="right"><div class="action-stack"><FbcntSmallButton fullWidth margin="0" onClick={() => selectCaseNotes(row.appointment.uuid)}>Select</FbcntSmallButton><FbcntSmallButton fullWidth margin="0" onClick={() => receiveCaseNotes(row.appointment.uuid)}>Receive</FbcntSmallButton></div></td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .check-line { display: inline-flex; gap: 0.35rem; align-items: center; margin-bottom: 0.6rem; font-weight: 500; }
  .right { text-align: right; }
  .action-stack {
    display: inline-grid;
    grid-template-columns: 4.4rem;
    gap: 0.25rem;
    justify-items: stretch;
  }
</style>
