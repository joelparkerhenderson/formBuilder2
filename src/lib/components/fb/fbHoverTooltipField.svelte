<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tooltipText,
    children
  }: {
    tooltipText: string;
    children: Snippet;
  } = $props();

  let hovered = $state(false);
</script>

<span
  class="fb-hover-tooltip-field"
  data-lily-reference-component="tooltip"
  role="group"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
>
  {@render children()}
  {#if hovered}
    <span class="fb-hover-tooltip-field-popup" role="tooltip">{tooltipText}</span>
  {/if}
</span>

<style>
  .fb-hover-tooltip-field {
    position: relative;
    display: block;
    width: fit-content;
  }

  .fb-hover-tooltip-field-popup {
    position: absolute;
    left: 0;
    bottom: 100%;
    margin-bottom: 4px;
    border: 1px solid silver;
    border-radius: 0.4rem;
    color: black;
    font-size: 0.8rem;
    font-weight: 300;
    line-height: 1rem;
    padding: 0.25rem 0.4rem;
    text-align: left;
    width: 12rem;
    background-color: #8cd2e7;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    z-index: 50;
    pointer-events: none;
    white-space: normal;
  }
</style>
