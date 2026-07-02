<script lang="ts">
  import FbBadgeHighlySensitive from './fbBadgeHighlySensitive.svelte';
  import FbHoverTooltipField from './fbHoverTooltipField.svelte';

  let {
    dateTime,
    formTypeName,
    speciality,
    src,
    highlySensitive = false
  }: {
    dateTime: string;
    formTypeName: string;
    speciality: string;
    src: string;
    highlySensitive?: boolean;
  } = $props();
</script>

<div class="fb-form-tile" data-lily-reference-component="description-list">
  <FbHoverTooltipField tooltipText="Document Date & Time">
    <div class="fb-form-tile-light">{dateTime}</div>
  </FbHoverTooltipField>
  <div class="fb-form-tile-title">
    {formTypeName}
    {#if highlySensitive}
      <span class="fb-form-tile-badge"><FbBadgeHighlySensitive /></span>
    {/if}
  </div>
  {#if speciality}
    <FbHoverTooltipField tooltipText="Speciality">
      <div class="fb-form-tile-light">{speciality}</div>
    </FbHoverTooltipField>
  {/if}
  {#if src}
    <FbHoverTooltipField tooltipText="Senior Responsible Clinician">
      <div class="fb-form-tile-light">{src}</div>
    </FbHoverTooltipField>
  {/if}
</div>

<style>
  .fb-form-tile {
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: 'Roboto', sans-serif;
    color: black;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.15;
    text-align: left;
  }

  .fb-form-tile-title {
    font-weight: 500;
  }

  .fb-form-tile-light {
    font-weight: 300;
  }

  .fb-form-tile-badge {
    margin-left: 0.4rem;
  }
</style>
