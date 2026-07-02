<script lang="ts">
  import FbUserName from './fbUserName.svelte';

  let {
    username = $bindable(''),
    password = $bindable(''),
    formChanged = true,
    onUsernameChange,
    onPasswordChange
  }: {
    username?: string;
    password?: string;
    formChanged?: boolean;
    onUsernameChange?: (value: string) => void;
    onPasswordChange?: (value: string) => void;
  } = $props();

  let passwordTimeout: number | null = null;

  function handleUsernameChange(value: string) {
    username = value;
    onUsernameChange?.(value);
  }

  function handlePasswordChange(value: string) {
    password = value;
    onPasswordChange?.(value);
  }

  function clearPasswordTimeout() {
    if (passwordTimeout !== null) {
      window.clearTimeout(passwordTimeout);
      passwordTimeout = null;
    }
  }
</script>

<FbUserName bind:value={username} onChange={handleUsernameChange} />
{#if formChanged}
  <input
    type="password"
    name="password"
    bind:value={password}
    oninput={(event) => handlePasswordChange(event.currentTarget.value)}
    placeholder="Enter password"
    class="fb-bottom-control-password"
    onfocus={clearPasswordTimeout}
    onblur={(event) => {
      const passwordAtBlur = event.currentTarget.value;
      if (passwordAtBlur) {
        passwordTimeout = window.setTimeout(() => {
          handlePasswordChange('');
          passwordTimeout = null;
        }, 2000);
      }
    }}
  />
{/if}

<style>
  .fb-bottom-control-password {
    display: inline-block;
    height: 2rem;
    line-height: 2rem;
    margin-left: 0.2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background-color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: black;
  }

  .fb-bottom-control-password:focus {
    background-color: #ffffcc;
  }
</style>
