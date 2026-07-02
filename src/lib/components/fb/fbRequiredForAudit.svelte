<script lang="ts">
  let markerElement = $state<HTMLSpanElement | undefined>();
  let position = $state<{ x: number; y: number } | null>(null);

  function showTooltip() {
    const rect = markerElement?.getBoundingClientRect();
    if (!rect) return;
    position = {
      x: Math.max(10, Math.min(rect.left, window.innerWidth - 260)),
      y: Math.max(10, rect.bottom + 4)
    };
  }
</script>

<button
  type="button"
  bind:this={markerElement}
  class="fb-required-for-audit"
  aria-label="Required for audit"
  onmouseenter={showTooltip}
  onmouseleave={() => position = null}
  onfocus={showTooltip}
  onblur={() => position = null}
>
  RfA
</button>
{#if position}
  <span class="fb-required-for-audit-tooltip" style={`left: ${position.x}px; top: ${position.y}px;`}>Required for audit</span>
{/if}

<style>
  .fb-required-for-audit {
    background-color: #fd8a10;
    color: white;
    border: 0;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    margin-left: 0.1rem;
    padding: 0.05rem 0.2rem;
    display: inline-block;
    vertical-align: baseline;
    white-space: nowrap;
    cursor: default;
  }

  .fb-required-for-audit-tooltip {
    position: fixed;
    z-index: 3000;
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
    pointer-events: none;
  }
</style>
