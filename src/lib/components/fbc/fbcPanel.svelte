<script lang="ts">
  import { onMount, tick } from 'svelte';

  let bodyElement: HTMLDivElement | undefined;
  let propertiesElement: HTMLDivElement | undefined;
  let actionsElement: HTMLDivElement | undefined;
  let constrained = $state(false);

  function updateLayoutMode() {
    if (!bodyElement || !propertiesElement || !actionsElement) return;
    const bodyStyle = window.getComputedStyle(bodyElement);
    const rowGap = Number.parseFloat(bodyStyle.rowGap || bodyStyle.gap || '0') || 0;
    constrained = propertiesElement.scrollHeight + actionsElement.scrollHeight + rowGap > bodyElement.clientHeight + 1;
  }

  $effect(() => {
    tick().then(updateLayoutMode);
  });

  onMount(() => {
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateLayoutMode);
    const mutationObserver = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(updateLayoutMode);
    if (resizeObserver) {
      [bodyElement, propertiesElement, actionsElement].forEach((element) => {
        if (element) resizeObserver.observe(element);
      });
    }
    if (mutationObserver) {
      [propertiesElement, actionsElement].forEach((element) => {
        if (element) mutationObserver.observe(element, { attributes: true, childList: true, characterData: true, subtree: true });
      });
    }
    window.addEventListener('resize', updateLayoutMode);
    updateLayoutMode();
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', updateLayoutMode);
    };
  });
</script>

<aside class="fb-designer-panel fbc-panel">
  <div class="fbc-panel-header"><slot name="header" /></div>
  <div class:fbc-panel-body-constrained={constrained} class="fbc-panel-body" bind:this={bodyElement}>
    <div class="fbc-panel-scroll fbc-panel-properties" bind:this={propertiesElement}><slot name="properties" /></div>
    <div class="fbc-panel-scroll fbc-panel-actions" bind:this={actionsElement}><slot name="actions" /></div>
  </div>
  <div class="fbc-panel-footer"><slot name="footer" /></div>
</aside>

<style>
  .fbc-panel {
    border-left: 0.1rem solid black;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .fbc-panel-header {
    flex: 0 0 auto;
  }

  .fbc-panel-body {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, max-content) minmax(0, 1fr);
    gap: 0.5rem;
    padding: 0.6rem 0;
    overflow: hidden;
  }

  .fbc-panel-body-constrained {
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  }

  .fbc-panel-scroll {
    min-height: 0;
    overflow: auto;
  }

  .fbc-panel-actions {
    position: relative;
    border-top: 0.1rem solid silver;
    padding-top: 0.5rem;
  }

  .fbc-panel-footer {
    flex: 0 0 auto;
    padding-top: 0.5rem;
  }

  @media (max-width: 900px) {
    .fbc-panel {
      border-left: 0;
      border-top: 0.1rem solid black;
    }
  }
</style>
