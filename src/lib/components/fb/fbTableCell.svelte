<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    className: classNameAlias = '',
    width = '',
    colspan,
    style: styleProp = '',
    ...rest
  }: {
    children: Snippet;
    class?: string;
    className?: string;
    width?: string;
    colspan?: number;
    style?: string;
    [key: string]: any;
  } = $props();

  let hovered = $state(false);
  let focusWithin = $state(false);
  const combinedStyle = $derived(
    [
      'padding: 0.4rem',
      'border-bottom: 1px solid silver',
      'vertical-align: top',
      `background: ${hovered || focusWithin ? '#ffffcc' : 'white'}`,
      'transition: background-color 0.2s ease',
      width ? `width: ${width}` : '',
      styleProp
    ].filter(Boolean).join('; ')
  );
</script>

<td
  class={`bg-white hover:bg-[#ffffcc] focus-within:bg-[#ffffcc] transition-colors ${className} ${classNameAlias}`.trim()}
  style={combinedStyle || undefined}
  {colspan}
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onfocusin={() => focusWithin = true}
  onfocusout={() => focusWithin = false}
  {...rest}
>
  {@render children()}
</td>
