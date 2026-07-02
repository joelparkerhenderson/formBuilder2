<script lang="ts">
  import type { Snippet } from 'svelte';
  import { slide } from 'svelte/transition';

  let {
    open,
    children
  }: {
    open: boolean;
    children?: Snippet;
  } = $props();
</script>

{#if open}
  <div class="fb-subquestion-collapsible" data-lily-reference-component="disclosure" transition:slide={{ duration: 500 }}>
    <div class="fb-subquestion-content">
      {#if children}{@render children()}{/if}
    </div>
  </div>
{/if}

<style>
  .fb-subquestion-collapsible {
    margin-top: 0.3rem;
    transition: background-color 0.1s ease;
  }

  .fb-subquestion-content {
    padding-left: 1.5rem;
    padding-bottom: 0.25rem;
  }
</style>
