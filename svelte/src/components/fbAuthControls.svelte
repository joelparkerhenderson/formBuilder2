<script lang="ts">
  export let username = 'demoUser';
  export let password = '';
  export let formChanged = false;
</script>

<div class="fb-auth-controls">
  <input
    class="fb-user-name"
    type="text"
    bind:value={username}
  />
  {#if formChanged}
    <input
      type="password"
      placeholder="Enter password"
      bind:value={password}
    />
  {/if}
</div>

<style>
  .fb-auth-controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .fb-user-name,
  input[type='text'],
  input[type='password'] {
    display: inline-block;
    height: 2rem;
    line-height: 2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    box-sizing: border-box;
    font-size: 1rem;
  }

  .fb-user-name {
    width: 10rem;
  }
</style>
