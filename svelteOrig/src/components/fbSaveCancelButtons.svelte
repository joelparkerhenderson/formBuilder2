<script lang="ts">
  import FbButton from './fbButton.svelte';

  export let saveDisabled = false;
  export let saving = false;
  export let formChanged = true;
  export let showRov = true;
  export let onSave: () => void = () => {};
  export let onCancel: () => void = () => {};
  export let onRov: () => void = () => {};
</script>

<div class="fb-save-cancel-buttons">
  {#if showRov}
    <FbButton type="button" onClick={onRov}>RoV</FbButton>
  {/if}
  <FbButton type="button" variant={formChanged ? 'success' : 'secondary'} disabled={saveDisabled || saving || !formChanged} onClick={onSave}>
    {saving ? 'Saving...' : 'Save and close'}
  </FbButton>
  <FbButton type="button" variant="danger" onClick={onCancel}>Cancel</FbButton>
</div>

<style>
  .fb-save-cancel-buttons {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
</style>
