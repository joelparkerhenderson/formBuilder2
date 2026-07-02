<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let danger = false;
  export let disabled = false;
  export let className = '';
  export let onClick: () => void = () => {};
</script>

<button
  {type}
  class={`fbc-button ${className}`}
  class:fbc-button-danger={danger}
  {disabled}
  onclick={onClick}
>
  <slot />
</button>

<style>
  .fbc-button {
    height: auto;
    line-height: normal;
    padding: 0.25rem 0.45rem;
    border: 0.1rem solid black;
    border-radius: 0;
    background-color: white;
    color: black;
    font-family: 'Roboto', sans-serif;
    font-size: 0.85rem;
    font-weight: 300;
    cursor: pointer;
  }

  .fbc-button-danger {
    border-color: var(--fb-red);
    color: var(--fb-red);
  }

  .fbc-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fbc-button:not(:disabled):hover,
  .fbc-button:not(:disabled):focus,
  .fbc-button:not(:disabled):focus-visible {
    background-color: #e6e6e6;
    outline: none;
  }
</style>
