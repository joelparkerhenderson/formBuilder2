<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { fbSubfieldContextKey } from './context';
  import FbAnimatedSubquestion from './fbAnimatedSubquestion.svelte';

  let {
    optionValue,
    selectedValue = '',
    children
  }: {
    optionValue: string;
    selectedValue?: string;
    children: Snippet;
  } = $props();

  setContext(fbSubfieldContextKey, { value: true });
</script>

<FbAnimatedSubquestion open={selectedValue === optionValue}>
  <div class="fb-subquestion fb-subq-for-option">
    {@render children()}
  </div>
</FbAnimatedSubquestion>

<style>
  .fb-subq-for-option {
    padding-left: 1.5rem;
  }
</style>
