<script lang="ts">
  import FbTable from '../components/fbTable.svelte';
</script>

<div class="table-wrap">
  <FbTable>
    <slot />
  </FbTable>
</div>

<style>
  .table-wrap { width: 100%; overflow: auto; }
  .table-wrap :global(th) {
    padding: 0.4rem;
    text-align: left;
    color: #555;
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 300;
    background: white;
    vertical-align: bottom;
  }
  .table-wrap :global(td) {
    padding: 0.4rem;
    border-bottom: 0.1rem solid silver;
    vertical-align: top;
    background: white;
  }
  .table-wrap :global(tr) { border-bottom: 0.1rem solid silver; }
  .table-wrap :global(td:hover),
  .table-wrap :global(td:focus-within) { background: #ffffcc; }
</style>
