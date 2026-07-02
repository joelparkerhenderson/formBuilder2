<script lang="ts">
  export let note = 'Shared CNT helpers are implemented in native Svelte component modules.';
</script>

<span class="sr-only">{note}</span>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
