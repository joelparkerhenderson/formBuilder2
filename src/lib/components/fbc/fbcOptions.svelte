<script lang="ts">
  let optionsElement: HTMLElement;

  function applyLabelStyles() {
    if (!optionsElement) return;
    optionsElement.querySelectorAll<HTMLElement>('label').forEach((label) => {
      Object.assign(label.style, {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.35rem',
        margin: '0.25rem 0 0 0',
        fontSize: '0.85rem',
        fontWeight: '300'
      });
    });
  }

  $effect(() => {
    applyLabelStyles();
  });
</script>

<div bind:this={optionsElement} class="fbc-options"><slot /></div>
