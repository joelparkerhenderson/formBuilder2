<script lang="ts">
  export let value = '';
  export let type = 'text';
  export let min: string | number | undefined = undefined;
  export let max: string | number | undefined = undefined;
  export let readonly = false;
  export let placeholder = '';
  export let onInput: (value: string) => void = () => {};

  function stripNativeInputChrome(node: HTMLInputElement) {
    const apply = () => {
      node.style.setProperty('border', '0 none transparent', 'important');
      node.style.setProperty('border-width', '0', 'important');
      node.style.setProperty('border-radius', '0', 'important');
      node.style.setProperty('box-shadow', 'none', 'important');
      node.style.setProperty('outline', 'none', 'important');
      node.style.setProperty('margin', '0', 'important');
      node.style.setProperty('padding', '0', 'important');
      node.style.setProperty('background', 'transparent', 'important');
    };
    apply();
    node.addEventListener('focus', apply);
    node.addEventListener('blur', apply);
    return {
      update: apply,
      destroy() {
        node.removeEventListener('focus', apply);
        node.removeEventListener('blur', apply);
      }
    };
  }
</script>

<input
  use:stripNativeInputChrome
  class="fbcp-text-input"
  data-fbcp-text-input="true"
  {type}
  {min}
  {max}
  {readonly}
  {placeholder}
  value={value}
  style="display: block; width: 100%; margin: 0; border: 0 none transparent; border-radius: 0; padding: 0; box-shadow: none; outline: none; background: transparent; font: inherit; line-height: 1.2; box-sizing: border-box;"
  oninput={(event) => onInput(event.currentTarget.value)}
/>

<style>
  .fbcp-text-input {
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    border: none !important;
    border-width: 0 !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    background: transparent !important;
    box-shadow: none !important;
    font: inherit !important;
    line-height: 1.2 !important;
  }

  .fbcp-text-input:focus,
  .fbcp-text-input:focus-visible {
    border: none !important;
    border-width: 0 !important;
    border-radius: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
</style>
