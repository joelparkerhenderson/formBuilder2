<script lang="ts">
  export let label = '';
</script>

<fieldset class="group-with-border">
  {#if label}<legend>{label}</legend>{/if}
  <slot />
</fieldset>

<style>
  .group-with-border {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.6rem;
    margin: 0;
    background-color: white;
  }

  legend {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    padding: 0 0.3rem;
  }
</style>
