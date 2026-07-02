<script lang="ts">
  import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
  import FbLayoutNav from './fbLayoutNav.svelte';
  import type { SectionSpec } from '../lib/types';

  export let sections: SectionSpec[] = [];
  export let formState: Record<string, any> = {};
  export let activeSection = '';
  export let isReadOnlyView = false;
  export let onFormActivity: (event: Event) => void = () => {};
  let formElement: HTMLFormElement;
  let resizeObserver: ResizeObserver | undefined;

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

  onMount(() => {
    if (!formElement) return;
    const handleActivity = (event: Event) => onFormActivity(event);
    const handleResize = () => applyFormLayoutEffects();
    formElement.addEventListener('input', handleActivity, true);
    formElement.addEventListener('change', handleActivity, true);
    formElement.addEventListener('input', handleResize, true);
    window.addEventListener('resize', handleResize);
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(formElement);
    applyFormLayoutEffects();
    return () => {
      formElement.removeEventListener('input', handleActivity, true);
      formElement.removeEventListener('change', handleActivity, true);
      formElement.removeEventListener('input', handleResize, true);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  });

  afterUpdate(() => {
    applyFormLayoutEffects();
  });

  export function getSectionStatus(section: SectionSpec, state: Record<string, any>) {
    let incomplete = 0;
    if (section.requiredFields) {
      incomplete += section.requiredFields.filter((field) => !state[field] || state[field] === '').length;
    }
    if (section.getIncompleteCount) incomplete += section.getIncompleteCount(state || {});
    return { incomplete, isComplete: incomplete === 0 };
  }

  export function areAllSectionsComplete(sectionSpecs: SectionSpec[], state: Record<string, any>) {
    return sectionSpecs.every((section) => getSectionStatus(section, state).isComplete);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!formElement || !formElement.contains(document.activeElement)) return;
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    const isSubmitButton = target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit';
    if (!isSubmitButton) event.preventDefault();
  }

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    const container = section?.closest('.fb-layout-scroll') as HTMLElement | null;
    if (!section || !container) return;
    const sectionRect = section.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    container.scrollTo({ top: container.scrollTop + sectionRect.top - containerRect.top, behavior: 'smooth' });
    activeSection = sectionId;
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

  function applyHighlight(element: HTMLElement) {
    const level = getNestingLevel(element);
    element.style.backgroundColor = level % 2 === 1 ? '#fee715' : '#ffffcc';
  }

  function clearHighlight(element: HTMLElement) {
    element.style.backgroundColor = '';
  }

  function wireHighlighting() {
    if (!formElement || isReadOnlyView) return () => undefined;
    const elements = Array.from(formElement.querySelectorAll('.fb-question-container, .fb-radio-checkbox-group-container, .fb-radio-checkbox-item, .fb-subquestion')) as HTMLElement[];
    const onEnter = (event: Event) => applyHighlight(event.currentTarget as HTMLElement);
    const onLeave = (event: Event) => clearHighlight(event.currentTarget as HTMLElement);
    elements.forEach((element) => {
      element.addEventListener('mouseenter', onEnter);
      element.addEventListener('mouseleave', onLeave);
      element.addEventListener('focusin', onEnter);
      element.addEventListener('focusout', onLeave);
    });
    return () => {
      elements.forEach((element) => {
        element.removeEventListener('mouseenter', onEnter);
        element.removeEventListener('mouseleave', onLeave);
        element.removeEventListener('focusin', onEnter);
        element.removeEventListener('focusout', onLeave);
      });
    };
  }

  let unwireHighlighting: () => void = () => undefined;

  afterUpdate(() => {
    unwireHighlighting();
    unwireHighlighting = wireHighlighting();
  });

  onDestroy(() => {
    unwireHighlighting();
  });

  $: navItems = sections.map((section) => {
    const status = getSectionStatus(section, formState);
    return {
      id: section.id,
      label: section.name,
      isActive: activeSection === section.id,
      isComplete: status.isComplete,
      incomplete: status.incomplete,
      onClick: () => scrollToSection(section.id),
    };
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="fb-layout-container">
  <form
    bind:this={formElement}
    class="fb-layout-edit-view-form"
    onsubmit={(event) => event.preventDefault()}
    novalidate
  >
    <div class="fb-layout-header"><slot name="header" /></div>
    <div class="fb-layout-middle">
      {#if sections.length > 0}
        <nav class="fb-layout-nav" aria-label="Form sections">
          <FbLayoutNav items={navItems} showCounters={!isReadOnlyView} />
        </nav>
      {/if}
      <div class="fb-layout-scroll">
        <div style="width: 100%;">
          <slot />
        </div>
      </div>
    </div>
    <div class="fb-layout-bottom"><slot name="bottomControls" /></div>
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
