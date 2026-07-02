<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'yellow' | 'blue' | 'green' | 'silver';

  type Props = {
    variant?: Variant;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    ariaLabel?: string;
    class?: string;
    style?: string;
    title?: string;
    onclick?: (event: MouseEvent) => void;
    onClick?: (event: MouseEvent) => void;
    children?: Snippet;
  };

  let {
    variant = 'primary',
    type = 'button',
    disabled = false,
    ariaLabel = '',
    class: className = '',
    style = '',
    title,
    onclick,
    onClick,
    children
  }: Props = $props();

  const normalisedVariant = $derived(
    variant === 'blue' ? 'primary' : variant === 'green' ? 'success' : variant === 'silver' ? 'secondary' : variant
  );

  let hovered = $state(false);
  let focused = $state(false);

  function variantColours() {
    if ((hovered || focused) && !disabled) {
      return { background: '#fee715', color: 'black', border: '0.1rem solid #fee715' };
    }
    if (disabled) {
      return { background: '#c0c0c0', color: 'white', border: '0.1rem solid #c0c0c0' };
    }
    switch (normalisedVariant) {
      case 'primary':
        return { background: '#1b6ec2', color: 'white', border: '0.1rem solid #1b6ec2' };
      case 'success':
        return { background: '#008000', color: 'white', border: '0.1rem solid #008000' };
      case 'danger':
        return { background: '#d50000', color: 'white', border: '0.1rem solid #d50000' };
      case 'yellow':
        return { background: '#fee715', color: 'black', border: '0.1rem solid #fee715' };
      case 'secondary':
      default:
        return { background: 'white', color: '#1b6ec2', border: '0.1rem solid #1b6ec2' };
    }
  }

  const colours = $derived(variantColours());
  const componentStyle = $derived(
    [
      'display: inline-block',
      'height: 2rem',
      'line-height: 1.8rem',
      'min-width: 8rem',
      'padding: 0 0.8rem',
      "font-family: 'Roboto', sans-serif",
      'font-size: 1rem',
      'font-weight: 500',
      'border-radius: 0.4rem',
      `cursor: ${disabled ? 'not-allowed' : 'pointer'}`,
      'transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
      `opacity: ${disabled ? '0.6' : '1'}`,
      'box-sizing: border-box',
      `background: ${colours.background}`,
      `color: ${colours.color}`,
      `border: ${colours.border}`,
      style
    ].join('; ')
  );
</script>

<button
  class={`fb-button ${className}`.trim()}
  data-fb-button-variant={normalisedVariant}
  {type}
  {disabled}
  {title}
  style={componentStyle}
  aria-label={ariaLabel || undefined}
  data-lily-reference-component="button"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onfocus={() => focused = true}
  onblur={() => focused = false}
  onclick={onclick || onClick}
>
  {@render children?.()}
</button>
