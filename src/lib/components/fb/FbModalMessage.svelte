<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div class="fb-modal-message">
  {@render children?.()}
</div>

<style>
  .fb-modal-message {
    max-width: 42rem;
    overflow-wrap: anywhere;
  }
</style>
