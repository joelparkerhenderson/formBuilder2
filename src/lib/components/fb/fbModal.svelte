<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    title,
    children,
    footer,
    maxWidth = '500px',
    titleMarginBottom = '1rem',
    onEscape
  }: {
    title: string;
    children?: Snippet;
    footer?: Snippet;
    maxWidth?: string;
    titleMarginBottom?: string;
    onEscape?: () => void;
  } = $props();

  const titleId = `fb-modal-title-${Math.random().toString(36).slice(2)}`;
  let panelElement = $state<HTMLDivElement | undefined>();
  let previouslyFocused: Element | null = null;

  const focusSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  onMount(() => {
    previouslyFocused = document.activeElement;
    void focusInitialElement();
  });

  onDestroy(() => {
    if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
  });

  async function focusInitialElement() {
    await tick();
    const focusable = Array.from(panelElement?.querySelectorAll<HTMLElement>(focusSelector) || [])
      .find((element) => element.offsetParent !== null || element === document.activeElement);
    (focusable || panelElement)?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onEscape?.();
      return;
    }
    if (event.key !== 'Tab' || !panelElement) return;
    const focusable = Array.from(panelElement.querySelectorAll<HTMLElement>(focusSelector))
      .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
    if (!focusable.length) {
      event.preventDefault();
      panelElement.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
</script>

<div class="fb-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby={titleId} data-lily-reference-component="modal" tabindex="-1" onkeydown={handleKeydown}>
  <div class="fb-modal-panel" style={`max-width: ${maxWidth};`} bind:this={panelElement} tabindex="-1">
    <h2 id={titleId} style={`margin: 0 0 ${titleMarginBottom} 0;`}>{title}</h2>
    {#if children}{@render children()}{/if}
    {#if footer}{@render footer()}{/if}
  </div>
</div>

<style>
  .fb-modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .fb-modal-panel {
    background-color: white;
    border: 0.2rem solid rgb(27 110 194);
    border-radius: 0.4rem;
    padding: 1.5rem;
    width: 90%;
    font-family: 'Roboto', sans-serif;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 500;
    color: #1b6ec2;
  }
</style>
