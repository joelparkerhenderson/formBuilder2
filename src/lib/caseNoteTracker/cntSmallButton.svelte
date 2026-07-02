<script lang="ts">
  let { label, action = () => {}, fullWidth = false, margin = '0.1rem' } = $props();
  let hovered = $state(false);
  let focused = $state(false);

  const active = $derived(hovered || focused);
  const buttonStyle = $derived([
    'border: 0',
    'border-radius: 0.4rem',
    `background-color: ${active ? '#fee715' : '#1b6ec2'}`,
    `color: ${active ? 'black' : 'white'}`,
    'min-height: 1.6rem',
    'min-width: 0',
    `margin: ${margin}`,
    'padding: 0.2rem 0.44rem',
    "font-family: 'Roboto', sans-serif",
    'font-size: 0.8rem',
    'font-weight: 500',
    'line-height: 1.2',
    'cursor: pointer',
    'white-space: nowrap',
    fullWidth ? 'width: 100%' : '',
    active ? 'outline: 0.1rem solid #111' : 'outline: none',
    active ? 'outline-offset: 0.05rem' : ''
  ].filter(Boolean).join('; '));
</script>

<button
  class="small-button"
  type="button"
  style={buttonStyle}
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onfocus={() => focused = true}
  onblur={() => focused = false}
  onclick={action}
>{label}</button>
