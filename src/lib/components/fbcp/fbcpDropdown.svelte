<script lang="ts">
  export let value = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let onChange: (value: string) => void = () => {};

  const dropdownStyle = [
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
</script>

<select
  class="fbcp-dropdown"
  data-fbcp-dropdown="true"
  value={value}
  style={dropdownStyle}
  onchange={(event) => onChange(event.currentTarget.value)}
>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
