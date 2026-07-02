<script lang="ts">
  export let danger = false;
  export let onClick: () => void = () => {};

  let hovering = false;
  let focusing = false;

  $: active = hovering || focusing;
  $: actionStyle = [
    'display: block',
    'width: 100%',
    'border: 0.1rem solid transparent',
    `background: ${active ? '#e6e6e6' : 'transparent'}`,
    `color: ${active ? 'black' : danger ? 'var(--fb-red)' : 'var(--fb-blue)'}`,
    'cursor: pointer',
    'font-size: 0.85rem',
    'font-weight: 300',
    'padding: 0.125rem 0.35rem',
    'text-align: left',
    'text-decoration: underline',
    'outline: none'
  ].join('; ');
</script>

<li>
  <button
    type="button"
    class="fb-designer-action-item"
    class:fb-designer-action-danger={danger}
    style={actionStyle}
    onmouseenter={() => (hovering = true)}
    onmouseleave={() => (hovering = false)}
    onfocus={() => (focusing = true)}
    onblur={() => (focusing = false)}
    onclick={onClick}
  >
    <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span>
    <slot />
  </button>
</li>

<style>
  .fb-designer-action-marker {
    font-weight: 700;
  }
</style>
