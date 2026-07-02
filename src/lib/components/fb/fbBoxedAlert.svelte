<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbBoxedMessage from './fbBoxedMessage.svelte';

  let { text, children }: { text?: string; children?: Snippet } = $props();
</script>

{#if children}
  <FbBoxedMessage variant="alert">
    {@render children()}
  </FbBoxedMessage>
{:else}
  <FbBoxedMessage {text} variant="alert" />
{/if}
