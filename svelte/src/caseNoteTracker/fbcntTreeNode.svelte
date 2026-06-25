<script lang="ts">
  import { slide } from 'svelte/transition';
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
    on:click={toggle}
    aria-disabled={!isCollapsed && preventCollapse}
    aria-expanded={!isCollapsed}
  >
    <span class="material-icons tree-icon" aria-hidden="true">{isCollapsed ? 'chevron_right' : 'expand_more'}</span>
    <strong>{label}</strong>
  </button>
</HighlightBlock>

{#if !isCollapsed}
  <div transition:slide={{ duration: 500 }}><slot /></div>
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

  .tree-icon {
    display: inline-block;
    width: 1rem;
    color: #1b6ec2;
    font-size: 1.1rem;
    line-height: 1;
    vertical-align: middle;
  }
</style>
