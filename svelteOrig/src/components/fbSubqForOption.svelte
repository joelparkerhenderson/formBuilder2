<script lang="ts">
  export let optionValue = '';
  export let selectedValue = '';
</script>

{#if selectedValue === optionValue}
  <div class="fb-subquestion fb-subq-for-option">
    <slot />
  </div>
{/if}

<style>
  .fb-subq-for-option {
    padding-left: 1.5rem;
  }
</style>
