<script lang="ts">
  import { patientName, locationLabel } from './cntStore';
  import FbToolTipUser from '$lib/components/fb/fbToolTipUser.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
</script>

<Table>
  <thead><tr><th>Patient</th><th>Purpose</th><th>Location</th><th>Required by</th><th>Expires</th><th>Created by</th><th>Status</th></tr></thead>
  <tbody>
    {#each store.tags as tag (tag.uuid)}
      <tr>
        <td>{patientName(store, tag.patientUuid)}</td>
        <td>{tag.purpose}</td>
        <td>{locationLabel(store, tag.locationUuid)}</td>
        <td>{tag.requiredBy}</td>
        <td>{tag.expiresAt}</td>
        <td><FbToolTipUser user={store.users.find((user) => user.uuid === tag.createdByUserUuid)} /></td>
        <td>{tag.status}</td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
</style>
