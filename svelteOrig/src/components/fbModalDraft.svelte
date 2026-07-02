<script lang="ts">
  import FbModal from './fbModal.svelte';
  import FbButton from './fbButton.svelte';
  export let onSaveDraft: () => void = () => {};
  export let onCancel: () => void = () => {};
</script>

<FbModal title="Saving as draft">
  <p>
    The form will be saved as a draft and not processed or sent, because the Final checkbox was not checked.
  </p>
  <div class="actions">
    <FbButton variant="success" onClick={onSaveDraft}>Save as draft</FbButton>
    <FbButton variant="danger" onClick={onCancel}>Return to form</FbButton>
  </div>
</FbModal>

<style>
  p {
    margin: 0 0 1.5rem 0;
    color: #333;
    line-height: 1.4;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
