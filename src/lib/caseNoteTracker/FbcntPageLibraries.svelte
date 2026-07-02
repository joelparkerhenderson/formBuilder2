<script lang="ts">
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbToolTipUser from '$lib/components/fb/fbToolTipUser.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let libraryUuids: string[] = [];
  export let removeLibrary: (locationUuid: string) => void = () => {};

  function custodians(location: any) {
    return location.custodianUserUuids || [];
  }
</script>

<Table>
  <thead><tr><th>Library</th><th>Custodians</th><th>Requests</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each store.locations.filter((location) => !libraryUuids.length || libraryUuids.includes(location.uuid)) as location (location.uuid)}
      <tr>
        <td><strong>{location.code}</strong><br><FbcntLocationDisplay {store} locationUuid={location.uuid} compact /></td>
        <td>{#each custodians(location) as uuid}<FbToolTipUser user={store.users.find((user) => user.uuid === uuid)} />{/each}</td>
        <td>{location.acceptsRequests ? 'Accepts requests' : 'No request inbox'}</td>
        <td class="right"><FbcntSmallButton onClick={() => removeLibrary(location.uuid)}>Remove</FbcntSmallButton></td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .right { text-align: right; }
</style>
