<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import FbcButton from './fbcButton.svelte';
  import type { Snippet } from 'svelte';

  let {
    title,
    visible = false,
    onBack = () => {},
    backLabel = 'Back',
    children
  }: {
    title: string;
    visible?: boolean;
    onBack?: () => void;
    backLabel?: string;
    children: Snippet;
  } = $props();

  let modalElement = $state<HTMLDivElement | undefined>();
  let previouslyFocused: Element | null = null;
  let focusCaptured = false;
  const focusSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  $effect(() => {
    if (visible && !focusCaptured) {
      focusCaptured = true;
      previouslyFocused = document.activeElement;
      void focusInitialElement();
    } else if (!visible && focusCaptured) {
      restoreFocus();
    }
  });

  onDestroy(restoreFocus);

  async function focusInitialElement() {
    await tick();
    const focusable = Array.from(modalElement?.querySelectorAll<HTMLElement>(focusSelector) || []);
    (focusable[0] || modalElement)?.focus();
  }

  function restoreFocus() {
    if (!focusCaptured) return;
    focusCaptured = false;
    if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onBack();
      return;
    }
    if (event.key !== 'Tab' || !modalElement) return;
    const focusable = Array.from(modalElement.querySelectorAll<HTMLElement>(focusSelector));
    if (!focusable.length) {
      event.preventDefault();
      modalElement.focus();
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

{#if visible}
  <div class="fbc-modal" role="dialog" aria-modal="true" aria-label={title} bind:this={modalElement} tabindex="-1" onkeydown={handleKeydown}>
    <div class="fbc-modal-title">{title}</div>
    <div class="fbc-modal-content">
      {@render children()}
    </div>
    <div class="fbc-modal-footer">
      <FbcButton onClick={onBack}>{backLabel}</FbcButton>
    </div>
  </div>
{/if}

<style>
  .fbc-modal {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    background: white;
    border-top: 0.1rem solid silver;
    box-sizing: border-box;
  }

  .fbc-modal-title {
    border-bottom: 0.1rem solid silver;
    padding: 0.25rem 0.4rem;
    font-family: 'Roboto', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .fbc-modal-content {
    min-height: 0;
    flex: 0 1 auto;
    overflow-y: auto;
    padding: 0.4rem;
  }

  .fbc-modal-footer {
    flex: 0 0 auto;
    padding: 0.4rem;
    border-top: 0.1rem solid silver;
  }
</style>
