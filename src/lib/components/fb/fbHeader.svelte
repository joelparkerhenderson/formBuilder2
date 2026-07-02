<script lang="ts">
  import FbAddressograph from './fbAddressograph.svelte';
  import FbBadgeDraft from './fbBadgeDraft.svelte';
  import FbBadgeHighlySensitive from './fbBadgeHighlySensitive.svelte';

  let {
    title,
    patient,
    formStatus,
    highlySensitive = false
  }: {
    title: string;
    patient?: Record<string, unknown> | null;
    formStatus: 'draft' | 'final' | string;
    highlySensitive?: boolean;
  } = $props();
</script>

<header class="fb-header-with-divider">
  <div class="fb-header-inner">
    <div class="fb-header-title-area">
      <div class="fb-header-badges" class:empty={formStatus !== 'draft' && !highlySensitive}>
        {#if formStatus === 'draft'}<FbBadgeDraft />{/if}
        {#if highlySensitive}<FbBadgeHighlySensitive />{/if}
      </div>
      <h1>{title}</h1>
    </div>

    {#if patient}
      <div class="fb-addressograph-container">
        <FbAddressograph patient={patient} />
      </div>
    {/if}
  </div>
</header>

<style>
  .fb-header-with-divider {
    background-color: white;
    border-bottom: 0.2rem solid #1b6ec2;
    padding: 0.4rem 0.8rem;
    box-sizing: border-box;
  }

  .fb-header-inner {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .fb-header-title-area {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .fb-header-badges {
    display: flex;
    gap: 0.4rem;
  }

  .fb-header-badges.empty {
    min-height: 0;
  }

  h1 {
    font-family: 'Space Grotesk', 'Roboto', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    line-height: 2rem;
  }

  .fb-addressograph-container {
    min-width: 22rem;
  }

  @media (max-width: 767px) {
    .fb-header-inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
