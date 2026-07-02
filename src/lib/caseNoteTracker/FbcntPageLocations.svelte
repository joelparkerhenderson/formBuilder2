<script lang="ts">
  import FbcntLocationFilter from './FbcntLocationFilter.svelte';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbToolTipUser from '$lib/components/fb/fbToolTipUser.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let filter = { healthBoard: '', locality: '', facility: '' };
  export let setFilter: (filter: any) => void = () => {};

  $: rows = store.locations.filter((location) =>
    (!filter.healthBoard || location.healthBoard === filter.healthBoard)
    && (!filter.locality || location.locality === filter.locality)
    && (!filter.facility || location.facility === filter.facility));
</script>

<FbcntLocationFilter {store} {filter} {setFilter} />
<Table marginTop="0.8rem">
  <thead><tr><th>Code</th><th>Location</th><th>Custodians</th><th>Requests</th></tr></thead>
  <tbody>
    {#each rows as location (location.uuid)}
      <tr>
        <td>{location.code}</td>
        <td><FbcntLocationDisplay {store} locationUuid={location.uuid} compact /></td>
        <td>{#each location.custodianUserUuids || [] as uuid}<FbToolTipUser user={store.users.find((user) => user.uuid === uuid)} />{/each}</td>
        <td>{location.acceptsRequests ? 'Accepts requests' : ''}</td>
      </tr>
    {/each}
  </tbody>
</Table>
