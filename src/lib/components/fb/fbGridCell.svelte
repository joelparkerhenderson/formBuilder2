<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    id,
    span = 1,
    children,
    class: className = ''
  }: {
    id?: string;
    span?: number;
    children: Snippet;
    class?: string;
  } = $props();

  let mobile = $state(false);

  const cellStyle = $derived(`grid-column: ${mobile ? 'auto' : `span ${span} / span ${span}`};`);

  function updateMobileState() {
    mobile = window.innerWidth < 768;
  }

  $effect(() => {
    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  });
</script>

<div {id} class={className} style={cellStyle}>
  {@render children()}
</div>
