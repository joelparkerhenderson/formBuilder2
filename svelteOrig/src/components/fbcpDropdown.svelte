<script lang="ts">
  export let value = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let onChange: (value: string) => void = () => {};
</script>

<select
  class="fbcp-dropdown"
  data-fbcp-dropdown="true"
  value={value}
  style="display: block; width: 100%; margin: 0; border: 0 none transparent; border-radius: 0; padding: 0; box-shadow: none; outline: none; background: transparent; font: inherit; line-height: 1.2; box-sizing: border-box;"
  onchange={(event) => onChange(event.currentTarget.value)}
>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>

<style>
  .fbcp-dropdown {
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

  .fbcp-dropdown:focus,
  .fbcp-dropdown:focus-visible {
    border: none !important;
    border-width: 0 !important;
    border-radius: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
</style>
