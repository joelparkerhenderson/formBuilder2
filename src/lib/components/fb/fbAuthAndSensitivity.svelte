<script lang="ts">
  import FbAuthControls from './fbAuthControls.svelte';
  import FbFinalControl from './fbFinalControl.svelte';

  let {
    highlySensitive = $bindable(false),
    finalChecked = $bindable(false),
    requiredFieldsComplete,
    username = $bindable(''),
    password = $bindable(''),
    formChanged = true,
    onHighlySensitiveChange,
    onFinalCheckedChange,
    onUsernameChange,
    onPasswordChange
  }: {
    highlySensitive?: boolean;
    finalChecked?: boolean;
    requiredFieldsComplete: boolean;
    username?: string;
    password?: string;
    formChanged?: boolean;
    onHighlySensitiveChange?: (checked: boolean) => void;
    onFinalCheckedChange?: (checked: boolean) => void;
    onUsernameChange?: (value: string) => void;
    onPasswordChange?: (value: string) => void;
  } = $props();

  function updateHighlySensitive(event: Event) {
    highlySensitive = (event.currentTarget as HTMLInputElement).checked;
    onHighlySensitiveChange?.(highlySensitive);
  }
</script>

<div class="fb-auth-and-sensitivity">
  <label class="fb-bottom-control-item">
    <input type="checkbox" bind:checked={highlySensitive} onchange={updateHighlySensitive} />
    <span>Highly sensitive</span>
  </label>

  <FbFinalControl
    bind:checked={finalChecked}
    disabled={!requiredFieldsComplete}
    onChange={onFinalCheckedChange}
    class="fb-bottom-control-final"
  />

  <FbAuthControls
    bind:username
    bind:password
    {formChanged}
    {onUsernameChange}
    {onPasswordChange}
  />
</div>

<style>
  .fb-auth-and-sensitivity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .fb-bottom-control-item {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: 2rem;
    margin-left: 0.2rem;
    padding: 0 0.5rem;
    background-color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: black;
    cursor: pointer;
    user-select: none;
  }

  .fb-bottom-control-item input {
    margin: 0;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    outline: none;
    box-shadow: none;
  }

  .fb-bottom-control-item span {
    font-weight: 300;
  }
</style>
