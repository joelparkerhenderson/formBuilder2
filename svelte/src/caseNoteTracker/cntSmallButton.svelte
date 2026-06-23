<script lang="ts">
  let { label, action = () => {} } = $props();
</script>

<button class="small-button" type="button" onclick={action}>{label}</button>

<style>
  .small-button {
    min-height: 1.6rem;
    min-width: 0;
    margin: 0.1rem;
    padding: 0 0.45rem;
    font-size: 0.8rem;
  }
</style>
