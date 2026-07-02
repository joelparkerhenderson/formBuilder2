<script lang="ts">
  import { tick } from 'svelte';

  export let value = '';
  export let placeholder = '';
  export let readonly = false;
  export let onInput: (value: string) => void = () => {};
  export let onBlur: (value: string) => void = () => {};

  let textarea: HTMLTextAreaElement;
  const textareaStyle = [
    'display: block',
    'width: 100%',
    'min-height: 1.2rem',
    'margin: 0',
    'border: 0 none transparent',
    'border-radius: 0',
    'padding: 0',
    'box-sizing: border-box',
    'overflow: hidden',
    'resize: none',
    'background: transparent',
    'box-shadow: none',
    'outline: none',
    'font: inherit',
    'line-height: 1.2'
  ].join('; ');

  async function resize() {
    await tick();
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  $: {
    value;
    resize();
  }
</script>

<textarea
  bind:this={textarea}
  class="fbcp-textarea"
  rows="1"
  {placeholder}
  {readonly}
  value={value}
  style={textareaStyle}
  oninput={(event) => {
    onInput(event.currentTarget.value);
    resize();
  }}
  onblur={(event) => onBlur(event.currentTarget.value)}
></textarea>
