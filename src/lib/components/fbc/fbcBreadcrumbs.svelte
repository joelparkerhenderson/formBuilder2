<script lang="ts">
  let navElement: HTMLElement;

  const linkStyle = {
    display: 'inline',
    border: '0',
    borderRadius: '0',
    background: 'transparent',
    color: 'var(--fb-blue)',
    cursor: 'pointer',
    font: 'inherit',
    margin: '0',
    padding: '0',
    textAlign: 'left',
    textDecoration: 'underline'
  };

  const separatorStyle = {
    color: 'black',
    padding: '0 0.15rem',
    textDecoration: 'none'
  };

  function applyStyles() {
    if (!navElement) return;
    navElement.querySelectorAll<HTMLElement>('button, a').forEach((element) => {
      Object.assign(element.style, linkStyle);
      element.onmouseenter = () => {
        element.style.background = 'transparent';
        element.style.color = 'black';
        element.style.outline = 'none';
      };
      element.onmouseleave = () => {
        element.style.color = 'var(--fb-blue)';
      };
      element.onfocus = () => {
        element.style.background = 'transparent';
        element.style.color = 'black';
        element.style.outline = 'none';
      };
      element.onblur = () => {
        element.style.color = 'var(--fb-blue)';
      };
    });
    navElement.querySelectorAll<HTMLElement>('.breadcrumb-separator').forEach((element) => {
      Object.assign(element.style, separatorStyle);
    });
  }

  $effect(() => {
    applyStyles();
  });
</script>

<nav bind:this={navElement} class="fbc-breadcrumbs" aria-label="Composer breadcrumbs"><slot /></nav>

<style>
  .fbc-breadcrumbs {
    font-size: 0.9rem;
    font-weight: 300;
    line-height: 1.2rem;
  }
</style>
