<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { fbSubfieldContextKey } from './context';
  import FbAnimatedSubquestion from './fbAnimatedSubquestion.svelte';

  let {
    open,
    children
  }: {
    open: boolean;
    children: Snippet;
  } = $props();

  setContext(fbSubfieldContextKey, { value: true });
</script>

<FbAnimatedSubquestion {open}>
  <div class="fb-subquestion fb-inverse-subq">
    {@render children()}
  </div>
</FbAnimatedSubquestion>

<style>
  .fb-inverse-subq {
    padding-left: 0;
  }
</style>
