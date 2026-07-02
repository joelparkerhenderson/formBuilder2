<script lang="ts">
  export let value = '';
  export let type = 'text';
  export let min: string | number | undefined = undefined;
  export let max: string | number | undefined = undefined;
  export let readonly = false;
  export let placeholder = '';
  export let onInput: (value: string) => void = () => {};

  const inputStyle = [
    'display: block',
    'width: 100%',
    'margin: 0',
    'border: 0 none transparent',
    'border-width: 0',
    'border-radius: 0',
    'padding: 0',
    'box-sizing: border-box',
    'background: transparent',
    'box-shadow: none',
    'outline: none',
    'font: inherit',
    'line-height: 1.2'
  ].join('; ');

  function stripNativeInputChrome(node: HTMLInputElement) {
    const apply = () => {
      node.style.border = '0 none transparent';
      node.style.borderWidth = '0';
      node.style.borderRadius = '0';
      node.style.boxShadow = 'none';
      node.style.outline = 'none';
      node.style.margin = '0';
      node.style.padding = '0';
      node.style.background = 'transparent';
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
  style={inputStyle}
  oninput={(event) => onInput(event.currentTarget.value)}
/>
