<script lang="ts">
  export let open = false;
  export let isOpen = false;
  $: visible = open || isOpen;
</script>

{#if visible}
  <div class="fb-subquestion fb-inverse-subq">
    <slot />
  </div>
{/if}

<style>
  .fb-inverse-subq {
    padding-left: 0;
  }
</style>
