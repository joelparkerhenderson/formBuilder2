<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntTag from './FbcntTag.svelte';

  export let store: CntStore;
  export let volume: CntVolume;

  $: tags = store?.tags.filter((tag) => tag.volumeUuid === volume?.uuid && tag.status === 'active') || [];
</script>

{#each tags as tag (tag.uuid)}
  <FbcntTag {tag} />
{/each}
