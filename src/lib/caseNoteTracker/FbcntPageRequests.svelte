<script lang="ts">
  import { patientName } from './cntStore';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntSelectedVolumesLocation from './FbcntSelectedVolumesLocation.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let requests: any[] = [];
  export let mode: 'inbox' | 'outbox' = 'outbox';
  export let cancelRequest: (row: any) => void = () => {};
  export let doneRequest: (row: any) => void = () => {};

  $: rows = grouped(requests.length ? requests : store.requests || []);

  function grouped(items: any[]) {
    const map = new Map<string, any>();
    for (const request of items) {
      const key = [request.patientUuid, request.requiredFor, request.requiredBy, request.fromLocationUuid, request.toLocationUuid, request.status].join('|');
      const row = map.get(key) || { ...request, key, requestUuids: [], volumeUuids: [] };
      row.requestUuids.push(request.uuid);
      row.volumeUuids.push(request.volumeUuid);
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => (a.requiredBy || '').localeCompare(b.requiredBy || ''));
  }
</script>

<Table>
  <thead><tr><th>Patient</th><th>Volumes</th><th>Required for</th><th>Required by</th><th>From</th><th>To</th><th>Status</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each rows as row (row.key)}
      <tr>
        <td>{patientName(store, row.patientUuid)}</td>
        <td><FbcntSelectedVolumesLocation {store} volumes={store.volumes.filter((volume) => row.volumeUuids.includes(volume.uuid))} requestedLocationUuid={row.toLocationUuid} /></td>
        <td>{row.requiredFor}</td>
        <td>{row.requiredBy}</td>
        <td><FbcntLocationDisplay {store} locationUuid={row.fromLocationUuid} compact /></td>
        <td><FbcntLocationDisplay {store} locationUuid={row.toLocationUuid} compact /></td>
        <td>{row.status}</td>
        <td class="right">
          {#if mode === 'inbox'}<FbcntSmallButton onClick={() => doneRequest(row)}>Done</FbcntSmallButton>{/if}
          <FbcntSmallButton onClick={() => cancelRequest(row)}>Cancel</FbcntSmallButton>
        </td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .right { text-align: right; }
</style>
