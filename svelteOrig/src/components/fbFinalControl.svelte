<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let checked = false;
  export let disabled = false;
  const dispatch = createEventDispatcher<{ change: boolean }>();
</script>

<label class="fb-final-control" class:disabled>
  <input
    type="checkbox"
    bind:checked
    {disabled}
    on:change={(event) => dispatch('change', (event.currentTarget as HTMLInputElement).checked)}
  />
  <span>Final</span>
</label>

<style>
  .fb-final-control {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    height: 2rem;
    margin-left: 0.2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    font-size: 1rem;
    font-weight: 400;
    color: black;
    user-select: none;
    box-sizing: border-box;
    cursor: pointer;
  }

  .fb-final-control input {
    width: 1rem;
    height: 1rem;
    margin: 0;
    cursor: pointer;
    outline: none;
    box-shadow: none;
  }

  .fb-final-control.disabled {
    background: #c0c0c0;
    color: white;
    opacity: 1;
    pointer-events: none;
    cursor: not-allowed;
  }

  .fb-final-control.disabled input {
    cursor: not-allowed;
  }
</style>
