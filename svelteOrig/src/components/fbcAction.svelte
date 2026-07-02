<script lang="ts">
  export let danger = false;
  export let onClick: () => void = () => {};
</script>

<li>
  <button type="button" class="fb-designer-action-item" class:fb-designer-action-danger={danger} onclick={onClick}>
    <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span>
    <slot />
  </button>
</li>

<style>
  .fb-designer-action-item {
    display: block;
    width: 100%;
    border: 0.1rem solid transparent;
    background: transparent;
    color: var(--fb-blue);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 300;
    padding: 0.125rem 0.35rem;
    text-align: left;
    text-decoration: underline;
  }

  .fb-designer-action-danger {
    color: var(--fb-red) !important;
  }

  .fb-designer-action-marker {
    font-weight: 700;
  }

  .fb-designer-action-item:hover,
  .fb-designer-action-item:focus,
  .fb-designer-action-item:focus-visible {
    background: #e6e6e6;
    color: black;
    outline: none;
  }
</style>
