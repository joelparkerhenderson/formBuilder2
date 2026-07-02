<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'warning' | 'alert' | 'info';

  let {
    text,
    variant,
    class: className = '',
    children
  }: {
    text?: string;
    variant: Variant;
    class?: string;
    children?: Snippet;
  } = $props();

  const variantColour: Record<Variant, string> = {
    warning: '#fd8a10',
    alert: '#d50000',
    info: '#1b6ec2'
  };

  const variantIcon: Record<Variant, string> = {
    warning: 'warning',
    alert: 'error',
    info: 'info'
  };

  const colour = $derived(variantColour[variant]);
  const icon = $derived(variantIcon[variant]);
</script>

<div class={`fb-boxed-message ${className}`.trim()} style={`border-color: ${colour}; color: ${colour};`} data-lily-reference-component="alert">
  <span class="material-icons" aria-hidden="true" style={`color: ${colour};`}>{icon}</span>
  <div class="fb-boxed-message-text">
    {#if children}
      {@render children()}
    {:else}
      {text}
    {/if}
  </div>
</div>

<style>
  .fb-boxed-message {
    width: 100%;
    border: 0.2rem solid;
    border-radius: 0.4rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.6rem 0.8rem;
    background-color: white;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    text-align: left;
  }

  .material-icons {
    font-size: 4rem;
    line-height: 1;
    flex: 0 0 auto;
  }

  .fb-boxed-message-text {
    flex: 1;
  }
</style>
