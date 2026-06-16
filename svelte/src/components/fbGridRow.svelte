<script lang="ts">
  export let cols = 1;
</script>

<div class="fb-grid-row" style="grid-template-columns: repeat({cols}, minmax(0, 1fr));">
  <slot />
</div>

<style>
  .fb-grid-row {
    display: grid;
    column-gap: 1rem;
    row-gap: 0.4rem;
    align-items: start;
    width: 100%;
  }
</style>
