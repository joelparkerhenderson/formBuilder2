<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbPopup from './fbPopup.svelte';
  import FbButton from './fbButton.svelte';
  let password = '';
  let error = '';
  const dispatch = createEventDispatcher<{ confirm: string; cancel: void }>();

  function confirm() {
    if (!password.trim()) {
      error = 'Password is required';
      return;
    }
    error = '';
    dispatch('confirm', password);
  }
</script>

<FbPopup title="Password re-entry required">
  <p>You must re-enter your password to save the form.</p>
  <label>
    <span>Password</span>
    <input
      id="password-input"
      type="password"
      bind:value={password}
      placeholder="Enter password..."
      class:error={!!error}
      autofocus
      oninput={() => {
        if (password) error = '';
      }}
      onkeydown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          confirm();
        }
      }}
    />
  </label>
  {#if error}<span class="error-message">{error}</span>{/if}
  <div class="actions">
    <FbButton variant="green" onClick={confirm}>Save</FbButton>
    <FbButton variant="danger" onClick={() => dispatch('cancel')}>Return to form</FbButton>
  </div>
</FbPopup>

<style>
  p {
    margin: 0 0 1.2rem 0;
    line-height: 1.4;
    color: #333333;
    font-size: 1rem;
    font-weight: 300;
  }

  label { display: grid; gap: 0.2rem; margin-bottom: 0.8rem; }
  input { border: 0.1rem solid silver; border-radius: 0.4rem; min-height: 2rem; padding: 0 0.4rem; }
  input.error {
    border-color: #d50000;
    box-shadow: 0 0 0 0.2rem rgba(213, 0, 0, 0.15);
  }
  .error-message {
    color: #d50000;
    display: block;
    font-size: 0.8rem;
    margin: -0.5rem 0 0.8rem 0;
  }
  .actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
</style>
