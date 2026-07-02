<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';

  export let store: CntStore;
  export let volume: CntVolume;

  $: activeTags = store?.tags.filter((tag) => tag.volumeUuid === volume?.uuid && tag.status === 'active') || [];
  $: tooltip = activeTags.map((tag) => `${tag.purpose}\n${tag.requiredBy}`).join('\n\n');
</script>

{#if activeTags.length}
  <span class="material-icons tag-icon" title={tooltip} aria-label="Tagged volume">local_offer</span>
{/if}

<style>
  .tag-icon {
    color: #fd8a10;
    font-family: 'Material Icons';
    font-size: 1.1rem;
    line-height: 1;
  }
</style>
