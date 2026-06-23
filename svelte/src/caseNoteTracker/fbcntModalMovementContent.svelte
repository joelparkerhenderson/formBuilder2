<script lang="ts">
  import FbcntSelectedVolumes from './FbcntSelectedVolumes.svelte';
  import FbcntFromLocation from './FbcntFromLocation.svelte';
  import FbcntToLocation from './FbcntToLocation.svelte';

  export let store: any;
  export let volumes: any[] = [];
  export let sourceUuid = '';
  export let destinationUuid = '';
  export let setSourceUuid: (value: string) => void = () => {};
  export let setDestinationUuid: (value: string) => void = () => {};
  export let mode: 'send' | 'receive' = 'send';
</script>

<div class="stack">
  <FbcntSelectedVolumes {store} {volumes} />
  <FbcntFromLocation {store} value={sourceUuid} onChange={setSourceUuid} label={mode === 'send' ? 'From' : 'Sent from'} />
  <FbcntToLocation {store} value={destinationUuid} onChange={setDestinationUuid} label={mode === 'send' ? 'To' : 'Received at'} />
</div>

<style>
  .stack { display: grid; gap: 0.8rem; }
</style>
