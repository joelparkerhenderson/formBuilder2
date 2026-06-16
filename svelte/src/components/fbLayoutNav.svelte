<script lang="ts">
  import { fbBlue, fbGreen, fbOrange } from '../lib/constants';

  export let items: Array<{
    id: string;
    label: string;
    isActive: boolean;
    isComplete: boolean;
    incomplete: number;
    onClick: () => void;
  }> = [];
  export let showCounters = true;
</script>

<div class="fb-layout-nav-grid" class:no-counters={!showCounters}>
  {#each items as item (item.id)}
    {@const counterIsComplete = Boolean(item.isComplete || !item.incomplete)}
    <button
      type="button"
      class="fb-layout-nav-section-name"
      onclick={item.onClick}
      style="background-color: {fbBlue};"
    >
      {item.label}
    </button>
    {#if showCounters}
      <button
        type="button"
        class="fb-layout-nav-counter-box {counterIsComplete ? 'complete' : 'incomplete'}"
        onclick={item.onClick}
        style="background-color: {counterIsComplete ? fbGreen : fbOrange};"
        aria-label={`${item.label} ${counterIsComplete ? 'complete' : `${item.incomplete} incomplete`}`}
      >
        {#if counterIsComplete}
          <span class="material-icons fb-layout-nav-check" aria-hidden="true">check</span>
        {:else}
          {item.incomplete}
        {/if}
      </button>
    {/if}
    <span class="fb-layout-nav-indicator" style:visibility={item.isActive ? 'visible' : 'hidden'}>{'\u25c0\u25b6'}</span>
  {/each}
</div>

<style>
  .fb-layout-nav-grid {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) 2rem 2.8rem;
    align-items: stretch;
    column-gap: 0.3rem;
    row-gap: 0.2rem;
  }

  .fb-layout-nav-grid.no-counters {
    grid-template-columns: minmax(10rem, 1fr) 2.8rem;
  }

  .fb-layout-nav-section-name,
  .fb-layout-nav-counter-box {
    border: none;
    color: white;
    font-size: 1rem;
    line-height: 1.2rem;
    font-weight: 500;
    min-height: 1.8rem;
    cursor: pointer;
    box-sizing: border-box;
  }

  .fb-layout-nav-section-name {
    text-align: right;
    padding: 0.2rem 0.4rem;
    border-radius: 0.8rem 0 0 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fb-layout-nav-counter-box {
    width: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0.2rem solid transparent;
    padding: 0.1rem;
    height: 1.8rem;
    min-width: 1.8rem;
    transition: background-color 0.5s ease-out, color 0.5s ease-out;
    box-sizing: border-box;
  }

  .fb-layout-nav-check {
    font-size: 1rem;
    line-height: 1;
  }

  .fb-layout-nav-counter-box:hover,
  .fb-layout-nav-counter-box:focus {
    background-color: #fee715 !important;
    color: black;
  }

  .fb-layout-nav-indicator {
    color: #1b6ec2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.8rem;
  }
</style>
