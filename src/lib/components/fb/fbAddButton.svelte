<script lang="ts">
  let {
    label,
    editable = false,
    class: className = '',
    onLabelChange,
    onClick,
    onclick
  }: {
    label: string;
    editable?: boolean;
    class?: string;
    onLabelChange?: (label: string) => void;
    onClick?: (event: MouseEvent) => void;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  function commitLabel(event: FocusEvent) {
    onLabelChange?.((event.currentTarget as HTMLElement).textContent?.trim() || label);
  }

  let hovered = $state(false);
  let focused = $state(false);
  const active = $derived(hovered || focused);
  const componentStyle = $derived(
    [
      `background-color: ${active ? '#fee715' : 'white'}`,
      `color: ${active ? 'black' : '#1b6ec2'}`,
      `border: 0.1rem solid ${active ? 'black' : '#1b6ec2'}`,
      'border-radius: 0.4rem',
      'height: 2rem',
      'line-height: 1.8rem',
      'padding: 0 0.8rem',
      "font-family: 'Roboto', sans-serif",
      'font-size: 1rem',
      'font-weight: 300',
      'cursor: pointer',
      'transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease'
    ].join('; ')
  );
</script>

<button
  type="button"
  class={`fb-add-button ${className}`.trim()}
  style={componentStyle}
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onfocus={() => focused = true}
  onblur={() => focused = false}
  onclick={onClick || onclick}
>
  {#if editable}
    <span
      contenteditable="true"
      role="textbox"
      tabindex="0"
      onblur={commitLabel}
      onclick={(event) => event.stopPropagation()}
      onmousedown={(event) => event.stopPropagation()}
      onkeydown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
      }}
    >{label}</span>
  {:else}
    {label}
  {/if}
</button>

<style>
  span {
    outline: none;
  }
</style>
