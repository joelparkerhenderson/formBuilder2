<script lang="ts">
  import { patientName } from './cntStore';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntSelectedVolumesLocation from './FbcntSelectedVolumesLocation.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let rows: any[] = [];
  export let sendReturnList: (row: any) => void = () => {};
  export let removeReturnList: (row: any) => void = () => {};
</script>

<Table>
  <thead><tr><th>Appointment</th><th>Clinic</th><th>Patient</th><th>Volumes required</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each rows as row (`${row.patientUuid}-${row.locationUuid}`)}
      <tr>
        <td>Return</td>
        <td><FbcntLocationDisplay {store} locationUuid={row.locationUuid} compact /></td>
        <td>{patientName(store, row.patientUuid)}</td>
        <td><FbcntSelectedVolumesLocation {store} volumes={store.volumes.filter((volume) => row.volumeUuids.includes(volume.uuid))} /></td>
        <td class="right"><FbcntSmallButton onClick={() => sendReturnList(row)}>Send</FbcntSmallButton> <FbcntSmallButton onClick={() => removeReturnList(row)}>Remove</FbcntSmallButton></td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .right { text-align: right; }
</style>
