<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbAuthAndSensitivity from './fbAuthAndSensitivity.svelte';
  import FbButton from './fbButton.svelte';
  import FbSaveCancelButtons from './fbSaveCancelButtons.svelte';

  let {
    children,
    openedFromPatientRecord,
    highlySensitive = $bindable(false),
    finalChecked = $bindable(false),
    requiredFieldsComplete,
    username = $bindable(''),
    password = $bindable(''),
    formChanged,
    isSaving = false,
    saveLabel,
    onRoVClick = () => {},
    onHighlySensitiveChange,
    onFinalCheckedChange,
    onUsernameChange,
    onPasswordChange,
    onCancel = () => {}
  }: {
    children?: Snippet;
    openedFromPatientRecord?: boolean;
    highlySensitive?: boolean;
    finalChecked?: boolean;
    requiredFieldsComplete: boolean;
    username?: string;
    password?: string;
    formChanged: boolean;
    isSaving?: boolean;
    saveLabel?: string;
    onRoVClick?: () => void;
    onHighlySensitiveChange?: (checked: boolean) => void;
    onFinalCheckedChange?: (checked: boolean) => void;
    onUsernameChange?: (value: string) => void;
    onPasswordChange?: (value: string) => void;
    onCancel?: () => void;
  } = $props();
</script>

<div class="fb-bottom-control-bar">
  {#if children}
    {@render children()}
  {:else}
    {#if !openedFromPatientRecord}
      <FbButton type="button" variant="primary" class="fb-bottom-control-btn-rov" style="margin-left: 0.2rem" onclick={onRoVClick}>RoV</FbButton>
    {/if}

    <div class="fb-bottom-control-spacer"></div>

    <FbAuthAndSensitivity
      bind:highlySensitive
      bind:finalChecked
      requiredFieldsComplete={Boolean(requiredFieldsComplete)}
      bind:username
      bind:password
      formChanged={Boolean(formChanged)}
      {onHighlySensitiveChange}
      {onFinalCheckedChange}
      {onUsernameChange}
      {onPasswordChange}
    />

    <FbSaveCancelButtons formChanged={Boolean(formChanged)} {onCancel} {isSaving} {saveLabel} />
  {/if}
</div>

<style>
  .fb-bottom-control-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0.4rem;
    background-color: white;
    border-top: 0.2rem solid rgb(27 110 194);
    min-height: 2.8rem;
    box-sizing: border-box;
  }

  .fb-bottom-control-spacer {
    flex: 1;
  }
</style>
