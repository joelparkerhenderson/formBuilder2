<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    class?: string;
    title?: string;
    ariaLabel?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  };

  let {
    type = 'button',
    disabled = false,
    class: className = '',
    title,
    ariaLabel = '',
    onclick,
    children
  }: Props = $props();

  const componentStyle = $derived(
    [
      'height: auto',
      'line-height: normal',
      'padding: 0.15rem 0.45rem',
      "font-family: 'Roboto', sans-serif",
      'font-size: 0.85rem',
      'font-weight: 500',
      'border: 0.1rem solid #1b6ec2',
      'border-radius: 0.25rem',
      'background: #1b6ec2',
      'color: white',
      `cursor: ${disabled ? 'not-allowed' : 'pointer'}`,
      `opacity: ${disabled ? '0.6' : '1'}`,
      'box-sizing: border-box'
    ].join('; ')
  );
</script>

<button
  class={`fb-button-smaller ${className}`.trim()}
  {type}
  {disabled}
  {title}
  style={componentStyle}
  aria-label={ariaLabel || undefined}
  data-lily-reference-component="button"
  onclick={onclick}
>
  {@render children?.()}
</button>
