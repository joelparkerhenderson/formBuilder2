<script lang="ts">
  import FbModal from './fbModal.svelte';
  import FbButton from './fbButton.svelte';
  import FbModalActions from './FbModalActions.svelte';
  export let onDiscard: () => void = () => {};
  export let onReturnToForm: () => void = () => {};
</script>

<FbModal title="Discard changes?" onEscape={onReturnToForm}>
  <p>Changes have not been saved.</p>
  <FbModalActions>
    <FbButton onClick={onDiscard}>Discard changes</FbButton>
    <FbButton variant="green" onClick={onReturnToForm}>Return to form</FbButton>
  </FbModalActions>
</FbModal>
