<script lang="ts">
  import { tick } from 'svelte';

  export let value = '';
  export let placeholder = '';
  export let readonly = false;
  export let onInput: (value: string) => void = () => {};

  let textarea: HTMLTextAreaElement;

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
  oninput={(event) => {
    onInput(event.currentTarget.value);
    resize();
  }}
></textarea>

<style>
  .fbcp-textarea {
    display: block !important;
    width: 100% !important;
    min-height: 1.2rem !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    resize: none !important;
    background: transparent !important;
    box-shadow: none !important;
    font: inherit !important;
    line-height: 1.2 !important;
  }

  .fbcp-textarea:focus {
    outline: none !important;
  }
</style>
