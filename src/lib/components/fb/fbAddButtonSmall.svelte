<script lang="ts">
  type Props = {
    label?: string;
    className?: string;
    onclick?: (event: MouseEvent) => void;
    onClick?: (event: MouseEvent) => void;
    action?: (event: MouseEvent) => void;
  };

  let {
    label = '',
    className = '',
    onclick,
    onClick,
    action
  }: Props = $props();

  function handleClick(event: MouseEvent) {
    action?.(event);
    onClick?.(event);
    onclick?.(event);
  }

  let hovered = $state(false);
  let focused = $state(false);
  const active = $derived(hovered || focused);
  const componentStyle = $derived(
    [
      `background-color: ${active ? '#fee715' : 'white'}`,
      `color: ${active ? 'black' : '#1b6ec2'}`,
      `border: 0.1rem solid ${active ? 'black' : '#1b6ec2'}`,
      'border-radius: 0.4rem',
      "font-family: 'Roboto', sans-serif",
      'font-weight: 300',
      'cursor: pointer',
      'transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
      'height: auto',
      'min-height: 0',
      'line-height: 1.1',
      'padding: 0.1rem',
      'font-size: 0.6rem'
    ].join('; ')
  );
</script>

<button
  type="button"
  class={`fb-add-button fb-add-button-small ${className}`.trim()}
  style={componentStyle}
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onfocus={() => focused = true}
  onblur={() => focused = false}
  onclick={handleClick}
>
  {label}
</button>
