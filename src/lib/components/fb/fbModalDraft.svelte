<script lang="ts">
  import FbModal from './fbModal.svelte';
  import FbButton from './fbButton.svelte';
  import FbModalActions from './FbModalActions.svelte';
  export let onSaveDraft: () => void = () => {};
  export let onCancel: () => void = () => {};
</script>

<FbModal title="Saving as draft" onEscape={onCancel}>
  <p>
    The form will be saved as a draft and not processed or sent, because the Final checkbox was not checked.
  </p>
  <FbModalActions>
    <FbButton variant="success" onClick={onSaveDraft}>Save as draft</FbButton>
    <FbButton variant="danger" onClick={onCancel}>Return to form</FbButton>
  </FbModalActions>
</FbModal>

<style>
  p {
    margin: 0 0 1.5rem 0;
    color: #333;
    line-height: 1.4;
  }
</style>
