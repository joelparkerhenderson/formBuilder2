<script lang="ts">
  export let message = '';
</script>

{#if message}
  <span class="fb-value-error" role="alert" aria-live="polite">
    <span class="material-icons" aria-hidden="true">error</span>
    <span>{message}</span>
  </span>
{/if}

<style>
  .fb-value-error {
    color: var(--fb-red);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .fb-value-error .material-icons {
    color: var(--fb-red);
    background: white;
    font-size: 1rem;
    vertical-align: text-bottom;
    margin-right: 0.2rem;
  }
</style>
