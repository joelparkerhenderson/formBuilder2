<script lang="ts">
  import type { CntStore } from './cntStore';
  import { locationLabel } from './cntStore';

  export let label = '';
  export let store: CntStore;
  export let value = '';
  export let onChange: (value: string) => void = () => {};
  export let allowBlank = false;
</script>

<label class="location-select">
  {label}
  <select value={value} onchange={(event) => onChange((event.currentTarget as HTMLSelectElement).value)}>
    {#if allowBlank}<option value="">Not specified</option>{/if}
    {#each store.locations as location (location.uuid)}
      <option value={location.uuid}>{locationLabel(store, location.uuid)}</option>
    {/each}
  </select>
</label>

<style>
  .location-select {
    display: block;
    font-weight: 500;
  }

  select {
    display: block;
    width: 100%;
    max-width: 24rem;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem 0.4rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
  }
</style>
