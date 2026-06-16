<script lang="ts">
  import FbPopup from './fbPopup.svelte';
  import FbButton from './fbButton.svelte';
  export let error = '';
  export let onReturnToForm: () => void = () => {};
</script>

<FbPopup title="Error">
  <p>Changes may not have been saved</p>
  {#if error}<pre>{error}</pre>{/if}
  <div class="actions"><FbButton variant="green" onClick={onReturnToForm}>Return to form</FbButton></div>
</FbPopup>

<style>
  pre { white-space: pre-wrap; max-width: 38rem; }
  .actions { display: flex; justify-content: flex-end; }
</style>
