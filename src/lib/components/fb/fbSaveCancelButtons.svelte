<script lang="ts">
  import FbButton from './fbButton.svelte';
  import FbCancelFormButton from './fbCancelFormButton.svelte';

  let {
    formChanged,
    onCancel,
    saveLabel = 'Save and close',
    isSaving = false,
    saving = isSaving,
    saveDisabled = false,
    onSave,
    showRov = true
  }: {
    formChanged: boolean;
    onCancel: () => void;
    saveLabel?: string;
    cancelLabel?: string;
    isSaving?: boolean;
    saving?: boolean;
    saveDisabled?: boolean;
    onSave?: () => void;
    showRov?: boolean;
  } = $props();

  const disabled = $derived(saveDisabled || !formChanged || saving);
</script>

  <FbButton
    type={onSave ? 'button' : 'submit'}
    onclick={onSave}
    disabled={disabled}
    variant={formChanged ? 'success' : 'secondary'}
    class="fb-bottom-btn-save"
    style="margin-left: 0.2rem"
  >
  {saving ? 'Saving...' : saveLabel}
</FbButton>

<FbCancelFormButton class="fb-bottom-btn-cancel" style="margin-left: 0.2rem" onclick={onCancel} />
