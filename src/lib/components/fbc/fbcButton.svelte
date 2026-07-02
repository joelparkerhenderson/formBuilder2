<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let danger = false;
  export let disabled = false;
  export let fullWidth = false;
  export let className = '';
  export let saveState: 'saved' | 'saving' | 'dirty' | '' = '';
  export let onClick: () => void = () => {};

  let hovering = false;
  let focusing = false;

  $: interactive = !disabled;
  $: stateBackground = saveState === 'saved'
    ? 'var(--fb-green)'
    : saveState === 'saving'
      ? 'var(--fb-orange)'
      : saveState === 'dirty'
        ? 'var(--fb-red)'
        : 'white';
  $: componentStyle = [
    'height: auto',
    'line-height: normal',
    'padding: 0.25rem 0.45rem',
    `border: 0.1rem solid ${danger ? 'var(--fb-red)' : 'black'}`,
    'border-radius: 0',
    `background-color: ${interactive && !saveState && (hovering || focusing) ? '#e6e6e6' : stateBackground}`,
    `color: ${saveState ? 'black' : danger ? 'var(--fb-red)' : 'black'}`,
    "font-family: 'Roboto', sans-serif",
    'font-size: 0.85rem',
    'font-weight: 300',
    `cursor: ${saveState ? saveState === 'dirty' ? 'pointer' : 'not-allowed' : disabled ? 'not-allowed' : 'pointer'}`,
    `opacity: ${saveState ? '1' : disabled ? '0.5' : '1'}`,
    fullWidth ? 'display: block' : '',
    fullWidth ? 'width: 100%' : '',
    'outline: none'
  ].filter(Boolean).join('; ');
</script>

<button
  {type}
  class={`fbc-button ${className}`}
  class:fbc-button-danger={danger}
  class:fbc-button-full-width={fullWidth}
  {disabled}
  style={componentStyle}
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  onfocus={() => (focusing = true)}
  onblur={() => (focusing = false)}
  onclick={onClick}
>
  <slot />
</button>
