<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbBoxedMessage from './fbBoxedMessage.svelte';

  let { text, children }: { text?: string; children?: Snippet } = $props();
</script>

{#if children}
  <FbBoxedMessage variant="warning">
    {@render children()}
  </FbBoxedMessage>
{:else}
  <FbBoxedMessage {text} variant="warning" />
{/if}
