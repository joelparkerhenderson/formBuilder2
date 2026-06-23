<script lang="ts">
  import HighlightBlock from './fbcntHighlightBlock.svelte';

  export let label = '';
  export let level = 0;
  export let nodeKey = '';
  export let collapsed: Record<string, boolean> = {};
  export let toggleCollapsed: (key: string) => void = () => {};
  export let preventCollapse = false;

  $: isCollapsed = !!collapsed[nodeKey];

  function toggle() {
    if (!isCollapsed && preventCollapse) return;
    toggleCollapsed(nodeKey);
  }
</script>

<HighlightBlock {level}>
  <button
    type="button"
    class="tree-toggle"
    style={`padding-left: ${level * 1.6}rem`}
    onclick={toggle}
    aria-disabled={!isCollapsed && preventCollapse}
  >
    <span aria-hidden="true">{isCollapsed ? '▶' : '▼'}</span>
    <strong>{label}</strong>
  </button>
</HighlightBlock>

{#if !isCollapsed}
  <div><slot /></div>
{/if}

<style>
  .tree-toggle {
    width: 100%;
    border: 0;
    background-color: transparent;
    text-align: left;
    font-family: 'Roboto', sans-serif;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .tree-toggle span {
    display: inline-block;
    width: 1rem;
  }
</style>
