<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    draggable = false,
    ondragstart,
    ondragover,
    ondrop,
    ondragend
  }: {
    children: Snippet;
    class?: string;
    draggable?: boolean;
    ondragstart?: (event: DragEvent) => void;
    ondragover?: (event: DragEvent) => void;
    ondrop?: (event: DragEvent) => void;
    ondragend?: (event: DragEvent) => void;
  } = $props();

  const componentStyle = 'border-bottom: 1px solid silver;';
</script>

<tr class={className} style={componentStyle} {draggable} {ondragstart} {ondragover} {ondrop} {ondragend}>
  {@render children()}
</tr>
