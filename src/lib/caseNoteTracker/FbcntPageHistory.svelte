<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import Table from './cntTable.svelte';

  export let store: CntStore;
  export let volumes: CntVolume[] = [];

  $: events = volumes
    .flatMap((volume) => (volume.events || []).map((event) => ({ ...event, volume })))
    .sort((a, b) => (b.datetime || '').localeCompare(a.datetime || ''));

  function displayDateTime(value = '') {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
</script>

<div class="table-wrap">
  <Table>
    <thead><tr><th>Date/time</th><th>Event</th><th>From</th><th>To</th><th>Note</th></tr></thead>
    <tbody>
      {#each events as event (event.uuid)}
        <tr>
          <td>{displayDateTime(event.datetime)}</td>
          <td>{event.kind}</td>
          <td><FbcntLocationDisplay {store} locationUuid={event.fromLocationUuid} compact /></td>
          <td><FbcntLocationDisplay {store} locationUuid={event.toLocationUuid} compact /></td>
          <td>{event.note}</td>
        </tr>
      {/each}
    </tbody>
  </Table>
</div>

<style>
  .table-wrap { height: 100%; min-height: 0; overflow: auto; background: white; }
</style>
