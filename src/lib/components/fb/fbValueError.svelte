<script lang="ts">
  let {
    message = ''
  }: {
    message?: string;
  } = $props();
</script>

{#if message}
  <span class="fb-value-error" data-lily-reference-component="alert">
    <span class="material-icons" aria-hidden="true">error</span>
    <span>{message}</span>
  </span>
{/if}

<style>
  .fb-value-error {
    color: #d50000;
    font-family: 'Roboto', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1.2;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
  }

  .fb-value-error .material-icons {
    color: #d50000;
    font-size: 1rem;
  }
</style>
