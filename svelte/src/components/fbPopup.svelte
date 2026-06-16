<script lang="ts">
  export let title = '';
</script>

<div class="fb-popup-backdrop">
  <div class="fb-popup" role="dialog" aria-modal="true" aria-labelledby={title ? 'fb-popup-title' : undefined} aria-label={title || undefined}>
    {#if title}<h2 id="fb-popup-title">{title}</h2>{/if}
    <slot />
  </div>
</div>

<style>
  .fb-popup-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fb-popup {
    width: 90%;
    max-width: 500px;
    background: white;
    border: 0.2rem solid #1b6ec2;
    border-radius: 0.4rem;
    padding: 1.5rem;
    box-shadow: 0 0.3rem 1rem rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;
    box-sizing: border-box;
  }

  h2 {
    margin: 0 0 1rem 0;
    color: #1b6ec2;
    font-size: 1.5rem;
    font-weight: 500;
  }
</style>
