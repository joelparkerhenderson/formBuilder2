<script lang="ts">
  export let onClick: () => void = () => {};
  export let fullWidth = false;
  export let margin = '';

  let hovered = false;
  let focused = false;

  $: active = hovered || focused;
  $: buttonStyle = [
    'border: 0',
    'border-radius: 0.4rem',
    `background-color: ${active ? '#fee715' : '#1b6ec2'}`,
    `color: ${active ? 'black' : 'white'}`,
    'padding: 0.2rem 0.44rem',
    "font-family: 'Roboto', sans-serif",
    'font-size: 0.8rem',
    'font-weight: 500',
    'line-height: 1.2',
    'cursor: pointer',
    'white-space: nowrap',
    fullWidth ? 'width: 100%' : '',
    margin ? `margin: ${margin}` : '',
    active ? 'outline: 0.1rem solid #111' : 'outline: none',
    active ? 'outline-offset: 0.05rem' : ''
  ].filter(Boolean).join('; ');
</script>

<button
  type="button"
  class="fbcnt-small-button"
  style={buttonStyle}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocus={() => (focused = true)}
  onblur={() => (focused = false)}
  onclick={onClick}
>
  <slot />
</button>
