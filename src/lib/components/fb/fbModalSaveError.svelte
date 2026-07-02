<script lang="ts">
  import FbModal from './fbModal.svelte';
  import FbButton from './fbButton.svelte';
  import FbModalActions from './FbModalActions.svelte';
  export let error = '';
  export let onReturnToForm: () => void = () => {};
</script>

<FbModal title="Error" onEscape={onReturnToForm}>
  <p>Changes may not have been saved</p>
  {#if error}<pre>{error}</pre>{/if}
  <FbModalActions><FbButton variant="green" onClick={onReturnToForm}>Return to form</FbButton></FbModalActions>
</FbModal>

<style>
  pre { white-space: pre-wrap; max-width: 38rem; }
</style>
