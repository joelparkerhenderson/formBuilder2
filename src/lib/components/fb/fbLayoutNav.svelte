<script lang="ts">
  export type FbLayoutNavItem = {
    id: string;
    label: string;
    isActive: boolean;
    isComplete?: boolean;
    incomplete?: number;
    onClick: (event: MouseEvent) => void;
  };

  let {
    items,
    emptyLabel = 'No sections',
    showCounters = true
  }: {
    items: FbLayoutNavItem[];
    emptyLabel?: string;
    showCounters?: boolean;
  } = $props();

  let hoveredCounterId = $state('');
  let focusedCounterId = $state('');

  function counterStyle(item: FbLayoutNavItem, complete: boolean) {
    const active = hoveredCounterId === item.id || focusedCounterId === item.id;
    return [
      `background-color: ${active ? '#fee715' : complete ? '#008000' : '#fd8a10'}`,
      `color: ${active ? 'black' : 'white'}`
    ].join('; ');
  }
</script>

<div class="fb-layout-nav-grid" class:no-counters={!showCounters}>
  {#if items.length === 0}
    <div class="fb-layout-nav-empty">{emptyLabel}</div>
  {:else}
    {#each items as item (item.id)}
      {@const counterIsComplete = Boolean(item.isComplete || !item.incomplete)}
      <button
        type="button"
        class="fb-layout-nav-section-name"
        id={`nav-${item.id}`}
        onclick={item.onClick}
        style="background-color: #1b6ec2;"
      >
        {item.label}
      </button>
      {#if showCounters}
        <button
          type="button"
          class={`fb-layout-nav-counter-box ${counterIsComplete ? 'complete' : 'incomplete'}`}
          onclick={item.onClick}
          onmouseenter={() => hoveredCounterId = item.id}
          onmouseleave={() => hoveredCounterId = ''}
          onfocus={() => focusedCounterId = item.id}
          onblur={() => focusedCounterId = ''}
          style={counterStyle(item, counterIsComplete)}
          aria-label={counterIsComplete ? `${item.label} complete` : `${item.label} incomplete fields: ${item.incomplete}`}
        >
          {#if counterIsComplete}
            <span class="material-icons fb-layout-nav-check" aria-hidden="true">check</span>
          {:else}
            {item.incomplete}
          {/if}
        </button>
      {/if}
      <span class={`fb-layout-nav-indicator ${!item.isActive ? 'hidden' : ''}`}>{'\u25c0\u25b6'}</span>
    {/each}
  {/if}
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

  .fb-layout-nav-empty {
    font-weight: 300;
    font-size: 0.85rem;
  }

  .fb-layout-nav-section-name,
  .fb-layout-nav-counter-box {
    border: none;
    color: white;
    font-family: 'Roboto', sans-serif;
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
    height: 1.8rem;
    min-width: 1.8rem;
    padding: 0.1rem;
    border: 0.2rem solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.5s ease-out, color 0.5s ease-out;
    box-sizing: border-box;
  }

  .fb-layout-nav-check {
    font-size: 1rem;
    line-height: 1;
  }

  .fb-layout-nav-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.8rem;
    color: #1b6ec2;
  }

  .fb-layout-nav-indicator.hidden {
    visibility: hidden;
  }
</style>
