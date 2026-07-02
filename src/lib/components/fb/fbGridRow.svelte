<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    cols = 3,
    children,
    class: className = ''
  }: {
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    children: Snippet;
    class?: string;
  } = $props();

  let rowElement = $state<HTMLDivElement | undefined>();
  let mobile = $state(false);

  const rowStyle = $derived([
    'display: grid',
    'column-gap: 1rem',
    'row-gap: 0.4rem',
    'margin-bottom: 0.4rem',
    'margin-top: 0',
    `grid-template-columns: ${mobile ? '1fr' : `repeat(${cols}, minmax(0, 1fr))`}`
  ].join('; '));

  function adjustLabelHeights() {
    const container = rowElement;
    if (!container) return;
    const isMobile = window.innerWidth < 768;
    const labels = Array.from(container.querySelectorAll('.fb-question-container > label:not(.fb-radio-checkbox-item)')) as HTMLElement[];
    const filteredLabels = labels.filter((label) => {
      let parent = label.parentElement;
      while (parent && parent !== container) {
        if (parent.classList.contains('fb-subquestion') || parent.classList.contains('fb-subquestion-wrapper')) return false;
        parent = parent.parentElement;
      }
      return true;
    });

    if (filteredLabels.length <= 1) return;
    filteredLabels.forEach((label) => {
      label.style.height = 'auto';
      label.style.paddingTop = '0px';
      label.style.display = 'block';
    });
    if (isMobile) return;

    const heights = filteredLabels.map((label) => label.getBoundingClientRect().height);
    const maxHeight = Math.max(...heights);
    if (maxHeight > 0) {
      filteredLabels.forEach((label, index) => {
        const diff = maxHeight - heights[index];
        label.style.boxSizing = 'border-box';
        label.style.height = `${maxHeight}px`;
        label.style.paddingTop = `${diff}px`;
        label.style.display = 'block';
      });
    }
  }

  function updateMobileState() {
    mobile = window.innerWidth < 768;
  }

  $effect(() => {
    updateMobileState();
    const timer = window.setTimeout(adjustLabelHeights, 50);
    const handleResize = () => {
      updateMobileState();
      adjustLabelHeights();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div
  bind:this={rowElement}
  class={`fb-grid-row grid ${className}`.trim()}
  style={rowStyle}
>
  {@render children()}
</div>
