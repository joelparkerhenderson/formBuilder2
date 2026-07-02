<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, tick } from 'svelte';
  import FbLayoutNav from './fbLayoutNav.svelte';
  import type { SectionSpec } from '$lib/types';

  let {
    header,
    children,
    bottomControls,
    sections = [],
    formState = {},
    activeSection = $bindable(''),
    isReadOnlyView = false,
    onFormActivity,
    onSubmit
  }: {
    header?: Snippet;
    children?: Snippet;
    bottomControls?: Snippet;
    sections?: SectionSpec[];
    formState?: Record<string, unknown>;
    activeSection?: string;
    isReadOnlyView?: boolean;
    onFormActivity?: (event: Event) => void;
    onSubmit?: (event: SubmitEvent) => void;
  } = $props();

  let formElement = $state<HTMLFormElement | undefined>();
  let scrollContainer = $state<HTMLDivElement | undefined>();
  let resizeObserver: ResizeObserver | undefined;
  let programmaticScrollTimeout: number | null = null;
  let programmaticScrollSectionId = '';

  const hasNavPanel = $derived(sections.length > 0);

  function getSectionStatus(section: SectionSpec, stateInput: Record<string, unknown>) {
    let incomplete = 0;
    const state = stateInput || {};
    if (section.requiredFields) {
      incomplete += section.requiredFields.filter((field) => !state[field] || state[field] === '').length;
    }
    if (section.getIncompleteCount) {
      incomplete += section.getIncompleteCount(state);
    }
    return {
      incomplete,
      isComplete: incomplete === 0
    };
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!formElement || !formElement.contains(document.activeElement)) return;
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    const isSubmitButton = target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit';
    if (!isSubmitButton) event.preventDefault();
  }

  function resizeTextareaToContent(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(44, textarea.scrollHeight)}px`;
  }

  async function applyFormLayoutEffects() {
    await tick();
    if (!formElement) return;

    formElement.querySelectorAll('textarea').forEach((textarea) => {
      resizeTextareaToContent(textarea as HTMLTextAreaElement);
    });

    const isMobile = window.innerWidth < 768;
    formElement.querySelectorAll('.fb-grid-row').forEach((row) => {
      const labels = Array.from(row.children)
        .map((child) => child.querySelector('.fb-question-label, .fb-group-label') as HTMLElement | null)
        .filter((label): label is HTMLElement => Boolean(label));

      labels.forEach((label) => {
        label.style.height = '';
        label.style.minHeight = '';
        label.style.paddingTop = '';
        label.style.display = '';
        label.style.alignItems = '';
        label.style.boxSizing = '';
      });

      if (isMobile || labels.length < 2) return;
      const heights = labels.map((label) => label.getBoundingClientRect().height);
      const maxHeight = Math.max(...heights);
      labels.forEach((label, index) => {
        const diff = maxHeight - heights[index];
        label.style.boxSizing = 'border-box';
        label.style.height = `${maxHeight}px`;
        label.style.paddingTop = `${Math.max(0, diff)}px`;
        label.style.display = 'block';
      });
    });
  }

  function getNestingLevel(element: HTMLElement) {
    let level = 0;
    let current = element.parentElement;
    while (current) {
      if (
        current.classList.contains('fb-question-container') ||
        current.classList.contains('fb-radio-checkbox-group-container') ||
        current.classList.contains('fb-radio-checkbox-item') ||
        current.classList.contains('fb-subquestion') ||
        current.tagName === 'TD'
      ) {
        level += 1;
      }
      current = current.parentElement;
    }
    return level;
  }

  function attachHighlightListeners() {
    if (isReadOnlyView) return () => {};
    const lighterYellow = '#ffffcc';
    const yellow = '#fee715';
    const elements = Array.from(
      document.querySelectorAll('.fb-question-container, .fb-radio-checkbox-group-container, .fb-radio-checkbox-item, .fb-subquestion')
    ) as HTMLElement[];

    const enter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      target.style.backgroundColor = getNestingLevel(target) % 2 === 0 ? lighterYellow : yellow;
    };
    const leave = (event: Event) => {
      (event.currentTarget as HTMLElement).style.backgroundColor = '';
    };

    elements.forEach((element) => {
      element.addEventListener('mouseenter', enter);
      element.addEventListener('mouseleave', leave);
      element.addEventListener('focusin', enter);
      element.addEventListener('focusout', leave);
    });

    return () => {
      elements.forEach((element) => {
        element.removeEventListener('mouseenter', enter);
        element.removeEventListener('mouseleave', leave);
        element.removeEventListener('focusin', enter);
        element.removeEventListener('focusout', leave);
      });
    };
  }

  function handleScroll() {
    if (isReadOnlyView || programmaticScrollSectionId || !scrollContainer) return;
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      if (rect.top <= containerRect.top + 100 && rect.bottom > containerRect.top) {
        activeSection = section.id;
        break;
      }
    }
  }

  function scrollToSection(sectionId: string) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement || !scrollContainer) return;
    const sectionRect = sectionElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const nextTop = scrollContainer.scrollTop + sectionRect.top - containerRect.top;
    if (programmaticScrollTimeout) window.clearTimeout(programmaticScrollTimeout);
    programmaticScrollSectionId = sectionId;
    programmaticScrollTimeout = window.setTimeout(() => {
      activeSection = sectionId;
      programmaticScrollSectionId = '';
      programmaticScrollTimeout = null;
    }, 700);
    scrollContainer.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    activeSection = sectionId;
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    onSubmit?.(event);
  }

  $effect(() => {
    formState;
    children;
    let cleanup = () => {};
    let cancelled = false;
    tick().then(() => {
      if (cancelled) return;
      cleanup = attachHighlightListeners();
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  });

  onMount(() => {
    const handleActivity = (event: Event) => onFormActivity?.(event);
    const handleResize = () => applyFormLayoutEffects();
    let cleanupHighlights = attachHighlightListeners();
    const observer = formElement
      ? new MutationObserver(() => {
          cleanupHighlights();
          cleanupHighlights = attachHighlightListeners();
          applyFormLayoutEffects();
        })
      : null;
    formElement?.addEventListener('input', handleActivity, true);
    formElement?.addEventListener('change', handleActivity, true);
    formElement?.addEventListener('input', handleResize, true);
    window.addEventListener('resize', handleResize);
    if (formElement) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(formElement);
    }
    if (formElement && observer) observer.observe(formElement, { childList: true, subtree: true });
    scrollContainer?.addEventListener('scroll', handleScroll);
    applyFormLayoutEffects();
    handleScroll();
    return () => {
      observer?.disconnect();
      formElement?.removeEventListener('input', handleActivity, true);
      formElement?.removeEventListener('change', handleActivity, true);
      formElement?.removeEventListener('input', handleResize, true);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      cleanupHighlights();
      scrollContainer?.removeEventListener('scroll', handleScroll);
      if (programmaticScrollTimeout) window.clearTimeout(programmaticScrollTimeout);
    };
  });
</script>

<div class="fb-layout-container">
  <form
    bind:this={formElement}
    class="fb-layout-edit-view-form"
    onsubmit={submit}
    onkeydown={handleKeyDown}
    novalidate
  >
    <div class="fb-layout-header">
      {#if header}
        {@render header()}
      {/if}
    </div>

    <div class="fb-layout-middle">
      {#if hasNavPanel}
        <nav class="fb-layout-nav" aria-label="Form sections">
          <FbLayoutNav
            items={sections.map((section) => {
              const status = getSectionStatus(section, formState);
              return {
                id: section.id,
                label: section.name,
                isActive: activeSection === section.id,
                isComplete: status.isComplete,
                incomplete: status.incomplete,
                onClick: () => scrollToSection(section.id)
              };
            })}
            showCounters={!isReadOnlyView}
          />
        </nav>
      {/if}

      <div bind:this={scrollContainer} class="fb-layout-scroll">
        <div style="width: 100%;">
          {#if children}
            {@render children()}
          {/if}
        </div>
      </div>
    </div>

    <div class="fb-layout-bottom">
      {#if bottomControls}
        {@render bottomControls()}
      {/if}
    </div>
  </form>
</div>

<style>
  .fb-layout-container {
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background: white;
    box-sizing: border-box;
    font-weight: 300;
    line-height: 1.1;
  }

  .fb-layout-edit-view-form {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .fb-layout-header,
  .fb-layout-bottom {
    flex-shrink: 0;
  }

  .fb-layout-middle {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .fb-layout-nav {
    width: 16rem;
    overflow-y: auto;
    background: white;
    padding: 0.4rem 0.2rem 0.4rem 0.4rem;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .fb-layout-scroll {
    flex: 1 1 auto;
    overflow-y: auto;
    background: white;
    padding: 0.8rem 0.6rem 4rem 0;
    height: 100%;
    box-sizing: border-box;
    scroll-behavior: smooth;
  }
</style>
