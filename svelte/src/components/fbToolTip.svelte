<script lang="ts">
  export let text = '';
  export let as: keyof HTMLElementTagNameMap = 'span';
  export let className = '';
  export let style = '';
  export let role: string | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let tabindex: number | undefined = undefined;
  export let onClick: ((event: MouseEvent) => void) | undefined = undefined;
  export let onKeydown: ((event: KeyboardEvent) => void) | undefined = undefined;
  let open = false;
  const tooltipId = `fb-tooltip-${Math.random().toString(36).slice(2)}`;
</script>

{#if text}
  <svelte:element
    this={as}
    class={`fb-tooltip-trigger ${className}`.trim()}
    {style}
    {role}
    {tabindex}
    aria-label={ariaLabel}
    aria-describedby={open ? tooltipId : undefined}
    onclick={onClick}
    onkeydown={onKeydown}
    onmouseenter={() => (open = true)}
    onmouseleave={() => (open = false)}
    onfocusin={() => (open = true)}
    onfocusout={() => (open = false)}
  >
    <slot />
    {#if open}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
      <div
        id={tooltipId}
        class="fb-tooltip-bubble"
        role="tooltip"
        onclick={(event) => {
          event.stopPropagation();
          open = false;
        }}
      >
        <div class="fb-tooltip-text">{text}</div>
        <button
          type="button"
          aria-label="Close tooltip"
          onclick={(event) => {
            event.stopPropagation();
            open = false;
          }}
        >Close</button>
      </div>
    {/if}
  </svelte:element>
{:else}
  <svelte:element this={as} class={className} {style} {role} {tabindex} aria-label={ariaLabel} onclick={onClick} onkeydown={onKeydown}>
    <slot />
  </svelte:element>
{/if}

<style>
  .fb-tooltip-trigger {
    position: relative;
    outline: none;
  }

  .fb-tooltip-bubble {
    position: absolute;
    left: 0;
    bottom: calc(100% + 0.25rem);
    z-index: 1000;
    width: 15rem;
    max-width: min(15rem, calc(100vw - 2rem));
    background: #8cd2e7;
    color: black;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.15);
    padding: 0.2rem;
    font-size: 0.8rem;
    font-weight: 300;
    line-height: 1rem;
    text-align: left;
    white-space: normal;
  }

  .fb-tooltip-text {
    padding-bottom: 1.5rem;
  }

  .fb-tooltip-bubble button {
    position: absolute;
    right: 0.2rem;
    bottom: 0.2rem;
    border: 0.1rem solid black;
    border-radius: 0.2rem;
    background: transparent;
    color: black;
    font: inherit;
    font-size: 0.5rem;
    line-height: 1;
    padding: 0rem 0.3rem;
    cursor: pointer;
  }
</style>
