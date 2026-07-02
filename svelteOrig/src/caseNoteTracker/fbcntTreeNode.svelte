<script lang="ts">
  import { tick } from 'svelte';
  import HighlightBlock from './fbcntHighlightBlock.svelte';

  export let label = '';
  export let level = 0;
  export let nodeKey = '';
  export let collapsed: Record<string, boolean> = {};
  export let toggleCollapsed: (key: string) => void = () => {};
  export let preventCollapse = false;

  let contentElement: HTMLDivElement | undefined;
  let contentHeight = 0;
  let hideContent = false;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  $: isCollapsed = !!collapsed[nodeKey];
  $: updateCollapseState(isCollapsed);

  async function measureContent() {
    await tick();
    contentHeight = contentElement?.scrollHeight || 0;
  }

  function updateCollapseState(collapsedNow: boolean) {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
    if (collapsedNow) {
      hideTimer = setTimeout(() => {
        hideContent = true;
      }, 500);
    } else {
      hideContent = false;
      void measureContent();
    }
  }

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

<div
  bind:this={contentElement}
  class="tree-content"
  class:tree-content-hidden={hideContent}
  style={`max-height: ${isCollapsed ? 0 : contentHeight}px`}
  aria-hidden={isCollapsed}
>
  <slot />
</div>

<style>
  .tree-toggle {
    width: 100%;
    border: 0;
    background-color: transparent;
    text-align: left;
    font-family: 'Roboto', sans-serif;
    font-size: 0.95rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    cursor: pointer;
  }

  .tree-icon {
    display: inline-block;
    width: 1rem;
    color: #1b6ec2;
    font-size: 0.85rem;
    line-height: 1;
    vertical-align: middle;
  }

  .tree-content {
    overflow: hidden;
    transition: max-height 0.5s ease;
  }

  .tree-content-hidden {
    visibility: hidden;
  }
</style>
