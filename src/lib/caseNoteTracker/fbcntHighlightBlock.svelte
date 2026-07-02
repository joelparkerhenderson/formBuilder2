<script lang="ts">
  export let level = 0;
  export let style = '';

  let hovered = false;
  let focusWithin = false;

  $: active = hovered || focusWithin;
  $: activeBackground = level % 2 === 0 ? '#ffffcc' : '#fee715';
  $: componentStyle = [
    'display: grid',
    'align-items: start',
    'border-radius: 0.2rem',
    'padding: 0.08rem 0.2rem',
    'margin-top: 0.08rem',
    `background-color: ${active ? activeBackground : 'transparent'}`,
    style
  ].filter(Boolean).join('; ');
</script>

<div
  class={`fbcnt-highlight-level fbcnt-highlight-level-${level} level-${level}`}
  style={componentStyle}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocusin={() => (focusWithin = true)}
  onfocusout={() => (focusWithin = false)}
>
  <slot />
</div>
