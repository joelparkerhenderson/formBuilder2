<script lang="ts">
  import FbModal from './fbModal.svelte';
  import FbButton from './fbButton.svelte';
  import FbModalActions from './FbModalActions.svelte';

  let { onContinue = () => {} }: { onContinue?: () => void } = $props();
</script>

<FbModal title="Changes NOT saved" onEscape={onContinue}>
  <p>
    Your changes were not saved, because the document or form was updated by another user (or possibly
    by yourself in a different window). When you click "Continue", the read-only view of the current
    version will be displayed.
  </p>
  <FbModalActions><FbButton variant="green" onClick={onContinue}>Continue</FbButton></FbModalActions>
</FbModal>

<style>
  p {
    margin-bottom: 1.5rem;
    line-height: 1.4;
    color: #333333;
    max-width: 38rem;
  }
</style>
