<script lang="ts">
  let {
    label,
    id,
    class: className = '',
    disabled = false,
    onclick,
    element = $bindable()
  }: {
    label: string;
    id?: string;
    class?: string;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
    element?: HTMLButtonElement;
  } = $props();

  let hovered = $state(false);
  let focused = $state(false);
  const active = $derived((hovered || focused) && !disabled);
  const componentStyle = $derived(
    [
      `background-color: ${active ? '#fee715' : 'white'}`,
      `color: ${active ? 'black' : '#1b6ec2'}`,
      `border: 0.2rem solid ${active ? 'black' : '#1b6ec2'}`,
      'border-radius: 0.4rem',
      'height: 2rem',
      'line-height: 1.8rem',
      'padding: 0 0.8rem',
      "font-family: 'Roboto', sans-serif",
      'font-size: 1rem',
      'font-weight: 500',
      `cursor: ${disabled ? 'not-allowed' : 'pointer'}`,
      `opacity: ${disabled ? '0.6' : '1'}`,
      'transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease'
    ].join('; ')
  );
</script>

<button
  type="button"
  {id}
  class={`fb-add-button ${className}`.trim()}
  disabled={disabled}
  style={componentStyle}
  data-lily-reference-component="button"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onfocus={() => focused = true}
  onblur={() => focused = false}
  onclick={onclick}
  bind:this={element}
>
  {label}
</button>
