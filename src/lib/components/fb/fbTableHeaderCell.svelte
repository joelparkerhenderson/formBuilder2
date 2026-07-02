<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    className: classNameAlias = '',
    width = '',
    style: styleProp = '',
    ...rest
  }: {
    children?: Snippet;
    class?: string;
    className?: string;
    width?: string;
    style?: string;
    [key: string]: any;
  } = $props();

  const combinedStyle = $derived(
    [
      'padding: 0.4rem',
      "font-family: 'Roboto', sans-serif",
      'font-size: 0.8rem',
      'font-style: italic',
      'font-weight: 300',
      'color: #555',
      'text-align: left',
      'vertical-align: bottom',
      'background: white',
      width ? `width: ${width}` : '',
      styleProp
    ].filter(Boolean).join('; ')
  );
</script>

<th class={`${className} ${classNameAlias}`.trim()} style={combinedStyle || undefined} {...rest}>
  {@render children?.()}
</th>
