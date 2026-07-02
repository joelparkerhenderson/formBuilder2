<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    className: classNameAlias = '',
    style = '',
    ...rest
  }: {
    children: Snippet;
    class?: string;
    className?: string;
    style?: string;
    [key: string]: any;
  } = $props();
</script>

<table class={`min-w-full text-left font-sans font-light fb-table ${className} ${classNameAlias}`.trim()} {style} {...rest}>
  {@render children()}
</table>

<style>
  .fb-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
  }
</style>
