<nav class="fbc-breadcrumbs" aria-label="Composer breadcrumbs"><slot /></nav>

<style>
  .fbc-breadcrumbs {
    font-size: 0.9rem;
    font-weight: 300;
    line-height: 1.2rem;
  }

  .fbc-breadcrumbs :global(button),
  .fbc-breadcrumbs :global(a) {
    display: inline;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--fb-blue);
    cursor: pointer;
    font: inherit;
    margin: 0;
    padding: 0;
    text-align: left;
    text-decoration: underline;
  }

  .fbc-breadcrumbs :global(button:hover),
  .fbc-breadcrumbs :global(button:focus),
  .fbc-breadcrumbs :global(a:hover),
  .fbc-breadcrumbs :global(a:focus) {
    background: transparent;
    color: black;
    outline: none;
  }

  .fbc-breadcrumbs :global(.breadcrumb-separator) {
    color: black;
    padding: 0 0.15rem;
    text-decoration: none;
  }
</style>
