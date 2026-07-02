<script lang="ts">
  import FbModal from './fbModal.svelte';
  import FbButton from './fbButton.svelte';
  export let onDiscard: () => void = () => {};
  export let onReturnToForm: () => void = () => {};
</script>

<FbModal title="Discard changes?">
  <p>Changes have not been saved.</p>
  <div class="actions">
    <FbButton onClick={onDiscard}>Discard changes</FbButton>
    <FbButton variant="green" onClick={onReturnToForm}>Return to form</FbButton>
  </div>
</FbModal>

<style>.actions { display: flex; gap: 0.4rem; justify-content: flex-end; }</style>
