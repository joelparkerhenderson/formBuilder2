<script lang="ts">
  import FbPopup from './fbPopup.svelte';
  import FbButton from './fbButton.svelte';
  export let onDiscard: () => void = () => {};
  export let onReturnToForm: () => void = () => {};
</script>

<FbPopup title="Discard changes?">
  <p>Changes have not been saved.</p>
  <div class="actions">
    <FbButton onClick={onDiscard}>Discard changes</FbButton>
    <FbButton variant="green" onClick={onReturnToForm}>Return to form</FbButton>
  </div>
</FbPopup>

<style>.actions { display: flex; gap: 0.4rem; justify-content: flex-end; }</style>
