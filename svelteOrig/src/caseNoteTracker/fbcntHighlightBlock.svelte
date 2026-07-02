<script lang="ts">
  export let level = 0;
  export let style = '';
</script>

<div class={`fbcnt-highlight-level fbcnt-highlight-level-${level} level-${level}`} {style}>
  <slot />
</div>

<style>
  .fbcnt-highlight-level {
    border-radius: 0.2rem;
    padding: 0.08rem 0.2rem;
    margin-top: 0.08rem;
  }

  .level-0:hover:not(:has(.fbcnt-highlight-level:hover)),
  .level-0:focus-within:not(:has(.fbcnt-highlight-level:focus-within)),
  .level-2:hover:not(:has(.fbcnt-highlight-level:hover)),
  .level-2:focus-within:not(:has(.fbcnt-highlight-level:focus-within)) {
    background-color: #ffffcc;
  }

  .level-1:hover:not(:has(.fbcnt-highlight-level:hover)),
  .level-1:focus-within:not(:has(.fbcnt-highlight-level:focus-within)),
  .level-3:hover:not(:has(.fbcnt-highlight-level:hover)),
  .level-3:focus-within:not(:has(.fbcnt-highlight-level:focus-within)) {
    background-color: #fee715;
  }
</style>
