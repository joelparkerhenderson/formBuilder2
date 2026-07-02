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
    onclick={toggle}
    aria-disabled={!isCollapsed && preventCollapse}
    aria-expanded={!isCollapsed}
  >
    <span class="tree-icon" aria-hidden="true">{isCollapsed ? '\u25b6' : '\u25bc'}</span>
    <strong>{label}</strong>
  </button>
</HighlightBlock>

{#if !isCollapsed}
  <div class="tree-content" transition:slide={{ duration: 500 }} aria-hidden={isCollapsed}>
    <slot />
  </div>
{/if}

<style>
  .tree-toggle {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    width: 100%;
    border: 0;
    background-color: transparent;
    color: #111;
    text-align: left;
    font-family: 'Roboto', sans-serif;
    font-size: 0.95rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    cursor: pointer;
  }

  .tree-icon {
    display: inline-block;
    line-height: 1;
  }

  .tree-content {
    overflow: hidden;
    min-height: 0;
  }
</style>
