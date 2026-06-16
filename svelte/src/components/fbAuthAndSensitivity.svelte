<script lang="ts">
  import FbAuthControls from './fbAuthControls.svelte';
  import FbFinalControl from './fbFinalControl.svelte';

  export let username = '';
  export let password = '';
  export let highlySensitive = false;
  export let finalChecked = false;
  export let formChanged = false;
  export let finalDisabled = false;
</script>

<div class="fb-auth-and-sensitivity">
  <label class="fb-sensitive-control">
    <input
      type="checkbox"
      bind:checked={highlySensitive}
    />
    <span>Highly sensitive</span>
  </label>
  <FbFinalControl bind:checked={finalChecked} disabled={finalDisabled} />
  <FbAuthControls
    bind:username
    bind:password
    {formChanged}
  />
</div>

<style>
  .fb-auth-and-sensitivity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }

  .fb-sensitive-control {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    height: 2rem;
    margin-left: 0.2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    font-size: 1rem;
    font-weight: 400;
    color: black;
  }

  .fb-sensitive-control input {
    width: 1rem;
    height: 1rem;
    margin: 0;
    cursor: pointer;
    outline: none;
    box-shadow: none;
  }

  .fb-sensitive-control span {
    font-weight: 300;
  }
</style>
